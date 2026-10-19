'use client';



import { useAuth } from '../../context/AuthContext';
import { NotebookApi } from '../personal/notebook.api';
import React, { useState, useMemo, useEffect } from 'react';

import {

  GraduationCap,

  Search,

  BookOpen,

  Volume2,

  Sparkles,

  ArrowRight,

  Filter,

  CheckCircle2,

  Bookmark,

  Layers,

  Award,

  RotateCw,

  ChevronRight,

  ChevronLeft,

  HelpCircle,

  Clock,

  RotateCcw,

  Folder,

  FolderOpen,

  FileText,

  Compass

} from 'lucide-react';

import { ComprehensiveQuizDashboard, CompQuizQuestion } from '../shared/ComprehensiveQuizDashboard';

import { GrammarMasterItem, GrammarStudyMode, JLPTLevel, GrammarLessonFolder } from './grammar.types';

import { FULL_GRAMMAR_DATABASE, GRAMMAR_CATEGORIES, GRAMMAR_LESSON_FOLDERS } from './grammar.data';

import { GrammarDetailView } from './GrammarDetailView';

import { GrammarDetailModal } from '../reading/GrammarDetailModal';

import { ReadingGrammarItem, DetailedGrammarInfo } from '../reading/reading.types';

import { ReadingApi } from '../reading/reading.api';



interface GrammarStudioProps {

  onNavigateToReading?: () => void;

}





const generateGrammarReview = (expandedQuizzes: any[], count: number): CompQuizQuestion[] => {

  const generated: CompQuizQuestion[] = [];

  const pool = [...expandedQuizzes];

  for (let i = pool.length - 1; i > 0; i--) {

     const j = Math.floor(Math.random() * (i + 1));

     [pool[i], pool[j]] = [pool[j], pool[i]];

  }

  for(let i=0; i<count; i++) {

     const q = pool[i % pool.length];

     generated.push({

         id: q.id + '-' + i,

         question: q.question,

         subText: q.questionVi,

         correctAnswer: q.options[q.correctIndex],

         options: q.options,

         explanation: q.explanation || 'Không có giải thích',

         itemId: q.grammar?.id || q.id

     });

  }

  return generated;

};



export const GrammarStudio: React.FC<GrammarStudioProps> = ({ onNavigateToReading }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');

  const [selectedFolderId, setSelectedFolderId] = useState<string>('minna-01');

  const [selectedItemId, setSelectedItemId] = useState<string>(FULL_GRAMMAR_DATABASE[0]?.id || '');

  const [searchTerm, setSearchTerm] = useState<string>('');

  const [studyMode, setStudyMode] = useState<GrammarStudyMode>('dictionary');

  const [bookmarkedIds, setBookmarkedIds] = useState<{ [id: string]: boolean }>({});



  // Flashcard mode state

  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);

  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);



  // Quiz mode state

  const [quizAnswers, setQuizAnswers] = useState<{ [id: string]: number }>({});

  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  

  const [showTranslations, setShowTranslations] = useState<boolean>(false);



  // Modal AI chuyên sâu

  const [selectedGrammarForModal, setSelectedGrammarForModal] = useState<ReadingGrammarItem | null>(null);

  const [detailedGrammarInfo, setDetailedGrammarInfo] = useState<DetailedGrammarInfo | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);



  // Load saved bookmarks from localStorage

  useEffect(() => {
    if (!isAuthenticated) {
      setBookmarkedIds({});
      return;
    }
    NotebookApi.getItems({ itemType: 'GRAMMAR' })
      .then(items => {
        const map: Record<string, boolean> = {};
        items.forEach(item => {
          const found = FULL_GRAMMAR_DATABASE.find(g => g.grammarPoint === item.title);
          if (found) {
            map[found.id] = true;
          }
        });
        setBookmarkedIds(map);
      })
      .catch(console.warn);
  }, [isAuthenticated, FULL_GRAMMAR_DATABASE]);



  const handleToggleBookmark = (item: GrammarMasterItem) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    const isBookmarked = !!bookmarkedIds[item.id];
    
    // Optimistic update
    setBookmarkedIds((prev) => ({ ...prev, [item.id]: !isBookmarked }));

    if (!isBookmarked) {
      NotebookApi.createItem({
        itemType: 'GRAMMAR',
        title: item.grammarPoint,
        meaningVi: item.meaningVi,
        level: item.level,
        structure: item.structure,
        exampleJp: item.examples[0]?.japanese || '',
        exampleVi: item.examples[0]?.vietnamese || ''
      }).catch(e => {
        console.warn('Lỗi lưu ngữ pháp:', e);
        setBookmarkedIds((prev) => ({ ...prev, [item.id]: false }));
      });
    } else {
      NotebookApi.deleteItemByTitle('GRAMMAR', item.grammarPoint).catch(e => {
        console.warn('Lỗi xóa ngữ pháp:', e);
        setBookmarkedIds((prev) => ({ ...prev, [item.id]: true }));
      });
    }
  };

  // Danh sách các thư mục bài học thuộc level đang chọn

  

  const currentLevelFolders = useMemo(() => {

    const folders = GRAMMAR_LESSON_FOLDERS.filter((f) => f.level === selectedLevel);

    const withReviews: any[] = [];

        

      const chunks: any[][] = [];

      let currentChunk: any[] = [];

      for (let i = 0; i < folders.length; i++) {

          currentChunk.push(folders[i]);

          if (currentChunk.length === 3) {

              chunks.push(currentChunk);

              currentChunk = [];

          }

      }

      if (currentChunk.length > 0) {

          if (chunks.length > 0 && currentChunk.length < 3) {

              chunks[chunks.length - 1].push(...currentChunk);

          } else {

              chunks.push(currentChunk);

          }

      }



      let reviewBatch = 1;

      for (const chunk of chunks) {

          let accumulatedGrammarIds: string[] = [];

          for (const folder of chunk) {

              withReviews.push(folder);

              if (folder.grammarIds) {

                  accumulatedGrammarIds.push(...folder.grammarIds);

              }

          }

          

          const startFolder = chunk[0];

          const endFolder = chunk[chunk.length - 1];

          

          const getChNum = (t: string) => {

              const match = t.match(/(Bài \d+|Chương \d+(?:\.\d+)?)/);

              return match ? match[1] : t.split(':')[0].trim();

          };

          const startNum = getChNum(startFolder.title);

          const endNum = getChNum(endFolder.title);

          

          const titleLabel = startNum === endNum ? startNum : startNum + ' - ' + endNum;

          

          withReviews.push({

              id: `review-${selectedLevel}-${reviewBatch}`,

              level: selectedLevel,

              curriculum: folders[0]?.curriculum,

              title: `🌟 ÔN TẬP TỔNG HỢP (${titleLabel})`,

              description: `Kiểm tra tổng hợp các ngữ pháp đã học từ ${titleLabel}.`,

              grammarIds: [...accumulatedGrammarIds],

              isReview: true

          });

          reviewBatch++;

      }

      

      withReviews.push({

        id: `review-${selectedLevel}-final`,

        level: selectedLevel,

        curriculum: folders[0]?.curriculum,

        title: `🎓 KIỂM TRA CUỐI KHÓA (${selectedLevel})`,

        description: `Bài kiểm tra đánh giá toàn diện năng lực ngữ pháp ${selectedLevel}.`,

        grammarIds: folders.flatMap(f => f.grammarIds || []),

        isReview: true,

        isFinal: true

      });

      

      return withReviews;

  }, [selectedLevel]);





  // Tự động chọn thư mục và mẫu ngữ pháp đầu tiên khi đổi Level

  useEffect(() => {

    if (currentLevelFolders.length > 0) {

      const folderExists = currentLevelFolders.some((f) => f.id === selectedFolderId);

      if (!folderExists) {

        const firstFolder = currentLevelFolders[0];

        setSelectedFolderId(firstFolder.id);

        const firstItems = FULL_GRAMMAR_DATABASE.filter((g) => g.lessonId === firstFolder.id);

        if (firstItems.length > 0) {

          setSelectedItemId(firstItems[0].id);

        }

      }

    }

  }, [selectedLevel, currentLevelFolders, selectedFolderId]);



  // Lọc danh sách ngữ pháp theo level, folder hoặc từ khóa tìm kiếm

  const filteredGrammars = useMemo(() => {

    const q = searchTerm.trim().toLowerCase();



    // Nếu có tìm kiếm: tìm xuyên suốt toàn bộ database

    if (q) {

      return FULL_GRAMMAR_DATABASE.filter((g) => {

        return (

          g.grammarPoint.toLowerCase().includes(q) ||

          g.reading.toLowerCase().includes(q) ||

          g.romaji.toLowerCase().includes(q) ||

          g.meaningVi.toLowerCase().includes(q) ||

          g.structure.toLowerCase().includes(q) ||

          g.lessonTitle.toLowerCase().includes(q)

        );

      });

    }



    // Nếu không tìm kiếm: lấy các mẫu của thư mục bài học đang chọn

    let items = FULL_GRAMMAR_DATABASE.filter((g) => g.lessonId === selectedFolderId);



    // Nếu thư mục đó chưa có mẫu ngữ pháp chi tiết, lấy các mẫu của level đó để luôn có nội dung học tập

    if (items.length === 0) {

      items = FULL_GRAMMAR_DATABASE.filter((g) => g.level === selectedLevel);

    }



    return items;

  }, [selectedFolderId, selectedLevel, searchTerm]);



  // Thư mục hiện tại đang chọn

  

  const expandedQuizzes = useMemo(() => {

    const quizzes: any[] = [];

    filteredGrammars.forEach((g) => {

      if (g.quickQuiz) {

        quizzes.push({

          id: `${g.id}-main`,

          grammar: g,

          question: g.quickQuiz.question,

          questionVi: g.quickQuiz.questionVi,

          options: g.quickQuiz.options,

          correctIndex: g.quickQuiz.correctIndex,

          explanation: g.quickQuiz.explanation,

        });

      }

      if (g.examples && g.examples.length > 0) {

        let added = 0;

        for (let i = 0; i < g.examples.length && added < 2; i++) {

          const ex = g.examples[i];

          if (ex.japanese.includes(g.grammarPoint)) {

            const q = ex.japanese.replace(g.grammarPoint, '(____)');

            const validDistractors = filteredGrammars

              .filter((other) => other.id !== g.id)

              .map((other) => other.grammarPoint);

            const shuffledDistractors = validDistractors.sort(() => 0.5 - Math.random()).slice(0, 3);

            const options = [g.grammarPoint, ...shuffledDistractors].sort(() => 0.5 - Math.random());

            const correctIndex = options.indexOf(g.grammarPoint);

            quizzes.push({

              id: `${g.id}-ex-${i}`,

              grammar: g,

              question: q,

              questionVi: ex.vietnamese,

              options: options,

              correctIndex: correctIndex,

              explanation: `Ví dụ: ${ex.japanese} => ${ex.vietnamese}`,

            });

            added++;

          }

        }

      }

    });

    return quizzes.sort(() => 0.5 - Math.random());

  }, [filteredGrammars]);



  const activeFolder = useMemo(() => {

    return (

      currentLevelFolders.find((f) => f.id === selectedFolderId) ||

      currentLevelFolders[0]

    );

  }, [currentLevelFolders, selectedFolderId]);



  // Mẫu ngữ pháp hiện tại đang hiển thị chi tiết

  const activeItem = useMemo(() => {

    return (

      filteredGrammars.find((g) => g.id === selectedItemId) ||

      filteredGrammars[0] ||

      FULL_GRAMMAR_DATABASE[0]

    );

  }, [filteredGrammars, selectedItemId]);



  // Cập nhật selectedItemId nếu item hiện tại không có trong danh sách lọc

  useEffect(() => {

    if (filteredGrammars.length > 0 && !filteredGrammars.some((g) => g.id === selectedItemId)) {

      setSelectedItemId(filteredGrammars[0].id);

    }

  }, [filteredGrammars, selectedItemId]);



  

  // Reset quiz state when changing folders or search

  useEffect(() => {

    setQuizSubmitted(false);

    setQuizAnswers({});

  }, [selectedFolderId, selectedLevel, searchTerm]);



  // Phát âm Web Speech API

  const speakText = (text: string) => {

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text.replace(/[〜~]/g, ''));

      utterance.lang = 'ja-JP';

      utterance.rate = 0.9;

      window.speechSynthesis.speak(utterance);

    }

  };



  // Mở modal phân tích chuyên sâu

  const handleOpenAiModal = async (item: GrammarMasterItem) => {

    const readingItem: ReadingGrammarItem = {

      id: item.id,

      articleId: 'global-grammar',

      grammarPoint: item.grammarPoint,

      level: item.level,

      meaningVi: item.meaningVi,

      excerpt: item.examples[0]?.japanese || item.grammarPoint

    };



    setSelectedGrammarForModal(readingItem);

    setIsModalOpen(true);

    setIsModalLoading(true);



    try {

      const res = await ReadingApi.explainGrammar(

        item.grammarPoint,

        item.examples[0]?.japanese || '',

        item.level

      );

      setDetailedGrammarInfo(res);

    } catch {

      setDetailedGrammarInfo({

        grammarPoint: item.grammarPoint,

        level: item.level,

        meaningVi: item.meaningVi,

        structure: item.structure,

        explanation: item.nuance,

        excerpt: item.examples[0]?.japanese || '',

        examples: item.examples.map((ex) => ({

          japanese: ex.japanese,

          reading: ex.reading || ex.japanese,

          vietnamese: ex.vietnamese

        }))

      });

    } finally {

      setIsModalLoading(false);

    }

  };



  // Xáo trộn thứ tự các lựa chọn trắc nghiệm theo Fisher-Yates ngẫu nhiên

  const getShuffledQuizOptions = (quiz: any) => {

    const opts = quiz.options.map((text: string, idx: number) => {

      const isMeaningful = quiz.optionsVi && quiz.optionsVi[idx] && !quiz.optionsVi[idx].toLowerCase().includes('lựa chọn') && !quiz.optionsVi[idx].toLowerCase().includes('phương án');

      return {

        text,

        textVi: isMeaningful ? quiz.optionsVi[idx] : undefined,

        isCorrect: idx === quiz.correctIndex,

        originalIndex: idx

      };

    });

    return opts;

  };



  const levelItemCounts = useMemo(() => {

    const counts: Record<string, number> = {};

    FULL_GRAMMAR_DATABASE.forEach((item) => {

      counts[item.level] = (counts[item.level] || 0) + 1;

    });

    return counts;

  }, []);



  const levelConfigs: Array<{ id: JLPTLevel; label: string; sub: string; badge: string }> = useMemo(() => [

    { id: 'N5', label: 'JLPT N5', sub: 'Minna Sơ cấp I (Bài 1 - 25)', badge: `25 Bài • ${levelItemCounts['N5'] || 0} mẫu` },

    { id: 'N4', label: 'JLPT N4', sub: 'Minna Sơ cấp II (Bài 26 - 50)', badge: `25 Bài • ${levelItemCounts['N4'] || 0} mẫu` },

    { id: 'N3', label: 'JLPT N3', sub: 'Shinkanzen & Sou Matome N3', badge: `6 CĐ • ${levelItemCounts['N3'] || 0} mẫu` },

    { id: 'N2', label: 'JLPT N2', sub: 'Shinkanzen Master N2', badge: `5 CĐ • ${levelItemCounts['N2'] || 0} mẫu` },

    { id: 'N1', label: 'JLPT N1', sub: 'Shinkanzen Master N1', badge: `4 CĐ • ${levelItemCounts['N1'] || 0} mẫu` }

  ], [levelItemCounts]);



  return (

    <div className="flex flex-col gap-6">

      {/* 1. Header Banner Phân Hệ Ngữ Pháp */}

      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 rounded-2xl p-6 lg:p-8 text-white shadow-md relative overflow-hidden">

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="space-y-2">

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">

              <GraduationCap className="w-4 h-4 text-amber-300" />

              <span>Cây Thư Mục Giáo Trình Minna 50 Bài & Shinkanzen N3-N1</span>

            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">

              Hệ Thống Ngữ Pháp Theo Thư Mục Giáo Trình Chuẩn

            </h1>

            <p className="text-sm text-white/80 max-w-xl">

              N5 - N4 phân loại theo 50 bài học Minna no Nihongo. N3 - N1 phân chia theo các chuyên đề Shinkanzen Master trọng tâm đề thi JLPT.

            </p>

          </div>



          {/* Chế độ học tập */}

          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shrink-0">

            <button

              onClick={() => setStudyMode('dictionary')}

              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${

                studyMode === 'dictionary'

                  ? 'bg-white text-indigo-800 shadow-xs'

                  : 'text-white/80 hover:text-white hover:bg-white/10'

              }`}

            >

              <Folder className="w-3.5 h-3.5" />

              <span>Duyệt Thư Mục</span>

            </button>



            <button

              onClick={() => {

                setStudyMode('flashcard');

                setCurrentFlashcardIndex(0);

                setIsCardFlipped(false);

              }}

              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${

                studyMode === 'flashcard'

                  ? 'bg-white text-indigo-800 shadow-xs'

                  : 'text-white/80 hover:text-white hover:bg-white/10'

              }`}

            >

              <RotateCw className="w-3.5 h-3.5" />

              <span>Flashcard</span>

            </button>



            <button

              onClick={() => {

                setStudyMode('quiz');

                setQuizAnswers({});

                setQuizSubmitted(false);

              }}

              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${

                studyMode === 'quiz'

                  ? 'bg-white text-indigo-800 shadow-xs'

                  : 'text-white/80 hover:text-white hover:bg-white/10'

              }`}

            >

              <Award className="w-3.5 h-3.5" />

              <span>Luyện Trắc Nghiệm</span>

            </button>

          </div>

        </div>

      </div>



      {/* 2. Thanh Chọn Cấp Độ & Giáo Trình */}

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">

          {levelConfigs.map((lvl) => {

            const isActive = selectedLevel === lvl.id;



            return (

              <button

                key={lvl.id}

                onClick={() => {

                  setSelectedLevel(lvl.id);

                  setSearchTerm('');

                }}

                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${

                  isActive

                    ? 'bg-indigo-600 text-white shadow-xs'

                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'

                }`}

              >

                <span>{lvl.label}</span>

                <span

                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${

                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'

                  }`}

                >

                  {lvl.badge}

                </span>

              </button>

            );

          })}

        </div>



        {/* Ô tìm kiếm thông minh */}

        <div className="relative flex-1 max-w-xs">

          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input

            type="text"

            value={searchTerm}

            onChange={(e) => setSearchTerm(e.target.value)}

            placeholder="Tìm theo bài học, cấu trúc, nghĩa..."

            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"

          />

        </div>

      </div>



      {/* ========================================================= */}

      {/* 3. CHẾ ĐỘ 1: DUYỆT THƯ MỤC BÀI HỌC (FOLDER TREE EXPLORER)  */}

      {/* ========================================================= */}

      {studyMode === 'dictionary' && (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* CỘT TRÁI (4 cột): Cây thư mục bài học */}

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col gap-2 max-h-[820px] overflow-y-auto sticky top-[80px]">

            <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2">

              <div className="flex items-center gap-1.5 text-indigo-700 font-bold">

                <FolderOpen className="w-4 h-4 text-indigo-600" />

                <span>

                  {selectedLevel === 'N5'

                    ? 'Minna no Nihongo I (Bài 1 - 25)'

                    : selectedLevel === 'N4'

                    ? 'Minna no Nihongo II (Bài 26 - 50)'

                    : `Shinkanzen Master ${selectedLevel}`}

                </span>

              </div>

              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">

                {currentLevelFolders.length} thư mục

              </span>

            </div>



            {/* Danh sách các Thư Mục Bài Học */}

            <div className="flex flex-col gap-1.5 mt-1">

              {currentLevelFolders.map((folder) => {

                const isSelectedFolder = folder.id === selectedFolderId;

                const itemsInThisFolder = FULL_GRAMMAR_DATABASE.filter((g) => folder.isReview ? folder.grammarIds.includes(g.id) : g.lessonId === folder.id);



                return (

                  <div key={folder.id} className="flex flex-col">

                    {/* Thư mục cha */}

                    <button

                      onClick={() => {

                        setSelectedFolderId(folder.id);

                        setSearchTerm('');

                        if (itemsInThisFolder.length > 0) {

                          setSelectedItemId(itemsInThisFolder[0].id);

                        }

                      }}

                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${

                        isSelectedFolder

                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-black shadow-xs'

                          : folder.isReview ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900 font-extrabold shadow-sm' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-bold'

                      }`}

                    >

                      <div className="flex items-center gap-2.5 min-w-0">

                        {isSelectedFolder ? (

                          <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />

                        ) : (

                          <Folder className="w-4 h-4 text-slate-500 shrink-0" />

                        )}

                        <span className="text-xs truncate">{folder.title}</span>

                      </div>



                      <span

                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${

                          isSelectedFolder

                            ? 'bg-indigo-600 text-white'

                            : 'bg-slate-200 text-slate-700'

                        }`}

                      >

                        {itemsInThisFolder.length > 0 ? `${itemsInThisFolder.length} mẫu` : 'Minna'}

                      </span>

                    </button>



                    {/* Danh sách các mẫu ngữ pháp bên trong thư mục (nếu đang được mở) */}

                    {isSelectedFolder && itemsInThisFolder.length > 0 && (

                      <div className="pl-4 pr-1 py-1.5 flex flex-col gap-1 border-l-2 border-indigo-300 ml-4 my-1">

                        {itemsInThisFolder.map((gItem) => {

                          const isItemSelected = gItem.id === activeItem.id;

                          return (

                            <button

                              key={gItem.id}

                              onClick={() => setSelectedItemId(gItem.id)}

                              className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${

                                isItemSelected

                                  ? 'bg-indigo-600 text-white font-black shadow-xs'

                                  : 'text-slate-800 font-bold hover:bg-indigo-50 hover:text-indigo-950'

                              }`}

                            >

                              <div className="flex items-center gap-2 min-w-0">

                                <FileText className={`w-3 h-3 shrink-0 ${isItemSelected ? 'text-white' : 'text-slate-500'}`} />

                                <span className="font-japanese truncate">{gItem.grammarPoint}</span>

                              </div>

                              <span className={`text-[10px] truncate max-w-[110px] ml-1 font-medium ${isItemSelected ? 'text-indigo-100' : 'text-slate-600'}`}>

                                {gItem.meaningVi}

                              </span>

                            </button>

                          );

                        })}

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </div>



                    {/* CỘT PHẢI (8 cột): Màn hình chi tiết toàn diện */}

            

            <div className="lg:col-span-8 flex flex-col gap-4">

              {activeFolder?.isReview ? (

                   <ComprehensiveQuizDashboard 

                     title={activeFolder.title}

                     topic={activeFolder.description || 'Ôn tập tổng hợp ngữ pháp'}

                     totalItems={activeFolder.grammarIds.length}

                     maxQuestions={activeFolder.grammarIds.length * (activeFolder.isFinal ? 7 : 5)}

                     onGenerateQuestions={(cnt) => {

                        const scopedQuizzes = expandedQuizzes.filter((q: any) => activeFolder.grammarIds.includes(q.grammar.id));

                        return generateGrammarReview(scopedQuizzes, cnt);

                     }}

                     onBack={() => {

                        const firstStandard = currentLevelFolders.find(f => !f.isReview);

                        if (firstStandard) setSelectedFolderId(firstStandard.id);

                     }}

                   />

              ) : (

                <>

                {/* Breadcrumb */}

            {activeFolder && (

              <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-2xs flex items-center justify-between gap-3 text-xs">

                <div className="flex items-center gap-2 text-slate-500 font-medium">

                  <span className="font-bold text-indigo-700">{activeFolder.curriculumTitle}</span>

                  <span>/</span>

                  <span className="text-slate-800 font-semibold">{activeFolder.title}</span>

                  {activeItem && (

                    <>

                      <span>/</span>

                      <span className="font-japanese font-bold text-indigo-900">{activeItem.grammarPoint}</span>

                    </>

                  )}

                </div>



                <div className="flex items-center gap-1 shrink-0">

                  <button

                    onClick={() => {

                      const idx = currentLevelFolders.findIndex((f) => f.id === selectedFolderId);

                      if (idx > 0) setSelectedFolderId(currentLevelFolders[idx - 1].id);

                    }}

                    disabled={currentLevelFolders.findIndex((f) => f.id === selectedFolderId) === 0}

                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 transition cursor-pointer"

                    title="Bài trước"

                  >

                    <ChevronLeft className="w-3.5 h-3.5" />

                  </button>

                  <button

                    onClick={() => {

                      const idx = currentLevelFolders.findIndex((f) => f.id === selectedFolderId);

                      if (idx < currentLevelFolders.length - 1) setSelectedFolderId(currentLevelFolders[idx + 1].id);

                    }}

                    disabled={currentLevelFolders.findIndex((f) => f.id === selectedFolderId) === currentLevelFolders.length - 1}

                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 transition cursor-pointer"

                    title="Bài tiếp theo"

                  >

                    <ChevronRight className="w-3.5 h-3.5" />

                  </button>

                </div>

              </div>

            )}



            {/* Chi tiết mẫu ngữ pháp */}

            {activeItem ? (

              <GrammarDetailView

                item={activeItem}

                isBookmarked={!!bookmarkedIds[activeItem.id]}

                onToggleBookmark={handleToggleBookmark}

                onOpenAiAnalysis={handleOpenAiModal}

                onNavigateToReading={onNavigateToReading}

              />

            ) : (

              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">

                Hãy chọn một bài học ở thư mục bên trái để bắt đầu học tập.

              </div>

            )}

            </>

            )}

          </div>

        </div>

      )}



      {/* ========================================================= */}

      {/* 4. CHẾ ĐỘ 2: THẺ GHI NHỚ LẬT MẶT (FLASHCARD SRS VIEW)      */}

      {/* ========================================================= */}

      {studyMode === 'flashcard' && filteredGrammars.length > 0 && (

        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

          <div className="flex items-center justify-between text-xs text-slate-500">

            <span>Bấm vào thẻ để lật qua lại giữa Công thức và Ý nghĩa</span>

            <span className="font-bold text-indigo-600">

              Thẻ {currentFlashcardIndex + 1} / {filteredGrammars.length}

            </span>

          </div>



          {(() => {

            const card = filteredGrammars[currentFlashcardIndex];

            if (!card) return null;



            return (

              <div

                onClick={() => setIsCardFlipped(!isCardFlipped)}

                className="bg-white rounded-3xl border-2 border-indigo-200/80 p-8 shadow-md hover:shadow-xl transition-all cursor-pointer min-h-[340px] flex flex-col justify-between select-none relative group"

              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-black">

                      {card.level}

                    </span>

                    <span className="text-xs text-slate-400">{card.lessonTitle}</span>

                  </div>

                  <div className="flex items-center gap-1 text-slate-400 text-xs">

                    <RotateCw className="w-3.5 h-3.5" />

                    <span>Lật xem {isCardFlipped ? 'công thức' : 'ý nghĩa & ví dụ'}</span>

                  </div>

                </div>



                {!isCardFlipped ? (

                  <div className="my-6 text-center space-y-3">

                    <h2 className="text-3xl lg:text-4xl font-black font-japanese text-slate-900 tracking-tight">

                      {card.grammarPoint}

                    </h2>

                    <p className="text-sm font-mono text-indigo-600 font-bold">

                      {card.structure}

                    </p>

                    <p className="text-xs text-slate-400">

                      (Nhấp để xem nghĩa tiếng Việt & câu ví dụ)

                    </p>

                  </div>

                ) : (

                  <div className="my-4 space-y-4 animate-in fade-in duration-150">

                    <div className="space-y-1">

                      <div className="text-base font-bold text-indigo-950">

                        {card.meaningVi}

                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">

                        {card.nuance}

                      </p>

                    </div>



                    {card.examples[0] && (

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">

                        <div className="font-japanese font-bold text-slate-900 flex items-center justify-between">

                          <span>{card.examples[0].japanese}</span>

                          <button

                            onClick={(e) => {

                              e.stopPropagation();

                              speakText(card.examples[0].japanese);

                            }}

                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"

                          >

                            <Volume2 className="w-3.5 h-3.5" />

                          </button>

                        </div>

                        <p className="text-slate-500 italic text-[11px]">

                          {card.examples[0].vietnamese}

                        </p>

                      </div>

                    )}

                  </div>

                )}



                <div className="flex items-center justify-between pt-4 border-t border-slate-100">

                  <button

                    onClick={(e) => {

                      e.stopPropagation();

                      speakText(card.grammarPoint);

                    }}

                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"

                  >

                    <Volume2 className="w-4 h-4" />

                    <span>Nghe phát âm</span>

                  </button>



                  <button

                    onClick={(e) => {

                      e.stopPropagation();

                      handleToggleBookmark(card);

                    }}

                    className="text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"

                  >

                    <Bookmark

                      className={`w-4 h-4 ${bookmarkedIds[card.id] ? 'fill-amber-500 text-amber-500' : ''}`}

                    />

                  </button>

                </div>

              </div>

            );

          })()}



          <div className="flex items-center justify-between">

            <button

              disabled={currentFlashcardIndex === 0}

              onClick={() => {

                setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));

                setIsCardFlipped(false);

              }}

              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"

            >

              <ChevronLeft className="w-4 h-4" />

              <span>Thẻ trước</span>

            </button>



            <button

              disabled={currentFlashcardIndex === filteredGrammars.length - 1}

              onClick={() => {

                setCurrentFlashcardIndex((prev) => Math.min(filteredGrammars.length - 1, prev + 1));

                setIsCardFlipped(false);

              }}

              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"

            >

              <span>Thẻ tiếp theo</span>

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      )}



      {/* ========================================================= */}

      {/* 5. CHẾ ĐỘ 3: THỬ THÁCH TRẮC NGHIỆM (QUIZ CHALLENGE VIEW)    */}

      {/* ========================================================= */}

      {studyMode === 'quiz' && (

        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">

          <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-2xs flex flex-col gap-6">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <div className="flex items-center gap-2">

                <Award className="w-5 h-5 text-amber-500" />

                <h3 className="text-base font-black text-slate-900">

                  Luyện Tập Trắc Nghiệm: {activeFolder?.title || selectedLevel}

                </h3>

              </div>



              {quizSubmitted ? (

                <button

                  onClick={() => {

                    setQuizAnswers({});

                    setQuizSubmitted(false);

                  }}

                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"

                >

                  <RotateCcw className="w-3.5 h-3.5" />

                  <span>Làm lại tất cả</span>

                </button>

              ) : (

                <>

  <label className="flex items-center gap-2 cursor-pointer mr-auto text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">

    <input type="checkbox" checked={showTranslations} onChange={() => setShowTranslations(!showTranslations)} className="w-4 h-4 text-indigo-600 rounded" />

    Hiển thị dịch nghĩa

  </label>

  <button onClick={() => setQuizSubmitted(true)}

                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"

                >

                  <CheckCircle2 className="w-3.5 h-3.5" />

                  <span>Chấm điểm</span>

  </button>

  </>

)}

            </div>



            <div className="flex flex-col gap-8">

              {expandedQuizzes.map((quiz: any, qIdx: number) => {

                    const g = quiz.grammar;

                    const shuffledOpts = getShuffledQuizOptions(quiz);

                    const correctShuffledIdx = shuffledOpts.findIndex((o: any) => o.isCorrect);

                    const userAnswer = quizAnswers[quiz.id];

                    const isCorrect = quizSubmitted && userAnswer === correctShuffledIdx;

                    const isWrong = quizSubmitted && userAnswer !== undefined && !isCorrect;



                    return (

                      <div key={quiz.id} className="space-y-3 pt-4 first:pt-0 border-t first:border-t-0 border-slate-100">

                      <div className="flex items-center gap-2">

                        <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg">

                          Câu {qIdx + 1}

                        </span>

                        <span className="text-xs text-slate-400 font-semibold">

                          [{g.lessonTitle} - {g.grammarPoint}]

                        </span>

                      </div>



                      <div className="space-y-1">

                        <h4 className="text-base font-bold font-japanese text-slate-900">

                          {quiz.question}

                        </h4>

                        {showTranslations && <p className="text-xs text-slate-500 italic">Dịch: {quiz.questionVi}</p>}

                      </div>



                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                        {shuffledOpts.map((opt: any, oIdx: number) => {

                          const isSelected = userAnswer === oIdx;

                          const isAnswerCorrect = opt.isCorrect;



                          let btnStyle = 'bg-white border-slate-200 hover:bg-indigo-50/40';



                          if (quizSubmitted) {

                            if (isAnswerCorrect) {

                              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';

                            } else if (isSelected && !isAnswerCorrect) {

                              btnStyle = 'bg-rose-50 border-rose-400 text-rose-800';

                            }

                          } else if (isSelected) {

                            btnStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold ring-2 ring-indigo-500/20';

                          }



                          return (

                            <button

                              key={oIdx}

                              disabled={quizSubmitted}

                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [quiz.id]: oIdx }))}

                              className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 text-xs transition-all cursor-pointer ${btnStyle}`}

                            >

                              <div className="w-5 h-5 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">

                                {oIdx + 1}

                              </div>

                              <div className="flex-1 min-w-0">

                                <div className="font-semibold">{opt.text}</div>

                                {opt.textVi && (

                                  <div className="text-[10px] text-slate-400 mt-0.5">

                                    {opt.textVi}

                                  </div>

                                )}

                              </div>

                            </button>

                          );

                        })}

                      </div>



                      {quizSubmitted && (

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">

                          <div className="font-bold text-indigo-700">

                            Giải thích (Đáp án đúng: số {correctShuffledIdx + 1}):

                          </div>

                          <p className="text-slate-600">{quiz.explanation}</p>

                        </div>

                      )}

                    </div>

                  );

                })}

            </div>

          </div>

        </div>

      )}



      {/* Modal chi tiết phân tích ngữ pháp AI */}

      <GrammarDetailModal

        isOpen={isModalOpen}

        isLoading={isModalLoading}

        grammar={selectedGrammarForModal}

        detailedInfo={detailedGrammarInfo}

        onSpeak={speakText}

        onClose={() => setIsModalOpen(false)}

      />

    </div>

  );

};

