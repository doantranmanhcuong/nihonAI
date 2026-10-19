'use client';

import React from 'react';
import { X, GraduationCap, Volume2, BookOpen, Lightbulb, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { ReadingGrammarItem, DetailedGrammarInfo } from './reading.types';

interface GrammarDetailModalProps {
  isOpen: boolean;
  grammar: ReadingGrammarItem | null;
  detailedInfo: DetailedGrammarInfo | null;
  isLoading?: boolean;
  onClose: () => void;
  onSpeak: (text: string) => void;
  onJumpToSentence?: () => void;
}

export const GrammarDetailModal: React.FC<GrammarDetailModalProps> = ({
  isOpen,
  grammar,
  detailedInfo,
  isLoading = false,
  onClose,
  onSpeak,
  onJumpToSentence
}) => {
  if (!isOpen || !grammar) return null;

  const currentLevel = detailedInfo?.level || grammar.level || 'JLPT';
  const currentMeaning = detailedInfo?.meaningVi || grammar.meaningVi;
  const currentStructure = detailedInfo?.structure;
  const currentExplanation = detailedInfo?.explanation;
  const excerptText = detailedInfo?.excerpt || grammar.excerpt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-2xs">
                {currentLevel}
              </span>
              <span className="text-xs text-blue-700 font-bold flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Mẫu ngữ pháp trọng điểm</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-japanese text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{grammar.grammarPoint}</span>
              <button
                onClick={() => onSpeak(grammar.grammarPoint.replace(/[〜~]/g, ''))}
                className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white transition cursor-pointer"
                title="Nghe phát âm mẫu ngữ pháp"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </h2>

            <p className="text-sm font-bold text-slate-700 font-sans">
              Ý nghĩa: <span className="text-blue-900">{currentMeaning}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* 1. CẤU TRÚC KẾT HỢP (FORMULA) */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Cấu trúc kết hợp & Công thức</span>
            </div>

            {isLoading && !currentStructure ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Đang phân tích cấu trúc chi tiết...</span>
              </div>
            ) : (
              <div className="font-mono text-xs sm:text-sm font-bold bg-white text-blue-950 p-3 rounded-xl border border-blue-100 shadow-2xs leading-relaxed">
                {currentStructure || `${grammar.grammarPoint} + ...`}
              </div>
            )}
          </div>

          {/* 2. ĐOẠN CÂU ĐƯỢC DÙNG TRONG BÀI ĐỌC */}
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200/60 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Đoạn câu được dùng trong bài đọc:</span>
              </div>

              {onJumpToSentence && (
                <button
                  onClick={onJumpToSentence}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Xem trong văn bản</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-japanese text-sm sm:text-base font-medium text-slate-900 leading-relaxed select-text">
                  {excerptText}
                </p>
                <button
                  onClick={() => onSpeak(excerptText)}
                  className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition cursor-pointer shrink-0"
                  title="Nghe câu này"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {detailedInfo?.excerptAnalysis && (
                <p className="text-xs text-blue-800 bg-blue-50/60 p-2 rounded-lg border-l-2 border-blue-500 font-sans">
                  💡 {detailedInfo.excerptAnalysis}
                </p>
              )}
            </div>
          </div>

          {/* 3. GIẢI THÍCH CHI TIẾT CÁCH DÙNG & SẮC THÁI */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Giải thích chi tiết & Sắc thái sử dụng</span>
            </div>

            {isLoading && !currentExplanation ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>AI đang hoàn tất giải thích sắc thái chuyên sâu...</span>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60 whitespace-pre-line">
                {currentExplanation || grammar.meaningVi}
              </div>
            )}
          </div>

          {/* 4. CÁC CÂU VÍ DỤ MINH HỌA (EXAMPLES) */}
          {detailedInfo?.examples && detailedInfo.examples.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                Ví dụ bổ trợ chuẩn đề thi:
              </div>

              <div className="space-y-2">
                {detailedInfo.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col gap-1 select-text"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-japanese font-bold text-slate-900 text-sm">
                          {ex.japanese}
                        </span>
                        {ex.reading && (
                          <span className="text-[11px] text-slate-400 font-japanese">
                            {ex.reading}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onSpeak(ex.japanese)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 font-sans">{ex.vietnamese}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
