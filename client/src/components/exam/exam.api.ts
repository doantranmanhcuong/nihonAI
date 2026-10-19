import {
  JLPTExam,
  ExamSubmissionPayload,
  ExamEvaluationResult,
  AIExplanationResult,
  ExamDiagnosticReport
} from './exam.types';

const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/exam` : 'http://localhost:5000/api/exam')
  : 'http://localhost:5000/api/exam';

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
   * Lấy danh sách đề thi JLPT chuẩn (lọc theo cấp độ N5 -> N1 và năm thi)
   */
  static async getExamList(level?: string, year?: string, session?: string): Promise<JLPTExam[]> {
    try {
      const params = new URLSearchParams();
      if (level && level !== 'ALL') params.append('level', level);
      if (year && year !== 'ALL') params.append('year', year);
      if (session && session !== 'ALL') params.append('session', session);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const url = `${API_BASE}/list${queryStr}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        throw new Error(`Lỗi tải danh sách đề thi (status: ${res.status})`);
      }
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('[ExamApi] getExamList error:', err);
      return [];
    }
  }

  /**
   * Lấy toàn bộ nội dung câu hỏi của đề thi để bắt đầu làm bài
   * @param examId Mã đề thi
   * @param section Lọc theo kỹ năng (vocab, grammar, reading, listening)
   * @param format 'express' (Thi tinh gọn 34 câu) hoặc 'full' (Thi thật trọn vẹn)
   */
  static async getExamDetail(
    examId: string,
    section?: string,
    format: 'express' | 'full' = 'express'
  ): Promise<JLPTExam | null> {
    try {
      const params = new URLSearchParams();
      if (section && section !== 'ALL') params.append('section', section);
      if (format) params.append('format', format);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/${examId}${queryStr}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        throw new Error(`Lỗi tải đề thi ${examId} (status: ${res.status})`);
      }
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ExamApi] getExamDetail error:', err);
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

