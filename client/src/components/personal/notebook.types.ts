export type ItemType = 'VOCAB' | 'KANJI' | 'GRAMMAR' | 'NOTE';
export type MasteryStatus = 'LEARNING' | 'REVIEWING' | 'MASTERED';

export interface NotebookItem {
  id: string;
  userId?: string | null;
  itemType: ItemType;
  title: string;
  reading?: string | null;
  meaningVi: string;
  level: string;
  structure?: string | null;
  exampleJp?: string | null;
  exampleVi?: string | null;
  note?: string | null;
  tags?: string | null;
  masteryStatus: MasteryStatus;
  reviewCount: number;
  lastReviewedAt?: string | null;
  nextReviewAt?: string;
  interval?: number;
  easeFactor?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookFilterParams {
  itemType?: string;
  level?: string;
  masteryStatus?: string;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface CreateNotebookItemInput {
  itemType: ItemType;
  title: string;
  reading?: string;
  meaningVi: string;
  level?: string;
  structure?: string;
  exampleJp?: string;
  exampleVi?: string;
  note?: string;
  tags?: string;
  masteryStatus?: MasteryStatus;
}

export interface UpdateNotebookItemInput {
  itemType?: ItemType;
  title?: string;
  reading?: string;
  meaningVi?: string;
  level?: string;
  structure?: string;
  exampleJp?: string;
  exampleVi?: string;
  note?: string;
  tags?: string;
  masteryStatus?: MasteryStatus;
}

export interface NotebookStats {
  total: number;
  vocabCount: number;
  kanjiCount: number;
  grammarCount: number;
  noteCount: number;
  learningCount: number;
  reviewingCount: number;
  masteredCount: number;
  masteryRate: number;
  dueCount?: number;
  studyStreak?: number;
  lastStudyDate?: string | null;
}
