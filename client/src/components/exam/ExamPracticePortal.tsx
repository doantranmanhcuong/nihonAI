'use client';

import React from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Languages,
  BookOpen,
  Headphones,
  CheckCheck,
  CheckCircle2
} from 'lucide-react';
import { JLPTExam } from './exam.types';

export type PortalView =
  | 'hub'
  | 'short_levels'
  | 'short_exams'
  | 'standard_levels'
  | 'standard_exams'
  | 'book_levels'
  | 'book_exams'
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
  onStartExam: (exam: any, mode: 'practice' | 'exam', section?: string, format?: 'express' | 'full') => void;
  onStartMistakePractice: () => void;
}

const STANDARD_COUNTS: Record<string, number> = {
  N5: 5,
  N4: 11,
  N3: 25,
  N2: 22,
  N1: 18
};

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
  onStartExam,
  onStartMistakePractice
}: ExamPracticePortalProps) {
  const targetStandardCount = STANDARD_COUNTS[portalLevel.toUpperCase()] || 25;
  const filteredStandardExams = examList.filter(
    (e) => (e.level || 'N3').toUpperCase() === portalLevel.toUpperCase()
  );

  // Danh sách đề chuẩn JLPT cho level hiện tại (Image 8)
  const standardExamsForCurrentLevel = Array.from({ length: targetStandardCount }).map((_, idx) => {
    const examIndex = idx + 1;
    const baseExam = filteredStandardExams[idx % (filteredStandardExams.length || 1)] || {
      id: `std-${portalLevel.toLowerCase()}-${examIndex}`,
      level: portalLevel,
      title: `Đề thi chuẩn JLPT ${portalLevel} - Số ${examIndex}`,
      durationMinutes: portalLevel === 'N1' ? 170 : portalLevel === 'N2' ? 155 : portalLevel === 'N3' ? 140 : 115,
      totalQuestions: 35
    };
    const examKey = `${portalLevel.toUpperCase()}-de-${examIndex}`;
    const isCompleted = completedExamKeys.has(examKey) || completedExamKeys.has(`${portalLevel.toUpperCase()}-${baseExam.id}`);
    return {
      ...baseExam,
      examIndex,
      displayTitle: `ĐỀ ${examIndex}`,
      examKey,
      isCompleted
    };
  });

  const standardCompletedCount = standardExamsForCurrentLevel.filter((e) => e.isCompleted).length;
  const standardUncompletedCount = standardExamsForCurrentLevel.length - standardCompletedCount;

  const visibleStandardExams = standardExamsForCurrentLevel.filter((e) => {
    if (portalFilter === 'completed') return e.isCompleted;
    if (portalFilter === 'uncompleted') return !e.isCompleted;
    return true;
  });

  // Danh sách 72 Đề ngắn mỗi ngày (Image 7)
  const shortExamSkills = ['KANJI', 'NGỮ PHÁP', 'TỪ VỰNG'];
  const shortExamsList = Array.from({ length: 72 }).map((_, idx) => {
    const order = 72 - idx;
    const skill = shortExamSkills[idx % shortExamSkills.length];
    const examKey = `${portalLevel.toUpperCase()}-short-${order}`;
    const isCompleted = completedExamKeys.has(examKey) || order <= 3;
    return {
      id: `short-${portalLevel.toLowerCase()}-${order}`,
      level: portalLevel,
      order,
      skill,
      title: `ĐỀ ${order}`,
      examKey,
      isCompleted
    };
  });

  const shortCompletedCount = shortExamsList.filter((e) => e.isCompleted).length;
  const shortUncompletedCount = shortExamsList.length - shortCompletedCount;

  const visibleShortExams = shortExamsList.filter((e) => {
    if (portalFilter === 'completed') return e.isCompleted;
    if (portalFilter === 'uncompleted') return !e.isCompleted;
    return true;
  });

  // ----------------------------------------------------
  // VIEW 1: HUB CHÍNH - 4 THẺ LUYỆN ĐỀ (IMAGE 4)
  // ----------------------------------------------------
  if (portalView === 'hub') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10 animate-fadeIn font-sans">
        {/* Header Title & Subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            LUYỆN ĐỀ JLPT
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Chọn cách luyện đề phù hợp với bạn
          </p>
        </div>

        {/* 4 Cards Grid (Image 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Thẻ 1: ĐỀ NGẮN */}
          <div
            onClick={() => {
              setPortalFilter('all');
              setPortalView('short_levels');
            }}
            className="bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
                <rect x="26" y="24" width="48" height="52" rx="10" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
                <rect x="26" y="24" width="48" height="16" rx="10" fill="#0284C7" />
                <text x="50" y="36" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">HÔM NAY</text>
                <text x="50" y="62" fill="#0369A1" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">15</text>
                <circle cx="68" cy="68" r="7" fill="#10B981" />
                <path d="M65 68L67 70L71 66" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 group-hover:text-sky-600 transition-colors uppercase">
                ĐỀ NGẮN
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Mỗi ngày một đề mới, làm trong lúc giải lao.
              </p>
            </div>
          </div>

          {/* Thẻ 2: ĐỀ CHUẨN JLPT */}
          <div
            onClick={() => {
              setPortalFilter('all');
              setPortalView('standard_levels');
            }}
            className="bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="44" fill="#EEF2FF" />
                <rect x="30" y="22" width="42" height="56" rx="8" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="3" />
                <rect x="30" y="22" width="42" height="14" rx="8" fill="#4F46E5" />
                <text x="51" y="33" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">JLPT</text>
                <circle cx="40" cy="46" r="2.5" fill="#C7D2FE" />
                <circle cx="48" cy="46" r="2.5" fill="#4F46E5" />
                <circle cx="56" cy="46" r="2.5" fill="#C7D2FE" />
                <circle cx="64" cy="46" r="2.5" fill="#C7D2FE" />
                <circle cx="40" cy="56" r="2.5" fill="#C7D2FE" />
                <circle cx="48" cy="56" r="2.5" fill="#C7D2FE" />
                <circle cx="56" cy="56" r="2.5" fill="#4F46E5" />
                <circle cx="64" cy="56" r="2.5" fill="#C7D2FE" />
                <path d="M68 36L78 26L84 32L74 42L68 44L68 36Z" fill="#F59E0B" />
                <circle cx="34" cy="68" r="7" fill="#4F46E5" />
                <path d="M31 68L33 70L37 66" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase">
                ĐỀ CHUẨN JLPT
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Kiến thức trọng tâm, bám sát đề thi thật 99%.
              </p>
            </div>
          </div>

          {/* Thẻ 3: SÁCH LUYỆN ĐỀ */}
          <div
            onClick={() => {
              setPortalFilter('all');
              setPortalView('book_levels');
            }}
            className="bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
                <rect x="28" y="28" width="44" height="10" rx="3" fill="#F97316" stroke="#EA580C" strokeWidth="2" />
                <rect x="34" y="31" width="32" height="4" rx="1.5" fill="#FFF7ED" />
                <rect x="25" y="42" width="50" height="11" rx="3" fill="#0EA5E9" stroke="#0284C7" strokeWidth="2" />
                <rect x="32" y="45.5" width="36" height="4" rx="1.5" fill="#F0F9FF" />
                <rect x="22" y="57" width="56" height="12" rx="3" fill="#10B981" stroke="#059669" strokeWidth="2" />
                <rect x="30" y="61" width="40" height="4" rx="1.5" fill="#ECFDF5" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 group-hover:text-emerald-600 transition-colors uppercase">
                SÁCH LUYỆN ĐỀ
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Luyện theo các cuốn sách luyện đề JLPT nổi tiếng.
              </p>
            </div>
          </div>

          {/* Thẻ 4: ĐỀ NGẪU NHIÊN */}
          <div
            onClick={() => {
              setPortalFilter('all');
              setPortalView('random_levels');
            }}
            className="bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
                <rect x="28" y="24" width="34" height="46" rx="6" fill="#FDBA74" transform="rotate(-8 28 24)" />
                <rect x="38" y="26" width="34" height="46" rx="6" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.5" />
                <line x1="44" y1="36" x2="62" y2="36" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
                <line x1="44" y1="42" x2="62" y2="42" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
                <line x1="44" y1="48" x2="58" y2="48" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
                <rect x="52" y="48" width="28" height="28" rx="6" fill="#EA580C" stroke="#C2410C" strokeWidth="2" />
                <circle cx="58" cy="54" r="2" fill="#FFFFFF" />
                <circle cx="74" cy="54" r="2" fill="#FFFFFF" />
                <circle cx="66" cy="62" r="2" fill="#FFFFFF" />
                <circle cx="58" cy="70" r="2" fill="#FFFFFF" />
                <circle cx="74" cy="70" r="2" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors uppercase">
                ĐỀ NGẪU NHIÊN
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Tạo đề theo ý muốn, từ kho 20.000 câu hỏi.
              </p>
            </div>
          </div>
        </div>

        {/* Nút LÀM LẠI CÂU SAI ở đáy trang (Image 4) */}
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
  // VIEW 2: CHỌN CẤP ĐỘ CHO ĐỀ CHUẨN JLPT (IMAGE 5)
  // ----------------------------------------------------
  if (portalView === 'standard_levels') {
    const levels = [
      { level: 'N5', count: 5, colorText: 'text-emerald-600', fill: '#10B981', ring: 'hover:border-emerald-500' },
      { level: 'N4', count: 11, colorText: 'text-blue-600', fill: '#2563EB', ring: 'hover:border-blue-500' },
      { level: 'N3', count: 25, colorText: 'text-indigo-600', fill: '#4F46E5', ring: 'hover:border-indigo-500' },
      { level: 'N2', count: 22, colorText: 'text-amber-600', fill: '#F59E0B', ring: 'hover:border-amber-500' },
      { level: 'N1', count: 18, colorText: 'text-rose-600', fill: '#EF4444', ring: 'hover:border-rose-500' }
    ];

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPortalView('hub')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LUYỆN ĐỀ</span>
          </button>
          <button
            onClick={() => setPortalView('hub')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            TRANG CHỦ
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            ĐỀ CHUẨN JLPT
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Kiến thức trọng tâm, bám sát đề thi thật 99%.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {levels.map((item) => (
            <div
              key={item.level}
              onClick={() => {
                setPortalLevel(item.level);
                setPortalFilter('all');
                setPortalView('standard_exams');
              }}
              className={`bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 ${item.ring}`}
            >
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                  <rect x="28" y="16" width="44" height="64" rx="8" fill="#FFFFFF" stroke={item.fill} strokeWidth="3" />
                  <rect x="28" y="16" width="44" height="16" rx="8" fill={item.fill} />
                  <text x="50" y="28" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">JLPT</text>
                  <circle cx="38" cy="42" r="2.5" fill="#CBD5E1" />
                  <circle cx="46" cy="42" r="2.5" fill={item.fill} />
                  <circle cx="54" cy="42" r="2.5" fill="#CBD5E1" />
                  <circle cx="62" cy="42" r="2.5" fill="#CBD5E1" />
                  <circle cx="38" cy="52" r="2.5" fill="#CBD5E1" />
                  <circle cx="46" cy="52" r="2.5" fill="#CBD5E1" />
                  <circle cx="54" cy="52" r="2.5" fill={item.fill} />
                  <circle cx="62" cy="52" r="2.5" fill="#CBD5E1" />
                  <circle cx="34" cy="74" r="6" fill={item.fill} />
                  <path d="M31 74L33 76L37 72" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className={`text-2xl font-black ${item.colorText}`}>
                  {item.level}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  {item.count} đề
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: DANH SÁCH ĐỀ CHUẨN JLPT THEO LEVEL (IMAGE 8)
  // ----------------------------------------------------
  if (portalView === 'standard_exams') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPortalView('standard_levels')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ĐỀ CHUẨN</span>
          </button>

          {/* Level Tabs (N5 N4 [N3] N2 N1) */}
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

          <button
            onClick={() => setPortalView('hub')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            TRANG CHỦ
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            ĐỀ CHUẨN JLPT {portalLevel}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {targetStandardCount} đề dựng lại theo cấu trúc đề thi thật
          </p>
        </div>

        {/* Filter Pills (Image 8: TẤT CẢ, CHƯA LÀM, ĐÃ LÀM) */}
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

        {/* Grid of Standard Exam Cards (Image 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
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
              <span className={`text-2xl font-black ${item.isCompleted ? 'text-emerald-700' : 'text-blue-600'}`}>
                {item.examIndex}
              </span>
            </div>
          ))}
        </div>

        {/* MODAL CHỌN PHẦN THI KHI CLICK VÀO ĐỀ (IMAGE 9) */}
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

              {/* 4 Parts Selection Rows (Image 9) */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    const ex = selectedExamForModal;
                    setSelectedExamForModal(null);
                    onStartExam(ex, 'practice', 'vocab');
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
                    onStartExam(ex, 'practice', 'grammar');
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
                    onStartExam(ex, 'practice', 'listening');
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
  // VIEW 4: CHỌN CẤP ĐỘ CHO ĐỀ NGẮN MỖI NGÀY (IMAGE 6)
  // ----------------------------------------------------
  if (portalView === 'short_levels') {
    const levels = [
      { level: 'N5', colorText: 'text-emerald-600', fill: '#10B981', ring: 'hover:border-emerald-500' },
      { level: 'N4', colorText: 'text-blue-600', fill: '#2563EB', ring: 'hover:border-blue-500' },
      { level: 'N3', colorText: 'text-indigo-600', fill: '#4F46E5', ring: 'hover:border-indigo-500' },
      { level: 'N2', colorText: 'text-amber-600', fill: '#F59E0B', ring: 'hover:border-amber-500' },
      { level: 'N1', colorText: 'text-rose-600', fill: '#EF4444', ring: 'hover:border-rose-500' }
    ];

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPortalView('hub')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LUYỆN ĐỀ</span>
          </button>
          <button
            onClick={() => setPortalView('hub')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            TRANG CHỦ
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            ĐỀ NGẮN MỖI NGÀY
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Mỗi ngày một đề mới, làm trong lúc giải lao.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span>👥</span>
              <span>Hôm nay có 169 bạn đã làm bài!</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {levels.map((item) => (
            <div
              key={item.level}
              onClick={() => {
                setPortalLevel(item.level);
                setPortalFilter('all');
                setPortalView('short_exams');
              }}
              className={`bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 ${item.ring}`}
            >
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                  <rect x="26" y="24" width="48" height="52" rx="10" fill="#FFFFFF" stroke={item.fill} strokeWidth="3" />
                  <rect x="26" y="24" width="48" height="16" rx="10" fill={item.fill} />
                  <text x="50" y="36" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">HÔM NAY</text>
                  <rect x="36" y="48" width="6" height="6" rx="1.5" fill="#E2E8F0" />
                  <rect x="46" y="48" width="6" height="6" rx="1.5" fill="#E2E8F0" />
                  <rect x="56" y="48" width="6" height="6" rx="1.5" fill="#E2E8F0" />
                  <rect x="36" y="58" width="6" height="6" rx="1.5" fill="#E2E8F0" />
                  <rect x="46" y="58" width="6" height="6" rx="1.5" fill={item.fill} />
                  <rect x="56" y="58" width="6" height="6" rx="1.5" fill="#E2E8F0" />
                </svg>
              </div>
              <div>
                <h3 className={`text-2xl font-black ${item.colorText}`}>
                  {item.level}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 5: DANH SÁCH 72 ĐỀ NGẮN ĐÃ MỞ (IMAGE 7)
  // ----------------------------------------------------
  if (portalView === 'short_exams') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPortalView('short_levels')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LUYỆN ĐỀ</span>
          </button>

          {/* Level Tabs (N5 N4 [N3] N2 N1) */}
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

          <button
            onClick={() => setPortalView('hub')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            TRANG CHỦ
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            ĐỀ ĐÃ MỞ
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
              Tất cả 72
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {visibleShortExams.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const sec = item.skill === 'KANJI' || item.skill === 'TỪ VỰNG' ? 'vocab' : 'grammar';
                const baseExam = filteredStandardExams[0] || {
                  id: item.id,
                  level: portalLevel,
                  title: `Đề ngắn ${portalLevel} - Số ${item.order}`
                };
                onStartExam(baseExam, 'practice', sec, 'express');
              }}
              className={`p-4 rounded-2xl text-center border transition-all cursor-pointer relative hover:shadow-md hover:-translate-y-0.5 ${
                item.isCompleted
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
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
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 6: ĐỀ NGẪU NHIÊN (IMAGES 10 & 11)
  // ----------------------------------------------------
  if (portalView === 'random_levels') {
    const levels = [
      { level: 'N5', colorText: 'text-emerald-600', fill: '#10B981', ring: 'hover:border-emerald-500' },
      { level: 'N4', colorText: 'text-blue-600', fill: '#2563EB', ring: 'hover:border-blue-500' },
      { level: 'N3', colorText: 'text-indigo-600', fill: '#4F46E5', ring: 'hover:border-indigo-500' },
      { level: 'N2', colorText: 'text-amber-600', fill: '#F59E0B', ring: 'hover:border-amber-500' },
      { level: 'N1', colorText: 'text-rose-600', fill: '#EF4444', ring: 'hover:border-rose-500' }
    ];

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPortalView('hub')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LUYỆN ĐỀ</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {[
              { id: 'short_levels', label: 'Đề ngắn' },
              { id: 'standard_levels', label: 'Đề chuẩn' },
              { id: 'book_levels', label: 'Sách' },
              { id: 'random_levels', label: 'Đề ngẫu nhiên' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPortalView(tab.id as any)}
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

          <button
            onClick={() => setPortalView('hub')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            TRANG CHỦ
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            ĐỀ NGẪU NHIÊN
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Tạo đề theo ý muốn, từ kho 20.000 câu hỏi.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
          {levels.map((item) => (
            <div
              key={item.level}
              onClick={() => setRandomConfigModalLevel(item.level)}
              className={`bg-white rounded-3xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 ${item.ring}`}
            >
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                  <rect x="28" y="24" width="34" height="46" rx="6" fill="#CBD5E1" transform="rotate(-8 28 24)" />
                  <rect x="38" y="26" width="34" height="46" rx="6" fill="#FFFFFF" stroke={item.fill} strokeWidth="2.5" />
                  <rect x="52" y="48" width="28" height="28" rx="6" fill={item.fill} />
                  <circle cx="58" cy="54" r="2" fill="#FFFFFF" />
                  <circle cx="74" cy="54" r="2" fill="#FFFFFF" />
                  <circle cx="66" cy="62" r="2" fill="#FFFFFF" />
                  <circle cx="58" cy="70" r="2" fill="#FFFFFF" />
                  <circle cx="74" cy="70" r="2" fill="#FFFFFF" />
                </svg>
              </div>
              <div>
                <h3 className={`text-2xl font-black ${item.colorText}`}>
                  {item.level}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL CẤU HÌNH ĐỀ NGẪU NHIÊN (IMAGE 11) */}
        {randomConfigModalLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl space-y-6 border border-slate-100 animate-scaleUp">
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
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  KỸ NĂNG
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kanji', label: 'Kanji' },
                    { id: 'vocab', label: 'Từ vựng' },
                    { id: 'grammar', label: 'Ngữ pháp' },
                    { id: 'reading', label: 'Đọc hiểu' },
                    { id: 'listening', label: 'Nghe hiểu' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setRandomSkill(s.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        randomSkill === s.id
                          ? 'border-2 border-blue-600 text-blue-600 bg-blue-50/50'
                          : 'border border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: DẠNG BÀI JLPT */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  DẠNG BÀI JLPT
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mondai1', label: 'Mondai 1' },
                    { id: 'mondai2', label: 'Mondai 2' },
                    { id: 'all', label: 'Tất cả' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setRandomMondai(m.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        randomMondai === m.id
                          ? 'border-2 border-blue-600 text-blue-600 bg-blue-50/50'
                          : 'border border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const baseExam = filteredStandardExams[0] || {
                    id: `rand-${randomConfigModalLevel.toLowerCase()}`,
                    level: randomConfigModalLevel,
                    title: `Đề ngẫu nhiên ${randomConfigModalLevel}`
                  };
                  const sec = randomSkill === 'kanji' || randomSkill === 'vocab' ? 'vocab' : randomSkill;
                  setRandomConfigModalLevel(null);
                  onStartExam(baseExam, 'practice', sec, 'express');
                }}
                className="w-full py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all cursor-pointer text-sm shadow-md shadow-blue-200 tracking-wider uppercase"
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
  // VIEW 7: SÁCH LUYỆN ĐỀ (SERIES WORKBOOKS)
  // ----------------------------------------------------
  if (portalView === 'book_levels') {
    const bookSeries = [
      {
        id: 'shinkanzen',
        title: 'Shinkanzen Master',
        subtitle: 'Bộ sách luyện đề chuyên sâu sát format thật nhất',
        modules: ['Hán tự', 'Từ vựng', 'Ngữ pháp', 'Đọc hiểu', 'Nghe hiểu']
      },
      {
        id: 'somatome',
        title: 'Nihongo Soumatome',
        subtitle: 'Chinh phục JLPT từng ngày trong 6 tuần',
        modules: ['Hán tự', 'Từ vựng', 'Ngữ pháp', 'Đọc hiểu', 'Nghe hiểu']
      },
      {
        id: 'mimikara',
        title: 'Mimikara Oboeru',
        subtitle: 'Ghi nhớ toàn diện bằng âm thanh & liên kết ngữ cảnh',
        modules: ['Từ vựng', 'Ngữ pháp', 'Nghe hiểu']
      },
      {
        id: 'goukaku',
        title: 'Goukaku Dekiru',
        subtitle: 'Bộ đề thi thử thực chiến bám sát kỳ thi quốc tế',
        modules: ['Tổng hợp đề thi thử']
      }
    ];

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn font-sans">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPortalView('hub')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LUYỆN ĐỀ</span>
          </button>
          <button
            onClick={() => setPortalView('hub')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            TRANG CHỦ
          </button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            SÁCH LUYỆN ĐỀ JLPT
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Luyện theo các cuốn sách luyện đề JLPT nổi tiếng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {bookSeries.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800">{book.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{book.subtitle}</p>
                </div>
                <span className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {book.modules.map((m, mIdx) => (
                  <button
                    key={mIdx}
                    onClick={() => {
                      const baseExam = filteredStandardExams[0] || {
                        id: `book-${book.id}`,
                        level: portalLevel,
                        title: `${book.title} - ${m}`
                      };
                      const sec = m.includes('Hán tự') || m.includes('Từ vựng') ? 'vocab' : m.includes('Ngữ pháp') ? 'grammar' : m.includes('Đọc') ? 'reading' : 'listening';
                      onStartExam(baseExam, 'practice', sec, 'express');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 8: NGÂN HÀNG CÂU SAI (SRS MISTAKE BANK)
  // ----------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fadeIn font-sans">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPortalView('hub')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>LUYỆN ĐỀ</span>
        </button>
        <button
          onClick={() => setPortalView('hub')}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
        >
          TRANG CHỦ
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
