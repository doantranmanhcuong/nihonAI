'use client';

import React, { useMemo } from 'react';
import { ReadingSentence } from './reading.types';
import { parseSentenceTokens, TokenChunk } from './moraUtils';

interface DokkaiKaraokeSentenceProps {
  sentence: ReadingSentence;
  sentenceIndex: number;
  isActive: boolean;
  isPlaying: boolean;
  activeCharIndex: number; // Ký tự Web Speech đang phát âm (-1 nếu không phát)
  sentenceProgress: number; // Fallback ratio 0.0 -> 1.0
  furiganaMode: 'ALL' | 'HARD' | 'NONE';
  jlptHeatmap: boolean;
  showTranslation?: boolean;
  highlightedKeyword?: string | null;
  isGrammarTarget?: boolean;
  vocabularies?: Array<{ word: string; reading?: string; meaning?: string; meaningVi?: string; pos?: string; level?: string }>;
  onSentenceDoubleClick: (index: number) => void;
  onWordClick: (e: React.MouseEvent, word: string) => void;
}

const DokkaiKaraokeSentenceBase: React.FC<DokkaiKaraokeSentenceProps> = ({
  sentence,
  sentenceIndex,
  isActive,
  isPlaying,
  activeCharIndex,
  sentenceProgress,
  furiganaMode,
  jlptHeatmap,
  showTranslation = false,
  highlightedKeyword,
  isGrammarTarget = false,
  vocabularies = [],
  onSentenceDoubleClick,
  onWordClick
}) => {
  // Phân tích câu thành các cụm từ chuẩn ngữ pháp tiếng Nhật
  const tokens = useMemo(() => {
    return parseSentenceTokens(sentence.sentenceJp, sentence.furigana, vocabularies);
  }, [sentence.sentenceJp, sentence.furigana, vocabularies]);

  const hasKeyword = highlightedKeyword && highlightedKeyword.trim() !== '' && sentence.sentenceJp.includes(highlightedKeyword);
        const isHeading = sentence.sentenceJp.length < 40 && !/[。！？]$/.test(sentence.sentenceJp.trim());
    

    // DUY NHẤT 1 TOKEN ĐƯỢC PHÉP SÁNG TẠI MỖI THỜI ĐIỂM (Không nhảy loạn, không giật ngược lại)
    const activeTokenIndex = useMemo(() => {
      if (!isActive || !isPlaying) return -1;
      if (tokens.length === 0) return -1;

      let candidateIdx = -1;

      // Ưu tiên 1: Theo vị trí ký tự chính xác từ Web Speech boundary hoặc nội suy ticker
      if (activeCharIndex >= 0) {
        const idx = tokens.findIndex(
          (t) => activeCharIndex >= t.charStart && activeCharIndex < t.charEnd
        );
        if (idx !== -1) {
          candidateIdx = idx;
        } else if (activeCharIndex >= tokens[tokens.length - 1].charStart) {
          candidateIdx = tokens.length - 1;
        }
      }

      // Ưu tiên 2: Fallback theo tiến độ thời gian (tỉ lệ mora-ratio)
      if (candidateIdx === -1 && sentenceProgress >= 0) {
        const idx = tokens.findIndex(
          (t) => sentenceProgress >= t.startRatio && sentenceProgress < t.endRatio
        );
        if (idx !== -1) {
          candidateIdx = idx;
        } else if (sentenceProgress >= 0.75) {
          candidateIdx = tokens.length - 1;
        } else {
          candidateIdx = 0;
        }
      }

      if (candidateIdx === -1) candidateIdx = 0;

      // Nếu rơi vào dấu câu cô lập, lùi về từ vựng phía trước (hoặc tiến lên nếu ở đầu) để từ vựng luôn sáng rõ
      while (
        candidateIdx > 0 &&
        tokens[candidateIdx] &&
        /^[\s、。！？「」『』…\-,.]+$/.test(tokens[candidateIdx].baseText)
      ) {
        candidateIdx--;
      }

      return candidateIdx;
    }, [isActive, isPlaying, activeCharIndex, sentenceProgress, tokens]);

    return (
      <span
        id={`dokkai-sentence-${sentenceIndex}`}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onSentenceDoubleClick(sentenceIndex);
        }}
        className={`rounded-xl px-2 py-1.5 leading-loose select-text block w-full transition-all ${isHeading ? 'text-[1.1em] font-black text-slate-800 border-l-4 border-indigo-500 pl-3 my-4' : 'text-slate-700 font-medium my-2'} ${
          isGrammarTarget
            ? 'bg-amber-100/90 text-slate-950 ring-2 ring-amber-400 shadow-xs'
            : isActive && isPlaying ? 'bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-200 shadow-xs transition-colors' : 'hover:bg-slate-50/80'
        } ${hasKeyword ? 'ring-1 ring-amber-300 bg-amber-50' : ''}`}
        title="Nhấp đúp (Double-click) để nghe phát âm câu này"
      >
        {tokens.map((token, tIdx) => {
          const isCurrentToken = false; // Disabled token-level highlight

          // ZERO-LAYOUT-SHIFT STYLING:
          // Tuyệt đối KHÔNG thay đổi padding ngang (px) và KHÔNG thay đổi font-weight giữa 2 trạng thái
          // để văn bản không bị thụt thò hay nhảy chữ ("nhảy chữ liên tục") khi phát âm
          let tokenStyle = 'text-slate-800 hover:text-blue-600';
          let rtColor = 'text-slate-500 font-normal';

          if (isCurrentToken) {
            // Chữ đang đọc: nền xanh, chữ trắng, ZERO horizontal padding, font-weight giữ nguyên
            tokenStyle = 'bg-blue-600 text-white rounded-xs [box-decoration-break:clone] [-webkit-box-decoration-break:clone]';
            // Furigana: giữ font-normal để không làm phình to thẻ ruby
            rtColor = 'text-blue-900 font-normal';
          } else if (isActive && isPlaying) {
            tokenStyle = 'text-slate-900';
            rtColor = 'text-slate-500 font-normal';
          }

          // Cụm gạch chân 【下線】 của đề thi JLPT
          const underlineClass = token.isUnderlined
            ? 'underline decoration-blue-600 decoration-2 font-bold'
            : '';

          const handleWordItemClick = (e: React.MouseEvent) => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;

            let cleanWord = token.keyword?.word || token.baseText;
            cleanWord = cleanWord.replace(/[、。！？「」『』…\-,.\s]+$/, '');
            if (!token.keyword) {
              // Tách bỏ trợ từ đuôi (Bunsetsu grouping) để tra từ điển chính xác
              cleanWord = cleanWord.replace(
                /(などの|などに|としても|として|からは|までは|では|には|との|での|より|から|まで|だけ|ほど|ばかり|など|[はがをにへとでのもやねよ])$/,
                ''
              );
              cleanWord = cleanWord.replace(/[、。！？「」『』…\-,.\s]+$/, '');
              if (!cleanWord) cleanWord = token.baseText;
            }
            onWordClick(e, cleanWord);
          };

          // JLPT Heatmap Coloring
          let heatmapClass = '';
          if (jlptHeatmap && token.keyword?.level && !isCurrentToken) {
            const lvl = token.keyword.level.toUpperCase();
            if (lvl === 'N1') heatmapClass = 'text-rose-600 bg-rose-50/50 underline decoration-rose-300 decoration-wavy';
            else if (lvl === 'N2') heatmapClass = 'text-orange-600 bg-orange-50/50 underline decoration-orange-300 decoration-wavy';
            else if (lvl === 'N3') heatmapClass = 'text-green-600 bg-green-50/50 underline decoration-green-300 decoration-wavy';
            else if (lvl === 'N4' || lvl === 'N5') heatmapClass = 'text-sky-600 bg-sky-50/50 underline decoration-sky-300 decoration-wavy';
          }
          
          if (heatmapClass) {
            tokenStyle = heatmapClass;
          }

          // Smart Furigana Logic
          let hasRuby = false;
          if (token.rtText && furiganaMode !== 'NONE') {
            if (furiganaMode === 'ALL') {
              hasRuby = true;
            } else if (furiganaMode === 'HARD') {
              const lvl = token.keyword?.level?.toUpperCase();
              // Chỉ hiện Furigana cho từ N1, N2 hoặc từ không có level rõ ràng
              hasRuby = (lvl === 'N1' || lvl === 'N2' || !lvl);
            }
          }

          if (hasRuby) {
            const hasOkurigana =
              token.rubyParts &&
              token.rubyParts.length > 1 &&
              token.rubyParts.some((p) => !p.rt);

            return (
              <ruby
                key={token.id || tIdx}
                onClick={handleWordItemClick}
                className={`${tokenStyle} ${underlineClass} cursor-pointer select-text`}
                style={{
                  display: 'inline-ruby',
                  rubyPosition: 'over',
                  rubyAlign: 'center'
                }}
              >
                {hasOkurigana ? (
                  token.rubyParts.map((part, pIdx) => {
                    if (part.rt) {
                      return (
                        <React.Fragment key={pIdx}>
                          {part.base}
                          <rp>(</rp>
                          <rt
                            className={`text-[9.5px] ${rtColor} select-none leading-none`}
                            style={{
                              display: 'ruby-text',
                              rubyAlign: 'center',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {part.rt}
                          </rt>
                          <rp>)</rp>
                        </React.Fragment>
                      );
                    }
                    return <span key={pIdx}>{part.base}</span>;
                  })
                ) : (
                  <>
                    {token.baseText}
                    <rp>(</rp>
                    <rt
                      className={`text-[9.5px] ${rtColor} select-none leading-none`}
                      style={{
                        display: 'ruby-text',
                        rubyAlign: 'center',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {token.rtText}
                    </rt>
                    <rp>)</rp>
                  </>
                )}
              </ruby>
            );
          }

          return (
            <span
              key={token.id || tIdx}
              onClick={handleWordItemClick}
              className={`${tokenStyle} ${underlineClass} cursor-pointer select-text`}
            >
              {token.baseText}
            </span>
          );
        })}

        {/* Bản dịch trực tiếp ngay dưới câu khi người dùng bật [Bản dịch] */}
        {showTranslation && sentence.sentenceVi && (
          <span className="block font-sans text-xs text-blue-900 font-normal leading-relaxed my-2 indent-0 bg-blue-50/80 p-2.5 rounded-xl border-l-2 border-blue-500 select-text">
            {sentence.sentenceVi}
          </span>
        )}
      </span>
    );
  };

export const DokkaiKaraokeSentence = React.memo(
  DokkaiKaraokeSentenceBase,
  (prev, next) => {
    // Tối ưu Memoization: Không re-render các câu không liên quan khi đang phát âm
    if (prev.isActive !== next.isActive) return false;
    if (prev.isPlaying !== next.isPlaying) return false;
    if (next.isActive && prev.activeCharIndex !== next.activeCharIndex) return false;
    if (prev.furiganaMode !== next.furiganaMode || prev.jlptHeatmap !== next.jlptHeatmap) return false;
    if (prev.showTranslation !== next.showTranslation) return false;
    if (prev.highlightedKeyword !== next.highlightedKeyword) return false;
    if (prev.isGrammarTarget !== next.isGrammarTarget) return false;
    if (prev.sentence.id !== next.sentence.id) return false;
    return true;
  }
);
