export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type ExamSectionType = 'vocab' | 'grammar' | 'reading' | 'listening';

export interface ExamQuestionItem {
  id: string;
  orderNumber: number;
  level: JLPTLevel;
  section: ExamSectionType;
  subType: string;
  subTypeLabel: string;
  question: string;
  questionVi: string;
  passage?: string;
  passageVi?: string;
  audioUrl?: string;
  imageUrl?: string;
  options: string[];
  optionsVi?: string[];
  correctIndex?: number;
  explanation?: string;
  officialSource: string;
}

export interface JLPTExam {
  id: string;
  code?: string;
  title: string;
  level: JLPTLevel;
  year?: number | string;
  session?: string;
  edition: string;
  description: string;
  durationMinutes: number;
  expressDurationMinutes?: number;
  fullDurationMinutes?: number;
  expressTotalQuestions?: number;
  fullTotalQuestions?: number;
  format?: 'express' | 'full';
  totalQuestions: number;
  passingScore: number;
  sectionalMinScore: number;
  sections: {
    section: ExamSectionType;
    title: string;
    totalQuestions: number;
    maxScore: number;
  }[];
  questions?: ExamQuestionItem[];
}

export interface ExamSubmissionPayload {
  examId: string;
  userAnswers: { [questionId: string]: number };
  timeSpentSeconds: number;
  format?: 'express' | 'full';
  questionIds?: string[];
}

export interface SectionScoreResult {
  section: ExamSectionType;
  title: string;
  correctCount: number;
  totalQuestions: number;
  score: number;
  isFailedSection: boolean;
}

export interface QuestionResultItem {
  questionId: string;
  orderNumber: number;
  section: ExamSectionType;
  subTypeLabel: string;
  question: string;
  questionVi: string;
  passage?: string;
  passageVi?: string;
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
}

export interface ExamEvaluationResult {
  examId: string;
  examTitle: string;
  level: JLPTLevel;
  timeSpentSeconds: number;
  totalQuestions: number;
  totalCorrect: number;
  totalScore: number;
  passingScore: number;
  isPassed: boolean;
  hasSectionalFailure: boolean;
  summaryMessage: string;
  sectionResults: SectionScoreResult[];
  questionResults: QuestionResultItem[];
}

export interface AIExplanationResult {
  explanation: string;
  keyGrammarOrVocab?: string;
  keyKnowledge?: string;
  studyTips: string;
  source: 'GEMINI_AI' | 'BUILTIN_EXPLANATION';
}

export interface DiagnosticLessonLearned {
  orderNumber: number;
  questionId?: string;
  subTypeLabel: string;
  questionSnippet: string;
  userAnswerText: string;
  correctAnswerText: string;
  trapNote: string;
  coreTakeaway: string;
}

export interface ExamDiagnosticReport {
  overallVerdict: string;
  passingProbability: number;
  scoreAssessment: {
    totalScore: number;
    passingScore: number;
    statusText: string;
    sectionalRisk: string;
  };
  strengthAreas: string[];
  criticalWeaknesses: string[];
  lessonsLearned: DiagnosticLessonLearned[];
  actionPlan7Days: {
    dayRange: string;
    focusArea: string;
    action: string;
  }[];
  encouragement: string;
  generatedAt: string;
  model: string;
}

