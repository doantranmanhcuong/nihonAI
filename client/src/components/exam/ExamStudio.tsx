'use client';

import { CanvasOverlay } from './CanvasOverlay';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Pen, ToggleLeft, ToggleRight, LayoutGrid, Info,
  Award,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  AlertCircle,
  Play,
  Eye,
  EyeOff,
  Clock,
  Check,
  ShieldCheck,
  ArrowLeft,
  HelpCircle,
  Compass,
  FileText,
  Search,
  Headphones,
  Volume2,
  VolumeX,
  Pause,
  SlidersHorizontal,
  Layers,
  Languages,
  BookOpenCheck,
  Filter,
  Zap,
  FastForward,
  Rewind,
  Maximize2,
  BrainCircuit,
  Target,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  MessageSquareQuote,
  CheckCircle,
  Lock,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { JLPTExam as ExamBank, ExamQuestionItem as Question } from './exam.types';

import {
  JLPTExam,
  JLPTLevel,
  ExamQuestionItem,
  ExamEvaluationResult,
  AIExplanationResult,
  ExamSectionType,
  ExamDiagnosticReport,
  DiagnosticLessonLearned,
  QuestionResultItem
} from './exam.types';
import { ExamApi } from './exam.api';
import { NotebookApi } from '../personal/notebook.api';
import { BookmarkPlus, BookmarkCheck, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { cleanJapaneseTextForSpeech } from '@/utils/studyPreferences';

type ExamMode = 'exam' | 'practice';
type ViewScreen = 'catalog' | 'intro' | 'taking' | 'break' | 'result';
type StudioTab = 'full_exam' | 'skill_practice' | 'mistake_bank';

export interface ExamStudioProps {
  onNavigateToReading?: () => void;
  onNavigateToGrammar?: () => void;
  onNavigateToVocab?: () => void;
}

const resolveAudioUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000';
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Cấu hình các dạng bài Mondai chuyên sâu cho từng phân môn (Tiện ích 1: Mondai Drills)
const MONDAI_OPTIONS: Record<string, { id: string; label: string; desc: string }[]> = {
  vocab: [
    { id: 'kanji_reading', label: 'Mondai 1: Cách đọc Hán tự (漢字読み)', desc: 'Chọn cách đọc Hiragana đúng' },
    { id: 'orthography', label: 'Mondai 2: Cách viết Hán tự (表記)', desc: 'Chọn cách viết Kanji/Kana đúng' },
    { id: 'context', label: 'Mondai 3: Từ vựng theo ngữ cảnh (文脈規定)', desc: 'Điền từ vựng chuẩn vào chỗ trống' },
    { id: 'paraphrase', label: 'Mondai 4: Từ gần nghĩa / Thay thế (言い換え類義)', desc: 'Chọn từ đồng nghĩa/cụm từ tương đương' },
    { id: 'usage', label: 'Mondai 5: Cách dùng từ chuẩn (用法)', desc: 'Chọn câu sử dụng từ vựng đúng ngữ cảnh nhất' }
  ],
  grammar: [
    { id: 'grammar_form', label: 'Mondai 1: Lựa chọn mẫu ngữ pháp (文法形式)', desc: 'Chọn hình thức ngữ pháp chuẩn điền vào câu' },
    { id: 'sentence_composition', label: 'Mondai 2: Sắp xếp câu có dấu sao ★ (文の組み立て)', desc: 'Sắp xếp 4 cụm từ và chọn đáp án ở vị trí ngôi sao 【★】' },
    { id: 'passage_grammar', label: 'Mondai 3: Ngữ pháp trong đoạn văn (文章の文法)', desc: 'Chọn liên từ và hình thái diễn đạt trong bài văn' }
  ],
  reading: [
    { id: 'short_reading', label: 'Mondai 1: Đọc hiểu văn bản ngắn (短文読解)', desc: 'Đoạn văn ngắn 150-200 chữ (thông báo, nhật ký)' },
    { id: 'medium_reading', label: 'Mondai 2: Đọc hiểu văn bản vừa (中文読解)', desc: 'Đoạn văn bình luận, phân tích lý do' },
    { id: 'long_reading', label: 'Mondai 3: Đọc hiểu trường văn (長文読解)', desc: 'Đoạn văn nghị luận dài, phân tích sâu' },
    { id: 'info_search', label: 'Mondai 4: Tìm kiếm thông tin / Biểu bảng (情報検索)', desc: 'Tra cứu thông tin trên tờ rơi, thông báo tuyển sinh' }
  ],
  listening: [
    { id: 'task_based', label: 'Mondai 1: Hiểu nhiệm vụ hành động (課題理解)', desc: 'Nghe hội thoại và xác định hành động nhân vật phải làm tiếp theo' },
    { id: 'point_based', label: 'Mondai 2: Hiểu điểm trọng tâm (ポイント理解)', desc: 'Nghe tìm lý do, nguyên nhân cốt lõi trong hội thoại' },
    { id: 'overview_based', label: 'Mondai 3: Hiểu ý bao quát (概要理解)', desc: 'Nghe đoạn độc thoại hoặc bài nói và nắm bắt chủ đề chính' },
    { id: 'quick_response', label: 'Mondai 4: Phản xạ hội thoại tức thì (即時応答)', desc: 'Nghe câu thoại ngắn và chọn phản xạ đối đáp tự nhiên nhất' }
  ]
};

const MONDAI_KEYWORDS: Record<string, string[]> = {
  kanji_reading: ['kanji_reading', '漢字読み'],
  orthography: ['orthography', '表記'],
  context: ['context', '文脈規定'],
  paraphrase: ['paraphrase', '言い換え'],
  usage: ['usage', '用法'],
  grammar_form: ['grammar_form', '文法形式'],
  sentence_composition: ['sentence_composition', '文の組み立て', '★'],
  passage_grammar: ['passage_grammar', '文章の文法'],
  short_reading: ['short_reading', '短文'],
  medium_reading: ['medium_reading', '中文'],
  long_reading: ['long_reading', '長文'],
  info_search: ['info_search', '情報検索'],
  task_based: ['task_based', '課題理解'],
  point_based: ['point_based', 'ポイント理解'],
  overview_based: ['overview_based', '概要理解'],
  quick_response: ['quick_response', '即時応答', '発言']
};

const OPTION_LABELS = ['①', '②', '③', '④'] as const;

const formatOptLabel = (idx: number | null | undefined): string => {
  if (idx === null || idx === undefined || idx < 0 || idx > 3) return '';
  return OPTION_LABELS[idx] || String(idx + 1);
};

const getMondaiInstruction = (subType?: string, subTypeLabel?: string): string => {
  const sub = (subType || '').toLowerCase();
  const lbl = subTypeLabel || '';

  if (sub === 'kanji_reading' || lbl.includes('漢字読み') || lbl.includes('Cách đọc')) {
    return '＿＿＿の言葉の読み方として最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'orthography' || lbl.includes('表記') || lbl.includes('Cách viết')) {
    return '＿＿＿の言葉を漢字（またはひらがな）で書くとき、最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'context' || lbl.includes('文脈規定') || lbl.includes('ngữ cảnh')) {
    return '（　　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'paraphrase' || lbl.includes('言い換え') || lbl.includes('類義') || lbl.includes('đồng nghĩa')) {
    return '＿＿＿の言葉に意味が最も近いものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'usage' || lbl.includes('用法') || lbl.includes('Cách dùng')) {
    return '次の言葉の使い方として最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'grammar_form' || lbl.includes('文法形式') || lbl.includes('mẫu ngữ pháp')) {
    return '次の文の（　　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'sentence_order' || sub === 'sentence_composition' || lbl.includes('組み立て') || lbl.includes('sắp xếp')) {
    return '次の文の　★　に入る最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'passage_grammar' || lbl.includes('文章の文法')) {
    return '文章全体の趣旨を踏まえて、（　　）に入る最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'short_reading' || lbl.includes('短文')) {
    return '次の文章を読んで、後の問いに対する答えとして最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'medium_reading' || lbl.includes('中文')) {
    return '次の文章を読んで、後の問いに対する答えとして最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'long_reading' || lbl.includes('長文') || lbl.includes('trường văn')) {
    return '次の文章を読んで、筆者の主張や理由として最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'info_search' || lbl.includes('情報検索') || lbl.includes('thông tin')) {
    return '右（または下）の案内を読んで、後の問いに対する答えとして最もよいものを、１・２・３・４から一つ選びなさい。';
  }
  if (sub === 'task_listen' || sub === 'task_based' || lbl.includes('課題理解') || lbl.includes('nhiệm vụ')) {
    return 'まず質問を聞いてください。それから話を聞いて、問題用紙の１から４の中から、最もよいものを一つ選んでください。';
  }
  if (sub === 'point_listen' || sub === 'point_based' || lbl.includes('ポイント理解') || lbl.includes('then chốt')) {
    return 'まず質問を聞いてください。そのあと問題用紙を読んで、１から４の中から最もよいものを一つ選んでください。';
  }
  if (sub === 'overview_listen' || sub === 'overview_based' || lbl.includes('概要理解') || lbl.includes('tổng thể')) {
    return 'まず話を聞いてください。それから質問と選択肢を聞いて、１から４の中から最もよいものを一つ選んでください。';
  }
  if (sub === 'quick_response' || lbl.includes('即時応答') || lbl.includes('phản xạ')) {
    return '短い文を聞いて、その返事として最もよいものを、１から３（または４）の中から一つ選んでください。';
  }
  return '最もよいものを、１・２・３・４から一つ選びなさい。';
};

// Clean các số thứ tự trong ngoặc tròn như （ 22 ） hay (22) để đồng bộ với số câu thực tế
const cleanQuestionText = (qText: string, orderNum?: number): string => {
  if (!qText) return '';
  if (orderNum) {
    return qText.replace(/[（(]\s*\d+\s*[）)]/g, `【 ${orderNum} 】`);
  }
  return qText.replace(/[（(]\s*\d+\s*[）)]/g, '【 空欄 】');
};

const cleanQuestionVi = (viText?: string | null, orderNum?: number): string => {
  if (!viText) return '';
  if (orderNum) {
    return viText.replace(/[（(]\s*\d+\s*[）)]/g, `[${orderNum}]`);
  }
  return viText.replace(/[（(]\s*\d+\s*[）)]/g, '[chỗ trống]');
};

// ========================================================
// HỆ THỐNG ÂM THANH CHOUKAI: SOUND EFFECTS (SFX) & ĐA GIỌNG ĐỌC
// ========================================================
export type SpeakerRole = 'narrator' | 'male' | 'male_senior' | 'female' | 'female_senior' | 'sfx';

class ChoukaiAudioFx {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Tiếng chuông khai đề thi JLPT (JLPT Official Chime: 880Hz -> 587Hz)
  static playExamChime(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const now = ctx.currentTime;
        const notes = [
          { freq: 880, start: 0.0, dur: 0.7 },
          { freq: 587.33, start: 0.22, dur: 1.0 }
        ];
        notes.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);
          gain.gain.setValueAtTime(0.16, now + start);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        });
        setTimeout(resolve, 1100);
      } catch (e) {
        resolve();
      }
    });
  }

  // 2. Tiếng chuông ga tàu / phát xe điện (JR Station Departure Melody & Rail Glide)
  static playTrainMelody(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const now = ctx.currentTime;
        const melody = [
          { f: 659.25, s: 0.0, d: 0.3 },
          { f: 493.88, s: 0.25, d: 0.3 },
          { f: 415.30, s: 0.5, d: 0.35 },
          { f: 329.63, s: 0.8, d: 0.7 }
        ];
        melody.forEach(({ f, s, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + s);
          gain.gain.setValueAtTime(0.14, now + s);
          gain.gain.exponentialRampToValueAtTime(0.001, now + s + d);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + s);
          osc.stop(now + s + d);
        });
        setTimeout(resolve, 1400);
      } catch (e) {
        resolve();
      }
    });
  }

  // 3. Tiếng xe cộ / giao thông đường phố (Car Traffic Sound & Soft Horn)
  static playCarTrafficSound(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.linearRampToValueAtTime(145, now + 0.5);
        osc.frequency.linearRampToValueAtTime(105, now + 1.1);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.1);

        [0.2, 0.42].forEach((offset) => {
          const horn = ctx.createOscillator();
          const hornGain = ctx.createGain();
          horn.type = 'sine';
          horn.frequency.setValueAtTime(784, now + offset);
          hornGain.gain.setValueAtTime(0.05, now + offset);
          hornGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
          horn.connect(hornGain);
          hornGain.connect(ctx.destination);
          horn.start(now + offset);
          horn.stop(now + offset + 0.12);
        });

        setTimeout(resolve, 1200);
      } catch (e) {
        resolve();
      }
    });
  }

  // 4. Tiếng chuông chốt câu hỏi (Question Ping: 660Hz -> 520Hz)
  static playQuestionChime(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const now = ctx.currentTime;
        const notes = [
          { freq: 659.25, start: 0.0, dur: 0.35 },
          { freq: 523.25, start: 0.18, dur: 0.65 }
        ];
        notes.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + start);
          gain.gain.setValueAtTime(0.12, now + start);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        });
        setTimeout(resolve, 750);
      } catch (e) {
        resolve();
      }
    });
  }
}

interface DialogueTurn {
  role: SpeakerRole;
  speakerName?: string;
  text: string;
  sfxType?: 'chime' | 'train' | 'car' | 'question_chime';
  pauseAfterMs: number;
}

const parseDialogueTurns = (q: ExamQuestionItem, fallbackPassage?: string): DialogueTurn[] => {
  const turns: DialogueTurn[] = [];

  // 0. Chuông khai đề JLPT
  turns.push({
    role: 'sfx',
    speakerName: 'Chuông phòng thi',
    sfxType: 'chime',
    text: '【JLPT 開会チャイム】',
    pauseAfterMs: 600
  });

  // 1. Chỉ dẫn mở đầu chuẩn đề thi
  if (q.subTypeLabel?.includes('課題理解') || q.subType === 'task_listen') {
    turns.push({
      role: 'narrator',
      speakerName: 'MC',
      text: '問題１では、まず質問を聞いてください。それから話を聞いて、問題用紙の１から４の中から、最もよいものを一つ選んでください。',
      pauseAfterMs: 1200
    });
  } else if (q.subTypeLabel?.includes('ポイント理解') || q.subType === 'point_listen') {
    turns.push({
      role: 'narrator',
      speakerName: 'MC',
      text: '問題２では、まず質問を聞いてください。そのあと問題用紙を読んでください。それから話を聞いて、問題用紙の１から４の中から、最もよいものを一つ選んでください。',
      pauseAfterMs: 1200
    });
  } else if (q.subTypeLabel?.includes('概要理解') || q.subType === 'overview_listen') {
    turns.push({
      role: 'narrator',
      speakerName: 'MC',
      text: '問題３では、まず話を聞いてください。それから質問と選択肢を聞いて、１から４の中から、最もよいものを一つ選んでください。',
      pauseAfterMs: 1200
    });
  } else if (q.subTypeLabel?.includes('即時応答') || q.subType === 'quick_response') {
    turns.push({
      role: 'narrator',
      speakerName: 'MC',
      text: '問題４では、短い文を聞いて、その返事として最もよいものを、１から３の中から一つ選んでください。',
      pauseAfterMs: 1000
    });
  }

  turns.push({ role: 'narrator', speakerName: 'MC', text: 'では、始めます。', pauseAfterMs: 1000 });

  const cleanQ = cleanJapaneseTextForSpeech(q.question || '').replace(/[「」『』【】]/g, ' ').trim();
  const rawPassage = q.passage || fallbackPassage || '';
  const rawPassageClean = cleanJapaneseTextForSpeech(rawPassage);

  // 2. Câu hỏi trước hội thoại (với Mondai 1 & 2): Chỉ đọc nếu trong rawPassage chưa có câu này
  const isTaskOrPoint =
    q.subTypeLabel?.includes('課題理解') ||
    q.subTypeLabel?.includes('ポイント理解') ||
    q.subType === 'task_listen' ||
    q.subType === 'point_listen';

  if (isTaskOrPoint && cleanQ && !rawPassageClean.startsWith(cleanQ) && !rawPassageClean.includes(cleanQ)) {
    turns.push({ role: 'narrator', speakerName: 'MC', text: cleanQ, pauseAfterMs: 1200 });
  }

  // 3. Phân tách hội thoại trong passage
  if (rawPassage) {
    if (/駅|電車|新幹線|ホーム|地下鉄/.test(rawPassage)) {
      turns.push({
        role: 'sfx',
        speakerName: 'Ga tàu điện Nhật Bản',
        sfxType: 'train',
        text: '【駅の発車メロディ・走行音】',
        pauseAfterMs: 800
      });
    } else if (/車|道路|交差点|バス|タクシー|運転/.test(rawPassage)) {
      turns.push({
        role: 'sfx',
        speakerName: 'Giao thông đường phố',
        sfxType: 'car',
        text: '【街の車走行音・ソフトクラクション】',
        pauseAfterMs: 800
      });
    }

    const rawLines = rawPassage.split(/[\n\r]+/);
    for (const raw of rawLines) {
      let l = raw.trim();
      if (!l) continue;

      if (/tiếp tục|xem passage|câu tiếp theo/i.test(l)) continue;
      if (/^(社員|男|女|学生|相手)\s*[:：]?\s*[\(（\s]*[\)）]?\s*$/.test(l)) continue;
      if (l.startsWith('質問。') || l.startsWith('質問:')) continue;

      let role: SpeakerRole = 'narrator';
      let speakerName = 'Người dẫn chuyện';
      let spokenText = l;

      // 1. Nhân vật Nam lớn tuổi / Lãnh đạo / Cửa hàng trưởng / Người thứ 3
      const seniorMaleMatch = l.match(/^(店長|社長|部長|課長|専務|役員|教授|先生|父|父親|おじいさん|男性２|男性A|男性B)[：:\s]/);
      // 2. Nhân vật Nữ lớn tuổi / Khách hàng / Quản lý nữ / Người thứ 3
      const seniorFemaleMatch = l.match(/^(母|母親|女性役員|女性客|女将|女性２|女性A|女性B)[：:\s]/);
      // 3. Nhân vật Nam tiêu chuẩn
      const maleMatch = l.match(/^(男|男の人|男性|彼|男の学生|男子学生|李君|田中|男性社員|同僚)[：:\s]/);
      // 4. Nhân vật Nữ tiêu chuẩn
      const femaleMatch = l.match(/^(女|女の人|女性|彼女|女子学生|店員|鈴木|佐藤|山田|学生|客|女性社員)[：:\s]/);
      // 5. Người dẫn chuyện / Thông báo
      const narratorMatch = l.match(/^(ナレーション|案内|問題文|アナウンサー|司会)[：:\s]/);

      if (seniorMaleMatch) {
        role = 'male_senior';
        speakerName = seniorMaleMatch[1];
        spokenText = l.slice(seniorMaleMatch[0].length).trim();
      } else if (seniorFemaleMatch) {
        role = 'female_senior';
        speakerName = seniorFemaleMatch[1];
        spokenText = l.slice(seniorFemaleMatch[0].length).trim();
      } else if (maleMatch) {
        role = 'male';
        speakerName = maleMatch[1];
        spokenText = l.slice(maleMatch[0].length).trim();
      } else if (femaleMatch) {
        role = 'female';
        speakerName = femaleMatch[1];
        spokenText = l.slice(femaleMatch[0].length).trim();
      } else if (narratorMatch) {
        role = 'narrator';
        speakerName = narratorMatch[1];
        spokenText = l.slice(narratorMatch[0].length).trim();
      }

      // Làm sạch text bằng cleanJapaneseTextForSpeech để loại bỏ triệt để HTML và tag Furigana bị đọc lặp
      spokenText = cleanJapaneseTextForSpeech(spokenText).replace(/[「」『』]/g, ' ').trim();
      
      // Bỏ qua dòng nếu trùng hoàn toàn với câu hỏi đã đọc ở cuối
      if (cleanQ && (spokenText === cleanQ || spokenText === `質問。${cleanQ}`)) {
        continue;
      }

      if (spokenText) {
        turns.push({ role, speakerName, text: spokenText, pauseAfterMs: 650 });
      }
    }
  }

  // 4. Chuông chốt câu hỏi & Đọc câu hỏi sau hội thoại (chuẩn thi JLPT)
  if (cleanQ) {
    turns.push({
      role: 'sfx',
      speakerName: 'Chuông chốt câu hỏi',
      sfxType: 'question_chime',
      text: '【質問ピンポンチャイム】',
      pauseAfterMs: 400
    });
    turns.push({ role: 'narrator', speakerName: 'MC', text: '質問。' + cleanQ, pauseAfterMs: 1200 });
  }

  // 5. Đọc các phương án nếu là 即時応答
  if ((q.subTypeLabel?.includes('即時応答') || q.subType === 'quick_response') && q.options) {
    const numWords = ['一番', '二番', '三番', '四番'];
    q.options.slice(0, 3).forEach((opt, idx) => {
      const cleanOpt = cleanJapaneseTextForSpeech(opt).replace(/[「」『』]/g, '').trim();
      turns.push({
        role: 'narrator',
        speakerName: 'MC',
        text: `${numWords[idx] || idx + 1}番。${cleanOpt}。`,
        pauseAfterMs: 800
      });
    });
  }

  return turns;
};

// Helper hiển thị đoạn văn đọc hiểu / ngữ pháp đoạn văn với ô trống chuẩn JEES
const renderPassageWithHighlight = (passage: string, activeOrderNumber?: number) => {
    if (!passage) return '';
    if (!activeOrderNumber) {
      return `<p class="text-slate-900 text-sm md:text-base leading-loose whitespace-pre-line font-serif">${passage}</p>`;
    }

    const parts = passage.split(/(【\s*\d+\s*】|\[\s*\d+\s*\]|（\s*\d+\s*）)/g);
    const innerHtml = parts.map((part) => {
      const numMatch = part.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        const isActive = num === activeOrderNumber;
        if (isActive) {
          return `<span class="inline-flex items-center justify-center px-3 py-0.5 mx-1 rounded-sm font-black text-xs md:text-sm border-b-2 border-amber-500 bg-amber-50 text-amber-900 select-none align-baseline min-w-[3rem]">（　${num}　）</span>`;
        }
        return `<span class="inline-flex items-center justify-center px-2 py-0.5 mx-0.5 rounded-sm font-bold text-xs md:text-sm border-b border-slate-400 bg-slate-50 text-slate-700 select-none align-baseline min-w-[2.5rem]">（${num}）</span>`;
      }
      return part;
    }).join('');
    
    return `<div class="text-slate-900 text-sm md:text-base leading-loose whitespace-pre-line font-serif">${innerHtml}</div>`;
  };

export function ExamStudio({ onNavigateToReading, onNavigateToGrammar, onNavigateToVocab }: ExamStudioProps) {
  const router = useRouter();
  const [examMode, setExamMode] = useState<'practice' | 'exam'>('exam');
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'catalog' | 'taking' | 'result'>('catalog');
  const [examData, setExamData] = useState<ExamBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State làm bài
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: number }>({});
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  
  
  
  const [activeExam, setActiveExam] = useState<any>(null);
  const [showProgressSidebar, setShowProgressSidebar] = useState<boolean>(false);
  const [showTranslations, setShowTranslations] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectionPopup, setSelectionPopup] = useState<any>(null);
  
  const [selectedSkillSection, setSelectedSkillSection] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStudioTab, setActiveStudioTab] = useState<string>('catalog');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [pendingCoverExam, setPendingCoverExam] = useState<any>(null);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [examList, setExamList] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<any>(null);
  
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };


  const { isAuthenticated, openAuthModal, loginDemo } = useAuth();

  // Clear state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setMistakeItems([]);
      
      // Do not clear activeExam here unless we want to boot them out of a guest exam
    } else {
      // Reload mistake items for new user
      NotebookApi.getItems({ tags: 'Câu_sai' })
        .then((items) => setMistakeItems(items || []))
        .catch(() => {});
        
      
    }
  }, [isAuthenticated]);




  // State tính năng Đánh giá đa chiều: Gạch bỏ phương án sai (Strikethrough / Elimination)
  const [eliminatedOptions, setEliminatedOptions] = useState<{ [questionId: string]: number[] }>({});

  // State theo dõi thời gian dừng ở câu hiện tại (Pacing Guide cảnh báo nhịp độ)
  const [questionTimeSpentSeconds, setQuestionTimeSpentSeconds] = useState<number>(0);

  // State Nghe hiểu (Choukai Media Player)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);   // UI state: đang ở trạng thái tạm dừng
  const [showListeningScript, setShowListeningScript] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<number>(1.0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSpeakerRole, setCurrentSpeakerRole] = useState<SpeakerRole | null>(null);
  const [currentSpeakerName, setCurrentSpeakerName] = useState<string | null>(null);
  const isAudioPlayingRef = useRef<boolean>(false);
  const isAudioPausedRef = useRef<boolean>(false);   // Phân biệt "Tạm dừng" vs "Dừng hẳn"
  const pausedTurnIndexRef = useRef<number>(0);       // Lưu vị trí turn khi tạm dừng
  const speechSequenceSessionRef = useRef<number>(0);
  const currentTurnIndexRef = useRef<number>(0);
  const activeDialogueTurnsRef = useRef<DialogueTurn[]>([]);
  const speechSequenceTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const speechTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State kết quả & AI
  const [examResult, setExamResult] = useState<ExamEvaluationResult | null>(null);
  const [resultFilter, setResultFilter] = useState<'all' | 'wrong' | 'correct'>('wrong');
  const [resultSectionFilter, setResultSectionFilter] = useState<string>('all');
  const [aiExplanations, setAiExplanations] = useState<{ [questionId: string]: AIExplanationResult }>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<ExamDiagnosticReport | null>(null);
  const [isLoadingDiagnostic, setIsLoadingDiagnostic] = useState<boolean>(false);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  // State Ngân hàng câu sai (Mistake Bank & Spaced Repetition SRS)
  const [mistakeItems, setMistakeItems] = useState<any[]>([]);
  const [isLoadingMistakes, setIsLoadingMistakes] = useState<boolean>(false);
  const [selectedMondaiFilter, setSelectedMondaiFilter] = useState<string>('ALL');
  const [expandedMistakes, setExpandedMistakes] = useState<Record<string, boolean>>({});
  const [expandAllMistakes, setExpandAllMistakes] = useState<boolean>(false);

  // State phương án thi (34 câu tinh gọn vs đầy đủ) & lưu sổ tay
  const [selectedFormat, setSelectedFormat] = useState<'express' | 'full'>('express');
  const [isSavingToNotebook, setIsSavingToNotebook] = useState<boolean>(false);
  const [savedNotebookMessage, setSavedNotebookMessage] = useState<string | null>(null);
  const [savedSingleNotebookIds, setSavedSingleNotebookIds] = useState<{ [qId: string]: boolean }>({});

  // State Nghe lại Audio & Xem Script trong màn hình Kết quả
  const [reviewAudioPlayingId, setReviewAudioPlayingId] = useState<string | null>(null);
  const [reviewExpandedScriptId, setReviewExpandedScriptId] = useState<string | null>(null);
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);

  const lessonByOrderMap = useMemo(() => {
    const map = new Map<number, DiagnosticLessonLearned>();
    if (diagnosticReport?.lessonsLearned) {
      for (const l of diagnosticReport.lessonsLearned) {
        map.set(l.orderNumber, l);
      }
    }
    return map;
  }, [diagnosticReport]);

  // Tải danh sách đề thi từ API
// Cảnh báo khi thoát trang trong quá trình thi
  useEffect(() => {
    if (currentScreen === 'taking' && examMode === 'exam') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn thoát? Bài thi chưa nộp sẽ không được lưu.';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [currentScreen, examMode]);

  useEffect(() => {
    let isMounted = true;
    const loadExams = async () => {
      setIsLoadingList(true);
      const data = await ExamApi.getExamList(selectedLevel, selectedYear, selectedSession);
      if (isMounted) {
        setExamList(data);
        setIsLoadingList(false);
      }
    };
    loadExams();
    return () => {
      isMounted = false;
    };
  }, [selectedLevel, selectedYear, selectedSession]);

  // Tải trước số lượng câu làm sai trên nhãn Tab ngay khi mở trang
  useEffect(() => {
    NotebookApi.getItems({ tags: 'Câu_sai' })
      .then((items) => setMistakeItems(items || []))
      .catch((err) => console.warn('Lỗi tải danh sách câu sai ban đầu:', err));
  }, []);

  // Tải danh sách câu làm sai khi vào tab Ngân hàng câu sai (Mistake Bank)
  useEffect(() => {
    if (activeStudioTab === 'mistake_bank') {
      setIsLoadingMistakes(true);
      NotebookApi.getItems({ tags: 'Câu_sai' })
        .then((items) => setMistakeItems(items || []))
        .catch((err) => console.warn('Lỗi tải danh sách câu sai:', err))
        .finally(() => setIsLoadingMistakes(false));
    }
  }, [activeStudioTab]);

  // Hủy triệt để âm thanh khi rời khỏi ExamStudio
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      speechSequenceTimeoutsRef.current.forEach(clearTimeout);
      speechSequenceTimeoutsRef.current = [];
      if (speechTimerIntervalRef.current) {
        clearInterval(speechTimerIntervalRef.current);
        speechTimerIntervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Xử lý phím Escape
  useEffect(() => {
    if (!showSubmitModal && !showCoverModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSubmitModal(false);
        setShowCoverModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSubmitModal, showCoverModal]);

  // Tự động cuộn lên đầu câu hỏi khi chuyển câu & Reset audio & Reset thời gian làm câu
  useEffect(() => {
    if (currentScreen === 'taking') {
      setQuestionTimeSpentSeconds(0);
      const container = document.getElementById('exam-question-card');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      speechSequenceTimeoutsRef.current.forEach(clearTimeout);
      speechSequenceTimeoutsRef.current = [];
      if (speechTimerIntervalRef.current) {
        clearInterval(speechTimerIntervalRef.current);
        speechTimerIntervalRef.current = null;
      }
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
      isAudioPausedRef.current = false;
      pausedTurnIndexRef.current = 0;
      setCurrentSpeakerRole(null);
      setAudioCurrentTime(0);
      setAudioDuration(0);
      setShowListeningScript(false);
      activeDialogueTurnsRef.current = [];
    }
  }, [currentQuestionIndex, currentScreen]);

  // Hỗ trợ phím tắt 1, 2, 3, 4 để chọn đáp án và phím mũi tên điều hướng
  useEffect(() => {
    if (currentScreen !== 'taking' || !activeExam || !activeExam.questions) return;
    const currentQ = activeExam.questions[currentQuestionIndex];
    if (!currentQ) return;

    const handleExamKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal || showCoverModal) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIndex = parseInt(e.key, 10) - 1;
        if (currentQ.options && optIndex < currentQ.options.length) {
          handleSelectOption(currentQ.id, optIndex);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentQuestionIndex < activeExam.questions!.length - 1) {
          setCurrentQuestionIndex((prev: any) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex((prev: any) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleExamKeyDown);
    return () => window.removeEventListener('keydown', handleExamKeyDown);
  }, [currentScreen, currentQuestionIndex, activeExam, showSubmitModal, showCoverModal]);

  // Bộ đếm thời gian thi (Countdown Timer) & Bộ đếm thời gian làm câu hỏi hiện tại
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (currentScreen === 'taking' && isTimerRunning && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
        setQuestionTimeSpentSeconds((prev: any) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentScreen, isTimerRunning, timeRemainingSeconds]);

  // Mở modal bìa đề thi trước khi vào thi chính thức
  const handleOpenCoverModal = (exam: JLPTExam) => {
    setPendingCoverExam(exam);
    setShowCoverModal(true);
  };

  // Bắt đầu làm bài thi (hỗ trợ Phương án 1: 34 câu tinh gọn rút ngắn thời gian hoặc Phương án 2: Đầy đủ thời gian chuẩn)
  const handleStartExam = async (
    exam: JLPTExam,
    mode: ExamMode,
    section?: string,
    format: 'express' | 'full' = selectedFormat
  ) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setShowCoverModal(false);
    setIsLoadingList(true);
    setSelectedFormat(format);
    const fullExam = await ExamApi.getExamDetail(exam.id, section, format);
    setIsLoadingList(false);
    if (!fullExam) {
      showNotification('Không thể tải chi tiết đề thi.', 'error');
      return;
    }

    let finalQuestions = fullExam.questions || [];
    if (selectedMondaiFilter && selectedMondaiFilter !== 'ALL') {
      const kws = MONDAI_KEYWORDS[selectedMondaiFilter] || [selectedMondaiFilter];
      const mondaiMatched = finalQuestions.filter((q) =>
        kws.some((kw) => q.subType === kw || q.subTypeLabel?.includes(kw))
      );
      if (mondaiMatched.length > 0) {
        finalQuestions = mondaiMatched;
      }
    }

    setActiveExam({
      ...fullExam,
      questions: finalQuestions,
      totalQuestions: finalQuestions.length,
      format
    });
    setExamMode(mode);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAiExplanations({});
    setDiagnosticReport(null);
    setShowTranslations(false);
    setShowListeningScript(false);
    setSavedNotebookMessage(null);

    if (mode === 'exam') {
      // Don't start timer yet, show intro screen
      setCurrentScreen('intro');
    } else {
      setTimeRemainingSeconds(0);
      setIsTimerRunning(false);
      setCurrentScreen('taking');
    }
  };

const handleConfirmStartRealExam = () => {
    if (!activeExam) return;
    const minutes = activeExam.format === 'express'
      ? (activeExam.expressDurationMinutes || activeExam.durationMinutes || 50)
      : (activeExam.fullDurationMinutes || activeExam.durationMinutes || 155);
    setTimeRemainingSeconds(minutes * 60);
    setIsTimerRunning(true);
    setCurrentScreen('taking');
  };

  // Dừng hoặc tạm dừng âm thanh
  // isPause=true → ghi nhớ vị trí turn hiện tại để resume sau
  // isPause=false → dừng hẳn, reset về đầu
  const stopAllSpeechPlayback = (isPause = false) => {
    // Lưu vị trí turn khi tạm dừng
    if (isPause) {
      pausedTurnIndexRef.current = currentTurnIndexRef.current;
      isAudioPausedRef.current = true;
    } else {
      pausedTurnIndexRef.current = 0;
      isAudioPausedRef.current = false;
      currentTurnIndexRef.current = 0;
    }

    // INCREMENT SESSION TRƯỚC để mọi callback onend/onerror đang chờ đều bị invalidate
    speechSequenceSessionRef.current += 1;
    isAudioPlayingRef.current = false;

    // Xóa tất cả timeout đang chờ
    speechSequenceTimeoutsRef.current.forEach(clearTimeout);
    speechSequenceTimeoutsRef.current = [];
    if (speechTimerIntervalRef.current) {
      clearInterval(speechTimerIntervalRef.current);
      speechTimerIntervalRef.current = null;
    }

    // Chrome bug: cần cancel 2 lần để đảm bảo dừng hoàn toàn
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTimeout(() => { window.speechSynthesis.cancel(); }, 50);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsPlayingAudio(false);
    setIsAudioPaused(isPause);
    if (!isPause) {
      setCurrentSpeakerRole(null);
      setCurrentSpeakerName(null);
    }
  };

  // Điều khiển Play / Tạm dừng / Phát tiếp Audio Choukai
  const togglePlayAudio = (q?: ExamQuestionItem) => {
    const targetQ = q || (activeExam?.questions ? activeExam.questions[currentQuestionIndex] : null);
    if (!targetQ) return;

    // Nếu câu hỏi có audioUrl sẵn (từ file mp3 thực tế), ưu tiên phát qua HTML5 audio
    if (targetQ.audioUrl && audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
        setIsAudioPaused(true);
      } else {
        stopAllSpeechPlayback();
        audioRef.current.play().then(() => {
          setIsPlayingAudio(true);
          setIsAudioPaused(false);
        }).catch((err) => {
          console.warn('Audio tag playback failed, falling back to synthesis:', err);
          playDualVoiceChoukai(targetQ, 0);
        });
      }
      return;
    }

    // Dùng ref thay state để tránh stale closure
    const isSpeakingNow =
      isAudioPlayingRef.current ||
      (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking);

    if (isSpeakingNow) {
      // Đang phát → Tạm dừng (lưu vị trí turn)
      stopAllSpeechPlayback(true);
      return;
    }

    if (isAudioPausedRef.current && activeDialogueTurnsRef.current.length > 0) {
      // Đang tạm dừng → Phát tiếp từ vị trí đã lưu
      isAudioPausedRef.current = false;
      setIsAudioPaused(false);
      playDualVoiceChoukai(targetQ, pausedTurnIndexRef.current);
      return;
    }

    // Chưa phát hoặc đã dừng hẳn → Phát từ đầu
    isAudioPausedRef.current = false;
    setIsAudioPaused(false);
    pausedTurnIndexRef.current = 0;
    currentTurnIndexRef.current = 0;
    playDualVoiceChoukai(targetQ, 0);
  };

  const playDualVoiceChoukai = (q: ExamQuestionItem, startTurnIndex = 0) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    stopAllSpeechPlayback();

    // Tìm đoạn văn fallback kế thừa nếu câu hiện tại có passage rút gọn (ví dụ câu 104, 105 của Mondai 5)
    let resolvedPassage = q.passage || '';
    if (
      (!resolvedPassage ||
        resolvedPassage.includes('xem kịch bản') ||
        !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(resolvedPassage)) &&
      activeExam?.questions
    ) {
      for (let i = currentQuestionIndex - 1; i >= 0; i--) {
        const prevQ = activeExam.questions[i];
        if (
          prevQ.section === 'listening' &&
          prevQ.subType === q.subType &&
          prevQ.passage &&
          /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(prevQ.passage)
        ) {
          resolvedPassage = prevQ.passage;
          break;
        }
      }
    }

    const turns = parseDialogueTurns(q, resolvedPassage);
    if (turns.length === 0) return;

    activeDialogueTurnsRef.current = turns;
    currentTurnIndexRef.current = startTurnIndex;

    const allVoices = window.speechSynthesis.getVoices();
    const jaVoices = allVoices.filter((v) => v.lang.includes('ja') || v.lang.includes('JP'));

    const maleVoice =
      jaVoices.find((v) => {
        const n = v.name.toLowerCase();
        return (
          n.includes('ichiro') ||
          n.includes('keita') ||
          n.includes('otoya') ||
          n.includes('daichi') ||
          n.includes('male')
        );
      }) || jaVoices[0] || null;

    const femaleVoice =
      jaVoices.find((v) => {
        const n = v.name.toLowerCase();
        return (
          n.includes('nanami') ||
          n.includes('haruka') ||
          n.includes('ayumi') ||
          n.includes('kyoko') ||
          n.includes('female')
        );
      }) || jaVoices[0] || null;

    const narratorVoice =
      jaVoices.find((v) => {
        const n = v.name.toLowerCase();
        return n.includes('nanami') || n.includes('haruka') || n.includes('google');
      }) ||
      femaleVoice ||
      jaVoices[0] ||
      null;

    const totalEstimatedSeconds = turns.reduce((acc, t) => {
      if (t.role === 'sfx') return acc + 1.2;
      return acc + t.text.length * 0.18 + (t.pauseAfterMs || 500) / 1000;
    }, 0);
    const scaledDuration = Math.max(15, Math.round(totalEstimatedSeconds / audioPlaybackRate));
    setAudioDuration(scaledDuration);

    if (startTurnIndex === 0) {
      setAudioCurrentTime(0);
    }

    const sessionToken = ++speechSequenceSessionRef.current;
    isAudioPlayingRef.current = true;
    setIsPlayingAudio(true);

    if (speechTimerIntervalRef.current) {
      clearInterval(speechTimerIntervalRef.current);
    }
    speechTimerIntervalRef.current = setInterval(() => {
      if (!isAudioPlayingRef.current) return;
      setAudioCurrentTime((prev) => {
        if (prev + 1 >= scaledDuration) return prev;
        return prev + 1;
      });
    }, 1000);

    const speakTurn = async (index: number) => {
      if (!isAudioPlayingRef.current || sessionToken !== speechSequenceSessionRef.current) {
        return;
      }

      if (index >= turns.length) {
        isAudioPlayingRef.current = false;
        setIsPlayingAudio(false);
        setCurrentSpeakerRole(null);
        setCurrentSpeakerName(null);
        currentTurnIndexRef.current = 0;
        if (speechTimerIntervalRef.current) {
          clearInterval(speechTimerIntervalRef.current);
          speechTimerIntervalRef.current = null;
        }
        return;
      }

      currentTurnIndexRef.current = index;
      const turn = turns[index];
      setCurrentSpeakerRole(turn.role);
      setCurrentSpeakerName(turn.speakerName || null);

      // 1. Phát hiệu ứng âm thanh (SFX)
      if (turn.role === 'sfx') {
        if (turn.sfxType === 'chime') {
          await ChoukaiAudioFx.playExamChime();
        } else if (turn.sfxType === 'train') {
          await ChoukaiAudioFx.playTrainMelody();
        } else if (turn.sfxType === 'car') {
          await ChoukaiAudioFx.playCarTrafficSound();
        } else if (turn.sfxType === 'question_chime') {
          await ChoukaiAudioFx.playQuestionChime();
        }

        if (!isAudioPlayingRef.current || sessionToken !== speechSequenceSessionRef.current) return;

        const timer = setTimeout(() => {
          if (!isAudioPlayingRef.current || sessionToken !== speechSequenceSessionRef.current) return;
          speakTurn(index + 1);
        }, (turn.pauseAfterMs || 500) / audioPlaybackRate);
        speechSequenceTimeoutsRef.current.push(timer);
        return;
      }

      // 2. Phát giọng đọc nhân vật (Speech Synthesis)
      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.lang = 'ja-JP';

      if (turn.role === 'male') {
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.82;
        utterance.rate = 0.98 * audioPlaybackRate;
      } else if (turn.role === 'male_senior') {
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.62;
        utterance.rate = 0.90 * audioPlaybackRate;
      } else if (turn.role === 'female') {
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.25;
        utterance.rate = 1.02 * audioPlaybackRate;
      } else if (turn.role === 'female_senior') {
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.08;
        utterance.rate = 0.96 * audioPlaybackRate;
      } else {
        if (narratorVoice) utterance.voice = narratorVoice;
        utterance.pitch = 1.0;
        utterance.rate = 0.94 * audioPlaybackRate;
      }

      utterance.onend = () => {
        // Kiểm tra session trước khi tiếp tục — tránh chain lệnh sau khi dừng/tạm dừng
        if (!isAudioPlayingRef.current || sessionToken !== speechSequenceSessionRef.current) return;
        const timer = setTimeout(() => {
          if (!isAudioPlayingRef.current || sessionToken !== speechSequenceSessionRef.current) return;
          speakTurn(index + 1);
        }, (turn.pauseAfterMs || 650) / audioPlaybackRate);
        speechSequenceTimeoutsRef.current.push(timer);
      };

      utterance.onerror = (e) => {
        // Không làm gì nếu bị cancel/interrupted (user dừng) hoặc session đã thay đổi
        if (!isAudioPlayingRef.current || sessionToken !== speechSequenceSessionRef.current) return;
        if (e.error === 'canceled' || e.error === 'interrupted') return;
        // Với lỗi synthesis khác: bỏ qua turn này, tiếp tục turn kế tiếp sau delay nhỏ
        // KHÔNG tự động restart để tránh lặp vô tận
        console.warn('[Choukai] Utterance error on turn', index, ':', e.error);
        const timer = setTimeout(() => {
          if (!isAudioPlayingRef.current || sessionToken !== speechSequenceSessionRef.current) return;
          speakTurn(index + 1);
        }, 200);
        speechSequenceTimeoutsRef.current.push(timer);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakTurn(startTurnIndex);
  };

  const resumeChoukaiPlayback = (q: ExamQuestionItem) => {
    isAudioPausedRef.current = false;
    playDualVoiceChoukai(q, pausedTurnIndexRef.current);
  };

  const playSpeechFallback = (q: ExamQuestionItem) => {
    isAudioPausedRef.current = false;
    pausedTurnIndexRef.current = 0;
    playDualVoiceChoukai(q);
  };

  // Điều khiển âm thanh nghe lại trong màn hình Xem lại kết quả bài thi
  const handleToggleReviewAudio = (q: QuestionResultItem) => {
    const qId = q.questionId;
    if (reviewAudioPlayingId === qId) {
      if (reviewAudioRef.current) {
        reviewAudioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setReviewAudioPlayingId(null);
      return;
    }

    if (reviewAudioRef.current) {
      reviewAudioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (q.audioUrl) {
      const targetSrc = resolveAudioUrl(q.audioUrl);
      const audio = new Audio(targetSrc);
      audio.playbackRate = audioPlaybackRate;
      reviewAudioRef.current = audio;
      audio.play().then(() => {
        setReviewAudioPlayingId(qId);
      }).catch((err) => {
        console.warn('Review audio play error, using fallback:', err);
        playSpeechFallback(q as any);
        setReviewAudioPlayingId(qId);
      });
      audio.onended = () => {
        setReviewAudioPlayingId(null);
      };
      audio.onerror = () => {
        setReviewAudioPlayingId(null);
      };
    } else {
      playSpeechFallback(q as any);
      setReviewAudioPlayingId(qId);
    }
  };

  const handleAudioSeek = (seekSeconds: number) => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = seekSeconds;
      setAudioCurrentTime(seekSeconds);
      return;
    }

    setAudioCurrentTime(seekSeconds);
    const turns = activeDialogueTurnsRef.current;
    if (turns.length > 0 && audioDuration > 0) {
      const targetTurnIndex = Math.min(
        turns.length - 1,
        Math.max(0, Math.floor((seekSeconds / audioDuration) * turns.length))
      );
      currentTurnIndexRef.current = targetTurnIndex;
      if (isPlayingAudio || isAudioPlayingRef.current) {
        const targetQ = activeExam?.questions ? activeExam.questions[currentQuestionIndex] : null;
        if (targetQ) {
          playDualVoiceChoukai(targetQ, targetTurnIndex);
        }
      }
    }
  };

  const handleSkipAudio = (delta: number) => {
    const nextTime = Math.max(0, Math.min(audioDuration, audioCurrentTime + delta));
    handleAudioSeek(nextTime);
  };

  const handleChangePlaybackRate = (rate: number) => {
    setAudioPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (reviewAudioRef.current) {
      reviewAudioRef.current.playbackRate = rate;
    }
  };


  // Tự động gọi Giám khảo AI (Gemini 3.5 Flash) để chẩn đoán & rút kinh nghiệm
  const fetchAiDiagnostic = async (result: ExamEvaluationResult) => {
    setIsLoadingDiagnostic(true);
    setDiagnosticError(null);
    try {
      const wrongQuestions = result.questionResults
        .filter((q) => !q.isCorrect)
        .map((q) => ({
          orderNumber: q.orderNumber,
          questionId: q.questionId,
          section: q.section,
          subTypeLabel: q.subTypeLabel,
          question: q.question,
          questionVi: q.questionVi,
          userAnswerIndex: q.userAnswer,
          userAnswerText: q.userAnswer !== null && q.options[q.userAnswer] ? q.options[q.userAnswer] : 'Bỏ trống',
          correctAnswerIndex: q.correctAnswer,
          correctAnswerText: q.options[q.correctAnswer] || '',
          options: q.options,
          explanation: q.explanation
        }));

      const payload = {
        examId: result.examId,
        examTitle: result.examTitle,
        level: result.level,
        totalScore: result.totalScore,
        passingScore: result.passingScore,
        isPassed: result.isPassed,
        hasSectionalFailure: result.hasSectionalFailure,
        timeSpentSeconds: result.timeSpentSeconds,
        totalQuestions: result.totalQuestions,
        totalCorrect: result.totalCorrect,
        sectionResults: result.sectionResults,
        incorrectQuestions: wrongQuestions
      };

      const report = await ExamApi.getAiDiagnosticReport(payload);
      if (report) {
        setDiagnosticReport(report);
      } else {
        setDiagnosticError('Chưa thể lấy phân tích từ Giám khảo AI lúc này.');
      }
    } catch (err: any) {
      console.error('Error fetching AI diagnostic:', err);
      setDiagnosticError('Đã xảy ra lỗi khi tạo phân tích AI.');
    } finally {
      setIsLoadingDiagnostic(false);
    }
  };

  // Chọn đáp án
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Tính năng Đánh giá đa chiều: Gạch bỏ loại trừ phương án sai (Strikethrough / Elimination)
  const handleToggleEliminate = (questionId: string, optIdx: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEliminatedOptions((prev) => {
      const currentList = prev[questionId] || [];
      if (currentList.includes(optIdx)) {
        return { ...prev, [questionId]: currentList.filter((i) => i !== optIdx) };
      } else {
        return { ...prev, [questionId]: [...currentList, optIdx] };
      }
    });
  };

  // Xử lý bôi đen / nhấn đúp để tra cứu nhanh & câu ví dụ tương tự (tiện ích eJOY style)
  const handleTextMouseUp = async () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Tắt tính năng tra cứu từ bôi đen trong chế độ thi thật
    if (examMode === 'exam') return;
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 1 || selectedText.length > 250) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectionPopup({
        text: selectedText,
        x: Math.min(Math.max(rect.left + window.scrollX, 20), window.innerWidth - 380),
        y: rect.bottom + window.scrollY + 8,
        loading: true
      });

      const currentQ = activeExam?.questions?.[currentQuestionIndex];
      const res = await fetch('/api/reading/translate-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          contextSentence: currentQ ? currentQ.question : undefined
        })
      });

      const data = await res.json();
      const payload = data?.data || data;

      setSelectionPopup((prev) => {
        if (!prev || prev.text !== selectedText) return prev;
        return {
          ...prev,
          loading: false,
          data: {
            type: payload.type || (selectedText.length > 25 ? 'sentence' : 'word'),
            kanjiWithFurigana: payload.kanjiWithFurigana || selectedText,
            translation: payload.translation || payload.meaningVi || 'Không tìm thấy bản dịch',
            explanation: payload.explanation || '',
            grammarPoint: payload.grammarPoint || null,
            grammarStructure: payload.grammarStructure || null,
            grammarMeaning: payload.grammarMeaning || null,
            example: payload.example || (payload.examples && payload.examples[0]) || null,
            examples: payload.examples || (payload.example ? [payload.example] : [])
          }
        };
      });
    } catch (e) {
      console.warn('Translate selection error:', e);
      setSelectionPopup((prev) => (prev ? { ...prev, loading: false } : null));
    }
  };

  // Helper hiển thị câu hỏi: làm nổi bật dấu sao ★, ô trống và gạch chân Hán tự chuẩn 問題冊子 JEES
  const renderQuestionText = (txt: string) => {
    if (!txt) return '';
    let cleaned = txt;
    // Replace markdown bold WITHOUT padding so furigana aligns
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 font-bold">$1</strong>');
    
    // Replace stars
    cleaned = cleaned.replace(/【?★】?/g, '<span class="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-600 rounded-full mx-1 text-xs font-black border border-amber-300">★</span>');
    
    // Replace blanks
    cleaned = cleaned.replace(/＿＿＿/g, '<span class="border-b-2 border-slate-900 font-bold text-slate-900 px-2 mx-1 inline-block tracking-widest bg-slate-50">＿＿＿</span>');
    
    return cleaned;
  };

  // Nộp bài thi
  const handleForceSubmit = async () => {
    if (!activeExam) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const timeSpent = examMode === 'exam'
      ? (activeExam.durationMinutes * 60) - timeRemainingSeconds
      : 3600;

    let result = await ExamApi.submitExam({
      examId: activeExam.id,
      userAnswers,
      timeSpentSeconds: Math.max(1, timeSpent),
      format: activeExam.format || selectedFormat,
      questionIds: activeExam.questions?.map((q) => q.id)
    });

    if (!result) {
      // Local evaluation fallback for custom exams or backend errors
      const questionResults = (activeExam.questions || []).map(q => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer === q.correctIndex;
        return {
          questionId: q.id,
          section: q.section,
          orderNumber: q.orderNumber,
          subTypeLabel: q.subTypeLabel || '',
          question: q.question || '',
          questionVi: q.questionVi || '',
          passage: q.passage,
          passageVi: q.passageVi,
          audioUrl: q.audioUrl,
          imageUrl: q.imageUrl,
          options: q.options || [],
          optionsVi: q.optionsVi,
          userAnswer: userAnswer !== undefined ? userAnswer : null,
          correctAnswer: q.correctIndex || 0,
          isCorrect,
          explanation: q.explanation || '',
          officialSource: q.officialSource || 'System'
        } as any;
      });
      const totalCorrect = questionResults.filter(q => q.isCorrect).length;
      const totalQuestions = questionResults.length;
      const totalScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 180) : 0;
      const passingScore = activeExam.passingScore || 90;
      const isPassed = totalScore >= passingScore;

      const sectionMap: Record<string, { total: number; correct: number; title: string }> = {
        vocab: { total: 0, correct: 0, title: 'Kiến thức chữ Hán & Từ vựng (文字・語彙)' },
        grammar: { total: 0, correct: 0, title: 'Cấu trúc Ngữ pháp (文法)' },
        reading: { total: 0, correct: 0, title: 'Đọc hiểu nội dung (読解)' },
        listening: { total: 0, correct: 0, title: 'Nghe hiểu tiếng Nhật (聴解)' }
      };
      for (const qr of questionResults) {
        const sec = qr.section || 'vocab';
        if (!sectionMap[sec]) {
          sectionMap[sec] = { total: 0, correct: 0, title: qr.subTypeLabel || sec };
        }
        sectionMap[sec].total++;
        if (qr.isCorrect) sectionMap[sec].correct++;
      }
      const sectionResults = Object.entries(sectionMap)
        .filter(([_, data]) => data.total > 0)
        .map(([sec, data]) => {
          const score = Math.round((data.correct / data.total) * 60);
          return {
            section: sec as any,
            title: data.title,
            score,
            correctCount: data.correct,
            totalQuestions: data.total,
            isFailedSection: score < 19
          };
        });
      
      result = {
        examId: activeExam.id,
        examTitle: activeExam.title,
        level: activeExam.level,
        timeSpentSeconds: Math.max(1, timeSpent),
        totalQuestions,
        totalCorrect,
        totalScore,
        passingScore,
        isPassed,
        hasSectionalFailure: sectionResults.some(s => s.isFailedSection),
        summaryMessage: isPassed ? 'Kết quả Đạt (Đánh giá cục bộ)' : 'Chưa đạt (Đánh giá cục bộ)',
        sectionResults, 
        questionResults
      };
    }

    setIsSubmitting(false);
    setShowSubmitModal(false);

    if (result) {
      setExamResult(result);
      setCurrentScreen('result');
      fetchAiDiagnostic(result);
    } else {
      showNotification('Đã xảy ra lỗi khi chấm điểm. Vui lòng thử lại!', 'error');
    }
  };

  // PHƯƠNG ÁN TỐI ƯU CHO NGƯỜI HỌC: 1-Click lưu toàn bộ câu sai & Ngữ pháp vào Sổ tay Cá nhân
  const handleSaveAllWrongToNotebook = async () => {
    if (!examResult) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    const wrongQuestions = examResult.questionResults.filter((q) => !q.isCorrect);
    if (wrongQuestions.length === 0) {
      showNotification('Tuyệt vời! Bạn không làm sai câu nào để lưu vào sổ tay.', 'success');
      return;
    }

    setIsSavingToNotebook(true);
    setSavedNotebookMessage(null);
    let successCount = 0;

    for (const q of wrongQuestions) {
      try {
        const itemType = q.section === 'grammar' ? 'GRAMMAR' : (q.section === 'vocab' ? 'VOCAB' : 'NOTE');
        
        const metaStr = q.options && q.options.length > 0 ? `\n<!-- META: ${JSON.stringify({
          questionId: q.questionId,
          question: q.question,
          passage: q.passage || null,
          options: q.options,
          correctIndex: q.correctAnswer,
          userAnswer: q.userAnswer,
          explanation: q.explanation,
          section: q.section,
          subTypeLabel: q.subTypeLabel
        })} -->` : '';

        await NotebookApi.createItem({
          itemType: itemType as any,
          title: `[${examResult.level}] Câu ${q.orderNumber}: ${q.subTypeLabel || 'Câu làm sai'}`,
          reading: q.subTypeLabel,
          meaningVi: `[Đề thi ${examResult.level}] ${q.questionVi || q.question}`,
          level: examResult.level,
          structure: q.section === 'grammar' ? q.question : undefined,
          exampleJp: q.passage ? `${q.passage}\n\n${q.question}` : q.question,
          exampleVi: q.passageVi ? `${q.passageVi}\n\n${q.questionVi}` : q.questionVi,
          note: [
            q.explanation ? `💡 Giải thích đáp án & Bẫy thi: ${q.explanation}` : '',
            q.keyGrammarOrVocab ? `🎯 Trọng tâm: ${q.keyGrammarOrVocab}` : '',
            q.studyTips ? `💡 Mẹo phòng thi: ${q.studyTips}` : '',
            metaStr
          ].filter(Boolean).join('\n'),
          tags: `JLPT_${examResult.level},Thi_thử,Câu_sai`,
          masteryStatus: 'LEARNING'
        });
        successCount++;
        setSavedSingleNotebookIds((prev) => ({ ...prev, [q.questionId]: true }));
      } catch (err) {
        console.warn('Lỗi lưu mục sổ tay:', err);
      }
    }

    setIsSavingToNotebook(false);
    setSavedNotebookMessage(`🎉 Đã lưu thành công ${successCount}/${wrongQuestions.length} câu làm sai và cấu trúc ngữ pháp vào Sổ tay Cá nhân! Bạn có thể chuyển sang tab Sổ tay để ôn luyện Flashcard SRS bất kỳ lúc nào.`);
  };

  // Lưu riêng lẻ 1 câu vào sổ tay
  const handleSaveSingleToNotebook = async (q: any) => {
    if (!examResult) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const itemType = q.section === 'grammar' ? 'GRAMMAR' : (q.section === 'vocab' ? 'VOCAB' : 'NOTE');

      const metaStr = q.options && q.options.length > 0 ? `\n<!-- META: ${JSON.stringify({
        questionId: q.questionId,
        question: q.question,
        passage: q.passage || null,
        options: q.options,
        correctIndex: q.correctAnswer,
        userAnswer: q.userAnswer,
        explanation: q.explanation,
        section: q.section,
        subTypeLabel: q.subTypeLabel
      })} -->` : '';

      await NotebookApi.createItem({
        itemType: itemType as any,
        title: `[${examResult.level}] Câu ${q.orderNumber}: ${q.subTypeLabel || 'Câu làm sai'}`,
        reading: q.subTypeLabel,
        meaningVi: `[Đề thi ${examResult.level}] ${q.questionVi || q.question}`,
        level: examResult.level,
        structure: q.section === 'grammar' ? q.question : undefined,
        exampleJp: q.passage ? `${q.passage}\n\n${q.question}` : q.question,
        exampleVi: q.passageVi ? `${q.passageVi}\n\n${q.questionVi}` : q.questionVi,
        note: `💡 Giải thích: ${q.explanation}\n🎯 Trọng tâm: ${q.keyGrammarOrVocab || ''}\n💡 Mẹo: ${q.studyTips || ''}${metaStr}`,
        tags: `JLPT_${examResult.level},Thi_thử,Câu_sai`,
        masteryStatus: 'LEARNING'
      });
      setSavedSingleNotebookIds((prev) => ({ ...prev, [q.questionId]: true }));
    } catch (err) {
      showNotification('Không thể lưu vào sổ tay. Vui lòng thử lại!', 'error');
    }
  };

  // Luyện tập lại riêng các câu làm sai
  const handleRetryWrongQuestions = () => {
    if (!examResult || !activeExam) return;
    const wrongQuestionIds = new Set(
      examResult.questionResults.filter((q) => !q.isCorrect).map((q) => q.questionId)
    );
    if (wrongQuestionIds.size === 0) return;

    const wrongQuestionsList = (activeExam.questions || []).filter((q) => wrongQuestionIds.has(q.id));
    if (wrongQuestionsList.length === 0) return;

    const customExam: JLPTExam = {
      ...activeExam,
      title: `[Luyện lại lỗi sai] ${activeExam.title}`,
      totalQuestions: wrongQuestionsList.length,
      questions: wrongQuestionsList
    };

    setActiveExam(customExam);
    setExamMode('exam');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAiExplanations({});
    setShowTranslations(false);
    setShowListeningScript(false);
    setTimeRemainingSeconds(0);
    setIsTimerRunning(false);
    setCurrentScreen('taking');
  };

  // Tiện ích 3: Bắt đầu Luyện lại câu sai từ Ngân hàng câu sai (Mistake Bank SRS)
  const handleStartMistakePractice = () => {
    if (!mistakeItems || mistakeItems.length === 0) {
      showNotification('Chưa có câu hỏi nào trong Ngân hàng câu sai. Hãy làm bài thi và lưu các câu sai vào Sổ tay nhé!', 'info');
      return;
    }

    const filtered = mistakeItems.filter((item) => {
      if (selectedLevel !== 'ALL' && item.level !== selectedLevel) return false;
      return true;
    });

    if (filtered.length === 0) {
      showNotification(`Không có câu làm sai nào thuộc cấp độ ${selectedLevel}. Vui lòng chọn "Tất cả" cấp độ.`, 'info');
      return;
    }

    const questions: ExamQuestionItem[] = filtered.map((m, idx) => {
      // Kiểm tra xem có meta JSON nhúng trong note không
      let parsedMeta: any = null;
      if (m.note && m.note.includes('<!-- META:')) {
        try {
          const match = m.note.match(/<!-- META:\s*(\{[\s\S]*?\})\s*-->/);
          if (match && match[1]) {
            parsedMeta = JSON.parse(match[1]);
          }
        } catch {}
      }

      const cleanNote = (m.note || '').replace(/<!-- META:[\s\S]*?-->/, '').trim();
      const noteLines = cleanNote.split('\n').map((l: string) => l.trim()).filter(Boolean);
      const explanationLine = noteLines.find((l: string) => l.startsWith('💡 Giải thích')) || '';
      const tipsLine = noteLines.find((l: string) => l.startsWith('💡 Mẹo')) || '';
      const keyLine = noteLines.find((l: string) => l.startsWith('🎯')) || '';

      const section: ExamSectionType = (parsedMeta?.section as ExamSectionType) || (m.itemType === 'GRAMMAR' ? 'grammar' : (m.itemType === 'VOCAB' ? 'vocab' : 'reading'));
      const subTypeLabel: string = parsedMeta?.subTypeLabel || m.reading || (section === 'grammar' ? 'Ngữ pháp' : 'Từ vựng');

      // Tạo câu hỏi ôn luyện từ nội dung thực hoặc metadata gốc
      const questionText = parsedMeta?.question || m.exampleJp || m.structure || m.title || '';
      const passageText = parsedMeta?.passage || (m.exampleJp && m.exampleJp !== questionText ? m.exampleJp : '');
      const explainText = parsedMeta?.explanation || [explanationLine, keyLine, tipsLine].filter(Boolean).join('\n') || cleanNote || m.meaningVi || '';

      // Tái tạo 4 lựa chọn: ưu tiên options gốc nếu có
      let finalOptions: string[] = [];
      let finalCorrectIndex = 0;

      if (Array.isArray(parsedMeta?.options) && parsedMeta.options.length >= 2) {
        finalOptions = parsedMeta.options;
        finalCorrectIndex = typeof parsedMeta?.correctIndex === 'number' && parsedMeta.correctIndex >= 0 ? parsedMeta.correctIndex : 0;
      } else {
        const correctOpt = m.title ? m.title.replace(/^\[.*?\]\s*(Câu \d+:\s*)?/, '').trim() : (m.reading || 'Đáp án đúng');
        finalOptions = [correctOpt, 'Phương án nhiễu A', 'Phương án nhiễu B', 'Phương án nhiễu C'];
        finalCorrectIndex = 0;
      }

      return {
        id: `mistake_${m.id}`,
        level: (selectedLevel !== 'ALL' ? selectedLevel : m.level || 'N3') as JLPTLevel,
        section,
        subType: 'mistake_bank',
        subTypeLabel,
        orderNumber: idx + 1,
        question: questionText,
        questionVi: m.exampleVi || m.meaningVi || '',
        passage: passageText,
        passageVi: m.meaningVi || '',
        options: finalOptions,
        correctIndex: finalCorrectIndex,
        explanation: explainText || '💡 ' + (m.meaningVi || ''),
        officialSource: 'Ngân hàng câu hỏi làm sai (Mistake Bank SRS)'
      };
    });

    const customExam: JLPTExam = {
      id: 'mistake_practice_session',
      code: 'MISTAKE_SRS_DRILL',
      title: `Luyện Tập Ngân Hàng Câu Sai & SRS (${filtered.length} câu)`,
      description: 'Tổng hợp các câu hỏi và cấu trúc ngữ pháp bạn đã từng làm sai trong các kỳ thi trước đó.',
      level: (selectedLevel !== 'ALL' ? selectedLevel : filtered[0]?.level || 'N3') as JLPTLevel,
      year: new Date().getFullYear(),
      session: 'JULY',
      durationMinutes: Math.max(15, Math.ceil(filtered.length * 2)),
      passingScore: 80,
      sectionalMinScore: 19,
      edition: '2020-2025',
      sections: [],
      totalQuestions: filtered.length,
      questions
    };

    setActiveExam(customExam);
    setExamMode('exam');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAiExplanations({});
    setShowTranslations(false);
    setShowListeningScript(false);
    setTimeRemainingSeconds(0);
    setIsTimerRunning(false);
    setCurrentScreen('taking');
  };

  // Đánh dấu thành thạo câu sai (Chuyển trạng thái SRS - Cập nhật tức thì Optimistic)
  const handleToggleMistakeMastery = async (item: any) => {
    const nextStatus = item.masteryStatus === 'MASTERED' ? 'LEARNING' : 'MASTERED';
    // 1. Cập nhật state UI ngay lập tức để người dùng có phản hồi mượt mà
    setMistakeItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, masteryStatus: nextStatus } : i))
    );

    // 2. Đồng bộ xuống server ngầm
    try {
      await NotebookApi.toggleMastery(item.id, nextStatus);
    } catch (err) {
      console.warn('Lỗi đồng bộ trạng thái ghi nhớ lên máy chủ:', err);
      // Rollback nếu máy chủ lỗi
      setMistakeItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, masteryStatus: item.masteryStatus } : i))
      );
    }
  };

  // Xóa câu khỏi Ngân hàng câu sai (Optimistic UI)
  const handleDeleteMistakeItem = async (itemId: string) => {
    setConfirmModal({
      show: true,
      title: 'Xóa khỏi sổ tay?',
      message: 'Bạn có chắc muốn xóa câu này khỏi Ngân hàng câu sai?',
      confirmText: 'Xóa ngay',
      onConfirm: async () => {
        const previousItems = mistakeItems;
        setMistakeItems((prev) => prev.filter((i) => i.id !== itemId));

        try {
          await NotebookApi.deleteItem(itemId);
          showNotification('Đã xóa khỏi Ngân hàng câu sai', 'success');
        } catch (err) {
          console.warn('Lỗi xóa câu hỏi trên máy chủ:', err);
          setMistakeItems(previousItems);
          showNotification('Lỗi khi xóa khỏi sổ tay', 'error');
        }
      }
    });
  };

  const toggleMistakeExpand = (id: string) => {
    setExpandedMistakes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleExpandAllMistakes = () => {
    const nextVal = !expandAllMistakes;
    setExpandAllMistakes(nextVal);
    const updated: Record<string, boolean> = {};
    mistakeItems.forEach((m) => {
      updated[m.id] = nextVal;
    });
    setExpandedMistakes(updated);
  };

  // Yêu cầu AI giải thích chuyên sâu
  const handleRequestAiExplain = async (questionId: string, userAnswer: number | null) => {
    setLoadingAiId(questionId);
    const explanation = await ExamApi.explainWithAI(questionId, userAnswer);
    if (explanation) {
      setAiExplanations((prev) => ({
        ...prev,
        [questionId]: explanation
      }));
    }
    setLoadingAiId(null);
  };

  // Định dạng thời gian
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Badge màu sắc cho 4 phân môn
  const getSectionBadge = (section: ExamSectionType) => {
    switch (section) {
      case 'vocab':
        return { label: '文字・語彙 (Từ vựng)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'grammar':
        return { label: '文法 (Ngữ pháp)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'reading':
        return { label: '読解 (Đọc hiểu)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'listening':
        return { label: '聴解 (Nghe hiểu)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: section, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Lọc đề thi phía client
  const filteredExams = useMemo(() => {
    return examList.filter((e) => {
      const matchSearch =
        searchQuery === '' ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.code && e.code.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [examList, searchQuery]);

  // Lọc danh sách câu hỏi trong Ngân hàng câu sai (Mistake Bank & SRS)
  const filteredMistakes = useMemo(() => {
    return mistakeItems.filter((item) => {
      const matchLevel = selectedLevel === 'ALL' || item.level === selectedLevel;
      const matchSearch =
        searchQuery === '' ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaningVi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.exampleJp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.note?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [mistakeItems, selectedLevel, searchQuery]);

  const currentQuestion = activeExam?.questions?.[currentQuestionIndex];

  // Kế thừa bài đọc đầy đủ và tranh ảnh/bảng biểu cho các câu hỏi cùng bài đọc (Dokkai)
  // Lưu ý: Phần nghe (listening) có hình ảnh RIÊNG cho từng câu, không được kế thừa chéo
  const effectiveReadingData = useMemo(() => {
    if (!currentQuestion) return { passage: '', passageVi: '', imageUrl: '' };

    const isListeningQ = currentQuestion.section === 'listening';
    let passage = currentQuestion.passage || '';
    let passageVi = currentQuestion.passageVi || '';
    // Listening: luôn dùng imageUrl riêng của câu hiện tại, không kế thừa từ câu trước
    let imageUrl = currentQuestion.imageUrl || '';

    const isPlaceholder = (p?: string | null) =>
      !p || p.trim() === '' || p.includes('Tiếp tục bài đọc') || p.includes('Tiếp tục bảng');

    // Chỉ kế thừa passage/imageUrl cho Dokkai và Passage Grammar (không áp dụng cho Listening)
    if (!isListeningQ && isPlaceholder(passage) && activeExam?.questions) {
      for (let i = currentQuestionIndex - 1; i >= 0; i--) {
        const prevQ = activeExam.questions[i];
        if (prevQ.section === currentQuestion.section) {
          if (!isPlaceholder(prevQ.passage)) {
            passage = prevQ.passage || '';
            passageVi = prevQ.passageVi || '';
            if (!imageUrl && prevQ.imageUrl) imageUrl = prevQ.imageUrl;
            break;
          }
        }
      }
    }

    // Chỉ kế thừa imageUrl cho Dokkai info_search (biểu bảng dùng chung cho nhiều câu)
    if (!isListeningQ && !imageUrl && activeExam?.questions) {
      for (let i = currentQuestionIndex - 1; i >= 0; i--) {
        const prevQ = activeExam.questions[i];
        if (prevQ.section === currentQuestion.section && prevQ.subType === currentQuestion.subType && prevQ.imageUrl) {
          imageUrl = prevQ.imageUrl;
          break;
        }
      }
    }



    return { passage, passageVi, imageUrl };
  }, [currentQuestion, activeExam, currentQuestionIndex]);

  // ========================================================
  // MÀN HÌNH 1: DANH SÁCH BỘ ĐỀ THI & CHUYÊN ĐỀ
  // ========================================================
  if (currentScreen === 'catalog') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Banner chính */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-400/30">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30">
              <Award className="w-3.5 h-3.5" />
              <span>Kho Đề Thi Mẫu Chính Thức JLPT (N5 - N1) • JEES & The Japan Foundation</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
              Phòng Luyện Thi & Thi Thử Chuẩn JLPT (N5 - N1)
            </h1>
            <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed">
              Trọn bộ 10 đề thi mẫu chính thức (Official Practice Workbooks Vol. 1 & Vol. 2) từ Ban tổ chức JLPT Nhật Bản (The Japan Foundation & JEES) với đầy đủ 16 Mondai qua 4 phân môn: Từ vựng, Ngữ pháp, Đọc hiểu Dokkai và Nghe hiểu Choukai đối thoại thực tế.
            </p>

            {/* TAB CHUYỂN ĐỔI CHẾ ĐỘ THI */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveStudioTab('full_exam')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStudioTab === 'full_exam'
                    ? 'bg-white text-indigo-900 shadow-md scale-102 font-black'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur-xs'
                }`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>🏆 Thi Thử Trọn Bộ (Full Exam - 180đ)</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('skill_practice')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStudioTab === 'skill_practice'
                    ? 'bg-white text-indigo-900 shadow-md scale-102 font-black'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur-xs'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>🎯 Luyện Đề Theo Chuyên Đề (Skill Practice)</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('mistake_bank')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStudioTab === 'mistake_bank'
                    ? 'bg-white text-indigo-900 shadow-md scale-102 font-black'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur-xs'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-rose-300" />
                <span>📕 Ngân Hàng Câu Sai & SRS (Mistake Bank)</span>
                {mistakeItems.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {mistakeItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* BỘ LỌC CHUYÊN ĐỀ & MONDAI DRILLS (Tiện ích 1: Mondai Drills Mode) */}
        {activeStudioTab === 'skill_practice' && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 animate-fadeIn space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>1. Chọn kỹ năng bạn muốn tập trung ôn luyện:</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { id: 'ALL', label: 'Tất cả chuyên đề', icon: Layers },
                { id: 'vocab', label: '🔤 Từ vựng & Hán tự', icon: BookOpen },
                { id: 'grammar', label: '📑 Ngữ pháp & Dấu sao ★', icon: FileText },
                { id: 'reading', label: '📖 Đọc hiểu (Dokkai)', icon: BookOpenCheck },
                { id: 'listening', label: '🎧 Nghe hiểu (Choukai)', icon: Headphones }
              ].map((skill) => {
                const isSel = selectedSkillSection === skill.id;
                return (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setSelectedSkillSection(skill.id as any);
                      setSelectedMondaiFilter('ALL');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSel
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-amber-200/60'
                    }`}
                  >
                    <span>{skill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tiện ích 1: Lựa chọn dạng bài (Mondai Drills) */}
            <div className="pt-2.5 border-t border-amber-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. Chọn dạng bài (Mondai) để luyện sâu:</span>
                </span>
                {selectedMondaiFilter !== 'ALL' && (
                  <button
                    onClick={() => setSelectedMondaiFilter('ALL')}
                    className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    ↺ Đặt lại tất cả Mondai
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedMondaiFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMondaiFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-amber-100/80 border border-amber-200'
                  }`}
                >
                  Tất cả dạng bài Mondai
                </button>

                {(selectedSkillSection === 'ALL'
                  ? Object.values(MONDAI_OPTIONS).flat()
                  : MONDAI_OPTIONS[selectedSkillSection] || []
                ).map((m) => {
                  const isMondaiActive = selectedMondaiFilter === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMondaiFilter(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isMondaiActive
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-amber-100/80 border border-amber-200'
                      }`}
                      title={m.desc}
                    >
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Thanh tìm kiếm & Bộ lọc Level, Năm, Kỳ thi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Cấp độ JLPT */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Level:</span>
              {['ALL', 'N1', 'N2', 'N3', 'N4', 'N5'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'Tất cả' : lvl}
                </button>
              ))}
            </div>

            {/* Tìm kiếm */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm năm thi, kỳ thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Lọc Năm và Kỳ thi (Chỉ hiển thị khi duyệt bộ đề thi) */}
          {activeStudioTab !== 'mistake_bank' && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Năm:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả năm / Tuyển tập</option>
                  <option value="2025">Tập 2 (Vol. 2 - 2025)</option>
                  <option value="2024">Tập 1 (Vol. 1 - 2024)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Đợt thi:</span>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Cả 2 tập (Vol. 1 & Vol. 2)</option>
                  <option value="JULY">Tập 1: Official Practice Vol. 1</option>
                  <option value="DECEMBER">Tập 2: Official Practice Vol. 2</option>
                </select>
              </div>

              <span className="ml-auto text-slate-400 font-medium text-[11px]">
                Hiển thị {filteredExams.length} bộ đề
              </span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TIỆN ÍCH 3: NGÂN HÀNG CÂU HỎI LÀM SAI & ÔN TẬP SRS */}
        {/* ========================================================= */}
        {activeStudioTab === 'mistake_bank' ? (
          !isAuthenticated ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/90 shadow-sm text-center max-w-xl mx-auto space-y-6 my-6 animate-fadeIn">
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-100">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Khu Vực Cá Nhân Hóa & Luyện Tập SRS</span>
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  Vui lòng đăng nhập để sử dụng Ngân Hàng Câu Sai
                </h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  Ngân hàng câu hỏi làm sai tự động lưu trữ toàn bộ các câu bạn đã làm sai kèm bẫy đề thi theo tài khoản cá nhân, giúp bạn ôn tập lặp lại ngắt quãng SRS (1 - 3 - 7 - 14 ngày) để không bao giờ tái phạm lỗi cũ.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập hoặc Đăng ký</span>
                </button>

                <button
                  onClick={async () => {
                    await loginDemo();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Trải nghiệm nhanh (Demo)</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Header thống kê & Hành động ôn tập */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-rose-500" />
                    <span>Ngân Hàng Câu Hỏi Làm Sai & Ôn Tập Ngắt Quãng SRS</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hệ thống tự động đồng bộ tất cả câu hỏi bạn làm sai và cấu trúc ngữ pháp bạn đã lưu từ các kỳ thi thử để ôn tập lặp lại ngắt quãng (1 - 3 - 7 - 14 ngày).
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setIsLoadingMistakes(true);
                      NotebookApi.getItems({ tags: 'Câu_sai' })
                        .then((items) => setMistakeItems(items || []))
                        .catch((err) => console.warn(err))
                        .finally(() => setIsLoadingMistakes(false));
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                    title="Làm mới danh sách câu sai"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMistakes ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                  </button>

                  <button
                    onClick={handleStartMistakePractice}
                    disabled={filteredMistakes.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 active:scale-95 shadow-md shadow-rose-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>🔥 Luyện Lại Các Câu Sai ({filteredMistakes.length})</span>
                  </button>
                </div>
              </div>

              {/* 3 Thẻ chỉ số SRS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-900 block">Tổng số câu sai lưu trữ</span>
                    <span className="text-2xl font-black text-rose-700">{mistakeItems.length}</span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow-xs text-rose-600">
                    <XCircle className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">Đang ôn tập ngắt quãng (SRS)</span>
                    <span className="text-2xl font-black text-amber-700">
                      {mistakeItems.filter((i) => i.masteryStatus !== 'MASTERED').length}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow-xs text-amber-600">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Đã thành thạo (Mastered)</span>
                    <span className="text-2xl font-black text-emerald-700">
                      {mistakeItems.filter((i) => i.masteryStatus === 'MASTERED').length}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl shadow-xs text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Thanh công cụ danh sách câu sai & Nút xem chi tiết / thu gọn tất cả */}
            {filteredMistakes.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">
                    Ngân hàng câu hỏi ({filteredMistakes.length} câu)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    • Mặc định thu gọn để lướt nhanh
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleExpandAllMistakes}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {expandAllMistakes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{expandAllMistakes ? 'Thu gọn toàn bộ câu' : 'Mở rộng xem chi tiết tất cả'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Danh sách thẻ câu sai */}
            {isLoadingMistakes ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Đang tải Ngân hàng câu sai & dữ liệu SRS...</p>
              </div>
            ) : filteredMistakes.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-3">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="font-black text-slate-800 text-base">Chưa có câu làm sai nào trong Ngân hàng</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Khi bạn tham gia thi thử hoặc luyện đề, tại màn hình xem lại kết quả hãy nhấn <strong>"1-Click Lưu toàn bộ câu sai & Ngữ pháp vào Sổ tay"</strong> hoặc biểu tượng 🔖 ở từng câu để hệ thống đưa vào lộ trình ôn ngắt quãng SRS!
                </p>
                <button
                  onClick={() => setActiveStudioTab('full_exam')}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Vào thi thử ngay</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMistakes.map((item) => {
                  const isMastered = item.masteryStatus === 'MASTERED';
                  const isExpanded = expandedMistakes[item.id] ?? false;

                  let meta: any = null;
                  if (item.note && item.note.includes('<!-- META:')) {
                    try {
                      const match = item.note.match(/<!-- META:\s*(\{[\s\S]*?\})\s*-->/);
                      if (match && match[1]) meta = JSON.parse(match[1]);
                    } catch {}
                  }

                  const formatOpt = (idx: number) => {
                    const labels = ['①', '②', '③', '④'];
                    return labels[idx] || `(${idx + 1})`;
                  };

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-3 flex flex-col justify-between ${
                        isMastered ? 'border-emerald-200 bg-emerald-50/15' : 'border-slate-200/90 hover:border-indigo-200'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Header của thẻ */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {item.level || 'JLPT'}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                              {item.itemType === 'GRAMMAR' ? '📑 Ngữ pháp' : (item.itemType === 'VOCAB' ? '🔤 Từ vựng' : '📝 Bài thi')}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isMastered
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isMastered ? 'Đã thành thạo ✅' : 'Đang ôn tập SRS ⏳'}
                          </span>
                        </div>

                        {/* Tiêu đề & Nội dung câu hỏi (Hiển thị Furigana chuẩn) */}
                        <div>
                          <style>{`
                            .ruby-text ruby { ruby-align: center; }
                            .ruby-text rt { font-size: 0.5em; color: #64748b; font-weight: 600; transform: translateY(0.15em); letter-spacing: 0; }
                          `}</style>
                          <h4 className="font-bold text-slate-900 text-[15px] leading-relaxed whitespace-pre-wrap ruby-text">
                            <span dangerouslySetInnerHTML={{ __html: renderQuestionText(item.exampleJp || item.title) }} />
                          </h4>
                          {(item.exampleVi || item.meaningVi) && (
                            <p className="text-xs text-slate-500 italic mt-1 leading-relaxed line-clamp-2">
                              {item.exampleVi || item.meaningVi}
                            </p>
                          )}
                        </div>

                        {/* Trạng thái thu gọn: Hiển thị tóm tắt đáp án nhanh */}
                        {!isExpanded && meta && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                            {meta.userAnswer !== undefined && meta.options && meta.options[meta.userAnswer] && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                                <span>✕ Bạn chọn:</span>
                                <span className="font-medium ruby-text" dangerouslySetInnerHTML={{ __html: renderQuestionText(meta.options[meta.userAnswer]) }} />
                              </span>
                            )}
                            {meta.correctIndex !== undefined && meta.options && meta.options[meta.correctIndex] && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span>🎯 Đáp án đúng:</span>
                                <span className="font-medium ruby-text" dangerouslySetInnerHTML={{ __html: renderQuestionText(meta.options[meta.correctIndex]) }} />
                              </span>
                            )}
                          </div>
                        )}

                        {/* Nút Xem chi tiết / Thu gọn để không phải cuộn trang dài */}
                        <button
                          onClick={() => toggleMistakeExpand(item.id)}
                          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-indigo-100/70 text-indigo-800 border-indigo-200'
                              : 'bg-indigo-50/70 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                          }`}
                        >
                          <span>{isExpanded ? 'Thu gọn phân tích' : 'Xem chi tiết (4 đáp án & bẫy thi)'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* PHẦN MỞ RỘNG CHI TIẾT */}
                        {isExpanded && (
                          <div className="space-y-3 pt-1 border-t border-slate-100 animate-fadeIn">
                            {/* Hiển thị 4 lựa chọn với Furigana chuẩn (Fix lỗi font thẻ ruby) */}
                            {meta && Array.isArray(meta.options) && meta.options.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Các phương án lựa chọn:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {meta.options.map((opt: string, optIdx: number) => {
                                    const isCorrect = meta.correctIndex === optIdx;
                                    const isUserPick = meta.userAnswer === optIdx;

                                    let badgeClass = 'bg-slate-50/90 border-slate-200/90 text-slate-700';
                                    if (isCorrect) {
                                      badgeClass = 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-200';
                                    } else if (isUserPick) {
                                      badgeClass = 'bg-rose-50/90 border-rose-300 text-rose-800 font-medium';
                                    }

                                    return (
                                      <div
                                        key={optIdx}
                                        className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ruby-text ${badgeClass}`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="font-bold shrink-0">{formatOpt(optIdx)}</span>
                                          <span
                                            className="truncate leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: renderQuestionText(opt) }}
                                          />
                                        </div>
                                        {isCorrect && (
                                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold shrink-0">
                                            Đáp án đúng
                                          </span>
                                        )}
                                        {!isCorrect && isUserPick && (
                                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold shrink-0">
                                            Bạn chọn
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Ghi chú giải thích & Bẫy thi */}
                            {item.note && (
                              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/70 shadow-xs">
                                <div
                                  className="text-slate-800 text-[13px] leading-relaxed whitespace-pre-wrap font-medium"
                                  dangerouslySetInnerHTML={{
                                    __html: item.note
                                      .replace(/<!-- META:[\s\S]*?-->/g, '')
                                      .trim()
                                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 font-bold">$1</strong>')
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Nút hành động trên từng thẻ câu sai */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleMistakeMastery(item)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isMastered
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isMastered ? 'Chuyển về cần ôn' : 'Đã hiểu & Thành thạo'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteMistakeItem(item.id)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Xóa khỏi ngân hàng
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      ) : (
          /* Lưới danh sách đề thi (khi ở tab Thi thử trọn bộ hoặc Luyện chuyên đề) */
          isLoadingList ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Đang đồng bộ đề thi chuẩn từ CSDL...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-16 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">Không tìm thấy bộ đề phù hợp</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy thử chọn lại cấp độ hoặc tìm kiếm từ khóa khác.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Badge & Tiêu đề */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {exam.level}
                      </span>
                      <span
                        className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[220px]"
                        title={exam.edition || exam.title}
                      >
                        {exam.edition ? exam.edition.split('(')[0].trim() : (exam.session === 'JULY' ? 'Kỳ thi Tháng 7' : 'Kỳ thi Tháng 12')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {exam.description}
                      </p>
                    </div>

                    {/* 4 Phân môn chính thức */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-bold text-slate-600">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">🔤 Từ vựng</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">📑 Ngữ pháp</span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">📖 Đọc hiểu</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">🎧 Nghe hiểu</span>
                    </div>

                    {/* Thông số nhanh */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-center">
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">Số câu</span>
                        <strong className="text-xs font-bold text-slate-700">34 / {exam.fullTotalQuestions || exam.totalQuestions} câu</strong>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">Điểm đỗ</span>
                        <strong className="text-xs font-bold text-emerald-600">{exam.passingScore}/180</strong>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">Điểm liệt</span>
                        <strong className="text-xs font-bold text-rose-600">&lt; {exam.sectionalMinScore}/60</strong>
                      </div>
                    </div>
                  </div>

                  {/* Các nút hành động */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    {activeStudioTab === 'full_exam' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleStartExam(exam, 'practice')}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ôn tự do</span>
                        </button>
                        <button
                          onClick={() => handleOpenCoverModal(exam)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Vào Thi (180đ)</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => handleStartExam(exam, 'practice', selectedSkillSection)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-md shadow-indigo-100 transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            {selectedSkillSection === 'vocab' && 'Luyện Chuyên Đề: Từ vựng & Hán tự'}
                            {selectedSkillSection === 'grammar' && 'Luyện Chuyên Đề: Ngữ pháp & Dấu sao'}
                            {selectedSkillSection === 'reading' && 'Luyện Chuyên Đề: Đọc hiểu (Dokkai)'}
                            {selectedSkillSection === 'listening' && 'Luyện Chuyên Đề: Nghe hiểu Audio (Choukai)'}
                            {selectedSkillSection === 'ALL' && 'Luyện Tất Cả Chuyên Đề'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* MODAL BÌA ĐỀ THI & 2 PHƯƠNG ÁN THI CHÍNH THỨC */}
        {showCoverModal && pendingCoverExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 animate-scaleUp overflow-hidden">
              {/* Header cố định */}
              <div className="text-center space-y-1.5 p-5 border-b border-slate-100 shrink-0 bg-white">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white uppercase tracking-wider shadow-sm">
                  日本語能力試験 (JLPT) • CẤP ĐỘ {pendingCoverExam.level}
                </span>
                <h3 className="text-lg md:text-xl font-black text-slate-900 pt-1">
                  {pendingCoverExam.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Bộ đề thi chuẩn hóa quốc tế • JEES & The Japan Foundation
                </p>
              </div>

              {/* Thân modal cuộn mượt mà theo kích thước màn hình */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {/* LỰA CHỌN 2 PHƯƠNG ÁN THI (YÊU CẦU TRỌNG TÂM CỦA HỌC VIÊN) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                      <span>Chọn 1 Trong 2 Phương Án Thi:</span>
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600">
                      {selectedFormat === 'express' ? 'Đang chọn: Phương án 1' : 'Đang chọn: Phương án 2'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Phương Án 1: Thi Tinh Gọn 34 câu */}
                    <div
                      onClick={() => setSelectedFormat('express')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        selectedFormat === 'express'
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-xs font-black text-indigo-800 flex items-center gap-1">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>Phương Án 1: Tinh Gọn</span>
                        </span>
                        {selectedFormat === 'express' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-2">
                          <strong className="text-xl font-black text-slate-900">34 Câu Hỏi</strong>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg">
                            {pendingCoverExam.expressDurationMinutes || 50} Phút
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Bao quát đầy đủ <strong>16 Mondai</strong> (Từ vựng, Ngữ pháp, Đọc hiểu, Nghe hiểu Choukai). Thời gian giảm tương ứng giúp làm nhanh, không tốn nhiều giờ.
                        </p>
                      </div>
                    </div>

                    {/* Phương Án 2: Thi Thật Toàn Bộ */}
                    <div
                      onClick={() => setSelectedFormat('full')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        selectedFormat === 'full'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Phương Án 2: Thi Thật</span>
                        </span>
                        {selectedFormat === 'full' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-2">
                          <strong className="text-xl font-black text-slate-900">
                            {pendingCoverExam.fullTotalQuestions || pendingCoverExam.totalQuestions} Câu Hỏi
                          </strong>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                            {pendingCoverExam.fullDurationMinutes || pendingCoverExam.durationMinutes} Phút
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Đầy đủ tất cả {pendingCoverExam.fullTotalQuestions || pendingCoverExam.totalQuestions} câu hỏi theo chuẩn kỳ thi thật JEES. Thời gian chuẩn phòng thi để rèn luyện sức bền và áp lực thi thực tế.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông số phòng thi theo phương án chọn */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl text-center border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">THỜI GIAN LÀM BÀI</span>
                    <strong className="text-sm font-black text-slate-800">
                      {selectedFormat === 'express'
                        ? (pendingCoverExam.expressDurationMinutes || 50)
                        : (pendingCoverExam.fullDurationMinutes || pendingCoverExam.durationMinutes)} Phút
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">SỐ CÂU THI</span>
                    <strong className="text-sm font-black text-indigo-600">
                      {selectedFormat === 'express'
                        ? '34 Câu (16 Mondai)'
                        : `${pendingCoverExam.fullTotalQuestions || pendingCoverExam.totalQuestions} Câu (Đầy Đủ 100%)`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">THANG ĐIỂM</span>
                    <strong className="text-sm font-black text-emerald-600">
                      180 Điểm (Liệt: &lt;19)
                    </strong>
                  </div>
                </div>

                {/* Quy chế phòng thi (受験上の注意) */}
                <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                  <strong className="font-bold text-amber-900 block flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Quy Chế Phòng Thi Chính Thức (受験上の注意):</span>
                  </strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Bài thi đếm ngược thời gian chuẩn. Hết giờ hệ thống sẽ <strong>tự động thu bài và chấm điểm</strong>.</li>
                    <li>Phần Nghe Choukai tích hợp <strong>audio đối thoại thực tế chuẩn giọng Tokyo</strong> phát âm bản xứ.</li>
                    <li><strong>Quy định điểm liệt:</strong> Mỗi phân môn phải đạt từ <strong>19/60 điểm</strong> trở lên. Dù tổng điểm cao nhưng có môn dưới 19 điểm vẫn bị tính là <strong>TRƯỢT</strong>.</li>
                    <li>Sau khi nộp bài: Đánh giá tổng quát chỉ ra lỗi sai, ngữ pháp có giải thích dễ hiểu và hỗ trợ <strong>1-Click lưu câu sai vào Sổ tay</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Nút hành động cố định ở đáy modal */}
              <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 rounded-b-3xl">
                <button
                  onClick={() => setShowCoverModal(false)}
                  className="py-3.5 rounded-2xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-xs"
                >
                  Để sau
                </button>
                <button
                  onClick={() => handleStartExam(pendingCoverExam, 'exam', undefined, selectedFormat)}
                  className="py-3.5 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Bắt đầu: {selectedFormat === 'express' ? 'Thi Tinh Gọn (34 câu)' : 'Thi Thật Toàn Bộ'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // MÀN HÌNH 1.5: THÔNG BÁO VÀ CHUẨN BỊ THI
  // ========================================================
  if (currentScreen === 'intro' && activeExam) {
    const minutes = activeExam.format === 'express'
      ? (activeExam.expressDurationMinutes || activeExam.durationMinutes || 50)
      : (activeExam.fullDurationMinutes || activeExam.durationMinutes || 155);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-scaleUp">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              {activeExam.title}
            </h1>
            <p className="text-indigo-100 font-medium text-lg opacity-90">
              Cấp độ {activeExam.level} • {activeExam.format === 'express' ? 'Rút gọn' : 'Đầy đủ'}
            </p>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-sm font-bold text-slate-500 mb-1">Thời gian</div>
                <div className="text-xl font-black text-indigo-700">{minutes} phút</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-sm font-bold text-slate-500 mb-1">Số câu hỏi</div>
                <div className="text-xl font-black text-indigo-700">{activeExam.totalQuestions} câu</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-sm font-bold text-slate-500 mb-1">Điểm đạt</div>
                <div className="text-xl font-black text-emerald-600">{activeExam.passingScore}/180</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-sm font-bold text-slate-500 mb-1">Điểm liệt</div>
                <div className="text-xl font-black text-rose-600">{activeExam.sectionalMinScore}/60</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                Nội quy & Hướng dẫn làm bài
              </h3>
              <ul className="text-sm text-slate-600 space-y-2 ml-7 list-disc">
                <li>Bài thi được mô phỏng theo chuẩn JLPT quốc tế của tổ chức JEES.</li>
                <li>Không tải lại trang (F5) hay quay lại trong quá trình làm bài để tránh mất kết quả.</li>
                <li>Bạn có thể bật/tắt Furigana, mở công cụ bút vẽ nháp, hoặc ẩn bảng Tiến độ ở góc trên bên phải màn hình.</li>
                <li>Sau khi hết thời gian, hệ thống sẽ tự động nộp bài và chấm điểm.</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentScreen('catalog')}
                className="flex-1 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmStartRealExam}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
              >
                Đã hiểu & Bắt đầu thi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

// ========================================================
  // MÀN HÌNH 2: PHÒNG THI CHUẨN JEES VỚI ĐỌC HIỂU 2 CỘT & CHOUKAI PLAYER
  // ========================================================
  if (currentScreen === 'taking' && activeExam && currentQuestion) {
    const isAnswered = userAnswers[currentQuestion.id] !== undefined;
    const isUrgent = timeRemainingSeconds < 300;
    const isListening = currentQuestion.section === 'listening';
    const isReading = currentQuestion.section === 'reading';
    const isPassageGrammar = currentQuestion.subType === 'passage_grammar';
    const hasPassageContent = Boolean(effectiveReadingData.passage);
    const showSplitPanePassage = (isReading || isPassageGrammar) && hasPassageContent;

    return (
      <div 
        className={`min-h-screen bg-slate-50/80 pb-20 animate-fadeIn ${(!showFurigana || currentQuestion.section === 'vocab') ? 'hide-furigana' : ''} ${examMode === 'exam' ? 'disable-selection' : ''}`}
        onCopy={(e) => { if (examMode === 'exam') e.preventDefault(); }}
        onContextMenu={(e) => { if (examMode === 'exam') e.preventDefault(); }}
      >
        <CanvasOverlay enabled={isDrawingMode} onClose={() => setIsDrawingMode(false)} />
        <style>{`
          ${examMode === 'exam' ? '#global-top-header { display: none !important; }' : ''}
          .hide-furigana rt {
            opacity: 0 !important;
            visibility: hidden !important;
          }
          .disable-selection {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          .disable-selection * {
            pointer-events: auto;
          }
          .disable-selection ruby {
            pointer-events: none;
          }
        `}</style>
        {/* Audio element phát giọng đọc tiếng Nhật bản xứ cho Choukai */}
        {currentQuestion.audioUrl && (
          <audio
            key={currentQuestion.id}
            ref={audioRef}
            src={resolveAudioUrl(currentQuestion.audioUrl)}
            preload="auto"
            onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              if (e.currentTarget.duration && !isNaN(e.currentTarget.duration) && isFinite(e.currentTarget.duration)) {
                setAudioDuration(e.currentTarget.duration);
              }
            }}
            onDurationChange={(e) => {
              if (e.currentTarget.duration && !isNaN(e.currentTarget.duration) && isFinite(e.currentTarget.duration)) {
                setAudioDuration(e.currentTarget.duration);
              }
            }}
            onCanPlay={(e) => {
              if (e.currentTarget.duration && !isNaN(e.currentTarget.duration) && isFinite(e.currentTarget.duration)) {
                setAudioDuration(e.currentTarget.duration);
              }
            }}
            onPlay={() => setIsPlayingAudio(true)}
            onPause={() => setIsPlayingAudio(false)}
            onEnded={() => {
              setIsPlayingAudio(false);
              setAudioCurrentTime(0);
            }}
            onError={() => setIsPlayingAudio(false)}
          />
        )}

        {/* Header phòng thi Sticky */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowExitModal(true)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Quay lại danh sách"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-indigo-600 text-white">
                    {activeExam.level}
                  </span>
                  <h2 className="text-xs md:text-sm font-bold text-slate-800 truncate">
                    {activeExam.title}
                  </h2>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  {currentQuestion.officialSource || 'Kỳ thi thật JLPT chuẩn hóa JEES'}
                </p>
              </div>
            </div>

            {/* Các công cụ & Đồng hồ & Nộp bài */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-4">
                <button
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-bold transition-all ${isDrawingMode ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                >
                  <Pen className="w-4 h-4 mb-0.5" />
                  BÚT VẼ
                </button>
                <button
                  onClick={() => {
                  if (currentQuestion?.section === 'vocab') {
                    showNotification('Furigana bị vô hiệu hóa trong phần Từ vựng & Hán tự để tránh lộ đáp án.', 'error');
                  } else {
                    setShowFurigana(!showFurigana);
                  }
                }}
                  className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl text-[10px] font-bold transition-all ${(showFurigana && currentQuestion?.section !== 'vocab') ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'} ${currentQuestion?.section === 'vocab' ? 'opacity-50' : ''}`}
                >
                  {(showFurigana && currentQuestion?.section !== 'vocab') ? <ToggleRight className="w-5 h-5 mb-0.5 text-indigo-600" /> : <ToggleLeft className="w-5 h-5 mb-0.5 text-slate-400" />}
                  FURIGANA
                </button>
                <button
                  onClick={() => setShowProgressSidebar(!showProgressSidebar)}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-bold transition-all ${showProgressSidebar ? 'text-indigo-600 bg-indigo-50 border border-indigo-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                >
                  <LayoutGrid className="w-4 h-4 mb-0.5" />
                  TIẾN ĐỘ
                </button>
              </div>
              <div className="flex items-center gap-2">
              {examMode === 'exam' ? (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    isUrgent
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{formatTime(timeRemainingSeconds)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Luyện tự do</span>
                </div>
              )}

              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Nộp bài
              </button>
            </div>
            </div>
          </div>

          {/* Thanh phân môn */}
          <div className="bg-slate-100/80 border-t border-slate-200 px-4 py-1.5 overflow-x-auto">
            <div className="max-w-6xl mx-auto flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                Phân môn:
              </span>
              {[
                { sec: 'vocab', label: '🔤 1. Từ vựng & Hán tự' },
                { sec: 'grammar', label: '📑 2. Ngữ pháp' },
                { sec: 'reading', label: '📖 3. Đọc hiểu Dokkai' },
                { sec: 'listening', label: '🎧 4. Nghe hiểu Choukai' }
              ].map((s) => {
                const isCurrentSec = currentQuestion.section === s.sec;
                const firstIdx = activeExam.questions?.findIndex((q) => q.section === s.sec);
                if (firstIdx === -1 || firstIdx === undefined) return null;

                return (
                  <button
                    key={s.sec}
                    onClick={() => setCurrentQuestionIndex(firstIdx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isCurrentSec
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Thanh Gợi Ý Nhịp Độ Thời Gian (Pacing Guide) & Cảnh Báo Làm Quá Lâu (Đánh giá đa chiều) */}
        {examMode === 'exam' && (
          <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 shadow-inner border-b border-slate-800">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gợi ý nhịp độ thi thật:</span>
                </span>
                <span className="text-slate-300">
                  {activeExam.level === 'N5' && 'Kiến thức ngôn ngữ: ~25 phút • Đọc hiểu: ~25 phút • Nghe hiểu: ~30 phút'}
                  {activeExam.level === 'N4' && 'Kiến thức ngôn ngữ: ~30 phút • Đọc hiểu: ~30 phút • Nghe hiểu: ~35 phút'}
                  {activeExam.level === 'N3' && 'Từ vựng & Ngữ pháp: ~40 phút • Đọc hiểu: ~65 phút • Nghe hiểu: ~40 phút'}
                  {activeExam.level === 'N2' && 'Kiến thức ngôn ngữ & Đọc: ~105 phút • Nghe hiểu: ~50 phút'}
                  {activeExam.level === 'N1' && 'Kiến thức ngôn ngữ & Đọc: ~110 phút • Nghe hiểu: ~60 phút'}
                </span>
              </div>
              {questionTimeSpentSeconds >= 180 && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-bold animate-pulse text-[11px]">
                  <span>⏱️ Nhịp độ: Bạn đã dừng ở câu này {Math.floor(questionTimeSpentSeconds / 60)}p {questionTimeSpentSeconds % 60}s. Hãy chọn tạm phương án khả dĩ và đi tiếp để tránh hụt giờ Đọc hiểu!</span>
                  <button onClick={() => setQuestionTimeSpentSeconds(0)} className="text-slate-950 hover:text-white font-black ml-1 cursor-pointer">✕</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Khu vực nội dung bài thi */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className={`grid grid-cols-1 ${showProgressSidebar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-6`}>
            {/* Cột chính: Câu hỏi & Nội dung */}
            <div className="lg:col-span-3 space-y-4">
              <div
                id="exam-question-card"
                onMouseUp={handleTextMouseUp}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6"
              >
                {/* Header câu hỏi: Mondai, Số câu, Trạng thái làm bài */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-xs">
                      Câu {currentQuestion.orderNumber} / {activeExam.questions?.length}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getSectionBadge(currentQuestion.section).color}`}>
                      {getSectionBadge(currentQuestion.section).label}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {currentQuestion.subTypeLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAnswered ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chọn: Phương án {formatOptLabel(userAnswers[currentQuestion.id])}</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-medium text-xs border border-slate-200">
                        Chưa chọn đáp án
                      </span>
                    )}
                  </div>
                </div>

                

                {/* 1. THANH ĐIỀU KHIỂN ÂM THANH CHOUKAI TÁCH BIỆT HOÀN TOÀN (AUDIO PLAYER BAR) */}
                {isListening && (
                  <div className="p-4 md:p-5 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3.5">
                    {/* Hàng 1: Tiêu đề, trạng thái và tốc độ phát */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                              JLPT Official Choukai Player
                            </span>
                            <span className="text-[10px] text-indigo-300/80 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30 font-semibold">
                              🎙️ Đa Giọng Đọc (Nam / Nữ / Người thứ 3) + Hiệu Ứng 🔔
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400">
                              {isPlayingAudio ? '🔊 Đang phát băng nghe...' : '⏸️ Băng nghe tạm dừng'}
                            </span>
                            {isPlayingAudio && currentSpeakerRole && (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse ${
                                  currentSpeakerRole === 'male' || currentSpeakerRole === 'male_senior'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    : currentSpeakerRole === 'female' || currentSpeakerRole === 'female_senior'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : currentSpeakerRole === 'sfx'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                {currentSpeakerRole === 'male' && `👨 [男] ${currentSpeakerName || 'Nhân vật Nam'}`}
                                {currentSpeakerRole === 'male_senior' && `👨‍💼 [${currentSpeakerName || 'Quản lý'}] ${currentSpeakerName || 'Lãnh đạo / Người thứ 3'}`}
                                {currentSpeakerRole === 'female' && `👩 [女] ${currentSpeakerName || 'Nhân vật Nữ'}`}
                                {currentSpeakerRole === 'female_senior' && `👩‍💼 [${currentSpeakerName || 'Khách'}] ${currentSpeakerName || 'Nhân vật Nữ 2'}`}
                                {currentSpeakerRole === 'narrator' && '🎙️ [MC] Người dẫn đề'}
                                {currentSpeakerRole === 'sfx' && `🔔 [Hiệu ứng] ${currentSpeakerName || 'Âm thanh thực tế'}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tốc độ phát */}
                      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 px-1 font-mono">Tốc độ:</span>
                        {[0.8, 1.0, 1.2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handleChangePlaybackRate(rate)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              audioPlaybackRate === rate
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hàng 2: Thanh Timeline Scrubber */}
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={audioDuration || 100}
                        value={audioCurrentTime}
                        onChange={(e) => handleAudioSeek(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>{formatTime(Math.floor(audioCurrentTime))}</span>
                        <span>{formatTime(Math.floor(audioDuration || 0))}</span>
                      </div>
                    </div>

                    {/* Hàng 3: Bộ nút phát & Visualizer sóng âm */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {/* Lùi 5s */}
                        <button
                          onClick={() => handleSkipAudio(-5)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                          title="Lùi 5 giây"
                        >
                          <Rewind className="w-4 h-4" />
                        </button>

                        {/* Nút Play/Tạm dừng/Phát tiếp chính */}
                        <button
                          onClick={() => togglePlayAudio(currentQuestion)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs active:scale-95 text-white shadow-lg transition-all cursor-pointer ${
                            isPlayingAudio
                              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30'
                              : isAudioPaused
                              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
                          }`}
                        >
                          {isPlayingAudio ? (
                            <>
                              <Pause className="w-4 h-4 fill-white" />
                              <span>Tạm dừng</span>
                            </>
                          ) : isAudioPaused ? (
                            <>
                              <Play className="w-4 h-4 fill-white" />
                              <span>Phát tiếp</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-white" />
                              <span>Phát bài nghe</span>
                            </>
                          )}
                        </button>

                        {/* Tiến 5s */}
                        <button
                          onClick={() => handleSkipAudio(5)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                          title="Tua tới 5 giây"
                        >
                          <FastForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Visualizer sóng âm thanh nhỏ gọn */}
                      <div className="flex items-center gap-1 h-6 px-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        {[30, 60, 20, 85, 55, 95, 25, 75, 45, 90, 40, 80].map((h, i) => (
                          <div
                            key={i}
                            className={`w-0.5 rounded-full bg-indigo-400 transition-all duration-300 ${
                              isPlayingAudio ? 'animate-pulse' : 'opacity-25'
                            }`}
                            style={{ height: isPlayingAudio ? `${h}%` : '25%' }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Hàng 4: Kịch bản Script (khi luyện thi) */}
                    {examMode === 'practice' && (
                      <div className="pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setShowListeningScript(!showListeningScript)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {showListeningScript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showListeningScript ? 'Ẩn kịch bản hội thoại' : 'Xem kịch bản hội thoại (Script & Dịch nghĩa)'}</span>
                        </button>
                        {showListeningScript && currentQuestion.passage && (
                          <div className="mt-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                            <p className="text-slate-200 font-serif leading-relaxed whitespace-pre-line">
                              <div dangerouslySetInnerHTML={{ __html: currentQuestion.passage }} />
                            </p>
                            {currentQuestion.passageVi && (
                              <p className="text-slate-400 italic pt-2 border-t border-slate-800/80 whitespace-pre-line leading-relaxed">
                                {currentQuestion.passageVi}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TỜ ĐỀ THI GIẤY TRẮNG ĐEN (問題用紙) TÁCH BIỆT HOÀN TOÀN CHUẨN JEES */}

                {/* BỐ CỤC ĐỌC HIỂU HOẶC NGỮ PHÁP ĐOẠN VĂN 2 CỘT (DOKKAI / PASSAGE GRAMMAR SPLIT-PANE) */}
                {showSplitPanePassage ? (
                  <div className="flex flex-col gap-6 pt-2">
                    {/* Cột trái: Văn bản đọc hiểu & hình ảnh */}
                    <div className="p-5 rounded-3xl bg-amber-50/30 border border-amber-200/70 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpenCheck className="w-4 h-4 text-amber-600" />
                          <span>{isPassageGrammar ? 'Văn Bản Ngữ Pháp Đoạn Văn (文章の文法本文)' : 'Văn Bản Đọc Hiểu (読解本文)'}</span>
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-md">
                          {currentQuestion.subTypeLabel}
                        </span>
                      </div>

                      {/* Tranh ảnh/biểu bảng nếu có */}
                      {effectiveReadingData.imageUrl && (
                        <div className="text-center py-1">
                          <img
                            src={effectiveReadingData.imageUrl}
                            alt="Biểu bảng tra cứu thông tin"
                            className="rounded-xl border border-amber-200 max-h-48 mx-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Nội dung đoạn văn font Serif Nhật Bản với ô trống được highlight nổi bật */}
                      <div dangerouslySetInnerHTML={{ __html: renderPassageWithHighlight(effectiveReadingData.passage, isPassageGrammar ? currentQuestion.orderNumber : undefined) }} />

                      {/* Bản dịch tiếng Việt đoạn văn */}
                      {effectiveReadingData.passageVi && examMode !== 'exam' && (
                        <div className="pt-3 border-t border-amber-200/60">
                          <button
                            onClick={() => setShowTranslations(!showTranslations)}
                            className="text-xs text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {showTranslations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showTranslations ? 'Ẩn bản dịch đoạn văn' : 'Xem bản dịch tiếng Việt đoạn văn'}</span>
                          </button>
                          {showTranslations && (
                            <p className="mt-2 text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-amber-200 leading-relaxed whitespace-pre-line">
                              {effectiveReadingData.passageVi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cột phải: Câu hỏi & 4 Phương án */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-base font-bold text-slate-900 leading-relaxed font-serif">
                            <span dangerouslySetInnerHTML={{ __html: renderQuestionText(cleanQuestionText(currentQuestion.question, currentQuestion.orderNumber)) }} />
                          </h4>
                          {currentQuestion.questionVi && examMode !== 'exam' && (
                            <p className="text-xs text-slate-500 italic">
                              {cleanQuestionVi(currentQuestion.questionVi, currentQuestion.orderNumber)}
                            </p>
                          )}
                        </div>

                        {/* 4 Phương án lựa chọn (có hỗ trợ gạch bỏ loại trừ phương án sai) */}
                        <div className="space-y-2.5 pt-2">
                          {currentQuestion.options.map((option, optIdx) => {
                            const isSelected = userAnswers[currentQuestion.id] === optIdx;
                            const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(optIdx);
                            const hasAnswered = userAnswers[currentQuestion.id] !== undefined;
                            const correctIdx = currentQuestion.correctIndex;
                            const isCorrectOption = examMode === 'practice' && hasAnswered && correctIdx !== undefined && correctIdx >= 0 && optIdx === correctIdx;
                            const isWrongOption = examMode === 'practice' && hasAnswered && isSelected && correctIdx !== undefined && correctIdx >= 0 && optIdx !== correctIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                                onContextMenu={(e) => handleToggleEliminate(currentQuestion.id, optIdx, e)}
                                className={`w-full text-left p-3.5 rounded-2xl border text-xs md:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer group ${
                                  isEliminated
                                    ? 'opacity-40 line-through bg-slate-100/90 border-dashed border-slate-300 text-slate-400'
                                    : isCorrectOption
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                                    : isWrongOption
                                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs'
                                    : isSelected
                                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 font-bold shadow-xs'
                                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-800'
                                }`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-colors ${
                                    isEliminated
                                      ? 'bg-slate-200 text-slate-400 line-through'
                                      : isCorrectOption
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : isWrongOption
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : isSelected
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {isCorrectOption ? '✓' : isWrongOption ? '✕' : formatOptLabel(optIdx)}
                                </span>
                                <span className="pt-0.5 leading-relaxed font-serif flex-1" dangerouslySetInnerHTML={{ __html: option }} />
                                {!isCorrectOption && !isWrongOption && (
                                  <span
                                    onClick={(e) => handleToggleEliminate(currentQuestion.id, optIdx, e)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-opacity ${
                                      isEliminated
                                        ? 'text-rose-600 bg-rose-50 opacity-100'
                                        : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100'
                                    }`}
                                    title={isEliminated ? "Bỏ gạch loại trừ" : "Gạch bỏ phương án sai này (chuột phải)"}
                                  >
                                    {isEliminated ? '↺ Bỏ gạch' : '✕ Loại trừ'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nguồn tài liệu */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Đề thi chuẩn hóa JEES</span>
                        <span>Phím tắt: [1], [2], [3], [4]</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BỐ CỤC CÂU HỎI TIÊU CHUẨN (CHO TỪ VỰNG, NGỮ PHÁP, NGHE HIỂU) */
                  <div className="space-y-6">
                    

                    {/* Hướng dẫn đặc biệt cho dạng bài sắp xếp câu dấu sao ★ */}
                    {(currentQuestion.subType === 'sentence_order' || currentQuestion.question.includes('★') || currentQuestion.subTypeLabel?.includes('文の組み立て')) && (
                      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 space-y-1.5 animate-fadeIn">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>DẠNG BÀI: SẮP XẾP THỨ TỰ CÂU (文の組み立て)</span>
                        </div>
                        <p className="text-xs text-amber-900 leading-relaxed font-medium">
                          👉 Hãy ghép 4 phương án bên dưới theo trật tự câu hoàn chỉnh, sau đó <strong>chọn phương án nằm ở vị trí có ngôi sao 【★】</strong> làm đáp án đúng.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed font-serif">
                        <span dangerouslySetInnerHTML={{ __html: renderQuestionText(cleanQuestionText(currentQuestion.question, currentQuestion.orderNumber)) }} />
                      </h4>
                      {currentQuestion.questionVi && examMode !== 'exam' && (
                        <p className="text-xs text-slate-500 italic">
                          {cleanQuestionVi(currentQuestion.questionVi, currentQuestion.orderNumber)}
                        </p>
                      )}
                    </div>

                    {/* 4 Phương án (có hỗ trợ gạch bỏ loại trừ phương án sai) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option, optIdx) => {
                        const isSelected = userAnswers[currentQuestion.id] === optIdx;
                        const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(optIdx);
                        const hasAnswered = userAnswers[currentQuestion.id] !== undefined;
                        // Trong practice mode: hiển thị đáp án đúng/sai ngay sau khi chọn
                        const correctIdx = currentQuestion.correctIndex;
                        const isCorrectOption = examMode === 'practice' && hasAnswered && correctIdx !== undefined && correctIdx >= 0 && optIdx === correctIdx;
                        const isWrongOption = examMode === 'practice' && hasAnswered && isSelected && correctIdx !== undefined && correctIdx >= 0 && optIdx !== correctIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                            onContextMenu={(e) => handleToggleEliminate(currentQuestion.id, optIdx, e)}
                            className={`text-left p-4 rounded-2xl border text-xs md:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer group ${
                              isEliminated
                                ? 'opacity-40 line-through bg-slate-100/90 border-dashed border-slate-300 text-slate-400'
                                : isCorrectOption
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                                : isWrongOption
                                ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs'
                                : isSelected
                                ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 font-bold shadow-xs'
                                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-colors ${
                                isEliminated
                                  ? 'bg-slate-200 text-slate-400 line-through'
                                  : isCorrectOption
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : isWrongOption
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isCorrectOption ? '✓' : isWrongOption ? '✕' : formatOptLabel(optIdx)}
                            </span>
                            <span className="pt-0.5 leading-relaxed font-serif flex-1" dangerouslySetInnerHTML={{ __html: option }} />
                            {!isCorrectOption && !isWrongOption && (
                              <span
                                onClick={(e) => handleToggleEliminate(currentQuestion.id, optIdx, e)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-opacity ${
                                  isEliminated
                                    ? 'text-rose-600 bg-rose-50 opacity-100'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100'
                                }`}
                                title={isEliminated ? "Bỏ gạch loại trừ" : "Gạch bỏ phương án sai này (chuột phải)"}
                              >
                                {isEliminated ? '↺ Bỏ gạch' : '✕ Loại trừ'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* THANH ĐIỀU HƯỚNG TRƯỚC / SAU CÂU HỎI */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  <span className="text-xs text-slate-400 font-medium">
                    Câu {currentQuestionIndex + 1} / {activeExam.questions?.length}
                  </span>

                  {currentQuestionIndex < (activeExam.questions?.length || 0) - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev: any) => prev + 1)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Câu tiếp</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Hoàn tất & Nộp bài</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cột phải: Phiếu tô đáp án OMR (Answer Sheet Matrix) */}
            {showProgressSidebar && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Phiếu Trả Lời (OMR Sheet)</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600">
                    {Object.keys(userAnswers).length}/{activeExam.questions?.length} câu
                  </span>
                </div>

                {/* Ma trận số câu hỏi */}
                <div className="max-h-[380px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-5 gap-2">
                    {activeExam.questions?.map((q: any, idx: any) => {
                      const isCurrent = idx === currentQuestionIndex;
                      const isAns = userAnswers[q.id] !== undefined;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-11 rounded-xl text-xs font-bold flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white z-10 scale-105 shadow-sm'
                              : isAns
                              ? 'bg-emerald-600 text-white font-black shadow-xs border-2 border-emerald-500 hover:bg-emerald-700'
                              : 'bg-slate-100/70 text-slate-500 hover:bg-slate-200 hover:text-slate-800 border border-slate-200/80'
                          }`}
                          title={`Câu ${idx + 1}: ${isAns ? `Đã chọn đáp án ${formatOptLabel(userAnswers[q.id])}` : 'Chưa làm'}`}
                        >
                          <span className="text-[11px] leading-tight font-mono">{idx + 1}</span>
                          {isAns && (
                            <span className="text-[10px] leading-tight text-emerald-100 font-bold">
                              {formatOptLabel(userAnswers[q.id])}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chú thích trạng thái trực quan */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] text-center">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block shadow-xs" />
                    <span>Đã chọn (Sáng)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-500 bg-slate-100 py-1.5 rounded-xl border border-slate-200">
                    <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300 inline-block" />
                    <span>Chưa làm (Tối)</span>
                  </div>
                </div>

                {/* Nút nộp bài trực tiếp */}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  Nộp bài thi ngay
                </button>
              </div>
            </div>
            )}
          </div>
        </main>

        {/* MODAL XÁC NHẬN THOÁT BÀI THI */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full p-8 space-y-6 shadow-2xl border border-slate-100 animate-scaleUp text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">
                  Thoát bài tập?
                </h3>
                <p className="text-sm text-slate-600">
                  Thoát bây giờ bạn sẽ <strong className="text-amber-600">MẤT TIẾN ĐỘ</strong> làm bài này.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setCurrentScreen('catalog');
                  }}
                  className="py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  THOÁT
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-md"
                >
                  LÀM TIẾP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN NỘP BÀI THI */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-scaleUp">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Xác nhận nộp bài thi?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bạn đã làm {Object.keys(userAnswers).length} / {activeExam.questions?.length} câu hỏi.
                  </p>
                </div>
              </div>

              {Object.keys(userAnswers).length < (activeExam.questions?.length || 0) && (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-200/80">
                  ⚠️ Còn <strong>{(activeExam.questions?.length || 0) - Object.keys(userAnswers).length} câu</strong> bạn chưa chọn đáp án. Bạn vẫn muốn nộp chứ?
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Tiếp tục làm bài
                </button>
                <button
                  onClick={handleForceSubmit}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài ngay'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP TRA CỨU BÔI ĐEN / NHẤN ĐÚP TƯƠNG TỰ EXTENSION EJOY ENGLISH */}
        {selectionPopup && (
          <div
            style={{
              position: 'absolute',
              left: `${selectionPopup.x}px`,
              top: `${selectionPopup.y}px`,
              zIndex: 9999
            }}
            className="w-[330px] md:w-[380px] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-200 p-4 space-y-3 animate-fadeIn text-slate-800 ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Popup */}
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tra cứu nhanh • eJOY JLPT</span>
              </div>
              <button
                onClick={() => setSelectionPopup(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Đóng popup"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Đoạn văn bản bôi đen */}
            <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs font-bold text-indigo-950 font-serif leading-relaxed select-text">
              "{selectionPopup.text}"
            </div>

            {/* Trạng thái Loading hoặc Dữ liệu */}
            {selectionPopup.loading ? (
              <div className="flex items-center justify-center py-4 text-xs text-indigo-600 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang tra cứu nghĩa & sinh ví dụ tương tự...</span>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {selectionPopup.data?.type === 'word' ? (
                  /* GIAO DIỆN TRA CỨU TỪ VỰNG: Chữ Hán + Furigana, Ý nghĩa, 1 Ví dụ đơn */
                  <div className="space-y-2.5">
                    {/* Chữ Hán có Furigana */}
                    <div className="p-2 bg-indigo-50/80 rounded-xl border border-indigo-100/90 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Hán tự & Furigana:</span>
                        <p className="text-base font-black font-serif text-indigo-950 leading-relaxed">
                          {selectionPopup.data.kanjiWithFurigana || selectionPopup.text}
                        </p>
                      </div>
                    </div>

                    {/* Ý nghĩa tiếng Việt của từ */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ý nghĩa:</span>
                      <p className="font-bold text-emerald-800 text-sm leading-snug">
                        {selectionPopup.data.translation}
                      </p>
                    </div>

                    {/* Giải thích cách dùng ngắn */}
                    {selectionPopup.data.explanation && (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 leading-relaxed">
                        {selectionPopup.data.explanation}
                      </div>
                    )}

                    {/* 1 Câu ví dụ đơn giản */}
                    {selectionPopup.data.example && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-600" />
                          <span>Câu ví dụ đơn giản:</span>
                        </span>
                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-0.5">
                          <p className="font-serif font-bold text-slate-900 text-xs leading-relaxed">
                            {selectionPopup.data.example.jp}
                          </p>
                          <p className="text-[11px] text-slate-600 italic">
                            {selectionPopup.data.example.vi}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* GIAO DIỆN TRA CỨU CẢ CÂU: Dịch nghĩa cả câu, Mẫu ngữ pháp tương ứng, 1 Ví dụ */
                  <div className="space-y-2.5">
                    {/* Dịch nghĩa toàn bộ câu */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dịch nghĩa câu:</span>
                      <p className="font-bold text-emerald-800 text-sm leading-relaxed">
                        {selectionPopup.data?.translation}
                      </p>
                    </div>

                    {/* Khối Ngữ pháp tương ứng được dùng trong câu */}
                    {selectionPopup.data?.grammarPoint && (
                      <div className="p-2.5 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs space-y-1.5 text-slate-800">
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Mẫu ngữ pháp: {selectionPopup.data.grammarPoint}</span>
                        </div>
                        {selectionPopup.data.grammarStructure && (
                          <div className="text-[11px] font-mono text-indigo-800 bg-white/90 px-2 py-0.5 rounded-lg border border-indigo-100">
                            Cấu trúc: {selectionPopup.data.grammarStructure}
                          </div>
                        )}
                        {selectionPopup.data.grammarMeaning && (
                          <p className="text-[11px] text-slate-700 leading-relaxed pt-0.5">
                            {selectionPopup.data.grammarMeaning}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 1 Câu ví dụ minh họa ngữ pháp */}
                    {selectionPopup.data?.example && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-600" />
                          <span>Ví dụ minh họa ngữ pháp:</span>
                        </span>
                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-0.5">
                          <p className="font-serif font-bold text-slate-900 text-xs leading-relaxed">
                            {selectionPopup.data.example.jp}
                          </p>
                          <p className="text-[11px] text-slate-600 italic">
                            {selectionPopup.data.example.vi}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer: Lưu nhanh vào Sổ tay */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={async () => {
                      try {
                        await NotebookApi.createItem({
                          itemType: 'VOCAB',
                          title: selectionPopup.text,
                          meaningVi: selectionPopup.data?.translation || '',
                          exampleJp: selectionPopup.data?.examples?.[0]?.jp || '',
                          exampleVi: selectionPopup.data?.examples?.[0]?.vi || '',
                          tags: 'Tra cứu phòng thi JLPT'
                        });
                        showNotification('Đã lưu thành công vào Sổ tay học tập!', 'success');
                      } catch {
                        showNotification('Không thể lưu vào Sổ tay lúc này.', 'error');
                      }
                    }}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Lưu vào Sổ tay</span>
                  </button>
                  <span className="text-[10px] text-slate-400 italic">Bôi đen đoạn khác để tra tiếp</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // MÀN HÌNH 3: BÁO CÁO KẾT QUẢ THI THẬT 180 ĐIỂM & ĐỐI CHIẾU AI (GEMINI 3.5 FLASH)
  // ========================================================
  if (currentScreen === 'result' && examResult) {
    const isPassed = examResult.isPassed;
    const hasSectionalFailure = examResult.hasSectionalFailure;

    const wrongCount = examResult.questionResults.filter((q) => !q.isCorrect).length;
    const correctCount = examResult.questionResults.filter((q) => q.isCorrect).length;
    const totalCount = examResult.questionResults.length;

    const filteredQuestionResults = examResult.questionResults.filter((q) => {
      if (resultFilter === 'wrong' && q.isCorrect) return false;
      if (resultFilter === 'correct' && !q.isCorrect) return false;
      const targetSec = (resultSectionFilter || 'all').toLowerCase();
      if (targetSec !== 'all') {
        const qSec = (q.section || '').toLowerCase();
        if (qSec !== targetSec && !qSec.includes(targetSec) && !targetSec.includes(qSec)) return false;
      }
      return true;
    });

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        {/* 1. BANNER TỔNG KẾT ĐIỂM & TRẠNG THÁI ĐỖ / TRƯỢT */}
        <div
          className={`rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden ${
            isPassed
              ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900'
              : 'bg-gradient-to-br from-rose-700 via-red-800 to-slate-900'
          }`}
        >
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                JLPT {examResult.level} • Báo Cáo Điểm Thi Chuẩn 180
              </span>
              
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black">
                {isPassed ? '🎉 CHÚC MỪNG BẠN ĐÃ ĐỖ (PASSED)!' : '❌ BẠN CHƯA ĐẠT KỲ THI NÀY (FAILED)'}
              </h2>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                {examResult.summaryMessage}
              </p>
            </div>

            {/* Điểm tổng và tỷ lệ đúng */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                <span className="text-[10px] text-white/70 block uppercase font-bold">TỔNG ĐIỂM CHUẨN</span>
                <span className="text-2xl font-black">{examResult.totalScore} / 180</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                <span className="text-[10px] text-white/70 block uppercase font-bold">SỐ CÂU ĐÚNG</span>
                <span className="text-2xl font-black">
                  {examResult.totalCorrect} / {examResult.totalQuestions} ({Math.round((examResult.totalCorrect / examResult.totalQuestions) * 100)}%)
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                <span className="text-[10px] text-white/70 block uppercase font-bold">THỜI GIAN LÀM</span>
                <span className="text-2xl font-black">{formatTime(examResult.timeSpentSeconds)}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                <span className="text-[10px] text-white/70 block uppercase font-bold">CHUẨN ĐỖ</span>
                <span className="text-2xl font-black">{examResult.passingScore} đ</span>
              </div>
            </div>

            {hasSectionalFailure && (
              <div className="p-3 bg-rose-500/30 backdrop-blur-md rounded-2xl border border-rose-400/40 text-xs text-rose-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-200" />
                <span>Bạn bị dính <strong>Điểm liệt (&lt; 19/60đ)</strong> ở ít nhất 1 phân môn nên không đạt kỳ thi này.</span>
              </div>
            )}

            {/* Nút hành động nhanh */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentScreen('catalog')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer backdrop-blur-md"
              >
                ⬅️ Về danh sách đề thi
              </button>
              {activeExam && (
                <button
                  onClick={() => handleStartExam(activeExam, 'practice')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                >
                  🔄 Làm lại bài thi này
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. ĐIỂM CHI TIẾT 4 PHÂN MÔN THANG 60 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {examResult.sectionResults?.map((sec) => (
            <div
              key={sec.section}
              className={`bg-white rounded-2xl p-4 border shadow-xs space-y-2 ${
                sec.isFailedSection ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{sec.title}</span>
                {sec.isFailedSection && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                    Liệt (&lt;19)
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{sec.score}/60</span>
                <span className="text-xs font-semibold text-slate-500">
                  {sec.correctCount}/{sec.totalQuestions} câu
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${sec.isFailedSection ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (sec.score / 60) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 2.5. ĐÁNH GIÁ NĂNG LỰC ĐA CHIỀU (THU GỌN) */}
        <details className="group p-1 border border-slate-200 rounded-3xl bg-white shadow-xs mb-6">
          <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-50">
                <Target className="w-5 h-5 text-indigo-600" />
              </span>
              <h3 className="text-base font-bold text-slate-800">
                Bấm để xem: Đánh Giá Năng Lực Đa Chiều (Radar Assessment)
              </h3>
            </div>
            <span className="text-indigo-600 group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="p-4 pt-0 border-t border-slate-100 mt-2">
{/* 2.5. ĐÁNH GIÁ NĂNG LỰC ĐA CHIỀU (COMPETENCY RADAR & MULTI-DIMENSIONAL ASSESSMENT) */}
        {(() => {
          const dims = [
            {
              id: 'vocab',
              name: '🔤 Hán tự & Từ vựng',
              desc: 'Cách đọc Hán tự, chữ Hán, điền từ theo ngữ cảnh & từ đồng nghĩa',
              filter: (q: QuestionResultItem) => q.section === 'vocab'
            },
            {
              id: 'grammar',
              name: '📑 Ngữ pháp & Dấu sao ★',
              desc: 'Cấu trúc ngữ pháp chuẩn JEES, ghép câu có dấu sao & liên từ đoạn văn',
              filter: (q: QuestionResultItem) => q.section === 'grammar'
            },
            {
              id: 'short_med_dokkai',
              name: '📖 Đọc hiểu Ngắn & Trung văn',
              desc: 'Nắm bắt ý chính, tìm lý do & thông điệp tác giả trong bài 150-550 chữ',
              filter: (q: QuestionResultItem) => q.section === 'reading' && (q.subTypeLabel?.includes('短文') || q.subTypeLabel?.includes('中文') || (!q.subTypeLabel?.includes('長文') && !q.subTypeLabel?.includes('情報')))
            },
            {
              id: 'long_info_dokkai',
              name: '📊 Trường văn & Tra cứu tin',
              desc: 'Đọc quét thông tin trên tờ rơi biểu bảng & luận điểm bài văn dài 900-1200 chữ',
              filter: (q: QuestionResultItem) => q.section === 'reading' && (q.subTypeLabel?.includes('長文') || q.subTypeLabel?.includes('情報'))
            },
            {
              id: 'listening',
              name: '🎧 Nghe hiểu Tình huống & Phản xạ',
              desc: 'Bắt hành động nhân vật, điểm cốt lõi & đối đáp phản xạ tức thì',
              filter: (q: QuestionResultItem) => q.section === 'listening'
            }
          ];

          const evaluatedDims = dims.map(d => {
            const matched = examResult.questionResults.filter(d.filter);
            const total = matched.length;
            const correct = matched.filter(q => q.isCorrect).length;
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
            return { ...d, total, correct, pct };
          }).filter(d => d.total > 0);

          const lowestDim = [...evaluatedDims].sort((a, b) => a.pct - b.pct)[0];
          const highestDim = [...evaluatedDims].sort((a, b) => b.pct - a.pct)[0];

          return (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-md space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-slate-900">
                      Đánh Giá Năng Lực Đa Chiều (Competency Radar Assessment)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phân tích 5 chiều năng lực khảo thí chuyên sâu theo chuẩn cấu trúc JEES & giáo trình Shin Kanzen Master.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ≥80%: Vững vàng
                  </span>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    50-79%: Cần củng cố
                  </span>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    &lt;50%: Báo động
                  </span>
                </div>
              </div>

              {/* Lưới 5 thanh năng lực */}
              <div className="space-y-4">
                {evaluatedDims.map((dim) => {
                  const isHigh = dim.pct >= 80;
                  const isMed = dim.pct >= 50 && dim.pct < 80;
                  const colorClass = isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500';
                  const badgeClass = isHigh ? 'text-emerald-700 bg-emerald-50' : isMed ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50';
                  const statusText = isHigh ? 'Xuất sắc' : isMed ? 'Đạt chuẩn' : 'Cần rèn luyện thêm';

                  return (
                    <div key={dim.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{dim.name}</span>
                          <span className="text-[11px] text-slate-500 block">{dim.desc}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">{dim.pct}%</span>
                          <span className="text-[11px] text-slate-500 block">({dim.correct}/{dim.total} câu)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                          style={{ width: `${dim.pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Chuẩn mục tiêu: ≥ 80%</span>
                        <span className={`font-bold px-2 py-0.5 rounded-md ${badgeClass}`}>{statusText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lời khuyên Sư phạm & Chiến thuật Thi Thật */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                {highestDim && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Thế mạnh vượt trội: {highestDim.name} ({highestDim.pct}%)</span>
                    </span>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Bạn đã nắm rất vững nhóm kỹ năng này. Hãy duy trì tốc độ làm bài nhanh ở phần này để dành thời gian quý báu cho các phần đọc hiểu dài.
                    </p>
                  </div>
                )}
                {lowestDim && (
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Vùng cần đột phá: {lowestDim.name} ({lowestDim.pct}%)</span>
                    </span>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Đây là điểm mất điểm nhiều nhất của bạn. Đề xuất: Dùng tính năng <strong>Luyện Chuyên Sâu (Mondai Drills)</strong> để làm riêng 30 câu của dạng này trước khi thi lần tới.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
          </div>
        </details>
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-indigo-200 shadow-md space-y-8">
          {/* Header khối AI */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-100">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                <BrainCircuit className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg md:text-xl font-black text-slate-900">
                    Phân Tích Năng Lực & Bài Học Rút Kinh Nghiệm
                  </h3>
                  
                </div>
                <p className="text-xs text-slate-500">
                  Hội đồng Giám khảo AI chẩn đoán toàn diện bài làm, chỉ ra lý do sai và tích hợp bản xem lại bài thi để học viên rút kinh nghiệm trực tiếp.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => fetchAiDiagnostic(examResult)}
                disabled={isLoadingDiagnostic}
                className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDiagnostic ? 'animate-spin' : ''}`} />
                <span>{isLoadingDiagnostic ? 'Đang phân tích...' : 'Làm mới phân tích AI'}</span>
              </button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoadingDiagnostic && (
            <div className="p-8 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 text-center space-y-3 animate-pulse">
              <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-indigo-900">
                  Giám khảo AI (Gemini 3.5 Flash) đang đọc bài thi và tổng hợp bài học...
                </h4>
                <p className="text-xs text-slate-500">
                  Hệ thống đang rà soát từng phương án bạn đã chọn, phân tích bẫy đề thi và lập lộ trình ôn tập.
                </p>
              </div>
            </div>
          )}

          {/* Diagnostic Error */}
          {diagnosticError && !isLoadingDiagnostic && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span>⚠️ {diagnosticError}</span>
              <button
                onClick={() => fetchAiDiagnostic(examResult)}
                className="font-bold underline text-amber-950 cursor-pointer"
              >
                Thử lại ngay
              </button>
            </div>
          )}

          {/* Diagnostic Content */}
          {diagnosticReport && !isLoadingDiagnostic && (
            <div className="space-y-6">
              {/* Thẻ Ước tính Đỗ & Nhận xét sư phạm */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cột 1: Thước đo xác suất đỗ */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/70 border border-indigo-100 flex flex-col justify-between space-y-3">
                  <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dự Đoán Kỳ Thi Thật</span>
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-indigo-950">
                        {diagnosticReport.passingProbability}%
                      </span>
                      <span className="text-xs font-bold text-indigo-700">Xác suất đỗ</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {diagnosticReport.scoreAssessment?.statusText}
                    </p>
                  </div>
                  <div className="w-full bg-white/80 h-2.5 rounded-full overflow-hidden border border-indigo-200/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                      style={{ width: `${diagnosticReport.passingProbability}%` }}
                    />
                  </div>
                </div>

                {/* Cột 2 & 3: Lời nhận xét tổng quan của Giám khảo AI */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Đánh Giá Năng Lực Từ Giám Khảo AI
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
                    {diagnosticReport.overallVerdict}
                  </p>
                  {diagnosticReport.scoreAssessment?.sectionalRisk && (
                    <div className="pt-1.5 border-t border-slate-200/60 text-xs text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{diagnosticReport.scoreAssessment.sectionalRisk}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thẻ So Sánh 2 Cột: Điểm Mạnh vs Lỗ Hổng Kiến Thức */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Điểm mạnh */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Điểm Mạnh Cần Phát Huy</span>
                  </div>
                  <ul className="space-y-2">
                    {diagnosticReport.strengthAreas?.map((item, idx) => (
                      <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lỗ hổng cần khắc phục */}
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Lỗ Hổng Cần Khắc Phục Ngay</span>
                  </div>
                  <ul className="space-y-2">
                    {diagnosticReport.criticalWeaknesses?.map((item, idx) => (
                      <li key={idx} className="text-xs text-rose-950 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-600 font-bold shrink-0">!</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lộ trình ôn tập 7 ngày */}
              {diagnosticReport.actionPlan7Days && diagnosticReport.actionPlan7Days.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Lộ Trình 7 Ngày Bứt Phá Do AI Đề Xuất</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {diagnosticReport.actionPlan7Days.map((plan, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                        <span className="text-[11px] font-black text-indigo-600 block">
                          {plan.dayRange}: {plan.focusArea}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">{plan.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lời động viên từ Giám khảo AI */}
              {diagnosticReport.encouragement && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-100 text-xs text-purple-950 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                  <p className="italic leading-relaxed font-medium">"{diagnosticReport.encouragement}"</p>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* PHẦN CỐT LÕI: BẢN XEM LẠI BÀI THI & BÀI HỌC RÚT KINH NGHIỆM TRỰC TIẾP */}
          {/* ================================================================ */}
          <div className="pt-6 border-t border-slate-200 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-indigo-600" />
                  <span>Bản Xem Lại Bài Thi & Bài Học Rút Kinh Nghiệm Trực Tiếp</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Đối chiếu lựa chọn của bạn, phân tích bẫy đề thi và đúc kết bài học rút kinh nghiệm cho từng câu.
                </p>
              </div>

              {/* Nút 1-Click lưu tất cả câu sai vào Sổ tay */}
              {wrongCount > 0 && (
                <button
                  onClick={handleSaveAllWrongToNotebook}
                  disabled={isSavingToNotebook}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-sm flex items-center gap-2 active:scale-95 shrink-0"
                >
                  <BookmarkPlus className="w-4 h-4 text-slate-950" />
                  <span>
                    {isSavingToNotebook
                      ? 'Đang lưu vào Sổ tay...'
                      : `📌 Lưu ${wrongCount} câu sai vào Sổ tay Flashcard SRS`}
                  </span>
                </button>
              )}
            </div>

            {savedNotebookMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{savedNotebookMessage}</span>
              </div>
            )}

            {/* Thanh công cụ bộ lọc đơn giản & thân thiện */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              {/* Tab lọc: Câu sai / Tất cả / Câu đúng */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setResultFilter('wrong')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    resultFilter === 'wrong'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  ❌ Chỉ câu làm sai ({wrongCount})
                </button>
                <button
                  onClick={() => setResultFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    resultFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  📋 Tất cả câu hỏi ({totalCount})
                </button>
                <button
                  onClick={() => setResultFilter('correct')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    resultFilter === 'correct'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  ✅ Chỉ câu làm đúng ({correctCount})
                </button>
              </div>

              {/* Lọc theo kỹ năng */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={resultSectionFilter}
                  onChange={(e) => setResultSectionFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-hidden"
                >
                  <option value="all">Tất cả phân môn</option>
                  <option value="vocab">Chữ Hán & Từ vựng</option>
                  <option value="grammar">Cấu trúc Ngữ pháp</option>
                  <option value="reading">Đọc hiểu</option>
                  <option value="listening">Nghe hiểu</option>
                </select>
              </div>
            </div>

            {/* Danh sách từng câu hỏi xem lại & rút kinh nghiệm */}
            <div className="space-y-4">
              {filteredQuestionResults.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  Không có câu hỏi nào thỏa mãn bộ lọc hiện tại.
                </div>
              ) : (
                filteredQuestionResults.map((q) => {
                  const lesson = lessonByOrderMap.get(q.orderNumber);
                  const aiRes = aiExplanations[q.questionId];
                  const isLoadingAi = loadingAiId === q.questionId;
                  const isSavedToNotebook = savedSingleNotebookIds[q.questionId];

                  const userAnsText =
                    q.userAnswer !== null && q.userAnswer !== undefined && q.options[q.userAnswer]
                      ? q.options[q.userAnswer]
                      : 'Chưa chọn đáp án (bỏ trống)';
                  const correctAnsText = q.options[q.correctAnswer] || '';

                  return (
                    <div
                      key={q.questionId}
                      className={`bg-white rounded-3xl p-5 md:p-6 border shadow-xs space-y-4 transition-all ${
                        q.isCorrect ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-rose-200/80 bg-rose-50/10'
                      }`}
                    >
                      {/* Header của câu hỏi */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                              q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Câu {q.orderNumber}: {q.isCorrect ? 'ĐÚNG ✅' : 'LÀM SAI ❌'}
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                            {q.subTypeLabel}
                          </span>
                          <span className="text-[11px] text-indigo-600 font-semibold uppercase">
                            {q.section}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {q.officialSource}
                        </span>
                      </div>

                      {/* BĂNG NGHE CHOUKAI & TỜ ĐỀ THI GIẤY TRẮNG ĐEN (CHO CÂU HỎI NGHE HIỂU) */}
                      {(q.section === 'listening' || q.audioUrl) && (
                        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleReviewAudio(q)}
                              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow transition-all cursor-pointer"
                            >
                              {reviewAudioPlayingId === q.questionId ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 fill-white" />
                                  <span>Tạm dừng</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-white" />
                                  <span>Nghe lại bài nghe</span>
                                </>
                              )}
                            </button>
                            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                              <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{reviewAudioPlayingId === q.questionId ? '🔊 Đang phát băng nghe...' : 'Băng nghe gốc'}</span>
                            </span>

                            {/* Bộ chỉnh tốc độ âm thanh: 0.8x, 1.0x, 1.2x (Tiện ích 2) */}
                            <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-700">
                              <span className="text-[10px] font-semibold text-slate-400 mr-0.5">Tốc độ:</span>
                              {[0.8, 1.0, 1.2].map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => handleChangePlaybackRate(rate)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    audioPlaybackRate === rate
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                  title={`Phát ở tốc độ ${rate}x`}
                                >
                                  {rate}x
                                </button>
                              ))}
                            </div>
                          </div>

                          {q.passage && (
                            <button
                              onClick={() => setReviewExpandedScriptId(reviewExpandedScriptId === q.questionId ? null : q.questionId)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {reviewExpandedScriptId === q.questionId ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{reviewExpandedScriptId === q.questionId ? 'Ẩn kịch bản hội thoại' : 'Xem kịch bản hội thoại (Script & Dịch)'}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Kịch bản hội thoại khi học viên bấm mở rộng */}
                      {reviewExpandedScriptId === q.questionId && q.passage && (
                        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs space-y-2">
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            📝 Kịch bản hội thoại gốc (Script):
                          </div>
                          <p className="text-slate-200 font-serif leading-relaxed whitespace-pre-line">
                            {q.passage}
                          </p>
                          {q.passageVi && (
                            <p className="text-slate-400 italic pt-2 border-t border-slate-800 whitespace-pre-line leading-relaxed">
                              {q.passageVi}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Đoạn văn đọc hiểu hoặc ngữ pháp đoạn văn */}
                      {q.section !== 'listening' && !q.audioUrl && q.passage && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-serif text-slate-800 leading-relaxed max-h-56 overflow-y-auto">
                          <div dangerouslySetInnerHTML={{ __html: renderPassageWithHighlight(q.passage, q.section === 'grammar' ? q.orderNumber : undefined) }} />
                        </div>
                      )}

                      {/* TỜ ĐỀ THI GIẤY TRẮNG ĐEN (問題用紙) TÁCH BIỆT CHUẨN IN JEES */}
                      {q.imageUrl && (
                        <div className="bg-white rounded-2xl border-2 border-slate-800 p-4 md:p-5 shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                                問題用紙
                              </span>
                              <span className="text-xs font-bold text-slate-900 font-serif">
                                【{q.subTypeLabel}】 イラスト・図表 (Bản vẽ đen trắng B&W)
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                              JEES Standard
                            </span>
                          </div>

                          <div className="p-2 md:p-3 bg-white border border-slate-300 rounded-xl flex items-center justify-center">
                            <img
                              src={q.imageUrl}
                              alt="Tranh minh họa đề thi Choukai"
                              className="w-full max-h-72 object-contain rounded-lg"
                            />
                          </div>

                          <div className="text-right text-[10px] text-slate-500 font-serif italic">
                            ※ Nhìn hình ảnh minh họa trên tờ đề thi để đối chiếu phương án trả lời.
                          </div>
                        </div>
                      )}

                      {/* Câu hỏi tiếng Nhật & dịch tiếng Việt */}
                      <div className="space-y-1">
                        <h4 
                          className="text-sm md:text-base font-bold text-slate-900 font-serif leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderQuestionText(cleanQuestionText(q.question, q.orderNumber)) }}
                        />
                        {q.questionVi && (
                          <p className="text-xs text-slate-500 italic">{cleanQuestionVi(q.questionVi, q.orderNumber)}</p>
                        )}
                      </div>

                      {/* BẢNG ĐỐI CHIẾU ĐÁP ÁN RÕ RÀNG, TÁCH BIỆT */}
                      <div className="pt-1">
                        {q.isCorrect ? (
                          <div className="p-3 rounded-2xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between text-xs font-medium text-emerald-900 shadow-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                              <span>Bạn đã chọn chính xác: <strong>Phương án [{formatOptLabel(q.correctAnswer)}]</strong></span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase">Chính xác</span>
                          </div>
                        ) : q.userAnswer === null || q.userAnswer === undefined ? (
                          <div className="p-3 rounded-2xl border border-amber-300 bg-amber-50/70 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-amber-900 shadow-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">!</span>
                              <span>Bạn đã bỏ trống câu hỏi này</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <span>🎯 Đáp án đúng: <strong>Phương án [{formatOptLabel(q.correctAnswer)}]</strong></span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Cột đáp án học viên chọn sai */}
                            <div className="p-3 rounded-2xl border-2 border-rose-300 bg-rose-50/80 text-rose-950 text-xs flex items-center justify-between gap-2 shadow-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✕</span>
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Lựa chọn của bạn:</span>
                                  <span className="font-bold text-rose-900 truncate block">Phương án [{formatOptLabel(q.userAnswer)}]</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 shrink-0">Làm sai</span>
                            </div>

                            {/* Cột đáp án đúng chuẩn */}
                            <div className="p-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50/80 text-emerald-950 text-xs flex items-center justify-between gap-2 shadow-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">🎯</span>
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Đáp án chuẩn JLPT:</span>
                                  <span className="font-bold text-emerald-900 truncate block">Phương án [{formatOptLabel(q.correctAnswer)}]</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 shrink-0">Đáp án đúng</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* KHU VỰC 4 PHƯƠNG ÁN LỰA CHỌN TÁCH BIỆT */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Chi tiết 4 phương án đề bài:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isUserPick = q.userAnswer === optIdx;
                            const isRightAnswer = q.correctAnswer === optIdx;

                            let cardClass = 'bg-slate-50/50 border-slate-200 text-slate-700';
                            let badge: React.ReactNode = null;

                            if (isRightAnswer) {
                              cardClass = 'bg-emerald-50/80 border-2 border-emerald-500 text-emerald-950 font-semibold shadow-xs';
                              badge = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                                  <span>🎯 Đáp án đúng</span>
                                </span>
                              );
                            } else if (isUserPick) {
                              cardClass = 'bg-rose-50/80 border-2 border-rose-400 text-rose-950 shadow-xs';
                              badge = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shrink-0">
                                  <span>✕ Bạn đã chọn</span>
                                </span>
                              );
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-2.5 transition-all ${cardClass}`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <span
                                    className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold shrink-0 text-xs shadow-xs ${
                                      isRightAnswer
                                        ? 'bg-emerald-600 text-white'
                                        : isUserPick
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {formatOptLabel(optIdx)}
                                  </span>
                                  <span
                                    className="pt-0.5 leading-relaxed font-serif flex-1 break-words"
                                    dangerouslySetInnerHTML={{ __html: opt }}
                                  />
                                </div>
                                {badge}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* KHUNG BÀI HỌC RÚT KINH NGHIỆM TỪ AI (GEMINI 3.5 FLASH) */}
                      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/90 text-xs space-y-2.5">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                          <span>Bài Học Rút Kinh Nghiệm Từ Giám Khảo AI:</span>
                        </div>

                        {/* Bẫy đề thi & Lý do sai */}
                        <div className="space-y-0.5">
                          <strong className="text-amber-950 block">🎯 Bẫy đề thi & Lý do dễ nhầm:</strong>
                          <p className="text-slate-700 leading-relaxed">
                            {lesson?.trapNote || q.explanation || 'Phân tích kỹ ngữ cảnh và trợ từ liên kết trước chỗ trống.'}
                          </p>
                        </div>

                        {/* Bài học cốt lõi */}
                        <div className="space-y-0.5">
                          <strong className="text-amber-950 block">💡 Bài học cốt lõi để không sai lại:</strong>
                          <p className="text-slate-700 leading-relaxed font-medium">
                            {lesson?.coreTakeaway || q.studyTips || 'Ghi nhớ trọng điểm kiến thức và công thức nhận diện dạng bài.'}
                          </p>
                        </div>

                        {/* Kiến thức trọng tâm */}
                        {q.keyGrammarOrVocab && (
                          <div className="pt-1.5 border-t border-amber-200/60 text-slate-700">
                            <span className="font-bold text-amber-950">📘 Trọng tâm kiến thức: </span>
                            <span>{q.keyGrammarOrVocab}</span>
                          </div>
                        )}
                      </div>

                      {/* AI Explain sâu hơn nếu học viên yêu cầu */}
                      {aiRes && (
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-2">
                          <strong className="text-purple-900 font-bold flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span>Giải Thích Chuyên Sâu Từ Gemini 3.5 Flash:</span>
                          </strong>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                            <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                              <span className="font-bold text-rose-700 block">🎯 Bẫy Đề Thi:</span>
                              <p className="text-slate-700 mt-0.5">{aiRes.explanation}</p>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                              <span className="font-bold text-indigo-700 block">📘 Trọng Tâm Cần Nhớ:</span>
                              <p className="text-slate-700 mt-0.5">{aiRes.keyKnowledge || aiRes.keyGrammarOrVocab}</p>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                              <span className="font-bold text-emerald-700 block">💡 Mẹo Làm Bài:</span>
                              <p className="text-slate-700 mt-0.5">{aiRes.studyTips}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Các nút hành động trên từng câu */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {!q.isCorrect && (
                          <button
                            onClick={() => handleSaveSingleToNotebook(q)}
                            disabled={isSavedToNotebook}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSavedToNotebook
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {isSavedToNotebook ? (
                              <>
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã lưu vào Sổ tay Flashcard SRS</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3.5 h-3.5 text-amber-700" />
                                <span>Lưu câu này vào Sổ tay để học SRS</span>
                              </>
                            )}
                          </button>
                        )}

                        {!aiRes && (
                          <button
                            onClick={() => handleRequestAiExplain(q.questionId, q.userAnswer)}
                            disabled={isLoadingAi}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{isLoadingAi ? 'Gemini 3.5 Flash đang phân tích...' : 'Hỏi AI giải thích sâu hơn'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Nút Điều Hướng Cuối Trang */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentScreen('catalog')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            ⬅️ Về danh sách đề thi
          </button>
          {activeExam && (
            <button
              onClick={() => handleStartExam(activeExam, 'practice')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
            >
              🔄 Làm lại bài thi này
            </button>
          )}
        </div>
      </div>
    );
  }
  return null;
};
