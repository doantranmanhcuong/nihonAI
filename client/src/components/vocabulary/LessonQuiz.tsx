'use client';

import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Sparkles, Volume2 } from 'lucide-react';
import { FlashcardWordItem } from './LessonFlashcard';

interface QuizQuestion {
  question: string;
  subText?: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

interface LessonQuizProps {
  lessonTitle: string;
  words: FlashcardWordItem[];
  onBack: () => void;
}

export const LessonQuiz: React.FC<LessonQuizProps> = ({
  lessonTitle,
  words,
  onBack
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sinh bài kiểm tra trắc nghiệm ngẫu nhiên từ danh sách từ vựng
  const generateQuiz = () => {
    if (!words || words.length < 2) return;

    const generated: QuizQuestion[] = [];
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledWords.length; i++) {
      const current = shuffledWords[i];

      // Lấy 3 từ khác làm đáp án gây nhiễu (distractors)
            const others = words.filter((w) => w.id !== current.id).sort(() => Math.random() - 0.5);
      
      const distractorsVi = others.slice(0, 3).map((w) => w.meaningVi);
      const options1 = [current.meaningVi, ...distractorsVi].sort(() => Math.random() - 0.5);
      
      const cleanReading = (str: string) => str.replace(/\s*\[.*?\]\s*/g, '');
      
      generated.push({
        question: current.word,
        subText: cleanReading(current.reading),
        correctAnswer: current.meaningVi,
        options: options1,
        explanation: `${current.word} (${current.reading}), nghĩa: ${current.meaningVi}.`
      });

      const currentReadingCleaned = cleanReading(current.reading);
      const distractorsReading = others.slice(0, 3).map((w) => cleanReading(w.reading));
      const options2 = [currentReadingCleaned, ...distractorsReading].sort(() => Math.random() - 0.5);
      generated.push({
        question: `Cách đọc của "${current.word}"?`,
        subText: current.meaningVi,
        correctAnswer: currentReadingCleaned,
        options: options2,
        explanation: `${current.word} đọc là ${current.reading}.`
      });

      if (current.exampleJp) {
        const distractorsWord = others.slice(0, 3).map((w) => w.word);
        const options3 = [current.word, ...distractorsWord].sort(() => Math.random() - 0.5);
        let qText = current.exampleJp;
        if (qText.includes(current.word)) {
          qText = qText.replace(current.word, '(   )');
        } else {
          qText = `(   ) -> ${qText}`;
        }
        
        generated.push({
          question: qText,
          subText: current.exampleVi || 'Điền từ vào chỗ trống.',
          correctAnswer: current.word,
          options: options3,
          explanation: `Ví dụ: ${current.exampleJp} => ${current.exampleVi}`
        });
      }
    }

    setQuestions(generated.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    generateQuiz();
  }, [words]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null) return; // Đã trả lời, không cho đổi
    setSelectedOption(opt);
    if (opt === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
        <p className="text-sm font-bold text-slate-700">Bài học này cần ít nhất 2 từ vựng để tạo bài trắc nghiệm.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // MÀN HÌNH TỔNG KẾT ĐIỂM
  if (isCompleted) {
    const percent = Math.round((score / questions.length) * 100);
    const isPassed = percent >= 70;

    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto text-center flex flex-col items-center gap-5 animate-in fade-in duration-300">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-inner ${
          isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
        }`}>
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">
            {isPassed ? 'Xuất Sắc! Bạn Đã Vượt Qua' : 'Cố Lên! Cần Luyện Tập Thêm'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng kết kết quả trắc nghiệm {lessonTitle}
          </p>
        </div>

        <div className="flex items-center gap-6 my-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[120px]">
            <span className="text-xs font-bold text-slate-400 block">Số câu đúng</span>
            <span className="text-2xl font-black text-indigo-600">
              {score} / {questions.length}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[120px]">
            <span className="text-xs font-bold text-slate-400 block">Tỷ lệ chính xác</span>
            <span className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {percent}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateQuiz}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài thi</span>
          </button>

          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐANG LÀM BÀI TRẮC NGHIỆM
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header Trắc nghiệm */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát</span>
        </button>

        <span className="text-xs font-black text-slate-700">
          Câu hỏi {currentIndex + 1} / {questions.length}
        </span>

        <span className="text-xs font-extrabold text-indigo-600 px-2.5 py-0.5 bg-indigo-50 rounded-lg">
          Điểm: {score}
        </span>
      </div>

      {/* Câu Hỏi Lớn */}
      <div className="text-center py-4 flex flex-col items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Chọn nghĩa tiếng Việt chính xác của từ sau:
        </span>
        <div className="flex items-center gap-3">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            {currentQ.question}
          </h2>
          <button
            onClick={() => speak(currentQ.question)}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors cursor-pointer"
            title="Phát âm"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
        {currentQ.subText && (
          <span className="text-base font-extrabold text-indigo-600">
            {currentQ.subText}
          </span>
        )}
      </div>

      {/* 4 Lựa Chọn Đáp Án */}
      <div className="grid grid-cols-1 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === currentQ.correctAnswer;
          const hasAnswered = selectedOption !== null;

          let btnStyle = 'bg-slate-50 hover:bg-indigo-50/70 border-slate-200 text-slate-800';

          if (hasAnswered) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold ring-2 ring-emerald-200';
            } else if (isSelected) {
              btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 font-bold ring-2 ring-rose-200';
            } else {
              btnStyle = 'bg-slate-50 opacity-40 border-slate-200 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              disabled={hasAnswered}
              className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-black/5 font-mono text-xs font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-semibold">{opt}</span>
              </div>

              {hasAnswered && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {hasAnswered && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Giải thích & Nút Câu Tiếp Theo */}
      {selectedOption !== null && (
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <p className="text-xs text-indigo-900 font-medium">
            💡 {currentQ.explanation}
          </p>

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            {currentIndex < questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả bài thi'}
          </button>
        </div>
      )}
    </div>
  );
};
