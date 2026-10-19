'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NotebookItem } from './notebook.types';
import { NotebookApi } from './notebook.api';
import {
  ArrowLeft,
  Check,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  PartyPopper,
  Volume2,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getStudyPreferences, speakJapanese, playFeedbackSound } from '@/utils/studyPreferences';

interface SrsFlashcardViewProps {
  onBack: () => void;
  itemType?: string;
  level?: string;
}

export const SrsFlashcardView: React.FC<SrsFlashcardViewProps> = ({ onBack, itemType, level }) => {
  const [dueCards, setDueCards] = useState<NotebookItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Review mode preference (Flashcard vs Quiz)
  const [reviewMode, setReviewMode] = useState<'flashcard' | 'quiz'>(() => {
    return getStudyPreferences().reviewMode;
  });

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      const cards = await NotebookApi.getDueCards(1000, itemType, level);
      setDueCards(cards);
      setIsLoading(false);
    };
    fetchCards();
  }, [itemType, level]);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakJapanese(text);
  };

  const handleReview = async (quality: number) => {
    if (currentIndex >= dueCards.length) return;
    const currentCard = dueCards[currentIndex];

    // Phát âm thanh phản hồi kết quả
    if (quality >= 4) {
      playFeedbackSound(true);
    } else {
      playFeedbackSound(false);
    }

    setIsFlipped(false);
    setSelectedQuizAnswer(null);
    setIsAnswerRevealed(false);

    if (currentIndex + 1 >= dueCards.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }

    await NotebookApi.submitReview(currentCard.id, quality);
  };

  const generateMnemonic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex >= dueCards.length) return;
    const currentCard = dueCards[currentIndex];

    setGeneratingAi(true);
    const updated = await NotebookApi.generateMnemonic(currentCard.id);
    if (updated) {
      const newCards = [...dueCards];
      newCards[currentIndex] = updated;
      setDueCards(newCards);
    }
    setGeneratingAi(false);
  };

  const currentCard = dueCards[currentIndex];

  // Tạo 4 phương án trắc nghiệm ngẫu nhiên khi ở chế độ Quiz
  const quizOptions = useMemo(() => {
    if (!currentCard || reviewMode !== 'quiz') return [];
    const correct = currentCard.meaningVi;
    const otherMeanings = dueCards
      .filter((c) => c.id !== currentCard.id && c.meaningVi && c.meaningVi !== correct)
      .map((c) => c.meaningVi);

    // Shuffle other meanings and pick 3
    const shuffled = [...otherMeanings].sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3);

    // Bổ sung nếu chưa đủ 3 đáp án nhiễu
    const fallbackDistractors = [
      'Giao tiếp hàng ngày',
      'Diễn đạt cảm xúc',
      'Trạng từ chỉ mức độ',
      'Động từ chỉ hành động'
    ];
    while (distractors.length < 3) {
      const fb = fallbackDistractors[distractors.length];
      if (!distractors.includes(fb) && fb !== correct) {
        distractors.push(fb);
      } else {
        break;
      }
    }

    const allOptions = [correct, ...distractors];
    return allOptions.sort(() => 0.5 - Math.random());
  }, [currentCard, dueCards, reviewMode]);

  const handleSelectQuizOption = (option: string) => {
    if (isAnswerRevealed || !currentCard) return;

    setSelectedQuizAnswer(option);
    setIsAnswerRevealed(true);

    const isCorrect = option === currentCard.meaningVi;
    if (isCorrect) {
      playFeedbackSound(true);
      setTimeout(() => {
        handleReview(5); // Good
      }, 700);
    } else {
      playFeedbackSound(false);
      setTimeout(() => {
        handleReview(1); // Again
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isFinished || dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <PartyPopper className="w-16 h-16 text-emerald-500 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Hoàn thành xuất sắc!</h2>
        <p className="text-slate-600">Bạn đã ôn tập hết các thẻ của mục này hôm nay.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          Quay lại Sổ tay
        </button>
      </div>
    );
  }

  const showWarning = dueCards.length > 200 && currentIndex === 0;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      {/* Header Điều khiển & Bộ chuyển chế độ */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>

        {/* Chuyển đổi linh hoạt giữa Thẻ Flashcard và Trắc nghiệm */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setReviewMode('flashcard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reviewMode === 'flashcard'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thẻ lật</span>
          </button>
          <button
            type="button"
            onClick={() => setReviewMode('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reviewMode === 'quiz'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trắc nghiệm</span>
          </button>
        </div>

        <div className="text-slate-500 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          {currentIndex + 1} / {dueCards.length}
        </div>
      </div>

      {showWarning && (
        <div className="w-full mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-2xl flex items-start gap-3">
          <RotateCcw className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="text-xs">
            <h4 className="font-bold">Khuyến cáo ôn tập</h4>
            <p className="mt-0.5">
              Bạn đang có hơn 200 thẻ cần ôn tập. Để tránh quá tải, bạn có thể chia nhỏ ra học làm nhiều phiên.
            </p>
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ 1: THẺ FLASHCARD 3D */}
      {reviewMode === 'flashcard' ? (
        <>
          <div
            className="relative w-full aspect-[4/3] max-h-[420px] min-h-[340px] perspective-1000 cursor-pointer group"
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            <div
              className={`w-full h-full transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* MẶT TRƯỚC */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-slate-200">
                <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wider border border-indigo-100">
                  {currentCard.itemType}
                </span>
                <span className="absolute top-4 right-4 text-xs font-bold text-slate-400">
                  {currentCard.level}
                </span>

                <button
                  onClick={(e) => handleSpeak(e, currentCard.title)}
                  className="absolute top-1/4 p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
                  title="Phát âm tiếng Nhật"
                >
                  <Volume2 className="w-6 h-6" />
                </button>

                <h2 className="text-4xl sm:text-5xl font-black font-japanese text-slate-800 text-center mb-4 leading-tight mt-12">
                  {currentCard.title}
                </h2>

                {!isFlipped && (
                  <p className="absolute bottom-6 text-slate-400 text-xs font-semibold animate-pulse">
                    Chạm để lật mặt sau
                  </p>
                )}
              </div>

              {/* MẶT SAU */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl flex flex-col items-center justify-start p-8 border border-slate-200 rotate-y-180 overflow-y-auto">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">{currentCard.level}</span>
                  <button
                    onClick={(e) => handleSpeak(e, currentCard.reading || currentCard.title)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
                    title="Phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {currentCard.reading && (
                  <p className="text-xl text-indigo-600 font-bold mb-2 font-japanese">{currentCard.reading}</p>
                )}

                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 text-center mb-4">
                  {currentCard.meaningVi}
                </h2>

                {currentCard.exampleJp && (
                  <div className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center border border-slate-100">
                    <p className="text-slate-800 font-semibold mb-1 font-japanese">{currentCard.exampleJp}</p>
                    {currentCard.exampleVi && <p className="text-slate-500 text-xs">{currentCard.exampleVi}</p>}
                  </div>
                )}

                {/* AI Mnemonic */}
                {currentCard.note ? (
                  <div className="w-full p-3 bg-purple-50 text-purple-800 rounded-2xl text-xs flex items-start gap-2 border border-purple-100 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <p>{currentCard.note}</p>
                  </div>
                ) : (
                  <button
                    onClick={generateMnemonic}
                    disabled={generatingAi}
                    className="mt-auto flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{generatingAi ? 'AI đang tạo mẹo nhớ...' : 'Tạo mẹo nhớ bằng AI'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ĐÁNH GIÁ CHẤT LƯỢNG GHI NHỚ (SRS Rating Buttons) */}
          {isFlipped && (
            <div className="w-full grid grid-cols-4 gap-3 mt-6 animate-fadeIn">
              <button
                onClick={() => handleReview(1)}
                className="flex flex-col items-center justify-center p-3 bg-rose-50 text-rose-700 rounded-2xl hover:bg-rose-100 border border-rose-200 transition font-bold text-xs cursor-pointer active:scale-95"
              >
                <ThumbsDown className="w-5 h-5 mb-1" />
                <span>Quên</span>
                <span className="text-[10px] text-rose-500 font-normal">Ôn lại ngay</span>
              </button>

              <button
                onClick={() => handleReview(3)}
                className="flex flex-col items-center justify-center p-3 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-100 border border-amber-200 transition font-bold text-xs cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-5 h-5 mb-1" />
                <span>Khó</span>
                <span className="text-[10px] text-amber-500 font-normal">Ôn sớm</span>
              </button>

              <button
                onClick={() => handleReview(4)}
                className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 border border-blue-200 transition font-bold text-xs cursor-pointer active:scale-95"
              >
                <Check className="w-5 h-5 mb-1" />
                <span>Nhớ</span>
                <span className="text-[10px] text-blue-500 font-normal">Đúng hạn</span>
              </button>

              <button
                onClick={() => handleReview(5)}
                className="flex flex-col items-center justify-center p-3 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 border border-emerald-200 transition font-bold text-xs cursor-pointer active:scale-95"
              >
                <ThumbsUp className="w-5 h-5 mb-1" />
                <span>Thuộc</span>
                <span className="text-[10px] text-emerald-500 font-normal">Kéo dài hạn</span>
              </button>
            </div>
          )}
        </>
      ) : (
        /* CHẾ ĐỘ 2: TRẮC NGHIỆM PHẢN XẠ 4 ĐÁP ÁN */
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="text-center space-y-3 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full uppercase border border-amber-100">
                {currentCard.itemType}
              </span>
              <button
                onClick={(e) => handleSpeak(e, currentCard.title)}
                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition cursor-pointer"
                title="Phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black font-japanese text-slate-900">
              {currentCard.title}
            </h2>

            {currentCard.reading && (
              <p className="text-lg font-bold text-indigo-600 font-japanese">{currentCard.reading}</p>
            )}

            <p className="text-xs text-slate-400 font-medium">Chọn ý nghĩa đúng của từ trên:</p>
          </div>

          {/* Danh sách 4 đáp án */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizOptions.map((opt, idx) => {
              const isSelected = selectedQuizAnswer === opt;
              const isCorrect = opt === currentCard.meaningVi;
              let btnClass = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

              if (isAnswerRevealed) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  btnClass = 'bg-rose-50 border-rose-500 text-rose-800 font-bold';
                } else {
                  btnClass = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerRevealed}
                  onClick={() => handleSelectQuizOption(opt)}
                  className={`p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all cursor-pointer flex items-center justify-between gap-3 ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswerRevealed && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerRevealed && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
