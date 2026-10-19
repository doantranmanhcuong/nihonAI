'use client';

export interface UserPreferences {
  furiganaMode: 'always' | 'hover' | 'hidden';
  ttsSpeed: '0.8' | '1.0' | '1.2';
  reviewMode: 'flashcard' | 'quiz';
  soundEffects: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  furiganaMode: 'always',
  ttsSpeed: '1.0',
  reviewMode: 'flashcard',
  soundEffects: true,
};

const STORAGE_KEY = 'nihonai_preferences';

export const getStudyPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const applyGlobalPreferences = (prefs?: UserPreferences) => {
  if (typeof window === 'undefined') return;
  const current = prefs || getStudyPreferences();
  document.documentElement.setAttribute('data-furigana', current.furiganaMode);
  document.body?.setAttribute('data-furigana', current.furiganaMode);
};

export const saveStudyPreferences = (prefs: UserPreferences) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  applyGlobalPreferences(prefs);
  window.dispatchEvent(new CustomEvent('nihonai_preferences_changed', { detail: prefs }));
};

export const cleanJapaneseTextForSpeech = (rawText: string): string => {
  if (!rawText) return '';
  return rawText
    // 1. Loại bỏ các thẻ <rt> và <rp> trước để tránh đọc lặp cả chữ Hán lẫn phiên âm Furigana
    .replace(/<rt[\s\S]*?<\/rt>/gi, '')
    .replace(/<rp[\s\S]*?<\/rp>/gi, '')
    // 2. Loại bỏ các thẻ HTML còn lại (<ruby>, <div>, <span>...)
    .replace(/<[^>]+>/g, ' ')
    // 3. Loại bỏ nhãn metadata như [N3] CÂU 32: hoặc [Phương án 1]
    .replace(/\[\s*N[1-5]\s*\]\s*CÂU\s*\d+[^:：]*[:：]?/gi, '')
    .replace(/\[[^\]]*\]/g, ' ')
    // 4. Loại bỏ ký hiệu markdown (**bold**, *italic*)
    .replace(/[*_~`#]/g, '')
    // 5. Loại bỏ phiên âm trong ngoặc đơn như （あいまい） nếu đã có chữ Hán phía trước
    .replace(/（[^）]*）/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const speakJapanese = (text: string, customRate?: number) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = cleanJapaneseTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';

    const prefs = getStudyPreferences();
    const rate = customRate !== undefined ? customRate : parseFloat(prefs.ttsSpeed) || 1.0;
    utterance.rate = rate;

    // Ưu tiên chọn giọng đọc tiếng Nhật tự nhiên nếu trình duyệt có sẵn
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith('ja') || v.lang.includes('JP'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playFeedbackSound = (isCorrect: boolean) => {
  const prefs = getStudyPreferences();
  if (!prefs.soundEffects) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isCorrect) {
      // Âm thanh chúc mừng (Chuông 2 nốt trong trẻo: E5 -> A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Âm thanh nhắc nhở nhẹ nhàng (2 nốt trầm: C4 -> A3)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.setValueAtTime(220.0, now + 0.15); // A3

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
};
