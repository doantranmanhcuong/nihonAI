'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  BookOpenCheck,
  Headphones,
  Award,
  Bookmark
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab
}) => {
  const navItems = [
    { id: 'kanji', label: 'Hán tự', icon: Sparkles },
    { id: 'vocab', label: 'Từ vựng', icon: BookOpen },
    { id: 'grammar', label: 'Ngữ pháp', icon: GraduationCap },
    { id: 'reading', label: 'Đọc hiểu', icon: BookOpenCheck },
    { id: 'shadowing', label: 'Luyện nghe', icon: Headphones },
    { id: 'exam', label: 'Thi thử', icon: Award },
    { id: 'personal', label: 'Sổ tay', icon: Bookmark }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-2 py-1 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-indigo-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
