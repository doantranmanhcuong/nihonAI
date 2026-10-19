export interface ConstituentKanji {
  character: string;
  hanViet: string;
  meaningVi: string;
  strokeCount: number;
  jlptLevel: string;
}

export interface VocabularyDetailResult {
  id: string;
  word: string;
  reading: string;
  romaji: string | null;
  hanViet: string | null;
  meaningVi: string;
  jlptLevel: string;
  lesson: number | null;
  partOfSpeech: string | null;
  pitchAccent: string | null;
  exampleJp: string | null;
  exampleVi: string | null;
  constituentKanjis: ConstituentKanji[];
}

export interface SearchVocabParams {
  query?: string;
  level?: string;
  lesson?: number;
  partOfSpeech?: string;
  page?: number;
  limit?: number;
}

export function getDefaultCurriculumTitle(curriculum: string, lesson: number): string {
  const cur = curriculum.toUpperCase();
  if (cur === 'MINNA') return `Bài ${lesson} - Minna no Nihongo`;
  if (cur === 'TANGO') return `Chủ đề ${lesson} - JLPT Tango`;
  if (cur === 'MIMIKARA') return `Chương ${lesson} - Mimikara Oboeru`;
  return `Bài học ${lesson}`;
}
