'use client';

import React from 'react';
import { GitCompare, AlertTriangle, Lightbulb, ArrowRight, Volume2 } from 'lucide-react';

interface LookalikeKanji {
  character: string;
  hanViet: string;
  meaningVi: string;
  radicalDiff: string;
  mnemonicTip: string;
}

interface KanjiLookalikesProps {
  currentKanji: {
    character: string;
    hanViet: string;
    meaningVi: string;
  };
  lookalikes: LookalikeKanji[];
  onSelectKanji: (char: string) => void;
}

export const KanjiLookalikes: React.FC<KanjiLookalikesProps> = ({
  currentKanji,
  lookalikes,
  onSelectKanji
}) => {
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  if (!lookalikes || lookalikes.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center flex flex-col items-center justify-center gap-3 text-slate-500">
        <GitCompare className="w-8 h-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">Chưa ghi nhận chữ dễ gây nhầm lẫn phổ biến</p>
        <p className="text-xs text-slate-400">Chữ này có cấu tạo bộ thủ độc nhất, ít bị nhầm với các chữ Hán khác.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-6 w-full">
      {/* Tiêu đề */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-rose-500" />
          Trình Phân Biệt Chữ Hán Dễ Nhầm Lẫn (Lookalikes Resolver)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          So sánh song song các cặp chữ có hình dạng tương tự để tránh nhầm lẫn khi làm bài thi JLPT.
        </p>
      </div>

      {/* Danh sách các cặp so sánh */}
      <div className="flex flex-col gap-5">
        {lookalikes.map((item, idx) => (
          <div
            key={idx}
            className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-col gap-4"
          >
            {/* So sánh 2 Chữ Cạnh Nhau (Side-by-side) */}
            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Chữ Hiện Tại */}
              <div className="p-4 bg-white rounded-xl border-2 border-indigo-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase">Chữ đang học</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900">{currentKanji.character}</span>
                    <span className="text-sm font-bold text-slate-500">- {currentKanji.hanViet}</span>
                  </div>
                  <span className="text-xs text-slate-600 block mt-0.5">{currentKanji.meaningVi}</span>
                </div>
                <button
                  onClick={() => speak(currentKanji.character)}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Chữ Dễ Nhầm Lẫn */}
              <div className="p-4 bg-white rounded-xl border-2 border-rose-200 shadow-2xs flex items-center justify-between group">
                <div>
                  <span className="text-xs font-bold text-rose-600 uppercase">Chữ dễ bị nhầm</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-rose-600">{item.character}</span>
                    <span className="text-sm font-bold text-slate-500">- {item.hanViet}</span>
                  </div>
                  <span className="text-xs text-slate-600 block mt-0.5">{item.meaningVi}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speak(item.character)}
                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onSelectKanji(item.character)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-all"
                  >
                    Xem chữ này
                  </button>
                </div>
              </div>
            </div>

            {/* Phân tích Điểm Khác Biệt ở Bộ Thủ */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Điểm khác biệt chí mạng:</span>
                <span className="mt-0.5 leading-relaxed block">{item.radicalDiff}</span>
              </div>
            </div>

            {/* Mẹo Nhớ Phân Biệt Của AI */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-xs text-indigo-950">
              <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Mẹo nhớ phân biệt (AI Memory Hook):</span>
                <span className="mt-0.5 italic leading-relaxed block">"{item.mnemonicTip}"</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
