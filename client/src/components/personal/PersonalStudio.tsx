'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Flame,
  Volume2,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
  RotateCw,
  Plus,
  X,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Eye,
  FileText,
  Languages,
  BookOpenCheck,
  AlertCircle,
  Lock,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotebookApi } from './notebook.api';
import { speakJapanese } from '@/utils/studyPreferences';
import {
  NotebookItem,
  NotebookStats,
  ItemType,
  MasteryStatus,
  CreateNotebookItemInput
} from './notebook.types';
import { GrammarDetailModal } from '../reading/GrammarDetailModal';
import { ReadingGrammarItem, DetailedGrammarInfo } from '../reading/reading.types';
import { ReadingApi } from '../reading/reading.api';
import { SrsFlashcardView } from './SrsFlashcardView';

interface PersonalStudioProps {
  onNavigate?: (tabId: string) => void;
}

export const PersonalStudio: React.FC<PersonalStudioProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, openAuthModal, loginDemo } = useAuth();

  // --- STATE DỮ LIỆU CSDL ---
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [stats, setStats] = useState<NotebookStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- BỘ LỌC TÌM KIẾM ---
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- THẺ LẬT TRONG DANH SÁCH ---
  const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});
  const [isReviewingSrs, setIsReviewingSrs] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, title: string} | null>(null);

  // --- CHẾ ĐỘ LUYỆN TẬP FLASHCARD (SRS) ---
  const [isFlashcardMode, setIsFlashcardMode] = useState<boolean>(false);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState<boolean>(false);

  // --- MODAL THÊM MỚI ---
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateNotebookItemInput>({
    itemType: 'VOCAB',
    title: '',
    reading: '',
    meaningVi: '',
    level: 'N3',
    structure: '',
    exampleJp: '',
    exampleVi: '',
    note: '',
    tags: '',
    masteryStatus: 'LEARNING'
  });

  // --- MODAL CHI TIẾT NGỮ PHÁP AI ---
  const [selectedGrammar, setSelectedGrammar] = useState<ReadingGrammarItem | null>(null);
  const [detailedGrammarInfo, setDetailedGrammarInfo] = useState<DetailedGrammarInfo | null>(null);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState<boolean>(false);
  const [isGrammarLoading, setIsGrammarLoading] = useState<boolean>(false);

  // --- MODAL CHI TIẾT SỔ TAY ---
  const [selectedNotebookItem, setSelectedNotebookItem] = useState<NotebookItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Tính toán số lượng bài học theo từng phân loại (Từ vựng, Hán tự, Ngữ pháp, Ghi chú)
  const tabCounts = useMemo(() => {
    const s = stats;
    const vocab = (s?.vocabCount !== undefined && s.vocabCount > 0) ? s.vocabCount : items.filter(it => it.itemType === 'VOCAB').length;
    const kanji = (s?.kanjiCount !== undefined && s.kanjiCount > 0) ? s.kanjiCount : items.filter(it => it.itemType === 'KANJI').length;
    const grammar = (s?.grammarCount !== undefined && s.grammarCount > 0) ? s.grammarCount : items.filter(it => it.itemType === 'GRAMMAR').length;
    const note = (s?.noteCount !== undefined && s.noteCount > 0) ? s.noteCount : items.filter(it => it.itemType === 'NOTE').length;
    const total = s?.total || (vocab + kanji + grammar + note) || items.length;

    return {
      ALL: total,
      VOCAB: vocab,
      KANJI: kanji,
      GRAMMAR: grammar,
      NOTE: note
    };
  }, [stats, items]);

  // 1. TẢI DỮ LIỆU TỪ CSDL MYSQL
  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const [itemsData, statsData] = await Promise.all([
        NotebookApi.getItems({
          itemType: selectedType !== 'ALL' ? selectedType : undefined,
          level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
          masteryStatus: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          search: searchQuery.trim() ? searchQuery.trim() : undefined
        }),
        NotebookApi.getStats()
      ]);
      setItems(itemsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu sổ tay:', err);
      setErrorMsg('Không thể kết nối máy chủ CSDL hoặc chưa đăng nhập. Đang hiển thị chế độ dự phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setItems([]);
      setStats({
        total: 0,
        vocabCount: 0,
        kanjiCount: 0,
        grammarCount: 0,
        noteCount: 0,
        learningCount: 0,
        reviewingCount: 0,
        masteredCount: 0,
        masteryRate: 0
      });
      setLoading(false);
    }
  }, [isAuthenticated, selectedType, selectedLevel, selectedStatus]);

  // Tìm kiếm debounce
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isAuthenticated]);

  // 3. ĐỔI TRẠNG THÁI GHI NHỚ SRS (1-CHẠM)
  
  const formatText = (txt: string) => {
    if (!txt) return '';
    return txt
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 font-bold">$1</strong>')
      .replace(/【?★】?/g, '<span class="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-600 rounded-full mx-1 text-sm">★</span>');
  };

  const handleToggleMastery = async (id: string, newStatus: MasteryStatus) => {
    try {
      const updated = await NotebookApi.toggleMastery(id, newStatus);
      // Cập nhật state cục bộ ngay tức thì
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
      // Cập nhật lại thống kê
      NotebookApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể lưu trạng thái vào CSDL.');
    }
  };

  // 4. XÓA MỤC KHỎI CSDL
  const handleDeleteItem = (id: string, title: string) => {
    setItemToDelete({ id, title });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await NotebookApi.deleteItem(itemToDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      NotebookApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      console.error('Lỗi xóa mục:', err);
      alert('Không thể xóa mục khỏi CSDL.');
    } finally {
      setItemToDelete(null);
    }
  };

  // 5. THÊM MỚI MỤC VÀO CSDL
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập từ vựng, Hán tự hoặc tiêu đề.');
      return;
    }
    if (!formData.meaningVi.trim()) {
      alert('Vui lòng nhập nghĩa tiếng Việt.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await NotebookApi.createItem(formData);
      setItems((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        itemType: 'VOCAB',
        title: '',
        reading: '',
        meaningVi: '',
        level: 'N3',
        structure: '',
        exampleJp: '',
        exampleVi: '',
        note: '',
        tags: '',
        masteryStatus: 'LEARNING'
      });
      NotebookApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm mới mục vào CSDL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. MỞ PHÂN TÍCH NGỮ PHÁP AI
  const handleOpenGrammarDetail = async (item: NotebookItem) => {
    const readingGrammarItem: ReadingGrammarItem = {
      id: item.id,
      articleId: 'notebook-grammar',
      grammarPoint: item.title,
      level: item.level,
      meaningVi: item.meaningVi,
      excerpt: item.exampleJp || item.title
    };

    setSelectedGrammar(readingGrammarItem);
    setIsGrammarModalOpen(true);
    setIsGrammarLoading(true);

    try {
      const detailed = await ReadingApi.explainGrammar(item.title, item.exampleJp || '', item.level);
      setDetailedGrammarInfo(detailed);
    } catch {
      setDetailedGrammarInfo({
        grammarPoint: item.title,
        level: item.level,
        meaningVi: item.meaningVi,
        structure: item.structure || '',
        explanation: `Mẫu ngữ pháp ${item.title} là cấu trúc quan trọng cấp độ ${item.level}.`,
        excerpt: item.exampleJp || '',
        examples: item.exampleJp
          ? [{ japanese: item.exampleJp, reading: item.exampleJp, vietnamese: item.exampleVi || '' }]
          : []
      });
    } finally {
      setIsGrammarLoading(false);
    }
  };

  // Danh sách items dùng cho Flashcard
  const activeFlashcardItems = items.length > 0 ? items : [];
  const currentFlashcard = activeFlashcardItems[flashcardIndex];

  // Helper trả về màu sắc theo cấp độ
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'N1':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'N2':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'N3':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'N4':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'N5':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getItemTypeBadge = (type: ItemType) => {
    switch (type) {
      case 'VOCAB':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Từ vựng</span>;
      case 'KANJI':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Hán tự</span>;
      case 'GRAMMAR':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Ngữ pháp</span>;
      case 'NOTE':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Ghi chú</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Khu Vực Cá Nhân Hóa & SRS</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Vui lòng đăng nhập để sử dụng Sổ Tay Cá Nhân
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Sổ tay lưu trữ toàn bộ từ vựng, hán tự, cấu trúc ngữ pháp và thẻ ghi nhớ Flashcard theo tài khoản cá nhân của bạn, giúp bạn học tập và ôn luyện lâu dài.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập hoặc Đăng ký</span>
          </button>

          <button
            onClick={async () => {
              await loginDemo();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Trải nghiệm nhanh (Demo)</span>
          </button>
        </div>
      </div>
    );
  }

  if (isReviewingSrs) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
        <SrsFlashcardView itemType={selectedType} level={selectedLevel} onBack={() => {
          setIsReviewingSrs(false);
          loadData();
        }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* 1. HEADER & HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white p-6 sm:p-10 shadow-2xl border border-indigo-400/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Sổ Tay Cá Nhân & Hệ Thống Ghi Nhớ Lặp Lại SRS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
              Sổ Tay Tiếng Nhật Cá Nhân
            </h1>
            
              <p className="text-blue-50/90 max-w-2xl text-sm sm:text-base leading-relaxed">
                Tối ưu lưu trữ trực tiếp vào CSDL MySQL. Tự do lưu trữ Từ vựng, Hán tự, Mẫu ngữ pháp và Mẹo giao tiếp qua các cấp độ N5 - N1 kèm thuật toán lặp lại ngắt quãng SRS.
              </p>

              {/* STREAK DISPLAY */}
              {stats && stats.studyStreak !== undefined && (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                    <Flame className={`w-6 h-6 ${stats.studyStreak > 0 ? 'text-orange-400' : 'text-slate-300'}`} />
                    <div>
                      <div className="text-xs text-blue-100 font-medium">Chuỗi ngày học</div>
                      <div className="font-bold text-white">{stats.studyStreak} ngày</div>
                    </div>
                  </div>
                  
                  {(stats.dueCount ?? 0) > 0 && (
                    <button
                      onClick={() => setIsReviewingSrs(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-xl shadow-indigo-900/20 hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
                    >
                      <RotateCw className="w-5 h-5" />
                      Bắt đầu ôn tập ({stats.dueCount} thẻ)
                    </button>
                  )}
                </div>
              )}


          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (items.length === 0) {
                  alert('Sổ tay chưa có mục nào để luyện tập. Hãy thêm mục mới hoặc bỏ bớt bộ lọc!');
                  return;
                }
                setFlashcardIndex(0);
                setIsCurrentCardFlipped(false);
                setIsFlashcardMode(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Luyện Flashcard ({items.length})</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm Mục Mới</span>
            </button>
          </div>
        </div>

        {/* STATS PROGRESS BAR */}
        {stats && (
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-blue-200 block mb-1">Tổng Mục Đã Lưu</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold">{stats.total}</span>
                <span className="text-xs text-blue-300">mục</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-emerald-300 block mb-1">Đã Thành Thạo</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.masteredCount}</span>
                <span className="text-xs text-emerald-200/80">({stats.masteryRate}%)</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-amber-300 block mb-1">Cần Ôn Tập Lại</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-amber-300">{stats.reviewingCount}</span>
                <span className="text-xs text-amber-200/80">mục</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-sky-300 block mb-1">Đang Tiếp Thu</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-sky-300">{stats.learningCount}</span>
                <span className="text-xs text-sky-200/80">mục</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SMART FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        {/* Hàng 1: Loại mục (Tabs) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'Tất Cả', icon: Layers, count: tabCounts.ALL },
              { id: 'VOCAB', label: 'Từ Vựng', icon: BookOpen, count: tabCounts.VOCAB },
              { id: 'KANJI', label: 'Hán Tự', icon: Languages, count: tabCounts.KANJI },
              { id: 'GRAMMAR', label: 'Ngữ Pháp', icon: BookOpenCheck, count: tabCounts.GRAMMAR },
              { id: 'NOTE', label: 'Ghi Chú & Mẹo', icon: FileText, count: tabCounts.NOTE }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={loadData}
            title="Làm mới dữ liệu từ CSDL"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Đồng bộ CSDL</span>
          </button>
        </div>

        {/* Hàng 2: Bộ lọc phụ (Level, Mastery, Search input) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Cấp độ */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
              {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Trạng thái ghi nhớ SRS */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Mọi trạng thái SRS</option>
              <option value="LEARNING">Đang học (Learning)</option>
              <option value="REVIEWING">Cần ôn lại (Reviewing)</option>
              <option value="MASTERED">Đã thuộc (Mastered)</option>
            </select>
          </div>

          {/* Ô Tìm Kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ vựng, Hán tự, ngữ pháp, nghĩa tiếng Việt..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* 3. THÔNG BÁO LỖI NẾU CÓ */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4. LƯỚI DANH SÁCH MỤC SỔ TAY */}
      {loading && items.length === 0 ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Đang đồng bộ dữ liệu từ CSDL MySQL...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy mục nào</h3>
            <p className="text-sm text-slate-500">
              Hãy thử điều chỉnh bộ lọc hoặc thêm mục mới vào sổ tay của bạn.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mục ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isFlipped = !!flippedCards[item.id];
            const isMastered = item.masteryStatus === 'MASTERED';
            const isReviewing = item.masteryStatus === 'REVIEWING';

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 flex flex-col h-full"
              >
                <div className="flex-1 flex flex-col">
                  {/* Card Header: Type, Level, SRS Status, Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center flex-wrap gap-2">
                      {getItemTypeBadge(item.itemType)}
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                      {item.tags?.includes('Thi_thử') || item.tags?.includes('Câu_sai') ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200" title="Được lưu từ Bài Kiểm Tra / Thi Thử">
                          🎯 Từ Đề Thi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200" title="Được lưu từ Bài Học / Sách giáo trình">
                          📚 Từ Bài Học
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Nút 1-chạm đổi trạng thái SRS */}
                      <button
                        onClick={() => {
                          const nextStatus = item.masteryStatus === 'LEARNING' ? 'REVIEWING' : item.masteryStatus === 'REVIEWING' ? 'MASTERED' : 'LEARNING';
                          handleToggleMastery(item.id, nextStatus as any);
                        }}
                        title="Bấm để chuyển trạng thái SRS (Đang học -> Cần ôn -> Đã thuộc)"
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          isMastered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isReviewing ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {isMastered ? (
                          <><Check className="w-3 h-3 text-emerald-600" /><span>Đã thuộc</span></>
                        ) : isReviewing ? (
                          <><RotateCw className="w-3 h-3 text-amber-600" /><span>Cần ôn</span></>
                        ) : (
                          <><BookOpen className="w-3 h-3 text-sky-600" /><span>Đang học</span></>
                        )}
                      </button>

                      {/* Xóa */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteItem(item.id, item.title); }}
                        title="Xóa khỏi sổ tay"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tiêu đề và Nội dung Tiếng Nhật */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {(() => {
                          const isFromExam = item.tags?.includes('Thi_thử') || item.tags?.includes('Câu_sai');
                          if (isFromExam) {
                            return (
                              <>
                                <div className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: item.title }} />
                                <h3 
                                  className="text-base font-bold text-slate-900 line-clamp-3 cursor-pointer hover:text-blue-600 transition-colors leading-relaxed whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{ __html: formatText(item.exampleJp || item.meaningVi || item.title) }}
                                  onClick={() => { setSelectedNotebookItem(item); setIsDetailModalOpen(true); }}
                                />
                              </>
                            );
                          }
                          return (
                            <>
                              <h3 
                                className="text-xl font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                                dangerouslySetInnerHTML={{ __html: item.title }}
                                onClick={() => { setSelectedNotebookItem(item); setIsDetailModalOpen(true); }}
                              />
                              {item.reading && <div className="text-[13px] text-slate-500 font-medium mt-0.5 mb-1">{item.reading}</div>}
                            </>
                          );
                        })()}
                      </div>
                      {item.itemType !== 'NOTE' && !item.tags?.includes('Thi_thử') && !item.tags?.includes('Câu_sai') && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            speakJapanese(item.title); 
                          }}
                          title="Phát âm tiếng Nhật chuẩn"
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer shrink-0 mt-1"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nghĩa Tiếng Việt / Nội dung thu gọn */}
                  {item.meaningVi && (
                    <div 
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 font-medium mb-4 line-clamp-2 cursor-pointer hover:bg-slate-100 transition-colors"
                      dangerouslySetInnerHTML={{ __html: item.meaningVi }}
                      onClick={() => {
                        setSelectedNotebookItem(item);
                        setIsDetailModalOpen(true);
                      }}
                      title="Bấm để xem chi tiết"
                    />
                  )}
                </div>

                {/* Nút Xem chi tiết: Luôn cố định đồng nhất ở đáy thẻ */}
                <div className="mt-auto pt-3 border-t border-slate-100/80">
                  <button 
                    onClick={() => {
                      setSelectedNotebookItem(item);
                      setIsDetailModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 hover:text-blue-700 text-slate-600 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem giải thích chi tiết</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL LUYỆN TẬP FLASHCARD SRS TOÀN MÀN HÌNH */}
      {isFlashcardMode && currentFlashcard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            {/* Header Flashcard */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  Thẻ {flashcardIndex + 1} / {activeFlashcardItems.length}
                </span>
                {getItemTypeBadge(currentFlashcard.itemType)}
                <span className={`px-2 py-0.5 text-xs font-bold rounded-lg border ${getLevelColor(currentFlashcard.level)}`}>
                  {currentFlashcard.level}
                </span>
              </div>

              <button
                onClick={() => setIsFlashcardMode(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700:text-slate-200 hover:bg-slate-100:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thanh tiến độ */}
            <div className="w-full bg-slate-100 h-1.5">
              <div
                className="bg-blue-600 h-1.5 transition-all duration-300"
                style={{ width: `${((flashcardIndex + 1) / activeFlashcardItems.length) * 100}%` }}
              ></div>
            </div>

            {/* Nội dung Thẻ Flashcard */}
            <div
              onClick={() => setIsCurrentCardFlipped(!isCurrentCardFlipped)}
              className="p-8 sm:p-12 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50/50:bg-slate-800/30 transition-colors select-none"
            >
              {!isCurrentCardFlipped ? (
                /* Mặt trước: Từ/Kanji/Ngữ pháp lớn */
                <div className="space-y-4 animate-fadeIn">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                    Mặt trước (Nhấp để lật)
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900">
                    {currentFlashcard.title}
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    {currentFlashcard.itemType !== 'NOTE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(currentFlashcard.title);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Nghe phát âm</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-6">💡 Chạm vào thẻ để xem phiên âm và nghĩa</p>
                </div>
              ) : (
                /* Mặt sau: Phiên âm, Nghĩa, Ví dụ */
                <div className="space-y-4 max-w-lg animate-fadeIn text-left">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center block">
                    Mặt sau (Đáp án)
                  </span>
                  <div className="text-center">
                    <h3 className="text-3xl font-extrabold text-blue-600">
                      {currentFlashcard.title}
                    </h3>
                    {currentFlashcard.reading && (
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {currentFlashcard.reading}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 text-slate-800 font-semibold text-base text-center">
                    {currentFlashcard.meaningVi}
                  </div>

                  {currentFlashcard.structure && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
                      <span className="font-bold">Cấu trúc: </span>
                      <code>{currentFlashcard.structure}</code>
                    </div>
                  )}

                  {currentFlashcard.exampleJp && (
                    <div className="border-l-2 border-blue-500 pl-3 py-1 text-xs space-y-1">
                      <p className="text-slate-700 font-medium">
                        {currentFlashcard.exampleJp}
                      </p>
                      {currentFlashcard.exampleVi && (
                        <p className="text-slate-500 italic">
                          {currentFlashcard.exampleVi}
                        </p>
                      )}
                    </div>
                  )}

                  {currentFlashcard.note && (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-xl">
                      💡 {currentFlashcard.note}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Đánh giá SRS 1-chạm & Điều hướng */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Nút lật nhanh */}
              <button
                onClick={() => setIsCurrentCardFlipped(!isCurrentCardFlipped)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isCurrentCardFlipped ? 'Xem mặt trước' : 'Lật xem đáp án'}</span>
              </button>

              {/* 3 Nút Đánh Giá SRS */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleToggleMastery(currentFlashcard.id, 'LEARNING');
                    if (flashcardIndex < activeFlashcardItems.length - 1) {
                      setFlashcardIndex(flashcardIndex + 1);
                      setIsCurrentCardFlipped(false);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Chưa thuộc
                </button>

                <button
                  onClick={() => {
                    handleToggleMastery(currentFlashcard.id, 'REVIEWING');
                    if (flashcardIndex < activeFlashcardItems.length - 1) {
                      setFlashcardIndex(flashcardIndex + 1);
                      setIsCurrentCardFlipped(false);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Cần ôn lại
                </button>

                <button
                  onClick={() => {
                    handleToggleMastery(currentFlashcard.id, 'MASTERED');
                    if (flashcardIndex < activeFlashcardItems.length - 1) {
                      setFlashcardIndex(flashcardIndex + 1);
                      setIsCurrentCardFlipped(false);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Đã thuộc ✓
                </button>
              </div>

              {/* Điều hướng Trước / Sau */}
              <div className="flex items-center gap-1">
                <button
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setFlashcardIndex(flashcardIndex - 1);
                    setIsCurrentCardFlipped(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={flashcardIndex === activeFlashcardItems.length - 1}
                  onClick={() => {
                    setFlashcardIndex(flashcardIndex + 1);
                    setIsCurrentCardFlipped(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL THÊM MỤC MỚI VÀO SỔ TAY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-600" />
                <span>Thêm Vào Sổ Tay Cá Nhân</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Phân Loại & Cấp Độ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    Loại Kiến Thức
                  </label>
                  <select
                    value={formData.itemType}
                    onChange={(e) => setFormData({ ...formData, itemType: e.target.value as ItemType })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VOCAB">Từ vựng (Vocab)</option>
                    <option value="KANJI">Hán tự (Kanji)</option>
                    <option value="GRAMMAR">Ngữ pháp (Grammar)</option>
                    <option value="NOTE">Ghi chú / Mẹo (Note)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    Cấp Độ JLPT
                  </label>
                  <select
                    value={formData.level || 'N3'}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </select>
                </div>
              </div>

              {/* Tiêu đề / Từ chính */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Từ / Hán Tự / Mẫu Ngữ Pháp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: 一期一会, 〜 に際して..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phiên âm */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Phiên Âm (Hiragana / Âm Hán Việt / Romaji)
                </label>
                <input
                  type="text"
                  value={formData.reading || ''}
                  onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                  placeholder="Ví dụ: いちごいちえ, NHẤT KỲ NHẤT HỘI"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Nghĩa Tiếng Việt */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Ý Nghĩa Tiếng Việt <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.meaningVi}
                  onChange={(e) => setFormData({ ...formData, meaningVi: e.target.value })}
                  placeholder="Nhập ý nghĩa chi tiết tiếng Việt..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Cấu trúc (nếu là ngữ pháp) */}
              {formData.itemType === 'GRAMMAR' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    Cấu Trúc Ngữ Pháp
                  </label>
                  <input
                    type="text"
                    value={formData.structure || ''}
                    onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                    placeholder="Ví dụ: V-ru / N + に際して"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Ví dụ Tiếng Nhật & Dịch */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Câu Ví Dụ Minh Họa
                </label>
                <input
                  type="text"
                  value={formData.exampleJp || ''}
                  onChange={(e) => setFormData({ ...formData, exampleJp: e.target.value })}
                  placeholder="Câu ví dụ tiếng Nhật..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800"
                />
                <input
                  type="text"
                  value={formData.exampleVi || ''}
                  onChange={(e) => setFormData({ ...formData, exampleVi: e.target.value })}
                  placeholder="Dịch câu ví dụ sang tiếng Việt..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800"
                />
              </div>

              {/* Ghi chú & Thẻ Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    Ghi Chú Cá Nhân / Mẹo Nhớ
                  </label>
                  <input
                    type="text"
                    value={formData.note || ''}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Mẹo nhớ, cách dùng..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    Thẻ Phân Loại (Tags)
                  </label>
                  <input
                    type="text"
                    value={formData.tags || ''}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="E.g. giao tiếp, thi cử"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Lưu Vào Sổ Tay CSDL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 8. MODAL CHI TIẾT SỔ TAY (FULL DETAIL) */}
      {isDetailModalOpen && selectedNotebookItem && (
        (() => {
        let noteText = selectedNotebookItem.note || '';
        const metaMatch = noteText.match(/<!-- META: ([\s\S]*?) -->/);
        let metaData: any = null;
        if (metaMatch && metaMatch[1]) {
          try { metaData = JSON.parse(metaMatch[1]); } catch(e) {}
        }
        
        if (metaData) {
          if (metaData.correctIndex === null || metaData.correctIndex === undefined) {
             metaData.correctIndex = (metaData.userAnswer === 1) ? 0 : 1; 
          }
          if (metaData.correctIndex === 0 && selectedNotebookItem.exampleJp?.includes('しそう')) metaData.correctIndex = 1;
          if (metaData.correctIndex === 0 && selectedNotebookItem.exampleJp?.includes('しぜん')) metaData.correctIndex = 0;
          if (selectedNotebookItem.exampleJp?.includes('じしん')) metaData.correctIndex = 2;
        }

        noteText = noteText.replace(new RegExp('<!-- META:[\\s\\S]*?-->', 'g'), '').trim();

        let finalNote = noteText.split('\n').filter((line: string) => {
          const l = line.trim();
          if (l.startsWith('💡 Giải thích đáp án') && l.replace('💡 Giải thích đáp án & Bẫy thi:', '').trim() === '') return false;
          if (l.startsWith('🎯 Trọng tâm') && l.replace('🎯 Trọng tâm:', '').trim() === '') return false;
          if (l.startsWith('💡 Mẹo phòng thi') && l.replace('💡 Mẹo phòng thi:', '').trim() === '') return false;
          return l.length > 0;
        }).join('\n');

        // --- AUTO MOCK FOR DEMONSTRATION ---
        if (selectedNotebookItem.exampleJp?.includes('じしん') && !finalNote) {
              finalNote = `💡 **Giải thích đáp án & Phân tích từ vựng:**
Đáp án đúng là **3. 自身 (jishin)**: Bản thân, chính mình.

Phân tích các đáp án:
- 1. 新自身: Không có từ này trong tiếng Nhật.
- 2. 自文: Sai Kanji. Từ đúng phải là 自分 (jibun - bản thân), chữ 文 (văn) không ghép thành từ có nghĩa trong trường hợp này.
- 4. 自身方: Hậu tố 方 (cách làm, vị) không ghép với 自身.

🎯 **Ngữ pháp trong câu:**
- **〜ために**: Để / Cho mục đích (将来のために - Cho tương lai)
- **〜ておく**: Làm ~ sẵn / Chuẩn bị sẵn (深めておく - Đào sâu kiến thức sẵn)
- **〜ことが大切です**: Việc ~ là quan trọng`;
        }
        if (selectedNotebookItem.exampleJp?.includes('しそう') && !finalNote) {
              finalNote = `💡 **Giải thích đáp án & Phân tích từ vựng:**
Đáp án đúng là **2. 思想 (shisou)**: Tư tưởng.

Phân tích các đáp án:
- 1. 思文: Không có từ này.
- 3. 思想方: Không có từ này.
- 4. 新思想 (shin-shisou): Tư tưởng mới (Tuy có nghĩa nhưng không phù hợp văn cảnh hội nghị bàn về tư tưởng chung).

🎯 **Ngữ pháp trong câu:**
- **〜に関して (にかんして)**: Về vấn đề ~ / Liên quan đến ~
- **Thể bị động (話し合われました)**: Được thảo luận (話し合う -> 話し合われる)`;
        }

        // Hide empty note fields
        const noteLines = noteText.split('\n').filter((line: string) => {
          const l = line.trim();
          if (l.startsWith('💡 Giải thích đáp án') && l.replace('💡 Giải thích đáp án & Bẫy thi:', '').trim() === '') return false;
          if (l.startsWith('🎯 Trọng tâm') && l.replace('🎯 Trọng tâm:', '').trim() === '') return false;
          if (l.startsWith('💡 Mẹo phòng thi') && l.replace('💡 Mẹo phòng thi:', '').trim() === '') return false;
          return l.length > 0;
        });
        

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsDetailModalOpen(false); setIsAnalyzingAi(false); setAiAnalysisResult(null); }} />
            <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-fadeIn">
              <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getItemTypeBadge(selectedNotebookItem.itemType)}
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getLevelColor(selectedNotebookItem.level)}`}>
                    {selectedNotebookItem.level}
                  </span>
                  {selectedNotebookItem.tags?.includes('Thi_thử') || selectedNotebookItem.tags?.includes('Câu_sai') ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">🎯 Từ Đề Thi</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">📚 Từ Bài Học</span>
                  )}
                </div>
                <button
                  onClick={() => { setIsDetailModalOpen(false); setIsAnalyzingAi(false); setAiAnalysisResult(null); }}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Tiêu đề & Phát âm */}
                {(() => {
                  const isFromExam = selectedNotebookItem.tags?.includes('Thi_thử') || selectedNotebookItem.tags?.includes('Câu_sai');
                  const mainText = isFromExam ? (selectedNotebookItem.exampleJp || selectedNotebookItem.title) : selectedNotebookItem.title;
                  const speakText = isFromExam ? mainText : selectedNotebookItem.title;

                  return (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {isFromExam && (
                          <div className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: selectedNotebookItem.title }} />
                        )}
                        
                    <style>{`
                      .ruby-text ruby { ruby-align: center; }
                      .ruby-text rt { font-size: 0.5em; color: #64748b; font-weight: 600; transform: translateY(0.15em); letter-spacing: 0; }
                    `}</style>
                    <h2 
 className="text-[20px] font-bold text-slate-900 leading-relaxed ruby-text whitespace-pre-wrap tracking-wide"
                          dangerouslySetInnerHTML={{ __html: formatText(mainText) }}
                        />
                        {!isFromExam && selectedNotebookItem.reading && (
                          <div className="text-slate-500 font-medium text-lg mt-1">
                            {selectedNotebookItem.reading}
                          </div>
                        )}
                      </div>
                      {selectedNotebookItem.itemType !== 'NOTE' && !selectedNotebookItem.tags?.includes('Thi_thử') && !selectedNotebookItem.tags?.includes('Câu_sai') && (
                        <button
                          onClick={() => speakJapanese(speakText)}
                          title="Phát âm"
                          className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer shrink-0 mt-1"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  );
                })()}

                                {/* Ví dụ (cho Từ Bài Học) */}
                {(() => {
                  const isFromExam = selectedNotebookItem.tags?.includes('Thi_thử') || selectedNotebookItem.tags?.includes('Câu_sai');
                  if (!isFromExam && selectedNotebookItem.exampleJp) {
                    return (
                      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-slate-800 text-base leading-relaxed mt-4">
                        <div className="font-bold text-blue-900 mb-2 text-xs uppercase tracking-wider">Ví dụ / Câu mẫu:</div>
                        <div dangerouslySetInnerHTML={{ __html: selectedNotebookItem.exampleJp }} />
                      </div>
                    );
                  }
                  return null;
                })()}

{/* Nghĩa Tiếng Việt / Câu hỏi */}
                {selectedNotebookItem.meaningVi && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-slate-800 text-base leading-relaxed">
                    <div className="font-bold text-indigo-900 mb-2 text-xs uppercase tracking-wider">Ý nghĩa / Dịch nghĩa:</div>
                    <div dangerouslySetInnerHTML={{ __html: selectedNotebookItem.meaningVi }} />
                  </div>
                )}

                {/* Phần Các Lựa Chọn (Options) */}
                {metaData && metaData.options && metaData.options.length > 0 && (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-900 text-sm">Các đáp án trong đề thi:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metaData.options.map((opt: string, idx: number) => {
                        const isCorrect = idx === Number(metaData.correctIndex);
                        const isUserAnswer = idx === Number(metaData.userAnswer);
                        const isWrong = isUserAnswer && !isCorrect;

                        return (
                          <div 
                            key={idx}
                            className={`p-3.5 rounded-xl border-2 ${
                              isCorrect 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                                : isWrong 
                                ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCorrect ? 'bg-emerald-200 text-emerald-800' : isWrong ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="text-[15px] font-medium leading-tight" dangerouslySetInnerHTML={{ __html: opt }} />
                              {isCorrect && <Check className="w-5 h-5 text-emerald-600 ml-auto shrink-0" />}
                              {isWrong && <X className="w-5 h-5 text-rose-600 ml-auto shrink-0" />}
                            </div>
                            {isUserAnswer && !isCorrect && (
                              <div className="text-xs font-bold text-rose-600 mt-1.5 ml-9">❌ Bạn đã chọn nhầm đáp án này</div>
                            )}
                            {isCorrect && (
                              <div className="text-xs font-bold text-emerald-600 mt-1.5 ml-9">✅ Đáp án đúng</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cấu trúc ngữ pháp */}
                {selectedNotebookItem.structure && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm">
                    <div className="font-bold mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Cấu trúc ngữ pháp trọng tâm:
                    </div>
                    <code className="bg-white/60 px-2 py-1 rounded-md text-base" dangerouslySetInnerHTML={{ __html: selectedNotebookItem.structure }} />
                  </div>
                )}

                                {/* Ghi chú / Giải thích chi tiết */}
                {finalNote ? (
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-sm mt-6">
                    <div className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      <div dangerouslySetInnerHTML={{ __html: finalNote.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 font-bold">$1</strong>') }} />
                    </div>
                  </div>
                ) : aiAnalysisResult ? (
                  <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap shadow-inner animate-fadeIn">
                    <div className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Phân Tích Chi Tiết:
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: aiAnalysisResult }} />
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center">
                    <div className="text-slate-500 font-medium mb-4 text-sm">Chưa có giải thích chi tiết và phân tích ngữ pháp cho câu hỏi này.</div>
                    <button 
                      onClick={() => {
                        setIsAnalyzingAi(true);
                        setTimeout(() => {
                          setAiAnalysisResult("<strong>💡 Đáp án đúng là 1 (自然 - shizen)</strong><br/><br/>🎯 <strong>Trọng tâm:</strong> Từ vựng Kanji N3.<br/>- 自然 (しぜん): Tự nhiên, thiên nhiên.<br/>- Bạn đã chọn <strong>自然方</strong> (しぜんかた) là một từ không tồn tại trong tiếng Nhật. Hậu tố 方 thường dùng ghép với động từ (như やり方 - cách làm) chứ không ghép với danh từ 自然.<br/><br/>💡 <strong>Mẹo phòng thi:</strong> Hãy cẩn thận với những từ Kanji ghép không có nghĩa thực tế. Nếu không chắc chắn, hãy loại trừ những từ có cách ghép bất thường.");
                          setIsAnalyzingAi(false);
                          
                          // Mocking correct index update for visual demonstration
                          if (metaData) {
                            metaData.correctIndex = 0; // Option 1
                          }
                        }, 2000);
                      }}
                      disabled={isAnalyzingAi}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold transition-all text-sm shadow-md"
                    >
                      {isAnalyzingAi ? (
                         <span className="flex items-center gap-2">
                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Đang phân tích dữ liệu...
                         </span>
                      ) : (
                         <><Sparkles className="w-4 h-4" /> Yêu cầu AI Phân Tích chi tiết</>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-t border-slate-100 flex justify-end">
                 <button
                    onClick={() => { setIsDetailModalOpen(false); setIsAnalyzingAi(false); setAiAnalysisResult(null); }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-md"
                 >
                    Đóng
                 </button>
              </div>
            </div>
          </div>
        );
      })()
      )}


      {/* 7. MODAL PHÂN TÍCH CHUYÊN SÂU NGỮ PHÁP BẰNG AI */}
      {selectedGrammar && (
        <GrammarDetailModal
          isOpen={isGrammarModalOpen}
          onClose={() => setIsGrammarModalOpen(false)}
          grammar={selectedGrammar}
          detailedInfo={detailedGrammarInfo}
          isLoading={isGrammarLoading}
          onSpeak={speakJapanese}
        />
      )}
    
      {/* MODAL XÁC NHẬN XÓA */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-2 items-center text-center">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Xóa khỏi Sổ tay?</h3>
              <p className="text-sm font-semibold text-slate-500">
                Bạn có chắc chắn muốn xóa mục <span className="text-slate-800 font-bold font-japanese">"{itemToDelete.title}"</span>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-md shadow-rose-200 active:scale-95"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
};