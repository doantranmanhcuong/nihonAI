'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  BookOpenCheck,
  Headphones,
  Bookmark,
  Award
} from 'lucide-react';

interface SlimSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SlimSidebar: React.FC<SlimSidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'kanji', label: 'Hán tự', icon: Sparkles },
    { id: 'vocab', label: 'Từ vựng', icon: BookOpen },
    { id: 'grammar', label: 'Ngữ pháp', icon: GraduationCap },
    { id: 'reading', label: 'Đọc hiểu', icon: BookOpenCheck },
    { id: 'shadowing', label: 'Luyện nghe', icon: Headphones },
    { id: 'exam', label: 'Thi JLPT', icon: Award },
    { id: 'personal', label: 'Sổ tay', icon: Bookmark }
  ];

  return (
    <aside className="w-[72px] bg-white border-r border-slate-200/80 flex flex-col justify-between items-center py-4 shrink-0 h-[calc(100vh-60px)] sticky top-[60px] z-30 select-none shadow-2xs">
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="text-[10px] leading-tight text-center tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
