'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiGateway } from '@/services/api-gateway.client';
import {
  Trophy,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookOpen,
  Volume2,
  Loader2,
  AlertCircle,
  Check,
  X,
  Layers,
  ArrowRightLeft,
  Flame,
  Shuffle
} from 'lucide-react';

interface MatchingPair {
  id: string;
  kanji: string;
  matchText: string;
  hanViet?: string;
  meaningVi?: string;
}

interface QuizQuestion {
  id: string;
  type: 'kanji_to_reading' | 'kanji_to_hanviet' | 'meaning_to_kanji' | 'context_reading' | 'true_false' | 'matching';
  prompt: string;
  kanji: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hanViet?: string;
  level?: string;
  matchingPairs?: MatchingPair[];
}

interface KanjiQuizViewProps {
  initialLevel?: string;
  onSelectKanji?: (character: string) => void;
}

const CURRICULUMS = [
  { id: 'ALL', name: 'Tất cả giáo trình', levels: ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'] },
  { id: 'LOOK_AND_LEARN', name: 'Kanji Look and Learn (N5 - N4)', levels: ['ALL', 'N5', 'N4'] },
  { id: 'BASIC_KANJI', name: 'Basic Kanji Book (N5 - N4)', levels: ['ALL', 'N5', 'N4'] },
  { id: 'SOUMATOME_N3', name: 'Nihongo Soumatome N3', levels: ['N3'] },
  { id: 'SOUMATOME_N2', name: 'Nihongo Soumatome N2', levels: ['N2'] },
  { id: '500_MON_N2', name: '500 Câu Hỏi Kanji N2', levels: ['N2'] },
  { id: '500_MON_N1', name: '500 Câu Hỏi Hán Tự N1', levels: ['N1'] }
];

const QUESTION_TYPES = [
  { id: 'ALL', name: 'Tất cả dạng câu' },
  { id: 'kanji_to_reading', name: 'Trắc nghiệm xuôi (Chữ ➔ Nghĩa)' },
  { id: 'meaning_to_kanji', name: 'Trắc nghiệm ngược (Nghĩa ➔ Chữ)' },
  { id: 'true_false', name: 'Đúng / Sai' },
  { id: 'matching', name: 'Nối từ ghép / Ghép cặp' }
];

const LEVELS = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

export const KanjiQuizView: React.FC<KanjiQuizViewProps> = ({
  initialLevel = 'N5',
  onSelectKanji
}) => {
  // Bộ lọc cấu hình bài thi
  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevel);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Trạng thái tải bài thi
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái khi đang làm bài
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; userChoice: string; isCorrect: boolean }[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  // Trạng thái chuyên biệt cho dạng Matching (Nối cặp)
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<string | null>(null);
  const [matchingSelectedRight, setMatchingSelectedRight] = useState<string | null>(null);
  const [matchedKanjiSet, setMatchedKanjiSet] = useState<Set<string>>(new Set());
  const [mismatchError, setMismatchError] = useState<{ left: string; right: string } | null>(null);
  const [aiExplanations, setAiExplanations] = useState<{ [quizId: string]: string }>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const handleRequestAiExplain = async (question: QuizQuestion, selectedOpt: string | null) => {
    setLoadingAiId(question.id);
    try {
      const message = `Hãy giải thích chi ti?t c�u h?i tr?c nghi?m Kanji/T? v?ng sau:
Đề bài: ${question.prompt} (${question.kanji})
Các lựa chọn: ${question.options?.join(', ') || ''}
Đáp án đúng là: ${question.correctAnswer}
Học viên đã chọn: ${selectedOpt || 'Không chọn'}.

Sensei h�y gi?i th�ch ng?n g?n, phân tích Kanji ho?c t? v?ng li�n quan d? h?c vi�n hi?u s�u hon (t?i da 4 c�u).`;
      
      const { authApi } = require('@/context/AuthContext');
      const res = await authApi.post('/ai/chat', { message, history: [] });
      if (res.data.success && res.data.data?.text) {
        setAiExplanations(p => ({ ...p, [question.id]: res.data.data.text }));
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

  const startNewQuiz = async (
    lvl = selectedLevel,
    cnt = questionCount,
    cur = selectedCurriculum,
    qType = selectedType
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setUserAnswers([]);
      setIsQuizCompleted(false);
      setMatchingSelectedLeft(null);
      setMatchingSelectedRight(null);
      setMatchedKanjiSet(new Set());
      setMismatchError(null);

      const res = await apiGateway.kanji.getQuiz(lvl, cnt, cur, qType);
      if (res && res.data && res.data.length > 0) {
        setQuestions(res.data);
      } else {
        setQuestions([]);
        setError(`Chưa có câu hỏi phù hợp cho bộ lọc đã chọn. Hãy thử chọn cấp độ hoặc giáo trình khác.`);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải câu hỏi kiểm tra:', err);
      setError('Không thể kết nối đến máy chủ để tải bài kiểm tra.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tìm giáo trình đang chọn để biết các cấp độ hợp lệ
  const currentCurriculumDef = useMemo(() => {
    return CURRICULUMS.find((c) => c.id === selectedCurriculum) || CURRICULUMS[0];
  }, [selectedCurriculum]);

  // Xử lý khi đổi giáo trình -> tự động điều chỉnh level nếu level hiện tại không được hỗ trợ
  const handleCurriculumChange = (newCurId: string) => {
    setSelectedCurriculum(newCurId);
    const curDef = CURRICULUMS.find((c) => c.id === newCurId);
    if (curDef && !curDef.levels.includes(selectedLevel)) {
      const nextLvl = curDef.levels.includes('ALL') ? 'ALL' : curDef.levels[0];
      setSelectedLevel(nextLvl);
    }
  };

  // Xử lý khi đổi level -> tự động chuyển giáo trình về 'ALL' nếu giáo trình hiện tại không hỗ trợ
  const handleLevelChange = (newLvl: string) => {
    setSelectedLevel(newLvl);
    if (currentCurriculumDef && !currentCurriculumDef.levels.includes(newLvl)) {
      setSelectedCurriculum('ALL');
    }
  };

  const handleCountChange = (cnt: number) => {
    const validCnt = Math.max(1, Math.min(100, cnt));
    setQuestionCount(validCnt);
    startNewQuiz(selectedLevel, validCnt, selectedCurriculum, selectedType);
  };

  useEffect(() => {
    startNewQuiz(selectedLevel, questionCount, selectedCurriculum, selectedType);
  }, [selectedLevel, selectedCurriculum, selectedType]);

  const currentQ = questions[currentIndex];

  // Chuẩn bị danh sách đảo ngẫu nhiên cột trái/phải cho câu hỏi Matching
  const shuffledMatching = useMemo(() => {
    if (!currentQ || currentQ.type !== 'matching' || !currentQ.matchingPairs) {
      return { left: [], right: [] };
    }
    const pairs = currentQ.matchingPairs;
    const left = pairs.map((p) => p.kanji);
    const right = [...pairs].map((p) => ({ kanji: p.kanji, text: p.matchText })).sort(() => 0.5 - Math.random());
    return { left, right };
  }, [currentQ?.id, currentQ?.type]);

  // Xử lý khi chọn đáp án trắc nghiệm hoặc Đúng/Sai
  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(opt);
    setIsAnswered(true);
    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, userChoice: opt, isCorrect }
    ]);
  };

  // Xử lý logic Nối cặp (Matching)
  const handleSelectMatchingLeft = (kanji: string) => {
    if (isAnswered || matchedKanjiSet.has(kanji)) return;
    setMatchingSelectedLeft(kanji);

    // Nếu người dùng đã chọn bên phải trước đó, kiểm tra ngay
    if (matchingSelectedRight) {
      verifyMatch(kanji, matchingSelectedRight);
    }
  };

  const handleSelectMatchingRight = (item: { kanji: string; text: string }) => {
    if (isAnswered || matchedKanjiSet.has(item.kanji)) return;
    setMatchingSelectedRight(item.text);

    // Nếu người dùng đã chọn bên trái trước đó, kiểm tra ngay
    if (matchingSelectedLeft) {
      verifyMatch(matchingSelectedLeft, item.text);
    }
  };

  const verifyMatch = (leftKanji: string, rightText: string) => {
    if (!currentQ || !currentQ.matchingPairs) return;
    const targetPair = currentQ.matchingPairs.find((p) => p.kanji === leftKanji);

    if (targetPair && targetPair.matchText === rightText) {
      // Ghép đúng!
      const nextMatched = new Set(matchedKanjiSet);
      nextMatched.add(leftKanji);
      setMatchedKanjiSet(nextMatched);
      setMatchingSelectedLeft(null);
      setMatchingSelectedRight(null);
      setMismatchError(null);

      // Kiểm tra nếu đã hoàn thành tất cả 4 cặp
      if (nextMatched.size === currentQ.matchingPairs.length) {
        setIsAnswered(true);
        setScore((prev) => prev + 1);
        setUserAnswers((prev) => [
          ...prev,
          { questionId: currentQ.id, userChoice: 'Ghép đúng cả 4 cặp', isCorrect: true }
        ]);
      }
    } else {
      // Ghép sai: cảnh báo rung đỏ
      setMismatchError({ left: leftKanji, right: rightText });
      setTimeout(() => {
        setMismatchError(null);
        setMatchingSelectedLeft(null);
        setMatchingSelectedRight(null);
      }, 700);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setMatchingSelectedLeft(null);
      setMatchingSelectedRight(null);
      setMatchedKanjiSet(new Set());
      setMismatchError(null);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto select-none">
      {/* ================= BỘ LỌC CẤU HÌNH BÀI THI ================= */}
      <div className="w-full bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-4">
        {/* Hàng 1: Giáo trình & Dạng câu hỏi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Giáo trình luyện thi:
            </span>
            <select
              value={selectedCurriculum}
              onChange={(e) => handleCurriculumChange(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {CURRICULUMS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" /> Dạng câu hỏi:
            </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hàng 2: Cấp độ JLPT & Số câu hỏi */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto">
            <span className="text-xs font-extrabold text-slate-400 mr-1">Cấp độ:</span>
            {LEVELS.map((lvl) => {
              const isAllowed = currentCurriculumDef.levels.includes(lvl);
              return (
                <button
                  key={lvl}
                  onClick={() => isAllowed && handleLevelChange(lvl)}
                  disabled={!isAllowed}
                  title={!isAllowed ? `Giáo trình "${currentCurriculumDef.name}" không áp dụng cấp độ ${lvl}` : undefined}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !isAllowed
                      ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent'
                      : selectedLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70 cursor-pointer'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tất cả' : lvl}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-between lg:justify-end w-full lg:w-auto">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-extrabold text-slate-400 mr-0.5">Số câu:</span>
              {[5, 10, 15, 20, 30, 50].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => handleCountChange(cnt)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200'
                      : 'text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {cnt}
                </button>
              ))}

              <div className="flex items-center gap-1 ml-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={questionCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setQuestionCount(Math.max(1, Math.min(100, val)));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      startNewQuiz(selectedLevel, questionCount, selectedCurriculum, selectedType);
                    }
                  }}
                  className="w-12 px-1 py-0.5 text-center text-xs font-black bg-white border border-slate-200 rounded-lg text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  title="Nhập số câu tùy chỉnh (1-100) và nhấn Enter"
                />
                <span className="text-[11px] font-semibold text-slate-400">câu</span>
              </div>
            </div>

            <button
              onClick={() => startNewQuiz(selectedLevel, questionCount, selectedCurriculum, selectedType)}
              disabled={isLoading}
              title="Tạo bộ câu hỏi ngẫu nhiên mới với các tiêu chí hiện tại"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 rounded-xl text-xs font-bold transition-all border border-indigo-200/80 shadow-2xs cursor-pointer ml-auto lg:ml-0"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Đổi đề</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= VÙNG HIỂN THỊ CÂU HỎI ================= */}
      {isLoading ? (
        <div className="w-full min-h-[380px] bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-600">Đang khởi tạo bộ đề thi Hán tự chuẩn JLPT...</p>
        </div>
      ) : error ? (
        <div className="w-full min-h-[320px] bg-white rounded-3xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-800">{error}</h3>
          <button
            onClick={() => startNewQuiz(selectedLevel, questionCount, selectedCurriculum, selectedType)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors mt-2 shadow-xs"
          >
            Tải lại đề thi
          </button>
        </div>
      ) : isQuizCompleted ? (
        /* ================= TỔNG KẾT BÀI THI ================= */
        <div className="w-full bg-white p-8 rounded-3xl border-2 border-indigo-200 shadow-sm flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">
              Hoàn thành bài kiểm tra {selectedLevel !== 'ALL' ? selectedLevel : 'Tổng hợp'}
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              Kết quả: {score} / {questions.length} câu đúng (
              {Math.round((score / questions.length) * 100)}%)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {score >= questions.length * 0.9
                ? 'Xuất sắc! Bạn đã nắm rất vững chữ Hán ở bộ đề này!'
                : score >= questions.length * 0.7
                ? 'Rất tốt! Hãy ôn lại các câu chưa chính xác để hoàn thiện 100%!'
                : 'Cố gắng lên! Hãy luyện thêm flashcard và mẹo nhớ Look & Learn nhé!'}
            </p>
          </div>

          {/* Chi tiết từng câu */}
          <div className="w-full flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1 text-left">
            {questions.map((q, idx) => {
              const ans = userAnswers.find((a) => a.questionId === q.id);
              const isCorrect = ans?.isCorrect;
              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                    isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-black text-sm">{idx + 1}.</span>
                    <div>
                      <p className="font-bold text-slate-800">{q.prompt}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span>
                          Bạn chọn:{' '}
                          <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                            {ans?.userChoice || '—'}
                          </strong>
                        </span>
                        {!isCorrect && (
                          <span>
                            Đáp án đúng: <strong className="text-emerald-700">{q.correctAnswer}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 italic">{q.explanation}</p>
                </div>
              </div>

              {/* AI Explanation Result */}
              {aiExplanations[currentQ.id] ? (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1.5 mt-2">
                  <p className="font-bold text-purple-900 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-600"/> NihonAI Sensei giải thích thêm:</p>
                  <div className="text-purple-950 font-sans whitespace-pre-wrap leading-relaxed">{aiExplanations[currentQ.id]}</div>
                </div>
              ) : (
                <div className="mt-2 flex justify-start">
                  <button
                    onClick={() => handleRequestAiExplain(currentQ, selectedOption)}
                    disabled={loadingAiId === currentQ.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer"
                  >
                    {loadingAiId === currentQ.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    Hỏi thêm AI Sensei
                  </button>
                </div>
              )}

                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => startNewQuiz(selectedLevel, questionCount, selectedCurriculum, selectedType)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm đề kiểm tra mới</span>
          </button>
        </div>
      ) : currentQ ? (
        /* ================= VÙNG CÂU HỎI HIỆN TẠI ================= */
        <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-6">
          {/* Header tiến độ */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-extrabold text-[11px] rounded-lg">
                {currentQ.type === 'true_false'
                  ? 'Đúng / Sai'
                  : currentQ.type === 'matching'
                  ? 'Nối cặp từ ghép'
                  : currentQ.type === 'meaning_to_kanji'
                  ? 'Trắc nghiệm ngược'
                  : 'Trắc nghiệm xuôi'}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">
                Điểm: <strong className="text-emerald-600 font-black">{score}</strong>
              </span>
            </div>

            <div className="w-28 sm:w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* ================= DẠNG 1: ĐÚNG / SAI ================= */}
          {currentQ.type === 'true_false' ? (
            <div className="flex flex-col items-center gap-6">
              {/* Kanji to bản & Đề bài */}
              <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-slate-50 rounded-3xl border border-slate-100 w-full">
                <div className="relative group cursor-pointer" onClick={() => speakText(currentQ.kanji)}>
                  <span className="text-8xl font-black text-slate-900 drop-shadow-xs">
                    {currentQ.kanji}
                  </span>
                  <Volume2 className="w-5 h-5 text-slate-400 absolute -top-1 -right-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-800 mt-5 max-w-xl">
                  {currentQ.prompt}
                </h4>
              </div>

              {/* 2 Nút lớn Đúng / Sai */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {[
                  { label: 'Đúng', val: 'Đúng', icon: Check, color: 'emerald' },
                  { label: 'Sai', val: 'Sai', icon: X, color: 'rose' }
                ].map((item) => {
                  const isSelected = selectedOption === item.val;
                  const isCorrectOpt = item.val === currentQ.correctAnswer;

                  let btnClass = 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90';
                  if (isAnswered) {
                    if (isCorrectOpt) {
                      btnClass = 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-102';
                    } else if (isSelected) {
                      btnClass = 'bg-rose-500 text-white border-rose-600 shadow-md';
                    } else {
                      btnClass = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={item.val}
                      onClick={() => handleSelectOption(item.val)}
                      disabled={isAnswered}
                      className={`py-5 px-6 rounded-2xl border-2 font-black text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs ${btnClass}`}
                    >
                      <item.icon className="w-5 h-5 stroke-[3]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : currentQ.type === 'matching' ? (
            /* ================= DẠNG 2: NỐI TỪ GHÉP / GHÉP CẶP ================= */
            <div className="flex flex-col gap-5">
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                <h4 className="text-sm sm:text-base font-black text-indigo-950">
                  {currentQ.prompt}
                </h4>
                <p className="text-xs text-indigo-600 mt-0.5">
                  Nhấn vào chữ Hán ở cột trái, sau đó nhấn vào nghĩa/âm tương ứng ở cột phải để hoàn thành ghép cặp!
                </p>
              </div>

              {/* 2 Cột ghép nối */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {/* Cột Trái: Các chữ Kanji */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center">
                    Chữ Hán (Kanji)
                  </span>
                  {shuffledMatching.left.map((char) => {
                    const isMatched = matchedKanjiSet.has(char);
                    const isSelected = matchingSelectedLeft === char;
                    const isError = mismatchError?.left === char;

                    let cardClass = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900';
                    if (isMatched) {
                      cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-70 pointer-events-none';
                    } else if (isError) {
                      cardClass = 'bg-rose-50 border-rose-400 text-rose-800 animate-shake';
                    } else if (isSelected) {
                      cardClass = 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300 text-indigo-900';
                    }

                    return (
                      <button
                        key={char}
                        onClick={() => handleSelectMatchingLeft(char)}
                        disabled={isMatched || isAnswered}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer shadow-2xs ${cardClass}`}
                      >
                        <span className="text-3xl font-black">{char}</span>
                        {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Cột Phải: Nghĩa / Hán Việt */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center">
                    Âm Hán Việt & Ý nghĩa
                  </span>
                  {shuffledMatching.right.map((item, idx) => {
                    const isMatched = matchedKanjiSet.has(item.kanji);
                    const isSelected = matchingSelectedRight === item.text;
                    const isError = mismatchError?.right === item.text;

                    let cardClass = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
                    if (isMatched) {
                      cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-70 pointer-events-none';
                    } else if (isError) {
                      cardClass = 'bg-rose-50 border-rose-400 text-rose-800 animate-shake';
                    } else if (isSelected) {
                      cardClass = 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300 text-indigo-900';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectMatchingRight(item)}
                        disabled={isMatched || isAnswered}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer shadow-2xs ${cardClass}`}
                      >
                        <span className="text-xs sm:text-sm font-extrabold line-clamp-2">{item.text}</span>
                        {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ================= DẠNG 3 & 4: TRẮC NGHIỆM 4 ĐÁP ÁN (XUÔI & NGƯỢC) ================= */
            <div className="flex flex-col gap-6">
              {/* Header câu hỏi: Kanji to bản & Đề bài */}
              <div className="flex flex-col items-center justify-center text-center py-5 px-4 bg-slate-50 rounded-3xl border border-slate-100">
                {currentQ.type !== 'meaning_to_kanji' ? (
                  <div className="relative group cursor-pointer" onClick={() => speakText(currentQ.kanji)}>
                    <span className="text-8xl font-black text-slate-900 drop-shadow-xs">
                      {currentQ.kanji}
                    </span>
                    <Volume2 className="w-5 h-5 text-slate-400 absolute -top-1 -right-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-wide mb-1">
                    【 {currentQ.hanViet || 'Hán tự'} 】
                  </span>
                )}

                <h4 className="text-base sm:text-lg font-black text-slate-800 mt-4 max-w-xl">
                  {currentQ.prompt}
                </h4>
              </div>

              {/* 4 Lựa chọn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectOpt = opt === currentQ.correctAnswer;

                  let btnClass = 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90';
                  if (isAnswered) {
                    if (isCorrectOpt) {
                      btnClass = 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300 font-black';
                    } else if (isSelected) {
                      btnClass = 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-300';
                    } else {
                      btnClass = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all text-left flex items-center justify-between shadow-2xs cursor-pointer ${btnClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={currentQ.type === 'meaning_to_kanji' ? 'text-2xl font-black' : ''}>
                          {opt}
                        </span>
                      </div>

                      {isAnswered && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                      {isAnswered && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= PHẦN GIẢI THÍCH & CÂU TIẾP THEO ================= */}
          {isAnswered && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-indigo-900">Giải thích chi tiết:</span>
                  <p className="text-slate-700 font-medium mt-0.5">{currentQ.explanation}</p>
                </div>
              </div>

              {/* AI Explanation Result */}
              {aiExplanations[currentQ.id] ? (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1.5 mt-2">
                  <p className="font-bold text-purple-900 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-600"/> NihonAI Sensei giải thích thêm:</p>
                  <div className="text-purple-950 font-sans whitespace-pre-wrap leading-relaxed">{aiExplanations[currentQ.id]}</div>
                </div>
              ) : (
                <div className="mt-2 flex justify-start">
                  <button
                    onClick={() => handleRequestAiExplain(currentQ, selectedOption)}
                    disabled={loadingAiId === currentQ.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer"
                  >
                    {loadingAiId === currentQ.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    Hỏi thêm AI Sensei
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                {onSelectKanji && currentQ.kanji && (
                  <button
                    onClick={() => onSelectKanji(currentQ.kanji)}
                    className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Xem chi tiết chữ 【{currentQ.kanji}】
                  </button>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all ml-auto cursor-pointer active:scale-95"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

