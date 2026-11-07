'use client';

import React, { useState, useEffect, useMemo } from 'react';
import BulkImportModal from './BulkImportModal';
import { authApi } from '@/context/AuthContext';
import { apiGateway } from '@/services/api-gateway.client';
import { ReadingApi } from '../reading/reading.api';
import {
  Trash2,
  Edit2,
  Plus,
  Search,
  Video,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileSpreadsheet,
  Subtitles,
  Download,
  CheckCircle2,
  EyeOff,
  ListOrdered,
  Save
} from 'lucide-react';

type ContentTab = 'SHADOWING' | 'READING' | 'KANJI' | 'VOCAB' | 'EXAM';

const SHADOWING_CATEGORIES = [
  { value: 'ANIME', label: '🎬 Phim hoạt hình (Doraemon, Anime...)' },
  { value: 'DAILY_LIFE', label: '🗣️ Đời sống & Hội thoại' },
  { value: 'FOLKTALE', label: '🏯 Truyện cổ tích Nhật Bản' },
  { value: 'BUSINESS', label: '💼 Công sở & Phỏng vấn' },
  { value: 'HOSPITAL', label: '🏥 Bệnh viện & Y tế' },
  { value: 'SCHOOL', label: '🏫 Trường học & Du học' },
  { value: 'INTERVIEW', label: '🎤 Phỏng vấn đường phố' }
];

export const AdminContentView = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [contentTab, setContentTab] = useState<ContentTab>('SHADOWING');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 12;

  // For Adding Shadowing
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [newLevel, setNewLevel] = useState('N4');
  const [newCategory, setNewCategory] = useState('ANIME');
  const [newSrtContent, setNewSrtContent] = useState('');
  const [showSrtInput, setShowSrtInput] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Universal Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Subtitle Editor Modal State (For Shadowing)
  const [subtitleLesson, setSubtitleLesson] = useState<any | null>(null);
  const [subtitlesList, setSubtitlesList] = useState<any[]>([]);
  const [loadingSubtitles, setLoadingSubtitles] = useState(false);
  const [savingSubtitles, setSavingSubtitles] = useState(false);

  // Exam Questions Editor Modal State (For JLPT Exams)
  const [examQuestionTarget, setExamQuestionTarget] = useState<any | null>(null);
  const [examQuestionsList, setExamQuestionsList] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
    fetchContent();
  }, [contentTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [contentTab, selectedLevel, searchQuery]);

  const getEndpointBase = (tab: ContentTab) => {
    switch (tab) {
      case 'SHADOWING':
        return '/admin/content/shadowing';
      case 'READING':
        return '/admin/content/reading';
      case 'KANJI':
        return '/admin/content/kanji';
      case 'VOCAB':
        return '/admin/content/vocab';
      case 'EXAM':
        return '/admin/content/exams';
    }
  };

  const fetchContent = async (customSearch?: string) => {
    try {
      setLoading(true);
      const endpoint = getEndpointBase(contentTab);
      const q = customSearch !== undefined ? customSearch : searchQuery;
      const res = await authApi.get(endpoint, {
        params: q ? { search: q } : undefined
      });
      if (res.data.success) {
        setItems(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch admin content error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nội dung này? Hành động này không thể hoàn tác.')) return;

    try {
      const endpoint = `${getEndpointBase(contentTab)}/${id}`;
      await authApi.delete(endpoint);
      apiGateway.clearCache();
      setItems((prev) => prev.filter((it) => it.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa nội dung');
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} mục đã chọn trong tab ${contentTab}?`
      )
    ) {
      return;
    }
    setIsBulkDeleting(true);
    try {
      const res = await authApi.post('/admin/content/bulk-delete', {
        type: contentTab,
        ids: selectedIds
      });
      if (res.data.success) {
        apiGateway.clearCache();
        setItems((prev) => prev.filter((it) => !selectedIds.includes(it.id)));
        setSelectedIds([]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa hàng loạt nội dung');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await authApi.get('/admin/content/export', {
        params: { type: contentTab }
      });
      const rows: any[] = res.data?.data || [];
      if (rows.length === 0) {
        alert('Không có dữ liệu để xuất.');
        return;
      }
      const headers = Object.keys(rows[0]);
      const csvLines = [
        headers.join(','),
        ...rows.map((r) =>
          headers
            .map((h) => {
              const cell = r[h] === null || r[h] === undefined ? '' : String(r[h]);
              return `"${cell.replace(/"/g, '""')}"`;
            })
            .join(',')
        )
      ];
      const csvString = '\uFEFF' + csvLines.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nihonai_${contentTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Lỗi khi xuất dữ liệu CSV');
    }
  };

  const handleAddShadowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYoutubeUrl.trim()) return;
    setIsAddingVideo(true);
    try {
      let rawTranscript: Array<{ startMs: number; endMs: number; text: string }> | undefined;
      if (!newSrtContent.trim()) {
        rawTranscript = await ReadingApi.fetchEdgeYouTubeCaptions(newYoutubeUrl.trim());
      }

      await authApi.post('/shadowing/process-youtube', {
        url: newYoutubeUrl.trim(),
        level: newLevel,
        category: newCategory,
        rawTranscript,
        srtContent: newSrtContent.trim() || undefined,
        autoSync: false,
        forceRefresh: true
      });
      alert('Đã thêm video bài học thành công!');
      setNewYoutubeUrl('');
      setNewSrtContent('');
      setShowSrtInput(false);
      fetchContent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi thêm video. Vui lòng kiểm tra link hoặc phụ đề.');
    } finally {
      setIsAddingVideo(false);
    }
  };

  const openSubtitleEditor = async (lesson: any) => {
    setSubtitleLesson(lesson);
    setLoadingSubtitles(true);
    try {
      const res = await authApi.get(`/admin/content/shadowing/${lesson.id}/subtitles`);
      if (res.data.success) {
        setSubtitlesList(res.data.data || []);
      }
    } catch (err) {
      alert('Lỗi khi tải danh sách phụ đề của video');
    } finally {
      setLoadingSubtitles(false);
    }
  };

  const handleSaveSubtitles = async () => {
    if (!subtitleLesson) return;
    setSavingSubtitles(true);
    try {
      const res = await authApi.put(`/admin/content/shadowing/${subtitleLesson.id}/subtitles`, {
        subtitles: subtitlesList
      });
      if (res.data.success) {
        alert(`Đã cập nhật ${res.data.data?.updatedCount || subtitlesList.length} câu phụ đề thành công!`);
        setSubtitleLesson(null);
        fetchContent();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu phụ đề');
    } finally {
      setSavingSubtitles(false);
    }
  };

  const handleToggleExamPublish = async (exam: any) => {
    try {
      const nextPublished = !exam.isPublished;
      const res = await authApi.put(`/admin/content/exams/${exam.id}`, {
        isPublished: nextPublished
      });
      if (res.data.success) {
        apiGateway.clearCache();
        setItems((prev) => prev.map((it) => (it.id === exam.id ? { ...it, isPublished: nextPublished } : it)));
      }
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái đề thi');
    }
  };

  const openExamQuestionsEditor = async (exam: any) => {
    setExamQuestionTarget(exam);
    setLoadingQuestions(true);
    try {
      const res = await authApi.get(`/admin/content/exams/${exam.id}/questions`);
      if (res.data.success) {
        const parsed = (res.data.data || []).map((q: any) => {
          let opts = ['Phương án 1', 'Phương án 2', 'Phương án 3', 'Phương án 4'];
          try {
            const p = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            if (Array.isArray(p) && p.length > 0) opts = p;
          } catch {}
          return { ...q, optionsList: opts };
        });
        setExamQuestionsList(parsed);
      }
    } catch (err) {
      alert('Lỗi khi tải danh sách câu hỏi của đề thi');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSaveExamQuestions = async () => {
    if (!examQuestionTarget) return;
    setSavingQuestions(true);
    try {
      const payload = examQuestionsList.map((q, idx) => ({
        ...q,
        orderNumber: idx + 1,
        options: JSON.stringify(q.optionsList || ['A', 'B', 'C', 'D'])
      }));
      const res = await authApi.put(`/admin/content/exams/${examQuestionTarget.id}/questions`, {
        questions: payload
      });
      if (res.data.success) {
        apiGateway.clearCache();
        alert(`Đã lưu ${res.data.data?.updatedCount ?? payload.length} câu hỏi cho đề thi!`);
        setExamQuestionTarget(null);
        fetchContent();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu câu hỏi đề thi');
    } finally {
      setSavingQuestions(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    if (contentTab === 'READING') {
      setFormData({
        title: '',
        level: 'N3',
        topic: 'Đời sống & Xã hội',
        imageUrl: '',
        contentJp: '',
        translationFull: ''
      });
    } else if (contentTab === 'KANJI') {
      setFormData({
        character: '',
        hanViet: '',
        meaningVi: '',
        onyomi: '',
        kunyomi: '',
        jlptLevel: 'N5',
        strokeCount: 4,
        radicals: '',
        curriculum: 'LOOK_AND_LEARN',
        lesson: 1,
        mnemonicAi: ''
      });
    } else if (contentTab === 'VOCAB') {
      setFormData({
        word: '',
        reading: '',
        hanViet: '',
        meaningVi: '',
        jlptLevel: 'N5',
        curriculum: 'MINNA',
        lesson: 1,
        exampleJp: '',
        exampleVi: ''
      });
    } else if (contentTab === 'EXAM') {
      setFormData({
        title: '',
        code: '',
        level: 'N3',
        year: new Date().getFullYear(),
        session: '07',
        edition: 'Đề thi chuẩn JLPT',
        durationMinutes: 105,
        passingScore: 95,
        sectionalMinScore: 19,
        description: '',
        isPublished: true
      });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    if (contentTab === 'SHADOWING') {
      setFormData({
        title: item.title || '',
        level: item.level || 'N4',
        category: item.category || 'DAILY_LIFE',
        topic: item.topic || 'Giao tiếp đời sống',
        youtubeId: item.youtubeId || '',
        description: item.description || ''
      });
    } else if (contentTab === 'READING') {
      const contentJp = Array.isArray(item.sentences)
        ? item.sentences.map((s: any) => s.sentenceJp).join('\n')
        : '';
      setFormData({
        title: item.title || '',
        level: item.level || 'N3',
        topic: item.topic || 'Đời sống',
        imageUrl: item.imageUrl || '',
        contentJp,
        translationFull: item.translationFull || ''
      });
    } else if (contentTab === 'KANJI') {
      setFormData({
        character: item.character || '',
        hanViet: item.hanViet || '',
        meaningVi: item.meaningVi || '',
        onyomi: item.onyomi || '',
        kunyomi: item.kunyomi || '',
        jlptLevel: item.jlptLevel || 'N5',
        strokeCount: item.strokeCount || 1,
        radicals: item.radicals || '',
        curriculum: item.curriculum || 'LOOK_AND_LEARN',
        lesson: item.lesson || 1,
        mnemonicAi: item.mnemonicAi || ''
      });
    } else if (contentTab === 'VOCAB') {
      setFormData({
        word: item.word || '',
        reading: item.reading || '',
        hanViet: item.hanViet || '',
        meaningVi: item.meaningVi || '',
        jlptLevel: item.jlptLevel || 'N5',
        curriculum: item.curriculum || 'MINNA',
        lesson: item.lesson || 1,
        exampleJp: item.exampleJp || '',
        exampleVi: item.exampleVi || ''
      });
    } else if (contentTab === 'EXAM') {
      setFormData({
        title: item.title || '',
        code: item.code || '',
        level: item.level || 'N3',
        year: item.year || 2025,
        session: item.session || '07',
        edition: item.edition || '',
        durationMinutes: item.durationMinutes || 100,
        passingScore: item.passingScore || 95,
        sectionalMinScore: item.sectionalMinScore || 19,
        description: item.description || '',
        isPublished: item.isPublished !== false
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const base = getEndpointBase(contentTab);
      if (editingItem) {
        await authApi.put(`${base}/${editingItem.id}`, formData);
      } else {
        await authApi.post(base, formData);
      }
      apiGateway.clearCache();
      setIsModalOpen(false);
      fetchContent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered & Paginated items
  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedLevel !== 'ALL') {
      list = list.filter((it) => {
        const lvl = (it.level || it.jlptLevel || '').toUpperCase();
        return lvl === selectedLevel;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((it) => {
        const hay = [
          it.title,
          it.code,
          it.character,
          it.word,
          it.reading,
          it.hanViet,
          it.meaningVi,
          it.topic,
          it.category
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [items, selectedLevel, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Học liệu & Đề thi</h2>
          <p className="text-sm text-slate-500">
            Thêm mới, chỉnh sửa phụ đề, nhập/xuất dữ liệu và quản lý đề thi trên toàn hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {contentTab !== 'SHADOWING' && (
            <button
              onClick={openCreateModal}
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              {contentTab === 'READING'
                ? 'Thêm Bài đọc'
                : contentTab === 'KANJI'
                ? 'Thêm Hán tự'
                : contentTab === 'VOCAB'
                ? 'Thêm Từ vựng'
                : 'Tạo Đề thi'}
            </button>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Nhập Excel
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Xuất danh sách hiện tại ra file CSV (mở bằng Excel)"
          >
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap gap-1 w-fit">
        {(
          [
            { id: 'SHADOWING', label: 'Video Shadowing' },
            { id: 'READING', label: 'Bài đọc Dokkai' },
            { id: 'KANJI', label: 'Hán tự (Kanji)' },
            { id: 'VOCAB', label: 'Từ vựng (Vocab)' },
            { id: 'EXAM', label: 'Đề thi JLPT' }
          ] as { id: ContentTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setContentTab(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              contentTab === t.id ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Form Thêm Video Shadowing */}
      {contentTab === 'SHADOWING' && (
        <form
          onSubmit={handleAddShadowing}
          className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Nhập link YouTube hoặc Video ID (VD: https://www.youtube.com/watch?v=...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newYoutubeUrl}
                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                required
              />
            </div>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full sm:w-56 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {SHADOWING_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              className="w-full sm:w-24 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>
            <button
              type="button"
              onClick={() => setShowSrtInput((v) => !v)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                showSrtInput
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Dán phụ đề .SRT hoặc bản chép lời thủ công"
            >
              <Subtitles className="w-4 h-4" />
              Phụ đề SRT
            </button>
            <button
              type="submit"
              disabled={isAddingVideo}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              {isAddingVideo ? 'Đang xử lý...' : 'Thêm Video'}
            </button>
          </div>

          {showSrtInput && (
            <textarea
              rows={4}
              value={newSrtContent}
              onChange={(e) => setNewSrtContent(e.target.value)}
              placeholder="Tùy chọn: Dán nội dung file .SRT / .VTT hoặc bản chép lời YouTube (0:05 Câu thoại...) để đồng bộ thời gian chính xác 100%..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          )}
        </form>
      )}

      {/* Thanh tìm kiếm & Bộ lọc Level */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Cấp độ:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
            Tổng: {filteredItems.length} mục
          </span>

          {currentItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const pageIds = currentItems.map((it) => it.id);
                const allSelected = pageIds.every((id) => selectedIds.includes(id));
                if (allSelected) {
                  setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
                } else {
                  setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
                }
              }}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              {currentItems.every((it) => selectedIds.includes(it.id)) ? 'Bỏ chọn trang này' : 'Chọn trang này'}
            </button>
          )}

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Trash2 size={13} />
              {isBulkDeleting ? 'Đang xóa...' : `Xóa đã chọn (${selectedIds.length})`}
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (contentTab === 'KANJI' || contentTab === 'VOCAB')) {
                fetchContent(searchQuery);
              }
            }}
            placeholder="Tìm kiếm nhanh (Enter để tìm sâu)..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid Danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-500 col-span-3 py-8 text-center">Đang tải dữ liệu...</p>
        ) : currentItems.length === 0 ? (
          <p className="text-slate-500 col-span-3 py-8 text-center">Chưa có nội dung nào phù hợp.</p>
        ) : (
          currentItems.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            if (contentTab === 'KANJI') {
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3 hover:shadow-md transition-shadow ${
                    isChecked ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectItem(item.id)}
                      className="mt-1.5 cursor-pointer accent-indigo-600"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                      {item.character}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 uppercase">
                          {item.hanViet || 'HÁN TỰ'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.jlptLevel}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{item.meaningVi}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        On: {item.onyomi || '—'} | Kun: {item.kunyomi || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            }

            if (contentTab === 'VOCAB') {
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3 hover:shadow-md transition-shadow ${
                    isChecked ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectItem(item.id)}
                      className="mt-1 cursor-pointer accent-indigo-600"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900">{item.word}</span>
                        <span className="text-xs text-indigo-600 font-semibold">({item.reading})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.jlptLevel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mt-1">{item.meaningVi}</p>
                      {item.exampleJp && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.exampleJp}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            }

            if (contentTab === 'EXAM') {
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow ${
                    isChecked ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.id)}
                          className="cursor-pointer accent-indigo-600"
                        />
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs">
                          {item.level}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleExamPublish(item)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                          item.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        title="Bấm để ẩn / hiện đề thi"
                      >
                        {item.isPublished ? (
                          <>
                            <CheckCircle2 size={12} /> Đang mở
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} /> Đang ẩn
                          </>
                        )}
                      </button>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{item.code}</p>
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      <span>⏱ {item.durationMinutes} phút</span>
                      <span>•</span>
                      <span>🎯 Đỗ: {item.passingScore}/180</span>
                      <span>•</span>
                      <span>❓ {item._count?.questions || item.totalQuestions || 0} câu</span>
                      <span>•</span>
                      <span>👥 {item._count?.attempts || 0} lượt thi</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-1.5 flex-wrap">
                    <button
                      onClick={() => openExamQuestionsEditor(item)}
                      className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Quản lý thêm / sửa / xóa câu hỏi trong đề thi"
                    >
                      <ListOrdered size={14} /> Câu hỏi ({item._count?.questions || item.totalQuestions || 0})
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={14} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>
              );
            }

            const imgUrl = contentTab === 'SHADOWING' ? item.thumbnailUrl : item.imageUrl;
            const displayDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs flex flex-col hover:shadow-md transition-shadow ${
                  isChecked ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-200'
                }`}
              >
                {imgUrl && (
                  <div className="h-40 w-full bg-slate-100 relative">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-4 h-4 rounded cursor-pointer accent-indigo-600 shadow-xs"
                      />
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-xs">
                        {item.level}
                      </span>
                      {item.category && (
                        <span className="bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded-lg font-bold shadow-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      {!imgUrl && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.id)}
                          className="mt-1 cursor-pointer accent-indigo-600"
                        />
                      )}
                      <h3 className="font-bold text-slate-800 line-clamp-2 text-sm" title={item.title}>
                        {item.title}
                      </h3>
                    </div>
                    {contentTab === 'SHADOWING' ? (
                      <p className="text-xs text-slate-500">
                        {item._count?.subtitles || 0} câu thoại • {item.topic || item.category}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs text-slate-600 font-medium">
                          {item.level} • {item.sentences?.length || 0} câu • {item._count?.vocabularies || 0} từ vựng
                        </p>
                        <p className="text-[10.5px] text-slate-400 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5" /> Cập nhật: {displayDate}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-1.5 flex-wrap">
                    {contentTab === 'SHADOWING' && (
                      <button
                        onClick={() => openSubtitleEditor(item)}
                        className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Chỉnh sửa chi tiết từng câu phụ đề & thời gian"
                      >
                        <ListOrdered size={14} /> Phụ đề ({item._count?.subtitles || 0})
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit2 size={14} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Xóa nội dung"
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-1 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      )}

      {/* Modal Quản lý Câu hỏi Đề thi JLPT (Exam Questions Editor) */}
      {examQuestionTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  Quản lý Câu hỏi: {examQuestionTarget.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Tổng {examQuestionsList.length} câu hỏi • Hỗ trợ thêm mới, chỉnh sửa đáp án và xóa câu hỏi.
                </p>
              </div>
              <button
                onClick={() => setExamQuestionTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingQuestions ? (
                <div className="py-12 text-center text-slate-500 text-sm">Đang tải danh sách câu hỏi...</div>
              ) : examQuestionsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Đề thi này chưa có câu hỏi nào. Hãy bấm &ldquo;Thêm câu hỏi&rdquo; ở bên dưới.
                </div>
              ) : (
                examQuestionsList.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                          Câu #{idx + 1}
                        </span>
                        <select
                          value={q.section || 'vocab'}
                          onChange={(e) => {
                            const next = [...examQuestionsList];
                            next[idx] = { ...q, section: e.target.value };
                            setExamQuestionsList(next);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700"
                        >
                          <option value="vocab">Từ vựng (Moji/Goi)</option>
                          <option value="grammar">Ngữ pháp (Bunpou)</option>
                          <option value="reading">Đọc hiểu (Dokkai)</option>
                          <option value="listening">Nghe hiểu (Choukai)</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setExamQuestionsList((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 size={13} /> Xóa câu
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nội dung câu hỏi tiếng Nhật..."
                        value={q.question || ''}
                        onChange={(e) => {
                          const next = [...examQuestionsList];
                          next[idx] = { ...q, question: e.target.value };
                          setExamQuestionsList(next);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Dịch nghĩa câu hỏi tiếng Việt..."
                        value={q.questionVi || ''}
                        onChange={(e) => {
                          const next = [...examQuestionsList];
                          next[idx] = { ...q, questionVi: e.target.value };
                          setExamQuestionsList(next);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((optIdx) => (
                        <div key={optIdx} className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={Number(q.correctIndex) === optIdx}
                            onChange={() => {
                              const next = [...examQuestionsList];
                              next[idx] = { ...q, correctIndex: optIdx };
                              setExamQuestionsList(next);
                            }}
                            title="Chọn làm đáp án đúng"
                            className="cursor-pointer accent-emerald-600"
                          />
                          <input
                            type="text"
                            placeholder={`Đáp án ${optIdx + 1}`}
                            value={(q.optionsList && q.optionsList[optIdx]) || ''}
                            onChange={(e) => {
                              const next = [...examQuestionsList];
                              const nextOpts = [...(q.optionsList || ['', '', '', ''])];
                              nextOpts[optIdx] = e.target.value;
                              next[idx] = { ...q, optionsList: nextOpts };
                              setExamQuestionsList(next);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                              Number(q.correctIndex) === optIdx
                                ? 'border-emerald-400 bg-emerald-50/50 font-bold text-emerald-900'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Giải thích đáp án (Explanation)..."
                      value={q.explanation || ''}
                      onChange={(e) => {
                        const next = [...examQuestionsList];
                        next[idx] = { ...q, explanation: e.target.value };
                        setExamQuestionsList(next);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setExamQuestionsList([
                    ...examQuestionsList,
                    {
                      orderNumber: examQuestionsList.length + 1,
                      section: 'vocab',
                      subType: 'KANJI_READING',
                      subTypeLabel: 'Cách đọc Hán tự',
                      question: '',
                      questionVi: '',
                      optionsList: ['', '', '', ''],
                      correctIndex: 0,
                      explanation: ''
                    }
                  ]);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Thêm câu hỏi
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setExamQuestionTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveExamQuestions}
                  disabled={savingQuestions}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  {savingQuestions ? 'Đang lưu...' : 'Lưu toàn bộ Câu hỏi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Phụ đề Video Shadowing (Subtitle Editor) */}
      {subtitleLesson && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  Chỉnh sửa Phụ đề: {subtitleLesson.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Tổng {subtitlesList.length} câu thoại • Hệ thống tự động tạo lại Furigana & Romaji khi lưu.
                </p>
              </div>
              <button
                onClick={() => setSubtitleLesson(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingSubtitles ? (
                <div className="py-12 text-center text-slate-500 text-sm">Đang tải danh sách phụ đề...</div>
              ) : (
                subtitlesList.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        Câu #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-500">Bắt đầu (ms):</label>
                        <input
                          type="number"
                          value={sub.startTimeMs}
                          onChange={(e) => {
                            const next = [...subtitlesList];
                            next[idx] = { ...sub, startTimeMs: Number(e.target.value) };
                            setSubtitlesList(next);
                          }}
                          className="w-24 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                        />
                        <label className="text-[11px] font-bold text-slate-500">Kết thúc (ms):</label>
                        <input
                          type="number"
                          value={sub.endTimeMs}
                          onChange={(e) => {
                            const next = [...subtitlesList];
                            next[idx] = { ...sub, endTimeMs: Number(e.target.value) };
                            setSubtitlesList(next);
                          }}
                          className="w-24 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSubtitlesList((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Xóa câu này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Câu tiếng Nhật..."
                        value={sub.japanese || ''}
                        onChange={(e) => {
                          const next = [...subtitlesList];
                          next[idx] = { ...sub, japanese: e.target.value };
                          setSubtitlesList(next);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Nghĩa tiếng Việt..."
                        value={sub.vietnamese || ''}
                        onChange={(e) => {
                          const next = [...subtitlesList];
                          next[idx] = { ...sub, vietnamese: e.target.value };
                          setSubtitlesList(next);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const lastEnd =
                    subtitlesList.length > 0 ? subtitlesList[subtitlesList.length - 1].endTimeMs : 0;
                  setSubtitlesList([
                    ...subtitlesList,
                    {
                      orderIndex: subtitlesList.length + 1,
                      startTimeMs: lastEnd,
                      endTimeMs: lastEnd + 3500,
                      japanese: '',
                      vietnamese: ''
                    }
                  ]);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Thêm câu thoại
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubtitleLesson(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveSubtitles}
                  disabled={savingSubtitles}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  {savingSubtitles ? 'Đang lưu...' : 'Lưu toàn bộ Phụ đề'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm mới / Chỉnh sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Chỉnh sửa nội dung' : 'Thêm mới nội dung'} ({contentTab})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {contentTab === 'SHADOWING' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề Video</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cấp độ JLPT</label>
                      <select
                        value={formData.level || 'N4'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      >
                        {['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục</label>
                      <select
                        value={formData.category || 'DAILY_LIFE'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      >
                        {SHADOWING_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề hiển thị</label>
                    <input
                      type="text"
                      value={formData.topic || ''}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả bài học</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {contentTab === 'READING' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề Bài đọc</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cấp độ JLPT</label>
                      <select
                        value={formData.level || 'N3'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      >
                        {['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề</label>
                      <input
                        type="text"
                        value={formData.topic || ''}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nội dung Tiếng Nhật (Tự động gắn Furigana & Dịch từng câu)
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.contentJp || ''}
                      onChange={(e) => setFormData({ ...formData, contentJp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bản dịch Tiếng Việt toàn bài (Để trống sẽ tự động ghép từ bản dịch từng câu)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.translationFull || ''}
                      onChange={(e) => setFormData({ ...formData, translationFull: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {contentTab === 'KANJI' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Chữ Hán</label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={formData.character || ''}
                        onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-lg font-black text-center outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Âm Hán Việt</label>
                      <input
                        type="text"
                        required
                        value={formData.hanViet || ''}
                        onChange={(e) => setFormData({ ...formData, hanViet: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cấp độ JLPT</label>
                      <select
                        value={formData.jlptLevel || 'N5'}
                        onChange={(e) => setFormData({ ...formData, jlptLevel: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      >
                        {['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nghĩa Tiếng Việt</label>
                    <input
                      type="text"
                      required
                      value={formData.meaningVi || ''}
                      onChange={(e) => setFormData({ ...formData, meaningVi: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Âm On (Onyomi)</label>
                      <input
                        type="text"
                        value={formData.onyomi || ''}
                        onChange={(e) => setFormData({ ...formData, onyomi: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Âm Kun (Kunyomi)</label>
                      <input
                        type="text"
                        value={formData.kunyomi || ''}
                        onChange={(e) => setFormData({ ...formData, kunyomi: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Số nét</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.strokeCount || 1}
                        onChange={(e) => setFormData({ ...formData, strokeCount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bộ thủ</label>
                      <input
                        type="text"
                        value={formData.radicals || ''}
                        onChange={(e) => setFormData({ ...formData, radicals: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bài học số</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.lesson || 1}
                        onChange={(e) => setFormData({ ...formData, lesson: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {contentTab === 'VOCAB' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Từ vựng (Kanji/Kana)</label>
                      <input
                        type="text"
                        required
                        value={formData.word || ''}
                        onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cách đọc (Hiragana)</label>
                      <input
                        type="text"
                        required
                        value={formData.reading || ''}
                        onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Âm Hán Việt</label>
                      <input
                        type="text"
                        value={formData.hanViet || ''}
                        onChange={(e) => setFormData({ ...formData, hanViet: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cấp độ JLPT</label>
                      <select
                        value={formData.jlptLevel || 'N5'}
                        onChange={(e) => setFormData({ ...formData, jlptLevel: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      >
                        {['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nghĩa Tiếng Việt</label>
                    <input
                      type="text"
                      required
                      value={formData.meaningVi || ''}
                      onChange={(e) => setFormData({ ...formData, meaningVi: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Câu ví dụ Tiếng Nhật</label>
                    <input
                      type="text"
                      value={formData.exampleJp || ''}
                      onChange={(e) => setFormData({ ...formData, exampleJp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dịch nghĩa câu ví dụ</label>
                    <input
                      type="text"
                      value={formData.exampleVi || ''}
                      onChange={(e) => setFormData({ ...formData, exampleVi: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {contentTab === 'EXAM' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề Đề thi JLPT</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Đề thi chính thức JLPT N3 - Tháng 7/2025"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cấp độ</label>
                      <select
                        value={formData.level || 'N3'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      >
                        {['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Năm</label>
                      <input
                        type="number"
                        value={formData.year || 2025}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ thi (Tháng)</label>
                      <select
                        value={formData.session || '07'}
                        onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      >
                        <option value="07">Tháng 7</option>
                        <option value="12">Tháng 12</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian (Phút)</label>
                      <input
                        type="number"
                        min={15}
                        value={formData.durationMinutes || 105}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Điểm chuẩn Đỗ (/180)</label>
                      <input
                        type="number"
                        min={50}
                        max={180}
                        value={formData.passingScore || 95}
                        onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả đề thi</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="exam-pub"
                      checked={formData.isPublished !== false}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                    <label htmlFor="exam-pub" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Công khai đề thi cho học viên luyện tập
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold cursor-pointer"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          fetchContent();
        }}
      />
    </div>
  );
};
