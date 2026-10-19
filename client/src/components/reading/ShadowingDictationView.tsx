'use client';

import React from 'react';
import {
  Keyboard,
  Shuffle,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCw
} from 'lucide-react';

interface ShadowingDictationViewProps {
  currentSentence: {
    id: string;
    sentenceJp: string;
    sentenceVi: string;
    furigana?: string;
  } | null;
  dictationSubMode: 'TYPING' | 'ORDERING';
  onChangeSubMode: (mode: 'TYPING' | 'ORDERING') => void;
  // Typing
  userInput: string;
  onChangeUserInput: (val: string) => void;
  isHintRevealed: boolean;
  onToggleHint: () => void;
  hasCheckedAnswer: boolean;
  isAnswerCorrect: boolean | null;
  diffResult: { char: string; status: 'CORRECT' | 'WRONG' | 'MISSING' }[];
  onCheckTypingAnswer: () => void;
  onNextSentence: () => void;
  canNext: boolean;
  // Ordering
  scrambledWords: string[];
  selectedWordChips: string[];
  onSelectWordChip: (word: string, index: number) => void;
  onDeselectWordChip: (word: string, index: number) => void;
  isOrderingChecked: boolean;
  isOrderingCorrect: boolean | null;
  onCheckOrderingAnswer: () => void;
  onResetOrdering: () => void;
}

export const ShadowingDictationView: React.FC<ShadowingDictationViewProps> = ({
  currentSentence,
  dictationSubMode,
  onChangeSubMode,
  userInput,
  onChangeUserInput,
  isHintRevealed,
  onToggleHint,
  hasCheckedAnswer,
  isAnswerCorrect,
  diffResult,
  onCheckTypingAnswer,
  onNextSentence,
  canNext,
  scrambledWords,
  selectedWordChips,
  onSelectWordChip,
  onDeselectWordChip,
  isOrderingChecked,
  isOrderingCorrect,
  onCheckOrderingAnswer,
  onResetOrdering
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col gap-4">
      {/* Header Sub-modes: [Gõ chính tả] vs [Ghép câu] */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => onChangeSubMode('TYPING')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            dictationSubMode === 'TYPING'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Gõ chính tả</span>
        </button>
        <button
          onClick={() => onChangeSubMode('ORDERING')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            dictationSubMode === 'ORDERING'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Ghép câu</span>
        </button>
      </div>

      {/* Sub-mode 1: Gõ chính tả */}
      {dictationSubMode === 'TYPING' && (
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            GÕ NHỮNG GÌ BẠN NGHE ĐƯỢC:
          </label>

          <textarea
            rows={4}
            value={userInput}
            onChange={(e) => onChangeUserInput(e.target.value)}
            placeholder="Gõ câu trả lời bằng tiếng Nhật tại đây..."
            className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden resize-none font-japanese leading-relaxed"
          />

          {/* Eye Hint Box */}
          <div className="flex flex-col gap-1">
            <button
              onClick={onToggleHint}
              className={`w-full py-2.5 px-4 rounded-2xl border text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                isHintRevealed
                  ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-bold font-japanese text-xs'
                  : 'bg-slate-100/80 border-slate-200 text-slate-400 font-mono tracking-widest text-sm'
              }`}
            >
              {isHintRevealed ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{currentSentence ? currentSentence.sentenceJp : ''}</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>..................</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-slate-400 text-center">
              Nhấp vào biểu tượng con mắt để xem gợi ý
            </span>
          </div>

          {/* Diff Result */}
          {hasCheckedAnswer && (
            <div
              className={`p-3 rounded-2xl border text-xs font-japanese leading-relaxed ${
                isAnswerCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {isAnswerCorrect ? (
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Chính xác 100%! Bạn làm rất tốt!
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-1">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Chưa khớp (Đỏ: sai / thiếu):
                  </div>
                  <div className="flex flex-wrap gap-1 text-sm font-bold">
                    {diffResult.map((d, i) => (
                      <span
                        key={i}
                        className={`px-1 rounded ${
                          d.status === 'CORRECT'
                            ? 'text-emerald-700 bg-emerald-100/60'
                            : 'text-rose-700 bg-rose-200/80'
                        }`}
                      >
                        {d.char}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-1">
            <button
              onClick={onCheckTypingAnswer}
              disabled={!userInput.trim()}
              className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-900 font-bold text-xs uppercase tracking-wider shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              KIỂM TRA ĐÁP ÁN
            </button>

            <button
              onClick={onNextSentence}
              disabled={!canNext}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer disabled:opacity-40"
            >
              TIẾP THEO ▷
            </button>
          </div>
        </div>
      )}

      {/* Sub-mode 2: Ghép câu */}
      {dictationSubMode === 'ORDERING' && (
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            BẤM CHỌN CÁC TỪ THEO THỨ TỰ ĐÚNG:
          </label>

          <div className="min-h-16 p-3 rounded-2xl border border-dashed border-teal-300 bg-teal-50/40 flex flex-wrap gap-1.5 items-center">
            {selectedWordChips.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                Chọn các mảnh từ bên dưới để xếp vào đây...
              </span>
            ) : (
              selectedWordChips.map((word, idx) => (
                <span
                  key={idx}
                  onClick={() => onDeselectWordChip(word, idx)}
                  className="px-2.5 py-1 rounded-xl bg-teal-600 text-white font-japanese font-bold text-xs shadow-2xs hover:bg-teal-700 transition cursor-pointer"
                >
                  {word}
                </span>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {scrambledWords.map((word, idx) => (
              <button
                key={idx}
                onClick={() => onSelectWordChip(word, idx)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-teal-400 text-slate-800 font-japanese font-bold text-xs shadow-2xs hover:bg-slate-50 transition cursor-pointer"
              >
                {word}
              </button>
            ))}
          </div>

          {isOrderingChecked && (
            <div
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                isOrderingCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {isOrderingCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ghép câu hoàn toàn chính xác!
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Thứ tự chưa đúng, bấm Reset để thử lại.
                </>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <button
              onClick={onResetOrdering}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Đặt lại các từ"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onCheckOrderingAnswer}
              disabled={selectedWordChips.length === 0}
              className="flex-1 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 font-bold text-xs uppercase text-slate-900 shadow-xs transition cursor-pointer disabled:opacity-40"
            >
              KIỂM TRA THỨ TỰ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
