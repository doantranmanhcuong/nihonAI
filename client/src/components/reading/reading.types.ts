export interface ReadingSentence {
  id: string;
  articleId: string;
  orderIndex: number;
  paragraphIndex?: number;
  sentenceJp: string;
  sentenceVi: string;
  furigana?: string;
  startTimeMs: number;
  endTimeMs: number;
}

export interface DetectedGrammar {
  grammarPoint: string;
  level?: string;
  meaningVi: string;
  excerpt?: string;
}

export interface QuickWordLookup {
  type?: 'WORD' | 'PHRASE';
  word: string;
  reading?: string;
  hanViet?: string;
  meaningVi?: string;
  explanation?: string;
  grammarNotes?: string;
  isLoading?: boolean;
  level?: string;
  detectedGrammars?: DetectedGrammar[];
}

export interface DetailedGrammarInfo {
  grammarPoint: string;
  level?: string;
  meaningVi: string;
  structure?: string;
  explanation?: string;
  excerpt?: string;
  excerptVi?: string;
  excerptAnalysis?: string;
  examples?: Array<{
    japanese: string;
    reading?: string;
    vietnamese: string;
  }>;
}

export interface ReadingVocabItem {
  id: string;
  articleId: string;
  word: string;
  reading: string;
  hanViet?: string;
  meaningVi: string;
  level?: string;
}

export interface ReadingGrammarItem {
  id: string;
  articleId: string;
  grammarPoint: string;
  level?: string;
  meaningVi: string;
  excerpt: string;
}

export interface ReadingQuiz {
  id: string;
  articleId: string;
  question: string;
  questionVi?: string;
  options: string[];
  optionsVi?: string[];
  optionsJson?: string;
  optionsViJson?: string;
  correctIndex: number;
  explanation?: string;
  questionType?: string;
}

export interface ReadingArticle {
  id: string;
  title: string;
  sourceType: 'AI_GENERATED' | 'USER_TEXT' | 'NHK_NEWS' | 'YOUTUBE_VIDEO' | string;
  sourceUrl?: string;
  youtubeId?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | string;
  topic: string;
  durationSeconds: number;
  audioUrl?: string;
  imageUrl?: string;
  totalWords: number;
  translationFull?: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  sentences?: ReadingSentence[];
  vocabularies?: ReadingVocabItem[];
  grammars?: ReadingGrammarItem[];
  quizzes?: ReadingQuiz[];
  _count?: {
    sentences: number;
    vocabularies: number;
    grammars: number;
    quizzes: number;
  };
}

export interface QuotaStatus {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  canGenerate: boolean;
  resetAt: string;
}

export interface NewsFeedItem {
  id: string;
  title: string;
  link: string;
  source: 'NHK' | 'ASAHI' | 'MAINICHI' | 'YAHOO' | string;
  pubDate: string;
  description: string;
  imageUrl?: string;
  levelEstimate?: string;
  isProcessed?: boolean;
  articleId?: string;
}

export interface VideoSubtitle {
  id: string;
  lessonId: string;
  orderIndex: number;
  startTimeMs: number;
  endTimeMs: number;
  japanese: string;
  furigana?: string;
  romaji?: string;
  vietnamese: string;
  keyWords?: string;
  grammarNotes?: string;
  keyWordsList?: Array<{ word: string; reading: string; meaning: string }>;
  grammarNotesList?: Array<{ grammar: string; meaning: string }>;
}

export interface VideoShadowingLesson {
  id: string;
  title: string;
  youtubeId: string;
  level: string;
  topic: string;
  category: string;
  channelTitle?: string;
  author?: string;
  tags?: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  description?: string;
  viewCount: number;
  isPublic: boolean;
  createdAt: string;
  subtitlesCount?: number;
  subtitles?: VideoSubtitle[];
}

