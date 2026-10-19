'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Languages,
  Flame
} from 'lucide-react';

interface DokkaiAudioBarProps {
  currentSentenceVi?: string;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  furiganaMode: 'ALL' | 'HARD' | 'NONE';
  onChangeFuriganaMode: (mode: 'ALL' | 'HARD' | 'NONE') => void;
  jlptHeatmap: boolean;
  onToggleJlptHeatmap: () => void;
  playbackProgressSec: number;
  totalDurationSec: number;
  onSeek: (targetSec: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  autoPause: boolean;
  onToggleAutoPause: () => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const DokkaiAudioBar: React.FC<DokkaiAudioBarProps> = ({
  currentSentenceVi,
  showTranslation,
  onToggleTranslation,
  furiganaMode,
  onChangeFuriganaMode,
  jlptHeatmap,
  onToggleJlptHeatmap,
  playbackProgressSec,
  totalDurationSec,
  onSeek,
  isPlaying,
  onTogglePlay,
  isRepeat,
  onToggleRepeat,
  autoPause,
  onToggleAutoPause,
  playbackSpeed,
  onChangePlaybackSpeed,
  canPrev,
  canNext,
  onPrev,
  onNext
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md p-3.5 lg:p-4 flex flex-col gap-2.5 sticky top-[68px] z-30 select-none transition-all ring-1 ring-slate-900/5">
      {/* Khi bật Bản dịch: Hiện dòng dịch câu đang phát trên thanh audio */}
      {showTranslation && (
        <div className="text-xs lg:text-sm text-slate-600 font-sans font-medium flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase tracking-wider shrink-0">
            VN
          </span>
          <span className="truncate">
            {currentSentenceVi || 'Bản dịch câu đang phát sẽ hiển thị tại đây...'}
          </span>
        </div>
      )}

      {/* Thanh timeline tiến độ: CHẠY MƯỢT MÀ TỪ ĐẦU ĐẾN CUỐI THEO TIẾN TRÌNH ÂM THANH */}
      <div className="flex items-center gap-3 px-1 text-xs text-slate-500 font-mono">
        <span className="font-bold text-slate-700 select-none w-10">
          {formatTime(Math.floor(playbackProgressSec))}
        </span>

        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onSeek(ratio * totalDurationSec);
          }}
          className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden relative cursor-pointer group py-0.5"
        >
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-150 relative"
            style={{
              width: `${Math.min(100, Math.max(0, (playbackProgressSec / Math.max(1, totalDurationSec)) * 100))}%`
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>

        <span className="text-slate-400 select-none w-10 text-right">
          {formatTime(totalDurationSec)}
        </span>
      </div>

      {/* Cụm nút điều khiển audio */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Câu trước */}
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
            title="Câu trước"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Nút Play / Pause xanh dương */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-xs font-bold transition cursor-pointer"
            title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Câu tiếp theo */}
          <button
            onClick={onNext}
            disabled={!canNext}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
            title="Câu tiếp theo"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* NÚT LẶP CÂU (Loop vô hạn cho tới khi bấm tắt) */}
          <button
            onClick={onToggleRepeat}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              isRepeat
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Nhấn để lặp lại liên tục câu này cho tới khi tắt đi"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRepeat ? 'animate-spin' : ''}`} />
            <span>Lặp câu</span>
          </button>

          {/* NÚT TỰ NGẮT CÂU (Auto-pause) */}
          <button
            onClick={onToggleAutoPause}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              autoPause
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
            title="Khi bật: Đọc hết 1 câu thì tự dừng lại để người học nhại lại (Shadowing)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoPause ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span>Tự ngắt câu: {autoPause ? 'BẬT' : 'TẮT'}</span>
          </button>

          {/* Tốc độ đọc */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {[0.8, 1.0, 1.2].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangePlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Công cụ bên phải: Furigana & Nút Bản dịch */}
        <div className="flex items-center gap-2">
          
          {/* Furigana Mode Toggle (Smart Furigana) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold border border-slate-200">
            <span className="px-2 text-slate-500 hidden sm:inline">ふりがな:</span>
            {[
              { mode: 'ALL', label: 'TẤT CẢ' },
              { mode: 'HARD', label: 'N1/N2' },
              { mode: 'NONE', label: 'TẮT' }
            ].map((m) => (
              <button
                key={m.mode}
                onClick={() => onChangeFuriganaMode(m.mode as any)}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  furiganaMode === m.mode
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* JLPT Heatmap Toggle */}
          <button
            onClick={onToggleJlptHeatmap}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              jlptHeatmap
                ? 'bg-rose-100 text-rose-700 border-rose-300 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Bật/Tắt Bản đồ nhiệt độ JLPT"
          >
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">JLPT Heatmap</span>
          </button>


          {/* NÚT BẢN DỊCH */}
          <button
            onClick={onToggleTranslation}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              showTranslation
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Bản dịch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
