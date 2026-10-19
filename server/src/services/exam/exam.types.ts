export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type ExamSectionType = 'vocab' | 'grammar' | 'reading' | 'listening';

export interface ExamQuestionItem {
  id: string;
  orderNumber: number;
  level: JLPTLevel;
  section: ExamSectionType;
  subType: string; // kanji_reading, orthography, context, star_order, short_reading, task_understanding, etc.
  subTypeLabel: string; // e.g. "Cách đọc Kanji", "Sắp xếp câu ★", "Đọc hiểu ngắn", "Nghe hiểu vấn đề"
  question: string;
  questionVi: string;
  passage?: string; // Đoạn văn nếu là bài đọc hiểu hoặc ngữ pháp đoạn văn
  passageVi?: string; // Bản dịch đoạn văn
  audioUrl?: string; // Đường dẫn file âm thanh bài nghe Choukai
  imageUrl?: string; // Tranh minh họa hoặc biểu bảng thông báo
  options: string[];
  optionsVi?: string[];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string; // Lời giải thích chi tiết
  officialSource: string; // e.g. "Bộ đề Chuẩn Japan Foundation / JEES Vol. 2"
}

export interface JLPTExam {
  id: string;
  code?: string;
  title: string;
  level: JLPTLevel;
  year?: number | string;
  session?: string;
  edition: string; // e.g. "Đề thi Chuẩn Quốc tế JEES Vol. 2", "Đề thi Chính thức 2023"
  description: string;
  durationMinutes: number; // Thời gian thi thực tế (phút) tùy theo phương án chọn
  expressDurationMinutes?: number; // Thời gian thi tinh gọn (34 câu)
  fullDurationMinutes?: number; // Thời gian thi thật toàn bộ (chuẩn JEES)
  expressTotalQuestions?: number; // 34 câu
  fullTotalQuestions?: number; // 75, 85, 95, 105 câu
  format?: 'express' | 'full';
  totalQuestions: number;
  passingScore: number; // Điểm đỗ tối thiểu trên 180
  sectionalMinScore: number; // Điểm liệt tối thiểu mỗi phần (thường 19/60)
  sections: {
    section: ExamSectionType;
    title: string;
    totalQuestions: number;
    maxScore: number; // 60 điểm mỗi phần trên thang 180
  }[];
  questions: ExamQuestionItem[];
}

export interface ExamSubmissionPayload {
  examId: string;
  userAnswers: { [questionId: string]: number }; // questionId -> selectedIndex
  timeSpentSeconds: number;
  format?: 'express' | 'full';
  questionIds?: string[];
}

export interface SectionScoreResult {
  section: ExamSectionType;
  title: string;
  correctCount: number;
  totalQuestions: number;
  score: number; // Điểm quy đổi thang 60
  isFailedSection: boolean; // Điểm liệt (< 19)
}

export interface ExamEvaluationResult {
  examId: string;
  examTitle: string;
  level: JLPTLevel;
  timeSpentSeconds: number;
  totalQuestions: number;
  totalCorrect: number;
  totalScore: number; // Thang điểm 180
  passingScore: number;
  isPassed: boolean;
  hasSectionalFailure: boolean;
  summaryMessage: string;
  sectionResults: SectionScoreResult[];
  questionResults: {
    questionId: string;
    orderNumber: number;
    section: ExamSectionType;
    subTypeLabel: string;
    question: string;
    questionVi: string;
    passage?: string;
    audioUrl?: string;
    imageUrl?: string;
    options: string[];
    optionsVi?: string[];
    userAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
    keyGrammarOrVocab?: string;
    studyTips?: string;
    officialSource: string;
  }[];
}

export interface DiagnosticLessonLearned {
  orderNumber: number;
  questionId?: string;
  subTypeLabel: string;
  questionSnippet: string;
  userAnswerText: string;
  correctAnswerText: string;
  trapNote: string; // Phân tích bẫy đề thi hoặc lý do học viên dễ nhầm
  coreTakeaway: string; // Bài học cốt lõi rút kinh nghiệm
}

export interface ExamDiagnosticReport {
  overallVerdict: string; // Đánh giá tổng quan năng lực học viên
  passingProbability: number; // Dự đoán tỷ lệ đỗ kỳ thi thật (%)
  scoreAssessment: {
    totalScore: number;
    passingScore: number;
    statusText: string;
    sectionalRisk: string; // Đánh giá nguy cơ điểm liệt hoặc thế mạnh từng phần
  };
  strengthAreas: string[]; // Điểm mạnh cần phát huy
  criticalWeaknesses: string[]; // Lỗ hổng kiến thức chính cần khắc phục ngay
  lessonsLearned: DiagnosticLessonLearned[]; // Danh sách bài học rút kinh nghiệm từ các câu sai
  actionPlan7Days: {
    dayRange: string;
    focusArea: string;
    action: string;
  }[];
  encouragement: string; // Lời động viên từ Giám khảo AI
  generatedAt: string;
  model: string;
}

export interface ExamDiagnosticRequest {
  examId: string;
  examTitle: string;
  level: JLPTLevel;
  totalScore: number;
  passingScore: number;
  isPassed: boolean;
  hasSectionalFailure: boolean;
  timeSpentSeconds: number;
  totalQuestions: number;
  totalCorrect: number;
  sectionResults: SectionScoreResult[];
  incorrectQuestions: {
    orderNumber: number;
    questionId: string;
    section: ExamSectionType;
    subTypeLabel: string;
    question: string;
    questionVi: string;
    userAnswerIndex: number | null;
    userAnswerText: string;
    correctAnswerIndex: number;
    correctAnswerText: string;
    options: string[];
    explanation?: string;
  }[];
}

