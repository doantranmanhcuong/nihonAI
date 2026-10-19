'use client';

import React from 'react';
import { Volume2, Lock, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface VocabularySummary {
  id: string;
  word: string;
  reading: string;
  romaji: string | null;
  hanViet: string | null;
  meaningVi: string;
  jlptLevel: string;
  lesson: number | null;
  partOfSpeech: string | null;
  pitchAccent: string | null;
}

interface VocabCardListProps {
  items: VocabularySummary[];
  selectedId: string | null;
  onSelectItem: (item: VocabularySummary) => void;
  isLoading: boolean;
}

export const VocabCardList: React.FC<VocabCardListProps> = ({
  items,
  selectedId,
  onSelectItem,
  isLoading
}) => {
  const { isAuthenticated } = useAuth();

  const speak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Đang tải danh sách từ vựng...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700">Không tìm thấy từ vựng phù hợp</p>
        <p className="text-xs text-slate-400 max-w-xs">
          Vui lòng thử tìm kiếm bằng từ khóa khác hoặc thay đổi bộ lọc bài học / cấp độ JLPT.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        const isLocked = !isAuthenticated && item.jlptLevel !== 'N5';

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group shadow-2xs ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-101 ring-2 ring-indigo-300'
                : 'bg-white hover:bg-indigo-50/60 border-slate-200/80 hover:border-indigo-300'
            }`}
          >
            {/* Hàng 1: Từ gốc & Cấp độ JLPT */}
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-xs font-bold block ${
                    isSelected ? 'text-indigo-200' : 'text-indigo-600'
                  }`}
                >
                  {item.reading}
                </span>
                <span
                  className={`text-xl font-black block mt-0.5 ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {item.word}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {isLocked && (
                  <span className="p-1 bg-amber-100 text-amber-800 rounded-md">
                    <Lock className="w-3 h-3" />
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.jlptLevel}
                </span>
              </div>
            </div>

            {/* Hàng 2: Âm Hán Việt & Nghĩa tiếng Việt */}
            <div className="mt-2 pt-2 border-t border-black/5">
              {item.hanViet && (
                <span
                  className={`text-[11px] font-bold block truncate ${
                    isSelected ? 'text-indigo-100' : 'text-slate-600'
                  }`}
                >
                  [ {item.hanViet} ]
                </span>
              )}
              <span
                className={`text-xs block truncate mt-0.5 ${
                  isSelected ? 'text-indigo-100 font-medium' : 'text-slate-500'
                }`}
              >
                {item.meaningVi}
              </span>
            </div>

            {/* Hàng 3: Loa phát âm & Bài học */}
            <div className="flex items-center justify-between mt-2 pt-1.5 text-[10px]">
              <span className={isSelected ? 'text-indigo-200' : 'text-slate-400'}>
                {item.lesson ? `Minna Bài ${item.lesson}` : item.partOfSpeech || 'Từ vựng'}
              </span>

              <button
                onClick={(e) => speak(e, item.word)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-indigo-600'
                }`}
                title="Nghe phát âm"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
