'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Send,
  Loader2,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGateway } from '@/services/api-gateway.client';
import { NotebookApi } from '../personal/notebook.api';


export interface ConstituentKanji {
  character: string;
  hanViet: string;
  meaningVi: string;
  strokeCount: number;
  jlptLevel: string;
}

export interface VocabularyDetailData {
  id: string;
  word: string;
  reading: string;
  romaji?: string | null;
  hanViet?: string | null;
  meaningVi: string;
  jlptLevel: string;
  lesson?: number | null;
  partOfSpeech?: string | null;
  pitchAccent?: string | null;
  exampleJp?: string | null;
  exampleVi?: string | null;
  constituentKanjis?: ConstituentKanji[];
}

export interface VocabScenario {
  tag: string;
  contextVi: string;
  sentenceJp: string;
  sentenceVi: string;
  furigana?: string;
}

export interface VocabCollocation {
  phraseJp: string;
  meaningVi: string;
}

export interface VocabAiInsightData {
  id?: string;
  vocabId: string;
  word: string;
  reading: string;
  meaningVi: string;
  scenarios: VocabScenario[];
  collocations: VocabCollocation[];
  mistakeWarning?: string;
  nuanceNote?: string;
  generatedByModel: string;
  isCached: boolean;
}

export interface SentenceDiagnosisData {
  score: number;
  isCorrect: boolean;
  particleFeedback: string;
  naturalCorrection: string;
  explanationVi: string;
}

interface VocabDetailCardProps {
  data: VocabularyDetailData;
  onNavigateToKanji?: (character: string) => void;
}

export const VocabDetailCard: React.FC<VocabDetailCardProps> = ({
  data,
  onNavigateToKanji
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  // AI Insights State
  const [aiInsight, setAiInsight] = useState<VocabAiInsightData | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Sentence Challenge State
  const [userSentence, setUserSentence] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<SentenceDiagnosisData | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [activeAiTab, setActiveAiTab] = useState<'scenarios' | 'challenge'>('scenarios');

  const isLockedForGuest = !isAuthenticated && data.jlptLevel !== 'N5';

  // Tự động tải AI Insight từ MySQL / Redis (0 token) khi xem chi tiết từ
  useEffect(() => {
    let isMounted = true;
    const loadAiInsight = async () => {
      try {
        setIsLoadingAi(true);
        setAiError(null);
        setDiagnosisResult(null);
        setUserSentence('');
        const res = await apiGateway.vocab.getAiInsight(data.id);
        if (isMounted && res && res.data) {
          setAiInsight(res.data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Lỗi khi tải AI Insight từ vựng:', err);
          setAiError('Chưa tải được phân tích AI. Bạn có thể nhấn thử lại bên dưới.');
        }
      } finally {
        if (isMounted) setIsLoadingAi(false);
      }
    };

    if (data.id) {
      loadAiInsight();
    }
    return () => {
      isMounted = false;
    };
  }, [data.id]);

  // Yêu cầu AI phân tích lại ngữ cảnh (On-Demand Regeneration)
  const handleRegenerateAi = async () => {
    try {
      setIsLoadingAi(true);
      setAiError(null);
      const res = await apiGateway.vocab.regenerateAiInsight(data.id);
      if (res && res.data) {
        setAiInsight(res.data);
      }
    } catch (err: any) {
      setAiError('Không thể làm mới phân tích lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Gửi câu học viên tự đặt lên cho AI Sensei chấm điểm
  const handleDiagnoseSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSentence.trim()) return;

    try {
      setIsDiagnosing(true);
      setDiagnosisError(null);
      const res = await apiGateway.vocab.diagnoseSentence(data.id, userSentence.trim());
      if (res && res.data) {
        setDiagnosisResult(res.data);
      }
    } catch (err: any) {
      setDiagnosisError(err.message || 'Lỗi khi AI chấm câu. Vui lòng thử lại.');
    } finally {
      setIsDiagnosing(false);
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

  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) {
      setIsSaved(false);
      return;
    }
    NotebookApi.getItems({ itemType: 'VOCAB', search: data.word })
      .then(items => {
        setIsSaved(items.some(i => i.title === data.word)); // Explicitly set true/false
      })
      .catch(console.warn);
  }, [isAuthenticated, data.word]);

  const handleSaveDeck = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (isSaving || isSaved) return; // For now, only support saving, not unsaving without ID
    try {
      setIsSaving(true);
      await NotebookApi.createItem({
        itemType: 'VOCAB',
        title: data.word,
        reading: data.reading || '',
        meaningVi: data.meaningVi,
        level: data.jlptLevel || 'N5',
        tags: data.partOfSpeech || ''
      });
      setIsSaved(true);
      alert('Đã lưu vào Sổ tay thành công!');
    } catch (e) {
      console.error(e);
      alert('Lỗi lưu sổ tay');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-5 w-full relative">
      {/* Banner Khóa N4-N1 nếu chưa đăng nhập */}
      {isLockedForGuest && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Từ vựng cấp độ <strong className="font-bold text-amber-700">{data.jlptLevel}</strong> yêu cầu đăng nhập để mở khóa đầy đủ trọng âm, chiết tự Hán tự và ví dụ!
            </span>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-2xs transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Hàng Tiêu đề Từ vựng & Phát âm */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1.5">
          {/* Cách đọc Hiragana / Romaji */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="text-indigo-600 text-sm font-extrabold">{data.reading}</span>
            {data.romaji && <span>• {data.romaji}</span>}
          </div>

          {/* Từ gốc lớn */}
          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {data.word}
            </h2>
            {data.hanViet && (
              <span className="text-xl font-bold text-slate-500">
                [ {data.hanViet} ]
              </span>
            )}
          </div>
        </div>

        {/* Cụm nút Hành động: Nghe & Lưu thẻ */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => speakText(data.word)}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl transition-all cursor-pointer shadow-2xs hover:scale-105"
            title="Phát âm từ vựng"
          >
            <Volume2 className="w-6 h-6" />
          </button>

          <button
            onClick={handleSaveDeck}
            className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
              isSaved
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title="Lưu vào Flashcard"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Các Tag phân loại (JLPT, Bài Minna, Từ loại) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-extrabold shadow-2xs">
          {data.jlptLevel}
        </span>
        {data.lesson && (
          <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold">
            Minna Bài {data.lesson}
          </span>
        )}
        {data.partOfSpeech && (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
            {data.partOfSpeech}
          </span>
        )}
      </div>

      {/* Nghĩa Tiếng Việt Chi Tiết */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Ý nghĩa Tiếng Việt
        </p>
        <p className="text-base font-bold text-slate-900 leading-relaxed">
          {data.meaningVi}
        </p>
      </div>

      {/* Trọng Âm Pitch Accent (Chuẩn NHK) */}
      {data.pitchAccent && (
        <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/70 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-orange-800 uppercase tracking-wider">
              Trọng âm Pitch Accent (Chuẩn NHK)
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full font-bold">
              Vạch cao độ
            </span>
          </div>
          <div className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span className="text-orange-600 font-mono text-base">{data.pitchAccent}</span>
            <span className="text-xs text-slate-500 font-normal">
              (Âm trong ngoặc vuông phát âm ở cao độ cao hơn)
            </span>
          </div>
        </div>
      )}

      {/* Chiết Tự Hán Tự Cấu Thành (Cross-Module Synergy) */}
      {data.constituentKanjis && data.constituentKanjis.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Chữ Hán cấu thành ({data.constituentKanjis.length} chữ)
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold">
              Bấm vào để xem nét vẽ & bộ thủ →
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.constituentKanjis.map((kanji) => (
              <div
                key={kanji.character}
                onClick={() => onNavigateToKanji && onNavigateToKanji(kanji.character)}
                className="p-3 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {kanji.character}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">{kanji.hanViet}</span>
                      <span className="text-[9px] px-1 bg-slate-100 text-slate-600 rounded font-bold">
                        {kanji.jlptLevel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                      {kanji.meaningVi}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================== STUDIO AI SENSEI: NGỮ CẢNH ĐA CHIỀU & CHẤM CÂU ================== */}
      <div className="mt-1 p-5 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 rounded-3xl border border-indigo-100/90 shadow-2xs flex flex-col gap-4">
        {/* Header Phân Hệ AI */}
        <div className="flex items-center justify-between border-b border-indigo-100/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                AI Sensei • Đa Ngữ Cảnh & Chấm Câu
                {aiInsight?.isCached && (
                  <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Đã lưu CSDL
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Khám phá cách dùng bản xứ và kiểm tra câu bạn tự đặt
              </p>
            </div>
          </div>

          <button
            onClick={handleRegenerateAi}
            disabled={isLoadingAi}
            className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95"
            title="Nhờ AI phân tích lại ngữ cảnh mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Làm mới AI</span>
          </button>
        </div>

        {/* Tab chuyển đổi giữa "3 Tình huống thực tế" và "Thử thách đặt câu" */}
        <div className="flex items-center gap-2 p-1 bg-indigo-100/50 rounded-xl">
          <button
            onClick={() => setActiveAiTab('scenarios')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeAiTab === 'scenarios'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3 Tình huống thực tế</span>
          </button>

          <button
            onClick={() => setActiveAiTab('challenge')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeAiTab === 'challenge'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Thử thách đặt câu (AI Chấm)</span>
          </button>
        </div>

        {/* TAB 1: 3 TÌNH HUỐNG THỰC TẾ (MULTI-CONTEXT SCENARIOS) */}
        {activeAiTab === 'scenarios' && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            {isLoadingAi ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold text-indigo-800">
                  AI Sensei đang phân tích 3 ngữ cảnh thực tế cho từ "{data.word}"...
                </span>
              </div>
            ) : aiError ? (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{aiError}</span>
              </div>
            ) : (
              <>
                {/* Danh sách 3 Thẻ Ngữ Cảnh */}
                <div className="flex flex-col gap-2.5">
                  {aiInsight?.scenarios && aiInsight.scenarios.length > 0 ? (
                    aiInsight.scenarios.map((sc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white rounded-2xl border border-indigo-100/90 shadow-2xs flex flex-col gap-1.5 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/70">
                              {sc.tag}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {sc.contextVi}
                            </span>
                          </div>
                          <button
                            onClick={() => speakText(sc.sentenceJp)}
                            className="text-indigo-600 hover:text-indigo-800 p-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Nghe phát âm câu ví dụ"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-slate-900 leading-snug">
                          {sc.sentenceJp}
                        </p>
                        <p className="text-xs text-slate-600 font-medium italic">
                          → {sc.sentenceVi}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-white rounded-2xl border border-indigo-100 text-xs text-slate-500">
                      Chưa có ngữ cảnh, hãy nhấn "Làm mới AI" để tạo.
                    </div>
                  )}
                </div>

                {/* Cụm từ hay đi kèm (Collocations) */}
                {aiInsight?.collocations && aiInsight.collocations.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Cụm từ đi kèm tự nhiên (Collocations):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {aiInsight.collocations.map((col, cIdx) => (
                        <div
                          key={cIdx}
                          onClick={() => speakText(col.phraseJp)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-300 rounded-xl text-xs cursor-pointer shadow-2xs transition-all"
                          title="Bấm để nghe phát âm"
                        >
                          <span className="font-extrabold text-indigo-700">{col.phraseJp}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">{col.meaningVi}</span>
                          <Volume2 className="w-3 h-3 text-indigo-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cảnh báo lỗi người Việt hay mắc (Mistake Warning) */}
                {aiInsight?.mistakeWarning && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-950 font-medium flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-800">Lưu ý tránh nhầm lẫn: </span>
                      <span>{aiInsight.mistakeWarning}</span>
                    </div>
                  </div>
                )}

                {/* Sắc thái phân biệt từ đồng nghĩa (Nuance Note) */}
                {aiInsight?.nuanceNote && (
                  <div className="p-3 bg-sky-50/80 border border-sky-200/80 rounded-2xl text-xs text-sky-950 font-medium flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sky-800">Sắc thái ngôn từ: </span>
                      <span>{aiInsight.nuanceNote}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: THỬ THÁCH ĐẶT CÂU & AI CHẤM CHỮA (ACTIVE RECALL) */}
        {activeAiTab === 'challenge' && (
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
            <div className="p-3 bg-white rounded-2xl border border-indigo-100 flex flex-col gap-1 text-xs">
              <span className="font-bold text-indigo-900">
                🎯 Thử thách: Tự đặt một câu tiếng Nhật sử dụng từ "{data.word}" ({data.reading})
              </span>
              <span className="text-slate-500">
                AI Sensei sẽ chấm điểm, phát hiện lỗi trợ từ và gợi ý cách diễn đạt tự nhiên chuẩn bản xứ.
              </span>
            </div>

            <form onSubmit={handleDiagnoseSentence} className="flex flex-col gap-2.5">
              <div className="relative">
                <textarea
                  rows={2}
                  value={userSentence}
                  onChange={(e) => setUserSentence(e.target.value)}
                  placeholder={`Nhập câu tiếng Nhật của bạn vào đây... (Ví dụ: 毎朝${data.word}...)`}
                  className="w-full p-3 text-sm font-medium border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Tip: Bạn có thể gõ Romaji hoặc bộ gõ tiếng Nhật.
                </span>
                <button
                  type="submit"
                  disabled={isDiagnosing || !userSentence.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  {isDiagnosing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Sensei đang chấm...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi AI Chấm</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {diagnosisError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{diagnosisError}</span>
              </div>
            )}

            {/* KẾT QUẢ CHẨN ĐOÁN CỦA AI SENSEI */}
            {diagnosisResult && (
              <div className="p-4 bg-white rounded-2xl border border-indigo-200 shadow-2xs flex flex-col gap-3 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        diagnosisResult.score >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : diagnosisResult.score >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Điểm: {diagnosisResult.score}/100
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {diagnosisResult.isCorrect ? '✅ Ngữ pháp chính xác' : '⚠️ Cần điều chỉnh'}
                    </span>
                  </div>
                </div>

                {/* Nhận xét trợ từ */}
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">
                    Nhận xét trợ từ:
                  </span>
                  <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {diagnosisResult.particleFeedback}
                  </p>
                </div>

                {/* Gợi ý câu tự nhiên chuẩn bản xứ */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 uppercase tracking-wider">
                      Cách viết tự nhiên chuẩn bản xứ:
                    </span>
                    <button
                      onClick={() => speakText(diagnosisResult.naturalCorrection)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe</span>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                    {diagnosisResult.naturalCorrection}
                  </p>
                </div>

                {/* Lời khuyên của Sensei */}
                <div className="text-xs text-slate-600 italic">
                  💡 <span className="font-semibold">Lời khuyên:</span> {diagnosisResult.explanationVi}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
