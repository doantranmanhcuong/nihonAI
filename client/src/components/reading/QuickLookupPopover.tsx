'use client';

import React from 'react';
import { Volume2, X, GraduationCap, BookOpen, Loader2, Sparkles, BookmarkPlus } from 'lucide-react';
import { QuickWordLookup } from './reading.types';

interface QuickLookupPopoverProps {
  wordInfo: QuickWordLookup | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSpeak: (text: string) => void;
  onSelectGrammar?: (grammarPoint: string) => void;
  onSaveNotebook?: (wordInfo: QuickWordLookup) => void;
}

export const QuickLookupPopover: React.FC<QuickLookupPopoverProps> = ({
  wordInfo,
  position,
  onClose,
  onSpeak,
  onSelectGrammar,
  onSaveNotebook
}) => {
  if (!wordInfo || !position) return null;

  const isPhrase = wordInfo.type === 'PHRASE';

  return (
    <div
      className="fixed z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
      style={{
        left: `${Math.min(window.innerWidth - 360, Math.max(16, position.x - 180))}px`,
        top: `${Math.min(window.innerHeight - 300, position.y + 12)}px`
      }}
    >
      <div className="bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-4 w-84 max-w-[92vw] backdrop-blur-md flex flex-col gap-2.5 max-h-[82vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex flex-col">
            {isPhrase ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cụm từ được chọn</span>
              </span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black font-japanese text-amber-300">
                  {wordInfo.word}
                </span>
                {wordInfo.reading && (
                  <span className="text-xs text-slate-300 font-japanese">
                    【{wordInfo.reading}】
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trích đoạn nếu là PHRASE */}
        {isPhrase && (
          <p className="text-xs text-slate-200 font-japanese line-clamp-3 leading-relaxed italic bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40 select-text">
            &ldquo;{wordInfo.word}&rdquo;
          </p>
        )}

        {/* Hán Việt & Level (nếu là từ vựng đơn) */}
        {!isPhrase && (wordInfo.hanViet || wordInfo.level) && (
          <div className="flex items-center gap-2 text-xs">
            {wordInfo.hanViet && (
              <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                Hán Việt: {wordInfo.hanViet}
              </span>
            )}
            {wordInfo.level && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] font-bold">
                {wordInfo.level}
              </span>
            )}
          </div>
        )}

        {/* Nghĩa tiếng Việt & Phân tích chính xác cụm từ */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isPhrase ? '🇻🇳 Dịch nghĩa cụm từ:' : 'Ý nghĩa:'}
            </span>
            {wordInfo.isLoading && (
              <div className="flex items-center gap-1 text-[10px] text-sky-400 animate-pulse font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>AI đang dịch chính xác...</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-100 leading-relaxed font-sans font-medium">
            {wordInfo.meaningVi || (wordInfo.isLoading ? 'Đang phân tích nghĩa cụm từ...' : 'Đang cập nhật...')}
          </p>

          {wordInfo.explanation && (
            <p className="text-[11px] text-slate-300 font-sans border-t border-slate-700/60 pt-1.5 leading-relaxed">
              💡 {wordInfo.explanation}
            </p>
          )}

          {wordInfo.grammarNotes && (
            <div className="text-[11px] text-indigo-300 bg-indigo-950/40 p-1.5 rounded border border-indigo-800/40 font-sans flex items-center gap-1">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Ngữ pháp: {wordInfo.grammarNotes}</span>
            </div>
          )}
        </div>

        {/* CÁC MẪU NGỮ PHÁP ĐƯỢC PHÁT HIỆN TRONG ĐOẠN */}
        {wordInfo.detectedGrammars && wordInfo.detectedGrammars.length > 0 && (
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Ngữ pháp phát hiện ({wordInfo.detectedGrammars.length}):</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
              {wordInfo.detectedGrammars.map((g, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectGrammar && onSelectGrammar(g.grammarPoint)}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700 hover:border-indigo-400 text-xs flex flex-col gap-0.5 cursor-pointer transition"
                  title="Nhấp để xem giải thích chi tiết cấu trúc câu"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 font-japanese hover:underline">
                      {g.grammarPoint}
                    </span>
                    {g.level && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300">
                        {g.level}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-300 font-sans">{g.meaningVi}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
