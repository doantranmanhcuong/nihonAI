import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const STORAGE_PREFIX = 'nihonai_gw_v3:';

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  meta?: {
    service: string;
    cached?: boolean;
    latencyMs?: number;
    timestamp?: string;
  };
}

class ApiGatewayClient {
  private http: AxiosInstance;
  private inFlightRequests = new Map<string, Promise<any>>();
  private responseCache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 phút Fresh
  private readonly STALE_TTL_MS = 24 * 60 * 60 * 1000; // 24 giờ Stale-While-Revalidate
  private readonly MAX_CACHE_ENTRIES = 250;

  constructor() {
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: 25000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request Interceptor: Tự động gán Auth Token nếu có
    this.http.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('nihonai_token') ||
          localStorage.getItem('auth_token') ||
          localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response Interceptor: Chuẩn hóa phản hồi
    this.http.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Tự động thử lại 1 lần nếu gặp lỗi kết nối mạng
        if (originalRequest && !originalRequest._retry && (error.code === 'ECONNABORTED' || !error.response)) {
          originalRequest._retry = true;
          await new Promise((resolve) => setTimeout(resolve, 800));
          return this.http(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  private readStorageCache(cacheKey: string): { data: any; fresh: boolean } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.ts !== 'number' || !parsed.data) return null;
      const age = Date.now() - parsed.ts;
      if (age > this.STALE_TTL_MS) {
        localStorage.removeItem(STORAGE_PREFIX + cacheKey);
        return null;
      }
      return {
        data: parsed.data,
        fresh: age < this.CACHE_TTL_MS
      };
    } catch {
      return null;
    }
  }

  private writeStorageCache(cacheKey: string, data: any): void {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify({ ts: Date.now(), data });
      // Chỉ lưu vào localStorage các response vừa phải (< 220KB) để không vượt quota trình duyệt
      if (serialized.length < 220_000) {
        localStorage.setItem(STORAGE_PREFIX + cacheKey, serialized);
      }
    } catch {
      // Nếu đầy bộ nhớ localStorage, dọn bớt các key cache cũ của gateway
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) keysToRemove.push(k);
        }
        keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach((k) => localStorage.removeItem(k));
      } catch {}
    }
  }

  /**
   * Xóa bộ đệm L1 Browser Memory Cache & L2 LocalStorage Cache khi Admin thêm/sửa/xóa dữ liệu
   */
  clearCache(prefix?: string) {
    if (!prefix) {
      this.responseCache.clear();
      if (typeof window !== 'undefined') {
        try {
          const keys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k);
          }
          keys.forEach((k) => localStorage.removeItem(k));
        } catch {}
      }
      return;
    }
    for (const key of Array.from(this.responseCache.keys())) {
      if (key.includes(prefix)) {
        this.responseCache.delete(key);
      }
    }
    if (typeof window !== 'undefined') {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX) && k.includes(prefix)) keys.push(k);
        }
        keys.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }
  }

  private saveToMemoryAndStorage(cacheKey: string, result: any) {
    if (this.responseCache.size >= this.MAX_CACHE_ENTRIES) {
      const oldestKey = this.responseCache.keys().next().value;
      if (oldestKey) this.responseCache.delete(oldestKey);
    }
    this.responseCache.set(cacheKey, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL_MS
    });
    this.writeStorageCache(cacheKey, result);
  }

  /**
   * Phương thức GET có bộ đệm L1 RAM (< 0.1ms) + L2 Persistent LocalStorage (Stale-While-Revalidate 0ms) + In-flight Deduplication
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const cacheKey = `GET:${url}:${JSON.stringify(config?.params || {})}`;
    const isCacheable = !url.startsWith('/gateway') && !url.includes('/quiz/');

    if (isCacheable) {
      // 1. L1 RAM Cache (< 0.05ms)
      const cached = this.responseCache.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        return cached.data as T;
      }

      // 2. L2 Persistent LocalStorage Cache (0ms ngay cả khi vừa F5 tải lại trang)
      const persisted = this.readStorageCache(cacheKey);
      if (persisted) {
        this.responseCache.set(cacheKey, {
          data: persisted.data,
          expiry: Date.now() + (persisted.fresh ? this.CACHE_TTL_MS : 60_000)
        });

        // Nếu dữ liệu đã quá 10 phút (stale), trả về ngay trong 0ms và âm thầm làm mới dưới nền
        if (!persisted.fresh && !this.inFlightRequests.has(cacheKey)) {
          const bgPromise = this.http
            .get<T>(url, config)
            .then((response) => {
              const resData = response.data as any;
              if (resData && resData.success !== false) {
                this.saveToMemoryAndStorage(cacheKey, resData);
              }
              return response.data;
            })
            .catch(() => persisted.data)
            .finally(() => {
              this.inFlightRequests.delete(cacheKey);
            });
          this.inFlightRequests.set(cacheKey, bgPromise);
        }

        return persisted.data as T;
      }
    }

    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        const response = await this.http.get<T>(url, config);
        const result = response.data as any;
        if (isCacheable && result && result.success !== false) {
          this.saveToMemoryAndStorage(cacheKey, result);
        }
        return response.data;
      } catch (err: any) {
        console.warn(`[apiGateway] GET ${url} fallback:`, err?.message || err);
        return {
          success: false,
          data: null,
          results: [],
          kanjis: [],
          count: 0,
          message: err?.response?.data?.message || err?.message || 'Không thể kết nối máy chủ'
        } as unknown as T;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.http.post<T>(url, data, config);
      return response.data;
    } catch (err: any) {
      console.warn(`[apiGateway] POST ${url} fallback:`, err?.message || err);
      return {
        success: false,
        data: null,
        candidates: [],
        message: err?.response?.data?.message || err?.message || 'Không thể gửi dữ liệu'
      } as unknown as T;
    }
  }

  // ================= 1. BOUNDED CONTEXT: KANJI SERVICE =================
  readonly kanji = {
    getDetails: (character: string) =>
      this.get<any>(`/kanji/${encodeURIComponent(character)}`),

    getByLevel: (level: string) =>
      this.get<{ success: boolean; kanjis: any[]; total: number }>(`/kanji/level/${encodeURIComponent(level)}`),

    search: (query: string) =>
      this.get<{ success: boolean; count: number; results: any[] }>(`/kanji/search?q=${encodeURIComponent(query)}`),

    recognizeHandwriting: (strokes: number[][][]) =>
      this.post<{ candidates: string[] }>('/kanji/recognize', { strokes }),

    getCurriculums: () =>
      this.get<{ success: boolean; data: any[] }>('/kanji/curriculums'),

    getCurriculumSummary: (curriculum = 'LOOK_AND_LEARN', level = 'N5') =>
      this.get<{ success: boolean; data: any }>(`/kanji/curriculum/summary?curriculum=${encodeURIComponent(curriculum)}&level=${encodeURIComponent(level)}`),

    getCurriculumKanjis: (curriculum: string, level: string, lesson?: number) =>
      this.get<{ success: boolean; data: any[] }>(
        `/kanji/curriculum/${encodeURIComponent(curriculum)}/${encodeURIComponent(level)}${lesson !== undefined ? `?lesson=${lesson}` : ''}`
      ),

    getQuiz: (level = 'N5', count = 10, curriculum?: string, type?: string) => {
      let url = `/kanji/quiz/${encodeURIComponent(level)}?count=${count}`;
      if (curriculum && curriculum !== 'ALL') url += `&curriculum=${encodeURIComponent(curriculum)}`;
      if (type && type !== 'ALL') url += `&type=${encodeURIComponent(type)}`;
      return this.get<{ success: boolean; data: any[] }>(url);
    },

    getAiInsight: (character: string) =>
      this.get<{ success: boolean; data: any }>(`/kanji/${encodeURIComponent(character)}/ai-insight`),

    generateAiMnemonic: (character: string) =>
      this.post<{ success: boolean; data: any }>(`/kanji/${encodeURIComponent(character)}/ai-mnemonic`)
  };

  // ================= 2. BOUNDED CONTEXT: VOCABULARY SERVICE =================
  readonly vocab = {
    getStats: () =>
      this.get<{ success: boolean; data: Record<string, number> }>('/vocabulary/courses/stats'),

    getCurriculums: (curriculum = 'MINNA', level = 'N5') =>
      this.get<{ success: boolean; data: any }>(`/vocabulary/curriculums?curriculum=${curriculum}&level=${level}`),

    getLessonWords: (curriculum: string, level: string, lesson: number) =>
      this.get<{ success: boolean; data: { words: any[]; lessonTitle: string; themeTopic: string; totalWords: number } }>(
        `/vocabulary/curriculum/${curriculum}/${level}/${lesson}`
      ),

    autocomplete: (query: string, limit = 8) =>
      this.get<{ success: boolean; data: any[] }>(`/vocabulary/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`),

    search: (params: any) =>
      this.get<{ success: boolean; data: any }>('/vocabulary/search', { params }),

    getDetail: (id: string) =>
      this.get<{ success: boolean; data: any }>(`/vocabulary/detail/${id}`),

    getAiInsight: (id: string) =>
      this.get<{ success: boolean; data: any }>(`/vocabulary/${id}/ai-insight`),

    regenerateAiInsight: (id: string) =>
      this.post<{ success: boolean; data: any }>(`/vocabulary/${id}/ai-regenerate`),

    diagnoseSentence: (id: string, sentence: string) =>
      this.post<{ success: boolean; data: any }>(`/vocabulary/${id}/ai-diagnose`, { sentence })
  };

  // ================= 3. BOUNDED CONTEXT: API GATEWAY & CONSUL =================
  readonly gateway = {
    getHealth: () =>
      this.get<any>('/gateway/health'),

    getServices: () =>
      this.get<any>('/gateway/services'),

    getCircuits: () =>
      this.get<any>('/gateway/circuits')
  };

  /**
   * Làm nóng bộ đệm trình duyệt (Prefetch Core Data) dưới nền theo từng đợt nhẹ
   * Giúp đánh thức Server Render sớm và nạp sẵn dữ liệu vào L1 + L2 LocalStorage Cache (< 0.1ms khi chuyển tab)
   */
  private hasPrefetched = false;
  prefetchCoreData() {
    if (this.hasPrefetched || typeof window === 'undefined') return;
    this.hasPrefetched = true;
    setTimeout(() => {
      Promise.allSettled([
        this.kanji.getCurriculumSummary('LOOK_AND_LEARN', 'N5'),
        this.vocab.getCurriculums('MINNA', 'N5')
      ]).then(() => {
        setTimeout(() => {
          Promise.allSettled([
            this.kanji.getCurriculumKanjis('LOOK_AND_LEARN', 'N5', 1),
            this.vocab.getLessonWords('MINNA', 'N5', 1),
            this.kanji.getCurriculumSummary('BASIC_KANJI', 'N5')
          ]).catch(() => {});
        }, 1200);
      });
    }, 300);
  }
}

export const apiGateway = new ApiGatewayClient();
