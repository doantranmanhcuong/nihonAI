'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Languages,
  BookOpen,
  Headphones,
  CheckCheck,
  CheckCircle2,
  Calendar,
  Award,
  Shuffle
} from 'lucide-react';
import { ExamBankStats, ShortExamSummary } from './exam.types';
import { ExamApi } from './exam.api';

export type PortalView =
  | 'hub'
  | 'short_levels'
  | 'short_exams'
  | 'standard_levels'
  | 'standard_exams'
  | 'random_levels'
  | 'mistakes';

export interface ExamPracticePortalProps {
  portalView: PortalView;
  setPortalView: (v: PortalView) => void;
  portalLevel: string;
  setPortalLevel: (l: string) => void;
  portalFilter: 'all' | 'uncompleted' | 'completed';
  setPortalFilter: (f: 'all' | 'uncompleted' | 'completed') => void;
  selectedExamForModal: any;
  setSelectedExamForModal: (e: any) => void;
  randomConfigModalLevel: string | null;
  setRandomConfigModalLevel: (l: string | null) => void;
  randomSkill: string;
  setRandomSkill: (s: string) => void;
  randomMondai: string;
  setRandomMondai: (m: string) => void;
  completedExamKeys: Set<string>;
  mistakeItems: any[];
  examList: any[];
  bankStats?: ExamBankStats | null;
  onStartExam: (exam: any, mode: 'practice' | 'exam', section?: string, format?: 'express' | 'full') => void;
  onStartShortExam?: (level: string, order: number) => void;
  onStartRandomExam?: (level: string, skill: string, mondai: string) => void;
  onStartMistakePractice: () => void;
}

interface RandomSkillMeta {
  id: string;
  label: string;
  activeClass: string;
  mondais: { id: string; label: string; subTypes: string[] }[];
}

const RANDOM_SKILLS: RandomSkillMeta[] = [
  {
    id: 'kanji',
    label: 'Kanji',
    activeClass: 'border-2 border-blue-600 text-blue-600 bg-blue-50/70',
    mondais: [
      { id: 'mondai1', label: 'Mondai 1', subTypes: ['kanji_reading'] },
      { id: 'mondai2', label: 'Mondai 2', subTypes: ['orthography'] },
      { id: 'all', label: 'Tất cả', subTypes: ['kanji_reading', 'orthography'] }
    ]
  },
  {
    id: 'vocab',
    label: 'Từ vựng',
    activeClass: 'border-2 border-emerald-600 text-emerald-700 bg-emerald-50/70',
    mondais: [
      { id: 'mondai3', label: 'Mondai 3', subTypes: ['context'] },
      { id: 'mondai4', label: 'Mondai 4', subTypes: ['paraphrase'] },
      { id: 'mondai5', label: 'Mondai 5', subTypes: ['usage'] },
      { id: 'all', label: 'Tất cả', subTypes: ['context', 'paraphrase', 'usage'] }
    ]
  },
  {
    id: 'grammar',
    label: 'Ngữ pháp',
    activeClass: 'border-2 border-purple-600 text-purple-700 bg-purple-50/70',
    mondais: [
      { id: 'mondai1', label: 'Mondai 1', subTypes: ['grammar_form'] },
      { id: 'mondai2', label: 'Mondai 2', subTypes: ['star_order', 'sentence_order'] },
      { id: 'mondai3', label: 'Mondai 3', subTypes: ['passage_grammar'] },
      { id: 'all', label: 'Tất cả', subTypes: ['grammar_form', 'star_order', 'sentence_order', 'passage_grammar'] }
    ]
  },
  {
    id: 'reading',
    label: 'Đọc hiểu',
    activeClass: 'border-2 border-amber-500 text-amber-600 bg-amber-50/70',
    mondais: [
      { id: 'mondai1', label: 'Mondai 1', subTypes: ['short_reading'] },
      { id: 'mondai2', label: 'Mondai 2', subTypes: ['mid_reading', 'medium_reading'] },
      { id: 'mondai3', label: 'Mondai 3', subTypes: ['long_reading', 'info_search'] },
      { id: 'all', label: 'Tất cả', subTypes: ['short_reading', 'mid_reading', 'medium_reading', 'long_reading', 'info_search'] }
    ]
  },
  {
    id: 'listening',
    label: 'Nghe hiểu',
    activeClass: 'border-2 border-pink-500 text-pink-600 bg-pink-50/70',
    mondais: [
      { id: 'mondai1', label: 'Mondai 1', subTypes: ['task_listen'] },
      { id: 'mondai2', label: 'Mondai 2', subTypes: ['point_listen'] },
      { id: 'mondai3', label: 'Mondai 3', subTypes: ['overview_listen'] },
      { id: 'mondai4', label: 'Mondai 4', subTypes: ['quick_response'] },
      { id: 'mondai5', label: 'Mondai 5', subTypes: ['integrated_listen'] },
      { id: 'all', label: 'Tất cả', subTypes: ['task_listen', 'point_listen', 'overview_listen', 'quick_response', 'integrated_listen'] }
    ]
  }
];

const LEVEL_CARDS = [
  { level: 'N5', colorText: 'text-emerald-600', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'hover:border-emerald-500' },
  { level: 'N4', colorText: 'text-blue-600', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200', ring: 'hover:border-blue-500' },
  { level: 'N3', colorText: 'text-indigo-600', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200', ring: 'hover:border-indigo-500' },
  { level: 'N2', colorText: 'text-amber-600', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200', ring: 'hover:border-amber-500' },
  { level: 'N1', colorText: 'text-rose-600', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200', ring: 'hover:border-rose-500' }
];

export function ExamPracticePortal({
  portalView,
  setPortalView,
  portalLevel,
  setPortalLevel,
  portalFilter,
  setPortalFilter,
  selectedExamForModal,
  setSelectedExamForModal,
  randomConfigModalLevel,
  setRandomConfigModalLevel,
  randomSkill,
  setRandomSkill,
  randomMondai,
  setRandomMondai,
  completedExamKeys,
  mistakeItems,
  examList,
  bankStats,
  onStartExam,
  onStartShortExam,
  onStartRandomExam,
  onStartMistakePractice
}: ExamPracticePortalProps) {
  const [shortExamsRaw, setShortExamsRaw] = useState<ShortExamSummary[]>([]);
  const [isLoadingShort, setIsLoadingShort] = useState<boolean>(false);

  // Tải danh sách Đề ngắn thật từ backend (đảm bảo không trùng câu hỏi giữa các đề)
  useEffect(() => {
    if (portalView !== 'short_exams') return;
    let isMounted = true;
    setIsLoadingShort(true);
    ExamApi.getShortExamList(portalLevel)
      .then((items) => {
        if (isMounted) setShortExamsRaw(items || []);
      })
      .finally(() => {
        if (isMounted) setIsLoadingShort(false);
      });
    return () => {
      isMounted = false;
    };
  }, [portalView, portalLevel]);

  // Tổng số câu hỏi thực tế trong hệ thống (tính từ CSDL)
  const totalBankQuestions = useMemo(() => {
    if (bankStats?.totalQuestions && bankStats.totalQuestions > 0) {
      return bankStats.totalQuestions;
    }
    const summed = examList.reduce((acc, e) => acc + Number(e.fullTotalQuestions || e.totalQuestions || 0), 0);
    return summed > 0 ? summed : 4650;
  }, [bankStats, examList]);

  // Danh sách đề chuẩn thật theo level hiện tại (không lặp modulo, không số ảo)
  const standardExamsForCurrentLevel = useMemo(() => {
    const lvl = portalLevel.toUpperCase();
    const realExams = examList
      .filter((e) => (e.level || '').toUpperCase() === lvl)
      .sort((a, b) => {
        const aCode = String(a.code || a.title || a.id);
        const bCode = String(b.code || b.title || b.id);
        return aCode.localeCompare(bCode);
      });

    return realExams.map((baseExam, idx) => {
      const examIndex = idx + 1;
      const examKey = `${lvl}-${baseExam.id}`;
      const isCompleted = completedExamKeys.has(examKey);
      return {
        ...baseExam,
        examIndex,
        displayTitle: `ĐỀ ${examIndex}`,
        examKey,
        isCompleted
      };
    });
  }, [examList, portalLevel, completedExamKeys]);

  const standardCompletedCount = standardExamsForCurrentLevel.filter((e) => e.isCompleted).length;
  const standardUncompletedCount = standardExamsForCurrentLevel.length - standardCompletedCount;

  const visibleStandardExams = standardExamsForCurrentLevel.filter((e) => {
    if (portalFilter === 'completed') return e.isCompleted;
    if (portalFilter === 'uncompleted') return !e.isCompleted;
    return true;
  });

  // Đề ngắn mỗi ngày thật từ API
  const shortExamsList = useMemo(() => {
    const lvl = portalLevel.toUpperCase();
    return shortExamsRaw.map((item) => {
      const examKey = `${lvl}-${item.id}`;
      return {
        ...item,
        examKey,
        isCompleted: completedExamKeys.has(examKey)
      };
    });
  }, [shortExamsRaw, portalLevel, completedExamKeys]);

  const shortCompletedCount = shortExamsList.filter((e) => e.isCompleted).length;
  const shortUncompletedCount = shortExamsList.length - shortCompletedCount;

  const visibleShortExams = shortExamsList.filter((e) => {
    if (portalFilter === 'completed') return e.isCompleted;
    if (portalFilter === 'uncompleted') return !e.isCompleted;
    return true;
  });

  // ----------------------------------------------------
  // VIEW 1: HUB CHÍNH - 3 THẺ LUYỆN ĐỀ
  // ----------------------------------------------------
  if (portalView === 'hub') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10 animate-fadeIn font-sans">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            LUYỆN ĐỀ JLPT
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Chọn cách luyện đề phù hợp với bạn
          </p>
        </div>

        {/* 3 Cards Grid cân đối */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Thẻ 1: ĐỀ NGẮN */}
          <div
            onClick={() => {
              setPortalFilter('all');
              setPortalView('short_levels');
            }}
            className="bg-white rounded-3xl p-7 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 group-hover:text-sky-600 transition-colors uppercase">
                ĐỀ NGẮN
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Mỗi đề 10 câu trọng tâm, không trùng lặp câu hỏi.
              </p>
            </div>
          </div>

          {/* Thẻ 2: ĐỀ CHUẨN JLPT */}
          <div
            onClick={() => {
              setPortalFilter('all');
              setPortalView('standard_levels');
            }}
            className="bg-white rounded-3xl p-7 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase">
                ĐỀ CHUẨN JLPT
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Kiến thức trọng tâm, bám sát cấu trúc đề thi thật.
              </p>
            </div>
          </div>

          {/* Thẻ 3: ĐỀ NGẪU NHIÊN */}
          <div
            onClick={() => {
              setPortalFilter('all');
              setPortalView('random_levels');
            }}
            className="bg-white rounded-3xl p-7 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shuffle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors uppercase">
                ĐỀ NGẪU NHIÊN
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Tạo đề theo kỹ năng & Mondai từ {totalBankQuestions.toLocaleString('vi-VN')} câu hỏi trong hệ thống.
              </p>
            </div>
          </div>
        </div>

        {/* Nút LÀM LẠI CÂU SAI */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setPortalView('mistakes')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>LÀM LẠI CÂU SAI</span>
            {mistakeItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
                {mistakeItems.length}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: CHỌN CẤP ĐỘ CHO ĐỀ CHUẨN JLPT
  // ----------------------------------------------------
  if (portalView === 'standard_levels') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center">
          <button
            onClick={() => setPortalView('hub')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Luyện đề</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            ĐỀ CHUẨN JLPT
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Chọn cấp độ để bắt đầu luyện thi theo từng phần hoặc toàn đề
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {LEVEL_CARDS.map((item) => {
            const count =
              bankStats?.levels[item.level]?.exams ??
              examList.filter((e) => (e.level || '').toUpperCase() === item.level).length;
            return (
              <div
                key={item.level}
                onClick={() => {
                  setPortalLevel(item.level);
                  setPortalFilter('all');
                  setPortalView('standard_exams');
                }}
                className={`bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-3 ${item.ring}`}
              >
                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-black border ${item.badgeBg}`}>
                  JLPT
                </span>
                <h3 className={`text-3xl font-black ${item.colorText}`}>
                  {item.level}
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  {count} đề
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: DANH SÁCH ĐỀ CHUẨN JLPT THEO LEVEL
  // ----------------------------------------------------
  if (portalView === 'standard_exams') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPortalView('standard_levels')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn cấp độ</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setPortalLevel(lvl);
                  setPortalFilter('all');
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  portalLevel.toUpperCase() === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="w-24 hidden sm:block" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            ĐỀ CHUẨN JLPT {portalLevel}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {standardExamsForCurrentLevel.length} đề thi chuẩn dựng theo cấu trúc JLPT chính thức
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPortalFilter('all')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              portalFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            TẤT CẢ {standardExamsForCurrentLevel.length}
          </button>
          <button
            type="button"
            onClick={() => setPortalFilter('uncompleted')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              portalFilter === 'uncompleted'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            CHƯA LÀM {standardUncompletedCount}
          </button>
          <button
            type="button"
            onClick={() => setPortalFilter('completed')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              portalFilter === 'completed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ĐÃ LÀM {standardCompletedCount}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-4">
          {visibleStandardExams.map((item) => (
            <div
              key={item.examKey}
              onClick={() => setSelectedExamForModal(item)}
              className={`p-6 rounded-2xl text-center border transition-all cursor-pointer relative hover:shadow-lg hover:-translate-y-0.5 ${
                item.isCompleted
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-blue-400'
              }`}
            >
              {item.isCompleted && (
                <span className="absolute top-2.5 right-2.5 text-emerald-600 text-xs font-black">
                  ✓
                </span>
              )}
              <span className="text-[11px] font-bold text-blue-600 uppercase block mb-1">
                ĐỀ
              </span>
              <span className={`text-2xl font-black block ${item.isCompleted ? 'text-emerald-700' : 'text-blue-600'}`}>
                {item.examIndex}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block mt-1">
                {item.fullTotalQuestions || item.totalQuestions} câu
              </span>
            </div>
          ))}
        </div>

        {/* MODAL CHỌN PHẦN THI KHI CLICK VÀO ĐỀ */}
        {selectedExamForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl space-y-6 border border-slate-100 animate-scaleUp">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-blue-600">
                  {selectedExamForModal.level || portalLevel} • {selectedExamForModal.displayTitle || 'ĐỀ 1'}
                </h3>
                <button
                  onClick={() => setSelectedExamForModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  CHỌN PHẦN MUỐN LÀM
                </span>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    const ex = selectedExamForModal;
                    setSelectedExamForModal(null);
                    onStartExam(ex, 'practice', 'vocab', 'full');
                  }}
                  className="w-full p-4 rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                      <Languages className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-slate-800 group-hover:text-blue-700 uppercase">
                      KANJI • TỪ VỰNG
                    </span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ex = selectedExamForModal;
                    setSelectedExamForModal(null);
                    onStartExam(ex, 'practice', 'grammar_reading', 'full');
                  }}
                  className="w-full p-4 rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-slate-800 group-hover:text-blue-700 uppercase">
                      NGỮ PHÁP • ĐỌC HIỂU
                    </span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ex = selectedExamForModal;
                    setSelectedExamForModal(null);
                    onStartExam(ex, 'practice', 'listening', 'full');
                  }}
                  className="w-full p-4 rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-slate-800 group-hover:text-blue-700 uppercase">
                      NGHE HIỂU
                    </span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ex = selectedExamForModal;
                    setSelectedExamForModal(null);
                    onStartExam(ex, 'exam', undefined, 'full');
                  }}
                  className="w-full p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <CheckCheck className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-blue-800 uppercase">
                      LÀM TẤT CẢ
                    </span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 4: CHỌN CẤP ĐỘ CHO ĐỀ NGẮN MỖI NGÀY
  // ----------------------------------------------------
  if (portalView === 'short_levels') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center">
          <button
            onClick={() => setPortalView('hub')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Luyện đề</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            ĐỀ NGẮN MỖI NGÀY
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Mỗi đề 10 câu độc lập, hoàn toàn không trùng lặp câu hỏi giữa các đề
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {LEVEL_CARDS.map((item) => {
            const count = bankStats?.levels[item.level]?.shortCount;
            return (
              <div
                key={item.level}
                onClick={() => {
                  setPortalLevel(item.level);
                  setPortalFilter('all');
                  setPortalView('short_exams');
                }}
                className={`bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-3 ${item.ring}`}
              >
                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-black border ${item.badgeBg}`}>
                  10 CÂU / ĐỀ
                </span>
                <h3 className={`text-3xl font-black ${item.colorText}`}>
                  {item.level}
                </h3>
                {typeof count === 'number' && (
                  <p className="text-xs text-slate-500 font-bold">
                    {count} đề
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 5: DANH SÁCH ĐỀ NGẮN ĐỘC LẬP THEO LEVEL
  // ----------------------------------------------------
  if (portalView === 'short_exams') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPortalView('short_levels')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn cấp độ</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setPortalLevel(lvl);
                  setPortalFilter('all');
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  portalLevel.toUpperCase() === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="w-24 hidden sm:block" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            ĐỀ NGẮN {portalLevel} ({shortExamsList.length} đề)
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPortalFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                portalFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả {shortExamsList.length}
            </button>
            <button
              type="button"
              onClick={() => setPortalFilter('uncompleted')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                portalFilter === 'uncompleted'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Chưa làm {shortUncompletedCount}
            </button>
            <button
              type="button"
              onClick={() => setPortalFilter('completed')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                portalFilter === 'completed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Đã làm {shortCompletedCount}
            </button>
          </div>
        </div>

        {isLoadingShort ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {visibleShortExams.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onStartShortExam) {
                    onStartShortExam(portalLevel, item.order);
                  }
                }}
                className={`p-4 rounded-2xl text-center border transition-all cursor-pointer relative hover:shadow-md hover:-translate-y-0.5 ${
                  item.isCompleted
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs'
                }`}
              >
                {item.isCompleted && (
                  <span className="absolute top-2 right-2 text-emerald-600 text-xs font-black">✓</span>
                )}
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                  ĐỀ
                </span>
                <span className="text-2xl font-black text-blue-600 block mb-1">
                  {item.order}
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  {item.skill}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 6: ĐỀ NGẪU NHIÊN & MODAL CẤU HÌNH KỸ NĂNG -> MONDAI
  // ----------------------------------------------------
  if (portalView === 'random_levels') {
    const activeSkillObj = RANDOM_SKILLS.find((s) => s.id === randomSkill) || RANDOM_SKILLS[0];
    const levelSubTypes = randomConfigModalLevel
      ? bankStats?.levels[randomConfigModalLevel.toUpperCase()]?.subTypes
      : undefined;

    const availableMondais = activeSkillObj.mondais.filter((m) => {
      if (m.id === 'all' || !levelSubTypes) return true;
      return m.subTypes.some((st) => (levelSubTypes[st] || 0) > 0);
    });
    const effectiveMondai = availableMondais.some((m) => m.id === randomMondai)
      ? randomMondai
      : (availableMondais[0]?.id || 'all');

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPortalView('hub')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Luyện đề</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {[
              { id: 'short_levels', label: 'Đề ngắn' },
              { id: 'standard_levels', label: 'Đề chuẩn' },
              { id: 'random_levels', label: 'Đề ngẫu nhiên' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPortalView(tab.id as PortalView)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tab.id === 'random_levels'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-24 hidden sm:block" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            ĐỀ NGẪU NHIÊN
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Chọn cấp độ để tạo đề theo kỹ năng & Mondai từ {totalBankQuestions.toLocaleString('vi-VN')} câu hỏi trong hệ thống
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {LEVEL_CARDS.map((item) => {
            const qCount = bankStats?.levels[item.level]?.questions;
            return (
              <div
                key={item.level}
                onClick={() => {
                  setRandomSkill('kanji');
                  setRandomMondai('mondai1');
                  setRandomConfigModalLevel(item.level);
                }}
                className={`bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-3 ${item.ring}`}
              >
                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-black border ${item.badgeBg}`}>
                  RANDOM
                </span>
                <h3 className={`text-3xl font-black ${item.colorText}`}>
                  {item.level}
                </h3>
                {typeof qCount === 'number' && (
                  <p className="text-xs text-slate-500 font-bold">
                    {qCount.toLocaleString('vi-VN')} câu
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* MODAL CẤU HÌNH ĐỀ NGẪU NHIÊN (TẠO ĐỀ N5..N1) */}
        {randomConfigModalLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full mx-auto shadow-2xl space-y-6 border border-slate-100 animate-scaleUp">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-800">
                  TẠO ĐỀ <span className="text-blue-600">{randomConfigModalLevel}</span>
                </h3>
                <button
                  onClick={() => setRandomConfigModalLevel(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Section 1: KỸ NĂNG */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  KỸ NĂNG
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {RANDOM_SKILLS.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setRandomSkill(s.id);
                        setRandomMondai(s.mondais[0]?.id || 'all');
                      }}
                      className={`${idx < 3 ? 'col-span-2' : 'col-span-3'} py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeSkillObj.id === s.id
                          ? s.activeClass
                          : 'border border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: DẠNG BÀI JLPT (Động theo kỹ năng đang chọn) */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  DẠNG BÀI JLPT
                </label>
                {activeSkillObj.id === 'listening' ? (
                  <div className="space-y-2">
                    <div
                      className={`grid gap-1.5 ${
                        availableMondais.filter((m) => m.id !== 'all').length === 4
                          ? 'grid-cols-4'
                          : 'grid-cols-5'
                      }`}
                    >
                      {availableMondais
                        .filter((m) => m.id !== 'all')
                        .map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setRandomMondai(m.id)}
                            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              effectiveMondai === m.id
                                ? activeSkillObj.activeClass
                                : 'border border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRandomMondai('all')}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        effectiveMondai === 'all'
                          ? activeSkillObj.activeClass
                          : 'border border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                      }`}
                    >
                      Tất cả
                    </button>
                  </div>
                ) : (
                  <div
                    className={`grid gap-2 ${
                      availableMondais.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'
                    }`}
                  >
                    {availableMondais.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRandomMondai(m.id)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          effectiveMondai === m.id
                            ? activeSkillObj.activeClass
                            : 'border border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetLevel = randomConfigModalLevel;
                  setRandomConfigModalLevel(null);
                  if (onStartRandomExam) {
                    onStartRandomExam(targetLevel, activeSkillObj.id, effectiveMondai);
                  }
                }}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all cursor-pointer text-sm shadow-md shadow-blue-200 tracking-wider uppercase"
              >
                CHỌN ĐỀ NGẪU NHIÊN
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 7: NGÂN HÀNG CÂU SAI (SRS MISTAKE BANK)
  // ----------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
      <div className="flex items-center">
        <button
          onClick={() => setPortalView('hub')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Luyện đề</span>
        </button>
      </div>

      <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 text-center space-y-2">
        <h2 className="text-2xl font-black text-rose-900">
          NGÂN HÀNG CÂU SAI & SRS
        </h2>
        <p className="text-xs text-rose-700">
          Xem lại và làm lại các câu bạn đã trả lời sai trong các bài kiểm tra trước đây
        </p>
      </div>

      {mistakeItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Không có câu sai nào cần ôn tập!</h3>
          <p className="text-xs text-slate-500">Toàn bộ câu sai khi làm bài thi sẽ tự động được lưu trữ tại đây.</p>
          <button
            onClick={() => setPortalView('hub')}
            className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
          >
            Về trang Luyện Đề
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Tổng cộng: <strong className="text-rose-600">{mistakeItems.length}</strong> câu cần luyện tập lại
            </span>
            <button
              onClick={onStartMistakePractice}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all cursor-pointer"
            >
              Luyện tập toàn bộ câu sai
            </button>
          </div>

          <div className="space-y-3">
            {mistakeItems.map((item, idx) => (
              <div key={item.id || idx} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-rose-600">Câu sai #{idx + 1}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="font-japanese text-base text-slate-900 leading-relaxed">
                  {item.front}
                </div>
                {item.back && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.back}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
