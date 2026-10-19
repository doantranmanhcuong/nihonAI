'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Volume2,
  Settings,
  Heart,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  BookOpen,
  Target,
  Radio,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FlashcardWordItem } from './LessonFlashcard';
import { NHKPitchAccentLine } from './NHKPitchAccentLine';

interface LessonPracticeHubProps {
  lessonTitle: string;
  words: FlashcardWordItem[];
  onBack: () => void;
  onNavigateToFlashcard?: () => void;
  onNavigateToListening?: () => void;
  onNavigateToKanji?: (character: string) => void;
}

// 3 Phân loại câu hỏi trong Trắc nghiệm
type QuizTargetType = 'reading' | 'kanji' | 'meaning';

// 2 Chế độ bài tập thực tế: Trắc nghiệm (Quiz) và Dịch câu (Cloze)
type PracticeMode = 'quiz' | 'cloze';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export const LessonPracticeHub: React.FC<LessonPracticeHubProps> = ({
  lessonTitle,
  words,
  onBack,
  onNavigateToFlashcard,
  onNavigateToListening,
  onNavigateToKanji
}) => {
  // Chế độ luyện tập hiện tại: 'quiz' (Trắc nghiệm) hoặc 'cloze' (Dịch câu điền từ - Khớp Ảnh mới nhất)
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('cloze');

  // Mục tiêu câu hỏi trong Trắc nghiệm: 'reading' (Cách đọc), 'kanji' (Kanji), 'meaning' (Ý nghĩa)
  const [targetType, setTargetType] = useState<QuizTargetType>('meaning');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Trạng thái trả lời & Lựa chọn
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  // Tính năng Trợ giúp: Gợi ý (loại trừ 2 đáp án sai)
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  // Điểm số
  const [score, setScore] = useState(0);

  const currentWord = words[currentIndex] || words[0];

  // Phát âm tiếng Nhật (Bí quá thì nghe)
  const speak = useCallback((text: string, rate = 0.85) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Xây dựng câu hỏi Dịch câu (Cloze test - Khớp 100% Ảnh mới nhất media_1788409174787.png)
    // Hàm làm sạch Cách đọc (bỏ các chữ trong ngoặc vuông để tránh lộ đáp án)
  const cleanReading = (str?: string) => {
    if (!str) return '';
    return str.replace(/\s*\[.*?\]\s*/g, '').trim();
  };

const clozeQuestion = useMemo(() => {
    if (!currentWord) return { question: 'これは____です', translation: '' };

    if (currentWord.exampleJp && currentWord.exampleVi) {
      const cleanJp = currentWord.exampleJp.replace(/[。]/g, '').trim();
      let masked = cleanJp;

      if (masked.includes(currentWord.word)) {
        masked = masked.replace(currentWord.word, '____');
      } else if (masked.includes(currentWord.reading)) {
        masked = masked.replace(currentWord.reading, '____');
      } else {
        masked = `${currentWord.word}は____です`;
      }

      return {
        question: masked,
        translation: currentWord.exampleVi
      };
    }

    return {
      question: `${currentWord.word}は____です`,
      translation: currentWord.meaningVi
    };
  }, [currentWord]);

  // Sinh 4 phương án trắc nghiệm tùy theo practiceMode & targetType
  const options: QuizOption[] = useMemo(() => {
    if (!currentWord || words.length === 0) return [];

    const otherWords = words.filter((w) => w.id !== currentWord.id).sort(() => Math.random() - 0.5);

    if (practiceMode === 'cloze') {
      // Chế độ Dịch câu: 4 Lựa chọn là từ vựng tiếng Nhật (Khớp 100% Ảnh: 1 鉛筆, 2 その, 3 傘, 4 手帳)
      const correct = currentWord.word;
      const distractors = otherWords.slice(0, 3).map((w) => w.word);
      const all = [
        { text: correct, isCorrect: true },
        ...distractors.map((t) => ({ text: t, isCorrect: false }))
      ];
      return all.sort(() => Math.random() - 0.5);
    }

    // Chế độ Trắc nghiệm (Quiz)
    if (targetType === 'meaning') {
      // Hỏi Từ vựng -> 4 Lựa chọn là Nghĩa tiếng Việt
      const correct = currentWord.meaningVi;
      const distractors = otherWords.slice(0, 3).map((w) => w.meaningVi);
      const all = [
        { text: correct, isCorrect: true },
        ...distractors.map((t) => ({ text: t, isCorrect: false }))
      ];
      return all.sort(() => Math.random() - 0.5);
    } else if (targetType === 'kanji') {
      // Hỏi Cách đọc + Nghĩa -> 4 Lựa chọn là Chữ Hán
      const correct = currentWord.word;
      const distractors = otherWords.slice(0, 3).map((w) => w.word);
      const all = [
        { text: correct, isCorrect: true },
        ...distractors.map((t) => ({ text: t, isCorrect: false }))
      ];
      return all.sort(() => Math.random() - 0.5);
    } else {
      // targetType === 'reading': Hỏi Nghĩa -> 4 Lựa chọn là Cách đọc Kana
      const correct = cleanReading(currentWord.reading);
      const distractors = otherWords.slice(0, 3).map((w) => cleanReading(w.reading));
      const all = [
        { text: correct, isCorrect: true },
        ...distractors.map((t) => ({ text: t, isCorrect: false }))
      ];
      return all.sort(() => Math.random() - 0.5);
    }
  }, [currentWord, words, practiceMode, targetType]);

  // Reset mỗi khi đổi câu hoặc đổi chế độ
  const resetQuestionState = useCallback(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setGaveUp(false);
    setEliminatedOptions([]);
  }, []);

  useEffect(() => {
    resetQuestionState();
  }, [currentIndex, practiceMode, targetType, resetQuestionState]);

  useEffect(() => {
    if (practiceMode === 'quiz' && currentWord && currentWord.word === currentWord.reading && targetType === 'kanji') {
      setTargetType('meaning');
    }
  }, [currentWord, practiceMode, targetType]);

  // Xử lý chọn đáp án
  const handleSelect = (optText: string) => {
    if (isAnswered) return;
    setSelectedOption(optText);
    setIsAnswered(true);

    const correct = options.find((o) => o.text === optText)?.isCorrect || false;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }

    if (practiceMode === 'cloze' && currentWord.exampleJp) {
      speak(currentWord.exampleJp);
    } else {
      speak(currentWord.word);
    }
  };

  // Tính năng "Gợi ý" (Hint): Loại bỏ bớt 2 đáp án sai
  const handleHint = () => {
    if (isAnswered) return;
    const wrongOptions = options.filter((o) => !o.isCorrect).map((o) => o.text);
    const toEliminate = wrongOptions.slice(0, 2);
    setEliminatedOptions(toEliminate);
  };

  // Tính năng "Làm lại câu này"
  const handleRetryCurrent = () => {
    resetQuestionState();
  };

  // Tính năng "Câu này bó tay"
  const handleGiveUp = () => {
    if (isAnswered) return;
    const correctOpt = options.find((o) => o.isCorrect);
    if (correctOpt) {
      setSelectedOption(correctOpt.text);
    }
    setGaveUp(true);
    setIsAnswered(true);
    setIsCorrect(false);
    speak(currentWord.word, 0.75);
  };

  // Về câu trước
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Sang câu tiếp theo
  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, words.length]);

  // Lắng nghe phím tắt: 1-4 chọn, Space tiếp tục, R nghe audio, ←/→ chuyển câu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const num = parseInt(e.key, 10) - 1;
        if (options[num] && !isAnswered && !eliminatedOptions.includes(options[num].text)) {
          e.preventDefault();
          handleSelect(options[num].text);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (isAnswered) {
          handleNext();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (practiceMode === 'cloze' && currentWord.exampleJp) {
          speak(currentWord.exampleJp);
        } else {
          speak(currentWord.word);
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
  }, [options, isAnswered, eliminatedOptions, handleNext, handlePrev, currentWord, speak, practiceMode]);

  if (!currentWord) return null;

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 0. Header thanh điều hướng bài học & chuyển câu */}
      <div className="flex items-center justify-between px-2 py-1 gap-2 flex-wrap sm:flex-nowrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="text-center">
          <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1 max-w-[200px] sm:max-w-md">
            {lessonTitle}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold">
            {practiceMode === 'cloze' ? 'Dịch câu điền từ' : 'Trắc nghiệm lựa chọn'}
          </p>
        </div>

        {/* Cụm điều hướng nhanh: Trước / Câu số / Tiếp */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Câu trước (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-mono font-bold text-indigo-600">
            {currentIndex + 1} / {words.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Câu tiếp theo (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. KHUNG BÀI TẬP CHÍNH (Khớp 100% Ảnh media_1788409174787.png) */}
      <div className="relative w-full">
        {/* Nút Điều Hướng Trái Nổi Bên Hông (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          disabled={currentIndex === 0}
          className="hidden lg:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-full items-center justify-center shadow-md transition-all cursor-pointer z-20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
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
          className="hidden lg:flex absolute -right-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-full items-center justify-center shadow-md transition-all cursor-pointer z-20 active:scale-95"
          title="Câu tiếp theo (Mũi tên phải →)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="bg-transparent text-slate-900 px-2 sm:px-4 py-4 flex flex-col justify-between min-h-[460px] relative overflow-visible">
          {/* TOP BAR TRONG THẺ: Bí quá thì nghe (trái) + Cài đặt / Bộ chọn loại câu (phải) */}
          <div className="flex items-center justify-between w-full pb-4">
          {/* Nút "Bí quá thì nghe" (Góc trái trên) */}
          <button
            onClick={() => {
              if (practiceMode === 'cloze' && currentWord.exampleJp) {
                speak(currentWord.exampleJp, 0.75);
              } else {
                speak(currentWord.word, 0.75);
              }
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer group"
          >
            <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            <span>Bí quá thì nghe</span>
          </button>

          {/* Phía bên phải top bar: Bộ chọn Cách đọc / Kanji / Ý nghĩa (nếu ở Trắc nghiệm) hoặc Nút Gợi ý / Cài đặt */}
          <div className="flex items-center gap-2">
            {practiceMode === 'quiz' && (
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setTargetType('reading')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    targetType === 'reading'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Cách đọc
                </button>

                {currentWord?.word !== currentWord?.reading && (
                  <button
                    onClick={() => setTargetType('kanji')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetType === 'kanji'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Kanji
                  </button>
                )}

                <button
                  onClick={() => setTargetType('meaning')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    targetType === 'meaning'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Ý nghĩa
                </button>
              </div>
            )}

            <button
              onClick={() => handleHint()}
              disabled={isAnswered}
              className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors disabled:opacity-40"
              title="Gợi ý loại trừ 2 đáp án sai"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* NỘI DUNG CÂU HỎI TRUNG TÂM (Khớp 100% Ảnh media_1788409174787.png) */}
        <div className="flex flex-col items-center justify-center my-auto py-2 text-center">
          {practiceMode === 'cloze' ? (
            /* ================= CHẾ ĐỘ DỊCH CÂU: これは____です (Khớp Ảnh) ================= */
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {clozeQuestion.question}
              </h2>
              <span className="text-sm sm:text-base text-slate-600 font-bold mt-1">
                {clozeQuestion.translation}
              </span>
            </div>
          ) : (
            /* ================= CHẾ ĐỘ TRẮC NGHIỆM ================= */
            <div className="flex flex-col items-center gap-1.5">
              {targetType === 'reading' && (
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {currentWord.meaningVi}
                </h2>
              )}

              {targetType === 'kanji' && (
                <>
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {cleanReading(currentWord.reading)}
                  </h2>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                    {currentWord.meaningVi}
                  </span>
                </>
              )}

              {targetType === 'meaning' && (
                <>
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {currentWord.word}
                  </h2>
                  <span className="text-xs sm:text-sm text-slate-400 font-bold mt-1">
                    {cleanReading(currentWord.reading)}
                  </span>
                </>
              )}
            </div>
          )}

          {/* HIỂN THỊ TRỌNG ÂM NHK & HÁN TỰ TRỰC TIẾP TRÊN GIAO DIỆN (Theo yêu cầu) */}
          {(isAnswered || gaveUp) && (
            <div className="flex flex-col items-center gap-2 mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                {/* Đồ thị Trọng âm NHK bậc thang */}
                <NHKPitchAccentLine
                  theme="light"
                  pitchStr={currentWord.pitchAccent}
                  reading={currentWord.reading}
                  word={currentWord.word}
                />

                {/* Âm Hán Việt */}
                {currentWord.hanViet && (
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200">
                    {currentWord.hanViet}
                  </span>
                )}
              </div>

              {/* Chữ Hán cấu thành có thể nhấp chuột */}
              {currentWord.constituentKanjis && currentWord.constituentKanjis.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-400 font-bold">Chữ Hán:</span>
                  {currentWord.constituentKanjis.map((k) => (
                    <button
                      key={k.character}
                      onClick={() => onNavigateToKanji && onNavigateToKanji(k.character)}
                      className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-indigo-600 rounded text-xs font-bold transition-colors cursor-pointer"
                      title={`Xem chi tiết nét chữ ${k.character} (${k.hanViet})`}
                    >
                      {k.character} ({k.hanViet})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4 LỰA CHỌN ĐÁP ÁN (Lưới 2x2 - Khớp 100% Ảnh) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full my-4">
          {options.map((opt, idx) => {
            const isPicked = selectedOption === opt.text;
            const isTheCorrectOne = opt.isCorrect;
            const isEliminated = eliminatedOptions.includes(opt.text);

            let btnStyle =
              'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm';

            if (isAnswered) {
              if (isTheCorrectOne) {
                btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-black shadow-lg';
              } else if (isPicked) {
                btnStyle = 'bg-rose-600/80 text-white border-rose-400 font-bold';
              }
            } else if (isEliminated) {
              btnStyle = 'bg-slate-900/40 text-slate-600 border-slate-200 opacity-40 cursor-not-allowed';
            }

            return (
              <button
                key={idx}
                disabled={isAnswered || isEliminated}
                onClick={() => handleSelect(opt.text)}
                className={`p-4 sm:p-5 rounded-2xl border text-left font-bold text-sm sm:text-base transition-all flex items-center gap-3 cursor-pointer shadow-xs ${btnStyle}`}
              >
                {/* Số thứ tự 1, 2, 3, 4 */}
                <span className="text-xs font-mono text-slate-400/80 w-5 shrink-0">
                  {idx + 1}
                </span>

                <span className="flex-1 min-w-0 truncate">{opt.text}</span>

                {isAnswered && isTheCorrectOne && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                )}
                {isAnswered && isPicked && !isTheCorrectOne && (
                  <XCircle className="w-5 h-5 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* FOOTER THANH DƯỚI TRONG THẺ (Khớp 100% Ảnh media_1788409174787.png) */}
        <div className="flex items-center justify-between w-full pt-6 border-t border-slate-700/60 text-xs gap-2 flex-wrap">
          {/* Bộ đếm & Nút Điều Hướng Câu: [← Trước] 1 / 34 [Tiếp →] */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-700 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-700 text-xs"
              title="Câu trước (←)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>

            <span className="font-mono font-bold text-slate-600 px-1 text-xs">
              {currentIndex + 1} / {words.length}
            </span>

            <button
              onClick={handleNext}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-700 text-slate-600 font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-700 text-xs"
              title="Câu tiếp theo (→)"
            >
              <span>Tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hướng dẫn phím tắt: Nhấn 1-4 để chọn, Space tiếp tục, ←/→ chuyển câu */}
          <div className="flex items-center gap-1.5 text-slate-400 hidden sm:flex text-[11px]">
            <span>Phím</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
              1–4
            </kbd>
            <span>chọn,</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
              Space
            </kbd>
            <span>tiếp,</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">
              ←/→
            </kbd>
            <span>chuyển câu</span>
          </div>

          {/* Cụm hành động góc phải: Làm lại / Câu này bó tay / Tiếp tục */}
          <div className="flex items-center gap-2">
            {isAnswered ? (
              <div className="flex items-center gap-2 flex-wrap">
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-600 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Câu trước</span>
                  </button>
                )}

                <button
                  onClick={handleRetryCurrent}
                  className="text-xs text-slate-500 hover:text-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors px-2 py-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại</span>
                </button>

                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md"
                >
                  <span>Tiếp tục (Space)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGiveUp}
                className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 font-bold transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400/80" />
                <span>Câu này bó tay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* 2. DẢI NÚT "CHỌN CHẾ ĐỘ HỌC" GỌN GÀNG (Loại bỏ các tính năng chưa làm, giữ 4 chế độ chuẩn) */}
      <div className="flex flex-col gap-2.5 mt-1">
        <h4 className="text-sm font-black text-slate-800">Chọn chế độ học</h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Chế độ 1: Flashcard */}
          <button
            onClick={onNavigateToFlashcard}
            className="p-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
          >
            <Layers className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
            <span className="text-xs font-bold">Flashcard</span>
          </button>

          {/* Chế độ 2: Trắc nghiệm */}
          <button
            onClick={() => setPracticeMode('quiz')}
            className={`p-3.5 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-1.5 relative cursor-pointer transition-all ${
              practiceMode === 'quiz'
                ? 'bg-white text-blue-600 border-2 border-blue-500 font-black shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {practiceMode === 'quiz' && (
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-100" />
            )}
            <Target className={`w-5 h-5 ${practiceMode === 'quiz' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-xs font-bold">Trắc nghiệm</span>
          </button>

          {/* Chế độ 3: Dịch câu (Đang chọn như trong Ảnh media_1788409174787.png) */}
          <button
            onClick={() => setPracticeMode('cloze')}
            className={`p-3.5 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-1.5 relative cursor-pointer transition-all ${
              practiceMode === 'cloze'
                ? 'bg-white text-blue-600 border-2 border-blue-500 font-black shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {practiceMode === 'cloze' && (
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-100" />
            )}
            <BookOpen className={`w-5 h-5 ${practiceMode === 'cloze' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-xs font-bold">Dịch câu</span>
          </button>

          {/* Chế độ 4: Nghe & Sắp xếp câu */}
          <button
            onClick={onNavigateToListening}
            className="p-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
          >
            <Radio className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
            <span className="text-xs font-bold">Nghe đuổi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
