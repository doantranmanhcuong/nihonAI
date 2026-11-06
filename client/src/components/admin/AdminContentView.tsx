'use client';

import React, { useState, useEffect, useMemo } from 'react';
import BulkImportModal from './BulkImportModal';
import { authApi } from '@/context/AuthContext';
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
  Subtitles
} from 'lucide-react';

type ContentTab = 'SHADOWING' | 'READING' | 'KANJI' | 'VOCAB';

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

  useEffect(() => {
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
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa nội dung');
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
          <h2 className="text-xl font-bold text-slate-900">Quản lý Học liệu & Nội dung</h2>
          <p className="text-sm text-slate-500">Thêm mới, chỉnh sửa và xóa trực tiếp học liệu trên toàn hệ thống.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {contentTab !== 'SHADOWING' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              {contentTab === 'READING'
                ? 'Thêm Bài đọc'
                : contentTab === 'KANJI'
                ? 'Thêm Hán tự'
                : 'Thêm Từ vựng'}
            </button>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Nhập Excel/CSV
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap">
            {(
              [
                { id: 'SHADOWING', label: 'Video Shadowing' },
                { id: 'READING', label: 'Bài đọc Dokkai' },
                { id: 'KANJI', label: 'Hán tự (Kanji)' },
                { id: 'VOCAB', label: 'Từ vựng (Vocab)' }
              ] as { id: ContentTab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setContentTab(t.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  contentTab === t.id
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
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
            if (contentTab === 'KANJI') {
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                      {item.character}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 uppercase">{item.hanViet || 'HÁN TỰ'}</span>
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
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
                >
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
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col hover:shadow-md transition-shadow"
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
                    <h3 className="font-bold text-slate-800 line-clamp-2 text-sm mb-2" title={item.title}>
                      {item.title}
                    </h3>
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
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Chỉnh sửa nội dung"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung Tiếng Nhật (Tự động gắn Furigana)</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.contentJp || ''}
                      onChange={(e) => setFormData({ ...formData, contentJp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bản dịch Tiếng Việt</label>
                    <textarea
                      rows={4}
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
