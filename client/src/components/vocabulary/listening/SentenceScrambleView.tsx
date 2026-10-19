'use client';

import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { SentenceItem } from './sentence-chunker';

interface SentenceScrambleViewProps {
  currentItem: SentenceItem;
  availableChips: { id: string; text: string }[];
  selectedChips: { id: string; text: string }[];
  isAnswerChecked: boolean;
  isCorrect: boolean;
  showHint: boolean;
  gaveUp: boolean;
  onSelectChip: (chip: { id: string; text: string }) => void;
  onRemoveChip: (chip: { id: string; text: string }) => void;
  onReset: () => void;
  onNext: () => void;
  onPrev?: () => void;
  canPrev?: boolean;
}

export const SentenceScrambleView: React.FC<SentenceScrambleViewProps> = ({
  currentItem,
  availableChips,
  selectedChips,
  isAnswerChecked,
  isCorrect,
  showHint,
  gaveUp,
  onSelectChip,
  onRemoveChip,
  onReset,
  onNext,
  onPrev,
  canPrev
}) => {
  return (
    <div className="flex flex-col items-center gap-8 w-full my-auto">
      {/* Vùng các ô nét đứt đón nhận từ (Drop zone) */}
      <div className="flex items-center justify-center gap-3 flex-wrap min-h-[56px] w-full border-b border-slate-100 pb-8">
        {currentItem.chunks.map((_, idx) => {
          const placed = selectedChips[idx];
          return (
            <div
              key={idx}
              onClick={() => placed && onRemoveChip(placed)}
              className={`min-w-[120px] sm:min-w-[150px] h-12 rounded-xl flex items-center justify-center px-4 font-black text-base sm:text-lg transition-all ${
                placed
                  ? 'bg-indigo-600 text-white border border-indigo-700 shadow-md cursor-pointer hover:bg-indigo-700'
                  : 'border-2 border-dashed border-slate-300 bg-slate-50 text-transparent'
              }`}
            >
              {placed ? placed.text : '____'}
            </div>
          );
        })}
      </div>

      {/* Khay các mẩu từ có thể chọn (Word Chips Bank) */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {availableChips.map((chip, idx) => (
          <button
            key={chip.id}
            onClick={() => onSelectChip(chip)}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-black text-base sm:text-lg rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="text-[10px] text-indigo-700 font-mono px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded">
              {idx + 1}
            </span>
            <span>{chip.text}</span>
          </button>
        ))}
      </div>

      {/* Hiển thị gợi ý nghĩa tiếng Việt nếu được yêu cầu */}
      {showHint && !isAnswerChecked && (
        <p className="text-xs sm:text-sm text-amber-600 font-bold italic animate-in fade-in">
          💡 Dịch nghĩa: {currentItem.vietnamese}
        </p>
      )}

      {/* Kết quả kiểm tra đáp án */}
      {isAnswerChecked && (
        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 font-black text-sm sm:text-base ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Chính xác! Giỏi lắm 🎉</span>
              </>
            ) : gaveUp ? (
              <>
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>Đáp án hoàn chỉnh của câu này:</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>Chưa đúng rồi! Hãy thử sắp xếp lại nhé</span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 italic text-center max-w-lg">
            {currentItem.vietnamese}
          </p>

          <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
            {canPrev && onPrev && (
              <button
                onClick={onPrev}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Câu trước</span>
              </button>
            )}

            {!isCorrect && !gaveUp && (
              <button
                onClick={onReset}
                className="px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-indigo-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại câu này</span>
              </button>
            )}

            <button
              onClick={onNext}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <span>Câu tiếp theo (Space)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
