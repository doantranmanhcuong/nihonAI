'use client';

import React from 'react';
import { BookOpen, Award, Headphones, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export type CurriculumType = 'MINNA' | 'TANGO' | 'MIMIKARA' | 'SOUMATOME';

interface CurriculumSelectorProps {
  curriculum: CurriculumType;
  onCurriculumChange: (c: CurriculumType) => void;
  level: string;
  onLevelChange: (l: string) => void;
}

export const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  curriculum,
  onCurriculumChange,
  level,
  onLevelChange
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const curriculums = [
    {
      id: 'MINNA' as CurriculumType,
      name: 'Minna no Nihongo',
      subtitle: '50 Bài học tiêu chuẩn',
      icon: BookOpen,
      levels: [
        { id: 'N5', label: 'N5 (Bài 1 - 25)', isFree: true },
        { id: 'N4', label: 'N4 (Bài 26 - 50)', isFree: true }
      ]
    },
    {
      id: 'TANGO' as CurriculumType,
      name: 'JLPT Tango',
      subtitle: 'Từ vựng cốt lõi theo JLPT',
      icon: Award,
      levels: [
        { id: 'N5', label: 'Tango N5', isFree: true },
        { id: 'N4', label: 'Tango N4', isFree: true },
        { id: 'N3', label: 'Tango N3', isFree: true },
        { id: 'N2', label: 'Tango N2', isFree: true },
        { id: 'N1', label: 'Tango N1', isFree: true }
      ]
    },
    {
      id: 'MIMIKARA' as CurriculumType,
      name: 'Mimikara Oboeru',
      subtitle: 'Luyện phản xạ thính giác',
      icon: Headphones,
      levels: [
        { id: 'N4', label: 'Mimikara N4', isFree: true },
        { id: 'N3', label: 'Mimikara N3', isFree: true },
        { id: 'N2', label: 'Mimikara N2', isFree: true },
        { id: 'N1', label: 'Mimikara N1', isFree: true }
      ]
    },
    {
      id: 'SOUMATOME' as CurriculumType,
      name: 'Soumatome',
      subtitle: 'Chuyên đề theo tuần',
      icon: Sparkles,
      levels: [
        { id: 'N3', label: 'Soumatome N3', isFree: true },
        { id: 'N2', label: 'Soumatome N2', isFree: true }
      ]
    }
  ];

  const currentCurriculumObj = curriculums.find((c) => c.id === curriculum) || curriculums[0];

  const handleLevelClick = (lvlId: string, isFree?: boolean) => {
    onLevelChange(lvlId);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-4 w-full">
      {/* 1. Thanh chọn Giáo trình chính */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {curriculums.map((item) => {
            const Icon = item.icon;
            const isSelected = curriculum === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onCurriculumChange(item.id);
                  // Tự động chọn level đầu tiên của giáo trình đó
                  onLevelChange(item.levels[0].id);
                }}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all text-left cursor-pointer shrink-0 border ${isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                <div>
                  <span className="text-xs sm:text-sm font-extrabold block leading-tight">
                    {item.name}
                  </span>
                  <span className={`text-[10px] block leading-tight ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Thanh chọn Cấp độ (Level Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <span className="text-xs font-bold text-slate-400 shrink-0 mr-1">
          Cấp độ:
        </span>
        {currentCurriculumObj.levels.map((lvl) => {
          const isActive = level === lvl.id;
          const isLocked = !isAuthenticated && !lvl.isFree;

          return (
            <button
              key={lvl.id}
              onClick={() => handleLevelClick(lvl.id, lvl.isFree)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
            >
              {isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
              <span>{lvl.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
