'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Volume2,
  Bookmark,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  GitCompare,
  BookOpen,
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';
import { GrammarMasterItem } from './grammar.types';

interface GrammarDetailViewProps {
  item: GrammarMasterItem;
  isBookmarked: boolean;
  onToggleBookmark: (item: GrammarMasterItem) => void;
  onOpenAiAnalysis: (item: GrammarMasterItem) => void;
  onNavigateToReading?: () => void;
}

export const GrammarDetailView: React.FC<GrammarDetailViewProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onOpenAiAnalysis,
  onNavigateToReading
}) => {
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  // Tự động reset trạng thái quiz khi chuyển sang mẫu ngữ pháp khác
  useEffect(() => {
    setSelectedQuizAnswer(null);
    setIsQuizSubmitted(false);
  }, [item.id]);

  // Xáo trộn thứ tự các đáp án bằng Fisher-Yates để đáp án ngẫu nhiên không cố định 1 chỗ
  const shuffledQuizOptions = useMemo(() => {
    if (!item.quickQuiz) return [];
    const opts = item.quickQuiz.options.map((text, idx) => ({
      text,
      textVi: item.quickQuiz!.optionsVi?.[idx],
      isCorrect: idx === item.quickQuiz!.correctIndex,
      originalIndex: idx
    }));

    let seed = 0;
    for (let i = 0; i < item.id.length; i++) {
      seed = (seed * 31 + item.id.charCodeAt(i)) % 1000000;
    }
    const shuffled = [...opts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [item.id, item.quickQuiz]);

  // Phát âm Web Speech API
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[〜~]/g, ''));
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectQuizOption = (index: number) => {
    if (isQuizSubmitted) return;
    setSelectedQuizAnswer(index);
    setIsQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedQuizAnswer(null);
    setIsQuizSubmitted(false);
  };

  const levelColorMap: Record<string, string> = {
    N5: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    N4: 'bg-blue-50 text-blue-700 border-blue-200',
    N3: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    N2: 'bg-purple-50 text-purple-700 border-purple-200',
    N1: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. Header Mẫu Ngữ Pháp */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black border ${
                levelColorMap[item.level] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.level}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">
              {item.formality}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(item)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
              <span>{isBookmarked ? 'Đã ghim' : 'Ghim mẫu này'}</span>
            </button>

            <button
              onClick={() => onOpenAiAnalysis(item)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phân tích AI</span>
            </button>
          </div>
        </div>

        {/* Tiêu đề ngữ pháp & nút phát âm */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl lg:text-4xl font-black font-japanese text-slate-900 tracking-tight">
            {item.grammarPoint}
          </h1>
          <button
            onClick={() => speakText(item.grammarPoint)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
            title="Nghe phát âm"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Ý nghĩa tiếng Việt */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Ý nghĩa cốt lõi:
          </div>
          <div className="text-base font-bold text-indigo-950">
            {item.meaningVi}
          </div>
        </div>

        {/* Công thức tổng quát */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Cấu trúc:</span>
          <code className="px-3 py-1.5 bg-slate-900 text-amber-300 rounded-xl text-sm font-mono font-bold">
            {item.structure}
          </code>
        </div>
      </div>

      {/* 2. Bảng Quy Tắc Kết Hợp (Formation Table) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-black text-slate-900">
            Quy Tắc Chia & Kết Hợp (接続)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-xl">Loại từ</th>
                <th className="py-3 px-4">Quy tắc nối câu</th>
                <th className="py-3 px-4 rounded-r-xl">Ví dụ kết hợp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {item.formationRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-900 whitespace-nowrap">
                    {rule.partOfSpeech}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {rule.rule}
                  </td>
                  <td className="py-3 px-4 font-japanese text-slate-800">
                    {rule.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Sắc Thái Ngữ Cảnh & Bản Chất Sử Dụng */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-black text-slate-900">
            Sắc Thái Biểu Đạt & Hoàn Cảnh Dùng
          </h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {item.nuance}
        </p>
      </div>

      {/* 4. Kho Câu Ví Dụ Thực Tế Kèm Âm Thanh */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">
              Câu Ví Dụ Thực Tế ({item.examples.length} câu)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Bấm loa để nghe giọng đọc bản xứ</span>
        </div>

        <div className="flex flex-col gap-3">
          {item.examples.map((ex, idx) => (
            <div
              key={ex.id || idx}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="text-base font-bold font-japanese text-slate-900 leading-relaxed">
                  {ex.japanese}
                </div>
                {ex.reading && (
                  <div className="text-xs text-slate-400 font-japanese">
                    {ex.reading}
                  </div>
                )}
                <div className="text-xs text-slate-600 font-medium">
                  {ex.vietnamese}
                </div>
              </div>

              <button
                onClick={() => speakText(ex.japanese)}
                className="p-2.5 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl shadow-xs border border-slate-200 transition-all shrink-0 cursor-pointer"
                title="Nghe phát âm ví dụ"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Cảnh Báo Bẫy Thi JLPT & Phân Biệt Ngữ Pháp */}
      {(item.cautionNotes || item.confusingPairs) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {item.cautionNotes && item.cautionNotes.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Điểm Lưu Ý & Bẫy Thi JLPT</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-900 leading-relaxed">
                {item.cautionNotes.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.confusingPairs && item.confusingPairs.length > 0 && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-purple-800 font-black text-sm">
                <GitCompare className="w-4 h-4 text-purple-600" />
                <span>Phân Biệt Cấu Trúc Dễ Nhầm Lẫn</span>
              </div>
              <div className="space-y-2 text-xs text-purple-900 leading-relaxed">
                {item.confusingPairs.map((cp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-bold text-purple-950 font-japanese">
                      So với: {cp.similarGrammar} ({cp.similarMeaning})
                    </div>
                    <p className="text-purple-800 text-[11px] italic">
                      {cp.difference}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Bài Tập Trắc Nghiệm Củng Cố Tức Thì (Quick Practice Quiz) */}
      {item.quickQuiz && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">
                Thử Thách Nhanh: Kiểm Tra Mức Độ Hiểu Bài
              </h3>
            </div>

            {isQuizSubmitted && (
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-bold font-japanese text-slate-900">
              {item.quickQuiz.question}
            </h4>
            <p className="text-xs text-slate-500 italic">
              Dịch: {item.quickQuiz.questionVi}
            </p>
          </div>

          {/* Các lựa chọn trắc nghiệm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shuffledQuizOptions.map((opt, oIdx) => {
              const isSelected = selectedQuizAnswer === oIdx;
              const isCorrect = opt.isCorrect;

              let style = 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30';
              let badge = 'bg-slate-100 text-slate-600';

              if (isQuizSubmitted) {
                if (isCorrect) {
                  style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  badge = 'bg-emerald-600 text-white';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-50 border-rose-400 text-rose-800';
                  badge = 'bg-rose-500 text-white';
                }
              }

              return (
                <button
                  key={oIdx}
                  disabled={isQuizSubmitted}
                  onClick={() => handleSelectQuizOption(oIdx)}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${style}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badge}`}>
                    {oIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{opt.text}</div>
                    {opt.textVi && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {opt.textVi}
                      </div>
                    )}
                  </div>
                  {isQuizSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isQuizSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Giải thích đáp án */}
          {isQuizSubmitted && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 animate-in fade-in duration-150">
              <div className="font-bold text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {selectedQuizAnswer !== null && shuffledQuizOptions[selectedQuizAnswer]?.isCorrect
                    ? 'Chính xác! 🎉'
                    : 'Chưa đúng, hãy đọc giải thích bên dưới: 💡'}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {item.quickQuiz.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 7. Lối tắt chuyển sang bài Đọc hiểu */}
      {onNavigateToReading && (
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-blue-950">
              Muốn thấy mẫu ngữ pháp này xuất hiện trong đề thi thực tế?
            </h4>
            <p className="text-xs text-blue-800">
              Luyện đọc với các bài báo và đề thi Dokkai chuẩn JLPT có hỗ trợ tra cứu ngữ pháp 1-chạm.
            </p>
          </div>
          <button
            onClick={onNavigateToReading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <span>Sang Luyện Đọc Hiểu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
