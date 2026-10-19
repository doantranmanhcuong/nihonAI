'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import {
  ReadingArticle,
  ReadingSentence,
  QuickWordLookup,
  DetectedGrammar,
  ReadingGrammarItem,
  DetailedGrammarInfo
} from './reading.types';
import { ReadingApi } from './reading.api';
import { QuickLookupPopover } from './QuickLookupPopover';
import { DokkaiKaraokeSentence } from './DokkaiKaraokeSentence';
import { DokkaiAudioBar } from './DokkaiAudioBar';
import { DokkaiQuizSection } from './DokkaiQuizSection';
import { DokkaiSidebar } from './DokkaiSidebar';
import { GrammarDetailModal } from './GrammarDetailModal';
import { countMoras } from './moraUtils';

interface DokkaiStudyViewProps {
  articleId: string;
  onBack: () => void;
  onSelectArticle?: (articleId: string) => void;
}

export const DokkaiStudyView: React.FC<DokkaiStudyViewProps> = ({
  articleId,
  onBack,
  onSelectArticle
}) => {
  const [article, setArticle] = useState<ReadingArticle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Trạng thái phát âm thanh
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [autoPauseSentence, setAutoPauseSentence] = useState<boolean>(false);
  const [totalDurationSec, setTotalDurationSec] = useState<number>(220);
  const [playbackProgressSec, setPlaybackProgressSec] = useState<number>(0);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0); // Tiến độ đọc từng từ (0.0 -> 1.0)
  const [activeCharIndex, setActiveCharIndex] = useState<number>(-1); // Vị trí ký tự Web Speech đang phát âm (-1 khi rảnh)

  // Hiển thị Furigana và Bản dịch
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [furiganaMode, setFuriganaMode] = useState<'ALL' | 'HARD' | 'NONE'>('ALL');
  const [jlptHeatmap, setJlptHeatmap] = useState(false);

  // Popover tra cứu từ vựng / cụm từ
  const [lookupWord, setLookupWord] = useState<QuickWordLookup | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Highlight từ khóa khi chọn từ cột bên phải
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);

  // Quản lý Modal Cấu Trúc Ngữ Pháp & Vị trí câu đang sử dụng
  const [selectedGrammar, setSelectedGrammar] = useState<ReadingGrammarItem | null>(null);
  const [detailedGrammarInfo, setDetailedGrammarInfo] = useState<DetailedGrammarInfo | null>(null);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState<boolean>(false);
  const [isGrammarLoading, setIsGrammarLoading] = useState<boolean>(false);
  const [activeGrammarSentenceIdx, setActiveGrammarSentenceIdx] = useState<number | null>(null);

  // Danh sách bài mẫu Demo N1 - N5
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState<boolean>(false);
  const [demoArticlesList, setDemoArticlesList] = useState<ReadingArticle[]>([]);

  // Refs quản lý SpeechSynthesis & Timeline
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isRepeatRef = useRef<boolean>(isRepeat);
  const autoPauseRef = useRef<boolean>(autoPauseSentence);
  const activeSentenceIndexRef = useRef<number>(activeSentenceIndex);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  const sentencesRef = useRef<ReadingSentence[]>([]);
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTickerRef = useRef<NodeJS.Timeout | null>(null);
  const sentenceStartTimeRef = useRef<number>(0);
  const lastActiveCharIndexRef = useRef<number>(-1);
  const lastTimelineUpdateRef = useRef<number>(0);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    autoPauseRef.current = autoPauseSentence;
  }, [autoPauseSentence]);

  useEffect(() => {
    activeSentenceIndexRef.current = activeSentenceIndex;
  }, [activeSentenceIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (article?.sentences) {
      sentencesRef.current = article.sentences;

      // Tính tổng thời lượng bài đọc thực tế từ số phách âm Mora chuẩn xác
      let totalEstSec = 0;
      for (const s of article.sentences) {
        const clean = s.sentenceJp.replace(/【\/?下線】/g, '');
        const moras = countMoras(clean);
        const commas = (clean.match(/[、,]/g) || []).length;
        const periods = (clean.match(/[。!?！？]/g) || []).length;
        totalEstSec += moras / 7.2 + commas * 0.35 + periods * 0.5;
      }
      setTotalDurationSec(Math.max(10, Math.round(totalEstSec)));
    }
  }, [article]);

  

  // Tính bản đồ thời gian cho từng câu trong bài đọc
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const sentenceTimeline = useMemo(() => {
      const sents = article?.sentences || [];
      if (sents.length === 0) return [];
  
      const totalChars = sents.reduce(
        (acc, s) => acc + s.sentenceJp.replace(/[\s　]/g, '').length,
        0
      );
  
      let accumulatedSec = 0;
      return sents.map((s) => {
        const cleanLen = s.sentenceJp.replace(/[\s　]/g, '').length;
        
        // Use exact VTT timings if available!
        if (s.startTimeMs !== undefined && s.endTimeMs !== undefined && s.endTimeMs > 0) {
            return {
                start: s.startTimeMs / 1000,
                dur: (s.endTimeMs - s.startTimeMs) / 1000,
                end: s.endTimeMs / 1000,
                cleanLen
            };
        }

        // Fallback to text-ratio estimation
        const dur = (cleanLen / Math.max(1, totalChars)) * totalDurationSec;
        const start = accumulatedSec;
        accumulatedSec += dur;
        return { start, dur, end: accumulatedSec, cleanLen };
      });
    }, [article?.sentences, totalDurationSec]);

  // Tải chi tiết bài đọc & danh sách bài mẫu demo
  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      const data = await ReadingApi.getArticleDetail(articleId);
      setArticle(data);
      if (data.durationSeconds && data.durationSeconds > 0) {
        setTotalDurationSec(data.durationSeconds);
      } else {
        setTotalDurationSec(Math.max(60, Math.round(data.totalWords / 5)));
      }
    } catch (err) {
      console.error('Error loading article detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDemoList = async () => {
    try {
      const res = await ReadingApi.getArticles({ limit: 20 });
      if (res?.items) {
        const demos = res.items.filter((a) => a.isPublic);
        demos.sort((a, b) => (b.level || '').localeCompare(a.level || ''));
        setDemoArticlesList(demos);
      }
    } catch (err) {
      console.error('Error loading demo articles list:', err);
    }
  };

  useEffect(() => {
    fetchArticle();
    fetchDemoList();
    setActiveSentenceIndex(0);
    setPlaybackProgressSec(0);
    setSentenceProgress(0);
    cancelAudio();
  }, [articleId]);

  const sentences = article?.sentences || [];
  const currentActiveSentence = sentences[activeSentenceIndex];

  // Hủy âm thanh và reset tiến trình

  useEffect(() => {
    if (isPlaying) {
      if (progressTickerRef.current) clearInterval(progressTickerRef.current);
      progressTickerRef.current = setInterval(() => {
        handleTimeUpdate();
      }, 50);
    } else {
      if (progressTickerRef.current) clearInterval(progressTickerRef.current);
    }
    return () => {
      if (progressTickerRef.current) clearInterval(progressTickerRef.current);
    };
  }, [isPlaying]);

  const handleTimeUpdate = () => {

    if (!audioRef.current || !sentencesRef.current.length) return;
    const currentMs = audioRef.current.currentTime * 1000;
    setPlaybackProgressSec(audioRef.current.currentTime);
    
    // Find the sentence matching this time
    const sents = sentencesRef.current;
    let idx = sents.findIndex(s => currentMs >= (s.startTimeMs || 0) && currentMs <= (s.endTimeMs || 0));
    
    // If not found (between sentences), find the closest one before
    if (idx === -1) {
      for (let i = sents.length - 1; i >= 0; i--) {
        if (currentMs >= (sents[i].startTimeMs || 0)) {
          idx = i;
          break;
        }
      }
    }
    
    if (idx !== -1 && idx !== activeSentenceIndexRef.current) {
      // Auto-pause check
      if (autoPauseRef.current && isPlayingRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return; // Wait for user to resume
      }
      setActiveSentenceIndex(idx);
      activeSentenceIndexRef.current = idx;
      
      // Auto-scroll
      const sentenceEl = document.getElementById(`dokkai-sentence-${idx}`);
      if (sentenceEl) {
        sentenceEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    
    // Calculate sentence progress (Karaoke fill effect)
    if (idx !== -1) {
      const s = sents[idx];
      const sStart = s.startTimeMs || 0;
      const sEnd = s.endTimeMs || 2000;
      const progress = Math.max(0, Math.min(1, (currentMs - sStart) / (sEnd - sStart)));
      setSentenceProgress(progress);
    }
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (isRepeatRef.current) {
      playSentenceByIndex(0);
    }
  };
  
  const cancelAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setActiveCharIndex(-1);
    setSentenceProgress(0);
  };

  // Phát âm thanh của một câu và kích hoạt Karaoke đồng bộ chuẩn xác thời gian thực
  const playSentenceByIndex = (index: number) => {
    const sents = sentencesRef.current;
    if (!sents || !sents[index] || !audioRef.current) return;

    cancelAudio();

    setActiveSentenceIndex(index);
    activeSentenceIndexRef.current = index;
    setActiveCharIndex(-1);

    const targetTimeSec = (sents[index].startTimeMs || 0) / 1000;
    audioRef.current.currentTime = targetTimeSec;
    audioRef.current.playbackRate = playbackSpeedRef.current;
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(e => console.error("Audio play error", e));
  };

  const handleTogglePlay = () => {
    if (!sentences || sentences.length === 0) return;
    if (isPlaying) {
      cancelAudio();
    } else {
      playSentenceByIndex(activeSentenceIndex);
    }
  };

  const handleToggleRepeat = () => {
    const nextRepeat = !isRepeat;
    setIsRepeat(nextRepeat);
    isRepeatRef.current = nextRepeat;

    if (!nextRepeat) {
      if (repeatTimerRef.current) {
        clearTimeout(repeatTimerRef.current);
        repeatTimerRef.current = null;
      }
    } else if (!isPlaying) {
      playSentenceByIndex(activeSentenceIndex);
    }
  };

  const handleToggleAutoPause = () => {
    setAutoPauseSentence((prev) => !prev);
  };

  const handleNextSentence = () => {
    if (activeSentenceIndex < sentences.length - 1) {
      playSentenceByIndex(activeSentenceIndex + 1);
    }
  };

  const handlePrevSentence = () => {
    if (activeSentenceIndex > 0) {
      playSentenceByIndex(activeSentenceIndex - 1);
    }
  };

  // Tra cứu từ vựng khi bấm trực tiếp vào từ
    const handleWordClick = async (e: React.MouseEvent, wordText: string) => {
    e.stopPropagation();
    const cleanWord = wordText.replace(/[^\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '').trim();
    if (!cleanWord) return;

    const matched = article?.vocabularies?.find(
      (v) => v.word === cleanWord || cleanWord.includes(v.word) || v.word.includes(cleanWord)
    );

    const detectedGrammars = article?.grammars?.filter((g) => {
      const cleanG = g.grammarPoint.replace(/[a?o~]/g, '');
      return cleanWord.includes(cleanG) || cleanG.includes(cleanWord);
    });
    
    setPopoverPosition({ x: e.clientX, y: e.clientY });

    if (matched) {
      setLookupWord({
        type: 'WORD',
        word: matched.word,
        reading: matched.reading,
        hanViet: matched.hanViet || undefined,
        meaningVi: matched.meaningVi,
        level: matched.level || article?.level,
        detectedGrammars: detectedGrammars && detectedGrammars.length > 0 ? detectedGrammars : undefined
      });
    } else {
      setLookupWord({
        type: 'WORD',
        word: cleanWord,
        reading: cleanWord,
        meaningVi: 'Đang tra cứu nghĩa của từ...',
        isLoading: true,
        detectedGrammars: detectedGrammars && detectedGrammars.length > 0 ? detectedGrammars : undefined
      });
      try {
        const parentSentence = article?.sentences?.find((s) => s.sentenceJp.includes(cleanWord));
        const result = await ReadingApi.translateSelection(cleanWord, parentSentence ? parentSentence.sentenceJp : undefined);
        setLookupWord((prev) => {
          if (!prev || prev.word !== cleanWord) return prev;
          return { ...prev, meaningVi: result.translation || prev.meaningVi, explanation: result.explanation, isLoading: false };
        });
      } catch (err) {
        setLookupWord((prev) => {
          if (!prev || prev.word !== cleanWord) return prev;
          return { ...prev, meaningVi: 'Không thể tra cứu từ này.', isLoading: false };
        });
      }
    }
  };

  // Tra cứu khi bôi đen cụm từ hoặc đoạn văn: Dịch chính xác cụm từ và phân tích ngữ pháp
  const handleTextSelection = async (e: React.MouseEvent) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    const selected = sel.toString().trim();
    if (!selected) return;

    const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(selected);
    if (!hasJapanese) return;

    if (/\d+:\d+|Câu|\/|VN|Bản dịch/i.test(selected)) return;

    const cleanSel = selected.replace(/[、。！？【】「」『』\s]/g, '').trim();
    const isSingleWord = cleanSel.length <= 4 && !/[\n\r]/.test(selected);

    if (isSingleWord) {
      handleWordClick(e, cleanSel);
      return;
    }

    // Xác định câu ngữ cảnh xung quanh
    const parentSentence = article?.sentences?.find((s) => {
      const cleanSent = s.sentenceJp.replace(/【\/?下線】/g, '');
      return cleanSent.includes(cleanSel);
    });

    const detectedGrammars: DetectedGrammar[] = (article?.grammars || []).filter((g) => {
      const cleanG = g.grammarPoint.replace(/[〜~]/g, '');
      return (
        selected.includes(cleanG) ||
        (g.excerpt && (selected.includes(g.excerpt) || g.excerpt.includes(cleanSel)))
      );
    });

    // Mở popover ngay lập tức với trạng thái đang phân tích
    setLookupWord({
      type: 'PHRASE',
      word: selected,
      meaningVi: 'Đang dịch chính xác cụm từ theo ngữ cảnh...',
      isLoading: true,
      level: article?.level,
      detectedGrammars
    });
    setPopoverPosition({ x: e.clientX, y: e.clientY });

    // Gọi API AI để dịch chính xác cụm từ được bôi đen (không dịch cả câu dài)
    try {
      const result = await ReadingApi.translateSelection(
        selected,
        parentSentence ? parentSentence.sentenceJp : undefined
      );

      setLookupWord((prev) => {
        if (!prev || prev.word !== selected) return prev;
        return {
          ...prev,
          meaningVi: result.translation || prev.meaningVi,
          explanation: result.explanation,
          grammarNotes: result.grammarNotes,
          isLoading: false
        };
      });
    } catch (err) {
      console.error('Error translating selection:', err);
      setLookupWord((prev) => {
        if (!prev || prev.word !== selected) return prev;
        return {
          ...prev,
          meaningVi: parentSentence?.sentenceVi || 'Không thể tải bản dịch cụm từ lúc này.',
          isLoading: false
        };
      });
    }
  };

  // Xem giải thích chi tiết cấu trúc ngữ pháp và cuộn tới câu sử dụng
  const handleSelectGrammar = async (grammar: ReadingGrammarItem) => {
    setSelectedGrammar(grammar);
    setDetailedGrammarInfo(null);
    setIsGrammarModalOpen(true);

    const cleanG = grammar.grammarPoint.replace(/[〜~]/g, '').trim();
    let targetIdx = -1;
    if (article?.sentences) {
      targetIdx = article.sentences.findIndex((s) => {
        if (grammar.excerpt && s.sentenceJp.includes(grammar.excerpt)) return true;
        if (cleanG && s.sentenceJp.includes(cleanG)) return true;
        return false;
      });
    }

    if (targetIdx !== -1) {
      setActiveGrammarSentenceIdx(targetIdx);
      setTimeout(() => {
        const el = document.getElementById(`dokkai-sentence-${targetIdx}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    setIsGrammarLoading(true);
    try {
      const sentenceText =
        targetIdx !== -1 && article?.sentences
          ? article.sentences[targetIdx].sentenceJp
          : grammar.excerpt;
      const res = await ReadingApi.explainGrammar(
        grammar.grammarPoint,
        sentenceText,
        grammar.level || article?.level
      );
      setDetailedGrammarInfo({
        ...res,
        excerpt: grammar.excerpt,
        excerptVi:
          targetIdx !== -1 && article?.sentences ? article.sentences[targetIdx].sentenceVi : undefined
      });
    } catch (err) {
      console.error('Failed to load detailed grammar:', err);
      setDetailedGrammarInfo({
        grammarPoint: grammar.grammarPoint,
        level: grammar.level,
        meaningVi: grammar.meaningVi,
        structure: `${grammar.grammarPoint} + ...`,
        explanation: grammar.meaningVi,
        excerpt: grammar.excerpt
      });
    } finally {
      setIsGrammarLoading(false);
    }
  };

  // Chia đoạn văn tự nhiên (khoảng 3-4 câu / đoạn)
  const paragraphs = useMemo(() => {
    const paras: { sentences: ReadingSentence[] }[] = [];
    let currentGroup: ReadingSentence[] = [];

    sentences.forEach((sent, idx) => {
      currentGroup.push(sent);
      if (currentGroup.length >= 4 || idx === sentences.length - 1) {
        paras.push({ sentences: [...currentGroup] });
        currentGroup = [];
      }
    });

    return paras;
  }, [sentences]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="font-semibold text-slate-600">
          Đang nạp bài đọc Dokkai chuẩn JLPT và dữ liệu đối chiếu...
        </span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>Không tìm thấy nội dung bài đọc.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const cleanTitle = article.title.split('(')[0]?.trim() || article.title;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      {/* 1. HEADER: TIÊU ĐỀ & CHỌN BÀI ĐỌC MẪU */}
      <div className="flex flex-col items-center text-center gap-2 pt-2 select-none">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
          <BookOpen className="w-5 h-5" />
        </div>

        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          Đọc hiểu
        </h1>

        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Bài đọc tiếng Nhật chuẩn JLPT — giọng đọc bản xứ theo nhịp câu, chữ sáng lên thời gian thực
          theo từng phách âm giúp bạn luyện đọc và nắm bắt vị trí dễ dàng.
        </p>

        <div className="flex items-center gap-3 mt-1 relative">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>

          {/* Menu chọn bài đọc demo */}
          <div className="relative">
            <button
              onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
              className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50/60 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bài đọc mẫu (demo) • miễn phí</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
            </button>

            {isDemoMenuOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 flex flex-col gap-1 text-left">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  Chọn bài đọc mẫu theo cấp độ JLPT:
                </div>
                {demoArticlesList.map((demoArt) => (
                  <button
                    key={demoArt.id}
                    onClick={() => {
                      setIsDemoMenuOpen(false);
                      if (onSelectArticle) {
                        onSelectArticle(demoArt.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-left transition cursor-pointer flex items-center justify-between ${
                      demoArt.id === articleId
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-japanese font-bold">
                        {demoArt.title.split('(')[0]?.trim()}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {demoArt.topic} • {demoArt.totalWords} chữ
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {demoArt.level}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. THANH ĐIỀU KHIỂN ÂM THANH MODULAR */}
      {article?.audioUrl && (
          <audio
            ref={audioRef}
            src={article.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(e) => setTotalDurationSec(e.currentTarget.duration)}
            onEnded={handleAudioEnded}
            crossOrigin="anonymous"
          />
        )}
        <DokkaiAudioBar
        currentSentenceVi={currentActiveSentence?.sentenceVi}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation(!showTranslation)}
        furiganaMode={furiganaMode}
            onChangeFuriganaMode={setFuriganaMode}
            jlptHeatmap={jlptHeatmap}
            onToggleJlptHeatmap={() => setJlptHeatmap(!jlptHeatmap)}
            playbackProgressSec={playbackProgressSec}
        totalDurationSec={totalDurationSec}
        onSeek={(targetSec) => {
          const targetIdx = sentenceTimeline.findIndex(
            (st) => st.start <= targetSec && targetSec <= st.end
          );
          if (targetIdx !== -1) {
            playSentenceByIndex(targetIdx);
          }
        }}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        isRepeat={isRepeat}
        onToggleRepeat={handleToggleRepeat}
        autoPause={autoPauseSentence}
        onToggleAutoPause={handleToggleAutoPause}
        playbackSpeed={playbackSpeed}
        onChangePlaybackSpeed={setPlaybackSpeed}
        canPrev={activeSentenceIndex > 0}
        canNext={activeSentenceIndex < sentences.length - 1}
        onPrev={handlePrevSentence}
        onNext={handleNextSentence}
      />

      {/* 3. BỐ CỤC CHÍNH 2 CỘT: BÀI ĐỌC (TRÁI) & TỪ VỰNG/NGỮ PHÁP (PHẢI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (7 CỘT): Toàn bộ Văn Bản Bài Đọc Dài Liền Mạch + Bộ Câu Hỏi Dokkai */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 lg:p-8 flex flex-col gap-5">
            {/* Header bài đọc */}
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black">
                  JLPT {article.level}
                </span>
                <span className="text-xs text-slate-500 font-medium">{article.topic}</span>
                <span className="text-xs text-slate-400 font-medium">• {article.totalWords} chữ</span>
                {article.sourceType === 'EXTERNAL_NEWS' && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Tin tức báo chí
                  </span>
                )}
                {article.sourceType === 'NHK_NEWS' && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                    NHK News
                  </span>
                )}
              </div>
                {/* Google Translate Widget */}
                

                {article.sourceUrl && (
                  <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold transition cursor-pointer"
                  title="Mở bài báo gốc trên trang tin"
                >
                  <span>Xem nguồn bài báo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* ẢNH BÌA BÀI BÁO / BÀI ĐỌC */}
            {article.imageUrl && (
              <div className="relative w-full max-h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src={article.imageUrl}
                  alt={cleanTitle}
                  className="w-full h-full max-h-80 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* TIÊU ĐỀ BÀI ĐỌC */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-japanese leading-snug">
                {cleanTitle}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                💡 Nhấp đúp vào bất kỳ câu nào để nghe phát âm. Bôi đen cụm từ để tra nghĩa chính xác. Nhấp vào mẫu ngữ pháp để xem giải thích chi tiết cấu trúc câu!
              </p>
            </div>

            {/* VĂN BẢN BÀI ĐỌC VỚI HIỆU ỨNG CHỮ SÁNG THEO NHỊP ÂM THANH (KARAOKE) */}
            <div
              className="space-y-6 text-left select-text"
              onMouseUp={handleTextSelection}
            >
              {paragraphs.map((para, pIdx) => (
                <div key={pIdx} className="space-y-3">
                  <p className="indent-[1em] tracking-normal leading-[2.2] font-japanese text-[16px] lg:text-[17px] text-slate-800 text-left">
                    {para.sentences.map((sent) => {
                      const sIdx = sentences.findIndex((s) => s.id === sent.id);
                      const isActive = activeSentenceIndex === sIdx;
                      const isGrammarTarget = activeGrammarSentenceIdx === sIdx;

                      return (
                        <DokkaiKaraokeSentence
                          key={sent.id || sIdx}
                          sentence={sent}
                          sentenceIndex={sIdx}
                          isActive={isActive}
                          isPlaying={isPlaying}
                          activeCharIndex={isActive ? activeCharIndex : -1}
                          sentenceProgress={isActive ? sentenceProgress : 0}
                          furiganaMode={furiganaMode}
                            jlptHeatmap={jlptHeatmap}
                          showTranslation={showTranslation}
                          highlightedKeyword={highlightedKeyword}
                          isGrammarTarget={isGrammarTarget}
                          vocabularies={article.vocabularies}
                          onSentenceDoubleClick={playSentenceByIndex}
                          onWordClick={handleWordClick}
                        />
                      );
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Always show Quiz section */}
          <DokkaiQuizSection
            quizzes={article.quizzes || []}
            articleId={article.id}
            sourceType={article.sourceType}
            onAddQuizzesSuccess={(newQ) => {
              setArticle((prev) =>
                prev ? { ...prev, quizzes: [...(prev.quizzes || []), ...newQ] } : prev
              );
            }}
          />
        </div>

        {/* CỘT PHẢI (5 CỘT): TỪ VỰNG TRỌNG ĐIỂM + MẪU NGỮ PHÁP MODULAR */}
        <DokkaiSidebar sentences={article?.sentences || []}
          vocabularies={article.vocabularies}
          grammars={article.grammars}
          highlightedKeyword={highlightedKeyword}
          selectedGrammarPoint={selectedGrammar?.grammarPoint}
          onSelectKeyword={(kw) => setHighlightedKeyword(kw)}
          onSelectGrammar={handleSelectGrammar}
        />
      </div>

      {/* Popover Tra Cứu Từ Vựng / Đoạn Văn & Kiểm Tra Ngữ Pháp Được Dùng */}
      <QuickLookupPopover
        wordInfo={lookupWord}
        position={popoverPosition}
        onClose={() => setLookupWord(null)}
        onSpeak={(t) => {
          if (!synthRef.current) return;
          synthRef.current.cancel();
          const clean = t.replace(/【\/?下線】/g, '');
          const u = new SpeechSynthesisUtterance(clean);
          u.lang = 'ja-JP';
          u.rate = playbackSpeedRef.current;
          synthRef.current.speak(u);
        }}
        
          onSaveNotebook={async (w) => {
            try {
              await ReadingApi.saveToNotebook({
                itemType: w.type === 'PHRASE' ? 'GRAMMAR' : 'VOCAB',
                title: w.word,
                reading: w.reading,
                meaningVi: w.meaningVi || 'Đã lưu từ bài báo',
                level: w.level || article?.level || 'N3',
                articleId: article?.id
              });
              alert('Đã lưu vào Sổ tay!');
            } catch (err) {
              alert('Lỗi lưu sổ tay');
            }
          }}
          onSelectGrammar={(gPoint) => {
          const found = article?.grammars?.find(
            (g) =>
              g.grammarPoint.includes(gPoint) ||
              gPoint.includes(g.grammarPoint.replace(/[〜~]/g, ''))
          );
          if (found) {
            handleSelectGrammar(found);
          }
        }}
      />

      {/* Modal Chi Tiết Cấu Trúc Ngữ Pháp */}
      <GrammarDetailModal
        isOpen={isGrammarModalOpen}
        grammar={selectedGrammar}
        detailedInfo={detailedGrammarInfo}
        isLoading={isGrammarLoading}
        onClose={() => {
          setIsGrammarModalOpen(false);
          setActiveGrammarSentenceIdx(null);
        }}
        onSpeak={(t) => {
          if (!synthRef.current) return;
          synthRef.current.cancel();
          const u = new SpeechSynthesisUtterance(t);
          u.lang = 'ja-JP';
          u.rate = playbackSpeedRef.current;
          synthRef.current.speak(u);
        }}
        onJumpToSentence={() => {
          if (activeGrammarSentenceIdx !== null) {
            const el = document.getElementById(`dokkai-sentence-${activeGrammarSentenceIdx}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }}
      />
    </div>
  );
};
