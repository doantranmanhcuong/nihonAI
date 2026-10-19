'use client';
import BulkImportModal from './BulkImportModal';

import React, { useState, useEffect, useMemo } from 'react';
import { authApi } from '@/context/AuthContext';
import { Trash2, MonitorPlay, FileText, Search, Video, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { ReadingApi } from '../reading/reading.api';

export const AdminContentView = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [contentTab, setContentTab] = useState<'SHADOWING' | 'READING'>('SHADOWING');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const itemsPerPage = 12;

  // For Adding Shadowing
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [newLevel, setNewLevel] = useState('N3');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [contentTab]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on tab/level change
  }, [contentTab, selectedLevel]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const endpoint = contentTab === 'SHADOWING' ? '/admin/content/shadowing' : '/admin/content/reading';
      const res = await authApi.get(endpoint);
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nội dung này? Hành động này không thể hoàn tác.')) return;
    
    try {
      const endpoint = contentTab === 'SHADOWING' ? `/admin/content/shadowing/${id}` : `/admin/content/reading/${id}`;
      await authApi.delete(endpoint);
      alert('Xóa thành công');
      fetchContent();
    } catch (err) {
      alert('Lỗi khi xóa');
    }
  };

  const handleAddShadowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYoutubeUrl) return;
    setIsAddingVideo(true);
    try {
      await authApi.post('/shadowing/process-youtube', { url: newYoutubeUrl, level: newLevel, forceRefresh: true });
      alert('Thêm video thành công!');
      setNewYoutubeUrl('');
      fetchContent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi thêm video. Vui lòng kiểm tra link hoặc phụ đề.');
    } finally {
      setIsAddingVideo(false);
    }
  };

  // Filtered & Paginated items
  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedLevel !== 'ALL') {
      list = list.filter(it => it.level?.toUpperCase() === selectedLevel);
    }
    return list;
  }, [items, selectedLevel]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Nội dung</h2>
          <p className="text-sm text-slate-500">Cập nhật tài liệu học tập của hệ thống.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-bold cursor-pointer"
          >
            Nhập Excel
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setContentTab('SHADOWING')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${contentTab === 'SHADOWING' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Video Shadowing
            </button>
            <button
              onClick={() => setContentTab('READING')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${contentTab === 'READING' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bài đọc Dokkai
            </button>
          </div>
        </div>
      </div>

      {contentTab === 'SHADOWING' && (
        <form onSubmit={handleAddShadowing} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 w-5 h-5" />
            <input 
              type="url" 
              placeholder="Nhập link YouTube (VD: https://youtube.com/watch?v=...)" 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newYoutubeUrl}
              onChange={(e) => setNewYoutubeUrl(e.target.value)}
              required
            />
          </div>
          <select 
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            className="w-full sm:w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>
          <button 
            type="submit" 
            disabled={isAddingVideo}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
          >
            {isAddingVideo ? 'Đang xử lý...' : 'Thêm Video'}
          </button>
        </form>
      )}

      {/* Bộ lọc Level */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-bold text-slate-600">Lọc theo cấp độ:</span>
        <select 
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="ml-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Tất cả</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
          Tổng cộng: {filteredItems.length} mục
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-500 col-span-3">Đang tải...</p>
        ) : currentItems.length === 0 ? (
          <p className="text-slate-500 col-span-3">Chưa có nội dung nào.</p>
        ) : currentItems.map((item) => {
          const imgUrl = contentTab === 'SHADOWING' ? item.thumbnailUrl : item.imageUrl;
          const displayDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
          });

          return (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
            {imgUrl && (
              <div className="h-40 w-full bg-slate-100 relative">
                <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-sm">{item.level}</div>
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 line-clamp-2 text-sm mb-2" title={item.title}>{item.title}</h3>
                {contentTab === 'SHADOWING' ? (
                  <p className="text-xs text-slate-500">{item._count?.subtitles || 0} câu thoại • {item.topic}</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-slate-600 font-medium">
                      {item.level} • {item._count?.vocabularies || 0} từ vựng
                    </p>
                    <p className="text-[10.5px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Cập nhật: {displayDate}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa nội dung"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      )}

    </div>
  );
};
