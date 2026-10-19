'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Network,
  BookOpen,
  Shuffle,
  HelpCircle,
  Award,
  CheckCircle2,
  FileText,
  PenTool
} from 'lucide-react';

interface KanjiFlashcardViewProps {
  kanjis: any[];
  curriculumName: string;
  level: string;
  lesson?: number;
  lessonTitle?: string;
  onOpenDetail?: (kanji: any) => void;
  onOpenRadicals?: (kanji: any) => void;
  onOpenPhonetic?: (kanji: any) => void;
  onOpenStrokeTracing?: (kanji: any) => void;
}

export const KanjiFlashcardView: React.FC<KanjiFlashcardViewProps> = ({
  kanjis,
  curriculumName,
  level,
  lesson,
  lessonTitle,
  onOpenDetail,
  onOpenRadicals,
  onOpenPhonetic,
  onOpenStrokeTracing
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [deck, setDeck] = useState<any[]>(kanjis);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const current = deck && deck.length > 0 ? deck[currentIndex] : null;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (deck.length > 0 ? (prev + 1) % deck.length : 0));
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (deck.length > 0 ? (prev - 1 + deck.length) % deck.length : 0));
  }, [deck.length]);

  useEffect(() => {
    setDeck(kanjis);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [kanjis]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (current) {
          const sound = current.onyomi !== '—' ? current.onyomi : current.kunyomi;
          if (sound) speakText(sound);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, current]);

  if (!deck || deck.length === 0 || !current) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
        <BookOpen className="w-12 h-12 text-slate-300" />
        <h3 className="text-base font-bold text-slate-700">Chưa có chữ Hán trong bài này</h3>
        <p className="text-xs text-slate-400">Vui lòng chọn bài học hoặc giáo trình khác để bắt đầu học flashcard.</p>
      </div>
    );
  }

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (character: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(character)) {
        next.delete(character);
      } else {
        next.add(character);
      }
      return next;
    });
  };

  const speakText = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Parse từ ghép thực tế
  let exampleWords: any[] = [];
  if (current.exampleWords) {
    if (Array.isArray(current.exampleWords)) {
      exampleWords = current.exampleWords;
    } else if (typeof current.exampleWords === 'string') {
      try {
        exampleWords = JSON.parse(current.exampleWords);
      } catch (e) {
        exampleWords = [];
      }
    }
  }

  // Parse bộ thủ
  let radicals: { symbol: string; name: string }[] = [];
  if (current.radicals) {
    if (Array.isArray(current.radicals)) {
      radicals = current.radicals;
    } else if (typeof current.radicals === 'string') {
      try {
        radicals = JSON.parse(current.radicals);
      } catch (e) {
        radicals = [];
      }
    }
  }

  const isCurrentMastered = masteredIds.has(current.character);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Top Meta Bar */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-black shadow-2xs">
            {curriculumName}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-extrabold border border-slate-200">
            {current.levelTag || level}
          </span>
          {lessonTitle && (
            <span className="text-xs text-slate-500 font-bold hidden sm:inline-block">
              {lessonTitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Xáo trộn thứ tự thẻ"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xáo trộn</span>
          </button>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
            {currentIndex + 1} / {deck.length}
          </span>
        </div>
      </div>

      {/* Progress Bar - Đảm bảo chiều rộng tối thiểu, không bị co lại thành dấu ngoặc đơn `(` */}
      <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 transition-all duration-300 rounded-full min-w-[16px]"
          style={{ width: `${Math.max(4, ((currentIndex + 1) / deck.length) * 100)}%` }}
        />
      </div>

      {/* Side Switcher Toggle */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold shadow-2xs">
        <button
          onClick={() => setIsFlipped(false)}
          className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            !isFlipped
              ? 'bg-white text-indigo-600 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Mặt trước: Chữ Hán</span>
        </button>
        <button
          onClick={() => setIsFlipped(true)}
          className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            isFlipped
              ? 'bg-white text-indigo-600 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Mặt sau: Nghĩa & Mẹo nhớ</span>
        </button>
      </div>

      {/* 3D Flashcard Container kèm 2 nút nổi bên sườn trên Desktop */}
      <div className="relative w-full">
        {/* Nút Điều Hướng Trái Nổi Bên Hông (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden lg:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-full items-center justify-center shadow-md transition-all cursor-pointer z-20 active:scale-95"
          title="Thẻ trước (Mũi tên trái ←)"
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
          title="Thẻ tiếp theo (Mũi tên phải →)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full min-h-[460px] cursor-pointer select-none group relative perspective-1000"
          style={{ perspective: '1200px' }}
        >
          <div className="relative w-full h-full min-h-[460px] rounded-3xl">
            {/* ================= MẶT TRƯỚC (FRONT) ================= */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl shadow-lg border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/60 to-indigo-50/40 p-6 sm:p-8 flex flex-col justify-between"
              style={{
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                pointerEvents: isFlipped ? 'none' : 'auto',
                opacity: isFlipped ? 0 : 1,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease'
              }}
            >
              {/* Thanh trên cùng mặt trước: Cấp độ, Số nét, Bộ thủ & Loa phát âm */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-2xs">
                    {current.levelTag || current.jlptLevel || level}
                  </span>
                  {current.lesson !== undefined && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200">
                      Bài {current.lesson}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200">
                    {current.strokeCount} nét
                  </span>
                  {radicals.length > 0 && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 hidden sm:inline-block">
                      Bộ: {radicals[0].symbol} ({radicals[0].name})
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => speakText(current.onyomi !== '—' ? current.onyomi : current.kunyomi, e)}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer border border-indigo-200"
                  title="Phát âm tiếng Nhật (Phím R)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Vùng trung tâm: Chữ Hán to bản & Âm Hán Việt */}
              <div className="flex flex-col items-center justify-center my-auto text-center py-2">
                <span className="text-8xl sm:text-9xl font-black text-slate-900 drop-shadow-xs group-hover:scale-105 transition-transform duration-300 tracking-tight select-none">
                  {current.character}
                </span>

                {/* Âm Hán Việt nổi bật - Không còn bị trống trải */}
                <div className="mt-3 flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-wider">
                    {current.hanViet}
                  </span>
                  <span className="text-sm font-bold text-slate-600">
                    {current.meaningVi}
                  </span>
                </div>

                {/* Hộp gợi ý mẹo nhớ Look and Learn (Trực quan, sinh động) */}
                {(current.lookAndLearnTip || current.mnemonic) && (
                  <div className="mt-4 px-4 py-2.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl max-w-md text-center shadow-2xs animate-in fade-in">
                    <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                      💡 <strong className="font-extrabold text-amber-950">Mẹo nhớ:</strong> {current.lookAndLearnTip || current.mnemonic}
                    </p>
                  </div>
                )}
              </div>

              {/* Thanh chân thẻ mặt trước */}
              <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 font-bold text-indigo-600">
                  <RotateCw className="w-3.5 h-3.5" /> Chạm thẻ hoặc Space để xem âm On/Kun & Từ ghép
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Phím ← / → chuyển thẻ
                </span>
              </div>
            </div>

            {/* ================= MẶT SAU (BACK) ================= */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl shadow-lg border border-slate-200/90 bg-white p-7 flex flex-col justify-between"
              style={{
                transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                pointerEvents: isFlipped ? 'auto' : 'none',
                opacity: isFlipped ? 1 : 0,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease'
              }}
            >
              {/* Header: Chữ Hán, Hán Việt & Ý nghĩa */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black text-slate-900">{current.character}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-indigo-600 tracking-wide">{current.hanViet}</span>
                      <button
                        onClick={(e) => speakText(current.onyomi !== '—' ? current.onyomi : current.kunyomi, e)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-slate-700 mt-0.5">{current.meaningVi}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded-lg">
                    {current.levelTag || current.jlptLevel}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{current.strokeCount} nét</span>
                </div>
              </div>

              {/* Thân thẻ: Cách đọc On/Kun & Từ ghép tiêu biểu */}
              <div className="flex flex-col gap-4 my-auto">
                {/* Khối Cách đọc */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Âm Onyomi</span>
                      <button
                        onClick={(e) => speakText(current.onyomi, e)}
                        className="hover:text-indigo-600 cursor-pointer"
                        title="Nghe Onyomi"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">{current.onyomi || '—'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Âm Kunyomi</span>
                      <button
                        onClick={(e) => speakText(current.kunyomi, e)}
                        className="hover:text-indigo-600 cursor-pointer"
                        title="Nghe Kunyomi"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">{current.kunyomi || '—'}</span>
                  </div>
                </div>

                {/* Từ ghép tiêu biểu (gọn gàng, kèm Trọng âm NHK) */}
                {exampleWords.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Từ ghép & Trọng âm NHK:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {exampleWords.slice(0, 2).map((ex: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={(e) => speakText(ex.reading || ex.word, e)}
                          className="p-2.5 bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 font-bold">{ex.word}</strong>
                              <span className="text-[11px] text-indigo-700 font-semibold">[{ex.reading}]</span>
                              {ex.pitchAccent && (
                                <span className="text-[10px] px-1 bg-white text-indigo-600 font-bold rounded border border-indigo-200">
                                  {ex.pitchAccent}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{ex.meaningVi || ex.meaning}</span>
                          </div>
                          <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Toolbar: 4 chức năng nhỏ để người dùng mở xem chi tiết khi cần */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="pt-3 border-t border-slate-100 grid grid-cols-4 gap-2"
              >
                <button
                  onClick={() => onOpenDetail && onOpenDetail(current)}
                  className="py-2 px-2 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all flex flex-col items-center gap-1 text-center shadow-2xs cursor-pointer"
                  title="Xem chi tiết Hán tự và phân tích AI Sensei"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="line-clamp-1">Chi tiết</span>
                </button>

                <button
                  onClick={() => onOpenRadicals && onOpenRadicals(current)}
                  className="py-2 px-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all flex flex-col items-center gap-1 text-center shadow-2xs cursor-pointer"
                  title="Xem sơ đồ bộ thủ cấu thành"
                >
                  <Network className="w-4 h-4 text-emerald-600" />
                  <span className="line-clamp-1">Bộ thủ</span>
                </button>

                <button
                  onClick={() => onOpenPhonetic && onOpenPhonetic(current)}
                  className="py-2 px-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all flex flex-col items-center gap-1 text-center shadow-2xs cursor-pointer"
                  title="Xem quy tắc chuyển âm Hán Việt"
                >
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span className="line-clamp-1">Chuyển âm</span>
                </button>

                <button
                  onClick={() => onOpenStrokeTracing && onOpenStrokeTracing(current)}
                  className="py-2 px-2 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all flex flex-col items-center gap-1 text-center shadow-2xs cursor-pointer"
                  title="Tập vẽ đè in khớp nét"
                >
                  <PenTool className="w-4 h-4 text-indigo-600" />
                  <span className="line-clamp-1">Tập vẽ đè</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 w-full justify-between px-2 max-w-2xl mx-auto">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Thẻ trước</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>Lật thẻ (Space)</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <span>Thẻ tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
