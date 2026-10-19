export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type FormalityLevel = 'Thân mật' | 'Lịch sự' | 'Trang trọng' | 'Văn viết' | 'Thông thường' | string;

export type CurriculumType = 'MINNA_I' | 'MINNA_II' | 'SHINKANZEN_N3' | 'SHINKANZEN_N2' | 'SHINKANZEN_N1';

export interface FormationRule {
  partOfSpeech: 'Động từ' | 'Tính từ đuôi い' | 'Tính từ đuôi な' | 'Danh từ' | 'Thể thông thường' | string;
  rule: string;
  example: string;
}

export interface GrammarExample {
  id: string;
  japanese: string;
  reading?: string;
  vietnamese: string;
  highlightWords?: string[];
}

export interface ConfusingPair {
  similarGrammar: string;
  similarMeaning: string;
  difference: string;
}

export interface GrammarQuickQuiz {
  question: string;
  questionVi: string;
  options: string[];
  optionsVi?: string[];
  correctIndex: number;
  explanation: string;
}

export interface GrammarMasterItem {
  id: string;
  lessonId: string;              // Mã thư mục bài học, ví dụ: 'minna-01', 'minna-26', 'skz-n3-c1'
  lessonNumber?: number;         // Số bài (1..50 cho Minna)
  lessonTitle: string;           // Tên bài học / chuyên đề
  curriculum: 'MINNA' | 'SHINKANZEN' | 'SOU_MATOME';
  grammarPoint: string;          // Ví dụ: 〜は〜です, 〜わけにはいかない
  reading: string;               // Ví dụ: わけにはいかない
  romaji: string;                // Ví dụ: wake ni wa ikanai
  level: JLPTLevel;
  category: string;              // Ví dụ: Bắt buộc & Cấm đoán, Nguyên nhân - Lý do...
  meaningVi: string;             // Ví dụ: Không thể làm vì đạo đức, nguyên tắc, lương tâm
  structure: string;             // Ví dụ: V-る / V-ない + わけにはいかない
  formality: FormalityLevel;
  nuance: string;                // Giải thích sắc thái ngữ cảnh chi tiết
  formationRules: FormationRule[];
  examples: GrammarExample[];
  cautionNotes?: string[];       // Điểm chú ý / Bẫy thi JLPT
  confusingPairs?: ConfusingPair[];
  quickQuiz?: GrammarQuickQuiz;
}

export interface GrammarLessonFolder {
  id: string;
  level: JLPTLevel;
  curriculum: CurriculumType;
  curriculumTitle: string;       // Ví dụ: "Minna no Nihongo Sơ cấp I (Bài 1 - 25)"
  lessonNumber?: number;         // Số thứ tự bài (1..50)
  title: string;                 // Tên bài, ví dụ: "Bài 1: Giới thiệu bản thân & Cấu trúc cơ bản"
  description?: string;
  grammarIds: string[];
  isReview?: boolean;
  isFinal?: boolean;
}

export type GrammarStudyMode = 'dictionary' | 'flashcard' | 'quiz';

export interface GrammarCategory {
  id: string;
  name: string;
  iconName?: string;
  count?: number;
}
