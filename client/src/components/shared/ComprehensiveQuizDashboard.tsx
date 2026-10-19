import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle, Award, BookOpen, Search, Shuffle } from 'lucide-react';

export interface CompQuizQuestion {
  id: string;
  question: string;
  subText?: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  itemId?: string;
}

export interface ComprehensiveQuizDashboardProps {
  title: string;
  topic: string;
  totalItems: number;
  maxQuestions: number;
  onGenerateQuestions: (count: number) => CompQuizQuestion[];
  onBack: () => void;
  onSaveBookmark?: (itemId: string) => void;
}

export const ComprehensiveQuizDashboard: React.FC<ComprehensiveQuizDashboardProps> = ({
  title,
  topic,
  totalItems,
  maxQuestions,
  onGenerateQuestions,
  onBack,
  onSaveBookmark
}) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [questionCount, setQuestionCount] = useState<number>(Math.min(50, maxQuestions));
  const [questions, setQuestions] = useState<CompQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const [userAnswers, setUserAnswers] = useState<Record<string, { isCorrect: boolean, userChoice: string }>>({});

  const handleStart = () => {
    let cnt = questionCount;
    if (cnt < 1) cnt = 1;
    if (cnt > maxQuestions) cnt = maxQuestions;
    
    const generated = onGenerateQuestions(cnt).map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }));
    setQuestions(generated);
    setCurrentIndex(0);
    setShowTranslation(false);
    setSelectedOption(null);
    setUserAnswers({});
    setPhase('playing');
  };

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    
    const isCorrect = opt === questions[currentIndex].correctAnswer;
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: { isCorrect, userChoice: opt }
    }));
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setPhase('result');
    }
  };

  if (phase === 'setup') {
    return (
      <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-sm flex flex-col gap-6 w-full max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs w-fit">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <p className="text-sm font-semibold text-slate-500">{topic}</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-slate-700">
            <span>Số lượng từ/ngữ pháp:</span>
            <span className="text-indigo-600">{totalItems} mục</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-slate-700">
            <span>Ngân hàng câu hỏi tối đa:</span>
            <span className="text-indigo-600">{maxQuestions} câu</span>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-bold text-slate-800 mb-2">Bạn muốn làm bao nhiêu câu?</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min={1} 
                max={maxQuestions}
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={maxQuestions === 0}
              />
              <span className="text-sm font-bold text-slate-500 shrink-0">/ {maxQuestions} câu</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">* Hệ thống sẽ tự động trộn ngẫu nhiên và phân bổ đều các câu hỏi.</p>
          </div>
        </div>

        <button 
          onClick={handleStart} 
          disabled={maxQuestions === 0 || questionCount <= 0}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${maxQuestions === 0 || questionCount <= 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'}`}
        >
          <Shuffle className="w-5 h-5" />
          BẮT ĐẦU LÀM BÀI
        </button>
      </div>
    );
  }

  if (phase === 'playing') {
    const q = questions[currentIndex];
    
    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm w-full max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 font-black text-xs rounded-xl border border-indigo-100">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-all ${showTranslation ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
            >
              {showTranslation ? 'Ẩn dịch' : 'Dịch'}
            </button>
            <button onClick={() => setPhase('setup')} className="text-xs font-bold text-slate-400 hover:text-slate-600">Thoát</button>
          </div>
        </div>

        <div className="text-center py-6">
          <h3 className="text-3xl font-black text-slate-900 font-japanese leading-tight">{q.question}</h3>
          {q.subText && showTranslation && <p className="text-sm font-bold text-slate-500 mt-3">{q.subText}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isCorrectOption = opt === q.correctAnswer;
            
            let btnClass = "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700";
            let Icon: any = null;
            
            if (selectedOption !== null) {
              if (isCorrectOption) {
                btnClass = "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20";
                Icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
              } else if (isSelected) {
                btnClass = "bg-rose-50 border-rose-400 text-rose-700";
                Icon = <XCircle className="w-5 h-5 text-rose-500" />;
              } else {
                btnClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
              }
            }

            return (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => handleSelectOption(opt)}
                className={`relative p-4 rounded-2xl border-2 text-left font-bold transition-all ${btnClass}`}
              >
                <span className="text-sm font-japanese block pr-8">{opt}</span>
                {Icon && <div className="absolute right-4 top-1/2 -translate-y-1/2">{Icon}</div>}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="mt-4 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl animate-in slide-in-from-bottom-2">
            <h4 className="text-xs font-black text-indigo-800 uppercase mb-2">Giải thích chi tiết</h4>
            <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap">{q.explanation}</p>
            <button onClick={handleNext} className="w-full mt-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
              {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
            </button>
          </div>
        )}
      </div>
    );
  }

  const correctCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in slide-in-from-bottom-4">
      <div className="bg-white p-8 rounded-3xl border-2 border-indigo-200 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Báo cáo kết quả ôn tập</h2>
        <p className="text-sm font-bold text-slate-500 mt-1">{title}</p>
        
        <div className="text-5xl font-black text-indigo-600 mt-6 mb-2">{correctCount} <span className="text-2xl text-slate-400">/ {questions.length}</span></div>
        <p className="text-sm font-bold text-slate-500">tỉ lệ chính xác {Math.round((correctCount / questions.length) * 100)}%</p>
        
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => setPhase('setup')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Làm bài mới
          </button>
          <button onClick={onBack} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm">
            Quay lại bài học
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-black text-slate-800 text-sm">CHI TIẾT TỪNG CÂU HỎI</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {questions.map((q, i) => {
            const ans = userAnswers[q.id];
            const isCorrect = ans?.isCorrect;
            
            return (
              <div key={q.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="font-bold text-slate-900 font-japanese text-base">{q.question}</p>
                    {!isCorrect && (
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg">Bạn chọn: {ans?.userChoice || 'Bỏ qua'}</span>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">Đáp án: {q.correctAnswer}</span>
                      </div>
                    )}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 mt-3 whitespace-pre-wrap">
                      <span className="text-indigo-600 font-bold mr-1">Giải thích:</span> 
                      {q.explanation}
                    </div>
                  </div>
                  {onSaveBookmark && q.itemId && (
                    <button 
                      onClick={() => onSaveBookmark(q.itemId!)}
                      className="shrink-0 p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Lưu vào sổ tay cá nhân"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
