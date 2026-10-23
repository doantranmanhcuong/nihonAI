'use client';



import { useAuth } from '../../context/AuthContext';
import { NotebookApi } from '../personal/notebook.api';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { apiGateway } from '@/services/api-gateway.client';

import { HandwritingCanvas } from '@/components/kanji/HandwritingCanvas';

import { KanjiDetailCard } from '@/components/kanji/KanjiDetailCard';

import { RadicalGraph } from '@/components/kanji/RadicalGraph';

import { StrokeOrderAnimation } from '@/components/kanji/StrokeOrderAnimation';

import { KanjiCompoundTree } from '@/components/kanji/KanjiCompoundTree';

import { KanjiLookalikes } from '@/components/kanji/KanjiLookalikes';

import { KanjiEmptyState } from '@/components/kanji/KanjiEmptyState';

import { KanjiLevelGrid } from '@/components/kanji/KanjiLevelGrid';

import { KanjiFlashcardView } from '@/components/kanji/KanjiFlashcardView';

import { KanjiQuizView } from '@/components/kanji/KanjiQuizView';

import { ComprehensiveQuizDashboard, CompQuizQuestion } from '../shared/ComprehensiveQuizDashboard';

import { PhoneticShiftModal } from '@/components/kanji/PhoneticShiftModal';

import {

  Search,

  Loader2,

  BookOpen,

  Bookmark,

  PenTool,

  GitCompare,

  FileText,

  Filter,

  X,

  AlertCircle,

  Sparkles,

  Layers,

  Award,

  ChevronRight,

  ChevronLeft,

  Folder,

  FolderOpen,

  Library,

  HelpCircle,

  Volume2,

  Star,

  GraduationCap,

  RotateCw,

  Eye

} from 'lucide-react';



interface KanjiExplorerViewProps {

  initialKanji?: string | null;

  onNavigateToVocab?: () => void;

}



const LEVEL_CURRICULA: Record<

  string,

  { id: string; name: string; tag: string; desc: string }[]

> = {

  N5: [

    {

      id: 'LOOK_AND_LEARN',

      name: 'Kanji Look and Learn',

      tag: 'Hình ảnh & Mẹo nhớ',

      desc: '512 chữ Hán có hình vẽ minh họa chiết tự và câu chuyện liên tưởng'

    },

    {

      id: 'BASIC_KANJI',

      name: 'Basic Kanji Book',

      tag: 'Kinh điển Nhật ngữ',

      desc: 'Giáo trình trường Nhật ngữ bài bản, bám sát bài học Minna'

    }

  ],

  N4: [

    {

      id: 'LOOK_AND_LEARN',

      name: 'Kanji Look and Learn',

      tag: 'Hình ảnh & Mẹo nhớ',

      desc: 'Nối tiếp N5, mẹo nhớ trực quan dễ hiểu và từ vựng thông dụng'

    },

    {

      id: 'BASIC_KANJI',

      name: 'Basic Kanji Book',

      tag: 'Kinh điển Nhật ngữ',

      desc: 'Hán tự sơ trung cấp thực tiễn, vốn từ ghép phong phú'

    }

  ],

  N3: [

    {

      id: 'SOUMATOME',

      name: 'Nihongo Soumatome N3',

      tag: 'Bám sát JLPT',

      desc: 'Phân nhóm theo chủ đề đời sống, kết hợp quy tắc chuyển âm Hán Việt'

    }

  ],

  N2: [

    {

      id: 'SOUMATOME',

      name: 'Nihongo Soumatome N2',

      tag: 'Chủ đề đời sống',

      desc: 'Kanji trung cao cấp theo công việc, xã hội và tin tức'

    },

    {

      id: '500_MON',

      name: '500 Câu Hỏi N2 (500 Mon)',

      tag: 'Luyện đề cấp tốc',

      desc: 'Bẫy âm On/Kun và các chữ Hán tương đồng dễ nhầm lẫn'

    }

  ],

  N1: [

    {

      id: '500_MON',

      name: '500 Câu Hỏi N1 (500 Mon)',

      tag: 'Chinh phục JLPT',

      desc: 'Kanji chuyên sâu, từ vựng học thuật và bài đọc phân loại cao cấp'

    }

  ]

};





const generateKanjiQuestions = (kanjis: any[], count: number): CompQuizQuestion[] => {
  if (!kanjis || kanjis.length === 0) return [];

  const generated: CompQuizQuestion[] = [];

  const pool = [...kanjis];

  for (let i = pool.length - 1; i > 0; i--) {

     const j = Math.floor(Math.random() * (i + 1));

     [pool[i], pool[j]] = [pool[j], pool[i]];

  }



  for (let i = 0; i < count; i++) {

     const k = pool[i % pool.length];

     const others = pool.filter(x => x.character !== k.character).sort(() => Math.random() - 0.5);

     

     const type = Math.floor(Math.random() * 2);

     if (type === 0) {

        const options = [`${k.hanViet} - ${k.meaningVi}`, ...others.slice(0,3).map(x => `${x.hanViet} - ${x.meaningVi}`)].sort(() => Math.random() - 0.5);

        generated.push({

           id: `${k.character}-mean-${i}`,

           question: `Chữ Hán 【${k.character}】 có âm Hán Việt và ý nghĩa là gì?`,

           correctAnswer: `${k.hanViet} - ${k.meaningVi}`,

           options,

           explanation: `【${k.character}】 Hán Việt là ${k.hanViet}, nghĩa là ${k.meaningVi}`,

           itemId: k.character

        });

     } else {

        const kun = k.kunyomi && k.kunyomi !== '-' ? k.kunyomi : k.onyomi;

        const options = [kun, ...others.slice(0,3).map(x => (x.kunyomi && x.kunyomi !== '-' ? x.kunyomi : x.onyomi))].sort(() => Math.random() - 0.5);

        generated.push({

           id: `${k.character}-read-${i}`,

           question: `Cách đọc phổ biến của 【${k.character}】?`,

           subText: `${k.hanViet} - ${k.meaningVi}`,

           correctAnswer: kun,

           options,

           explanation: `【${k.character}】 đọc là ${kun}`,

           itemId: k.character

        });

     }

  }

  return generated;

};



export function KanjiExplorerView({ initialKanji, onNavigateToVocab }: KanjiExplorerViewProps) {
  const { isAuthenticated, openAuthModal } = useAuth();

  // Master Mode: 'directory' (Duyệt Thư Mục & Giáo Trình) | 'flashcard' | 'canvas' (Tra Cứu & Bảng Vẽ) | 'quiz' (Luyện Thi JLPT)

  const [mainTab, setMainTab] = useState<'directory' | 'flashcard' | 'canvas' | 'quiz'>('directory');



  // ================= 1. TRẠNG THÁI GIÁO TRÌNH & THANH DỌC =================

  const [selectedLevel, setSelectedLevel] = useState<string>('N5');

  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('LOOK_AND_LEARN');

  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number>(1);

  const [selectedKanjiChar, setSelectedKanjiChar] = useState<string>(initialKanji || '一');

  const [directorySubMode, setDirectorySubMode] = useState<'detail' | 'flashcard'>('detail');



  const [curriculumSummary, setCurriculumSummary] = useState<any | null>(null);

  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  const [flashcardKanjis, setFlashcardKanjis] = useState<any[]>([]);



  // Chi tiết chữ Hán đang hiển thị ở cột phải

  const [kanjiData, setKanjiData] = useState<any | null>(null);

  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);

  const [bookmarkedKanji, setBookmarkedKanji] = useState<{ [char: string]: boolean }>({});



  // ================= 2. MODAL PHÂN TÍCH CHUYÊN SÂU =================

  const [activeModal, setActiveModal] = useState<'detail' | 'radical' | 'phonetic' | 'stroke' | null>(null);

  const [modalKanji, setModalKanji] = useState<any | null>(null);



  // ================= 3. TRẠNG THÁI TÌM KIẾM =================

  const [searchInput, setSearchInput] = useState<string>('');

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [isSearching, setIsSearching] = useState<boolean>(false);

  const searchRef = useRef<HTMLDivElement | null>(null);



  // ================= 4. TAB BẢNG VẼ TAY & TRA CỨU TỰ DO =================

  const [leftCanvasMode, setLeftCanvasMode] = useState<'canvas' | 'level'>('level');

  const [kanjiList, setKanjiList] = useState<any[]>([]);

  const [activeLevelTab, setActiveLevelTab] = useState<string>('all');

  const [kanjiSubTab, setKanjiSubTab] = useState<'overview' | 'stroke' | 'tree' | 'lookalike'>('overview');



  const levelTabs = [

    { id: 'all', label: 'Tất cả (2.214 chữ)' },

    { id: 'N5', label: 'N5' },

    { id: 'N4', label: 'N4' },

    { id: 'N3', label: 'N3' },

    { id: 'N2', label: 'N2' },

    { id: 'N1', label: 'N1' }

  ];



  const levelConfigs = [

    { id: 'N5', label: 'JLPT N5', sub: 'Kanji Look and Learn & Basic Kanji', badge: '16 Bài • 256 chữ' },

    { id: 'N4', label: 'JLPT N4', sub: 'Kanji Look and Learn & Basic Kanji', badge: '16 Bài • 300 chữ' },

    { id: 'N3', label: 'JLPT N3', sub: 'Nihongo Soumatome N3', badge: '12 CĐ • 650 chữ' },

    { id: 'N2', label: 'JLPT N2', sub: 'Soumatome & 500 Mon N2', badge: '10 CĐ • 550 chữ' },

    { id: 'N1', label: 'JLPT N1', sub: '500 Câu Hỏi N1 (500 Mon)', badge: '8 CĐ • 458 chữ' }

  ];



  // Nạp bookmarks từ LocalStorage

  useEffect(() => {
    if (!isAuthenticated) {
      setBookmarkedKanji({});
      return;
    }
    NotebookApi.getItems({ itemType: 'KANJI' })
      .then(items => {
        const map: Record<string, boolean> = {};
        items.forEach(item => {
          map[item.title] = true;
        });
        setBookmarkedKanji(map);
      })
      .catch(console.warn);
  }, [isAuthenticated]);



  const handleToggleBookmark = async (char: string, hanViet: string, meaning: string) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    
    const isBookmarked = !!bookmarkedKanji[char];
    
    // Optimistic update
    setBookmarkedKanji((prev) => ({ ...prev, [char]: !isBookmarked }));
    
    if (!isBookmarked) {
      NotebookApi.createItem({
        itemType: 'KANJI',
        title: char,
        reading: hanViet,
        meaningVi: meaning,
        level: selectedLevel || 'N5',
        tags: 'Kanji'
      }).catch(e => {
        console.warn('Lỗi lưu Kanji:', e);
        setBookmarkedKanji((prev) => ({ ...prev, [char]: false }));
      });
    } else {
      NotebookApi.deleteItemByTitle('KANJI', char).catch(e => {
        console.warn('Lỗi xóa Kanji:', e);
        setBookmarkedKanji((prev) => ({ ...prev, [char]: true }));
      });
    }
  };

  // Đồng bộ giáo trình khi đổi Cấp độ

  useEffect(() => {

    const available = LEVEL_CURRICULA[selectedLevel] || [];

    const isCurrentValid = available.some((c) => c.id === selectedCurriculum);

    if (!isCurrentValid && available.length > 0) {

      setSelectedCurriculum(available[0].id);

    }

  }, [selectedLevel]);



  // Tải chi tiết 1 chữ Hán

  const fetchKanjiDetails = useCallback(async (character: string) => {

    if (!character) return;

    try {

      setIsLoadingDetails(true);

      setNotFoundQuery(null);

      const data = await apiGateway.kanji.getDetails(character);

      if (data) {

        setKanjiData(data);

        setSelectedKanjiChar(character);

      }

    } catch (err: any) {

      setKanjiData(null);

      setNotFoundQuery(character);

    } finally {

      setIsLoadingDetails(false);

    }

  }, []);



  // Tải tóm tắt bài học & danh sách Kanji theo Giáo trình và Cấp độ

  useEffect(() => {

    let isMounted = true;

    const loadCurriculumData = async () => {

      try {

        setIsLoadingSummary(true);

        const [sumRes, kanjiRes] = await Promise.all([

          apiGateway.kanji.getCurriculumSummary(selectedCurriculum, selectedLevel),

          apiGateway.kanji.getCurriculumKanjis(selectedCurriculum, selectedLevel, selectedLessonNumber)

        ]);



        if (isMounted) {

          if (sumRes && sumRes.data) {

            setCurriculumSummary(sumRes.data);

            const lessons = sumRes.data.lessons || [];

            if (lessons.length > 0) {

              const currentLessonValid = lessons.find((l: any) => l.lesson === selectedLessonNumber);

              const targetLesson = currentLessonValid || lessons[0];

              if (!currentLessonValid) {

                setSelectedLessonNumber(targetLesson.lesson);

              }



              // Chọn chữ Hán đầu tiên của bài nếu chữ hiện tại không thuộc bài

              if (targetLesson.kanjis && targetLesson.kanjis.length > 0) {

                const isCharInLesson = targetLesson.kanjis.some((k: any) => k.character === selectedKanjiChar);

                if (!isCharInLesson) {

                  const firstChar = targetLesson?.kanjis?.[0]?.character; if (!firstChar) return;

                  setSelectedKanjiChar(firstChar);

                  fetchKanjiDetails(firstChar);

                }

              }

            }

          }

          if (kanjiRes && kanjiRes.data) {

            setFlashcardKanjis(kanjiRes.data);

          }

        }

      } catch (err) {

        console.error('Lỗi khi tải dữ liệu giáo trình:', err);

      } finally {

        if (isMounted) setIsLoadingSummary(false);

      }

    };



    loadCurriculumData();

    return () => {

      isMounted = false;

    };

  }, [selectedCurriculum, selectedLevel, selectedLessonNumber, fetchKanjiDetails]);



  // Nếu có initialKanji từ URL hoặc props

  useEffect(() => {

    if (initialKanji) {

      setSelectedKanjiChar(initialKanji);

      fetchKanjiDetails(initialKanji);

      setMainTab('directory');

    } else {

      fetchKanjiDetails(selectedKanjiChar);

    }

  }, [initialKanji, fetchKanjiDetails]);



  // Tìm kiếm thông minh đa chiều theo thời gian thực

  useEffect(() => {

    const delayDebounceFn = setTimeout(async () => {

      if (searchInput.trim().length > 0) {

        try {

          setIsSearching(true);

          const res = await apiGateway.kanji.search(searchInput.trim());

          if (res && res.results) {

            setSearchResults(res.results);

          }

        } catch (err) {

          console.error('Lỗi khi tìm kiếm:', err);

        } finally {

          setIsSearching(false);

        }

      } else {

        setSearchResults([]);

      }

    }, 150);



    return () => clearTimeout(delayDebounceFn);

  }, [searchInput]);



  // Đóng dropdown tìm kiếm khi click ra ngoài

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {

        setSearchResults([]);

      }

    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);



  // Tải danh sách Kanji theo cấp độ cho bảng vẽ

  const fetchKanjiListByLevel = async (level: string) => {

    try {

      const res = await apiGateway.kanji.getByLevel(level);

      if (res && res.kanjis) {

        setKanjiList(res.kanjis);

      }

    } catch (err) {

      console.error('Lỗi khi tải danh sách level:', err);

    }

  };



  useEffect(() => {

    if (mainTab === 'canvas') {

      fetchKanjiListByLevel(activeLevelTab);

    }

  }, [activeLevelTab, mainTab]);



  // Phát âm chữ Hán

  const speakText = (text: string) => {

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'ja-JP';

    utterance.rate = 0.85;

    window.speechSynthesis.speak(utterance);

  };



  // Điều hướng chữ Hán trước / sau trong cùng bài học

  const activeLessonObj = curriculumSummary?.lessons?.find((l: any) => l.lesson === selectedLessonNumber);

  const lessonKanjis: any[] = activeLessonObj?.kanjis || [];

  const currentKanjiIdx = lessonKanjis.findIndex((k: any) => k.character === selectedKanjiChar);



  const handleNextKanji = () => {

    if (lessonKanjis.length === 0) return;

    const nextIdx = (currentKanjiIdx + 1) % lessonKanjis.length;

    const nextChar = lessonKanjis[nextIdx].character;

    setSelectedKanjiChar(nextChar);

    fetchKanjiDetails(nextChar);

  };



  const handlePrevKanji = () => {

    if (lessonKanjis.length === 0) return;

    const prevIdx = (currentKanjiIdx - 1 + lessonKanjis.length) % lessonKanjis.length;

    const prevChar = lessonKanjis[prevIdx].character;

    setSelectedKanjiChar(prevChar);

    fetchKanjiDetails(prevChar);

  };



  // Phím tắt bàn phím

  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {

      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (mainTab === 'directory' && directorySubMode === 'detail') {

        if (e.key === 'ArrowRight') {

          e.preventDefault();

          handleNextKanji();

        } else if (e.key === 'ArrowLeft') {

          e.preventDefault();

          handlePrevKanji();

        } else if (e.key === 'r' || e.key === 'R') {

          e.preventDefault();

          if (kanjiData) {

            const sound = kanjiData.onyomi !== '—' ? kanjiData.onyomi : kanjiData.kunyomi;

            if (sound) speakText(sound);

          }

        }

      }

    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [mainTab, directorySubMode, lessonKanjis, currentKanjiIdx, kanjiData]);



  // Metadata giáo trình đang chọn

  const availableCurricula = LEVEL_CURRICULA[selectedLevel] || [];

  const currentCurriculumMeta =

    availableCurricula.find((c) => c.id === selectedCurriculum) ||

    availableCurricula[0] || {

      id: 'LOOK_AND_LEARN',

      name: 'Kanji Look and Learn',

      tag: 'Hình ảnh & Mẹo nhớ',

      desc: 'Giáo trình chiết tự hình ảnh'

    };



  const openFlashcardModal = (type: 'detail' | 'radical' | 'phonetic' | 'stroke', kanji: any) => {

    setModalKanji(kanji);

    setActiveModal(type);

  };



  return (

    <div className="flex flex-col gap-6 w-full pb-16">

      {/* 1. Header Banner Phân Hệ Hán Tự - Đồng bộ hoàn toàn với Ngữ Pháp (GrammarStudio) */}

      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 rounded-2xl p-6 lg:p-8 text-white shadow-md relative overflow-hidden">

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="space-y-2">

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">

              <GraduationCap className="w-4 h-4 text-amber-300" />

              <span>Cây Thư Mục Giáo Trình Kanji Look and Learn & Basic Kanji Book</span>

            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">

              Hệ Thống Hán Tự Theo Thư Mục Giáo Trình Chuẩn

            </h1>

            <p className="text-sm text-white/80 max-w-xl">

              N5 - N4 phân loại theo 32 bài học Kanji Look and Learn & Basic Kanji. N3 - N1 phân chia theo Soumatome & 500 Mon trọng tâm đề thi JLPT.

            </p>

          </div>



          {/* 4 Chế độ học tập (Master Mode Switcher) */}

          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shrink-0 flex-wrap sm:flex-nowrap">

            <button

              onClick={() => setMainTab('directory')}

              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${

                mainTab === 'directory'

                  ? 'bg-white text-indigo-800 shadow-xs'

                  : 'text-white/80 hover:text-white hover:bg-white/10'

              }`}

            >

              <Folder className="w-3.5 h-3.5" />

              <span>Duyệt Thư Mục</span>

            </button>



            <button

              onClick={() => setMainTab('flashcard')}

              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${

                mainTab === 'flashcard'

                  ? 'bg-white text-indigo-800 shadow-xs'

                  : 'text-white/80 hover:text-white hover:bg-white/10'

              }`}

            >

              <RotateCw className="w-3.5 h-3.5" />

              <span>Flashcard</span>

            </button>



            <button

              onClick={() => setMainTab('canvas')}

              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${

                mainTab === 'canvas'

                  ? 'bg-white text-indigo-800 shadow-xs'

                  : 'text-white/80 hover:text-white hover:bg-white/10'

              }`}

            >

              <PenTool className="w-3.5 h-3.5" />

              <span>Tra Cứu & Bảng Vẽ</span>

            </button>



            <button

              onClick={() => setMainTab('quiz')}

              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${

                mainTab === 'quiz'

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



      {/* 2. Thanh Chọn Cấp Độ & Tìm Kiếm Thông Minh (Đồng bộ chuẩn Ngữ Pháp) */}

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">

        <div className="grid grid-cols-5 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">

            {levelConfigs.map((lvl) => {

              const isActive = selectedLevel === lvl.id;

              return (

                <button

                  key={lvl.id}

                  onClick={() => setSelectedLevel(lvl.id)}

                  className={`py-2 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold transition-all shrink-0 text-center cursor-pointer sm:px-4 ${

                    isActive

                      ? 'bg-indigo-600 text-white shadow-xs'

                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'

                  }`}

                >

                  {lvl.label.replace('JLPT ', '')}

                </button>

              );

            })}

          </div>



        {/* Ô tìm kiếm thông minh đa chiều */}

        <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm">

          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input

            type="text"

            value={searchInput}

            onChange={(e) => setSearchInput(e.target.value)}

            placeholder="Tìm theo chữ Hán, âm Hán Việt, bài học, nghĩa..."

            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"

          />

          {searchInput && (

            <button

              type="button"

              onClick={() => setSearchInput('')}

              className="p-1 hover:bg-slate-200 rounded-full absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"

            >

              <X className="w-3.5 h-3.5" />

            </button>

          )}



          {/* Gợi ý kết quả tìm kiếm Dropdown */}

          {searchInput.trim().length > 0 && (

            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 max-h-80 overflow-y-auto p-1.5 divide-y divide-slate-100">

              {isSearching ? (

                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">

                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />

                  Đang tìm kiếm trong cơ sở dữ liệu...

                </div>

              ) : searchResults.length > 0 ? (

                <div>

                  {searchResults.map((item) => (

                    <div

                      key={item.character}

                      onClick={() => {

                        fetchKanjiDetails(item.character);

                        setSelectedKanjiChar(item.character);

                        setMainTab('directory');

                        setSearchInput('');

                        setSearchResults([]);

                      }}

                      className="p-2.5 hover:bg-indigo-50/80 rounded-xl cursor-pointer transition-colors flex items-center gap-3 group"

                    >

                      <span className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 min-w-[32px] text-center font-japanese">

                        {item.character}

                      </span>

                      <div className="flex flex-col flex-1 min-w-0">

                        <div className="flex items-center gap-2">

                          <span className="text-xs font-black text-indigo-700">{item.hanViet}</span>

                          <span className="text-[10px] text-slate-400">

                            {item.onyomi !== '—' ? item.onyomi : item.kunyomi}

                          </span>

                        </div>

                        <span className="text-[11px] text-slate-600 font-medium truncate">

                          {item.meaningVi}

                        </span>

                      </div>

                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-md shrink-0">

                        {item.levelTag || item.jlptLevel}

                      </span>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="p-4 text-center text-xs text-slate-500">

                  Không tìm thấy chữ Hán nào phù hợp với "{searchInput}".

                </div>

              )}

            </div>

          )}

        </div>

      </div>



      {/* ========================================================================= */}

      {/* 3. CHẾ ĐỘ 1: DUYỆT THƯ MỤC BÀI HỌC (2 CỘT THANH DỌC CHUẨN NGỮ PHÁP)       */}

      {/* ========================================================================= */}

      {(mainTab === 'directory' || mainTab === 'flashcard') && (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">

          {/* CỘT TRÁI (4 cột): THANH DỌC CÂY THƯ MỤC GIÁO TRÌNH & BÀI HỌC */}

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col gap-2 max-h-[820px] overflow-y-auto sticky top-[80px]">

            {/* Header Thanh Dọc: Giáo trình đang chọn & Bộ chuyển đổi giáo trình */}

            <div className="flex flex-col gap-2 border-b border-slate-100 pb-3">

              <div className="flex items-center justify-between px-1">

                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">

                  <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />

                  <span className="truncate max-w-[190px]">{currentCurriculumMeta.name}</span>

                </div>

                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0">

                  {curriculumSummary ? `${curriculumSummary.totalLessons} bài học` : '16 bài học'}

                </span>

              </div>



              {/* Nếu cấp độ này có nhiều giáo trình (VD: N5/N4 có Look & Learn vs Basic Kanji), hiển thị switcher */}

              {availableCurricula.length > 1 && (

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">

                  {availableCurricula.map((cur) => (

                    <button

                      key={cur.id}

                      onClick={() => {

                        setSelectedCurriculum(cur.id);

                        setSelectedLessonNumber(1);

                      }}

                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate ${

                        selectedCurriculum === cur.id

                          ? 'bg-white text-indigo-700 shadow-xs'

                          : 'text-slate-600 hover:text-slate-900'

                      }`}

                    >

                      {cur.name.replace(/ \(.*\)/, '')}

                    </button>

                  ))}

                </div>

              )}

            </div>



            {/* Danh sách các Thư Mục Bài Học (Folder Tree) */}

            {isLoadingSummary ? (

              <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">

                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />

                <span className="text-xs font-medium">Đang nạp bài học giáo trình...</span>

              </div>

            ) : (

              <div className="flex flex-col gap-1.5 mt-1">

                {curriculumSummary?.lessons?.map((les: any) => {

                  const isSelectedFolder = selectedLessonNumber === les.lesson;

                  const shortTitle = les.title ? les.title.replace(/:.*$/, '').trim() : `Bài ${les.lesson}`;



                  return (

                    <div key={les.lesson} className="flex flex-col">

                      {/* Thư mục cha */}

                      <button

                        onClick={() => {

                          setSelectedLessonNumber(les.lesson);

                          if (les.kanjis && les.kanjis.length > 0) {

                            if (!les.kanjis.some((k: any) => k.character === selectedKanjiChar)) {

                              const firstChar = les?.kanjis?.[0]?.character; if (!firstChar) return;

                              setSelectedKanjiChar(firstChar);

                              fetchKanjiDetails(firstChar);

                            }

                          }

                        }}

                        className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${

                          isSelectedFolder

                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-black shadow-xs'

                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-bold'

                        }`}

                      >

                        <div className="flex items-center gap-2.5 min-w-0">

                          {isSelectedFolder ? (

                            <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />

                          ) : (

                            <Folder className="w-4 h-4 text-slate-500 shrink-0" />

                          )}

                          <span className="text-xs truncate">{shortTitle}</span>

                        </div>



                        <span

                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${

                            isSelectedFolder

                              ? 'bg-indigo-600 text-white'

                              : 'bg-slate-200 text-slate-700'

                          }`}

                        >

                          {les.wordCount} chữ

                        </span>

                      </button>



                      {/* Danh sách các chữ Hán bên trong thư mục (khi đang được mở) */}

                      {isSelectedFolder && les.kanjis && les.kanjis.length > 0 && (

                        <div className="pl-4 pr-1 py-1.5 flex flex-col gap-1 border-l-2 border-indigo-300 ml-4 my-1">

                          {les.kanjis.map((k: any) => {

                            const isItemSelected = k.character === selectedKanjiChar;

                            return (

                              <button

                                key={k.character}

                                onClick={() => {

                                  setSelectedKanjiChar(k.character);

                                  fetchKanjiDetails(k.character);

                                }}

                                className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${

                                  isItemSelected

                                    ? 'bg-indigo-600 text-white font-black shadow-xs'

                                    : 'text-slate-800 font-bold hover:bg-indigo-50 hover:text-indigo-950'

                                }`}

                              >

                                <div className="flex items-center gap-2 min-w-0">

                                  <span className="font-japanese text-sm font-black shrink-0 leading-none">

                                    {k.character}

                                  </span>

                                  <span className="truncate font-extrabold">{k.hanViet}</span>

                                </div>

                                <span

                                  className={`text-[10px] truncate max-w-[110px] ml-1 font-medium ${

                                    isItemSelected ? 'text-indigo-100' : 'text-slate-500'

                                  }`}

                                >

                                  {k.meaningVi}

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

            )}

          </div>

            {/* CỘT PHẢI (8 cột): MÀN HÌNH HỌC TẬP & CHI TIẾT TOÀN DIỆN */}

            <div className="lg:col-span-8 flex flex-col gap-4">

              {mainTab === 'flashcard' ? (

                <div className="animate-in fade-in duration-200">

                  <KanjiFlashcardView

                    kanjis={flashcardKanjis}

                    curriculumName={currentCurriculumMeta.name}

                    level={selectedLevel}

                    lesson={selectedLessonNumber}

                    lessonTitle={`Bài ${selectedLessonNumber}`}

                    onOpenDetail={(k) => openFlashcardModal('detail', k)}

                    onOpenRadicals={(k) => openFlashcardModal('radical', k)}

                    onOpenPhonetic={(k) => openFlashcardModal('phonetic', k)}

                    onOpenStrokeTracing={(k) => openFlashcardModal('stroke', k)}

                  />

                </div>

              ) : activeLessonObj?.isReview ? (

                 <div className="w-full">

                    <ComprehensiveQuizDashboard 

                       title={activeLessonObj.title || 'ÔN TẬP TỔNG HỢP'}

                       topic={activeLessonObj.topic}

                       totalItems={activeLessonObj.wordCount || 0}

                       maxQuestions={(activeLessonObj.wordCount || 0) * (activeLessonObj.isFinal ? 7 : 5)}

                       onGenerateQuestions={(cnt) => {

                           // For kanji, review nodes have kanjis as array inside activeLessonObj (wait, kanji.service.ts returns kanjis: [] for reviews).

                           // If it's empty, we need to fetch them! Wait, getCurriculumKanjis fetches them if we pass lesson ID.

                           // Actually, KanjiExplorerView calls fetchCurriculumKanjis(level, curr, lesson)! So activeLessonObj.kanjis will have the EXACT kanjis!

                           return generateKanjiQuestions(flashcardKanjis, cnt);

                       }}

                       onBack={() => {

                          const firstStandard = Object.values((curriculumSummary?.lessons || [])).find((l: any) => !l.isReview);

                          if (firstStandard) setSelectedLessonNumber((firstStandard as any).lesson);

                       }}

                    />

                 </div>

              ) : (

                <>



            {/* Breadcrumb điều hướng thư mục và chọn xem Chi tiết / Flashcard */}

            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">

              <div className="flex items-center gap-2 text-slate-500 font-medium">

                <span className="font-bold text-indigo-700">{currentCurriculumMeta.name}</span>

                <span>/</span>

                <span className="text-slate-800 font-semibold">Bài {selectedLessonNumber}</span>

                {selectedKanjiChar && (

                  <>

                    <span>/</span>

                    <span className="font-japanese font-black text-indigo-900 text-sm">

                      {selectedKanjiChar}

                    </span>

                    {kanjiData && (

                      <span className="font-bold text-indigo-700">({kanjiData.hanViet})</span>

                    )}

                  </>

                )}

              </div>



              {/* Nút chuyển chế độ Chi Tiết / Flashcard & Mũi tên qua lại */}

              <div className="flex items-center gap-2 shrink-0">

                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">

                  <button

                    onClick={() => setDirectorySubMode('detail')}

                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${

                      directorySubMode === 'detail'

                        ? 'bg-white text-indigo-700 shadow-2xs'

                        : 'text-slate-600 hover:text-slate-900'

                    }`}

                  >

                    <FileText className="w-3.5 h-3.5 inline mr-1" />

                    Chi Tiết

                  </button>

                  <button

                    onClick={() => setDirectorySubMode('flashcard')}

                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${

                      directorySubMode === 'flashcard'

                        ? 'bg-white text-indigo-700 shadow-2xs'

                        : 'text-slate-600 hover:text-slate-900'

                    }`}

                  >

                    <RotateCw className="w-3.5 h-3.5 inline mr-1" />

                    Flashcard

                  </button>

                </div>



                {/* Mũi tên điều hướng câu/chữ trước & tiếp theo */}

                <div className="flex items-center gap-1">

                  <button

                    onClick={handlePrevKanji}

                    disabled={lessonKanjis.length === 0}

                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 transition cursor-pointer"

                    title="Chữ Hán trước (Phím ←)"

                  >

                    <ChevronLeft className="w-3.5 h-3.5" />

                  </button>

                  <span className="text-[11px] font-bold text-slate-500 px-1">

                    {currentKanjiIdx >= 0 ? `${currentKanjiIdx + 1}/${lessonKanjis.length}` : ''}

                  </span>

                  <button

                    onClick={handleNextKanji}

                    disabled={lessonKanjis.length === 0}

                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 transition cursor-pointer"

                    title="Chữ Hán tiếp theo (Phím →)"

                  >

                    <ChevronRight className="w-3.5 h-3.5" />

                  </button>

                </div>

              </div>

            </div>



            {/* Nội dung tương ứng với SubMode */}

            {directorySubMode === 'detail' ? (

              isLoadingDetails ? (

                <div className="bg-white p-20 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3">

                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

                  <p className="text-xs font-bold text-slate-600">Đang nạp chi tiết chữ Hán...</p>

                </div>

              ) : notFoundQuery ? (

                <div className="bg-white p-12 rounded-3xl border border-rose-200 text-center flex flex-col items-center justify-center gap-3">

                  <AlertCircle className="w-8 h-8 text-rose-500" />

                  <h3 className="text-base font-bold text-slate-800">

                    Không tìm thấy chữ "{notFoundQuery}"

                  </h3>

                  <p className="text-xs text-slate-400">Vui lòng chọn chữ Hán khác từ thanh dọc bên trái.</p>

                </div>

              ) : kanjiData ? (

                <div className="flex flex-col gap-4 animate-in fade-in duration-200">

                  {/* Thẻ Chi Tiết Chữ Hán Flagship */}

                  <KanjiDetailCard
                      isBookmarked={!!bookmarkedKanji[kanjiData?.character || ""]}
                      onToggleBookmark={handleToggleBookmark}
                      data={kanjiData}

                    onViewStrokes={() => {

                      setModalKanji(kanjiData);

                      setActiveModal('stroke');

                    }}

                  />



                  {/* Bảng Từ Vựng Ghép & Trọng Âm NHK (Compound Tree) */}

                  <KanjiCompoundTree

                    character={kanjiData.character}

                    hanViet={kanjiData.hanViet}

                    onyomi={kanjiData.onyomi}

                    kunyomi={kanjiData.kunyomi}

                    compoundsTree={kanjiData.compoundsTree || { onyomiCompounds: [], kunyomiCompounds: [] }}

                    minaVocabularies={kanjiData.minaVocabularies || []}

                  />

                </div>

              ) : (

                <KanjiEmptyState onSelectSample={(char) => fetchKanjiDetails(char)} />

              )

            ) : (

              /* Chế độ Flashcard của bài học đang chọn */

              <div className="animate-in fade-in duration-200">

                <KanjiFlashcardView

                  kanjis={flashcardKanjis}

                  curriculumName={currentCurriculumMeta.name}

                  level={selectedLevel}

                  lesson={selectedLessonNumber}

                  lessonTitle={`Bài ${selectedLessonNumber}`}

                  onOpenDetail={(k) => openFlashcardModal('detail', k)}

                  onOpenRadicals={(k) => openFlashcardModal('radical', k)}

                  onOpenPhonetic={(k) => openFlashcardModal('phonetic', k)}

                  onOpenStrokeTracing={(k) => openFlashcardModal('stroke', k)}

                />

              </div>

            )}

              </>

            )}

          </div>

        </div>

      )}



      



      {/* ========================================================================= */}

      {/* 5. CHẾ ĐỘ 3: TRA CỨU TỰ DO & BẢNG VẼ TAY AI (CANVAS)                      */}

      {/* ========================================================================= */}

      {mainTab === 'canvas' && (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">

          {/* CỘT TRÁI (5/12): Bảng vẽ tay / Thư viện Level */}

          <div className="lg:col-span-5 flex flex-col gap-4">

            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">

              <button

                onClick={() => setLeftCanvasMode('canvas')}

                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${

                  leftCanvasMode === 'canvas'

                    ? 'bg-indigo-600 text-white shadow-xs'

                    : 'text-slate-500 hover:text-slate-800'

                }`}

              >

                <PenTool className="w-3.5 h-3.5" /> Bảng vẽ tay tra cứu

              </button>

              <button

                onClick={() => setLeftCanvasMode('level')}

                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${

                  leftCanvasMode === 'level'

                    ? 'bg-indigo-600 text-white shadow-xs'

                    : 'text-slate-500 hover:text-slate-800'

                }`}

              >

                <BookOpen className="w-3.5 h-3.5" /> Thư viện từ N5 - N1

              </button>

            </div>



            {leftCanvasMode === 'canvas' ? (

              <div className="flex flex-col gap-4">

                <HandwritingCanvas

                  onSelectKanji={(char) => fetchKanjiDetails(char)}

                  onClear={() => setKanjiData(null)}

                  selectedKanji={selectedKanjiChar}

                />

                {kanjiData && (

                  <RadicalGraph

                    kanji={kanjiData.character}

                    radicals={kanjiData.radicals || []}

                  />

                )}

              </div>

            ) : (

              <div className="flex flex-col gap-4">

                <KanjiLevelGrid

                  kanjiList={kanjiList}

                  selectedKanji={selectedKanjiChar}

                  onSelectKanji={(char) => fetchKanjiDetails(char)}

                  currentLevel={activeLevelTab}

                />

                {kanjiData && (

                  <RadicalGraph

                    kanji={kanjiData.character}

                    radicals={kanjiData.radicals || []}

                  />

                )}

              </div>

            )}

          </div>



          {/* CỘT PHẢI (7/12): Chi tiết và Sub-tabs */}

          <div className="lg:col-span-7 flex flex-col gap-4">

            {isLoadingDetails ? (

              <div className="bg-white p-16 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-2xs">

                <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />

                <p className="text-xs font-semibold text-slate-600">Đang phân tích dữ liệu Hán tự...</p>

              </div>

            ) : kanjiData ? (

              <div className="flex flex-col gap-4 animate-in fade-in duration-200">

                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">

                  <button

                    onClick={() => setKanjiSubTab('overview')}

                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${

                      kanjiSubTab === 'overview'

                        ? 'bg-indigo-600 text-white shadow-xs'

                        : 'text-slate-600 hover:bg-slate-100'

                    }`}

                  >

                    <FileText className="w-3.5 h-3.5" /> Tổng quan & Mẹo nhớ

                  </button>



                  <button

                    onClick={() => setKanjiSubTab('tree')}

                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${

                      kanjiSubTab === 'tree'

                        ? 'bg-indigo-600 text-white shadow-xs'

                        : 'text-slate-600 hover:bg-slate-100'

                    }`}

                  >

                    <Bookmark className="w-3.5 h-3.5 text-orange-500" />

                    <span>Từ vựng & Trọng âm NHK</span>

                  </button>



                  <button

                    onClick={() => setKanjiSubTab('stroke')}

                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${

                      kanjiSubTab === 'stroke'

                        ? 'bg-indigo-600 text-white shadow-xs'

                        : 'text-slate-600 hover:bg-slate-100'

                    }`}

                  >

                    <PenTool className="w-3.5 h-3.5" />

                    <span>Nét vẽ & Tập viết</span>

                  </button>



                  <button

                    onClick={() => setKanjiSubTab('lookalike')}

                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${

                      kanjiSubTab === 'lookalike'

                        ? 'bg-indigo-600 text-white shadow-xs'

                        : 'text-slate-600 hover:bg-slate-100'

                    }`}

                  >

                    <GitCompare className="w-3.5 h-3.5" />

                    <span>Chữ dễ nhầm lẫn</span>

                  </button>

                </div>



                {kanjiSubTab === 'overview' && (

                  <KanjiDetailCard
                      isBookmarked={!!bookmarkedKanji[kanjiData?.character || ""]}
                      onToggleBookmark={handleToggleBookmark}
                      data={kanjiData}

                    onViewStrokes={() => setKanjiSubTab('stroke')}

                  />

                )}



                {kanjiSubTab === 'tree' && (

                  <KanjiCompoundTree

                    character={kanjiData.character}

                    hanViet={kanjiData.hanViet}

                    onyomi={kanjiData.onyomi}

                    kunyomi={kanjiData.kunyomi}

                    compoundsTree={kanjiData.compoundsTree || { onyomiCompounds: [], kunyomiCompounds: [] }}

                    minaVocabularies={kanjiData.minaVocabularies || []}

                  />

                )}



                {kanjiSubTab === 'stroke' && (

                  <StrokeOrderAnimation

                    character={kanjiData.character}

                    svgStrokes={kanjiData.svgStrokes || []}

                    strokeCount={kanjiData.strokeCount}

                  />

                )}



                {kanjiSubTab === 'lookalike' && (

                  <KanjiLookalikes

                    currentKanji={{

                      character: kanjiData.character,

                      hanViet: kanjiData.hanViet,

                      meaningVi: kanjiData.meaningVi

                    }}

                    lookalikes={kanjiData.lookalikes || []}

                    onSelectKanji={(char) => fetchKanjiDetails(char)}

                  />

                )}

              </div>

            ) : (

              <KanjiEmptyState onSelectSample={(char) => fetchKanjiDetails(char)} />

            )}

          </div>

        </div>

      )}



      {/* ==== */}

      {/* 6. CHẾ ĐỘ 4: KIỂM TRA HÁN TỰ THEO LEVEL (JLPT KANJI QUIZ)                  */}

      {/* ========================================================================= */}

      {mainTab === 'quiz' && (

        <div className="flex flex-col gap-6 animate-in fade-in duration-200">

          <KanjiQuizView

            initialLevel={selectedLevel}

            onSelectKanji={(char) => {

              fetchKanjiDetails(char);

              setSelectedKanjiChar(char);

              setMainTab('directory');

            }}

          />

        </div>

      )}



      {/* ================= MODAL POPOVER CHO CÁC TÍNH NĂNG CHUYÊN SÂU ================= */}

      {activeModal && modalKanji && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">

            <button

              onClick={() => {

                setActiveModal(null);

                setModalKanji(null);

              }}

              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 absolute top-4 right-4 z-10 cursor-pointer"

            >

              <X className="w-5 h-5" />

            </button>



            {activeModal === 'detail' && (

              <KanjiDetailCard
                  isBookmarked={!!bookmarkedKanji[modalKanji?.character || ""]}
                  onToggleBookmark={handleToggleBookmark}
                  data={modalKanji}

                onViewStrokes={() => setActiveModal('stroke')}

              />

            )}



            {activeModal === 'radical' && (

              <div className="flex flex-col gap-4">

                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">

                  <Sparkles className="w-4 h-4 text-indigo-600" /> Sơ đồ bộ thủ cấu thành chữ 【{modalKanji.character}】

                </h3>

                <RadicalGraph

                  kanji={modalKanji.character}

                  radicals={modalKanji.radicals || []}

                />

              </div>

            )}



            {activeModal === 'stroke' && (

              <div className="flex flex-col gap-4">

                <StrokeOrderAnimation

                  character={modalKanji.character}

                  svgStrokes={modalKanji.svgStrokes || []}

                  strokeCount={modalKanji.strokeCount || 4}

                />

              </div>

            )}



            {activeModal === 'phonetic' && (

              <PhoneticShiftModal

                isOpen={true}

                onClose={() => setActiveModal(null)}

                character={modalKanji.character}

                hanViet={modalKanji.hanViet}

                onyomi={modalKanji.onyomi}

              />

            )}

          </div>

        </div>

      )}

    </div>

  );

}

