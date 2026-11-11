'use client';

import React from 'react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab
}) => {
  const navItems = [
    { id: 'kanji', label: 'Hán tự' },
    { id: 'vocab', label: 'Từ vựng' },
    { id: 'grammar', label: 'Ngữ pháp' },
    { id: 'reading', label: 'Đọc hiểu' },
    { id: 'shadowing', label: 'Luyện nghe' },
    { id: 'exam', label: 'Thi thử' },
    { id: 'personal', label: 'Sổ tay' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-1.5 py-2 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
