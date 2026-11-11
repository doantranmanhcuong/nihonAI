'use client';

import { CanvasOverlay } from './CanvasOverlay';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Coffee,
  Pen, ToggleLeft, ToggleRight, LayoutGrid, Info,
  Award,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
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

export interface ExamTakingSession {
  id: string;
  title: string;
  nextTitle: string;
  sections: ExamSectionType[];
  durationMinutes: number;
}

export function getExamSessions(
  level: JLPTLevel | string,
  examFormat: 'full' | 'express',
  allQuestions: ExamQuestionItem[] = []
): ExamTakingSession[] {
  const normLevel = (level || 'N3').toUpperCase();
  const hasVocab = allQuestions.some((q) => q.section === 'vocab');
  const hasGrammar = allQuestions.some((q) => q.section === 'grammar');
  const hasReading = allQuestions.some((q) => q.section === 'reading');
  const hasListening = allQuestions.some((q) => q.section === 'listening');

  if (normLevel === 'N3') {
    const list: ExamTakingSession[] = [];
    if (hasVocab) {
      list.push({
        id: 'vocab',
        title: 'KANJI • TỪ VỰNG',
        nextTitle: hasGrammar || hasReading ? 'Ngữ pháp • Đọc hiểu' : (hasListening ? 'Nghe hiểu' : 'Kết quả bài thi'),
        sections: ['vocab'],
        durationMinutes: examFormat === 'express' ? 10 : 30
      });
    }
    if (hasGrammar || hasReading) {
      list.push({
        id: 'grammar_reading',
        title: 'NGỮ PHÁP • ĐỌC HIỂU',
        nextTitle: hasListening ? 'Nghe hiểu' : 'Kết quả bài thi',
        sections: ['grammar', 'reading'],
        durationMinutes: examFormat === 'express' ? 25 : 70
      });
    }
    if (hasListening) {
      list.push({
        id: 'listening',
        title: 'NGHE HIỂU',
        nextTitle: 'Kết quả bài thi',
        sections: ['listening'],
        durationMinutes: examFormat === 'express' ? 15 : 40
      });
    }
    return list.length > 0 ? list : [{
      id: 'all',
      title: 'ĐỀ THI TỔNG HỢP N3',
      nextTitle: 'Kết quả bài thi',
      sections: ['vocab', 'grammar', 'reading', 'listening'],
      durationMinutes: 140
    }];
  }

  if (normLevel === 'N1' || normLevel === 'N2') {
    const list: ExamTakingSession[] = [];
    const dur1 = normLevel === 'N1' ? (examFormat === 'express' ? 35 : 110) : (examFormat === 'express' ? 35 : 105);
    const dur2 = normLevel === 'N1' ? (examFormat === 'express' ? 15 : 60) : (examFormat === 'express' ? 15 : 50);

    if (hasVocab || hasGrammar || hasReading) {
      list.push({
        id: 'vocab_grammar_reading',
        title: 'TỪ VỰNG • NGỮ PHÁP • ĐỌC HIỂU',
        nextTitle: hasListening ? 'Nghe hiểu' : 'Kết quả bài thi',
        sections: ['vocab', 'grammar', 'reading'],
        durationMinutes: dur1
      });
    }
    if (hasListening) {
      list.push({
        id: 'listening',
        title: 'NGHE HIỂU',
        nextTitle: 'Kết quả bài thi',
        sections: ['listening'],
        durationMinutes: dur2
      });
    }
    return list.length > 0 ? list : [{
      id: 'all',
      title: `ĐỀ THI TỔNG HỢP ${normLevel}`,
      nextTitle: 'Kết quả bài thi',
      sections: ['vocab', 'grammar', 'reading', 'listening'],
      durationMinutes: 155
    }];
  }

  // N4 & N5
  const list: ExamTakingSession[] = [];
  const durVocab = normLevel === 'N4' ? (examFormat === 'express' ? 10 : 25) : (examFormat === 'express' ? 8 : 20);
  const durGR = normLevel === 'N4' ? (examFormat === 'express' ? 20 : 55) : (examFormat === 'express' ? 15 : 40);
  const durListen = normLevel === 'N4' ? (examFormat === 'express' ? 12 : 35) : (examFormat === 'express' ? 10 : 30);

  if (hasVocab) {
    list.push({
      id: 'vocab',
      title: 'TỪ VỰNG',
      nextTitle: hasGrammar || hasReading ? 'Ngữ pháp • Đọc hiểu' : (hasListening ? 'Nghe hiểu' : 'Kết quả bài thi'),
      sections: ['vocab'],
      durationMinutes: durVocab
    });
  }
  if (hasGrammar || hasReading) {
    list.push({
      id: 'grammar_reading',
      title: 'NGỮ PHÁP • ĐỌC HIỂU',
      nextTitle: hasListening ? 'Nghe hiểu' : 'Kết quả bài thi',
      sections: ['grammar', 'reading'],
      durationMinutes: durGR
    });
  }
  if (hasListening) {
    list.push({
      id: 'listening',
      title: 'NGHE HIỂU',
      nextTitle: 'Kết quả bài thi',
      sections: ['listening'],
      durationMinutes: durListen
    });
  }
  return list.length > 0 ? list : [{
    id: 'all',
    title: `ĐỀ THI TỔNG HỢP ${normLevel}`,
    nextTitle: 'Kết quả bài thi',
    sections: ['vocab', 'grammar', 'reading', 'listening'],
    durationMinutes: 115
  }];
}

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
      return `<p class="text-slate-900 text-sm md:text-base leading-loose whitespace-pre-line font-japanese">${passage}</p>`;
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
    
    return `<div class="text-slate-900 text-sm md:text-base leading-loose whitespace-pre-line font-japanese">${innerHtml}</div>`;
  };

const stripRuby = (str?: string | null): string => {
  if (!str) return '';
  return str
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<rp>.*?<\/rp>/g, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\*\*/g, '')
    .trim();
};

interface QuestionDiagnosticInsightData {
  rightOptionJp: string;
  rightOptionVi: string;
  evidenceSection?: {
    label: string;
    quoteJp: string;
    quoteVi?: string;
  };
  recognitionGuides: {
    title: string;
    content: string;
  }[];
  trapBreakdown: {
    optIdx: number;
    textJp: string;
    textVi?: string;
    isCorrect: boolean;
    analysis: string;
  }[];
  coreStudyTakeaway: string;
  keyKnowledgeHtml?: string;
}

const getQuestionDiagnosticInsight = (
  q: QuestionResultItem,
  lesson?: DiagnosticLessonLearned
): QuestionDiagnosticInsightData => {
  const rightIdx = q.correctAnswer ?? 0;
  const rightOptionJp = q.options?.[rightIdx] || '';
  const rightOptionVi = q.optionsVi?.[rightIdx] || '';
  const cleanRightJp = stripRuby(rightOptionJp);

  // 1. DẪN CHỨNG MẪU CHỐT (Cho Đọc hiểu hoặc Nghe hiểu)
  let evidenceSection: QuestionDiagnosticInsightData['evidenceSection'] = undefined;

  if (q.section === 'reading' || q.section === 'listening') {
    const isListening = q.section === 'listening' || Boolean(q.audioUrl);
    const label = isListening
      ? '🎧 Đoạn thoại then chốt trong kịch bản nghe (Listening Evidence):'
      : '📍 Câu dẫn chứng mấu chốt trong bài đọc (Reading Evidence):';

    // Thử trích xuất từ ngoặc 「...」 trong explanation trước
    const quoteInExp = (q.explanation || '').match(/「([^」]+)」/);
    let quoteJp = '';
    let quoteVi: string | undefined = undefined;

    if (quoteInExp && quoteInExp[1].length > 4) {
      quoteJp = quoteInExp[1];
    } else if (q.passage) {
      // Tách passage thành các câu bằng dấu chấm câu tiếng Nhật
      const sentences = q.passage
        .split(/(?<=[。！？\n])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      // Tìm câu có nhiều ký tự trùng khớp nhất với đáp án đúng hoặc explanation
      const targetKeywords = (cleanRightJp + ' ' + (q.explanation || ''))
        .replace(/[\s\d\(\)\[\]・,，。]/g, '')
        .split('')
        .filter((c) => /[\u4e00-\u9faf\u30a0-\u30ff]/.test(c));

      let bestSentence = '';
      let maxMatches = -1;

      for (const sent of sentences) {
        let matches = 0;
        for (const kw of targetKeywords) {
          if (sent.includes(kw)) matches++;
        }
        if (matches > maxMatches) {
          maxMatches = matches;
          bestSentence = sent;
        }
      }

      quoteJp = bestSentence || sentences[0] || '';
    }

    // Tìm bản dịch tiếng Việt tương ứng nếu có passageVi
    if (q.passageVi && quoteJp) {
      const viSentences = q.passageVi
        .split(/(?<=[.!?\n])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      if (viSentences.length > 0) {
        const viKeywords = (rightOptionVi + ' ' + (q.explanation || ''))
          .toLowerCase()
          .split(/[\s,.:;!?"'-]+/)
          .filter((w) => w.length > 2);

        let bestVi = '';
        let maxViMatches = -1;
        for (const vSent of viSentences) {
          const lower = vSent.toLowerCase();
          let count = 0;
          for (const kw of viKeywords) {
            if (lower.includes(kw)) count++;
          }
          if (count > maxViMatches) {
            maxViMatches = count;
            bestVi = vSent;
          }
        }
        quoteVi = bestVi || undefined;
      }
    }

    if (quoteJp) {
      evidenceSection = {
        label,
        quoteJp,
        quoteVi
      };
    }
  }

  // 2. DẤU HIỆU NHẬN BIẾT & PHƯƠNG PHÁP SUY LUẬN (RECOGNITION GUIDES)
  const recognitionGuides: { title: string; content: string }[] = [];

  if (q.section === 'reading') {
    recognitionGuides.push({
      title: '🔍 Kỹ thuật đối chiếu Paraphrase (Diễn đạt tương đương)',
      content: `Ý chính trong bài đọc tương ứng trực tiếp với Phương án [${formatOptLabel(rightIdx)}]. Bài thi JLPT thường không dùng lại y nguyên câu chữ mà sẽ diễn đạt lại (Paraphrase) từ câu dẫn chứng sang các từ đồng nghĩa hoặc câu chủ động/bị động tương đương.`
    });
    recognitionGuides.push({
      title: '🎯 Định vị từ khóa (Keyword Scanning)',
      content: `Đọc lướt câu hỏi để khoanh vùng từ khóa trọng tâm${q.questionVi ? ` ("${cleanQuestionVi(q.questionVi, q.orderNumber).slice(0, 50)}...")` : ''}, sau đó dò tới vị trí câu mang thông tin trong bài đọc thay vì dịch toàn bộ từ đầu đến cuối.`
    });
  } else if (q.section === 'listening') {
    recognitionGuides.push({
      title: '🎧 Lắng nghe từ phát tín hiệu chốt kết luận (Signal Words)',
      content: `Trong phần nghe JLPT, thông tin chốt phương án đúng thường xuất hiện ngay sau các từ nối chuyển ý hoặc nhấn mạnh như 「実は」(thực ra), 「ポイントは」(điểm mấu chốt là), 「〜大切です」(quan trọng là), 「〜方がいい」(nên làm), 「やはり / やっぱり」(quả nhiên/rốt cuộc).`
    });
    recognitionGuides.push({
      title: '⏱️ Nắm bắt mốc thời gian & Trọng tâm hành động',
      content: `Đặc biệt lưu ý mốc thời gian, số lượng hoặc câu hỏi trọng tâm (ví dụ: làm gì trước tiên, điểm được chuyên gia khuyến nghị). Đối chiếu thẳng vào 4 phương án đã in trên đề.`
    });
  } else if (q.section === 'vocab') {
    recognitionGuides.push({
      title: '📚 Nhận diện âm On / Kun & Ngữ cảnh Collocation',
      content: `Kiểm tra kỹ các thành phần dễ nhầm trong chữ Hán: trường âm (ー, おう, う), âm ngắt (っ), âm đục (゛) và cụm từ đi kèm (Collocation) tự nhiên theo văn phong của người Nhật.`
    });
  } else {
    // Grammar
    recognitionGuides.push({
      title: '🧩 Hình thức liên kết & Sắc thái vế câu',
      content: `Quan sát dạng thức ngay trước chỗ trống (Thể từ điển, thể Ta, thể Te, Danh từ + の) và kiểm tra xem vế sau là đánh giá chủ quan, nguyện vọng, lời khuyên hay phủ định để chọn đúng mẫu ngữ pháp.`
    });
  }

  // 3. PHÂN TÍCH CHI TIẾT TỪNG PHƯƠNG ÁN & BẪY ĐỀ THI (TRAP BREAKDOWN)
  const trapBreakdown = (q.options || []).map((opt, optIdx) => {
    const isCorrect = optIdx === rightIdx;
    const optVi = q.optionsVi?.[optIdx];
    const cleanOpt = stripRuby(opt);

    let analysis = '';
    if (isCorrect) {
      analysis = `✅ Đáp án chính xác. Thể hiện chuẩn xác nội dung được khẳng định trong đề bài và dẫn chứng${optVi ? ` ("${optVi}")` : ''}.`;
    } else {
      if (/一切|絶対|のみ|だけ|常に|必ず|すべて|全員/.test(cleanOpt)) {
        const extremeWord = cleanOpt.match(/一切|絶対|のみ|だけ|常に|必ず|すべて|全員/)?.[0] || 'tuyệt đối';
        analysis = `❌ Bẫy từ mang tính tuyệt đối hóa ("${extremeWord}"). Trong JLPT, các phương án mang tính cực đoan/tuyệt đối đa phần là bẫy sai vì tác giả hiếm khi khẳng định tuyệt đối một chiều.`;
      } else if (/禁止|処罰|悪化|反対|失敗|できない|ない/.test(cleanOpt)) {
        analysis = `❌ Bẫy phủ định / đảo ngược ý nghĩa. Ý kiến này đi ngược lại với thông điệp tích cực hoặc nội dung được khẳng định trong bài.`;
      } else if (q.section === 'listening' && /直前|時間|すぐ|急に/.test(cleanOpt)) {
        analysis = `❌ Bẫy mâu thuẫn thời điểm hoặc mức độ. Thông tin này xuất hiện thoáng qua nhưng bị phủ định hoặc sai lệch về điều kiện thực hiện.`;
      } else {
        analysis = `❌ Phương án gây nhiễu (Distractor). Thông tin không có căn cứ xác thực trong bài hoặc không trả lời trực tiếp câu hỏi được đưa ra.`;
      }
    }

    return {
      optIdx,
      textJp: opt,
      textVi: optVi,
      isCorrect,
      analysis
    };
  });

  // 4. BÀI HỌC CỐT LÕI (CORE STUDY TAKEAWAY)
  const coreStudyTakeaway =
    lesson?.coreTakeaway ||
    q.studyTips ||
    (q.section === 'reading'
      ? 'Đọc câu hỏi trước để khoanh vùng đoạn văn có từ khóa, loại bỏ ngay các đáp án có từ tuyệt đối (一切, のみ, 必ず).'
      : q.section === 'listening'
      ? 'Tận dụng thời gian chuẩn bị để quan sát 4 phương án, lắng nghe kỹ nửa sau đoạn thoại và các từ phát tín hiệu kết luận.'
      : 'Ghi nhớ trọng điểm kiến thức và công thức nhận diện dạng bài để tránh bẫy phát âm và chia thì.');

  return {
    rightOptionJp,
    rightOptionVi,
    evidenceSection,
    recognitionGuides,
    trapBreakdown,
    coreStudyTakeaway,
    keyKnowledgeHtml: q.keyGrammarOrVocab || undefined
  };
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
  const selectionPopupRef = useRef<HTMLDivElement | null>(null);

  // Tự động đóng popup tra cứu eJOY khi click ra ngoài vùng popup
  useEffect(() => {
    if (!selectionPopup) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (selectionPopupRef.current && !selectionPopupRef.current.contains(e.target as Node)) {
        setSelectionPopup(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectionPopup]);
  
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
  // Quản lý các phiên thi (Exam Sessions) chuẩn JLPT (Từ vựng -> Nghỉ -> Ngữ pháp Đọc hiểu -> Nghỉ -> Nghe)
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState<boolean>(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState<number>(300); // 5 phút = 300 giây
  const [showSectionFinishConfirm, setShowSectionFinishConfirm] = useState<boolean>(false);
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
  const [resultFilter, setResultFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [resultSectionFilter, setResultSectionFilter] = useState<string>('all');
  const [showResultSidebar, setShowResultSidebar] = useState<boolean>(true);
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

  // Cấu hình các phiên thi (Exam Sessions) chuẩn JLPT
  const examSessions = useMemo(() => {
    if (!activeExam || !activeExam.questions) return [];
    return getExamSessions(activeExam.level, activeExam.format || selectedFormat, activeExam.questions);
  }, [activeExam, selectedFormat]);

  const currentSession = examSessions[currentSessionIndex] || examSessions[0] || {
    id: 'all',
    title: 'TẤT CẢ PHẦN THI',
    nextTitle: 'Kết quả bài thi',
    sections: ['vocab', 'grammar', 'reading', 'listening'] as ExamSectionType[],
    durationMinutes: 140
  };

  const nextSession = examSessions[currentSessionIndex + 1] || null;

  // Danh sách câu hỏi của session hiện tại (nếu thi exam) hoặc tất cả (nếu practice)
  const currentSessionQuestions = useMemo(() => {
    if (!activeExam?.questions) return [];
    if (examMode === 'practice') return activeExam.questions;
    const filtered = activeExam.questions.filter((q: ExamQuestionItem) => currentSession.sections.includes(q.section));
    return filtered.length > 0 ? filtered : activeExam.questions;
  }, [activeExam?.questions, currentSession, examMode]);

  const answeredSessionCount = useMemo(() => {
    return currentSessionQuestions.filter((q: ExamQuestionItem) => userAnswers[q.id] !== undefined).length;
  }, [currentSessionQuestions, userAnswers]);

  const unansweredSessionCount = useMemo(() => {
    return Math.max(0, currentSessionQuestions.length - answeredSessionCount);
  }, [currentSessionQuestions.length, answeredSessionCount]);

  // State Nghe lại Audio & Xem Script trong màn hình Kết quả
  const [reviewAudioPlayingId, setReviewAudioPlayingId] = useState<string | null>(null);
  const [reviewExpandedScriptId, setReviewExpandedScriptId] = useState<string | null>(null);
  const [reviewExpandedReadingViId, setReviewExpandedReadingViId] = useState<string | null>(null);
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
    setSelectionPopup(null);
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
            if (examMode === 'exam' && examSessions.length > 0 && currentSessionIndex < examSessions.length - 1) {
              setIsTimerRunning(false);
              setIsBreakModalOpen(true);
              setBreakTimeRemaining(300);
              return 0;
            } else {
              handleForceSubmit();
              return 0;
            }
          }
          return prev - 1;
        });
        setQuestionTimeSpentSeconds((prev: any) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentScreen, isTimerRunning, timeRemainingSeconds, examMode, examSessions, currentSessionIndex]);

  // Bộ đếm thời gian nghỉ giải lao giữa các phiên thi (Image 10)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isBreakModalOpen && breakTimeRemaining > 0) {
      timer = setInterval(() => {
        setBreakTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer!);
            handleSkipBreak();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBreakModalOpen, breakTimeRemaining, currentSessionIndex, examSessions]);

  const handleSkipBreak = () => {
    setIsBreakModalOpen(false);
    if (currentSessionIndex < examSessions.length - 1) {
      const nextIdx = currentSessionIndex + 1;
      setCurrentSessionIndex(nextIdx);
      const nextSess = examSessions[nextIdx];
      setTimeRemainingSeconds(nextSess ? nextSess.durationMinutes * 60 : 2400);
      setIsTimerRunning(true);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      handleForceSubmit();
    }
  };

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
    setCurrentSessionIndex(0);
    setIsBreakModalOpen(false);
    setBreakTimeRemaining(300);

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
    setCurrentSessionIndex(0);
    setIsBreakModalOpen(false);
    setBreakTimeRemaining(300);
    const sessions = getExamSessions(activeExam.level, activeExam.format || selectedFormat, activeExam.questions || []);
    const initialSession = sessions[0];
    const minutes = initialSession ? initialSession.durationMinutes : (
      activeExam.format === 'express'
        ? (activeExam.expressDurationMinutes || activeExam.durationMinutes || 50)
        : (activeExam.fullDurationMinutes || activeExam.durationMinutes || 155)
    );
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
    setSelectionPopup(null);
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
  const handleTextMouseUp = async (e?: React.MouseEvent) => {
    if (typeof window === 'undefined') return;

    // 1. Nếu click vào button, input, controls, navigation hoặc phần tử select-none -> bỏ qua ngay
    const target = e?.target as HTMLElement | null;
    if (target?.closest('button, input, select, textarea, .no-lookup, .select-none, [role="button"]')) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    // 2. Tắt tính năng tra cứu từ bôi đen trong chế độ thi thật
    if (examMode === 'exam') return;
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 1 || selectedText.length > 250) {
      return;
    }

    // 3. CHỈ tra cứu nếu đoạn bôi đen THỰC SỰ CHỨA KÝ TỰ TIẾNG NHẬT (Kanji, Hiragana, Katakana)
    // Loại trừ hoàn toàn text tiếng Việt ("Câu tiếp", "Câu trước", "Hôm nay tôi..."), tiếng Anh, số, dấu câu
    const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(selectedText);
    if (!hasJapanese) {
      return;
    }

    // 4. Loại trừ các chuỗi nhãn hệ thống hoặc định dạng đề thi
    if (/^(câu|đáp án|phương án|mondai|bài|\d+)/i.test(selectedText)) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

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
    // Replace markdown bold WITHOUT padding so furigana aligns, with clean underline for target word
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-950 font-bold underline decoration-indigo-600 decoration-2 underline-offset-4">$1</strong>');
    
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

  // Helper trích xuất cấu trúc ngữ pháp chuẩn thay vì lặp lại nguyên câu đề bài
  const extractCleanStructureForNotebook = (q: any): string | undefined => {
    if (q.section !== 'grammar' && q.section !== 'vocab') return undefined;
    const quoted = (q.explanation || '').match(/「([^」]+)」/g);
    const correctOpt = Array.isArray(q.options) ? q.options[q.correctAnswer] : '';
    const correctOptVi = Array.isArray(q.optionsVi) ? q.optionsVi[q.correctAnswer] : '';
    if (quoted && quoted.length > 0) {
      return `${quoted.join(' • ')}${correctOptVi ? ` — ${correctOptVi}` : ''}`;
    }
    if (correctOpt) {
      return `「${correctOpt}」${correctOptVi ? ` — ${correctOptVi}` : ''}`;
    }
    return undefined;
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
        const shortExamTitle = (examResult.examTitle || `Đề thi ${examResult.level}`).replace(/^Đề thi chính thức\s*/i, '').trim();
        
        const metaStr = q.options && q.options.length > 0 ? `\n<!-- META: ${JSON.stringify({
          questionId: q.questionId,
          examId: examResult.examId,
          examTitle: shortExamTitle,
          orderNumber: q.orderNumber,
          question: q.question,
          passage: q.passage || null,
          options: q.options,
          optionsVi: (q as any).optionsVi || [],
          correctIndex: q.correctAnswer,
          userAnswer: q.userAnswer,
          explanation: q.explanation,
          section: q.section,
          subTypeLabel: q.subTypeLabel,
          aiDetailed: aiExplanations[q.questionId] || undefined
        })} -->` : '';

        await NotebookApi.createItem({
          itemType: itemType as any,
          title: `[${shortExamTitle}] Câu ${q.orderNumber}: ${q.subTypeLabel || 'Câu làm sai'}`,
          reading: q.subTypeLabel,
          meaningVi: `[${shortExamTitle}] ${q.questionVi || q.question}`,
          level: examResult.level,
          structure: extractCleanStructureForNotebook(q),
          exampleJp: q.passage ? `${q.passage}\n\n${q.question}` : q.question,
          exampleVi: q.passageVi ? `${q.passageVi}\n\n${q.questionVi}` : q.questionVi,
          note: [
            q.explanation ? `Giải thích đáp án & Bẫy thi: ${stripRuby(q.explanation)}` : '',
            q.keyGrammarOrVocab ? `Trọng tâm: ${stripRuby(q.keyGrammarOrVocab)}` : '',
            q.studyTips ? `Mẹo phòng thi: ${stripRuby(q.studyTips)}` : '',
            metaStr
          ].filter(Boolean).join('\n'),
          tags: `JLPT_${examResult.level},Thi_thử,Câu_sai,${shortExamTitle}`,
          masteryStatus: 'LEARNING'
        });
        successCount++;
        setSavedSingleNotebookIds((prev) => ({ ...prev, [q.questionId]: true }));
      } catch (err) {
        console.warn('Lỗi lưu mục sổ tay:', err);
      }
    }

    setIsSavingToNotebook(false);
    setSavedNotebookMessage(`Đã lưu thành công ${successCount}/${wrongQuestions.length} câu làm sai và cấu trúc ngữ pháp vào Sổ tay Cá nhân! Bạn có thể chuyển sang tab Sổ tay để ôn luyện Flashcard SRS bất kỳ lúc nào.`);
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
      const shortExamTitle = (examResult.examTitle || `Đề thi ${examResult.level}`).replace(/^Đề thi chính thức\s*/i, '').trim();

      const metaStr = q.options && q.options.length > 0 ? `\n<!-- META: ${JSON.stringify({
        questionId: q.questionId,
        examId: examResult.examId,
        examTitle: shortExamTitle,
        orderNumber: q.orderNumber,
        question: q.question,
        passage: q.passage || null,
        options: q.options,
        optionsVi: (q as any).optionsVi || [],
        correctIndex: q.correctAnswer,
        userAnswer: q.userAnswer,
        explanation: q.explanation,
        section: q.section,
        subTypeLabel: q.subTypeLabel,
        aiDetailed: aiExplanations[q.questionId] || undefined
      })} -->` : '';

      await NotebookApi.createItem({
        itemType: itemType as any,
        title: `[${shortExamTitle}] Câu ${q.orderNumber}: ${q.subTypeLabel || 'Câu làm sai'}`,
        reading: q.subTypeLabel,
        meaningVi: `[${shortExamTitle}] ${q.questionVi || q.question}`,
        level: examResult.level,
        structure: extractCleanStructureForNotebook(q),
        exampleJp: q.passage ? `${q.passage}\n\n${q.question}` : q.question,
        exampleVi: q.passageVi ? `${q.passageVi}\n\n${q.questionVi}` : q.questionVi,
        note: [
          q.explanation ? `Giải thích đáp án & Bẫy thi: ${stripRuby(q.explanation)}` : '',
          q.keyGrammarOrVocab ? `Trọng tâm: ${stripRuby(q.keyGrammarOrVocab)}` : '',
          q.studyTips ? `Mẹo phòng thi: ${stripRuby(q.studyTips)}` : '',
          metaStr
        ].filter(Boolean).join('\n'),
        tags: `JLPT_${examResult.level},Thi_thử,Câu_sai,${shortExamTitle}`,
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
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStudioTab === 'full_exam'
                    ? 'bg-white text-indigo-900 shadow-md font-black'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur-xs'
                }`}
              >
                <span>Thi Thử Trọn Bộ (Full Exam - 180đ)</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('skill_practice')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStudioTab === 'skill_practice'
                    ? 'bg-white text-indigo-900 shadow-md font-black'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur-xs'
                }`}
              >
                <span>Luyện Đề Theo Chuyên Đề</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('mistake_bank')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStudioTab === 'mistake_bank'
                    ? 'bg-white text-indigo-900 shadow-md font-black'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/25 backdrop-blur-xs'
                }`}
              >
                <span>Ngân Hàng Câu Sai & SRS</span>
                {mistakeItems.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
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
                  <RotateCcw className="w-3.5 h-3.5" />
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
                  <Play className="w-4 h-4 text-indigo-600" />
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
                  <h3 className="text-lg font-black text-slate-900">
                    Ngân Hàng Câu Hỏi Làm Sai & Ôn Tập Ngắt Quãng SRS
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
                    <span>Làm mới</span>
                  </button>

                  <button
                    onClick={handleStartMistakePractice}
                    disabled={filteredMistakes.length === 0}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Luyện Lại Các Câu Sai ({filteredMistakes.length})</span>
                  </button>
                </div>
              </div>

              {/* 3 Thẻ chỉ số SRS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                  <span className="text-xs font-bold text-rose-900 block">Tổng số câu sai lưu trữ</span>
                  <span className="text-2xl font-black text-rose-700">{mistakeItems.length}</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <span className="text-xs font-bold text-amber-900 block">Đang ôn tập ngắt quãng (SRS)</span>
                  <span className="text-2xl font-black text-amber-700">
                    {mistakeItems.filter((i) => i.masteryStatus !== 'MASTERED').length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                  <span className="text-xs font-bold text-emerald-900 block">Đã thành thạo (Mastered)</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {mistakeItems.filter((i) => i.masteryStatus === 'MASTERED').length}
                  </span>
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
                <h3 className="font-black text-slate-800 text-base">Chưa có câu làm sai nào trong Ngân hàng</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Khi bạn tham gia thi thử hoặc luyện đề, các câu bạn làm sai sẽ tự động được lưu trữ vào lộ trình ôn ngắt quãng SRS!
                </p>
                <button
                  onClick={() => setActiveStudioTab('full_exam')}
                  className="mt-2 inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 cursor-pointer"
                >
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
                          className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-100 transition-all cursor-pointer"
                        >
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
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Chọn 1 Trong 2 Phương Án Thi:
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
                        <span className="text-xs font-black text-indigo-800">
                          Phương Án 1: Tinh Gọn
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
                        <span className="text-xs font-black text-emerald-800">
                          Phương Án 2: Thi Thật
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
  // ========================================================
  // MÀN HÌNH 2: PHÒNG THI CHUẨN JLPT THEO PHIÊN & GIẢI LAO (IMAGES 9 & 10)
  // ========================================================
  if (currentScreen === 'taking' && activeExam) {
    const isUrgent = timeRemainingSeconds < 300 && examMode === 'exam';

    // Nhóm các câu hỏi trong phiên hiện tại theo từng Mondai
    const sessionMondaiGroups: {
      key: string;
      label: string;
      instruction: string;
      questions: ExamQuestionItem[];
    }[] = [];

    let currentGroupKey = '';
    let currentGroupList: ExamQuestionItem[] = [];

    currentSessionQuestions.forEach((q: ExamQuestionItem) => {
      const key = q.subTypeLabel || q.subType || q.section;
      if (key !== currentGroupKey) {
        if (currentGroupList.length > 0) {
          const first = currentGroupList[0];
          sessionMondaiGroups.push({
            key: currentGroupKey,
            label: first.subTypeLabel || currentGroupKey,
            instruction: getMondaiInstruction(first.subType, first.subTypeLabel),
            questions: currentGroupList
          });
        }
        currentGroupKey = key;
        currentGroupList = [q];
      } else {
        currentGroupList.push(q);
      }
    });

    if (currentGroupList.length > 0) {
      const first = currentGroupList[0];
      sessionMondaiGroups.push({
        key: currentGroupKey,
        label: first.subTypeLabel || currentGroupKey,
        instruction: getMondaiInstruction(first.subType, first.subTypeLabel),
        questions: currentGroupList
      });
    }

    return (
      <div 
        className={`min-h-screen bg-[#F8FAFC] pb-24 animate-fadeIn ${!showFurigana ? 'hide-furigana' : ''} ${examMode === 'exam' ? 'disable-selection' : ''}`}
        onCopy={(e) => { if (examMode === 'exam') e.preventDefault(); }}
        onContextMenu={(e) => { if (examMode === 'exam') e.preventDefault(); }}
      >
        <CanvasOverlay enabled={isDrawingMode} onClose={() => setIsDrawingMode(false)} />
        <style>{`
          ${examMode === 'exam' ? '#global-top-header { display: none !important; }' : ''}
          .hide-furigana rt {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          .disable-selection {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        `}</style>

        {/* TOP BAR PHÒNG THI (IMAGE 9) */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            {/* Left: Nút quay lại */}
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Quay lại danh sách đề thi"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Center: Nút NỘP BÀI (Image 9) */}
            <button
              type="button"
              onClick={() => setShowSectionFinishConfirm(true)}
              className="px-8 py-2 rounded-xl text-xs font-black text-white bg-[#4F46E5] hover:bg-[#4338CA] active:scale-95 transition-all shadow-md shadow-indigo-100 cursor-pointer tracking-wider font-sans"
            >
              NỘP BÀI
            </button>

            {/* Right: Đồng hồ, Bút vẽ, Furigana, Tiến độ (Image 9) */}
            <div className="flex items-center gap-3 sm:gap-4 font-sans">
              {/* Đồng hồ đếm ngược */}
              {examMode === 'exam' ? (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors ${
                    isUrgent
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatTime(timeRemainingSeconds)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Luyện tự do</span>
                </div>
              )}

              {/* Bút vẽ */}
              <button
                type="button"
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDrawingMode
                    ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Pen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">BÚT VẼ</span>
              </button>

              {/* Furigana toggle */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowFurigana(!showFurigana)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors cursor-pointer ${
                    showFurigana ? 'bg-[#4F46E5]' : 'bg-slate-300'
                  }`}
                  title="Bật/Tắt Furigana"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      showFurigana ? 'translate-x-4.5 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">FURIGANA</span>
              </div>

              {/* Tiến độ toggle */}
              <button
                type="button"
                onClick={() => setShowProgressSidebar(!showProgressSidebar)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showProgressSidebar
                    ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
                title="Hiện/Ẩn bảng tiến độ câu hỏi"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TIẾN ĐỘ</span>
              </button>
            </div>
          </div>
        </header>

        {/* KHU VỰC LÀM BÀI CHÍNH */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          {/* Header Banner Phân môn (Image 9) */}
          <div className="bg-[#F1F5F9] border border-slate-200/80 rounded-2xl p-6 text-center mb-8 shadow-xs">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-wide mb-2 uppercase font-sans">
              {activeExam.title} • {currentSession.title}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                {activeExam.level}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-200/90 text-slate-700">
                {currentSessionQuestions.length} câu
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Cột trái: Danh sách câu hỏi theo phiên (Image 9) */}
            <div className="flex-1 w-full min-w-0 space-y-6">
              {sessionMondaiGroups.map((group, gIdx) => {
                return (
                  <div key={group.key || gIdx} className="space-y-4">
                    {/* Hướng dẫn Mondai chuẩn JLPT (Image 9) */}
                    <div className="pt-2 pb-1">
                      <div className="text-sm md:text-base font-bold text-slate-800 font-japanese leading-relaxed">
                        <span className="text-slate-900 mr-2 font-black">
                          {group.label.includes('Mondai') || group.label.includes('問題')
                            ? group.label.split(':')[0]
                            : `問題${gIdx + 1}`}
                        </span>
                        <span>{group.instruction}</span>
                      </div>
                    </div>

                    {/* Danh sách câu hỏi trong Mondai */}
                    {group.questions.map((q, qSubIdx) => {
                      const isAnswered = userAnswers[q.id] !== undefined;
                      const globalOrSessionNum = q.orderNumber || (qSubIdx + 1);

                      return (
                        <div
                          key={q.id}
                          id={`question-card-${q.id}`}
                          className={`bg-white rounded-2xl border transition-all p-5 md:p-6 shadow-xs ${
                            isAnswered ? 'border-slate-300' : 'border-slate-200/80'
                          }`}
                        >
                          {/* ĐOẠN VĂN ĐỌC HIỂU NẾU CÓ */}
                          {q.passage && (
                            <div className="p-4 md:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 mb-5 font-japanese text-sm md:text-base leading-relaxed text-slate-900 whitespace-pre-line">
                              {q.imageUrl && (
                                <img
                                  src={q.imageUrl}
                                  alt="Bài đọc Dokkai"
                                  className="max-h-56 mx-auto rounded-xl border border-amber-200 mb-3 object-contain"
                                />
                              )}
                              <div dangerouslySetInnerHTML={{ __html: renderPassageWithHighlight(q.passage, q.orderNumber) }} />
                            </div>
                          )}

                          {/* TRÌNH PHÁT AUDIO CHO CHOUKAI NẾU CÓ */}
                          {q.section === 'listening' && q.audioUrl && (
                            <div className="p-4 rounded-xl bg-slate-900 text-white mb-4 flex items-center justify-between gap-4 font-sans">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/40 flex items-center justify-center text-indigo-300">
                                  <Headphones className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-200">Âm thanh nghe hiểu Choukai</div>
                                  <div className="text-[11px] text-slate-400">Câu hỏi số {globalOrSessionNum}</div>
                                </div>
                              </div>
                              <audio
                                controls
                                src={resolveAudioUrl(q.audioUrl)}
                                className="h-9 w-64 max-w-full"
                              />
                            </div>
                          )}

                          {/* DÒNG CÂU HỎI (IMAGE 9) */}
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {globalOrSessionNum}
                            </span>
                            <div
                              className="text-base md:text-lg font-japanese text-slate-900 leading-relaxed font-japanese flex-1"
                              dangerouslySetInnerHTML={{ __html: renderQuestionText(cleanQuestionText(q.question, q.orderNumber)) }}
                            />
                          </div>

                          {/* 4 ĐÁP ÁN XẾP LƯỚI 2x2 (IMAGE 9) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 ml-0 sm:ml-10">
                            {q.options.map((option, optIdx) => {
                              const isSelected = userAnswers[q.id] === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => {
                                    setUserAnswers((prev: any) => ({ ...prev, [q.id]: optIdx }));
                                  }}
                                  className={`p-3.5 rounded-xl border text-left text-sm font-japanese transition-all flex items-center gap-3 cursor-pointer ${
                                    isSelected
                                      ? 'border-2 border-[#4F46E5] bg-indigo-50/50 text-[#4F46E5] font-bold shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                                  }`}
                                >
                                  <span className={`text-xs font-bold ${isSelected ? 'text-[#4F46E5]' : 'text-slate-400'}`}>
                                    {optIdx + 1}
                                  </span>
                                  <span
                                    className="flex-1 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: renderQuestionText(option) }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Cột phải: NGĂN KÉO TIẾN ĐỘ (IMAGE 9) */}
            {showProgressSidebar && (
              <aside className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20 font-sans">
                {/* Header Tiến độ & Nút ĐÓNG */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="font-bold text-slate-800 text-sm">Tiến độ</span>
                  <button
                    type="button"
                    onClick={() => setShowProgressSidebar(false)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    ĐÓNG
                  </button>
                </div>

                {/* Tên phân môn phiên hiện tại */}
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {currentSession.title}
                </div>

                {/* Lưới 5 cột các câu hỏi (Image 9) */}
                <div className="grid grid-cols-5 gap-2 mb-6 max-h-[60vh] overflow-y-auto pr-1">
                  {currentSessionQuestions.map((sq, idx) => {
                    const isAnswered = userAnswers[sq.id] !== undefined;
                    return (
                      <button
                        key={sq.id}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`question-card-${sq.id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isAnswered
                            ? 'bg-[#4F46E5] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Footer đếm câu đã làm / chưa làm (Image 9) */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs font-medium text-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-sm bg-[#4F46E5]" />
                      <span>Đã trả lời</span>
                    </div>
                    <span className="font-bold text-slate-800">{answeredSessionCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-sm bg-white border border-slate-300" />
                      <span>Chưa trả lời</span>
                    </div>
                    <span className="font-bold text-slate-800">{unansweredSessionCount}</span>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </main>

        {/* MODAL GIẢI LAO CHUẨN JLPT (IMAGE 10) */}
        {isBreakModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full mx-auto text-center shadow-2xl space-y-5 border border-slate-100 animate-scaleUp">
              {/* Ly cà phê icon */}
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                <Coffee className="w-9 h-9 text-blue-500" />
              </div>

              {/* Tiêu đề */}
              <h3 className="text-2xl font-bold text-slate-800">Giải lao</h3>

              {/* Phụ đề */}
              <p className="text-sm text-slate-600 leading-relaxed">
                Nghỉ một chút trước khi sang <span className="font-bold text-slate-900">{nextSession?.title || 'phần tiếp theo'}</span>.
              </p>

              {/* Đồng hồ to đếm ngược */}
              <div className="text-5xl font-black tracking-wider text-slate-900 font-mono py-2">
                {Math.floor(breakTimeRemaining / 60).toString().padStart(2, '0')}:{(breakTimeRemaining % 60).toString().padStart(2, '0')}
              </div>

              {/* Nút BỎ QUA */}
              <button
                type="button"
                onClick={handleSkipBreak}
                className="w-full py-4 rounded-2xl font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-lg shadow-indigo-100 transition-all active:scale-98 cursor-pointer text-base"
              >
                BỎ QUA
              </button>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN KHI BẤM NỘP BÀI TRONG PHÒNG THI */}
        {showSectionFinishConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full mx-auto shadow-2xl space-y-5 border border-slate-100 animate-scaleUp">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-800">
                  {nextSession ? `Hoàn thành ${currentSession.title}?` : 'Nộp bài thi JLPT?'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {nextSession ? (
                    <>
                      Bạn đã hoàn thành <span className="font-bold text-indigo-600">{answeredSessionCount}/{currentSessionQuestions.length}</span> câu của phần này. Bạn có muốn kết thúc phần thi để chuyển sang thời gian <span className="font-bold text-slate-900">Giải lao</span> không?
                    </>
                  ) : (
                    <>
                      Bạn đã hoàn thành tất cả các phần thi của kỳ thi JLPT. Bạn có muốn nộp bài ngay để hệ thống chấm điểm và xuất báo cáo kết quả chi tiết không?
                    </>
                  )}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSectionFinishConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Tiếp tục làm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionFinishConfirm(false);
                    if (nextSession) {
                      setIsTimerRunning(false);
                      setIsBreakModalOpen(true);
                      setBreakTimeRemaining(300);
                    } else {
                      handleForceSubmit();
                    }
                  }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-md shadow-indigo-100 transition-all cursor-pointer"
                >
                  {nextSession ? 'Nộp & Nghỉ giải lao' : 'Nộp bài chấm điểm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN THOÁT PHÒNG THI */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn font-sans">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100 animate-scaleUp">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Thoát phòng thi?</h3>
                <p className="text-xs text-slate-500 mt-1">Kết quả bài làm hiện tại sẽ không được lưu nếu bạn thoát bây giờ.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setCurrentScreen('catalog');
                  }}
                  className="py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Thoát
                </button>
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="py-2.5 rounded-xl text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all cursor-pointer shadow-md"
                >
                  Làm tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // MÀN HÌNH 3: BÁO CÁO KẾT QUẢ & CHẤM ĐÚNG SAI TINH GỌN (CHUẨN MINH HỌA)
  // ========================================================
  if (currentScreen === 'result' && examResult) {
    const isPassed = examResult.isPassed;
    const wrongCount = examResult.questionResults.filter((q) => !q.isCorrect).length;
    const correctCount = examResult.questionResults.filter((q) => q.isCorrect).length;
    const totalCount = examResult.questionResults.length;

    // Filter question list
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

    // 3 Section summary for the score card (Image 1)
    const langQuestions = examResult.questionResults.filter(q => q.section === 'vocab' || q.section === 'grammar');
    const readingQuestions = examResult.questionResults.filter(q => q.section === 'reading');
    const listeningQuestions = examResult.questionResults.filter(q => q.section === 'listening');

    const langCorrect = langQuestions.filter(q => q.isCorrect).length;
    const readingCorrect = readingQuestions.filter(q => q.isCorrect).length;
    const listeningCorrect = listeningQuestions.filter(q => q.isCorrect).length;

    const vocabFound = examResult.sectionResults?.find(s => s.section === 'vocab');
    const grammarFound = examResult.sectionResults?.find(s => s.section === 'grammar');
    const readingFound = examResult.sectionResults?.find(s => s.section === 'reading');
    const listeningFound = examResult.sectionResults?.find(s => s.section === 'listening');

    const langScore = (vocabFound && grammarFound)
      ? Math.min(60, Math.round(((vocabFound.score + grammarFound.score) / 120) * 60))
      : vocabFound?.score || grammarFound?.score || (langQuestions.length > 0 ? Math.round((langCorrect / langQuestions.length) * 60) : 0);

    const readingScore = readingFound?.score ?? (readingQuestions.length > 0 ? Math.round((readingCorrect / readingQuestions.length) * 60) : 0);
    const listeningScore = listeningFound?.score ?? (listeningQuestions.length > 0 ? Math.round((listeningCorrect / listeningQuestions.length) * 60) : 0);

    const totalMinutesSpent = Math.floor(examResult.timeSpentSeconds / 60);
    const totalSecondsSpent = examResult.timeSpentSeconds % 60;
    const totalAllowedMinutes = activeExam?.timeLimitMinutes || (examResult.level === 'N1' ? 170 : examResult.level === 'N2' ? 155 : examResult.level === 'N3' ? 140 : 115);

    // Sidebar groupings (Image 2, 3)
    const sidebarSections: { title: string; questions: QuestionResultItem[] }[] = [];
    const vocabOnly = examResult.questionResults.filter(q => q.section === 'vocab');
    const grammarOnly = examResult.questionResults.filter(q => q.section === 'grammar');
    const readingOnly = examResult.questionResults.filter(q => q.section === 'reading');
    const listeningOnly = examResult.questionResults.filter(q => q.section === 'listening');

    if (vocabOnly.length > 0) sidebarSections.push({ title: 'KANJI • TỪ VỰNG', questions: vocabOnly });
    if (grammarOnly.length > 0 || readingOnly.length > 0) {
      sidebarSections.push({ title: 'NGỮ PHÁP • ĐỌC HIỂU', questions: [...grammarOnly, ...readingOnly] });
    }
    if (listeningOnly.length > 0) {
      sidebarSections.push({ title: 'NGHE HIỂU', questions: listeningOnly });
    }
    if (sidebarSections.length === 0) {
      sidebarSections.push({ title: 'TIẾN ĐỘ BÀI THI', questions: examResult.questionResults });
    }

    // Circular gauge calculations (Image 1)
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(180, Math.max(0, examResult.totalScore)) / 180) * circumference;
    const gaugeColor = isPassed ? '#10B981' : '#EF4444';

    // Helper render listening script with translation under each turn (Image 9)
    const renderListeningScriptWithVi = (passage: string, passageVi?: string) => {
      const jpLines = passage.split('\n').map(l => l.trim()).filter(Boolean);
      const viLines = (passageVi || '').split('\n').map(l => l.trim()).filter(Boolean);

      return (
        <div className="space-y-3 font-japanese leading-relaxed">
          {jpLines.map((line, idx) => {
            const viLine = viLines[idx] || '';
            return (
              <div key={idx} className="space-y-0.5">
                <div 
                  className="text-slate-900 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: line }}
                />
                {viLine && (
                  <p className="text-blue-600 font-medium text-xs font-sans leading-relaxed">
                    {viLine}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    // Helper render clean friendly explanation (Image 2, 3, 4, 6, 8)
    const renderCleanFriendlyExplanation = (q: QuestionResultItem) => {
      const cleanVi = cleanQuestionVi(q.questionVi, q.orderNumber);

      // 1. Reading question (Image 6, 8)
      if (q.section === 'reading') {
        const exp = q.explanation || '';
        return (
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/70 text-xs font-sans space-y-2">
            <div className="font-black text-blue-600 tracking-wider text-xs uppercase">
              GIẢI THÍCH:
            </div>
            {cleanVi && (
              <p className="font-bold text-slate-800">
                Dịch câu hỏi: {cleanVi}
              </p>
            )}
            {/* Nếu explanation có cấu trúc 1. ... 2. ... (Image 6, 8) */}
            {/\d\.\s/.test(exp) ? (
              <div className="space-y-2 pt-1 text-slate-700 leading-relaxed">
                {exp.split('\n').map((line, lIdx) => {
                  const isRightLine = /Đúng\.|Chính xác\./i.test(line);
                  const isWrongLine = /Sai\./i.test(line);
                  const isNumHeader = /^\d\.\s/.test(line);
                  return (
                    <p
                      key={lIdx}
                      className={
                        isNumHeader
                          ? 'font-bold text-slate-800 mt-1'
                          : isRightLine
                          ? 'text-emerald-700 font-medium pl-2'
                          : isWrongLine
                          ? 'text-rose-600 pl-2'
                          : 'text-slate-600'
                      }
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : q.optionsVi && q.optionsVi.length > 0 ? (
              <div className="space-y-2 pt-1 text-slate-700 leading-relaxed">
                {q.options.map((opt, optIdx) => {
                  const isRight = optIdx === q.correctAnswer;
                  const optVi = q.optionsVi?.[optIdx] || stripRuby(opt);
                  return (
                    <div key={optIdx} className="space-y-0.5">
                      <p className="font-bold text-slate-800">{optIdx + 1}. {optVi}</p>
                      <p className={isRight ? 'text-emerald-700 font-medium pl-2' : 'text-rose-600 pl-2'}>
                        {isRight ? 'Đúng.' : 'Sai.'}
                      </p>
                    </div>
                  );
                })}
                {exp && <p className="text-slate-600 pt-2 border-t border-blue-100/60">{exp}</p>}
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                {exp || 'Tham khảo câu dẫn chứng trực tiếp trong bài đọc.'}
              </p>
            )}
          </div>
        );
      }

      // 2. Grammar question (Image 4)
      if (q.section === 'grammar') {
        const rightOpt = stripRuby(q.options[q.correctAnswer] || '');
        const rightVi = q.optionsVi?.[q.correctAnswer] || '';
        let grammarTitle = '';
        if (q.keyGrammarOrVocab) {
          grammarTitle = q.keyGrammarOrVocab
            .replace(/^Mẫu ngữ pháp trọng tâm:\s*/i, '')
            .replace(/^Cấu trúc cốt lõi.*?:\s*/i, '')
            .replace(/— Nghĩa:\s*/i, ' ')
            .replace(/Đối chiếu[\s\S]*$/, '')
            .replace(/Phân biệt[\s\S]*$/, '')
            .replace(/Các mảnh ghép[\s\S]*$/, '')
            .trim();
        } else {
          grammarTitle = `${rightOpt} ${rightVi}`.trim();
        }

        return (
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/70 text-xs font-sans space-y-2">
            <div className="font-black text-blue-600 tracking-wider text-xs uppercase">
              GIẢI THÍCH:
            </div>
            {grammarTitle && (
              <p className="font-bold text-blue-800 text-sm">
                {grammarTitle}
              </p>
            )}
            {cleanVi && (
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Dịch:</span>
                <p className="text-slate-700 leading-relaxed">{cleanVi}</p>
              </div>
            )}
            {q.explanation && !q.explanation.includes('Hội đồng') && !q.explanation.includes('Chiến thuật') && (
              <p className="text-slate-600 leading-relaxed pt-1 border-t border-blue-100/50">
                {q.explanation}
              </p>
            )}
          </div>
        );
      }

      // 3. Vocab / Kanji question (Image 2, 3)
      if (q.section === 'vocab') {
        const rightOpt = stripRuby(q.options[q.correctAnswer] || '');
        const rightVi = q.optionsVi?.[q.correctAnswer] || '';
        const boldMatch = (q.question || '').match(/\*\*(.*?)\*\*/);
        const kanjiWord = boldMatch ? stripRuby(boldMatch[1]) : '';

        let vocabTitle = '';
        if (kanjiWord && rightOpt && kanjiWord !== rightOpt) {
          vocabTitle = `${kanjiWord} (${rightOpt}): ${rightVi}`;
        } else if (q.keyGrammarOrVocab) {
          vocabTitle = q.keyGrammarOrVocab
            .replace(/^Từ khóa trọng tâm:\s*/i, '')
            .replace(/— Nghĩa:\s*/i, ': ')
            .replace(/Đối chiếu[\s\S]*$/, '')
            .trim();
        } else {
          vocabTitle = rightVi ? `${rightOpt}: ${rightVi}` : rightOpt;
        }

        return (
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/70 text-xs font-sans space-y-2">
            <div className="font-black text-blue-600 tracking-wider text-xs uppercase">
              GIẢI THÍCH:
            </div>
            {vocabTitle && (
              <p className="font-bold text-blue-800 text-sm">
                {vocabTitle}
              </p>
            )}
            {cleanVi && (
              <p className="text-slate-700 leading-relaxed font-normal">
                {cleanVi}
              </p>
            )}
          </div>
        );
      }

      // 4. Listening or other question (Image 9, 10)
      return (
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/70 text-xs font-sans space-y-1.5">
          <div className="font-black text-blue-600 tracking-wider text-xs uppercase">
            GIẢI THÍCH:
          </div>
          {cleanVi && (
            <p className="font-bold text-slate-800">
              Dịch câu hỏi: {cleanVi}
            </p>
          )}
          {q.explanation && (
            <p className="text-slate-700 leading-relaxed">
              {q.explanation}
            </p>
          )}
        </div>
      );
    };

    return (
      <div className={`min-h-screen bg-[#F8FAFC] pb-24 font-japanese ${!showFurigana ? 'hide-furigana' : ''}`}>
        {/* TOP ACTION & TOGGLE BAR (Image 1, 2) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Back button */}
            <button
              onClick={() => setCurrentScreen('catalog')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-all font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Danh sách đề thi</span>
            </button>

            {/* Center: LÀM LẠI Button (Image 1) */}
            {activeExam && (
              <button
                onClick={() => handleStartExam(activeExam, 'practice')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 transition-all cursor-pointer shadow-xs flex items-center gap-2 active:scale-95 font-sans"
              >
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>LÀM LẠI</span>
              </button>
            )}

            {/* Right: Furigana, Dịch, Grid buttons (Image 1) */}
            <div className="flex items-center gap-3 sm:gap-4 font-sans">
              {/* Furigana toggle */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowFurigana(!showFurigana)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors cursor-pointer ${
                    showFurigana ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  title="Bật/Tắt Furigana"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      showFurigana ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 tracking-wider">
                  FURIGANA
                </span>
              </div>

              {/* Dịch toggle */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowTranslations(!showTranslations)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors cursor-pointer ${
                    showTranslations ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  title="Bật/Tắt dịch tiếng Việt"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      showTranslations ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 tracking-wider">
                  DỊCH
                </span>
              </div>

              {/* Grid toggle sidebar button */}
              <button
                type="button"
                onClick={() => setShowResultSidebar(!showResultSidebar)}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                  showResultSidebar
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Bật/Tắt bảng tiến độ"
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 1 & 2: THẺ KẾT QUẢ TỔNG QUAN & ĐIỂM TỪNG PHẦN (Image 1) */}
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-6 space-y-6">
          {/* 1. THẺ KẾT QUẢ TỔNG QUAN */}
          <div className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 text-center shadow-xs space-y-4">
            {/* Circular Gauge */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke="#F1F5F9"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke={gaugeColor}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className={`absolute text-3xl font-black ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                {examResult.totalScore}
              </span>
            </div>

            {/* TRƯỢT / ĐỖ */}
            <div className="space-y-1">
              <h2 className={`text-2xl sm:text-3xl font-black tracking-wider uppercase ${
                isPassed ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isPassed ? 'ĐỖ' : 'TRƯỢT'}
              </h2>
              <p className="text-xl font-black text-slate-800">
                {examResult.totalScore}/180 ĐIỂM
              </p>
            </div>

            {/* Đúng & Sai Badges */}
            <div className="flex items-center justify-center gap-3 font-sans">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span>✓</span>
                <span>Đúng: {correctCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <span>✕</span>
                <span>Sai: {wrongCount}</span>
              </span>
            </div>

            {/* Thời gian */}
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
              THỜI GIAN: {totalMinutesSpent} PHÚT {totalSecondsSpent} GIÂY / {totalAllowedMinutes} PHÚT
            </p>
          </div>

          {/* 2. ĐIỂM TỪNG PHẦN (Image 1) */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3 font-sans">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
              ĐIỂM TỪNG PHẦN
            </h3>

            <div className="space-y-2.5">
              {/* Row 1: Kanji • Từ vựng • Ngữ pháp */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between shadow-2xs">
                <span className="text-sm font-bold text-slate-800">
                  Kanji • Từ vựng • Ngữ pháp
                </span>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">{langScore}/60</span>
                  <span className="text-xs text-slate-500 block">{langCorrect}/{langQuestions.length} câu đúng</span>
                </div>
              </div>

              {/* Row 2: Đọc hiểu */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between shadow-2xs">
                <span className="text-sm font-bold text-slate-800">
                  Đọc hiểu
                </span>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">{readingScore}/60</span>
                  <span className="text-xs text-slate-500 block">{readingCorrect}/{readingQuestions.length} câu đúng</span>
                </div>
              </div>

              {/* Row 3: Nghe hiểu */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between shadow-2xs">
                <span className="text-sm font-bold text-slate-800">
                  Nghe hiểu
                </span>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">{listeningScore}/60</span>
                  <span className="text-xs text-slate-500 block">{listeningCorrect}/{listeningQuestions.length} câu đúng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CHI TIẾT BÀI LÀM & THANH TIẾN ĐỘ BÊN PHẢI (Image 2 -> 10) */}
        <div className="max-w-7xl mx-auto px-4 pt-4">
          {/* Header of Question Section (Image 2) */}
          <div className="text-center space-y-2 mb-6 font-sans">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide uppercase">
              {examResult.examTitle || 'ĐỀ THI JLPT CHUẨN'}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {examResult.level}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {totalCount} câu
              </span>
              {wrongCount > 0 && (
                <button
                  onClick={handleSaveAllWrongToNotebook}
                  disabled={isSavingToNotebook}
                  className="ml-2 px-3 py-0.5 rounded-full text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 border border-amber-400 transition-all cursor-pointer inline-flex items-center active:scale-95"
                  title="Lưu tất cả câu sai vào Sổ tay SRS"
                >
                  <span>Lưu {wrongCount} câu sai</span>
                </button>
              )}
            </div>
            {savedNotebookMessage && (
              <div className="inline-block p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 animate-fadeIn">
                ✓ {savedNotebookMessage}
              </div>
            )}

            {/* Filter buttons (Tất cả / Câu sai / Câu đúng) */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <button
                onClick={() => setResultFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  resultFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                Tất cả ({totalCount})
              </button>
              <button
                onClick={() => setResultFilter('wrong')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  resultFilter === 'wrong'
                    ? 'bg-red-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                Câu sai ({wrongCount})
              </button>
              <button
                onClick={() => setResultFilter('correct')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  resultFilter === 'correct'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                Câu đúng ({correctCount})
              </button>
            </div>
          </div>

          {/* Main 2-column Layout */}
          <div className="flex flex-col lg:flex-row items-start gap-6 relative">
            {/* Left Column: Questions List */}
            <div className="flex-1 w-full space-y-6">
              {filteredQuestionResults.map((q) => {
                const isSavedToNotebook = savedSingleNotebookIds[q.questionId];

                return (
                  <div
                    key={q.questionId}
                    id={`question-result-${q.questionId}`}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border relative space-y-4 shadow-xs scroll-mt-24 transition-all ${
                      q.isCorrect ? 'border-emerald-400' : 'border-rose-300'
                    }`}
                  >
                    {/* Badge ĐÚNG / SAI góc trên bên phải (Image 2, 3) */}
                    <div className="absolute top-0 right-0">
                      <span className={`px-4 py-1 text-xs font-black uppercase text-white rounded-tr-2xl rounded-bl-xl ${
                        q.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                        {q.isCorrect ? 'ĐÚNG' : 'SAI'}
                      </span>
                    </div>

                    {/* Tiêu đề câu hỏi & Số thứ tự (Image 2, 3, 4) */}
                    <div className="flex items-start gap-3 pr-14">
                      <span className={`w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        q.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                        {q.orderNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-base font-bold text-slate-900 leading-relaxed font-japanese"
                          dangerouslySetInnerHTML={{ __html: renderQuestionText(cleanQuestionText(q.question, q.orderNumber)) }}
                        />
                        {showTranslations && q.questionVi && (
                          <p className="text-xs text-slate-500 italic mt-1 font-sans">
                            {cleanQuestionVi(q.questionVi, q.orderNumber)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* BĂNG NGHE NẾU CÓ (Audio Player - Image 9) */}
                    {(q.section === 'listening' || q.audioUrl) && (
                      <div className="p-3 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs font-sans">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleReviewAudio(q)}
                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition-all cursor-pointer"
                          >
                            {reviewAudioPlayingId === q.questionId ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-white" />
                                <span>Tạm dừng</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Phát băng nghe</span>
                              </>
                            )}
                          </button>
                          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                            <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{reviewAudioPlayingId === q.questionId ? 'Đang phát...' : 'Băng nghe gốc'}</span>
                          </span>

                          {/* Bộ chỉnh tốc độ 0.8x, 1.0x, 1.2x */}
                          <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                            {[0.8, 1.0, 1.2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => handleChangePlaybackRate(rate)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  audioPlaybackRate === rate ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TỜ ĐỀ THI MINH HỌA HÌNH ẢNH NẾU CÓ */}
                    {q.imageUrl && (
                      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex justify-center">
                        <img src={q.imageUrl} alt="Hình minh họa" className="max-h-64 object-contain rounded-lg" />
                      </div>
                    )}

                    {/* ĐOẠN VĂN ĐỌC HIỂU (Image 5, 7) */}
                    {q.section !== 'listening' && !q.audioUrl && q.passage && (
                      <div className="space-y-2">
                        {/* Hộp dịch nếu bật toggle DỊCH */}
                        {showTranslations && q.passageVi && (
                          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700 leading-relaxed space-y-1 font-sans">
                            <span className="font-bold text-blue-700 block">Dịch:</span>
                            <p className="whitespace-pre-line">{q.passageVi}</p>
                          </div>
                        )}
                        {/* Nội dung bài đọc Nhật */}
                        <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/90 text-sm font-japanese text-slate-900 leading-relaxed whitespace-pre-line">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: renderPassageWithHighlight(
                                q.passage,
                                q.section === 'grammar' ? q.orderNumber : undefined
                              )
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* SCRIPT ĐOẠN THOẠI CHO CÂU HỎI NGHE HIỂU (Image 9) */}
                    {(q.section === 'listening' || q.audioUrl) && q.passage && (
                      <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100/80 text-xs space-y-2 font-japanese">
                        <div className="font-black text-blue-700 tracking-wider text-[11px] uppercase">
                          SCRIPT:
                        </div>
                        {renderListeningScriptWithVi(q.passage, q.passageVi)}
                      </div>
                    )}

                    {/* 4 PHƯƠNG ÁN LỰA CHỌN (Image 2, 3, 4) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isUserPick = q.userAnswer === optIdx;
                        const isRightAnswer = q.correctAnswer === optIdx;

                        let optClass = 'border-slate-100 bg-slate-50/40 text-slate-400';
                        let icon: React.ReactNode = null;

                        if (isRightAnswer) {
                          optClass = 'border-2 border-emerald-500 bg-white text-emerald-950 font-bold';
                          icon = (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          );
                        } else if (isUserPick) {
                          optClass = 'border-2 border-rose-400 bg-white text-rose-950 font-bold';
                          icon = (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          );
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${optClass}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className={`text-xs font-bold shrink-0 ${
                                isRightAnswer ? 'text-emerald-600' : isUserPick ? 'text-rose-600' : 'text-slate-300'
                              }`}>
                                {optIdx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span
                                  className="font-japanese text-sm leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: opt }}
                                />
                                {((q.section === 'listening' || showTranslations) && q.optionsVi?.[optIdx]) && (
                                  <p className="text-xs text-blue-600 font-medium mt-0.5 font-sans">
                                    {q.optionsVi[optIdx]}
                                  </p>
                                )}
                              </div>
                            </div>
                            {icon}
                          </div>
                        );
                      })}
                    </div>

                    {/* HỘP "GIẢI THÍCH:" ĐƠN GIẢN, THÂN THIỆN (Image 2, 3, 4, 6, 8) */}
                    {renderCleanFriendlyExplanation(q)}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Sticky Sidebar "Tiến độ" (Image 2, 3) */}
            {showResultSidebar && (
              <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-4 space-y-4 font-sans">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Tiến độ</span>
                    <button
                      onClick={() => setShowResultSidebar(false)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer uppercase tracking-wider"
                    >
                      ĐÓNG
                    </button>
                  </div>

                  {/* Section groupings */}
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {sidebarSections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          {sec.title}
                        </span>
                        <div className="grid grid-cols-5 gap-1.5">
                          {sec.questions.map((sq) => {
                            const isCorrect = sq.isCorrect;
                            return (
                              <button
                                key={sq.questionId}
                                onClick={() => {
                                  const el = document.getElementById(`question-result-${sq.questionId}`);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs ${
                                  isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                                title={`Câu ${sq.orderNumber}: ${isCorrect ? 'Đúng' : 'Sai'}`}
                              >
                                {sq.orderNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer summary */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
                      <span className="text-slate-700">Đúng</span>
                      <span className="text-slate-900 font-black">{correctCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-red-500 inline-block" />
                      <span className="text-slate-700">Sai</span>
                      <span className="text-slate-900 font-black">{wrongCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nút Điều Hướng Cuối Trang */}
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between pt-8 font-sans">
          <button
            onClick={() => setCurrentScreen('catalog')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-xs"
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
