'use client';

import React from 'react';
import { Volume2, BookOpen, Sparkles, Plus, Bookmark } from 'lucide-react';

export interface MinaVocabulary {
  word: string;
  reading: string;
  pitchAccent?: string;
  hanViet: string;
  meaning: string;
  source?: string;
}

interface CompoundWord {
  word: string;
  reading: string;
  meaning: string;
  jlpt?: string;
  pitchAccent?: string;
}

interface KanjiCompoundTreeProps {
  character: string;
  hanViet: string;
  onyomi: string;
  kunyomi: string;
  compoundsTree: {
    onyomiCompounds: CompoundWord[];
    kunyomiCompounds: CompoundWord[];
  };
  minaVocabularies?: MinaVocabulary[];
}

export const KanjiCompoundTree: React.FC<KanjiCompoundTreeProps> = ({
  character,
  hanViet,
  onyomi,
  kunyomi,
  compoundsTree,
  minaVocabularies = []
}) => {
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Hàm render hiển thị trọng âm Nhật Bản (Pitch Accent Line) trực quan như Hình 2
  const renderPitchAccent = (reading: string, pitchPattern?: string) => {
    if (!pitchPattern) {
      return <span className="text-slate-600">({reading})</span>;
    }

    // Tách các phần nằm trong ngoặc vuông [cao]
    const parts = pitchPattern.split(/(\[[^\]]+\])/);

    return (
      <span className="inline-flex items-center text-slate-700 font-medium tracking-tight">
        (
        {parts.map((part, idx) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const highMora = part.slice(1, -1);
            return (
              <span
                key={idx}
                className="border-t-2 border-r-2 border-orange-500 text-orange-600 font-bold px-0.5 leading-none"
                title="Trọng âm cao (High Pitch)"
              >
                {highMora}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
        )
      </span>
    );
  };

  const vocabList: MinaVocabulary[] =
    minaVocabularies && minaVocabularies.length > 0
      ? minaVocabularies
      : (compoundsTree?.onyomiCompounds || []).map((c) => ({
          word: c.word,
          reading: c.reading,
          pitchAccent: c.pitchAccent || `[${c.reading}]`,
          hanViet: `${hanViet}`,
          meaning: c.meaning,
          source: 'Mina / Tango'
        }));

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-5 w-full">
      {/* Tiêu đề mục: Từ vựng trong (Mina, Tango) - Chuẩn như Hình 2 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-orange-500 fill-orange-100" />
          <h3 className="text-base font-extrabold text-orange-600">
            Từ vựng trong (Mina, Tango) kèm Trọng âm
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
          {vocabList.length} từ vựng
        </span>
      </div>

      {/* Danh sách Từ ghép Jukugo chi tiết (Hiển thị Trọng âm & Âm thanh) */}
      <div className="flex flex-col divide-y divide-slate-100 max-h-[480px] overflow-y-auto pr-1">
        {vocabList.map((item, idx) => (
          <div
            key={idx}
            className="py-3 px-2 hover:bg-slate-50 rounded-2xl transition-colors flex items-center justify-between group gap-3"
          >
            {/* Cột Trái: Biểu tượng ngón tay + Từ Kanji + Trọng âm + Hán Việt + Ý nghĩa */}
            <div className="flex items-start gap-3 flex-1">
              <span className="text-slate-400 mt-0.5 text-sm group-hover:text-indigo-600 transition-colors">
                👉
              </span>

              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                {/* Từ vựng Kanji */}
                <span className="text-base font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {item.word}
                </span>

                {/* Trọng âm Pitch Accent (Kèm đường kẻ cam đỉnh) */}
                <span className="text-xs">
                  {renderPitchAccent(item.reading, item.pitchAccent)}
                </span>

                <span className="text-xs font-bold text-slate-400">-</span>

                {/* Âm Hán Việt */}
                <span className="text-xs font-black text-slate-700 tracking-wide uppercase">
                  {item.hanViet}
                </span>

                <span className="text-xs font-bold text-slate-400">-</span>

                {/* Ý nghĩa tiếng Việt */}
                <span className="text-xs font-medium text-slate-600">
                  {item.meaning}
                </span>
              </div>
            </div>

            {/* Cột Phải: Nút Loa phát âm */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => speak(item.word)}
                className="p-1.5 hover:bg-orange-50 rounded-xl text-slate-400 hover:text-orange-600 transition-colors"
                title="Nghe phát âm chuẩn"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
