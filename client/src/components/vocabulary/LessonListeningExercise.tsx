'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  Keyboard,
  ListOrdered,
  Lightbulb,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { FlashcardWordItem } from './LessonFlashcard';
import { SentenceItem, segmentSentence } from './listening/sentence-chunker';
import { SentenceScrambleView } from './listening/SentenceScrambleView';
import { DictationTypingView } from './listening/DictationTypingView';

interface LessonListeningExerciseProps {
  words: FlashcardWordItem[];
  lessonTitle: string;
  onBack: () => void;
}

export const LessonListeningExercise: React.FC<LessonListeningExerciseProps> = ({
  words,
  lessonTitle,
  onBack
}) => {
  const [mode, setMode] = useState<'arrange' | 'typing'>('arrange');
  const [speed, setSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Chế độ Sắp xếp
  const [availableChips, setAvailableChips] = useState<{ id: string; text: string }[]>([]);
  const [selectedChips, setSelectedChips] = useState<{ id: string; text: string }[]>([]);

  // Chế độ Gõ lại
  const [typedInput, setTypedInput] = useState('');

  // Trạng thái kiểm tra & Gợi ý
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  // Sinh danh sách câu từ ví dụ bài học trong CSDL
  const sentenceList: SentenceItem[] = React.useMemo(() => {
    const list: SentenceItem[] = [];
    words.forEach((w) => {
      if (w.exampleJp && w.exampleVi) {
        const chunks = segmentSentence(w.exampleJp, w.word);
        list.push({
          id: w.id,
          originalSentence: w.exampleJp.replace(/[。]/g, '').trim(),
          vietnamese: w.exampleVi,
          chunks
        });
      }
    });
    return list.length > 0
      ? list
      : [
          {
            id: 'fallback-1',
            originalSentence: 'あの人は先生です',
            vietnamese: 'Người kia là giáo viên.',
            chunks: ['あの人は', '先生です']
          }
        ];
  }, [words]);

  const currentItem = sentenceList[currentIndex] || sentenceList[0];

  // Khởi tạo câu hỏi mới
  const initQuestion = useCallback(() => {
    if (!currentItem) return;
    const chips = currentItem.chunks.map((text, idx) => ({
      id: `${currentItem.id}-${idx}-${text}`,
      text
    }));
    const shuffled = [...chips].sort(() => Math.random() - 0.5);
    setAvailableChips(shuffled);
    setSelectedChips([]);
    setTypedInput('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    setGaveUp(false);
  }, [currentItem]);

  useEffect(() => {
    initQuestion();
  }, [currentIndex, initQuestion]);

  // Phát âm thanh giọng chuẩn Nhật Bản
  const playAudio = useCallback(
    (rate = speed) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!currentItem) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentItem.originalSentence);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    },
    [currentItem, speed]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      playAudio(speed);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentIndex, playAudio, speed]);

  const handleSelectChip = (chip: { id: string; text: string }) => {
    if (isAnswerChecked) return;
    setAvailableChips((prev) => prev.filter((c) => c.id !== chip.id));
    setSelectedChips((prev) => [...prev, chip]);
  };

  const handleRemoveChip = (chip: { id: string; text: string }) => {
    if (isAnswerChecked) return;
    setSelectedChips((prev) => prev.filter((c) => c.id !== chip.id));
    setAvailableChips((prev) => [...prev, chip]);
  };

  const handleCheckArrange = useCallback(() => {
    if (selectedChips.length === 0 || !currentItem) return;
    const cleanUser = selectedChips
      .map((c) => c.text)
      .join('')
      .replace(/[。、\s\.,\?!？！~〜\u3000]/g, '')
      .trim();
    const cleanTarget = currentItem.originalSentence
      .replace(/[。、\s\.,\?!？！~〜\u3000]/g, '')
      .trim();
    const cleanChunks = currentItem.chunks
      .join('')
      .replace(/[。、\s\.,\?!？！~〜\u3000]/g, '')
      .trim();
    const isChipsInOrder =
      selectedChips.length === currentItem.chunks.length &&
      selectedChips.every((chip, idx) => chip.text === currentItem.chunks[idx]);

    const correct = isChipsInOrder || cleanUser === cleanTarget || cleanUser === cleanChunks;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
  }, [selectedChips, currentItem]);

  const handleCheckTyping = () => {
    if (!typedInput.trim() || !currentItem) return;
    const cleanUser = typedInput.replace(/[。、\s\.,\?!？！~〜\u3000]/g, '').trim();
    const cleanTarget = currentItem.originalSentence.replace(/[。、\s\.,\?!？！~〜\u3000]/g, '').trim();
    const cleanChunks = currentItem.chunks.join('').replace(/[。、\s\.,\?!？！~〜\u3000]/g, '').trim();
    const correct = cleanUser === cleanTarget || cleanUser === cleanChunks;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
  };

  const handleGiveHint = () => {
    if (isAnswerChecked) return;
    setShowHint(true);
    const nextExpected = currentItem.chunks[selectedChips.length];
    if (nextExpected) {
      const match = availableChips.find((c) => c.text === nextExpected);
      if (match) {
        handleSelectChip(match);
      }
    }
  };

  const handleGiveUp = () => {
    if (isAnswerChecked) return;
    setGaveUp(true);
    setIsCorrect(false);
    setIsAnswerChecked(true);
    const correctOrderedChips = currentItem.chunks.map((text, idx) => ({
      id: `ans-${idx}-${text}`,
      text
    }));
    setSelectedChips(correctOrderedChips);
    setAvailableChips([]);
    playAudio();
  };

  const handleResetCurrent = () => {
    initQuestion();
    playAudio();
  };

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < sentenceList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onBack();
    }
  }, [currentIndex, sentenceList.length, onBack]);

  useEffect(() => {
    if (
      mode === 'arrange' &&
      !isAnswerChecked &&
      !gaveUp &&
      selectedChips.length === currentItem.chunks.length &&
      selectedChips.length > 0
    ) {
      handleCheckArrange();
    }
  }, [selectedChips, currentItem.chunks.length, mode, isAnswerChecked, gaveUp, handleCheckArrange]);

  // Phím tắt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10) - 1;
        if (availableChips[num] && !isAnswerChecked) {
          e.preventDefault();
          handleSelectChip(availableChips[num]);
        }
      } else if (e.key === 'Backspace') {
        if (selectedChips.length > 0 && !isAnswerChecked) {
          e.preventDefault();
          const last = selectedChips[selectedChips.length - 1];
          handleRemoveChip(last);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        playAudio();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (isAnswerChecked) {
          handleNext();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableChips, selectedChips, isAnswerChecked, playAudio, handleNext, handlePrev]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header & Thanh Điều Hướng Nhanh */}
      <div className="flex items-center justify-between px-2 py-1 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-sm sm:text-base">
            <Volume2 className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Nghe & Sắp xếp câu</span>
            <span className="text-xs font-normal text-slate-400 hidden md:inline max-w-[200px] truncate">
              ({lessonTitle})
            </span>
          </div>
        </div>

        {/* Cụm điều hướng câu & Chế độ */}
        <div className="flex items-center gap-2">
          {/* Nút Trước / Câu số / Tiếp */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Câu trước (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-indigo-500">
              {currentIndex + 1} / {sentenceList.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
              title="Câu tiếp theo (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setMode('arrange')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'arrange' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Sắp xếp</span>
            </button>
            <button
              onClick={() => setMode('typing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'typing' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Gõ lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Khung phát âm thanh */}
      <div className="bg-white/50 text-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3 w-full">
          <div className="p-3 bg-slate-50 text-slate-500 border border-slate-200 rounded-2xl border border-slate-200/50 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>

          <div
            onClick={() => playAudio()}
            className="flex-1 h-12 bg-white rounded-2xl px-4 flex items-center justify-between border border-slate-200 cursor-pointer hover:border-indigo-400 shadow-sm transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-500">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <div className="flex items-center gap-1">
                {[4, 8, 12, 16, 20, 14, 18, 22, 15, 10, 6, 14, 18, 12, 8].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: isPlaying ? `${h}px` : '6px' }}
                    className="w-1 bg-indigo-500/70 rounded-full transition-all duration-200"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700/80 hover:bg-indigo-100 text-slate-800 transition-colors cursor-pointer"
                title="Phát lại âm thanh (Phím R)"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700/80 hover:bg-indigo-100 text-slate-800 transition-colors cursor-pointer"
                title="Lặp lại"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bộ chọn Tốc độ & Gợi ý */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => playAudio(0.7)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Bí quá thì nghe</span>
            </button>
            <button
              onClick={handleGiveHint}
              disabled={isAnswerChecked}
              className="px-3 py-1.5 bg-slate-100 text-slate-800/90 hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-amber-600 hover:bg-slate-50 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Gợi ý</span>
            </button>
            <button
              onClick={handleResetCurrent}
              className="px-3 py-1.5 bg-slate-100 text-slate-800/90 hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Làm lại</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-semibold mr-1">Tốc độ</span>
            {[0.5, 0.8, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  playAudio(s);
                }}
                className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                  speed === s
                    ? 'bg-indigo-600 text-white shadow-xs scale-105'
                    : 'text-slate-600/80 hover:text-slate-800 hover:bg-indigo-50 border border-indigo-200 text-indigo-700/40'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Vùng tương tác chính (Kèm 2 nút điều hướng nổi bên hông cho Desktop) */}
      <div className="relative w-full">
        {/* Nút Điều Hướng Trái Nổi Bên Hông (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          disabled={currentIndex === 0}
          className="hidden lg:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-full items-center justify-center shadow-lg transition-all cursor-pointer z-20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Câu trước (Mũi tên trái ←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Nút Điều Hướng Phải Nổi Bên Hông (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="hidden lg:flex absolute -right-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-full items-center justify-center shadow-lg transition-all cursor-pointer z-20 active:scale-95"
          title="Câu tiếp theo (Mũi tên phải →)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="bg-transparent text-slate-900 p-2 sm:p-4 flex flex-col items-center justify-between min-h-[360px]">
          {mode === 'arrange' ? (
            <SentenceScrambleView
              currentItem={currentItem}
              availableChips={availableChips}
              selectedChips={selectedChips}
              isAnswerChecked={isAnswerChecked}
              isCorrect={isCorrect}
              showHint={showHint}
              gaveUp={gaveUp}
              onSelectChip={handleSelectChip}
              onRemoveChip={handleRemoveChip}
              onReset={handleResetCurrent}
              onNext={handleNext}
              onPrev={handlePrev}
              canPrev={currentIndex > 0}
            />
          ) : (
            <DictationTypingView
              currentItem={currentItem}
              typedInput={typedInput}
              onChangeInput={setTypedInput}
              onSubmit={handleCheckTyping}
              isAnswerChecked={isAnswerChecked}
              isCorrect={isCorrect}
              onReset={handleResetCurrent}
              onNext={handleNext}
              onPrev={handlePrev}
              canPrev={currentIndex > 0}
            />
          )}

          {/* 4. Footer Điều Hướng Đầy Đủ */}
          <div className="flex items-center justify-between w-full pt-6 border-t border-slate-200 text-[11px] text-slate-500 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800/80 hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200/60 text-xs"
                title="Câu trước (←)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Câu trước</span>
              </button>

              <span className="font-mono font-bold text-slate-600 text-xs px-1">
                {currentIndex + 1} / {sentenceList.length}
              </span>

              <button
                onClick={handleNext}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800/80 hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-indigo-500 font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200/60 text-xs"
                title="Câu tiếp theo (→)"
              >
                <span>{currentIndex === sentenceList.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-center flex-wrap justify-center hidden sm:flex">
              <span>Phím</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
                1–9
              </kbd>
              <span>chọn,</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
                ⌫
              </kbd>
              <span>xóa,</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
                R
              </kbd>
              <span>nghe,</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
                Space
              </kbd>
              <span>tiếp,</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
                ←/→
              </kbd>
              <span>chuyển câu</span>
            </div>

            <button
              onClick={handleGiveUp}
              disabled={isAnswerChecked}
              className="flex items-center gap-1.5 text-indigo-500 hover:text-amber-300 font-bold transition-colors cursor-pointer disabled:opacity-40"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Câu này bó tay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
