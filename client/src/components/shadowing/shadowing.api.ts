import fallbackVideoLessons from './shadowing.fallback.json';
import { VideoShadowingLesson } from '../reading/reading.types';

export const INITIAL_FALLBACK_VIDEO_LESSONS: VideoShadowingLesson[] = fallbackVideoLessons as any[];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SHADOWING_API_BASE = `${API_BASE}/shadowing`;
const SHADOWING_STORAGE_PREFIX = 'nihonai_shadowing_v2:';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 phút

const memoryCache = new Map<string, { data: any; timestamp: number }>();

function readCache<T>(key: string): { data: T; isFresh: boolean } | null {
  const mem = memoryCache.get(key);
  const now = Date.now();
  if (mem) {
    return { data: mem.data, isFresh: now - mem.timestamp < CACHE_TTL_MS };
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(SHADOWING_STORAGE_PREFIX + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data && typeof parsed.timestamp === 'number') {
          memoryCache.set(key, parsed);
          return { data: parsed.data, isFresh: now - parsed.timestamp < CACHE_TTL_MS };
        }
      }
    } catch {}
  }
  return null;
}

function writeCache<T>(key: string, data: T) {
  const record = { data, timestamp: Date.now() };
  memoryCache.set(key, record);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SHADOWING_STORAGE_PREFIX + key, JSON.stringify(record));
    } catch {}
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

export class ShadowingApi {
  static clearLessonsCache() {
    for (const key of Array.from(memoryCache.keys())) {
      if (key.startsWith('video_lessons:')) memoryCache.delete(key);
    }
    if (typeof window !== 'undefined') {
      try {
        for (let i = window.localStorage.length - 1; i >= 0; i--) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(SHADOWING_STORAGE_PREFIX + 'video_lessons:')) {
            window.localStorage.removeItem(k);
          }
        }
      } catch {}
    }
  }

  /**
   * Lấy danh sách video bài học Shadowing (0ms Cache + Fallback tức thì)
   */
  static async getVideoLessons(filters: {
    level?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: any[]; pagination: { total: number; page: number; totalPages: number } }> {
    const params = new URLSearchParams();
    if (filters.level && filters.level !== 'ALL') params.append('level', filters.level);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const cacheKey = `video_lessons:${params.toString()}`;
    const cached = readCache<{ items: any[]; pagination: { total: number; page: number; totalPages: number } }>(cacheKey);
    if (cached && cached.data?.items?.length > 0) {
      if (!cached.isFresh) {
        fetch(`${SHADOWING_API_BASE}/lessons?${params.toString()}`, { headers: getAuthHeaders() })
          .then((r) => (r.ok ? r.json() : null))
          .then((json) => {
            if (json?.data?.items?.length > 0) writeCache(cacheKey, json.data);
          })
          .catch(() => {});
      }
      return cached.data;
    }

    try {
      const res = await fetch(`${SHADOWING_API_BASE}/lessons?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        return {
          items: INITIAL_FALLBACK_VIDEO_LESSONS,
          pagination: { total: INITIAL_FALLBACK_VIDEO_LESSONS.length, page: 1, totalPages: 1 }
        };
      }
      const json = await res.json();
      if (json?.data?.items?.length > 0) {
        writeCache(cacheKey, json.data);
        return json.data;
      }
      return {
        items: INITIAL_FALLBACK_VIDEO_LESSONS,
        pagination: { total: INITIAL_FALLBACK_VIDEO_LESSONS.length, page: 1, totalPages: 1 }
      };
    } catch {
      return {
        items: INITIAL_FALLBACK_VIDEO_LESSONS,
        pagination: { total: INITIAL_FALLBACK_VIDEO_LESSONS.length, page: 1, totalPages: 1 }
      };
    }
  }

  /**
   * Lấy chi tiết bài học video kèm phụ đề mili-giây
   */
  static async getVideoLessonDetail(id: string): Promise<any> {
    const fallbackVideo = INITIAL_FALLBACK_VIDEO_LESSONS.find((v) => v.id === id);
    if (fallbackVideo && id.startsWith('fallback-')) {
      return fallbackVideo;
    }

    const cacheKey = `video_detail:${id}`;
    const cached = readCache<any>(cacheKey);
    if (cached && cached.data) {
      return cached.data;
    }

    const res = await fetch(`${SHADOWING_API_BASE}/lessons/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (fallbackVideo) return fallbackVideo;
      throw new Error('Không tìm thấy bài học video');
    }
    const json = await res.json();
    if (json?.data) {
      writeCache(cacheKey, json.data);
    }
    return json.data;
  }

  /**
   * Tạo bài học video mới
   */
  static async createVideoLesson(payload: any): Promise<any> {
    const res = await fetch(`${SHADOWING_API_BASE}/lessons`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi khi tạo bài học video');
    this.clearLessonsCache();
    return json.data;
  }

  /**
   * Bóc tách phụ đề YouTube qua tầng Vercel Edge (/api/yt-captions)
   */
  static async fetchEdgeYouTubeCaptions(url: string): Promise<any[]> {
    try {
      const edgeRes = await fetch(`/api/yt-captions?v=${encodeURIComponent(url)}`);
      if (!edgeRes.ok) return [];
      const data = await edgeRes.json();
      if (data?.success && Array.isArray(data.snippets) && data.snippets.length > 0) {
        return data.snippets;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Xử lý link YouTube tiếng Nhật
   */
  static async processYouTubeVideo(payload: {
    url: string;
    level?: string;
    category?: string;
    srtContent?: string;
    autoSync?: boolean;
    forceRefresh?: boolean;
    rawTranscript?: any[];
  }): Promise<any> {
    let rawTranscript = payload.rawTranscript;
    if ((!rawTranscript || rawTranscript.length === 0) && !payload.srtContent) {
      const edgeSnippets = await this.fetchEdgeYouTubeCaptions(payload.url);
      if (edgeSnippets.length > 0) {
        rawTranscript = edgeSnippets;
      }
    }

    const res = await fetch(`${SHADOWING_API_BASE}/process-youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        ...(rawTranscript && rawTranscript.length > 0 ? { rawTranscript } : {})
      })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi khi xử lý link YouTube');
    this.clearLessonsCache();
    return json.data;
  }

  static async explainWord(word: string, context?: string): Promise<any> {
    const res = await fetch(`${SHADOWING_API_BASE}/explain-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, context })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi khi tra cứu từ vựng');
    return json.data;
  }
}
