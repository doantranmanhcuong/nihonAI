import React, { useState, useEffect, useCallback } from 'react';
import { apiGateway } from '@/services/api-gateway.client';
import { CurriculumType } from './CurriculumSelector';
import { LessonSummaryItem } from './LessonGridView';
import { LessonFlashcard } from './LessonFlashcard';
import { LessonWordList } from './LessonWordList';
import { LessonQuiz } from './LessonQuiz';
import { LessonListeningExercise } from './LessonListeningExercise';
import { LessonPracticeHub } from './LessonPracticeHub';
import { VocabSearchBar } from './VocabSearchBar';
import { VocabCardList, VocabularySummary } from './VocabCardList';
import { VocabDetailCard, VocabularyDetailData } from './VocabDetailCard';
import { BookOpen, Search, FolderOpen, Folder, FileText, ChevronDown , Sparkles } from 'lucide-react';
import { ComprehensiveQuizDashboard, CompQuizQuestion } from '../shared/ComprehensiveQuizDashboard';

interface VocabStudioProps {
  onNavigateToKanji?: (character: string) => void;
}

const generateVocabQuestions = (words: any[], count: number): CompQuizQuestion[] => {
  const generated: CompQuizQuestion[] = [];
  const pool = [...words];
  for (let i = pool.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  for(let i=0; i<count; i++) {
     const w = pool[i % pool.length];
     const others = pool.filter(x => x.id !== w.id).sort(() => Math.random() - 0.5);
     
     const type = Math.floor(Math.random() * 3);
     if (type === 0) {
        const options = [w.meaningVi, ...others.slice(0,3).map(x => x.meaningVi)].sort(() => Math.random() - 0.5);
        generated.push({
           id: `${w.id}-mean-${i}`,
           question: w.word,
           subText: w.reading,
           correctAnswer: w.meaningVi,
           options,
           explanation: `${w.word} (${w.reading}) nghĩa là: ${w.meaningVi}`,
           itemId: w.id
        });
     } else if (type === 1) {
        const options = [w.reading, ...others.slice(0,3).map(x => x.reading)].sort(() => Math.random() - 0.5);
        generated.push({
           id: `${w.id}-read-${i}`,
           question: `Cách đọc của "${w.word}"?`,
           subText: w.meaningVi,
           correctAnswer: w.reading,
           options,
           explanation: `${w.word} đọc là ${w.reading}`,
           itemId: w.id
        });
     } else {
        if (w.exampleJp) {
            const options = [w.word, ...others.slice(0,3).map(x => x.word)].sort(() => Math.random() - 0.5);
            let qText = w.exampleJp;
            if (qText.includes(w.word)) {
              qText = qText.replace(w.word, '(   )');
            } else {
              qText = `(   ) -> ${qText}`;
            }
            generated.push({
               id: `${w.id}-ex-${i}`,
               question: qText,
               subText: w.exampleVi || 'Điền từ',
               correctAnswer: w.word,
               options,
               explanation: `Ví dụ: ${w.exampleJp} => ${w.exampleVi}`,
               itemId: w.id
            });
        } else {
            const options = [w.meaningVi, ...others.slice(0,3).map(x => x.meaningVi)].sort(() => Math.random() - 0.5);
            generated.push({
               id: `${w.id}-mean2-${i}`,
               question: w.word,
               subText: w.reading,
               correctAnswer: w.meaningVi,
               options,
               explanation: `${w.word} (${w.reading}) nghĩa là: ${w.meaningVi}`,
               itemId: w.id
            });
        }
     }
  }
  return generated;
};

const CURRICULUMS = [
  { id: 'TANGO', label: 'Tango JLPT' },
  { id: 'MINNA', label: 'Minna no Nihongo' },
  { id: 'MIMIKARA', label: 'Mimikara Oboeru' },
  { id: 'SOUMATOME', label: 'Nihongo Soumatome' }
];

const LEVEL_CURRICULUMS: Record<string, string[]> = {
  'N5': ['MINNA', 'TANGO'],
  'N4': ['MINNA', 'TANGO'],
  'N3': ['TANGO', 'MIMIKARA', 'SOUMATOME'],
  'N2': ['TANGO', 'MIMIKARA', 'SOUMATOME'],
  'N1': ['TANGO', 'MIMIKARA', 'SOUMATOME']
};
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const VocabStudio: React.FC<VocabStudioProps> = ({ onNavigateToKanji }) => {
  const [mainTab, setMainTab] = useState<'curriculum' | 'dictionary'>('curriculum');

  // Directory Tree State
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumType>('MINNA');
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [curriculumLessons, setCurriculumLessons] = useState<LessonSummaryItem[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonData, setLessonData] = useState<any | null>(null);
  const [isLoadingLessonWords, setIsLoadingLessonWords] = useState(false);
  const [lessonStudyMode, setLessonStudyMode] = useState<'flashcard' | 'list' | 'listening' | 'quiz'>('list');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLevel, setSearchLevel] = useState('all');
  const [searchLesson, setSearchLesson] = useState<number | null>(null);
  const [searchPos, setSearchPos] = useState('all');
  const [dictList, setDictList] = useState<VocabularySummary[]>([]);
  const [dictTotal, setDictTotal] = useState(0);
  const [dictSelected, setDictSelected] = useState<VocabularySummary | null>(null);
  const [dictDetail, setDictDetail] = useState<VocabularyDetailData | null>(null);
  const [isLoadingDictList, setIsLoadingDictList] = useState(false);
  const [isLoadingDictDetail, setIsLoadingDictDetail] = useState(false);

  const fetchCurriculumLessons = useCallback(async (curr: CurriculumType, lvl: string) => {
    try {
      setIsLoadingLessons(true);
      const res = await apiGateway.vocab.getCurriculums(curr, lvl);
      if (res.success && res.data) {
        setCurriculumLessons(res.data.lessons || []);
        if (res.data.lessons?.length > 0) {
            handleSelectLesson(res.data.lessons[0].lesson, curr, lvl);
        } else {
            setLessonData(null);
            setSelectedLesson(null);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh mục bài học:', err);
    } finally {
      setIsLoadingLessons(false);
    }
  }, []);

  const handleSelectLesson = useCallback(async (lessonNum: number, curr = selectedCurriculum, lvl = selectedLevel) => {
    setSelectedLesson(lessonNum);
    setLessonStudyMode('list');
    try {
      setIsLoadingLessonWords(true);
      const res = await apiGateway.vocab.getLessonWords(curr, lvl, lessonNum);
      if (res.success && res.data) {
        setLessonData({
          curriculum: curr,
          level: lvl,
          lesson: lessonNum,
          topic: res.data.themeTopic || 'Từ vựng trọng tâm',
          ...res.data
        });
      }
    } catch (err) {
      console.error('Lỗi tải từ vựng bài học:', err);
    } finally {
      setIsLoadingLessonWords(false);
    }
  }, [selectedCurriculum, selectedLevel]);

  // Auto-switch curriculum if it is not supported by the new level
  useEffect(() => {
    const available = LEVEL_CURRICULUMS[selectedLevel] || [];
    if (available.length > 0 && !available.includes(selectedCurriculum)) {
      setSelectedCurriculum(available[0] as CurriculumType);
    }
  }, [selectedLevel, selectedCurriculum]);

  useEffect(() => {
    fetchCurriculumLessons(selectedCurriculum, selectedLevel);
  }, [selectedCurriculum, selectedLevel, fetchCurriculumLessons]);

  const fetchDictionaryList = useCallback(async () => {
    try {
      setIsLoadingDictList(true);
      const params: any = { limit: 30 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (searchLevel !== 'all') params.level = searchLevel;
      if (searchLesson !== null) params.lesson = searchLesson;
      if (searchPos !== 'all') params.pos = searchPos;

      const res = await apiGateway.vocab.search(params);
      if (res.success && res.data) {
        setDictList(res.data.items || []);
        setDictTotal(res.data.total || 0);
        if (res.data.items?.length > 0 && !dictSelected) {
          handleSelectDictItem(res.data.items[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm từ điển:', err);
    } finally {
      setIsLoadingDictList(false);
    }
  }, [searchQuery, searchLevel, searchLesson, searchPos]);

  useEffect(() => {
    if (mainTab === 'dictionary') {
      const timer = setTimeout(() => {
        fetchDictionaryList();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [mainTab, fetchDictionaryList]);

  const handleSelectDictItem = async (item: VocabularySummary) => {
    setDictSelected(item);
    try {
      setIsLoadingDictDetail(true);
      const res = await apiGateway.vocab.getDetail(item.id);
      if (res.success && res.data) {
        setDictDetail(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy chi tiết từ vựng:', err);
    } finally {
      setIsLoadingDictDetail(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-16">
      {/* 1. HEADER GỌN GÀNG & THÔNG MINH */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 lg:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                Từ Vựng JLPT
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                CSDL Trọng âm NHK
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống từ vựng N5 - N1 phân chia theo giáo trình chuẩn Minna, Tango, Mimikara.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setMainTab('curriculum')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'curriculum'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Duyệt Thư Mục</span>
          </button>

          <button
            onClick={() => setMainTab('dictionary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'dictionary'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tra Cứu Nhanh</span>
          </button>
        </div>
      </div>

      {/* ================= CHẾ ĐỘ 1: HỌC THEO CÂY THƯ MỤC ================= */}
      {mainTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CỘT TRÁI (4 cột): Cây thư mục */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]">
                
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center cursor-pointer ${
                        selectedLevel === lvl
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                    value={selectedCurriculum}
                    onChange={(e) => setSelectedCurriculum(e.target.value as CurriculumType)}
                  >
                    {CURRICULUMS.filter(c => (LEVEL_CURRICULUMS[selectedLevel] || []).includes(c.id)).map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 pointer-events-none group-hover:text-indigo-600 transition-colors" />
                </div>

                <div className="flex items-center justify-between px-1 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>MỤC</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {curriculumLessons.length} mục
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
                  {isLoadingLessons ? (
                     <div className="py-10 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
                  ) : curriculumLessons.map((folder: any) => {
                    const isSelectedFolder = folder.lesson === selectedLesson;
                    return (
                      <button
                        key={folder.lesson}
                        onClick={() => isSelectedFolder ? setSelectedLesson(0) : handleSelectLesson(folder.lesson)}
                        className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                          isSelectedFolder
                            ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300/50 shadow-xs'
                            : folder.isReview ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {isSelectedFolder ? (
                            <FolderOpen className={`w-4 h-4 shrink-0 ${folder.isReview ? 'text-amber-600' : 'text-indigo-600'}`} />
                          ) : (
                            <Folder className={`w-4 h-4 shrink-0 ${folder.isReview ? 'text-amber-500' : 'text-slate-400'}`} />
                          )}
                          <span className="text-xs truncate">{folder.title}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isSelectedFolder ? "rotate-180 text-indigo-600" : ""}`} />
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            isSelectedFolder
                              ? folder.isReview ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                              : folder.isReview ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {folder.wordCount || 0} từ
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (8 cột): Nội dung học */}
            <div id="vocab-detail-section" className="lg:col-span-8 flex flex-col gap-4">
              {lessonData?.lesson && lessonData.lesson > 9000 ? (
                <div className="w-full">
                  <ComprehensiveQuizDashboard 
                     title={lessonData.lessonTitle || 'ÔN TẬP TỔNG HỢP'}
                     topic={lessonData.topic}
                     totalItems={lessonData.totalWords}
                     maxQuestions={lessonData.totalWords * (lessonData.lesson === 9999 ? 7 : 5)}
                     onGenerateQuestions={(cnt) => generateVocabQuestions(lessonData.words, cnt)}
                     onBack={() => {
                        const firstStandard = curriculumLessons.find(l => !(l as any).isReview);
                        if (firstStandard) handleSelectLesson(firstStandard.lesson);
                     }}
                  />
                </div>
              ) : lessonData ? (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
                    
                    {/* Các tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto w-full">
                      <button
                        onClick={() => setLessonStudyMode('list')}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                          lessonStudyMode === 'list'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        📋 Danh sách
                      </button>
                      <button
                        onClick={() => setLessonStudyMode('flashcard')}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                          lessonStudyMode === 'flashcard'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🎴 Flashcard
                      </button>
                      <button
                        onClick={() => setLessonStudyMode('listening')}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                          lessonStudyMode === 'listening'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🎧 Nghe
                      </button>
                      <button
                        onClick={() => setLessonStudyMode('quiz')}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                          lessonStudyMode === 'quiz'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🎯 Luyện tập
                      </button>
                    </div>
                  </div>

                  {isLoadingLessonWords ? (
                    <div className="bg-white p-16 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-2xs">
                      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {lessonStudyMode === 'list' && (
                        <LessonWordList
                          words={lessonData.words}
                          onNavigateToKanji={onNavigateToKanji}
                          onStartFlashcard={() => setLessonStudyMode('flashcard')}
                          onStartQuiz={() => setLessonStudyMode('quiz')}
                          onStartListening={() => setLessonStudyMode('listening')}
                        />
                      )}
                      
                      {lessonStudyMode === 'flashcard' && (
                        <LessonFlashcard
                          lessonTitle={lessonData.lessonTitle || `Bài ${lessonData.lesson}`}
                          topicTitle={lessonData.topic}
                          words={lessonData.words}
                          onBack={() => setLessonStudyMode('list')}
                          onNavigateToKanji={onNavigateToKanji}
                        />
                      )}

                      {lessonStudyMode === 'listening' && (
                        <LessonListeningExercise
                          words={lessonData.words}
                          lessonTitle={lessonData.lessonTitle || `Bài ${lessonData.lesson}`}
                          onBack={() => setLessonStudyMode('list')}
                        />
                      )}

                      {lessonStudyMode === 'quiz' && (
                        <LessonPracticeHub
                          lessonTitle={`${lessonData.lessonTitle || `Bài ${lessonData.lesson}`} (${lessonData.topic})`}
                          words={lessonData.words}
                          onBack={() => setLessonStudyMode('list')}
                          onNavigateToFlashcard={() => setLessonStudyMode('flashcard')}
                          onNavigateToListening={() => setLessonStudyMode('listening')}
                          onNavigateToKanji={onNavigateToKanji}
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-16 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-400 text-center shadow-2xs">
                  <FolderOpen className="w-12 h-12 stroke-[1.2] text-slate-300" />
                  <p className="text-xs font-medium">
                    Chọn một danh mục bên trái để bắt đầu học
                  </p>
                </div>
              )}
            </div>
        </div>
      )}

      {/* ================= CHẾ ĐỘ 2: TRA TỪ ĐIỂN NHANH ================= */}
      {mainTab === 'dictionary' && (
        <div className="flex flex-col gap-6">
          <VocabSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLevel={searchLevel}
            onLevelChange={setSearchLevel}
            selectedLesson={searchLesson}
            onLessonChange={setSearchLesson}
            selectedPos={searchPos}
            onPosChange={setSearchPos}
            totalResults={dictTotal}
            onSelectSuggestion={(item) =>
              handleSelectDictItem({
                id: item.id,
                word: item.word,
                reading: item.reading,
                romaji: item.romaji || null,
                hanViet: item.hanViet,
                meaningVi: item.meaningVi,
                jlptLevel: item.jlptLevel,
                lesson: item.lesson ?? null,
                partOfSpeech: item.partOfSpeech,
                pitchAccent: item.pitchAccent
              })
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <VocabCardList
                items={dictList}
                selectedId={dictSelected?.id || null}
                onSelectItem={handleSelectDictItem}
                isLoading={isLoadingDictList}
              />
            </div>

            <div className="lg:col-span-7 flex flex-col gap-4">
              {isLoadingDictDetail ? (
                <div className="bg-white p-16 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-2xs">
                  <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-600">
                    Đang phân tích chi tiết từ vựng & Hán tự...
                  </p>
                </div>
              ) : dictDetail ? (
                <VocabDetailCard data={dictDetail} onNavigateToKanji={onNavigateToKanji} />
              ) : (
                <div className="bg-white p-16 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-400 text-center">
                  <BookOpen className="w-12 h-12 stroke-[1.2] text-slate-300" />
                  <p className="text-xs font-medium">
                    Chọn một từ vựng bên trái hoặc nhập từ khoá để tra cứu
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

