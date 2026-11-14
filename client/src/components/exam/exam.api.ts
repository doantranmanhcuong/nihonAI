import {
  JLPTExam,
  ExamSubmissionPayload,
  ExamEvaluationResult,
  AIExplanationResult,
  ExamDiagnosticReport,
  ShortExamSummary,
  ExamBankStats
} from './exam.types';

const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/exam` : 'http://localhost:5000/api/exam')
  : 'http://localhost:5000/api/exam';

const EXAM_STORAGE_PREFIX = 'nihonai_exam_v5:';
const examMemoryCache = new Map<string, { data: any; timestamp: number }>();

function readExamCache<T>(key: string): { data: T; isFresh: boolean } | null {
  const now = Date.now();
  const mem = examMemoryCache.get(key);
  if (mem) {
    return { data: mem.data as T, isFresh: now - mem.timestamp < 10 * 60 * 1000 };
  }
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(EXAM_STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== 'number') return null;
    if (now - parsed.timestamp > 24 * 60 * 60 * 1000) return null;
    examMemoryCache.set(key, { data: parsed.data, timestamp: parsed.timestamp });
    return { data: parsed.data as T, isFresh: now - parsed.timestamp < 10 * 60 * 1000 };
  } catch {
    return null;
  }
}

function writeExamCache(key: string, data: any) {
  const now = Date.now();
  examMemoryCache.set(key, { data, timestamp: now });
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EXAM_STORAGE_PREFIX + key, JSON.stringify({ data, timestamp: now }));
  } catch {
    // Ignore storage quota errors
  }
}

export const INITIAL_FALLBACK_EXAMS: JLPTExam[] = [
  {
    id: 'jlpt-n5-2024-12',
    title: 'Đề thi chuẩn JLPT N5 - Kỳ tháng 12/2024',
    level: 'N5',
    year: 2024,
    session: '12',
    durationMinutes: 90,
    totalQuestions: 34,
    sections: []
  } as any,
  {
    id: 'jlpt-n4-2024-12',
    title: 'Đề thi chuẩn JLPT N4 - Kỳ tháng 12/2024',
    level: 'N4',
    year: 2024,
    session: '12',
    durationMinutes: 105,
    totalQuestions: 34,
    sections: []
  } as any,
  {
    id: 'jlpt-n3-2024-12',
    title: 'Đề thi chuẩn JLPT N3 - Kỳ tháng 12/2024',
    level: 'N3',
    year: 2024,
    session: '12',
    durationMinutes: 140,
    totalQuestions: 34,
    sections: []
  } as any,
  {
    id: 'jlpt-n2-2024-12',
    title: 'Đề thi chuẩn JLPT N2 - Kỳ tháng 12/2024',
    level: 'N2',
    year: 2024,
    session: '12',
    durationMinutes: 155,
    totalQuestions: 34,
    sections: []
  } as any,
  {
    id: 'jlpt-n1-2024-12',
    title: 'Đề thi chuẩn JLPT N1 - Kỳ tháng 12/2024',
    level: 'N1',
    year: 2024,
    session: '12',
    durationMinutes: 170,
    totalQuestions: 34,
    sections: []
  } as any
];

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nihonai_token') || localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export class ExamApi {
  /**
   * Lấy danh sách đề thi JLPT chuẩn (0ms Cache + Fallback tức thì)
   */
  static async getExamList(level?: string, year?: string, session?: string): Promise<JLPTExam[]> {
    const params = new URLSearchParams();
    if (level && level !== 'ALL') params.append('level', level);
    if (year && year !== 'ALL') params.append('year', year);
    if (session && session !== 'ALL') params.append('session', session);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const cacheKey = `list:${queryStr}`;

    const cached = readExamCache<JLPTExam[]>(cacheKey);
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
      if (!cached.isFresh) {
        fetch(`${API_BASE}/list${queryStr}`, { headers: getAuthHeaders() })
          .then((r) => (r.ok ? r.json() : null))
          .then((json) => {
            if (Array.isArray(json?.data) && json.data.length > 0) writeExamCache(cacheKey, json.data);
          })
          .catch(() => {});
      }
      return cached.data;
    }

    try {
      const url = `${API_BASE}/list${queryStr}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        return INITIAL_FALLBACK_EXAMS.filter((e) => !level || level === 'ALL' || e.level === level);
      }
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        writeExamCache(cacheKey, json.data);
        return json.data;
      }
      return INITIAL_FALLBACK_EXAMS.filter((e) => !level || level === 'ALL' || e.level === level);
    } catch (err) {
      console.error('[ExamApi] getExamList error:', err);
      return INITIAL_FALLBACK_EXAMS.filter((e) => !level || level === 'ALL' || e.level === level);
    }
  }

  /**
   * Lấy toàn bộ nội dung câu hỏi của đề thi để bắt đầu làm bài
   */
  static async getExamDetail(
    examId: string,
    section?: string,
    format: 'express' | 'full' = 'express'
  ): Promise<JLPTExam | null> {
    const params = new URLSearchParams();
    if (section && section !== 'ALL') params.append('section', section);
    if (format) params.append('format', format);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const cacheKey = `detail:${examId}:${queryStr}`;

    const cached = readExamCache<JLPTExam>(cacheKey);
    if (cached && cached.data) {
      return cached.data;
    }

    try {
      const res = await fetch(`${API_BASE}/${examId}${queryStr}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        throw new Error(`Lỗi tải đề thi ${examId} (status: ${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        writeExamCache(cacheKey, json.data);
      }
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] getExamDetail error:', err);
      return null;
    }
  }

  /**
   * Thống kê thật ngân hàng đề từ CSDL
   */
  static async getBankStats(): Promise<ExamBankStats | null> {
    const cacheKey = 'bank:stats';
    const cached = readExamCache<ExamBankStats>(cacheKey);
    if (cached && cached.isFresh) return cached.data;
    try {
      const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
      if (!res.ok) return cached?.data || null;
      const json = await res.json();
      if (json.data) writeExamCache(cacheKey, json.data);
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] getBankStats error:', err);
      return cached?.data || null;
    }
  }

  /**
   * Danh sách Đề ngắn mỗi ngày (phân tách không trùng lặp câu hỏi theo từng level)
   */
  static async getShortExamList(level: string): Promise<ShortExamSummary[]> {
    const norm = (level || 'N3').toUpperCase();
    const cacheKey = `short-list:${norm}`;
    const cached = readExamCache<ShortExamSummary[]>(cacheKey);
    if (cached && Array.isArray(cached.data) && cached.isFresh) {
      return cached.data;
    }
    try {
      const res = await fetch(`${API_BASE}/short-list?level=${encodeURIComponent(norm)}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return cached?.data || [];
      const json = await res.json();
      if (Array.isArray(json.data)) {
        writeExamCache(cacheKey, json.data);
        return json.data;
      }
      return cached?.data || [];
    } catch (err) {
      console.error('[ExamApi] getShortExamList error:', err);
      return cached?.data || [];
    }
  }

  /**
   * Tải chi tiết Đề ngắn số :order
   */
  static async getShortExam(level: string, order: number): Promise<JLPTExam | null> {
    const norm = (level || 'N3').toUpperCase();
    const cacheKey = `short-detail:${norm}:${order}`;
    const cached = readExamCache<JLPTExam>(cacheKey);
    if (cached && cached.data && cached.isFresh) return cached.data;
    try {
      const res = await fetch(`${API_BASE}/short/${encodeURIComponent(norm)}/${order}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.data) writeExamCache(cacheKey, json.data);
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] getShortExam error:', err);
      return null;
    }
  }

  /**
   * Sinh Đề ngẫu nhiên theo Cấp độ + Kỹ năng + Mondai
   */
  static async getRandomExam(level: string, skill: string, mondai: string): Promise<JLPTExam | null> {
    try {
      const params = new URLSearchParams({ level, skill, mondai });
      const res = await fetch(`${API_BASE}/random?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] getRandomExam error:', err);
      return null;
    }
  }

  /**
   * Nộp bài thi và nhận kết quả chấm điểm chuẩn JLPT 180
   */
  static async submitExam(payload: ExamSubmissionPayload): Promise<ExamEvaluationResult | null> {
    try {
      const res = await fetch(`${API_BASE}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Lỗi nộp bài thi (status: ${res.status})`);
      }
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] submitExam error:', err);
      return null;
    }
  }

  /**
   * Kết nối Gemini AI giải thích chuyên sâu câu hỏi
   */
  static async explainWithAI(questionId: string, userAnswer: number | null): Promise<AIExplanationResult | null> {
    try {
      const res = await fetch(`${API_BASE}/ai-explain`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ questionId, userAnswer })
      });
      if (!res.ok) {
        throw new Error(`Lỗi phân tích AI (status: ${res.status})`);
      }
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] explainWithAI error:', err);
      return null;
    }
  }

  /**
   * Tạo báo cáo chẩn đoán toàn diện bài thi và bài học rút kinh nghiệm từ Gemini
   */
  static async getAiDiagnosticReport(payload: any): Promise<ExamDiagnosticReport | null> {
    try {
      const res = await fetch(`${API_BASE}/ai-diagnostic`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Lỗi phân tích chẩn đoán AI (status: ${res.status})`);
      }
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] getAiDiagnosticReport error:', err);
      return null;
    }
  }
}
