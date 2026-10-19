import { ReadingArticle, QuotaStatus, ReadingQuiz, NewsFeedItem } from './reading.types';

const API_BASE = typeof window !== 'undefined'
  ? '/api/reading'
  : 'http://localhost:5000/api/reading';

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

      const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
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
      const res = await fetch(`${API_BASE}/articles/${id}`);
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
      const res = await fetch(`${API_BASE}/quota?userId=${encodeURIComponent(userId)}`);
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
      headers: { 'Content-Type': 'application/json' },
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
  static async translateSelection(text: string, contextSentence?: string): Promise<{
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
  static async explainGrammar(grammarPoint: string, sentence?: string, level?: string): Promise<{
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
   * Lấy danh sách tin tức báo chí tiếng Nhật mới nhất (NHK, Asahi, Mainichi, Yahoo JP)
   */
  static async getLatestNews(source?: string): Promise<NewsFeedItem[]> {
    try {
      // Thay vì lấy RSS Live chưa được cào (gây lỗi 403 / ENOTFOUND khi bấm cào),
      // chúng ta sẽ lấy danh sách các bài báo ĐÃ CÀO SẴN từ trong DB.
      // Filter theo sourceType = EXTERNAL_NEWS hoặc NHK_NEWS
      
      const queryParams = new URLSearchParams({
        limit: '20'
      });
      // Lấy các bài báo từ nguồn news
      const url = `${API_BASE}/articles?${queryParams.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[ReadingApi] getLatestNews returned ${res.status}`);
        return [];
      }
      const json = await res.json();
      const articles: ReadingArticle[] = json.data?.items || [];
      
      // Lọc thủ công nếu có source (vì API listArticles chưa hỗ trợ lọc nhiều sourceType qua query một cách hoàn hảo)
      const newsArticles = articles.filter(a => a.sourceType === 'EXTERNAL_NEWS' || a.sourceType === 'NHK_NEWS');
      
      return newsArticles.map(a => ({
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

    const res = await fetch(`http://localhost:5000/api/shadowing/lessons?${params.toString()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách bài học video');
    const json = await res.json();
    return json.data;
  }

  /**
   * Lấy chi tiết bài học video kèm phụ đề mili-giây
   */
  static async getVideoLessonDetail(id: string): Promise<any> {
    const res = await fetch(`http://localhost:5000/api/shadowing/lessons/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy bài học video');
    const json = await res.json();
    return json.data;
  }

  /**
   * Tạo bài học video mới
   */
  static async createVideoLesson(payload: any): Promise<any> {
    const res = await fetch('http://localhost:5000/api/shadowing/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi khi tạo bài học video');
    return json.data;
  }

  /**
   * Xử lý thông minh khi người dùng nhập link YouTube tiếng Nhật:
   * Tự động trích xuất oEmbed, bóc tách phụ đề AI và lưu MySQL/Redis
   */
  static async processYouTubeVideo(payload: {
    url: string;
    level?: string;
    category?: string;
    srtContent?: string;
    autoSync?: boolean;
    rawTranscript?: any[];
  }): Promise<any> {
    const res = await fetch('http://localhost:5000/api/shadowing/process-youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi khi xử lý link YouTube');
    return json.data;
  }

  static async explainWord(word: string, context?: string): Promise<any> {
    const res = await fetch('http://localhost:5000/api/shadowing/explain-word', {
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
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save to notebook');
    const json = await res.json();
    return json.data;
  }
}
