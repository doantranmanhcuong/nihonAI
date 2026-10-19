'use client';

import React from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { SentenceItem } from './sentence-chunker';

interface DictationTypingViewProps {
  currentItem: SentenceItem;
  typedInput: string;
  onChangeInput: (val: string) => void;
  onSubmit: () => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onReset: () => void;
  onNext: () => void;
  onPrev?: () => void;
  canPrev?: boolean;
}

export const DictationTypingView: React.FC<DictationTypingViewProps> = ({
  currentItem,
  typedInput,
  onChangeInput,
  onSubmit,
  isAnswerChecked,
  isCorrect,
  onReset,
  onNext,
  onPrev,
  canPrev
}) => {
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl my-auto">
      <p className="text-xs sm:text-sm text-slate-600 font-semibold">
        Nghe âm thanh và gõ lại câu tiếng Nhật bằng bàn phím:
      </p>

      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={typedInput}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          placeholder=""
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder-emerald-800 focus:outline-none focus:border-emerald-400 text-base"
        />
        <button
          onClick={onSubmit}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs cursor-pointer transition-all shadow-md active:scale-95"
        >
          Kiểm tra
        </button>
      </div>

      {isAnswerChecked && (
        <div className="flex flex-col items-center gap-2 w-full p-4 bg-white rounded-2xl border border-slate-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <span className={`font-black text-sm ${isCorrect ? 'text-slate-600' : 'text-rose-300'}`}>
              {isCorrect ? 'Gõ chính xác tuyệt đối!' : 'Đáp án đúng là:'}
            </span>
          </div>

          <p className="text-base font-black text-slate-900">{currentItem.originalSentence}</p>
          <p className="text-xs text-slate-500 italic">{currentItem.vietnamese}</p>

          <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
            {canPrev && onPrev && (
              <button
                onClick={onPrev}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Câu trước</span>
              </button>
            )}

            {!isCorrect && (
              <button
                onClick={onReset}
                className="px-4 py-2 bg-slate-200 hover:bg-indigo-600 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
            )}

            <button
              onClick={onNext}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
