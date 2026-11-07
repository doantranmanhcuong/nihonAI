import { ReadingArticle, QuotaStatus, ReadingQuiz, NewsFeedItem } from './reading.types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/reading';
const SHADOWING_API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/shadowing';

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
  /**
   * Lấy danh sách bài đọc từ Thư viện cộng đồng (0 Token)
   */
  static async getArticles(filters: {
    level?: string;
    topic?: string;
    sourceType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ReadingArticle[]; pagination: { total: number; page: number; totalPages: number } }> {
    try {
      const params = new URLSearchParams();
      if (filters.level && filters.level !== 'ALL') params.append('level', filters.level);
      if (filters.topic && filters.topic !== 'ALL') params.append('topic', filters.topic);
      if (filters.sourceType && filters.sourceType !== 'ALL') params.append('sourceType', filters.sourceType);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const res = await fetch(`${API_BASE}/articles?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        console.warn(`[ReadingApi] getArticles returned status ${res.status}`);
        return { items: [], pagination: { total: 0, page: 1, totalPages: 1 } };
      }
      const json = await res.json();
      return json.data || { items: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    } catch (err) {
      console.warn('[ReadingApi] getArticles network error:', err);
      return { items: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    }
  }

  /**
   * Lấy chi tiết bài đọc (có Redis cache)
   */
  static async getArticleDetail(id: string): Promise<ReadingArticle> {
    try {
      const res = await fetch(`${API_BASE}/articles/${id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        throw new Error(`Không tìm thấy bài đọc (${res.status})`);
      }
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.error('[ReadingApi] getArticleDetail error:', err);
      throw err;
    }
  }

  /**
   * Lấy hạn mức Quota hôm nay
   */
  static async getQuota(userId: string = 'guest_user'): Promise<QuotaStatus> {
    try {
      const res = await fetch(`${API_BASE}/quota?userId=${encodeURIComponent(userId)}`, {
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
  static async getLatestNews(source?: string): Promise<NewsFeedItem[]> {
    try {
      const queryParams = new URLSearchParams({
        limit: '20'
      });
      const url = `${API_BASE}/articles?${queryParams.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[ReadingApi] getLatestNews returned ${res.status}`);
        return [];
      }
      const json = await res.json();
      const articles: ReadingArticle[] = json.data?.items || [];

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
      } catch (e) {
        // Not JSON
      }
      throw new Error(errText);
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Lấy danh sách video bài học Shadowing (L2 Redis Cache / Zero-Storage)
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

    const res = await fetch(`${SHADOWING_API_BASE}/lessons?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải danh sách bài học video');
    const json = await res.json();
    return json.data;
  }

  /**
   * Lấy chi tiết bài học video kèm phụ đề mili-giây
   */
  static async getVideoLessonDetail(id: string): Promise<any> {
    const res = await fetch(`${SHADOWING_API_BASE}/lessons/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không tìm thấy bài học video');
    const json = await res.json();
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
    return json.data;
  }

  /**
   * Bóc tách phụ đề YouTube qua tầng Vercel Edge (/api/yt-captions) trước khi gửi xuống Render
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
   * Xử lý thông minh khi người dùng nhập link YouTube tiếng Nhật:
   * 1. Tự động trích xuất phụ đề qua Vercel Edge (/api/yt-captions) nếu chưa có srtContent
   * 2. Gửi sang Backend để Kuromoji ghép câu, gắn Furigana/Romaji + dịch nghĩa GTX miễn phí
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
  static async triggerNewsCrawl(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/news/trigger-crawl`, {
        method: 'POST'
      });
      return await res.json();
    } catch (err: any) {
      console.warn('[ReadingApi] triggerNewsCrawl error:', err);
      return { success: false, message: err?.message };
    }
  }
}
