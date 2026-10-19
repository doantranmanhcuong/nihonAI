
"use client";

import React from "react";
import { TokenChunk } from "./moraUtils";

interface ShadowingKaraokeDisplayProps {
  currentSentenceIdx: number;
  totalSentences: number;
  currentSentence: {
    id: string;
    sentenceJp: string;
    sentenceVi: string;
    furigana?: string;
    romaji?: string;
    startTimeMs: number;
    endTimeMs: number;
  } | null;
  currentTokens: TokenChunk[];
  currentProgress: number;
  isPlaying: boolean;
  isIntroPlaying: boolean;
  showFurigana: boolean;
  showTranslation: boolean;
  liveTranslation?: string;
  timeToIntroEndSec?: number;
  showRomaji?: boolean;
  selectedToken?: any;
  onSelectToken?: (token: any) => void;
  onSpeakWord?: (word: string) => void;
  onSpeakSentence?: (text: string) => void;
  isRecording?: boolean;
  recordDuration?: number;
  recordedAudioUrl?: string | null;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onReplayCurrent?: () => void;
  isSentenceCompleted?: boolean;
  onContinuePlayback?: () => void;
}

export const ShadowingKaraokeDisplay: React.FC<ShadowingKaraokeDisplayProps> = ({
  currentSentence,
  currentTokens,
  currentProgress,
  isPlaying,
  isIntroPlaying,
  showFurigana,
  showTranslation,
  liveTranslation,
}) => {
  if (!currentSentence) return <div className="h-40 bg-white border border-slate-200/90 rounded-3xl animate-pulse shadow-sm" />;

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white rounded-3xl shadow-2xs border border-slate-200/90 w-full relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-32 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 pointer-events-none" />

      {/* 1. Tiếng Nhật Karaoke */}
      <div className="flex flex-wrap items-end gap-x-[1px] gap-y-4 font-japanese text-[22px] sm:text-[28px] font-black leading-tight justify-center text-center relative z-10">
        {currentTokens.map((tok, tIdx) => {
          const isPassed = currentProgress >= tok.startRatio;
          
          return (
            <div key={tIdx} className="flex flex-col items-center justify-end">
              {/* Furigana */}
              {showFurigana && (
                <div className="flex items-end justify-center min-h-[20px] mb-1">
                  {tok.rubyParts.map((rp, rpIdx) => (
                    <span 
                      key={rpIdx} 
                      className={`text-[12px] font-bold tracking-wide ${isPassed ? "text-emerald-700" : "text-slate-400"}`}
                    >
                      {rp.rt || " "}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Chữ Hán/Kana - Xanh lá khi đọc, xám đậm khi chưa đọc */}
              <span className={`${isPassed ? "text-emerald-600 drop-shadow-sm" : "text-slate-800"} transition-colors duration-100`}>
                {tok.baseText}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Tiếng Việt Dịch */}
      {showTranslation && (
        <p className="text-slate-500 text-sm sm:text-[15px] text-center font-medium relative z-10 italic">
          {currentSentence.sentenceVi || liveTranslation || 'Đang dịch...'}
        </p>
      )}
    </div>
  );
};

