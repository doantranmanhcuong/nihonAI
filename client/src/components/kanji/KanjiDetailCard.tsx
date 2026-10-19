'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Star, Eye, Lock, Unlock, BookOpen, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { PhoneticShiftModal } from './PhoneticShiftModal';
import { useAuth } from '@/context/AuthContext';
import { apiGateway } from '@/services/api-gateway.client';

export interface KanjiDetailData {
  character: string;
  hanViet: string;
  meaningVi: string;
  jlptLevel: string;
  levelTag?: string;
  curriculum?: string;
  lesson?: number;
  lessonTitle?: string;
  strokeCount: number;
  kunyomi: string;
  onyomi: string;
  radicals: { symbol: string; name: string }[];
  mnemonic?: string;
  lookAndLearnTip?: string;
  phoneticRule?: string;
  exampleWords?: any[];
  minaVocabularies?: any[];
}

export interface KanjiDetailCardProps {
  data: KanjiDetailData;
  onViewStrokes?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (char: string, hanViet: string, meaning: string) => void;
}

interface AiInsightData {
  mnemonicStory: string;
  radicalBreakdown?: { symbol: string; meaning: string }[];
  culturalContext?: string;
  confusionWarning?: string;
  generatedByModel?: string;
  isCached?: boolean;
}

export const KanjiDetailCard: React.FC<KanjiDetailCardProps> = ({ data, onViewStrokes, isBookmarked = false, onToggleBookmark }) => {
  
  const [showMnemonic, setShowMnemonic] = useState(true);
  const [isPhoneticModalOpen, setIsPhoneticModalOpen] = useState(false);

  // Trạng thái AI Mnemonic Insight
  const [aiInsight, setAiInsight] = useState<AiInsightData | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Tự động tải mẹo nhớ từ Cache / MySQL (0 token) khi xem chữ Hán
  useEffect(() => {
    let isMounted = true;
    const loadAiInsight = async () => {
      try {
        setIsLoadingAi(true);
        setAiError(null);
        const res = await apiGateway.kanji.getAiInsight(data.character);
        if (isMounted && res && res.data) {
          setAiInsight(res.data);
        }
      } catch (err: any) {
        if (isMounted) {
          // Fallback về mẹo cơ bản có sẵn trong data nếu AI tạm gián đoạn
          setAiInsight({
            mnemonicStory: data.lookAndLearnTip || data.mnemonic || `Chữ ${data.character} (${data.hanViet}) nghĩa là: ${data.meaningVi}.`,
            radicalBreakdown: data.radicals.map(r => ({ symbol: r.symbol, meaning: r.name }))
          });
        }
      } finally {
        if (isMounted) setIsLoadingAi(false);
      }
    };

    loadAiInsight();
    return () => {
      isMounted = false;
    };
  }, [data.character, data.hanViet, data.meaningVi, data.mnemonic, data.lookAndLearnTip, data.radicals]);

  // Yêu cầu AI sáng tạo lại câu chuyện chiết tự (On-Demand Regeneration)
  const handleRegenerateAi = async () => {
    try {
      setIsLoadingAi(true);
      setAiError(null);
      const res = await apiGateway.kanji.generateAiMnemonic(data.character);
      if (res && res.data) {
        setAiInsight(res.data);
      }
    } catch (err: any) {
      setAiError('Không thể tạo lại mẹo nhớ lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleViewStrokesClick = () => {
    if (onViewStrokes) onViewStrokes();
  };

  const handlePhoneticClick = () => {
    setIsPhoneticModalOpen(true);
  };

  const speakReading = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full flex flex-col gap-5 relative">
      {/* Hàng Tiêu đề trên cùng */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleBookmark && onToggleBookmark(data.character, data.hanViet || '', data.meaningVi || '')}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-500'
                : 'border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
            }`}
          >
            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
          <span className="text-xs text-slate-400 font-medium">Chi tiết Hán tự</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePhoneticClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200/80 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Quy tắc chuyển âm</span>
          </button>

          <button
            onClick={handleViewStrokesClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tập viết ({data.strokeCount} nét)</span>
          </button>
        </div>
      </div>

      {/* Chữ Hán to bản & Âm Hán Việt */}
      <div className="flex items-center gap-6 py-2">
        <div className="w-24 h-24 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center text-6xl font-black text-slate-900 shadow-inner">
          {data.character}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-sky-700 tracking-wide">{data.hanViet}</span>
            {data.curriculum && (
              <span className="text-[10px] px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 font-bold rounded-full">
                {data.curriculum.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-slate-600">{data.meaningVi}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-md">
              {data.levelTag || data.jlptLevel}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-md">
              {data.strokeCount} nét vẽ
            </span>
            {data.lesson && (
              <span className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium">
                {(() => {
                  if (data.lessonTitle && data.lessonTitle.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(data.lessonTitle);
                      const curKey = data.curriculum ? data.curriculum.split(',')[0].trim().toUpperCase() : '';
                      if (curKey && parsed[curKey]) {
                        return parsed[curKey].title || `Bài ${parsed[curKey].lesson || data.lesson}`;
                      }
                      const firstVal = Object.values(parsed)[0] as any;
                      if (firstVal && (firstVal.title || firstVal.lesson)) {
                        return firstVal.title || `Bài ${firstVal.lesson || data.lesson}`;
                      }
                    } catch (e) {}
                  }
                  return data.lessonTitle || `Bài ${data.lesson}`;
                })()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Box Quy tắc chuyển âm Hán Việt nếu có */}
      {data.phoneticRule && (
        <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl text-xs flex items-start gap-2 text-sky-900">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sky-800">Quy tắc chuyển âm Hán Việt:</strong>{' '}
            <span className="font-medium">{data.phoneticRule}</span>
          </div>
        </div>
      )}

      {/* Danh sách thông số chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium min-w-[90px]">Ý nghĩa:</span>
          <span className="text-sky-600 font-bold text-base">{data.meaningVi}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium min-w-[90px]">Trình độ JLPT:</span>
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-xs">
            {data.levelTag || data.jlptLevel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium min-w-[90px]">Số nét:</span>
          <span className="text-blue-600 font-bold">{data.strokeCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium min-w-[90px]">Âm Kun:</span>
          <span
            onClick={() => speakReading(data.kunyomi)}
            className="text-sky-600 font-bold cursor-pointer hover:underline flex items-center gap-1"
          >
            {data.kunyomi}
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium min-w-[90px]">Âm On:</span>
          <span
            onClick={() => speakReading(data.onyomi)}
            className="text-sky-600 font-bold cursor-pointer hover:underline flex items-center gap-1"
          >
            {data.onyomi}
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium min-w-[90px]">Cấu tạo bộ thủ:</span>
          <span className="text-sky-600 font-bold tracking-widest text-base">
            {data.radicals.map(r => r.symbol).join(' ')}
          </span>
        </div>
      </div>

      {/* VÍ DỤ TỪ GHÉP ĐƠN GIẢN THƯỜNG GẶP (SIMPLE VOCABULARY EXAMPLES) */}
      {((data.exampleWords && data.exampleWords.length > 0) || (data.minaVocabularies && data.minaVocabularies.length > 0)) && (
        <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ví dụ từ vựng thường gặp</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              Bấm loa để nghe phát âm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {((data.exampleWords && data.exampleWords.length > 0) ? data.exampleWords : data.minaVocabularies || []).slice(0, 6).map((ex: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition-all flex flex-col gap-1.5 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-japanese font-black text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {ex.word}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({ex.reading})
                    </span>
                  </div>

                  <button
                    onClick={() => speakReading(ex.reading || ex.word)}
                    className="p-1 hover:bg-white text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                    title="Phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {ex.hanViet && (
                    <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200/60 text-[10px]">
                      {ex.hanViet}
                    </span>
                  )}
                  <span className="text-slate-700 font-semibold truncate">
                    {ex.meaningVi || ex.meaning}
                  </span>
                </div>

                {ex.exampleJp && (
                  <div className="pt-1.5 mt-0.5 border-t border-slate-200/50 text-[11px] text-slate-600">
                    <div className="font-japanese text-slate-800 font-medium">{ex.exampleJp}</div>
                    {ex.exampleVi && <div className="text-slate-500 text-[10px] mt-0.5">{ex.exampleVi}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDIO AI SENSEI: MẸO NHỚ CHIẾT TỰ ĐỘC QUYỀN (GEMINI 3.6 FLASH) */}
      <div className="mt-2 p-5 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 rounded-2xl border border-indigo-100/90 shadow-2xs flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-indigo-100/70 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                AI Sensei • Mẹo Nhớ Chiết Tự
                {aiInsight?.isCached && (
                  <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Đã lưu CSDL
                  </span>
                )}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRegenerateAi}
              disabled={isLoadingAi}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95"
              title="Nhờ AI sáng tạo câu chuyện chiết tự mới"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingAi ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Sáng tạo lại</span>
            </button>

            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              {showMnemonic ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showMnemonic && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            {isLoadingAi ? (
              <div className="p-6 flex flex-col items-center justify-center gap-2 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold text-indigo-800">
                  AI Sensei đang phân tích các bộ thủ và dệt nên câu chuyện ghi nhớ...
                </span>
              </div>
            ) : aiError ? (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{aiError}</span>
              </div>
            ) : (
              <>
                {/* Câu chuyện chiết tự hình tượng */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <p className="text-slate-800 text-sm leading-relaxed font-semibold">
                    💡 "{aiInsight?.mnemonicStory || data.mnemonic || 'Đang cập nhật câu chuyện...'}"
                  </p>
                </div>

                {/* Các mảnh ghép bộ thủ (Radical Breakdown Chips) */}
                {aiInsight?.radicalBreakdown && aiInsight.radicalBreakdown.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-slate-500">Mảnh ghép:</span>
                    {aiInsight.radicalBreakdown.map((r, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50/80 border border-indigo-200/80 rounded-lg text-xs"
                      >
                        <span className="font-black text-indigo-700 text-sm">{r.symbol}</span>
                        <span className="text-slate-600 font-medium text-[11px]">{r.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cảnh báo tránh nhầm lẫn */}
                {aiInsight?.confusionWarning && (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 font-medium flex items-center gap-2">
                    <span className="font-bold text-amber-700 shrink-0">⚠️ Lưu ý thi JLPT:</span>
                    <span>{aiInsight.confusionWarning}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal Quy tắc chuyển âm */}
      <PhoneticShiftModal
        isOpen={isPhoneticModalOpen}
        onClose={() => setIsPhoneticModalOpen(false)}
        character={data.character}
        hanViet={data.hanViet}
        onyomi={data.onyomi}
      />
    </div>
  );
};
