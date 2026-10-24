"use client";
import { useAuth } from "@/context/AuthContext";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Eye,
  EyeOff,
  Keyboard,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  Shuffle,
  RotateCw,
  Repeat,
  ExternalLink,
  Languages,
  Bookmark,
  FileText,
  Mic,
  MicOff,
  SlidersHorizontal,
  Info,
  Music,
} from "lucide-react";
import { ReadingArticle, VideoShadowingLesson } from "./reading.types";
import { TokenChunk, parseSentenceTokens } from "./moraUtils";
import { useVoiceRecorder } from "./useVoiceRecorder";
import { ShadowingKaraokeDisplay } from "./ShadowingKaraokeDisplay";
import { ShadowingDictationView } from "./ShadowingDictationView";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoShadowingViewProps {
  article?: ReadingArticle;
  lesson?: VideoShadowingLesson;
  onBack: () => void;
}

export const VideoShadowingView: React.FC<VideoShadowingViewProps> = ({
  article,
  lesson,
  onBack,
}) => {
  const { user } = useAuth();
  const [isSavingSync, setIsSavingSync] = useState(false);
  // Chế độ chính: [Bắt chước phát âm] vs [Nghe - Viết chính tả]
  const [topMode, setTopMode] = useState<"SHADOWING" | "DICTATION">(
    "SHADOWING",
  );
  const [isVideoHidden, setIsVideoHidden] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Chế độ phụ trong Nghe Viết: [Gõ chính tả] vs [Ghép câu]
  const [dictationSubMode, setDictationSubMode] = useState<
    "TYPING" | "ORDERING"
  >("TYPING");

  // Bật tắt Phụ đề / Bản dịch (Giao diện Corodomo)
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showRomaji, setShowRomaji] = useState<boolean>(false);

  // Karaoke & Popover từ vựng (Kiểu Corodomo)
  const [selectedToken, setSelectedToken] = useState<TokenChunk | null>(null);
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(0); // Bộ hiệu chỉnh lệch nhịp (Calibrator)

  // Ghi âm giọng nói cho Shadowing
  const {
    isRecording,
    recordedAudioUrl,
    recordDuration,
    startRecording,
    stopRecording,
  } = useVoiceRecorder();

  // Trạng thái Trình phát Video
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoPause, setAutoPause] = useState<boolean>(false); // Tự ngắt câu (Mặc định TẮT để video phát liên tục, người dùng tự chọn bật khi cần)
  const [isAbLooping, setIsAbLooping] = useState<boolean>(false); // Lặp câu A-B
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [currentPlaybackTimeMs, setCurrentPlaybackTimeMs] = useState<number>(0);
  const [isSentenceCompleted, setIsSentenceCompleted] =
    useState<boolean>(false);

  // Tham chiếu đồng bộ hóa để tránh lỗi Interval Closure
  const currentSentenceIdxRef = useRef<number>(currentSentenceIdx);
  const hasPausedCurrentRef = useRef<boolean>(false);

  // Trạng thái gõ chính tả
  const [userInput, setUserInput] = useState<string>("");
  const [isHintRevealed, setIsHintRevealed] = useState<boolean>(false);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [diffResult, setDiffResult] = useState<
    { char: string; status: "CORRECT" | "WRONG" | "MISSING" }[]
  >([]);

  // Thống kê & Tiến độ
  const [errorCount, setErrorCount] = useState<number>(0);
  const [replayCount, setReplayCount] = useState<number>(1);
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(
    new Set(),
  );

  // Dịch tự động (Live Auto-Translate) dự phòng nếu thiếu bản dịch
  const [liveTranslations, setLiveTranslations] = useState<Record<string, string>>({});

  // Sentence Ordering State (Ghép câu)
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWordChips, setSelectedWordChips] = useState<string[]>([]);
  const [isOrderingChecked, setIsOrderingChecked] = useState<boolean>(false);
  const [isOrderingCorrect, setIsOrderingCorrect] = useState<boolean | null>(
    null,
  );

  // Tham chiếu YouTube
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
  const playerId = "yt-shadowing-embed-player";

  // Cuộn câu thoại đang phát mà KHÔNG bao giờ làm giật/lùi màn hình trên điện thoại
  const scrollActiveSentenceIntoView = useCallback((idx: number) => {
    const container = transcriptContainerRef.current;
    const el = document.getElementById('transcript-sentence-' + idx);
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
      const targetScroll = el.offsetTop - container.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }, []);


  // Siêu dữ liệu (Metadata)
  const title = lesson?.title || article?.title || "Bài luyện Shadowing Video";
  const level = lesson?.level || article?.level || "N5";
  const channelTitle =
    lesson?.channelTitle || lesson?.author || "BS-TBS公式チャンネル";
  const youtubeId = lesson?.youtubeId || article?.youtubeId || "GKHdwZyC-_M";

  // Chuẩn hóa phụ đề
  const sentences = useMemo(() => {
    if (lesson?.subtitles && lesson.subtitles.length > 0) {
      return lesson.subtitles.map((s) => ({
        id: s.id,
        orderIndex: s.orderIndex,
        sentenceJp: s.japanese,
        sentenceVi: s.vietnamese,
        furigana: s.furigana || s.japanese,
        romaji: (s as any).romaji || "",
        startTimeMs: s.startTimeMs,
        endTimeMs: s.endTimeMs,
        keyWordsList: s.keyWordsList || [],
        grammarNotesList: s.grammarNotesList || [],
      }));
    }
    if (article?.sentences && article.sentences.length > 0) {
      return article.sentences.map((s) => ({
        id: s.id,
        orderIndex: s.orderIndex,
        sentenceJp: s.sentenceJp,
        sentenceVi: s.sentenceVi,
        furigana: s.furigana || s.sentenceJp,
        romaji: (s as any).romaji || "",
        startTimeMs: s.startTimeMs,
        endTimeMs: s.endTimeMs,
        keyWordsList: [],
        grammarNotesList: [],
      }));
    }
    return [];
  }, [lesson, article]);

  const currentSentence = sentences[currentSentenceIdx];

  const translatedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!showTranslation || !sentences.length) return;

    const translateBatch = async () => {
      const toTranslate: any[] = [];
      for (let i = 0; i < 5; i++) {
        const idx = currentSentenceIdx + i;
        if (idx < sentences.length) {
          const s = sentences[idx];
          if (!s.sentenceVi && !translatedIdsRef.current.has(s.id)) {
            toTranslate.push(s);
            translatedIdsRef.current.add(s.id); // Đánh dấu đang tải/đã tải
          }
        }
      }

      if (toTranslate.length === 0) return;

      try {
        const newTranslations: Record<string, string> = {};
        await Promise.all(
          toTranslate.map(async (s) => {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(s.sentenceJp)}`);
            const data = await res.json();
            newTranslations[s.id] = data[0].map((item: any) => item[0]).join("");
          })
        );
        
        setLiveTranslations(prev => ({ ...prev, ...newTranslations }));
      } catch (e) {
        console.error("Auto-translate batch failed", e);
      }
    };
    
    translateBatch();
  }, [currentSentenceIdx, sentences, showTranslation]);

  // Khởi tạo SpeechSynthesis (Đọc văn bản)
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Khởi tạo YouTube IFrame Player API
  useEffect(() => {
    if (!youtubeId || typeof window === "undefined") return;
    setPlayerError(null);

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (
        playerRef.current &&
        typeof playerRef.current.destroy === "function"
      ) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }

      try {
        playerRef.current = new window.YT.Player(playerId, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            cc_load_policy: 1,
            cc_lang_pref: "ja",
            hl: "ja",
          },
          events: {
            onReady: () => {
              setIsPlayerReady(true);
              if (currentSentence?.startTimeMs) {
                playerRef.current.seekTo(
                  currentSentence.startTimeMs / 1000,
                  true,
                );
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (
                event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED
              ) {
                setIsPlaying(false);
              }
            },
            onError: (err: any) => {
              console.warn("YouTube Player error code:", err?.data);
              setPlayerError(
                "Video đang hạn chế xem trên trình duyệt. Bạn có thể mở trực tiếp trên YouTube hoặc dùng Audio dự phòng.",
              );
            },
          },
        });
      } catch (e) {
        console.error("Failed to create YouTube player:", e);
      }
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (
        playerRef.current &&
        typeof playerRef.current.destroy === "function"
      ) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [youtubeId]);

  // Keep ref synchronized with state
  useEffect(() => {
    currentSentenceIdxRef.current = currentSentenceIdx;
  }, [currentSentenceIdx]);

  // Real-time synchronization loop (runs every 50ms for smooth Karaoke text)
  useEffect(() => {
    if (!playerRef.current) return;

    const interval = setInterval(() => {
      try {
        if (
          !playerRef.current ||
          typeof playerRef.current.getCurrentTime !== "function"
        )
          return;
        const timeSec = playerRef.current.getCurrentTime();
        if (typeof timeSec !== "number" || isNaN(timeSec)) return;

        const currentMs = Math.floor(timeSec * 1000);
        setCurrentPlaybackTimeMs(currentMs);

        if (!sentences || sentences.length === 0) return;

        const effectiveMs = currentMs + syncOffsetMs;
        const currIdx = currentSentenceIdxRef.current;
        const currSent = sentences[currIdx];

        // 1. A-B Loop mode
        if (isAbLooping && currSent && isPlaying) {
          if (currSent.endTimeMs && effectiveMs >= currSent.endTimeMs - 80) {
            const startSec = Math.max(
              0,
              (currSent.startTimeMs - syncOffsetMs) / 1000,
            );
            playerRef.current.seekTo(startSec, true);
            playerRef.current.playVideo();
            setReplayCount((prev) => prev + 1);
            return;
          }
        }

        // 2. Auto-pause mode (Tự ngắt câu)
        if (
          autoPause &&
          currSent &&
          isPlaying &&
          !hasPausedCurrentRef.current
        ) {
          if (currSent.endTimeMs && effectiveMs >= currSent.endTimeMs - 80) {
            hasPausedCurrentRef.current = true;
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            setIsSentenceCompleted(true);
            // Mark this sentence as heard/completed
            setCompletedSentences((prev) => new Set(prev).add(currIdx));
            return;
          }
        }

        // 3. Match sentence based on effective playback time (O(1) fast-check + Binary Search for 50-minute videos)
        let matchedIdx = -1;
        const currS = sentences[currIdx];
        const nextS = sentences[currIdx + 1];

        if (
          currS &&
          effectiveMs >= currS.startTimeMs &&
          effectiveMs <=
            (currS.endTimeMs ||
              (nextS ? nextS.startTimeMs : currS.startTimeMs + 5000))
        ) {
          matchedIdx = currIdx;
        } else if (
          nextS &&
          effectiveMs >= nextS.startTimeMs &&
          effectiveMs <=
            (nextS.endTimeMs ||
              (sentences[currIdx + 2]
                ? sentences[currIdx + 2].startTimeMs
                : nextS.startTimeMs + 5000))
        ) {
          matchedIdx = currIdx + 1;
        } else {
          // Binary search for seekbar scrub in long videos (O(log N))
          let low = 0;
          let high = sentences.length - 1;
          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const s = sentences[mid];
            const nextMid = sentences[mid + 1];
            const end =
              s.endTimeMs ||
              (nextMid ? nextMid.startTimeMs : s.startTimeMs + 5000);

            if (effectiveMs < s.startTimeMs) {
              high = mid - 1;
            } else if (effectiveMs > end) {
              if (nextMid && effectiveMs < nextMid.startTimeMs) {
                matchedIdx = mid;
                break;
              }
              low = mid + 1;
            } else {
              matchedIdx = mid;
              break;
            }
          }
        }

        // Boundary fallbacks
        if (
          matchedIdx === -1 &&
          effectiveMs < (sentences[0]?.startTimeMs || 0)
        ) {
          matchedIdx = 0;
        } else if (
          matchedIdx === -1 &&
          effectiveMs > (sentences[sentences.length - 1]?.endTimeMs || 0)
        ) {
          matchedIdx = sentences.length - 1;
        }

        // If video moved to a new sentence (continuous playback or seekbar scrub)
        if (matchedIdx !== -1 && matchedIdx !== currIdx) {
          currentSentenceIdxRef.current = matchedIdx;
          setCurrentSentenceIdx(matchedIdx);
          hasPausedCurrentRef.current = false;
          setIsSentenceCompleted(false);

          scrollActiveSentenceIntoView(matchedIdx);
        }
      } catch (e) {}
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, sentences, autoPause, isAbLooping, syncOffsetMs]);

  const speakWord = (word: string) => {
    if (!synthRef.current || !word) return;
    synthRef.current.cancel();
    const cleanWord = word.replace(/[、。！？「」『』…\-,.\s]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanWord || word);
    utterance.lang = "ja-JP";
    utterance.rate = playbackSpeed;
    synthRef.current.speak(utterance);
  };

  // Keyboard shortcuts (Space, ArrowLeft, ArrowRight, R, F, T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (currentSentenceIdx > 0) jumpToSentence(currentSentenceIdx - 1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (currentSentenceIdx < sentences.length - 1)
          jumpToSentence(currentSentenceIdx + 1);
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleReplayCurrent();
      } else if (e.key.toLowerCase() === "f") {
        setShowFurigana((prev) => !prev);
      } else if (e.key.toLowerCase() === "t") {
        setShowTranslation((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSentenceIdx, sentences, isPlaying]);

  // Init sentence ordering tokens — tách từ theo morpheme tự nhiên của tiếng Nhật
  const initScrambledWords = (sentenceText: string) => {
    // Xóa dấu câu và khoảng trắng thừa
    const cleaned = sentenceText.replace(/[。！？\s]/g, "");

    // Tách theo nhóm ký tự đồng loại: [漢字+, ひらがな+, カタカナ+, 記号]
    // Tách tại ranh giới: hán → hira, hira → hán, katakana → khác, v.v.
    const tokens: string[] = [];
    let current = "";
    const getCharType = (ch: string): "kanji" | "hira" | "kata" | "other" => {
      const code = ch.charCodeAt(0);
      if (code >= 0x4e00 && code <= 0x9fff) return "kanji"; // CJK Unified Ideographs
      if (code >= 0x3040 && code <= 0x309f) return "hira"; // Hiragana
      if (code >= 0x30a0 && code <= 0x30ff) return "kata"; // Katakana
      if (code >= 0x3400 && code <= 0x4dbf) return "kanji"; // CJK Extension A
      return "other";
    };

    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      const chType = getCharType(ch);

      if (current === "") {
        current = ch;
      } else {
        const prevType = getCharType(current[current.length - 1]);

        // Hiragana sau Kanji: gộp thành 1 từ (okurigana pattern: 食べる)
        // Ngoại lệ: nếu hiragana chunk quá dài (>3) thì tách
        if (prevType === "kanji" && chType === "hira") {
          current += ch;
        }
        // Kanji sau Kanji: gộp
        else if (prevType === "kanji" && chType === "kanji") {
          current += ch;
        }
        // Katakana → gộp liên tiếp
        else if (prevType === "kata" && chType === "kata") {
          current += ch;
        }
        // Hiragana → gộp nhưng giới hạn 3 ký tự (tránh gộp cả câu)
        else if (
          prevType === "hira" &&
          chType === "hira" &&
          current.length < 3
        ) {
          current += ch;
        }
        // Các trường hợp còn lại: tách từ
        else {
          if (current.trim()) tokens.push(current.trim());
          current = ch;
        }
      }
    }
    if (current.trim()) tokens.push(current.trim());

    // Nếu tách được ít hơn 3 token, fallback về chia đôi câu
    const finalTokens =
      tokens.length >= 3
        ? tokens
        : cleaned.split("").reduce<string[]>((acc, char, idx, arr) => {
            if (idx % 2 === 0) acc.push(char + (arr[idx + 1] || ""));
            return acc;
          }, []);

    const shuffled = [...finalTokens].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setSelectedWordChips([]);
    setIsOrderingChecked(false);
    setIsOrderingCorrect(null);
  };

  // Switch sentence handler
  
  const handleSaveSync = async () => {
    if (!lesson || !lesson.id || syncOffsetMs === 0) return;
    setIsSavingSync(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shadowing/${lesson.id}/sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offsetMs: syncOffsetMs })
      });
      alert("Đã lưu đồng bộ vịnh vi?n!");
      window.location.reload();
    } catch(e) {
      alert("L?i luu d?ng b?");
    } finally {
      setIsSavingSync(false);
    }
  };

  const jumpToSentence = (idx: number) => {
    if (idx < 0 || idx >= sentences.length) return;
    currentSentenceIdxRef.current = idx;
    setCurrentSentenceIdx(idx);
    hasPausedCurrentRef.current = false;
    setIsSentenceCompleted(false);

    const target = sentences[idx];

    if (
      playerRef.current &&
      isPlayerReady &&
      typeof playerRef.current.seekTo === "function"
    ) {
      const startSec = (target.startTimeMs || 0) / 1000;
      playerRef.current.seekTo(startSec, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      speakSentence(target);
    }

    scrollActiveSentenceIntoView(idx);
  };

  useEffect(() => {
    if (currentSentence) {
      setUserInput("");
      setIsHintRevealed(false);
      setHasCheckedAnswer(false);
      setIsAnswerCorrect(null);
      setDiffResult([]);
      initScrambledWords(currentSentence.sentenceJp);
    }
  }, [currentSentenceIdx, sentences]);

  const handlePlayPause = () => {
    if (
      playerRef.current &&
      isPlayerReady &&
      typeof playerRef.current.playVideo === "function"
    ) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        hasPausedCurrentRef.current = false;
        setIsSentenceCompleted(false);

        // If stopped at or near the end of sentence in auto-pause mode, move to next sentence
        if (isSentenceCompleted && currentSentenceIdx < sentences.length - 1) {
          jumpToSentence(currentSentenceIdx + 1);
          return;
        }

        if (currentSentence && currentSentence.endTimeMs) {
          const currentTimeSec = playerRef.current.getCurrentTime();
          const currentMs = currentTimeSec * 1000;
          if (
            currentMs >= currentSentence.endTimeMs - 300 &&
            currentSentenceIdx < sentences.length - 1
          ) {
            jumpToSentence(currentSentenceIdx + 1);
            return;
          }
        }

        playerRef.current.playVideo();
        setIsPlaying(true);
        setReplayCount((prev) => prev + 1);
      }
    } else {
      speakSentence(currentSentence);
    }
  };

  const handleReplayCurrent = () => {
    hasPausedCurrentRef.current = false;
    setIsSentenceCompleted(false);
    if (
      playerRef.current &&
      isPlayerReady &&
      typeof playerRef.current.seekTo === "function"
    ) {
      if (currentSentence) {
        const startSec = (currentSentence.startTimeMs || 0) / 1000;
        playerRef.current.seekTo(startSec, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
        setReplayCount((prev) => prev + 1);
      }
    } else {
      speakSentence(currentSentence);
    }
  };

  const speakSentence = (sentence: any) => {
    if (!synthRef.current || !sentence) return;
    synthRef.current.cancel();
    const cleanText = sentence.sentenceJp.replace(/【\/?下線】/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ja-JP";
    utterance.rate = playbackSpeed;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setReplayCount((prev) => prev + 1);
  };

  const handleToggleSpeed = () => {
    const nextSpeed =
      playbackSpeed === 1.0 ? 0.75 : playbackSpeed === 0.75 ? 1.25 : 1.0;
    setPlaybackSpeed(nextSpeed);
    if (
      playerRef.current &&
      typeof playerRef.current.setPlaybackRate === "function"
    ) {
      playerRef.current.setPlaybackRate(nextSpeed);
    }
  };

  // Check typing — dùng Levenshtein-based diff để highlight đúng/sai/thiếu chính xác
  const checkTypingAnswer = () => {
    if (!currentSentence) return;
    const target = currentSentence.sentenceJp
      .replace(/[、。！？\s]/g, "")
      .trim();
    const input = userInput.replace(/[、。！？\s]/g, "").trim();

    if (input === target) {
      setIsAnswerCorrect(true);
      setDiffResult(
        target.split("").map((c) => ({ char: c, status: "CORRECT" })),
      );
      // Đánh dấu đã hoàn thành câu khi gõ chính tả đúng
      setCompletedSentences((prev) => new Set(prev).add(currentSentenceIdx));
    } else {
      setIsAnswerCorrect(false);
      setErrorCount((prev) => prev + 1);

      // Ma trận khoảng cách Levenshtein
      const n = target.length;
      const m = input.length;
      const dp: number[][] = Array.from({ length: n + 1 }, () =>
        new Array(m + 1).fill(0),
      );
      for (let i = 0; i <= n; i++) dp[i][0] = i;
      for (let j = 0; j <= m; j++) dp[0][j] = j;
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          if (target[i - 1] === input[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
          } else {
            dp[i][j] =
              1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
          }
        }
      }

      // Quay lui (Backtrack) để tìm sự căn chỉnh
      const diff: { char: string; status: "CORRECT" | "WRONG" | "MISSING" }[] =
        [];
      let i = n,
        j = m;
      const ops: {
        type: "match" | "replace" | "delete" | "insert";
        tc: string;
        ic: string;
      }[] = [];
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && target[i - 1] === input[j - 1]) {
          ops.push({ type: "match", tc: target[i - 1], ic: input[j - 1] });
          i--;
          j--;
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
          ops.push({ type: "replace", tc: target[i - 1], ic: input[j - 1] });
          i--;
          j--;
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
          ops.push({ type: "delete", tc: target[i - 1], ic: "" });
          i--;
        } else {
          ops.push({ type: "insert", tc: "", ic: input[j - 1] });
          j--;
        }
      }
      ops.reverse();

      for (const op of ops) {
        if (op.type === "match") {
          diff.push({ char: op.tc, status: "CORRECT" });
        } else if (op.type === "replace") {
          diff.push({ char: op.ic, status: "WRONG" });
        } else if (op.type === "delete") {
          diff.push({ char: op.tc, status: "MISSING" });
        }
        // 'insert' = extra chars người dùng gõ thêm → bỏ qua (không cần highlight)
      }

      setDiffResult(diff);
    }
    setHasCheckedAnswer(true);
  };

  // Kiểm tra ghép câu (Ordering)
  const checkOrderingAnswer = () => {
    if (!currentSentence) return;
    const target = currentSentence.sentenceJp.replace(/[、。！？\s]/g, "");
    const assembled = selectedWordChips.join("");

    const correct = assembled === target;
    setIsOrderingCorrect(correct);
    setIsOrderingChecked(true);
    if (correct) {
      setCompletedSentences((prev) => new Set(prev).add(currentSentenceIdx));
    } else {
      setErrorCount((prev) => prev + 1);
    }
  };

  const currentTokens = useMemo(() => {
    if (!currentSentence) return [];
    return parseSentenceTokens(
      currentSentence.sentenceJp,
      currentSentence.furigana,
      currentSentence.keyWordsList,
    );
  }, [currentSentence]);

  const effectivePlaybackMs = currentPlaybackTimeMs + syncOffsetMs;
  const isIntroPlaying = Boolean(
    isPlaying &&
    sentences.length > 0 &&
    currentSentenceIdx === 0 &&
    effectivePlaybackMs < (sentences[0]?.startTimeMs || 0),
  );
  const timeToIntroEndSec = isIntroPlaying
    ? Math.max(
        0,
        ((sentences[0]?.startTimeMs || 0) - effectivePlaybackMs) / 1000,
      )
    : 0;

  const nextSentence = sentences[currentSentenceIdx + 1];
  // Nếu câu tiếp theo bắt đầu gần đó, thời lượng phát âm thực tế bao gồm cả nhịp ngắt/âm đuôi
  const effectiveEndMs = currentSentence?.endTimeMs
    ? nextSentence &&
      nextSentence.startTimeMs > currentSentence.endTimeMs &&
      nextSentence.startTimeMs - currentSentence.endTimeMs < 1800
      ? Math.min(currentSentence.endTimeMs + 600, nextSentence.startTimeMs)
      : currentSentence.endTimeMs
    : nextSentence
      ? nextSentence.startTimeMs
      : (currentSentence?.startTimeMs || 0) + 5000;

  const sentenceDuration = Math.max(
    100,
    effectiveEndMs - (currentSentence?.startTimeMs || 0),
  );
  const rawProgress =
    (effectivePlaybackMs - (currentSentence?.startTimeMs || 0)) /
    sentenceDuration;
  const currentProgress = isIntroPlaying
    ? 0
    : Math.max(0, Math.min(1, rawProgress));

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Thanh Menu Điều Hướng Phía Trên (Corodomo Header Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs: [Bắt chước phát âm] vs [Nghe - Viết chính tả] */}
        <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setTopMode("SHADOWING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              topMode === "SHADOWING"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bắt chước phát âm</span>
          </button>
          <button
            onClick={() => setTopMode("DICTATION")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              topMode === "DICTATION"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Nghe - Viết chính tả</span>
          </button>
        </div>

        {/* Nút Phím tắt & Ẩn video */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Phím tắt</span>
          </button>

          <button
            onClick={() => setIsVideoHidden(!isVideoHidden)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            {isVideoHidden ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>{isVideoHidden ? "Hiện video" : "Ẩn video"}</span>
          </button>
        </div>
      </div>

      {/* 2. Tiêu Đề Bài Học & Nút Quay Lại + Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-emerald-600 font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại thư viện</span>
          </button>
          <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px]">
            {level}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-500 font-medium">
            {sentences.length} câu thoại
          </span>
          {completedSentences.size > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-bold text-emerald-600">
                ✓ {completedSentences.size}/{sentences.length} hoàn thành
              </span>
            </>
          )}
        </div>

        <h1 className="font-black text-slate-900 text-base flex items-center gap-2">
          <span>{title}</span>
        </h1>
        <span className="text-[11px] text-slate-400 font-medium">
          · {channelTitle}
        </span>

        {/* Progress Bar */}
        {sentences.length > 0 && completedSentences.size > 0 && (
          <div className="mt-1">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full max-w-xs">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedSentences.size / sentences.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. BỐ CỤC CHÍNH (2 CỘT): Player & Subtitle (Trái) + BẢN CHÉP (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (7 CỘT): Video Player YouTube + Thanh Điều Khiển + Phụ Đề To Bản Corodomo */}
        <div className="lg:col-span-7 flex flex-col gap-3 lg:sticky lg:top-[72px] self-start">
          {/* Khung Video Aspect-Video */}
          <div className="bg-black rounded-3xl overflow-hidden shadow-xl aspect-video relative flex flex-col items-center justify-center border border-slate-800">
            <div
              className={`w-full h-full ${isVideoHidden ? "invisible" : "visible"}`}
            >
              <div id={playerId} className="w-full h-full" />
            </div>

            {/* Màn Che Khi Bật "Ẩn video" */}
            {isVideoHidden && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs gap-3 p-6 text-center z-20">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
                  <EyeOff className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-200 text-sm">
                    Chế độ ẩn video đang bật
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Tập trung hoàn toàn thính giác vào câu thoại
                  </p>
                </div>
                <button
                  onClick={() => setIsVideoHidden(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Hiện lại video
                </button>
              </div>
            )}

            {/* Thông báo dự phòng nếu YouTube hạn chế xem */}
            {playerError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-white text-xs gap-3 p-6 text-center z-20">
                <p className="text-amber-400 font-bold">{playerError}</p>
                <div className="flex gap-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở trên YouTube</span>
                  </a>
                  <button
                    onClick={() => speakSentence(currentSentence)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs"
                  >
                    Nghe giọng đọc thay thế
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thanh Điều Khiển Ngay Dưới Video (Corodomo Style) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Cụm nút chuyển câu: [|<] [⟲] [▶] [>|] */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => jumpToSentence(currentSentenceIdx - 1)}
                disabled={currentSentenceIdx === 0}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                title="Câu trước (Mũi tên Trái)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleReplayCurrent}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="Lặp lại câu này (Phím R)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handlePlayPause}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white transition cursor-pointer shadow-sm flex items-center gap-1.5"
                title={isPlaying ? "Tạm dừng (Phím Cách)" : "Phát (Phím Cách)"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                <span className="text-xs font-bold font-mono">
                  {isPlaying ? "Tạm dừng" : isSentenceCompleted ? "Tiếp tục" : "Phát"}
                </span>
              </button>

              <button
                onClick={() => jumpToSentence(currentSentenceIdx + 1)}
                disabled={currentSentenceIdx >= sentences.length - 1}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                title="Câu kế tiếp (Mũi tên Phải)"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              {syncOffsetMs !== 0 && (
                <button
                  onClick={() => setSyncOffsetMs(0)}
                  className="text-[10px] text-rose-500 hover:underline font-bold ml-0.5 cursor-pointer"
                  title="Đặt lại về mặc định"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Cụm tiện ích: [Tự ngắt câu] [Lặp A-B] [Romaji] [Furigana] [Dịch] [1x] */}
            <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
              {/* Switch Tự ngắt câu */}
              <button
                onClick={() => setAutoPause(!autoPause)}
                className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                  autoPause
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
                title="Tự dừng lại sau mỗi câu để bạn luyện bắt chước (Shadowing)"
              >
                <span className={`w-2 h-2 rounded-full ${autoPause ? "bg-emerald-600 animate-pulse" : "bg-slate-400"}`} />
                <span>Tự ngắt câu</span>
              </button>

              {/* Toggle Lặp câu A-B */}
              <button
                onClick={() => setIsAbLooping(!isAbLooping)}
                className={`px-2 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                  isAbLooping
                    ? "bg-teal-50 border-teal-300 text-teal-800 font-bold shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
                title="Lặp đi lặp lại câu thoại hiện tại"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Lặp</span>
              </button>

              {/* Toggle Romaji */}
              <button
                onClick={() => setShowRomaji(!showRomaji)}
                className={`px-2 py-1.5 rounded-xl border transition cursor-pointer ${
                  showRomaji
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
                title="Bật/Tắt hiển thị Romaji"
              >
                Romaji
              </button>

              {/* Toggle Furigana */}
              <button
                onClick={() => setShowFurigana(!showFurigana)}
                className={`px-2 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                  showFurigana
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
                title="Bật/Tắt hiển thị Furigana trên chữ Hán (Phím F)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Furi</span>
              </button>

              {/* Toggle Bản dịch */}
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-2 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                  showTranslation
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
                title="Bật/Tắt hiển thị nghĩa tiếng Việt (Phím T)"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Dịch</span>
              </button>

              {/* Tốc độ */}
              <button
                onClick={handleToggleSpeed}
                className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono transition cursor-pointer"
                title="Đổi tốc độ phát (0.75x, 1x, 1.25x)"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
          {/* KHUNG PHỤ ĐỀ THÔNG MINH CORODOMO (KARAOKE HIGHLIGHT CHỮ ĐANG ĐỌC) */}
          <ShadowingKaraokeDisplay
            currentSentenceIdx={currentSentenceIdx}
            totalSentences={sentences.length}
            currentSentence={currentSentence}
            currentTokens={currentTokens}
            currentProgress={currentProgress}
            isPlaying={isPlaying}
            isIntroPlaying={isIntroPlaying}
            timeToIntroEndSec={timeToIntroEndSec}
            showFurigana={showFurigana}
            showTranslation={showTranslation}
            liveTranslation={currentSentence ? liveTranslations[currentSentence.id] : undefined}
            showRomaji={showRomaji}
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
            onSpeakWord={speakWord}
            onSpeakSentence={speakSentence}
            isRecording={isRecording}
            recordDuration={recordDuration}
            recordedAudioUrl={recordedAudioUrl}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onReplayCurrent={handleReplayCurrent}
            isSentenceCompleted={isSentenceCompleted}
            onContinuePlayback={handlePlayPause}
          />
        </div>

        {/* CỘT PHẢI (5 CỘT): "BẢN CHÉP" (TRANSCRIPT) HOẶC "CHÉP CHÍNH TẢ" */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {topMode === "SHADOWING" ? (
            /* =========================================================================
               CHẾ ĐỘ SHADOWING: HIỂN THỊ "BẢN CHÉP" (TRANSCRIPT DANH SÁCH CÂU)
               ========================================================================= */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col gap-4">
              {/* Header Bản Chép */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  BẢN CHÉP ({sentences.length} câu)
                </span>

                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <button
                    onClick={() => setShowFurigana(!showFurigana)}
                    className="hover:text-emerald-600 transition flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Furigana</span>
                  </button>

                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="hover:text-emerald-600 transition flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                  >
                    <Languages className="w-3 h-3" />
                    <span>Trans</span>
                  </button>
                </div>
              </div>

              <div
                ref={transcriptContainerRef}
                className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {sentences.map((st, idx) => {
                  const isActive = currentSentenceIdx === idx;
                  return (
                    <div
                      key={st.id || idx}
                      id={`transcript-sentence-${idx}`}
                      onClick={() => jumpToSentence(idx)}
                      className={`group relative p-4 rounded-2xl transition-all cursor-pointer flex gap-3 ${
                        isActive
                          ? "bg-emerald-50/80 border border-emerald-400 shadow-md shadow-emerald-100"
                          : "bg-white border border-transparent hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      {/* Play Button Icon (Left) */}
                      <div className="shrink-0 mt-1">
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"}`}
                        >
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 gap-1.5">
                        {/* Tiếng Nhật */}
                        <div
                          className={`font-japanese font-bold text-[15px] leading-loose ${isActive ? "text-emerald-900" : "text-slate-700"}`}
                          dangerouslySetInnerHTML={{
                            __html: showFurigana
                              ? st.furigana || st.sentenceJp
                              : st.sentenceJp,
                          }}
                        />

                        {/* Tiếng Việt */}
                        {showTranslation && (
                          <p className={`text-sm ${isActive ? 'text-emerald-700/80 font-medium' : 'text-slate-500'}`}>
                            {st.sentenceVi || liveTranslations[st.id] || 'Bản dịch đang được cập nhật...'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* =========================================================================
               CHẾ ĐỘ DICTATION: GÕ CHÍNH TẢ & GHÉP CÂU
               ========================================================================= */
            <ShadowingDictationView
              currentSentence={currentSentence}
              dictationSubMode={dictationSubMode}
              onChangeSubMode={setDictationSubMode}
              userInput={userInput}
              onChangeUserInput={setUserInput}
              isHintRevealed={isHintRevealed}
              onToggleHint={() => setIsHintRevealed(!isHintRevealed)}
              hasCheckedAnswer={hasCheckedAnswer}
              isAnswerCorrect={isAnswerCorrect}
              diffResult={diffResult}
              onCheckTypingAnswer={checkTypingAnswer}
              onNextSentence={() => jumpToSentence(currentSentenceIdx + 1)}
              canNext={currentSentenceIdx < sentences.length - 1}
              scrambledWords={scrambledWords}
              selectedWordChips={selectedWordChips}
              onSelectWordChip={(word, idx) => {
                setSelectedWordChips((prev) => [...prev, word]);
                setScrambledWords((prev) => prev.filter((_, i) => i !== idx));
              }}
              onDeselectWordChip={(word, idx) => {
                setSelectedWordChips((prev) =>
                  prev.filter((_, i) => i !== idx),
                );
                setScrambledWords((prev) => [...prev, word]);
              }}
              isOrderingChecked={isOrderingChecked}
              isOrderingCorrect={isOrderingCorrect}
              onCheckOrderingAnswer={checkOrderingAnswer}
              onResetOrdering={() =>
                currentSentence &&
                initScrambledWords(currentSentence.sentenceJp)
              }
            />
          )}
        </div>
      </div>

      {/* Phím Tắt Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-emerald-600" />
              Bảng Phím Tắt Tiện Dụng
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Phát / Dừng video</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold">
                  Space
                </kbd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Nghe lại câu hiện tại</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold">
                  R
                </kbd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Câu trước</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold">
                  ← (Trái)
                </kbd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Câu tiếp theo</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold">
                  → (Phải)
                </kbd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Bật/Tắt Furigana</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold">
                  F
                </kbd>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Bật/Tắt bản dịch</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold">
                  T
                </kbd>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
