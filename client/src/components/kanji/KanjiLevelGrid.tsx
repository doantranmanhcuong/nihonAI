'use client';

import React from 'react';
import { Volume2, BookOpen, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface KanjiCardSummary {
  character: string;
  hanViet: string;
  meaningVi: string;
  jlptLevel: string;
  strokeCount: number;
  onyomi: string;
  kunyomi: string;
}

interface KanjiLevelGridProps {
  kanjiList: KanjiCardSummary[];
  selectedKanji: string | null;
  onSelectKanji: (char: string) => void;
  currentLevel: string;
}

export const KanjiLevelGrid: React.FC<KanjiLevelGridProps> = ({
  kanjiList,
  selectedKanji,
  onSelectKanji,
  currentLevel
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const isLevelRestricted = !isAuthenticated && currentLevel !== 'N5';

  const speak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-3 w-full">
      {/* Header Danh sách */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-800">
            Thư viện Hán tự {currentLevel === 'all' ? 'Tất cả cấp độ' : `Cấp độ ${currentLevel}`}
          </h3>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-lg">
          {kanjiList.length} chữ Hán
        </span>
      </div>

      {/* Banner Khóa nếu khách viếng thăm xem từ N4-N1 */}
      {isLevelRestricted && (
        <div className="flex items-center justify-between p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="leading-snug">
              Cấp độ <strong>{currentLevel}</strong> yêu cầu đăng nhập để sử dụng đầy đủ các tính năng nâng cao!
            </span>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] shrink-0 cursor-pointer shadow-2xs"
          >
            Đăng nhập
          </button>
        </div>
      )}

      {/* Lưới các thẻ Kanji (Grid) thoáng rộng hơn */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {kanjiList.map((item) => {
          const isSelected = selectedKanji === item.character;
          const isItemLocked = !isAuthenticated && item.jlptLevel !== 'N5';

          return (
            <div
              key={item.character}
              onClick={() => onSelectKanji(item.character)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102 ring-2 ring-indigo-300'
                  : 'bg-slate-50 hover:bg-indigo-50/70 border-slate-200/70 hover:border-indigo-300 text-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {item.character}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold flex items-center gap-0.5 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isItemLocked
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {isItemLocked && <Lock className="w-2.5 h-2.5" />}
                  {item.jlptLevel}
                </span>
              </div>

              <div className="mt-1">
                <span
                  className={`text-xs font-bold block truncate ${
                    isSelected ? 'text-indigo-100' : 'text-slate-700'
                  }`}
                >
                  {item.hanViet}
                </span>
                <span
                  className={`text-[10px] block truncate mt-0.5 ${
                    isSelected ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {item.meaningVi}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
                <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {item.strokeCount} nét
                </span>
                <button
                  onClick={(e) => speak(e, item.character)}
                  className={`p-1 rounded-md transition-colors ${
                    isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-400'
                  }`}
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
