'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  Shuffle,
  Play,
  Pause,
  Check,
  X,
  Star,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { ConstituentKanji } from './VocabDetailCard';
import { NHKPitchAccentLine } from './NHKPitchAccentLine';

export interface FlashcardWordItem {
  id: string;
  word: string;
  reading: string;
  romaji: string | null;
  hanViet: string | null;
  meaningVi: string;
  jlptLevel: string;
  partOfSpeech: string | null;
  pitchAccent: string | null;
  exampleJp: string | null;
  exampleVi: string | null;
  constituentKanjis?: ConstituentKanji[];
}

interface LessonFlashcardProps {
  lessonTitle: string;
  topicTitle: string;
  words: FlashcardWordItem[];
  onBack: () => void;
  onNavigateToKanji?: (character: string) => void;
}

export const LessonFlashcard: React.FC<LessonFlashcardProps> = ({
  lessonTitle,
  topicTitle,
  words,
  onBack,
  onNavigateToKanji
}) => {
  const [cardList, setCardList] = useState<FlashcardWordItem[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [memorizedIds, setMemorizedIds] = useState<Set<string>>(new Set());
  const [displayMode, setDisplayMode] = useState<'word' | 'example'>('word');

  // Cập nhật danh sách khi props thay đổi
  useEffect(() => {
    setCardList(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = cardList[currentIndex] || cardList[0];

  // Phát âm tiếng Nhật
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < cardList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, cardList.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(cardList.length - 1);
    }
  }, [currentIndex, cardList.length]);

  const handleMarkMemorized = () => {
    if (!currentWord) return;
    setMemorizedIds((prev) => new Set(prev).add(currentWord.id));
    handleNext();
  };

  const handleMarkReview = () => {
    if (!currentWord) return;
    setMemorizedIds((prev) => {
      const next = new Set(prev);
      next.delete(currentWord.id);
      return next;
    });
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cardList].sort(() => Math.random() - 0.5);
    setCardList(shuffled);
    setCurrentIndex(0);
  };

  // Tự động chạy thẻ Flashcard
  useEffect(() => {
    let timer: any;
    if (isAutoPlay && currentWord) {
      timer = setTimeout(() => {
        if (!isFlipped) {
          setIsFlipped(true);
          speak(currentWord.word);
        } else {
          handleNext();
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlay, isFlipped, currentWord, handleNext, speak]);

  // Lắng nghe phím tắt: Space (lật thẻ), Z, X, R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'z' || e.key === 'Z') {
        handleMarkMemorized();
      } else if (e.key === 'x' || e.key === 'X') {
        handleMarkReview();
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentWord) speak(currentWord.word);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, handleNext, handlePrev, speak]);

  if (!currentWord) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
        <p className="text-sm font-bold text-slate-700">Chưa có từ vựng trong bài học này.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header Điều Hướng Bài Học */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại lộ trình bài học</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            {lessonTitle}
          </h2>
          <p className="text-xs text-indigo-600 font-bold mt-0.5">
            {topicTitle} • Từ {currentIndex + 1}/{cardList.length}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
            title="Câu trước (←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trước</span>
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-2xs"
            title="Câu tiếp theo (→)"
          >
            <span className="hidden sm:inline">Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. KHUNG FLASHCARD 3D - KÈM 2 NÚT ĐIỀU HƯỚNG NỔI BÊN HÔNG */}
      <div className="relative w-full">
        {/* Nút Điều Hướng Trái Nổi Bên Hông (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden lg:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-full items-center justify-center shadow-md transition-all cursor-pointer z-20 active:scale-95"
          title="Câu trước (Mũi tên trái)"
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
          title="Câu tiếp theo (Mũi tên phải)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full h-[560px] sm:h-[600px] cursor-pointer select-none [perspective:1200px]"
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-3xl ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >

          {/* ================= MẶT TRƯỚC (CHƯA LẬT): CHE ĐÁP ÁN ĐỂ TỰ KIỂM TRA ================= */}
          <div className="absolute inset-0 w-full h-full bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 flex flex-col justify-between overflow-hidden [backface-visibility:hidden]">
            {/* Thanh trên cùng mặt trước */}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại chủ đề</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-white/10 rounded-full text-indigo-300">
                  Mặt trước
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStarred(!isStarred);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-400 transition-all cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Trọng tâm mặt trước: Từ vựng to rõ */}
            <div className="flex flex-col items-center justify-center text-center my-auto py-4 gap-3">
              {displayMode === 'word' ? (
                <>
                  <h1 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
                    {currentWord.word}
                  </h1>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentWord.word);
                    }}
                    className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-all cursor-pointer mt-1"
                    title="Phát âm (R)"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    (Nhấn <kbd className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 text-amber-600 font-bold">Space</kbd> hoặc chạm vào thẻ để LẬT xem nghĩa & trọng âm)
                  </p>
                </>
              ) : (
                /* Chế độ ví dụ */
                <div className="flex flex-col items-center gap-3 max-w-lg">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Thử thách qua ví dụ:</span>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
                    {currentWord.exampleJp?.replace(currentWord.word, '______') || currentWord.word}
                  </p>
                  <p className="text-xs text-slate-500">
                    (Chạm thẻ để lật xem từ vựng thích hợp và bản dịch)
                  </p>
                </div>
              )}
            </div>

            {/* Thanh gợi ý dưới mặt trước */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-400">(Nhấn <kbd className="px-1.5 py-0.5 bg-slate-100 rounded-md text-slate-500 font-sans text-xs">Space</kbd> hoặc chạm vào thẻ để lật)</span>
            </div>
          </div>

          {/* ================= MẶT SAU (ĐÃ LẬT): ĐẦY ĐỦ ĐÁP ÁN NHƯ ẢNH 3 ================= */}
          <div className="absolute inset-0 w-full h-full bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 flex flex-col justify-between overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden]">
            {/* Thanh trên cùng mặt sau */}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại chủ đề</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                  Mặt sau (Đáp án)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentWord.word);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                  title="Phát âm (R)"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* NỘI DUNG MẶT SAU (Khớp Hệt Ảnh 3) */}
            <div className="flex flex-col items-center justify-center text-center my-auto py-1 gap-2">
              {/* 1. Đồ thị Đường Kẻ Trọng Âm Chuẩn Đài NHK */}
              <NHKPitchAccentLine theme="light"
                pitchStr={currentWord.pitchAccent}
                reading={currentWord.reading}
                word={currentWord.word}
              />

              {/* 2. Chữ Hán Gốc (Nếu khác Hiragana) */}
              {currentWord.word !== currentWord.reading && (
                <div className="text-xl font-bold text-slate-600">
                  {currentWord.word}
                </div>
              )}

              {/* 3. Âm Hán Việt Màu Xanh Lá Sáng (TIÊN SINH - Khớp Ảnh 3) */}
              {currentWord.hanViet && (
                <div className="text-emerald-400 font-black text-xs sm:text-sm tracking-widest uppercase">
                  {currentWord.hanViet}
                </div>
              )}

              {/* 4. Nghĩa Tiếng Việt To Rõ */}
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-relaxed">
                {currentWord.meaningVi}
              </h3>

              {/* 5. Nút Loa Phát Âm Trung Tâm */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speak(currentWord.word);
                }}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* 6. Câu Ví Dụ Ngữ Cảnh Song Ngữ */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col items-center gap-0.5 text-center max-w-lg w-full">
                <div className="flex items-center gap-2">
                  <p className="text-sm sm:text-base font-bold text-slate-800">
                    {currentWord.exampleJp || `この「${currentWord.word}」の使い方はとても大切です。`}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentWord.exampleJp || currentWord.word);
                    }}
                    className="text-slate-500 hover:text-indigo-300 transition-colors p-1 cursor-pointer"
                    title="Phát âm câu ví dụ"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 italic">
                  {currentWord.exampleVi || `(Ví dụ ngữ cảnh: Cách dùng từ "${currentWord.meaningVi}" rất quan trọng)`}
                </p>
              </div>

              {/* 7. Nút Liên Kết Chữ Hán Thành Phần */}
              {currentWord.constituentKanjis && currentWord.constituentKanjis.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Chữ Hán:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {currentWord.constituentKanjis.map((k) => (
                      <button
                        key={k.character}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToKanji) onNavigateToKanji(k.character);
                        }}
                        className="px-2 py-0.5 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer border border-indigo-400/40"
                        title={`Xem nét vẽ hoạt họa & bộ thủ của chữ ${k.character} (${k.hanViet})`}
                      >
                        {k.character} ({k.hanViet})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Thanh phím tắt dưới mặt sau */}
            <div className="pt-2.5 pb-1 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <span>Phím tắt:</span>
                <span className="text-slate-600"><kbd className="px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200 text-slate-600">Space</kbd> lật</span>
                <span className="text-slate-600"><kbd className="px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200 text-slate-600">Z</kbd> biết</span>
                <span className="text-slate-600"><kbd className="px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200 text-slate-600">X</kbd> chưa biết</span>
                <span className="text-slate-600"><kbd className="px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200 text-slate-600">R</kbd> audio</span>
              </div>
              <span className="font-bold text-slate-500">{currentIndex + 1} / {cardList.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 3. THANH ĐIỀU KHIỂN DƯỚI CÙNG - CÓ ĐẦY ĐỦ NÚT CÂU TRƯỚC / TIẾP THEO RÕ RÀNG */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setDisplayMode('word')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayMode === 'word' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 border border-transparent'
              }`}
            >Từ đơn</button>
            <button
              onClick={() => setDisplayMode('example')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayMode === 'example' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 border border-transparent'
              }`}
            >Ví dụ</button>
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-400">
            {currentIndex + 1} / {cardList.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Câu trước (Phím ←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 justify-center">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="px-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-sm font-black cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                Lật đáp án <span className="opacity-50 font-normal ml-1 text-xs hidden sm:inline">(Space)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleMarkReview}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  <span>Học lại <span className="opacity-50 font-normal ml-1 hidden sm:inline">(X)</span></span>
                </button>
                <button
                  onClick={handleMarkMemorized}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap"
                >
                  <Check className="w-4 h-4" />
                  <span>Đã thuộc <span className="opacity-50 font-normal ml-1 hidden sm:inline">(Z)</span></span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Câu tiếp theo (Phím →)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="sm:hidden text-xs font-bold text-slate-400 mr-1">
            {currentIndex + 1}/{cardList.length}
          </span>
          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
            title="Đảo ngẫu nhiên"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isAutoPlay ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
            title="Tự động phát"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
);
};
