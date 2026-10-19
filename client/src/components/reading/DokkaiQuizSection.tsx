'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Loader2,
  Languages,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { ReadingQuiz } from './reading.types';
import { ReadingApi } from './reading.api';
import { authApi } from '@/context/AuthContext';

interface DokkaiQuizSectionProps {
  quizzes: ReadingQuiz[];
  sourceType?: string;
  articleId: string;
  onAddQuizzesSuccess: (newQuizzes: ReadingQuiz[]) => void;
}

interface ShuffledQuizData {
  options: string[];
  optionsVi?: string[];
  correctIndex: number;
}

// Hàm xáo trộn ngẫu nhiên 4 lựa chọn để đáp án đúng không bị cố định ở một vị trí
function shuffleQuizOptions(quiz: ReadingQuiz): ShuffledQuizData {
  const items = (quiz.options || []).map((opt, idx) => ({
    text: opt,
    textVi: quiz.optionsVi?.[idx],
    isCorrect: idx === quiz.correctIndex
  }));

  // Thuật toán xáo trộn Fisher-Yates
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  const newCorrectIndex = items.findIndex((it) => it.isCorrect);

  return {
    options: items.map((it) => it.text),
    optionsVi: items.some((it) => it.textVi) ? items.map((it) => it.textVi || '') : undefined,
    correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0
  };
}

export const DokkaiQuizSection: React.FC<DokkaiQuizSectionProps> = ({
  quizzes,
  articleId,
  sourceType,
  onAddQuizzesSuccess
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [quizId: string]: number }>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<{ [quizId: string]: boolean }>({});
  const [showQuizTranslation, setShowQuizTranslation] = useState<{ [quizId: string]: boolean }>({});
  const [showExplanation, setShowExplanation] = useState<{ [quizId: string]: boolean }>({});
  const [aiExplanations, setAiExplanations] = useState<{ [quizId: string]: string }>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const handleRequestAiExplain = async (quiz: ReadingQuiz, displayData: ShuffledQuizData, selectedOpt: number | undefined) => {
    setLoadingAiId(quiz.id);
    try {
      const message = `H�y gi?i th�ch chi ti?t c�u h?i d?c hi?u ti?ng Nh?t sau d�y:
Đề bài: ${quiz.question}
Các lựa chọn:
${displayData.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

��p �n d�ng c?a h? th?ng l� l?a ch?n s? ${displayData.correctIndex + 1}.
Học viên đã chọn: ${selectedOpt !== undefined ? 's? ' + (selectedOpt + 1) : 'Không chọn'}.

Sensei h�y gi?i th�ch ng?n g?n, s�c t�ch (kho?ng 3-4 c�u) t?i sao d�p �n d� l?i d�ng d?a v�o n?i dung b�i d?c, v� ph�n t�ch l?i sai n?u h?c vi�n ch?n sai.`;
      
      // Use authApi or fetch with auth headers
      const token = localStorage.getItem('access_token');
      const res = await authApi.post('/reading/quiz-explain', { quizId: quiz.id, message });
      const data = res.data;
      if (data.success && data.data?.text) {
        setAiExplanations(p => ({ ...p, [quiz.id]: data.data.text }));
      } else {
        alert('L?i khi g?i AI');
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối AI');
    } finally {
      setLoadingAiId(null);
    }
  };
  const [isAddingQuizzes, setIsAddingQuizzes] = useState<boolean>(false);
  const [shuffledMap, setShuffledMap] = useState<{ [quizId: string]: ShuffledQuizData }>({});

  // Tự động xáo trộn các lựa chọn cho mỗi câu hỏi khi nạp dữ liệu
  React.useEffect(() => {
    if (!quizzes) return;
    setShuffledMap((prev) => {
      const next = { ...prev };
      for (const q of quizzes) {
        if (!next[q.id]) {
          next[q.id] = shuffleQuizOptions(q);
        }
      }
      return next;
    });
  }, [quizzes]);

  // Nút Làm lại: Xóa lựa chọn và XÁO TRỘN LẠI VỊ TRÍ ĐÁP ÁN để các câu hỏi hoàn toàn lộn xộn
  const handleResetQuizzes = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setShowExplanation({});
    if (quizzes) {
      const reshuffled: { [quizId: string]: ShuffledQuizData } = {};
      for (const q of quizzes) {
        reshuffled[q.id] = shuffleQuizOptions(q);
      }
      setShuffledMap(reshuffled);
    }
  };

  // Nút Thêm câu hỏi: CSDL trước -> AI sau (kèm negative prompt cấm trùng)
  const handleGenerateMore = async () => {
    setIsAddingQuizzes(true);
    try {
      const currentIds = (quizzes || []).map((q) => q.id);
      const newQ = await ReadingApi.addMoreQuizzes(articleId, 3, currentIds);
      if (newQ && newQ.length > 0) {
        onAddQuizzesSuccess(newQ);
      }
    } catch (e) {
      console.error('Error generating more quizzes:', e);
    } finally {
      setIsAddingQuizzes(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 lg:p-8 flex flex-col gap-6">
      {/* Header thanh điều khiển bài trắc nghiệm */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-black text-slate-900">
            Câu Hỏi Đọc Hiểu JLPT Dokkai ({quizzes?.length ?? 0} câu)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Làm lại */}
          <button
            onClick={handleResetQuizzes}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
            title="Xóa lựa chọn và làm lại toàn bộ câu hỏi"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Làm lại</span>
          </button>

          {/* Nút Sinh thêm câu hỏi (Ưu tiên CSDL -> AI sau) */}
            <button
            onClick={handleGenerateMore}
            disabled={isAddingQuizzes}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-blue-200"
            title="Thêm câu hỏi mới (lấy từ kho CSDL có sẵn trước, nếu hết mới dùng AI soạn mới)"
          >
            {isAddingQuizzes ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang soạn...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Sinh thêm câu hỏi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danh sách từng câu hỏi */}
      <div className="flex flex-col gap-8">
        {quizzes?.map((quiz, qIdx) => {
          const displayData = shuffledMap[quiz.id] || {
            options: quiz.options,
            optionsVi: quiz.optionsVi,
            correctIndex: quiz.correctIndex
          };
          const isSubmitted = submittedAnswers[quiz.id];
          const selectedOpt = selectedAnswers[quiz.id];
          const isCorrect = isSubmitted && selectedOpt === displayData.correctIndex;
          const isTransOpen = showQuizTranslation[quiz.id];
          const isExplanationOpen = showExplanation[quiz.id];
          const isAnswerRevealed = isSubmitted || isExplanationOpen;

          return (
            <div
              key={quiz.id || qIdx}
              className="flex flex-col gap-3 pb-6 border-b border-slate-100 last:border-none last:pb-0"
            >
              {/* Header câu hỏi: Số thứ tự + 2 nút riêng biệt: [Dịch câu hỏi] & [Xem đáp án] */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    {qIdx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút 1: Tách riêng nút Dịch câu hỏi & đáp án */}
                  <button
                    onClick={() =>
                      setShowQuizTranslation((prev) => ({
                        ...prev,
                        [quiz.id]: !prev[quiz.id]
                      }))
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      isTransOpen
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Bật/Tắt bản dịch tiếng Việt cho đề bài và 4 lựa chọn"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>{isTransOpen ? 'Ẩn bản dịch' : 'Dịch câu hỏi'}</span>
                  </button>

                  {/* Nút 2: Tách riêng nút Xem đáp án & giải thích */}
                  <button
                    onClick={() =>
                      setShowExplanation((prev) => ({
                        ...prev,
                        [quiz.id]: !prev[quiz.id]
                      }))
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      isExplanationOpen
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                    title="Xem đáp án chính xác và giải thích của Sensei"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isExplanationOpen ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
                  </button>
                </div>
              </div>

              {/* Đề bài tiếng Nhật */}
              <p className="font-bold text-sm text-slate-900 leading-relaxed font-japanese">
                {quiz.question}
              </p>

              {/* Bản dịch tiếng Việt của câu hỏi nếu được bật */}
              {isTransOpen && (
                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 font-medium leading-relaxed">
                  <span className="font-bold text-blue-700 mr-1">VN Bản dịch đề bài:</span>
                  {quiz.questionVi || 'Đang cập nhật bản dịch tiếng Việt...'}
                </div>
              )}

              {/* 4 Lựa chọn trắc nghiệm đã được xáo trộn ngẫu nhiên */}
              <div className="flex flex-col gap-2 mt-1">
                {displayData.options?.map((opt, oIdx) => {
                  const isThisSelected = selectedOpt === oIdx;
                  let optionStyle =
                    'border-slate-200 hover:border-slate-300 bg-white text-slate-700';

                  if (isAnswerRevealed) {
                    if (oIdx === displayData.correctIndex) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-400';
                    } else if (isSubmitted && isThisSelected) {
                      optionStyle = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
                    } else {
                      optionStyle = 'border-slate-100 bg-slate-50 text-slate-400';
                    }
                  } else if (isThisSelected) {
                    optionStyle =
                      'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-400';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => {
                        if (!isSubmitted)
                          setSelectedAnswers((p) => ({ ...p, [quiz.id]: oIdx }));
                      }}
                      disabled={isSubmitted}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition cursor-pointer flex flex-col gap-1 ${optionStyle}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-japanese leading-relaxed">
                          {oIdx + 1}. {opt}
                        </span>
                        {isAnswerRevealed && oIdx === displayData.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                        {isSubmitted && isThisSelected && oIdx !== displayData.correctIndex && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                        )}
                      </div>

                      {/* Bản dịch tiếng Việt cho từng đáp án nếu bật */}
                      {isTransOpen && displayData.optionsVi && displayData.optionsVi[oIdx] && (
                        <span className="text-[11px] text-blue-950 font-sans font-normal opacity-90 pt-1 border-t border-slate-100">
                          👉 {oIdx + 1}. {displayData.optionsVi[oIdx]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Nút Kiểm tra đáp án khi người dùng chưa submit */}
              {!isSubmitted && !isExplanationOpen && (
                <div className="flex justify-end mt-1">
                  <button
                    onClick={() => {
                      if (selectedOpt !== undefined) {
                        setSubmittedAnswers((p) => ({ ...p, [quiz.id]: true }));
                        setShowExplanation((p) => ({ ...p, [quiz.id]: true }));
                      }
                    }}
                    disabled={selectedOpt === undefined}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedOpt !== undefined
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Kiểm tra đáp án
                  </button>
                </div>
              )}

              {/* Hộp hiển thị Lời giải chi tiết từ Sensei */}
              {isAnswerRevealed && (
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed mt-2 ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/80 border border-amber-200 text-amber-950'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1.5">
                    {isSubmitted ? (
                      isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-800">Chính xác! (+10 điểm Dokkai)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span className="text-rose-800">
                            Chưa chính xác. Đáp án đúng là số {displayData.correctIndex + 1}!
                          </span>
                        </>
                      )
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-900 font-bold">
                          Đáp án đúng: Lựa chọn số {displayData.correctIndex + 1}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 mt-1 font-sans leading-relaxed">
                    <strong>Giải thích từ Sensei:</strong>{' '}
                    {quiz.explanation || 'Đáp án được đối chiếu trực tiếp từ bài đọc.'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
