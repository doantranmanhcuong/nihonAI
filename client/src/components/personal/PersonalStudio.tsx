'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Sparkles,
  BookOpen,
  Volume2,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  RotateCw,
  Plus,
  X,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Languages,
  BookOpenCheck,
  AlertCircle,
  Lock,
  LogIn,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotebookApi } from './notebook.api';
import { speakJapanese } from '@/utils/studyPreferences';
import {
  NotebookItem,
  NotebookStats,
  NotebookHubSummary,
  LevelSummary,
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

  // --- STATE DỮ LIỆU ---
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [hubSummary, setHubSummary] = useState<NotebookHubSummary | null>(null);
  const [stats, setStats] = useState<NotebookStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- BỘ LỌC CẤP BẬC (PHƯƠNG ÁN 4: HYBRID SMART HUB) ---
  // Tầng 1: Chọn Level (N5 -> N1 hoặc ALL). Mặc định lấy theo targetLevel của học viên
  const [selectedLevel, setSelectedLevel] = useState<string>('N3');
  // Tầng 2 & 3: Phân vùng trong Level (all | due | mistakes | vocab | kanji | grammar | note)
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- CHẾ ĐỘ HIỂN THỊ ĐÓNG / MỞ LINH HOẠT ---
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const [expandedCards, setExpandedCards] = useState<{ [id: string]: boolean }>({});
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);

  // --- CHẾ ĐỘ ÔN TẬP SRS & FLASHCARD ---
  const [isReviewingSrs, setIsReviewingSrs] = useState<boolean>(false);
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

  // Đồng bộ Level mặc định theo tài khoản học viên khi đăng nhập
  useEffect(() => {
    if (user?.targetLevel && ['N5', 'N4', 'N3', 'N2', 'N1'].includes(user.targetLevel)) {
      setSelectedLevel(user.targetLevel);
      setFormData((prev) => ({ ...prev, level: user.targetLevel }));
    }
  }, [user?.targetLevel]);

  // 1. TẢI DỮ LIỆU TỪ CSDL VÀ BỘ ĐỆM CACHE REDIS
  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const [itemsData, summaryData, statsData] = await Promise.all([
        NotebookApi.getItems({
          level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
          section: selectedSection !== 'all' ? selectedSection : undefined,
          masteryStatus: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          search: searchQuery.trim() ? searchQuery.trim() : undefined,
          limit: 150
        }),
        NotebookApi.getHubSummary(),
        NotebookApi.getStats()
      ]);
      setItems(itemsData);
      setHubSummary(summaryData);
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
      setHubSummary(null);
      setStats(null);
      setLoading(false);
    }
  }, [isAuthenticated, selectedLevel, selectedSection, selectedStatus]);

  // Tìm kiếm debounce
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Thống kê số lượng hiện tại cho Level đang chọn
  const currentLevelSummary = useMemo(() => {
    if (!hubSummary) {
      return {
        total: items.length,
        due: 0,
        mistakes: 0,
        vocab: 0,
        kanji: 0,
        grammar: 0,
        note: 0,
        mastered: 0,
        learning: 0,
        reviewing: 0
      };
    }
    if (selectedLevel === 'ALL') {
      return hubSummary.overall;
    }
    return hubSummary.levels[selectedLevel as keyof typeof hubSummary.levels] || hubSummary.overall;
  }, [hubSummary, selectedLevel, items.length]);

  // Format text (in đậm và ngôi sao ★)
  const formatText = (txt: string) => {
    if (!txt) return '';
    return txt
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 font-bold">$1</strong>')
      .replace(/【?★】?/g, '<span class="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-600 rounded-full mx-1 text-sm">★</span>');
  };

  // 1-Chạm đổi trạng thái SRS
  const handleToggleMastery = async (id: string, newStatus: MasteryStatus) => {
    try {
      const updated = await NotebookApi.toggleMastery(id, newStatus);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
      NotebookApi.getHubSummary().then((s) => setHubSummary(s)).catch(() => {});
      NotebookApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể lưu trạng thái vào CSDL.');
    }
  };

  // Đóng/Mở từng card
  const toggleCardExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Mở tất cả / Thu gọn tất cả
  const toggleExpandAll = (expand: boolean) => {
    const newState: { [id: string]: boolean } = {};
    if (expand) {
      items.forEach((it) => {
        newState[it.id] = true;
      });
    }
    setExpandedCards(newState);
  };

  // Xóa mục
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await NotebookApi.deleteItem(itemToDelete.id);
      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      NotebookApi.getHubSummary().then((s) => setHubSummary(s)).catch(() => {});
      NotebookApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      console.error('Lỗi xóa mục:', err);
      alert('Không thể xóa mục khỏi CSDL.');
    } finally {
      setItemToDelete(null);
    }
  };

  // Thêm mục mới
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.meaningVi.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và ý nghĩa tiếng Việt.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await NotebookApi.createItem(formData);
      setItems((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        itemType: 'VOCAB',
        title: '',
        reading: '',
        meaningVi: '',
        level: selectedLevel !== 'ALL' ? selectedLevel : 'N3',
        structure: '',
        exampleJp: '',
        exampleVi: '',
        note: '',
        tags: '',
        masteryStatus: 'LEARNING'
      });
      NotebookApi.getHubSummary().then((s) => setHubSummary(s)).catch(() => {});
      NotebookApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err: any) {
      console.error('Lỗi khi tạo mục sổ tay:', err);
      alert(err.message || 'Lỗi khi lưu mục sổ tay');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
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
            <span>Trung Tâm Sổ Tay & Ôn Tập Thông Minh</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Vui lòng đăng nhập để sử dụng Sổ Tay Cá Nhân
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Hệ thống quản lý thông minh phân theo từng cấp độ JLPT (N5 - N1), gom nhóm ôn tập gấp, câu hỏi làm sai từ đề thi, từ vựng và ngữ pháp có hỗ trợ lặp lại ngắt quãng SRS.
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

  // Mở chế độ ôn tập SRS chuyên sâu
  if (isReviewingSrs) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
        <SrsFlashcardView
          level={selectedLevel !== 'ALL' ? selectedLevel : undefined}
          onBack={() => {
            setIsReviewingSrs(false);
            loadData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. HERO HEADER GỌN GÀNG */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Sổ Tay Thông Minh & Quản Lý Ôn Tập Đa Tầng (SM-2 SRS)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trung Tâm Sổ Tay & Ôn Tập Cá Nhân
            </h1>
            <p className="text-slate-300 max-w-2xl text-xs sm:text-sm leading-relaxed">
              Phân loại khoa học theo cấp độ JLPT, tự động tách riêng câu hỏi làm sai từ đề thi, thẻ đến hạn ôn tập gấp và kiến thức thường ngày.
            </p>

            {/* CHUỖI NGÀY HỌC & TỔNG QUAN NHANH */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-xl border border-white/15 text-xs">
                <Flame className={`w-4 h-4 ${(stats?.studyStreak ?? 0) > 0 ? 'text-orange-400' : 'text-slate-400'}`} />
                <span className="font-bold text-white">{stats?.studyStreak || 0} ngày streak</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-xl border border-white/15 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200">Đã thành thạo: <strong className="text-white">{stats?.masteredCount || 0}</strong> ({stats?.masteryRate || 0}%)</span>
              </div>
            </div>
          </div>

          {/* CỤM NÚT HÀNH ĐỘNG GIAO DIỆN CHÍNH */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (items.length === 0) {
                  alert('Không có mục nào trong danh sách hiện tại để luyện tập!');
                  return;
                }
                setFlashcardIndex(0);
                setIsCurrentCardFlipped(false);
                setIsFlashcardMode(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Luyện Flashcard ({items.length})</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mục Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TẦNG 1: THANH ĐIỀU HƯỚNG LEVEL THÔNG MINH (LEVEL-FIRST BAR) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Chọn Cấp Độ JLPT Cần Quản Lý:
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Đang xem:</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              {selectedLevel === 'ALL' ? 'Tất cả các cấp độ' : `JLPT ${selectedLevel}`}
            </span>
          </div>
        </div>

        {/* CÁC NÚT LEVEL VỚI CHỈ SỐ ĐẾM THỰC TẾ TỪ REDIS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {[
            { id: 'N5', label: 'JLPT N5' },
            { id: 'N4', label: 'JLPT N4' },
            { id: 'N3', label: 'JLPT N3' },
            { id: 'N2', label: 'JLPT N2' },
            { id: 'N1', label: 'JLPT N1' },
            { id: 'ALL', label: 'Tất Cả Level' }
          ].map((lvl) => {
            const isActive = selectedLevel === lvl.id;
            const lvlStats = lvl.id === 'ALL' 
              ? hubSummary?.overall 
              : hubSummary?.levels[lvl.id as keyof typeof hubSummary.levels];
            const totalCount = lvlStats?.total || 0;
            const dueCount = lvlStats?.due || 0;
            const mistakeCount = lvlStats?.mistakes || 0;

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  setSelectedLevel(lvl.id);
                  setSelectedSection('all'); // Reset về xem tất cả của level đó
                }}
                className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-xs font-black tracking-wide ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {lvl.label}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    {totalCount}
                  </span>
                </div>

                {/* Huy hiệu cảnh báo ôn gấp & câu sai */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {dueCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                      isActive ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-100 text-amber-800'
                    }`}>
                      🔥 {dueCount}
                    </span>
                  )}
                  {mistakeCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                      isActive ? 'bg-rose-400 text-slate-950 font-black' : 'bg-rose-100 text-rose-800'
                    }`}>
                      ❌ {mistakeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TẦNG 2: BẢNG ĐIỀU KHIỂN HÀNH ĐỘNG THÔNG MINH CHO LEVEL ĐƯỢC CHỌN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: ÔN TẬP GẤP (SRS DUE) */}
        <div className={`p-5 rounded-3xl border transition-all ${
          (currentLevelSummary?.due || 0) > 0
            ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Ôn Tập Khẩn Cấp (SRS)</span>
            </span>
            <span className="text-2xl font-black text-amber-700">
              {currentLevelSummary?.due || 0}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
            {(currentLevelSummary?.due || 0) > 0
              ? `Có ${currentLevelSummary?.due} thẻ thuộc ${selectedLevel === 'ALL' ? 'toàn bộ sổ tay' : selectedLevel} đã đến hạn ôn tập ngắt quãng hôm nay.`
              : `Hiện không có thẻ nào đến hạn lặp lại trong ${selectedLevel === 'ALL' ? 'toàn bộ sổ tay' : selectedLevel}. Bạn đang ghi nhớ rất tốt!`}
          </p>
          {(currentLevelSummary?.due || 0) > 0 ? (
            <button
              onClick={() => setIsReviewingSrs(true)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Bắt Đầu Ôn Gấp ({currentLevelSummary?.due} thẻ)</span>
            </button>
          ) : (
            <button
              onClick={() => setSelectedSection('due')}
              className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer"
            >
              Xem danh sách đến hạn
            </button>
          )}
        </div>

        {/* CARD 2: NGÂN HÀNG CÂU HỎI LÀM SAI (MISTAKE BANK) */}
        <div className={`p-5 rounded-3xl border transition-all ${
          (currentLevelSummary?.mistakes || 0) > 0
            ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 shadow-sm'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ngân Hàng Câu Sai</span>
            </span>
            <span className="text-2xl font-black text-rose-700">
              {currentLevelSummary?.mistakes || 0}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
            {(currentLevelSummary?.mistakes || 0) > 0
              ? `Đã gom ${currentLevelSummary?.mistakes} câu hỏi trắc nghiệm bạn từng chọn nhầm từ các đề thi ${selectedLevel === 'ALL' ? '' : selectedLevel}.`
              : `Chưa có câu hỏi làm sai nào được ghi nhận từ đề thi ${selectedLevel === 'ALL' ? '' : selectedLevel}.`}
          </p>
          <button
            onClick={() => setSelectedSection('mistakes')}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              selectedSection === 'mistakes'
                ? 'bg-rose-700 text-white shadow-md'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Luyện Lại Câu Sai ({currentLevelSummary?.mistakes || 0})</span>
          </button>
        </div>

        {/* CARD 3: MẸO THI & GHI CHÚ CHUYÊN SÂU */}
        <div className="p-5 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Mẹo Thi & Ghi Chú</span>
            </span>
            <span className="text-2xl font-black text-indigo-700">
              {currentLevelSummary?.note || 0}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
            Gồm các bí quyết làm bài Đọc hiểu Dokkai, lưu ý phân biệt trợ từ và mẹo tránh bẫy ngữ pháp theo cấp độ.
          </p>
          <button
            onClick={() => setSelectedSection('note')}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              selectedSection === 'note'
                ? 'bg-indigo-700 text-white shadow-md'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xem Toàn Bộ Mẹo & Ghi Chú</span>
          </button>
        </div>
      </div>

      {/* 4. TẦNG 3: DANH MỤC THƯ MỤC PHÂN LOẠI & TOOLBAR ĐÓNG MỞ LINH HOẠT */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        {/* HÀNG TAB PHÂN NHÓM NỘI DUNG */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất Cả', icon: Bookmark, count: currentLevelSummary?.total || 0 },
              { id: 'due', label: 'Cần Ôn Gấp', icon: RotateCw, count: currentLevelSummary?.due || 0 },
              { id: 'mistakes', label: 'Câu Sai Đề Thi', icon: AlertTriangle, count: currentLevelSummary?.mistakes || 0 },
              { id: 'vocab', label: 'Từ Vựng', icon: BookOpen, count: currentLevelSummary?.vocab || 0 },
              { id: 'kanji', label: 'Hán Tự', icon: Languages, count: currentLevelSummary?.kanji || 0 },
              { id: 'grammar', label: 'Ngữ Pháp', icon: BookOpenCheck, count: currentLevelSummary?.grammar || 0 },
              { id: 'note', label: 'Mẹo & Ghi Chú', icon: FileText, count: currentLevelSummary?.note || 0 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSection(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleExpandAll(true)}
              title="Mở rộng tất cả các thẻ"
              className="p-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 flex items-center gap-1 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mở tất cả</span>
            </button>

            <button
              onClick={() => toggleExpandAll(false)}
              title="Thu gọn tất cả các thẻ"
              className="p-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 flex items-center gap-1 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thu gọn</span>
            </button>

            <button
              onClick={() => setIsCompactMode(!isCompactMode)}
              title={isCompactMode ? 'Chuyển sang xem dạng thẻ lưới' : 'Chuyển sang xem danh sách thu gọn'}
              className={`p-2 text-xs font-semibold rounded-xl border flex items-center gap-1 transition-colors ${
                isCompactMode ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {isCompactMode ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCompactMode ? 'Dạng Lưới' : 'Dạng Thu Gọn'}</span>
            </button>

            <button
              onClick={loadData}
              title="Đồng bộ dữ liệu CSDL"
              className="p-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* HÀNG TÌM KIẾM & BỘ LỌC SRS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Mọi trạng thái SRS</option>
              <option value="LEARNING">Đang học (Learning)</option>
              <option value="REVIEWING">Cần ôn lại (Reviewing)</option>
              <option value="MASTERED">Đã thành thạo (Mastered)</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo từ vựng, Kanji, nghĩa tiếng Việt, bẫy thi..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* THÔNG BÁO LỖI NẾU CÓ */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 5. DANH SÁCH THẺ ÔN TẬP (HỖ TRỢ CẢ COMPACT LIST VÀ GRID CARD) */}
      {loading && items.length === 0 ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Đang truy xuất CSDL siêu tốc qua bộ đệm Redis...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">
              Không có nội dung nào trong danh mục này ({selectedLevel} - {selectedSection.toUpperCase()})
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Bạn có thể thêm mục mới bằng tay hoặc các câu hỏi làm sai từ Đề Thi Thử sẽ tự động đổ vào đây.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mục mới ngay</span>
          </button>
        </div>
      ) : isCompactMode ? (
        /* CHẾ ĐỘ THU GỌN (COMPACT ACCORDION LIST) */
        <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-200/80 divide-y divide-slate-100">
          {items.map((item) => {
            const isFromExam = Boolean(item.tags?.includes('Thi_thử') || item.tags?.includes('Câu_sai'));
            const isExpanded = !!expandedCards[item.id];
            const isMastered = item.masteryStatus === 'MASTERED';
            const isReviewing = item.masteryStatus === 'REVIEWING';

            return (
              <div key={item.id} className="py-3 px-2 sm:px-3 hover:bg-slate-50/80 rounded-2xl transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleCardExpand(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors mt-0.5 sm:mt-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                      {isFromExam ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          🎯 Đề Thi
                        </span>
                      ) : (
                        getItemTypeBadge(item.itemType)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:text-blue-600 truncate"
                          dangerouslySetInnerHTML={{ __html: item.title }}
                          onClick={() => {
                            setSelectedNotebookItem(item);
                            setIsDetailModalOpen(true);
                          }}
                        />
                        {item.reading && (
                          <span className="text-xs text-slate-400 hidden sm:inline truncate">
                            {item.reading}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate" dangerouslySetInnerHTML={{ __html: item.meaningVi }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Audio */}
                    {!isFromExam && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(item.title);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Phát âm tiếng Nhật"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Toggle SRS */}
                    <button
                      onClick={() => {
                        const nextStatus = item.masteryStatus === 'LEARNING' ? 'REVIEWING' : item.masteryStatus === 'REVIEWING' ? 'MASTERED' : 'LEARNING';
                        handleToggleMastery(item.id, nextStatus as any);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-colors ${
                        isMastered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isReviewing ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {isMastered ? 'Đã thuộc ✓' : isReviewing ? 'Cần ôn ↺' : 'Đang học'}
                    </button>

                    {/* Chi tiết */}
                    <button
                      onClick={() => {
                        setSelectedNotebookItem(item);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                      title="Xem chi tiết"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    {/* Xóa */}
                    <button
                      onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa mục"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* KHỐI NỘI DUNG MỞ RỘNG (KHI EXPANDED TRONG COMPACT MODE) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700 space-y-2 bg-slate-50/50 p-3 rounded-xl animate-fadeIn">
                    {item.exampleJp && (
                      <div className="text-slate-900 font-medium whitespace-pre-wrap">
                        <strong className="text-slate-500 font-bold block text-[11px]">Nội dung câu / Ví dụ:</strong>
                        <div dangerouslySetInnerHTML={{ __html: formatText(item.exampleJp) }} />
                      </div>
                    )}
                    {item.exampleVi && (
                      <div className="text-slate-600">
                        <strong className="text-slate-500 font-bold block text-[11px]">Dịch nghĩa câu:</strong>
                        <div dangerouslySetInnerHTML={{ __html: item.exampleVi }} />
                      </div>
                    )}
                    {item.note && (
                      <div className="text-indigo-900 bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-100">
                        <strong className="text-indigo-700 font-bold block text-[11px] mb-1">Mẹo / Phân tích bẫy thi:</strong>
                        <div dangerouslySetInnerHTML={{ __html: item.note.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* CHẾ ĐỘ XEM THẺ LƯỚI (GRID CARDS CHUYÊN NGHIỆP) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isFromExam = Boolean(item.tags?.includes('Thi_thử') || item.tags?.includes('Câu_sai'));
            const isMastered = item.masteryStatus === 'MASTERED';
            const isReviewing = item.masteryStatus === 'REVIEWING';

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 hover:border-blue-300 flex flex-col h-full"
              >
                <div className="flex-1 flex flex-col">
                  {/* Header thẻ: Badge, Level, SRS toggle, Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center flex-wrap gap-1.5">
                      {isFromExam ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          🎯 Đề Thi
                        </span>
                      ) : (
                        getItemTypeBadge(item.itemType)
                      )}
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const nextStatus = item.masteryStatus === 'LEARNING' ? 'REVIEWING' : item.masteryStatus === 'REVIEWING' ? 'MASTERED' : 'LEARNING';
                          handleToggleMastery(item.id, nextStatus as any);
                        }}
                        title="Bấm để chuyển trạng thái SRS"
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

                      <button
                        onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                        title="Xóa khỏi sổ tay"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tiêu đề tiếng Nhật */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {isFromExam ? (
                          <>
                            <div className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: item.title }} />
                            <h3
                              className="text-base font-bold text-slate-900 line-clamp-3 cursor-pointer hover:text-blue-600 transition-colors leading-relaxed whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: formatText(item.exampleJp || item.meaningVi || item.title) }}
                              onClick={() => {
                                setSelectedNotebookItem(item);
                                setIsDetailModalOpen(true);
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <h3
                              className="text-xl font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                              dangerouslySetInnerHTML={{ __html: item.title }}
                              onClick={() => {
                                setSelectedNotebookItem(item);
                                setIsDetailModalOpen(true);
                              }}
                            />
                            {item.reading && <div className="text-[13px] text-slate-500 font-medium mt-0.5">{item.reading}</div>}
                          </>
                        )}
                      </div>

                      {!isFromExam && (
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

                  {/* Nghĩa tiếng Việt */}
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

                {/* Footer thẻ: Nút xem giải thích chi tiết */}
                <div className="mt-auto pt-3 border-t border-slate-100">
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

      {/* 6. MODAL LUYỆN TẬP FLASHCARD NHANH */}
      {isFlashcardMode && items.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Luyện Flashcard ({flashcardIndex + 1}/{items.length})
                </h3>
              </div>
              <button
                onClick={() => setIsFlashcardMode(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div
                onClick={() => setIsCurrentCardFlipped(!isCurrentCardFlipped)}
                className="w-full h-full cursor-pointer flex flex-col items-center justify-center space-y-4"
              >
                {!isCurrentCardFlipped ? (
                  <>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      Mặt Trước • Bấm để lật
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
                      dangerouslySetInnerHTML={{ __html: items[flashcardIndex]?.title || '' }}
                    />
                    {items[flashcardIndex]?.reading && (
                      <p className="text-sm text-slate-500">{items[flashcardIndex]?.reading}</p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Mặt Sau • Ý Nghĩa & Ví Dụ
                    </span>
                    <div
                      className="text-xl font-bold text-slate-800"
                      dangerouslySetInnerHTML={{ __html: items[flashcardIndex]?.meaningVi || '' }}
                    />
                    {items[flashcardIndex]?.exampleJp && (
                      <p className="text-xs text-slate-500 max-w-md italic mt-2">
                        {items[flashcardIndex]?.exampleJp}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleToggleMastery(items[flashcardIndex].id, 'LEARNING');
                    if (flashcardIndex < items.length - 1) setFlashcardIndex(flashcardIndex + 1);
                    setIsCurrentCardFlipped(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Chưa thuộc
                </button>
                <button
                  onClick={() => {
                    handleToggleMastery(items[flashcardIndex].id, 'REVIEWING');
                    if (flashcardIndex < items.length - 1) setFlashcardIndex(flashcardIndex + 1);
                    setIsCurrentCardFlipped(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold cursor-pointer"
                >
                  Cần ôn
                </button>
                <button
                  onClick={() => {
                    handleToggleMastery(items[flashcardIndex].id, 'MASTERED');
                    if (flashcardIndex < items.length - 1) setFlashcardIndex(flashcardIndex + 1);
                    setIsCurrentCardFlipped(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Đã thuộc ✓
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setFlashcardIndex(flashcardIndex - 1);
                    setIsCurrentCardFlipped(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={flashcardIndex === items.length - 1}
                  onClick={() => {
                    setFlashcardIndex(flashcardIndex + 1);
                    setIsCurrentCardFlipped(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL THÊM MỚI MỤC VÀO SỔ TAY */}
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
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

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Phiên Âm (Hiragana / Hán Việt)
                </label>
                <input
                  type="text"
                  value={formData.reading || ''}
                  onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                  placeholder="Ví dụ: いちごいちえ, NHẤT KỲ NHẤT HỘI"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Ý Nghĩa Tiếng Việt <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.meaningVi}
                  onChange={(e) => setFormData({ ...formData, meaningVi: e.target.value })}
                  placeholder="Nhập nghĩa tiếng Việt..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Câu Ví Dụ Minh Họa
                </label>
                <input
                  type="text"
                  value={formData.exampleJp || ''}
                  onChange={(e) => setFormData({ ...formData, exampleJp: e.target.value })}
                  placeholder="Ví dụ tiếng Nhật..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                />
                <input
                  type="text"
                  value={formData.exampleVi || ''}
                  onChange={(e) => setFormData({ ...formData, exampleVi: e.target.value })}
                  placeholder="Dịch nghĩa câu ví dụ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Ghi Chú Cá Nhân / Mẹo Nhớ
                </label>
                <input
                  type="text"
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Mẹo nhớ, lưu ý..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
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

      {/* 8. MODAL CHI TIẾT SỔ TAY */}
      {isDetailModalOpen && selectedNotebookItem && (
        (() => {
          let noteText = selectedNotebookItem.note || '';
          const metaMatch = noteText.match(/<!-- META: ([\s\S]*?) -->/);
          let metaData: any = null;
          if (metaMatch && metaMatch[1]) {
            try {
              metaData = JSON.parse(metaMatch[1]);
            } catch (e) {}
          }

          noteText = noteText.replace(new RegExp('<!-- META:[\\s\\S]*?-->', 'g'), '').trim();

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsAnalyzingAi(false);
                  setAiAnalysisResult(null);
                }}
              />
              <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-fadeIn">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getItemTypeBadge(selectedNotebookItem.itemType)}
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getLevelColor(selectedNotebookItem.level)}`}>
                      {selectedNotebookItem.level}
                    </span>
                    {selectedNotebookItem.tags?.includes('Thi_thử') || selectedNotebookItem.tags?.includes('Câu_sai') ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        🎯 Từ Đề Thi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        📚 Từ Bài Học
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsAnalyzingAi(false);
                      setAiAnalysisResult(null);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h2
                      className="text-2xl font-bold text-slate-900 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatText(selectedNotebookItem.exampleJp || selectedNotebookItem.title) }}
                    />
                    {selectedNotebookItem.reading && (
                      <div className="text-slate-500 font-medium text-base mt-1">
                        {selectedNotebookItem.reading}
                      </div>
                    )}
                  </div>

                  {/* Nghĩa Tiếng Việt */}
                  {selectedNotebookItem.meaningVi && (
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-slate-800 text-base leading-relaxed">
                      <div className="font-bold text-indigo-900 mb-2 text-xs uppercase tracking-wider">
                        Ý nghĩa / Dịch nghĩa:
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: selectedNotebookItem.meaningVi }} />
                    </div>
                  )}

                  {/* Options nếu có */}
                  {metaData && metaData.options && metaData.options.length > 0 && (
                    <div className="space-y-3">
                      <div className="font-bold text-slate-900 text-sm">Các phương án lựa chọn:</div>
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
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : isWrong
                                  ? 'bg-rose-50 border-rose-300 text-rose-900'
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
                                <div className="text-xs font-bold text-rose-600 mt-1.5 ml-9">❌ Bạn đã chọn nhầm</div>
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
                  {noteText ? (
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-sm">
                      <div className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                        <div dangerouslySetInnerHTML={{ __html: noteText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 font-bold">$1</strong>') }} />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="sticky bottom-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsAnalyzingAi(false);
                      setAiAnalysisResult(null);
                    }}
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

      {/* 9. MODAL PHÂN TÍCH NGỮ PHÁP AI */}
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

      {/* 10. MODAL XÁC NHẬN XÓA */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-2 items-center text-center">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Xóa khỏi Sổ tay?</h3>
              <p className="text-sm font-semibold text-slate-500">
                Bạn có chắc chắn muốn xóa mục <span className="text-slate-800 font-bold">"{itemToDelete.title}"</span>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-md shadow-rose-200 active:scale-95 cursor-pointer"
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
