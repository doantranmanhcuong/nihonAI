'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VideoShadowingView } from '@/components/reading/VideoShadowingView';
import { VideoShadowingLesson } from '@/components/reading/reading.types';
import { ReadingApi } from '@/components/reading/reading.api';
import {
  Headphones,
  Upload,
  Video,
  Sparkles,
  PlayCircle,
  Loader2,
  Search,
  Filter,
  Clock,
  FileText,
  Eye,
  RotateCw,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  ChevronRight,
  Play,
  Layers,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LEVELS = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'] as const;
const CATEGORIES = [
  { value: 'ALL', label: 'Tất cả chủ đề' },
  { value: 'DAILY_LIFE', label: 'Đời sống hàng ngày' },
  { value: 'INTERVIEW', label: 'Phỏng vấn đường phố' },
  { value: 'BUSINESS', label: 'Công việc & Kinh doanh' },
  { value: 'HOSPITAL', label: 'Y tế & Sức khỏe' },
  { value: 'SCHOOL', label: 'Học tập & Trường học' },
  { value: 'FOLKTALE', label: 'Truyện dân gian' },
  { value: 'NEWS', label: 'Tin tức' }
];

const LEVEL_COLORS: Record<string, string> = {
  N5: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  N4: 'bg-sky-100 text-sky-800 border-sky-200',
  N3: 'bg-violet-100 text-violet-800 border-violet-200',
  N2: 'bg-amber-100 text-amber-800 border-amber-200',
  N1: 'bg-rose-100 text-rose-800 border-rose-200'
};

export const ShadowingStudio: React.FC = () => {
  // ─── View State ──────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'LIBRARY' | 'STUDYING'>('LIBRARY');
  const [selectedLesson, setSelectedLesson] = useState<VideoShadowingLesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // ─── Library State ────────────────────────────────────────────
  const [lessons, setLessons] = useState<VideoShadowingLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalLessons, setTotalLessons] = useState(0);

  // ─── Filter State ─────────────────────────────────────────────
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();

  // 🔹🔹🔹 Upload Modal State 🔹🔹🔹──────────────────────────────────────
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLevel, setVideoLevel] = useState('N3');
  const [videoCategory, setVideoCategory] = useState('DAILY_LIFE');
  const [srtContent, setSrtContent] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);

  // ─── Load Lessons ─────────────────────────────────────────────
  const loadLessons = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await ReadingApi.getVideoLessons({
        level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: searchTerm || undefined,
        limit: 50
      });
      setLessons(res.items || []);
      setTotalLessons(res.pagination?.total || res.items?.length || 0);
    } catch (err: any) {
      setLoadError('Không thể tải danh sách bài học. Server có đang chạy không?');
      console.error('ShadowingStudio load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [selectedLevel, selectedCategory, searchTerm]);

  // Debounce search input
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(val);
    }, 400);
  };

  // ─── Select Lesson (load full detail with subtitles) ─────────
  const handleSelectLesson = async (lesson: VideoShadowingLesson) => {
    setIsLoadingLesson(true);
    try {
      const detail = await ReadingApi.getVideoLessonDetail(lesson.id);
      setSelectedLesson(detail);
      setViewMode('STUDYING');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load lesson detail:', err);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // ─── Back to Library ──────────────────────────────────────────
  const handleBack = () => {
    setViewMode('LIBRARY');
    setSelectedLesson(null);
    loadLessons(); // refresh để cập nhật viewCount
  };

  // ─── Process YouTube URL ──────────────────────────────────────
  const handleProcessYouTube = async () => {
    if (!videoUrl.trim()) {
      setProcessError('Vui lòng nhập đường dẫn YouTube.');
      return;
    }
    setIsProcessing(true);
    setProcessError(null);
    setProcessSuccess(null);
    try {
      const result = await ReadingApi.processYouTubeVideo({
        url: videoUrl.trim(),
        level: videoLevel,
        category: videoCategory,
        srtContent: srtContent.trim() || undefined,
          autoSync: autoSync && !srtContent.trim()
      });
      setProcessSuccess(
        `✅ Đã xử lý thành công: "${result?.title || 'Video mới'}" — ${result?.subtitles?.length || 0} câu phụ đề.`
      );
      // Thêm bài mới vào đầu danh sách ngay
      setLessons((prev) => [result, ...prev]);
      setTotalLessons((prev) => prev + 1);
      // Reset form sau 2.5s rồi đóng modal
      setTimeout(() => {
        setShowUploadModal(false);
        setVideoUrl('');
        setSrtContent('');
        setProcessSuccess(null);
      }, 2500);
    } catch (err: any) {
      setProcessError(err?.message || 'Lỗi khi xử lý video. Video cần có phụ đề tiếng Nhật (CC).');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: STUDYING MODE
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'STUDYING' && selectedLesson) {
    return (
      <div className="flex flex-col gap-6">
        {/* Studio Header (compact) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 truncate max-w-[300px]">
                {selectedLesson.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${LEVEL_COLORS[selectedLesson.level] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {selectedLesson.level}
                </span>
                {selectedLesson.subtitles && (
                  <span className="text-[11px] text-slate-400">{selectedLesson.subtitles.length} câu thoại</span>
                )}
              </div>
            </div>
          </div>
            <button
              onClick={() => {
                setViewMode("LIBRARY");
                setSelectedLesson(null);
              }}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <VideoShadowingView lesson={selectedLesson} onBack={() => { setViewMode('LIBRARY'); setSelectedLesson(null); }} />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Luyện Nghe & Shadowing</h1>
          <p className="text-sm text-slate-500 mt-1">Khám phá thư viện video phân tích ngữ pháp, luyện nghe theo cấp độ</p>
        </div>
      </div>
      {/* ── 2. Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none shadow-2xs transition"
          />
        </div>

        {/* Level Filter */}
        <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1 shadow-2xs shrink-0 overflow-x-auto">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setSelectedLevel(lv)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                selectedLevel === lv 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {lv === "ALL" ? "Tất cả" : lv}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-1 shadow-2xs shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-600 py-1.5 pr-6 focus:ring-0 cursor-pointer outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Admin Upload Button & Refresh */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition text-xs shadow-sm border border-indigo-100 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm Video</span>
            </button>
          )}
          <button
            onClick={loadLessons}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ???? 3. Lesson Grid & Empty State ???? */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200/50">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500">Đang tải thư viện bài học...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-sm text-center px-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">Chưa có bài học nào</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {user?.role === "ADMIN" 
              ? "Nhấn Thêm Video để thêm bài học đầu tiên!"
              : "Không tìm thấy bài học nào phù hợp với b? l?c hi?n t?i."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isLoading={isLoadingLesson}
                onSelect={handleSelectLesson}
                levelColor={LEVEL_COLORS[lesson.level] || 'bg-slate-100 text-slate-600 border-slate-200'}
                formatDuration={formatDuration}
              />
            ))}
          </div>

          {/* Nút thêm bài */}
          <div className="flex justify-center pt-2">
            
          </div>
        </>
      )}

      {/* ── 4. Upload / YouTube Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm text-slate-800">Thêm Video YouTube Shadowing</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập link video YouTube tiếng Nhật. Hệ thống sẽ tự động trích xuất phụ đề (CC), gắn Furigana và tạo bài luyện Shadowing đầy đủ.
            </p>

            {/* Form */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Link YouTube <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Trình độ JLPT
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setVideoLevel(lvl)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          videoLevel === lvl
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Chủ đề
                  </label>
                  <select
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    {CATEGORIES.filter(c => c.value !== 'ALL').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SRT nâng cao (tuỳ chọn) */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Nội dung SRT/VTT (tùy chọn — để trống nếu video có CC tự động)
                </label>
                <textarea
                  placeholder="Dán nội dung file .srt hoặc .vtt vào đây để có phụ đề chính xác hơn..."
                  value={srtContent}
                  onChange={(e) => setSrtContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                />
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="autoSync" 
                      checked={autoSync} 
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    />
                    <label htmlFor="autoSync" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                      T? d?ng cang ch?nh khớp nhịp âm thanh (-1.5s delay c?a YouTube Auto CC)
                    </label>
                  </div>
              </div>
            </div>

            {/* Info box */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Video cần có phụ đề tiếng Nhật (CC). Quá trình xử lý AI có thể mất 10-30 giây. Hệ thống dùng Kuromoji để gắn Furigana và tách từ tự động.</span>
            </div>

            {/* Error / Success */}
            {processError && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{processError}</span>
              </div>
            )}
            {processSuccess && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{processSuccess}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={handleProcessYouTube}
                disabled={isProcessing || !videoUrl.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2 transition"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Xử lý & Thêm bài học</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sub-component: Lesson Card
// ─────────────────────────────────────────────────────────────
interface LessonCardProps {
  lesson: VideoShadowingLesson;
  isLoading: boolean;
  onSelect: (lesson: VideoShadowingLesson) => void;
  levelColor: string;
  formatDuration: (s: number) => string;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, isLoading, onSelect, levelColor, formatDuration }) => {
  const thumbnailUrl = lesson.thumbnailUrl || `https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`;
  const subtitleCount = (lesson as any).subtitlesCount || lesson.subtitles?.length || 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={lesson.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`;
          }}
        />
        {/* Overlay khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
            <Play className="w-5 h-5 text-indigo-600 ml-0.5 fill-indigo-600" />
          </div>
        </div>
        {/* Level badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black border shadow-xs ${levelColor}`}>
          {lesson.level}
        </span>
        {/* Duration */}
        {lesson.durationSeconds > 0 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-mono">
            {formatDuration(lesson.durationSeconds)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {lesson.title}
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
          {lesson.channelTitle && (
            <span className="truncate max-w-[120px]">{lesson.channelTitle}</span>
          )}
          {subtitleCount > 0 && (
            <span className="flex items-center gap-0.5">
              <FileText className="w-3 h-3" />
              {subtitleCount} câu
            </span>
          )}
          {lesson.viewCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {lesson.viewCount}
            </span>
          )}
        </div>

        {lesson.topic && (
          <span className="text-[10px] text-slate-400 truncate">{lesson.topic}</span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <button
            onClick={() => onSelect(lesson)}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PlayCircle className="w-3.5 h-3.5" />
            )}
            <span>Bắt đầu học</span>
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            title="Mở trên YouTube"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
