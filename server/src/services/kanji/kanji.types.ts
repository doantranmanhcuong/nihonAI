export interface MinaVocabulary {
  word: string;
  reading: string;
  pitchAccent: string;
  hanViet: string;
  meaning: string;
  source?: string;
}

export interface CompoundWord {
  word: string;
  reading: string;
  meaning: string;
  jlpt?: string;
  pitchAccent?: string;
}

export interface LookalikeKanji {
  character: string;
  hanViet: string;
  meaningVi: string;
  radicalDiff: string;
  mnemonicTip: string;
}

export interface ExampleWordItem {
  word: string;
  reading: string;
  pitchAccent: string;
  hanViet: string;
  meaningVi: string;
}

export interface KanjiDetail {
  character: string;
  hanViet: string;
  meaningVi: string;
  jlptLevel: string;
  levelTag?: string;
  curriculum?: string;
  lesson?: number;
  lessonTitle?: string;
  strokeCount: number;
  kunyomi: string;
  onyomi: string;
  radicals: { symbol: string; name: string }[];
  mnemonic: string;
  lookAndLearnTip?: string;
  phoneticRule?: string;
  exampleWords?: ExampleWordItem[];
  svgStrokes: string[];
  minaVocabularies: MinaVocabulary[];
  compoundsTree: {
    onyomiCompounds: CompoundWord[];
    kunyomiCompounds: CompoundWord[];
  };
  lookalikes: LookalikeKanji[];
}

export interface MatchingPair {
  id: string;
  kanji: string;
  matchText: string;
  hanViet?: string;
  meaningVi?: string;
}

export interface KanjiQuizQuestion {
  id: string;
  type: 'kanji_to_hanviet' | 'kanji_to_reading' | 'meaning_to_kanji' | 'context_reading' | 'true_false' | 'matching';
  prompt: string;
  kanji: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hanViet?: string;
  level: string;
  matchingPairs?: MatchingPair[];
}

export type KanjiCurriculumType = 'BASIC_KANJI' | 'LOOK_AND_LEARN' | 'SOUMATOME' | '500_MON';
