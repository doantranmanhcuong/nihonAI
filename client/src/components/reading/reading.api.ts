import { ReadingArticle, QuotaStatus, ReadingQuiz, NewsFeedItem } from './reading.types';
import fallbackArticlesJson from './reading.fallback.json';
import { ShadowingApi, INITIAL_FALLBACK_VIDEO_LESSONS } from '../shadowing/shadowing.api';

export const INITIAL_FALLBACK_READING_ARTICLES: ReadingArticle[] = fallbackArticlesJson as any[];
export { ShadowingApi, INITIAL_FALLBACK_VIDEO_LESSONS };

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/reading';

const READING_STORAGE_PREFIX = 'nihonai_reading_v4:';
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const detailInFlight = new Map<string, Promise<ReadingArticle>>();

function readCache<T>(key: string): { data: T; isFresh: boolean } | null {
  const now = Date.now();
  const mem = memoryCache.get(key);
  if (mem) {
    return { data: mem.data as T, isFresh: now - mem.timestamp < 5 * 60 * 1000 };
  }
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(READING_STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== 'number') return null;
    if (now - parsed.timestamp > 24 * 60 * 60 * 1000) return null;
    memoryCache.set(key, { data: parsed.data, timestamp: parsed.timestamp });
    return { data: parsed.data as T, isFresh: now - parsed.timestamp < 5 * 60 * 1000 };
  } catch {
    return null;
  }
}

function writeCache(key: string, data: any) {
  const now = Date.now();
  memoryCache.set(key, { data, timestamp: now });
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(READING_STORAGE_PREFIX + key, JSON.stringify({ data, timestamp: now }));
  } catch {
    // Ignore storage quota errors
  }
}

function getAuthHeaders(extra?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = { ...(extra || {}) };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('nihonai_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export class ReadingApi {
  static clearArticlesCache() {
    for (const key of Array.from(memoryCache.keys())) {
      if (key.startsWith('articles:')) memoryCache.delete(key);
    }
    if (typeof window !== 'undefined') {
      try {
        for (let i = window.localStorage.length - 1; i >= 0; i--) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(READING_STORAGE_PREFIX + 'articles:')) {
            window.localStorage.removeItem(k);
          }
        }
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Lấy danh sách bài đọc từ Thư viện cộng đồng (0ms Stale-While-Revalidate + Fallback tức thì)
   */
  static async getArticles(
    filters: {
      level?: string;
      topic?: string;
      sourceType?: string;
      search?: string;
      page?: number;
      limit?: number;
      forceRefresh?: boolean;
    } = {}
  ): Promise<{ items: ReadingArticle[]; pagination: { total: number; page: number; totalPages: number } }> {
    const params = new URLSearchParams();
    if (filters.level && filters.level !== 'ALL') params.append('level', filters.level);
    if (filters.topic && filters.topic !== 'ALL') params.append('topic', filters.topic);
    if (filters.sourceType && filters.sourceType !== 'ALL') params.append('sourceType', filters.sourceType);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const cacheKey = `articles:${params.toString()}`;
    if (!filters.forceRefresh) {
      const cached = readCache<{ items: ReadingArticle[]; pagination: { total: number; page: number; totalPages: number } }>(cacheKey);
      if (cached && cached.data?.items?.length > 0) {
        if (!cached.isFresh) {
          fetch(`${API_BASE}/articles?${params.toString()}`, { headers: getAuthHeaders() })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
              if (json?.data?.items?.length > 0) writeCache(cacheKey, json.data);
            })
            .catch(() => {});
        }
        return cached.data;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/articles?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        return {
          items: INITIAL_FALLBACK_READING_ARTICLES,
          pagination: { total: INITIAL_FALLBACK_READING_ARTICLES.length, page: 1, totalPages: 1 }
        };
      }
      const json = await res.json();
      const result = json.data || { items: [], pagination: { total: 0, page: 1, totalPages: 1 } };
      if (Array.isArray(result.items) && result.items.length > 0) {
        writeCache(cacheKey, result);
        return result;
      }
      return {
        items: INITIAL_FALLBACK_READING_ARTICLES,
        pagination: { total: INITIAL_FALLBACK_READING_ARTICLES.length, page: 1, totalPages: 1 }
      };
    } catch (err) {
      console.warn('[ReadingApi] getArticles network error, using fallback:', err);
      return {
        items: INITIAL_FALLBACK_READING_ARTICLES,
        pagination: { total: INITIAL_FALLBACK_READING_ARTICLES.length, page: 1, totalPages: 1 }
      };
    }
  }

  /**
   * Lấy chi tiết bài đọc (0ms Cache + Fallback an toàn)
   */
  static async getArticleDetail(id: string): Promise<ReadingArticle> {
    const fallbackFound = INITIAL_FALLBACK_READING_ARTICLES.find((a) => a.id === id);
    if (fallbackFound && id.startsWith('fallback-')) {
      return fallbackFound;
    }

    const cacheKey = `article_detail:${id}`;
    const cached = readCache<ReadingArticle>(cacheKey);
    if (cached && cached.data) {
      if (!cached.isFresh) {
        fetch(`${API_BASE}/articles/${id}`, { headers: getAuthHeaders() })
          .then((r) => (r.ok ? r.json() : null))
          .then((json) => {
            if (json?.data) writeCache(cacheKey, json.data);
          })
          .catch(() => {});
      }
      return cached.data;
    }

    const existingFlight = detailInFlight.get(id);
    if (existingFlight) {
      return await existingFlight;
    }

    const reqPromise = (async () => {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 15000) : null;
      try {
        const res = await fetch(`${API_BASE}/articles/${id}`, {
          headers: getAuthHeaders(),
          ...(controller ? { signal: controller.signal } : {})
        });
        if (!res.ok) {
          if (fallbackFound) return fallbackFound;
          throw new Error(`Không tìm thấy bài đọc (${res.status})`);
        }
        const json = await res.json();
        if (json?.data) {
          writeCache(cacheKey, json.data);
          return json.data;
        }
        if (fallbackFound) return fallbackFound;
        throw new Error('Dữ liệu bài đọc trống');
      } catch (err: any) {
        if (fallbackFound) return fallbackFound;
        throw err;
      } finally {
        if (timer) clearTimeout(timer);
        detailInFlight.delete(id);
      }
    })();

    detailInFlight.set(id, reqPromise);
    return await reqPromise;
  }

  /**
   * Kiểm tra hạn ngạch tạo bài đọc AI của người dùng
   */
  static async getQuota(userId?: string): Promise<QuotaStatus> {
    try {
      const res = await fetch(`${API_BASE}/quota${userId ? `?userId=${userId}` : ''}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        return { dailyLimit: 5, usedToday: 0, remaining: 5, canGenerate: true, resetAt: '' };
      }
      const json = await res.json();
      return json.data;
    } catch {
      return { dailyLimit: 5, usedToday: 0, remaining: 5, canGenerate: true, resetAt: '' };
    }
  }

  /**
   * Tạo bài đọc mới bằng AI (tính vào quota 5 bài/ngày)
   */
  static async generateArticle(payload: {
    level: string;
    topic: string;
    customRequirement?: string;
    providedText?: string;
    userId?: string;
  }): Promise<{ article: ReadingArticle; quota: QuotaStatus }> {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || json.error || 'Lỗi khi tạo bài đọc');
    }
    this.clearArticlesCache();
    return json.data;
  }

  /**
   * Sinh thêm câu hỏi Dokkai cho bài đọc đã có (ưu tiên lấy từ CSDL trước)
   */
  static async addMoreQuizzes(
    articleId: string,
    count: number = 3,
    currentQuizIds: string[] = []
  ): Promise<ReadingQuiz[]> {
    const res = await fetch(`${API_BASE}/articles/${articleId}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, currentQuizIds })
    });

    if (!res.ok) throw new Error('Không thể sinh thêm câu hỏi Dokkai');
    const json = await res.json();
    return json.data;
  }

  /**
   * Dịch chính xác cụm từ được bôi đen và phân tích ngữ pháp
   */
  static async translateSelection(
    text: string,
    contextSentence?: string
  ): Promise<{
    translation: string;
    explanation?: string;
    grammarNotes?: string;
  }> {
    const res = await fetch(`${API_BASE}/translate-selection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, contextSentence })
    });

    if (!res.ok) throw new Error('Không thể dịch cụm từ bôi đen');
    const json = await res.json();
    return json.data;
  }

  /**
   * Giải thích chuyên sâu cấu trúc ngữ pháp và phân tích câu trích dẫn
   */
  static async explainGrammar(
    grammarPoint: string,
    sentence?: string,
    level?: string
  ): Promise<{
    grammarPoint: string;
    level: string;
    meaningVi: string;
    structure: string;
    explanation: string;
    excerptAnalysis?: string;
    examples?: Array<{
      japanese: string;
      reading?: string;
      vietnamese: string;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/grammar-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grammarPoint, sentence, level })
    });

    if (!res.ok) throw new Error('Không thể giải thích cấu trúc ngữ pháp');
    const json = await res.json();
    return json.data;
  }

  /**
   * Lấy danh sách tin tức báo chí tiếng Nhật mới nhất
   */
  static async getLatestNews(): Promise<NewsFeedItem[]> {
    try {
      const res = await this.getArticles({ limit: 20 });
      const articles: ReadingArticle[] = res.items || [];

      const newsArticles = articles.filter(
        (a) => a.sourceType === 'EXTERNAL_NEWS' || a.sourceType === 'NHK_NEWS'
      );

      return newsArticles.map((a) => ({
        id: a.id,
        title: a.title,
        link: a.sourceUrl || '',
        source: a.sourceType === 'NHK_NEWS' ? 'NHK' : 'LIVEDOOR',
        pubDate: a.createdAt,
        description: a.topic || 'Tin tức báo chí',
        imageUrl: a.imageUrl,
        levelEstimate: a.level,
        isProcessed: true,
        articleId: a.id
      }));
    } catch (err) {
      console.warn('[ReadingApi] getLatestNews network error:', err);
      return [];
    }
  }

  /**
   * Nhập bài báo từ đường dẫn URL (cào tự động & chuyển hóa Dokkai)
   */
  static async importArticleFromUrl(url: string, level: string = 'N3'): Promise<ReadingArticle> {
    const res = await fetch(`${API_BASE}/news/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, level })
    });

    if (!res.ok) {
      let errText = 'Lỗi kết nối hoặc bài báo từ chối truy cập (403). Hãy thử nguồn khác.';
      try {
        const json = await res.json();
        errText = json.message || json.error || errText;
      } catch {
        // Not JSON
      }
      throw new Error(errText);
    }
    const json = await res.json();
    this.clearArticlesCache();
    return json.data;
  }

  static async saveToNotebook(data: {
    itemType: 'VOCAB' | 'KANJI' | 'GRAMMAR' | 'NOTE';
    title: string;
    reading?: string;
    meaningVi: string;
    level?: string;
    structure?: string;
    articleId?: string;
  }) {
    const res = await fetch(`${API_BASE}/notebook/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('nihonai_token') || localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save to notebook');
    const json = await res.json();
    return json.data;
  }

  /**
   * Kích hoạt cào báo và chuyển hóa tự động các bài báo mới
   */
  static async triggerNewsCrawl(): Promise<{
    success: boolean;
    message?: string;
    crawledCount?: number;
    articles?: ReadingArticle[];
    data?: { crawledCount?: number; articles?: ReadingArticle[] };
  }> {
    try {
      const res = await fetch(`${API_BASE}/news/trigger-crawl`, {
        method: 'POST'
      });
      const json = await res.json();
      this.clearArticlesCache();
      return json;
    } catch (err: any) {
      console.warn('[ReadingApi] triggerNewsCrawl error:', err);
      return { success: false, message: err?.message };
    }
  }

  // ─── UỶ QUYỀN SANG SHADOWING API (GIỮ TƯƠNG THÍCH NGƯỢC) ───────────
  static getVideoLessons = ShadowingApi.getVideoLessons.bind(ShadowingApi);
  static getVideoLessonDetail = ShadowingApi.getVideoLessonDetail.bind(ShadowingApi);
  static createVideoLesson = ShadowingApi.createVideoLesson.bind(ShadowingApi);
  static fetchEdgeYouTubeCaptions = ShadowingApi.fetchEdgeYouTubeCaptions.bind(ShadowingApi);
  static processYouTubeVideo = ShadowingApi.processYouTubeVideo.bind(ShadowingApi);
  static explainWord = ShadowingApi.explainWord.bind(ShadowingApi);
}
