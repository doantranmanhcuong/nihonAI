'use client';

import React from 'react';
import { PenTool, Sparkles, BookOpen, Layers, ArrowLeft } from 'lucide-react';

interface KanjiEmptyStateProps {
  onSelectSample: (char: string) => void;
}

export const KanjiEmptyState: React.FC<KanjiEmptyStateProps> = ({ onSelectSample }) => {
  const popularSamples = [
    { char: '土', name: 'THỔ (Đất)' },
    { char: '火', name: 'HỎA (Lửa)' },
    { char: '水', name: 'THỦY (Nước)' },
    { char: '木', name: 'MỘC (Cây)' },
    { char: '金', name: 'KIM (Vàng)' },
    { char: '日', name: 'NHẬT (Mặt trời)' },
    { char: '休', name: 'HƯU (Nghỉ ngơi)' },
    { char: '学', name: 'HỌC (Học tập)' }
  ];

  return (
    <div className="bg-white p-8 lg:p-12 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-6 min-h-[480px]">
      {/* Icon biểu tượng bút vẽ cách điệu */}
      <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner relative">
        <PenTool className="w-9 h-9" />
        <div className="w-4 h-4 bg-amber-400 rounded-full absolute -top-1 -right-1 flex items-center justify-center shadow-xs">
          <Sparkles className="w-2.5 h-2.5 text-slate-900" />
        </div>
      </div>

      {/* Tiêu đề & Hướng dẫn */}
      <div className="max-w-md">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Bảng Phân Tích Kanji Đang Trống
        </h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Hãy vẽ nét chữ Hán bất kỳ vào khung bên trái. Hệ thống sẽ tự động nhận diện thời gian thực, bóc tách bộ thủ, âm On/Kun và mẹo nhớ AI.
        </p>
      </div>

      {/* Gợi ý hướng dẫn */}
      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50/70 px-4 py-2 rounded-xl border border-indigo-100">
        <ArrowLeft className="w-4 h-4 animate-pulse" />
        Dùng chuột hoặc ngón tay vẽ vào ô chữ thập bên trái để bắt đầu
      </div>

      {/* Hoặc bấm thử nhanh */}
      <div className="flex flex-col items-center gap-2.5 pt-2 border-t border-slate-100 w-full max-w-lg">
        <span className="text-xs text-slate-400 font-medium">Hoặc nhấp thử nhanh các chữ phổ biến:</span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {popularSamples.map((item) => (
            <button
              key={item.char}
              onClick={() => onSelectSample(item.char)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span className="text-base text-slate-900 font-black">{item.char}</span>
              <span className="text-[11px] text-slate-400">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
