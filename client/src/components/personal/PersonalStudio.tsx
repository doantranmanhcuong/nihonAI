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
import { ExamApi } from '../exam/exam.api';
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
      // Đồng bộ bộ lọc: Với các tab Từ vựng / Hán tự / Ngữ pháp / Ghi chú, truyền trực tiếp itemType để khớp 100% với số đếm trên tab (kể cả thẻ từ Đề thi)
      const itemTypeFromSection =
        selectedSection === 'vocab'
          ? 'VOCAB'
          : selectedSection === 'kanji'
          ? 'KANJI'
          : selectedSection === 'grammar'
          ? 'GRAMMAR'
          : selectedSection === 'note'
          ? 'NOTE'
          : undefined;

      const sectionParam =
        selectedSection === 'due' || selectedSection === 'mistakes'
          ? selectedSection
          : undefined;

      const [itemsData, summaryData, statsData] = await Promise.all([
        NotebookApi.getItems({
          level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
          itemType: itemTypeFromSection as any,
          section: sectionParam,
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

  // Làm sạch chuỗi tiếng Nhật (bỏ thẻ ruby/rt, khoảng trống ___, dấu ★) trước khi đọc TTS
  const stripHtmlForSpeech = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<rt>.*?<\/rt>/g, '')
      .replace(/<rp>.*?<\/rp>/g, '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[（(][\s_＿★＊*]+[)）]/g, ' ')
      .replace(/[_＿★]/g, ' ')
      .replace(/\*\*/g, '')
      .trim();
  };

  // 1-Chạm đổi trạng thái SRS
  const handleToggleMastery = async (id: string, newStatus: MasteryStatus) => {
    try {
      const updated = await NotebookApi.toggleMastery(id, newStatus);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
      setSelectedNotebookItem((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
      NotebookApi.getHubSummary().then((s) => setHubSummary(s)).catch(() => {});
      NotebookApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể lưu trạng thái vào CSDL.');
    }
  };

  // Phân tích chuyên sâu mục sổ tay với AI và tự động lưu vĩnh viễn vào CSDL
  const handleAnalyzeNotebookItemWithAI = async (item: NotebookItem, metaData: any, cleanNoteText: string) => {
    if (isAnalyzingAi) return;
    setIsAnalyzingAi(true);
    try {
      // 1. Ưu tiên gọi API /api/notebook/:id/analyze (tự động phân tích + lưu CSDL trên server)
      const analyzedItem = await NotebookApi.analyzeWithAI(item.id);
      if (analyzedItem) {
        setSelectedNotebookItem(analyzedItem);
        setItems((prev) => prev.map((it) => (it.id === item.id ? analyzedItem : it)));
        setIsAnalyzingAi(false);
        return;
      }

      // 2. Dự phòng (Fallback): Nếu câu hỏi có questionId từ Đề thi, gọi ExamApi.explainWithAI và lưu lại bằng NotebookApi.updateItem
      if (metaData?.questionId) {
        const aiRes = await ExamApi.explainWithAI(
          metaData.questionId,
          metaData.userAnswer !== undefined ? metaData.userAnswer : null
        );
        if (aiRes) {
          const updatedMeta = {
            ...metaData,
            aiDetailed: {
              completedSentence: aiRes.completedSentence || '',
              grammarFormula: aiRes.grammarFormula || aiRes.keyGrammarOrVocab || '',
              explanation: aiRes.explanation || '',
              trapAnalysis: aiRes.trapAnalysis || '',
              optionBreakdowns: aiRes.optionBreakdowns || [],
              studyTips: aiRes.studyTips || '',
              analyzedAt: new Date().toISOString()
            }
          };
          const newNote = `${cleanNoteText}\n<!-- META: ${JSON.stringify(updatedMeta)} -->`;
          const updatedItem = await NotebookApi.updateItem(item.id, {
            note: newNote,
            structure: aiRes.grammarFormula || item.structure || undefined
          });
          setSelectedNotebookItem(updatedItem);
          setItems((prev) => prev.map((it) => (it.id === item.id ? updatedItem : it)));
          setIsAnalyzingAi(false);
          return;
        }
      }

      // 3. Dự phòng tạo Mẹo nhớ AI cho từ vựng/ngữ pháp thông thường
      const mnemonicItem = await NotebookApi.generateMnemonic(item.id);
      if (mnemonicItem) {
        setSelectedNotebookItem(mnemonicItem);
        setItems((prev) => prev.map((it) => (it.id === item.id ? mnemonicItem : it)));
      }
    } catch (err) {
      console.error('Lỗi khi phân tích chuyên sâu với AI:', err);
    } finally {
      setIsAnalyzingAi(false);
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

  // Trích xuất thông minh Nhãn nguồn gốc (Đề thi số mấy / Giáo trình nào), Từ khóa trọng tâm ngắn gọn và Tóm tắt lỗi sai
  const getSmartCardDisplay = (item: NotebookItem) => {
    const rawNote = item.note || '';
    const metaMatch = rawNote.match(/<!-- META: ([\s\S]*?) -->/);
    let metaData: any = null;
    if (metaMatch && metaMatch[1]) {
      try {
        metaData = JSON.parse(metaMatch[1]);
      } catch {}
    }

    const cleanNote = rawNote
      .replace(/<!-- META:[\s\S]*?-->/g, '')
      .replace(/Mẫu ngữ pháp trọng tâm:\s*Cấu trúc câu chuẩn đề thi JLPT\s*•\s*Lưu ý thể liên kết, quan hệ nhân quả và sắc thái câu\.?/gi, '')
      .replace(/Từ vựng & Hán tự cốt lõi:.*?•\s*Mẹo nhận diện âm On\/Kun và ngữ cảnh chuẩn xác\.?/gi, '')
      .trim();

    const isFromExam = Boolean(item.tags?.includes('Thi_thử') || item.tags?.includes('Câu_sai') || metaData);
    const hasOptions = Array.isArray(metaData?.options) && metaData.options.length > 0;
    const correctOpt = hasOptions && metaData.correctIndex !== undefined ? metaData.options[metaData.correctIndex] : '';
    const userOpt = hasOptions && metaData.userAnswer !== undefined && metaData.userAnswer !== null ? metaData.options[metaData.userAnswer] : '';

    // 1. Nhãn nguồn gốc cụ thể (Đề thi số mấy / Câu mấy HOẶC Giáo trình nào / Bài mấy)
    let sourceBadgeText = '';
    let subCategoryBadge = '';

    if (isFromExam) {
      const titleMatch = (item.title || '').match(/^\[(.*?)\]\s*(Câu\s*\d+)\s*:\s*(.*)$/i);
      const rawBracket = metaData?.examTitle || (titleMatch ? titleMatch[1] : `Đề thi ${item.level}`);
      const questionNo = metaData?.orderNumber ? `Câu ${metaData.orderNumber}` : (titleMatch ? titleMatch[2] : '');
      const examLabel = /^N\d$/i.test(rawBracket.trim()) ? `Đề thi ${rawBracket.trim().toUpperCase()}` : rawBracket.trim();
      sourceBadgeText = questionNo ? `🎯 ${examLabel} • ${questionNo}` : `🎯 ${examLabel}`;
      subCategoryBadge = metaData?.subTypeLabel || item.reading || (titleMatch ? titleMatch[3] : '') || (item.itemType === 'GRAMMAR' ? 'Ngữ pháp' : 'Từ vựng');
    } else {
      const tagParts = (item.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t && !t.startsWith('JLPT_') && t !== 'Thi_thử' && t !== 'Câu_sai');

      const curriculumTag = tagParts.find((t) =>
        /minna|tango|mimikara|shinkanzen|soumatome|dokkai|bài|giáo trình|tra cứu/i.test(t)
      );
      const posTag = tagParts.find((t) => t !== curriculumTag);

      if (curriculumTag) {
        sourceBadgeText = `📘 ${curriculumTag}`;
      } else if (item.itemType === 'VOCAB') {
        const defaultBook = item.level === 'N5' || item.level === 'N4' ? 'Giáo trình Minna / Tango' : 'Giáo trình Tango / Mimikara';
        sourceBadgeText = `📘 ${defaultBook} ${item.level}`;
      } else if (item.itemType === 'GRAMMAR') {
        const defaultBook = item.level === 'N5' || item.level === 'N4' ? 'Giáo trình Minna' : 'Giáo trình Shinkanzen';
        sourceBadgeText = `📗 ${defaultBook} ${item.level}`;
      } else if (item.itemType === 'KANJI') {
        sourceBadgeText = `📙 Hán tự JLPT ${item.level}`;
      } else {
        sourceBadgeText = `📒 Sổ tay Mẹo & Ghi chú ${item.level}`;
      }
      subCategoryBadge = posTag || '';
    }

    // 2. Tiêu đề ngắn gọn (Từ khóa trọng tâm / Cấu trúc ngữ pháp thay vì nguyên câu dài ngoằng)
    let compactHeadline = item.title;
    let compactSubHeadline = item.reading || '';

    if (isFromExam) {
      const fullQ = item.exampleJp || metaData?.question || '';
      const boldMatch = fullQ.match(/\*\*(.*?)\*\*/);
      const quotedInNote = cleanNote.match(/「([^」]+)」/g);

      if (boldMatch && boldMatch[1]) {
        // Câu từ vựng có từ in đậm **時刻** -> hiển thị "時刻 ➔ じこく"
        compactHeadline = correctOpt ? `${boldMatch[1]} ➔ ${correctOpt}` : boldMatch[1];
      } else if (metaData?.aiDetailed?.grammarFormula) {
        compactHeadline = metaData.aiDetailed.grammarFormula.split('•')[0].trim();
      } else if (quotedInNote && quotedInNote.length > 0) {
        compactHeadline = quotedInNote.slice(0, 2).join(' ➔ ');
      } else if (correctOpt) {
        compactHeadline = `Đáp án: ${correctOpt}`;
      }
      compactSubHeadline = stripHtmlForSpeech(fullQ);
    }

    const cleanMeaningVi = (item.meaningVi || '').replace(/^\[.*?\]\s*/, '').trim();

    return {
      isFromExam,
      metaData,
      cleanNote,
      hasOptions,
      correctOpt,
      userOpt,
      sourceBadgeText,
      subCategoryBadge,
      compactHeadline,
      compactSubHeadline,
      cleanMeaningVi
    };
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
              Không có nội dung nào phù hợp với bộ lọc hiện tại ({selectedLevel})
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {selectedStatus !== 'ALL' || searchQuery.trim()
                ? 'Bạn đang bật bộ lọc trạng thái SRS hoặc từ khóa tìm kiếm. Hãy bấm nút bên dưới để xem lại toàn bộ danh mục.'
                : 'Bạn có thể thêm mục mới bằng tay hoặc lưu từ vựng, ngữ pháp, câu hỏi làm sai từ Đề Thi Thử.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(selectedStatus !== 'ALL' || searchQuery.trim() || selectedSection !== 'all') && (
              <button
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSearchQuery('');
                  if (selectedSection === 'due') setSelectedSection('all');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Đặt lại bộ lọc hiển thị</span>
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mục mới ngay</span>
            </button>
          </div>
        </div>
      ) : isCompactMode ? (
        /* CHẾ ĐỘ THU GỌN (COMPACT ACCORDION LIST - THIẾT KẾ GỌN GÀNG, RÕ NGUỒN ĐỀ THI / GIÁO TRÌNH) */
        <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-200/80 divide-y divide-slate-100">
          {items.map((item) => {
            const cardInfo = getSmartCardDisplay(item);
            const isExpanded = !!expandedCards[item.id];
            const isMastered = item.masteryStatus === 'MASTERED';
            const isReviewing = item.masteryStatus === 'REVIEWING';

            return (
              <div key={item.id} className="py-3.5 px-2 sm:px-3.5 hover:bg-slate-50/80 rounded-2xl transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleCardExpand(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors mt-0.5 sm:mt-0 shrink-0 cursor-pointer"
                      title={isExpanded ? 'Thu gọn' : 'Mở rộng xem nhanh'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* CỤM NHÃN PHÂN LOẠI: CẤP ĐỘ + NGUỒN (ĐỀ SỐ MẤY / GIÁO TRÌNH NÀO) + LOẠI */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                      {getItemTypeBadge(item.itemType)}
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border ${
                          cardInfo.isFromExam
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {cardInfo.sourceBadgeText}
                      </span>
                      {cardInfo.subCategoryBadge && (
                        <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600">
                          {cardInfo.subCategoryBadge}
                        </span>
                      )}
                    </div>

                    {/* NỘI DUNG CHÍNH: TỪ KHÓA TRỌNG TÂM NGẮN GỌN + NGHĨA 1 DÒNG */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        setSelectedNotebookItem(item);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span
                          className="font-black text-slate-900 text-sm sm:text-[15px] hover:text-blue-600 truncate shrink-0 max-w-[260px] sm:max-w-[340px]"
                          dangerouslySetInnerHTML={{ __html: cardInfo.compactHeadline }}
                        />
                        {cardInfo.compactSubHeadline && (
                          <span className="text-xs text-slate-400 truncate hidden sm:inline">
                            • {cardInfo.compactSubHeadline}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs text-slate-600 truncate mt-0.5"
                        dangerouslySetInnerHTML={{ __html: cardInfo.cleanMeaningVi }}
                      />
                    </div>
                  </div>

                  {/* CỤM NÚT BÊN PHẢI: TÓM TẮT ĐÁP ÁN NHANH + LOA + SRS + CHI TIẾT */}
                  <div className="flex items-center flex-wrap gap-2 shrink-0 self-end lg:self-center">
                    {cardInfo.isFromExam && cardInfo.correctOpt && (
                      <div className="hidden xl:flex items-center gap-1.5 text-[11px]">
                        {cardInfo.userOpt && cardInfo.userOpt !== cardInfo.correctOpt && (
                          <span
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold max-w-[130px] truncate"
                            dangerouslySetInnerHTML={{ __html: `❌ ${cardInfo.userOpt}` }}
                          />
                        )}
                        <span
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold max-w-[140px] truncate"
                          dangerouslySetInnerHTML={{ __html: `✅ ${cardInfo.correctOpt}` }}
                        />
                      </div>
                    )}

                    {/* Audio cho cả từ vựng lẫn câu đề thi */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakJapanese(stripHtmlForSpeech(item.exampleJp || item.title));
                      }}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Phát âm tiếng Nhật"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Toggle SRS */}
                    <button
                      onClick={() => {
                        const nextStatus = item.masteryStatus === 'LEARNING' ? 'REVIEWING' : item.masteryStatus === 'REVIEWING' ? 'MASTERED' : 'LEARNING';
                        handleToggleMastery(item.id, nextStatus as any);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        isMastered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isReviewing ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {isMastered ? 'Đã thuộc ✓' : isReviewing ? 'Cần ôn ↺' : 'Đang học'}
                    </button>

                    {/* Chi tiết 4 tầng */}
                    <button
                      onClick={() => {
                        setSelectedNotebookItem(item);
                        setIsDetailModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Xem giải thích 4 tầng & AI"
                    >
                      <span>Giải thích</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Xóa */}
                    <button
                      onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa mục"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* KHỐI NỘI DUNG MỞ RỘNG (KHI EXPANDED TRONG COMPACT MODE - ĐÃ ĐỒNG BỘ 4 ĐÁP ÁN & GIẢI THÍCH SẠCH) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700 space-y-2.5 bg-slate-50/70 p-3.5 rounded-2xl animate-fadeIn">
                    {item.exampleJp && (
                      <div className="text-slate-900 font-medium whitespace-pre-wrap flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider mb-0.5">
                            {cardInfo.isFromExam ? 'Câu hỏi gốc trong đề thi:' : 'Câu ví dụ tiếng Nhật:'}
                          </strong>
                          <div className="text-sm sm:text-base font-bold" dangerouslySetInnerHTML={{ __html: formatText(item.exampleJp) }} />
                        </div>
                        <button
                          onClick={() => speakJapanese(stripHtmlForSpeech(item.exampleJp || ''))}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 shrink-0 cursor-pointer"
                          title="Nghe câu tiếng Nhật"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {cardInfo.hasOptions && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                        {cardInfo.metaData.options.map((opt: string, idx: number) => {
                          const isCorrect = idx === Number(cardInfo.metaData.correctIndex);
                          const isUserPick = cardInfo.metaData.userAnswer !== null && cardInfo.metaData.userAnswer !== undefined && idx === Number(cardInfo.metaData.userAnswer);
                          const optVi = Array.isArray(cardInfo.metaData.optionsVi) ? cardInfo.metaData.optionsVi[idx] : '';
                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl border text-xs flex flex-col justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : isUserPick
                                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-black">{idx + 1}.</span>
                                <span dangerouslySetInnerHTML={{ __html: opt }} />
                                {isCorrect && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                                {!isCorrect && isUserPick && <span className="ml-auto text-rose-600 font-bold">✕</span>}
                              </div>
                              {optVi && <div className="text-[11px] text-slate-500 mt-1 font-normal">Nghĩa: {optVi}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {cardInfo.cleanNote && (
                      <div className="text-indigo-950 bg-indigo-50/80 p-3 rounded-xl border border-indigo-100 leading-relaxed whitespace-pre-wrap">
                        <strong className="text-indigo-700 font-bold block text-[11px] uppercase tracking-wider mb-1">
                          💡 Giải thích & Mẹo ghi nhớ:
                        </strong>
                        <div dangerouslySetInnerHTML={{ __html: cardInfo.cleanNote.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setSelectedNotebookItem(item);
                          setIsDetailModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mở bảng Phân tích chuyên sâu 4 tầng & AI</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* CHẾ ĐỘ XEM THẺ LƯỚI (GRID CARDS CHUYÊN NGHIỆP - RÕ NGUỒN ĐỀ THI / GIÁO TRÌNH & TÓM TẮT ĐÁP ÁN) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const cardInfo = getSmartCardDisplay(item);
            const isMastered = item.masteryStatus === 'MASTERED';
            const isReviewing = item.masteryStatus === 'REVIEWING';

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 hover:border-blue-300 flex flex-col h-full"
              >
                <div className="flex-1 flex flex-col">
                  {/* Header thẻ: Level + Loại + Nguồn cụ thể + SRS toggle + Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                      {getItemTypeBadge(item.itemType)}
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

                  {/* Hàng nhãn Nguồn gốc cụ thể (Đề thi số mấy / Giáo trình nào) */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${
                        cardInfo.isFromExam
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {cardInfo.sourceBadgeText}
                    </span>
                    {cardInfo.subCategoryBadge && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-600">
                        {cardInfo.subCategoryBadge}
                      </span>
                    )}
                  </div>

                  {/* Tiêu đề tiếng Nhật & Từ khóa trọng tâm */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {cardInfo.isFromExam ? (
                          <>
                            <div
                              className="inline-block px-2.5 py-1 rounded-xl bg-teal-50 text-teal-900 border border-teal-200 text-xs font-black mb-1.5"
                              dangerouslySetInnerHTML={{ __html: `🎯 Trọng tâm: ${cardInfo.compactHeadline}` }}
                            />
                            <h3
                              className="text-[15px] font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-relaxed whitespace-pre-wrap"
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(stripHtmlForSpeech(item.exampleJp || item.title));
                        }}
                        title="Phát âm tiếng Nhật chuẩn"
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer shrink-0 mt-1"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Nếu là câu sai từ đề thi: hiển thị tóm tắt Bạn chọn vs Đáp án đúng */}
                    {cardInfo.isFromExam && cardInfo.correctOpt && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {cardInfo.userOpt && cardInfo.userOpt !== cardInfo.correctOpt && (
                          <span
                            className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold"
                            dangerouslySetInnerHTML={{ __html: `❌ Chọn: ${cardInfo.userOpt}` }}
                          />
                        )}
                        <span
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                          dangerouslySetInnerHTML={{ __html: `✅ Đúng: ${cardInfo.correctOpt}` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Nghĩa tiếng Việt */}
                  {cardInfo.cleanMeaningVi && (
                    <div
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-600 font-medium mb-4 line-clamp-2 cursor-pointer hover:bg-slate-100 transition-colors"
                      dangerouslySetInnerHTML={{ __html: cardInfo.cleanMeaningVi }}
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
                    <span>Xem giải thích chi tiết (4 tầng & AI)</span>
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
                {(() => {
                  const fcItem = items[flashcardIndex];
                  const fcInfo = fcItem ? getSmartCardDisplay(fcItem) : null;
                  if (!fcItem || !fcInfo) return null;

                  return !isCurrentCardFlipped ? (
                    <>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        {fcInfo.sourceBadgeText} • Bấm để lật
                      </span>
                      <h2
                        className={`${
                          fcInfo.isFromExam ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
                        } font-black text-slate-900 tracking-tight leading-relaxed`}
                        dangerouslySetInnerHTML={{
                          __html: fcInfo.isFromExam ? formatText(fcItem.exampleJp || fcItem.title) : fcItem.title
                        }}
                      />
                      {fcItem.reading && (
                        <p className="text-sm text-slate-500">{fcItem.reading}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Mặt Sau • Ý Nghĩa & Giải Thích
                      </span>
                      {fcInfo.isFromExam && fcInfo.correctOpt && (
                        <div
                          className="text-lg font-black text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-200"
                          dangerouslySetInnerHTML={{ __html: `✅ Đáp án: ${fcInfo.correctOpt}` }}
                        />
                      )}
                      <div
                        className="text-lg sm:text-xl font-bold text-slate-800"
                        dangerouslySetInnerHTML={{ __html: fcInfo.cleanMeaningVi }}
                      />
                      {fcInfo.cleanNote && (
                        <div
                          className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 max-w-md text-left whitespace-pre-wrap leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: fcInfo.cleanNote.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                        />
                      )}
                    </>
                  );
                })()}
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

      {/* 8. MODAL CHI TIẾT SỔ TAY (NÂNG CẤP 4 TẦNG PHÂN TÍCH CHUYÊN SÂU & AI AUTO-SAVE) */}
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

          const aiDetailed = metaData?.aiDetailed || null;
          const mainJpText = selectedNotebookItem.exampleJp || selectedNotebookItem.title || '';
          const isStarQuestion = mainJpText.includes('★') || (metaData?.question || '').includes('★');
          const hasOptions = Array.isArray(metaData?.options) && metaData.options.length > 0;
          const correctOptText = hasOptions && metaData.correctIndex !== undefined ? metaData.options[metaData.correctIndex] : '';
          const userOptText = hasOptions && metaData.userAnswer !== undefined && metaData.userAnswer !== null ? metaData.options[metaData.userAnswer] : '';

          // 1. Khắc phục triệt để lỗi lặp lại câu đề bài trong ô "Cấu trúc ngữ pháp trọng tâm" (kể cả dữ liệu cũ đã lưu trong DB)
          const rawStructure = (selectedNotebookItem.structure || '').trim();
          const isDuplicateQuestionStructure =
            !rawStructure ||
            rawStructure === (selectedNotebookItem.exampleJp || '').trim() ||
            rawStructure === (selectedNotebookItem.title || '').trim() ||
            rawStructure === (metaData?.question || '').trim() ||
            rawStructure.includes('___') ||
            rawStructure.includes('★');

          let effectiveStructure = '';
          if (aiDetailed?.grammarFormula) {
            effectiveStructure = aiDetailed.grammarFormula;
          } else if (!isDuplicateQuestionStructure) {
            effectiveStructure = rawStructure;
          } else {
            // Trích xuất mẫu câu nằm trong dấu 「...」 từ phần giải thích hoặc lấy đáp án đúng
            const quotedMatches = noteText.match(/「([^」]+)」/g);
            if (quotedMatches && quotedMatches.length > 0) {
              effectiveStructure = quotedMatches.join(' • ');
            } else if (correctOptText) {
              const optVi = Array.isArray(metaData?.optionsVi) ? metaData.optionsVi[metaData.correctIndex] : '';
              effectiveStructure = `「${correctOptText}」${optVi ? ` — ${optVi}` : ''}`;
            }
          }

          // 2. Tự động tái tạo Câu hoàn chỉnh sau khi lắp đáp án đúng (nếu chưa có aiDetailed.completedSentence)
          let autoCompletedSentence = aiDetailed?.completedSentence || '';
          if (!autoCompletedSentence && hasOptions && correctOptText && !isStarQuestion) {
            const blankRegex = /([（(][\s_＿*＊]+[)）]|[_＿]{2,})/;
            if (blankRegex.test(mainJpText)) {
              autoCompletedSentence = mainJpText.replace(
                blankRegex,
                `<strong class="text-emerald-700 underline decoration-2 underline-offset-4 px-1">${correctOptText}</strong>`
              );
            }
          }

          // 3. Làm sạch các câu văn mẫu rập khuôn cũ trong noteText để hiển thị rõ ràng, tách bạch từng ý
          const cleanedLines = noteText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) =>
              line
                .replace(/Mẫu ngữ pháp trọng tâm:\s*Cấu trúc câu chuẩn đề thi JLPT\s*•\s*Lưu ý thể liên kết, quan hệ nhân quả và sắc thái câu\.?/gi, '')
                .replace(/Từ vựng & Hán tự cốt lõi:.*?•\s*Mẹo nhận diện âm On\/Kun và ngữ cảnh chuẩn xác\.?/gi, '')
                .trim()
            )
            .filter((line) => line && line !== '🎯 Trọng tâm:' && line !== '💡 Mẹo phòng thi:');

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
                {/* HEADER MODAL */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                  {(() => {
                    const modalCardInfo = getSmartCardDisplay(selectedNotebookItem);
                    return (
                      <div className="flex items-center flex-wrap gap-2">
                        {getItemTypeBadge(selectedNotebookItem.itemType)}
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getLevelColor(selectedNotebookItem.level)}`}>
                          {selectedNotebookItem.level}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${
                            modalCardInfo.isFromExam
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {modalCardInfo.sourceBadgeText}
                        </span>
                        {modalCardInfo.subCategoryBadge && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-600">
                            {modalCardInfo.subCategoryBadge}
                          </span>
                        )}
                        {aiDetailed && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Đã phân tích AI
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsAnalyzingAi(false);
                      setAiAnalysisResult(null);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* TẦNG 1: CÂU HỎI GỐC & NÚT NGHE PHÁT ÂM (TTS) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {selectedNotebookItem.reading && (
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {selectedNotebookItem.reading}
                        </div>
                      )}
                      <h2
                        className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatText(mainJpText) }}
                      />
                    </div>
                    <button
                      onClick={() => speakJapanese(stripHtmlForSpeech(autoCompletedSentence || mainJpText))}
                      title="Nghe phát âm câu tiếng Nhật"
                      className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* KHỐI HIỂN THỊ CÂU HOÀN CHỈNH HOẶC THỨ TỰ GHÉP DẤU ★ (MONDAI 5) */}
                  {(autoCompletedSentence || isStarQuestion) && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {isStarQuestion ? 'Đáp án vị trí ★ & Thứ tự ghép câu (Mondai 5):' : 'Câu hoàn chỉnh sau khi điền đáp án đúng:'}
                        </span>
                        {autoCompletedSentence && (
                          <button
                            onClick={() => speakJapanese(stripHtmlForSpeech(autoCompletedSentence))}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Nghe câu chuẩn
                          </button>
                        )}
                      </div>
                      {autoCompletedSentence ? (
                        <div
                          className="text-base font-bold text-slate-900 leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: formatText(autoCompletedSentence) }}
                        />
                      ) : (
                        <div className="text-sm text-emerald-900 font-medium">
                          Mảnh ghép chính xác tại vị trí <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 rounded-full font-bold text-xs mx-0.5">★</span> là phương án <strong>[{Number(metaData?.correctIndex) + 1}]</strong>:{' '}
                          <span className="font-bold underline decoration-emerald-500" dangerouslySetInnerHTML={{ __html: correctOptText }} />.
                          <span className="text-xs text-emerald-700 block mt-1">
                            👉 Bấm nút <strong>"✨ Phân tích chuyên sâu với AI"</strong> bên dưới để xem thứ tự ghép đầy đủ cả 4 ô trống!
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* NGHĨA TIẾNG VIỆT */}
                  {selectedNotebookItem.meaningVi && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-800 text-sm sm:text-base leading-relaxed">
                      <div className="font-bold text-indigo-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Languages className="w-4 h-4 text-indigo-600" />
                        Ý nghĩa / Dịch nghĩa câu:
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: selectedNotebookItem.meaningVi.replace(/^\[Đề thi N\d\]\s*/i, '') }} />
                    </div>
                  )}

                  {/* TẦNG 2: CÁC PHƯƠNG ÁN LỰA CHỌN KÈM GIẢI NGHĨA & LOA TỪNG ĐÁP ÁN */}
                  {hasOptions && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-sm">
                          Phân tích 4 phương án lựa chọn:
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Bấm biểu tượng 🔊 để nghe từng đáp án
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {metaData.options.map((opt: string, idx: number) => {
                          const isCorrect = idx === Number(metaData.correctIndex);
                          const isUserAnswer = metaData.userAnswer !== null && metaData.userAnswer !== undefined && idx === Number(metaData.userAnswer);
                          const isWrong = isUserAnswer && !isCorrect;
                          const optionVi = Array.isArray(metaData.optionsVi) ? metaData.optionsVi[idx] : '';
                          const aiOptionBreakdown = Array.isArray(aiDetailed?.optionBreakdowns) ? aiDetailed.optionBreakdowns[idx] : '';

                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-sm'
                                  : isWrong
                                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                                  : 'bg-slate-50/80 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isCorrect ? 'bg-emerald-600 text-white' : isWrong ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className="text-[15px] font-bold leading-snug flex-1" dangerouslySetInnerHTML={{ __html: opt }} />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakJapanese(stripHtmlForSpeech(opt));
                                    }}
                                    title="Nghe phát âm phương án này"
                                    className="p-1.5 rounded-lg hover:bg-black/5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                  {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                  {isWrong && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                                </div>

                                {/* Hiển thị nghĩa tiếng Việt hoặc giải thích chi tiết của từng phương án */}
                                {(aiOptionBreakdown || optionVi) && (
                                  <div className="mt-2 ml-8 text-xs text-slate-600 bg-white/70 px-2.5 py-1.5 rounded-lg border border-black/5 leading-relaxed">
                                    {aiOptionBreakdown ? (
                                      <span>{aiOptionBreakdown.replace(/^Ph(ương án|ân tích Phương án)\s*\d+\s*:\s*/i, '')}</span>
                                    ) : (
                                      <span>Nghĩa: <strong>{optionVi}</strong></span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {(isWrong || isCorrect) && (
                                <div className="mt-2 ml-8 flex items-center gap-1.5">
                                  {isWrong && (
                                    <span className="text-[11px] font-bold text-rose-600">❌ Bạn đã chọn nhầm</span>
                                  )}
                                  {isCorrect && (
                                    <span className="text-[11px] font-bold text-emerald-700">✅ Đáp án đúng</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TẦNG 3: CÔNG THỨC NGỮ PHÁP / TỪ KHÓA TRỌNG TÂM (ĐÃ KHẮC PHỤC LỖI LẶP CÂU HỎI) */}
                  {effectiveStructure && (
                    <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-950 text-sm">
                      <div className="font-bold mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-teal-800">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        {selectedNotebookItem.itemType === 'VOCAB' ? 'Từ vựng & Cách đọc trọng tâm:' : 'Công thức / Cấu trúc ngữ pháp cốt lõi:'}
                      </div>
                      <div
                        className="bg-white/80 px-3 py-2 rounded-xl text-sm sm:text-base font-bold text-teal-900 border border-teal-100 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: effectiveStructure }}
                      />
                    </div>
                  )}

                  {/* TẦNG 4: GIẢI THÍCH CHI TIẾT, PHÂN TÍCH BẪY SAI & NÚT AI CHUYÊN SÂU (TỰ ĐỘNG LƯU CSDL) */}
                  <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-5 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Giải thích chi tiết & Phân tích bẫy đề thi
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {aiDetailed
                              ? 'Đã lưu bản phân tích chuyên sâu 4 tầng từ AI vào Sổ tay của bạn'
                              : 'Bấm nút bên cạnh để AI mổ xẻ từng đáp án, bẫy sai và lưu vĩnh viễn'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAnalyzingAi}
                        onClick={() => handleAnalyzeNotebookItemWithAI(selectedNotebookItem, metaData, noteText)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-indigo-200/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        {isAnalyzingAi ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang phân tích & lưu...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{aiDetailed ? 'Phân tích lại với AI' : '✨ Phân tích chuyên sâu với AI'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Nếu đã có dữ liệu AI chuyên sâu (aiDetailed) */}
                    {aiDetailed ? (
                      <div className="space-y-3 text-sm leading-relaxed">
                        {aiDetailed.explanation && (
                          <div className="p-3.5 rounded-xl bg-white border border-indigo-100 text-slate-800">
                            <div className="font-bold text-indigo-700 text-xs uppercase tracking-wider mb-1">
                              💡 Tại sao chọn đáp án đúng?
                            </div>
                            <div className="whitespace-pre-wrap">{aiDetailed.explanation}</div>
                          </div>
                        )}

                        {aiDetailed.trapAnalysis && (
                          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/70 text-rose-950">
                            <div className="font-bold text-rose-700 text-xs uppercase tracking-wider mb-1">
                              ⚠️ Phân tích bẫy sai {userOptText ? `(Vì sao bạn nhầm sang "${stripHtmlForSpeech(userOptText)}")` : 'thường gặp'}:
                            </div>
                            <div className="whitespace-pre-wrap">{aiDetailed.trapAnalysis}</div>
                          </div>
                        )}

                        {aiDetailed.studyTips && (
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-950">
                            <div className="font-bold text-amber-800 text-xs uppercase tracking-wider mb-1">
                              🚀 Mẹo phản xạ nhanh trong phòng thi:
                            </div>
                            <div className="whitespace-pre-wrap">{aiDetailed.studyTips}</div>
                          </div>
                        )}
                      </div>
                    ) : cleanedLines.length > 0 ? (
                      <div className="space-y-2.5 text-slate-800 text-[14px] leading-relaxed">
                        {cleanedLines.map((line, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white/90 border border-slate-200/70 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 font-bold">$1</strong>')
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">
                        Chưa có ghi chú chi tiết. Hãy bấm <strong>"✨ Phân tích chuyên sâu với AI"</strong> để tạo lời giải chi tiết!
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER MODAL: CHUYỂN NHANH TRẠNG THÁI GHI NHỚ SRS & ĐÓNG */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Mức độ thuộc:</span>
                    {(
                      [
                        { key: 'LEARNING', label: 'Đang học', activeClass: 'bg-sky-600 text-white border-sky-600', idleClass: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
                        { key: 'REVIEWING', label: 'Cần ôn ↺', activeClass: 'bg-amber-500 text-white border-amber-500', idleClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                        { key: 'MASTERED', label: 'Đã thuộc ✓', activeClass: 'bg-emerald-600 text-white border-emerald-600', idleClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' }
                      ] as const
                    ).map((st) => {
                      const isActive = selectedNotebookItem.masteryStatus === st.key;
                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => handleToggleMastery(selectedNotebookItem.id, st.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isActive ? st.activeClass : st.idleClass
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsAnalyzingAi(false);
                      setAiAnalysisResult(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-md ml-auto"
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
