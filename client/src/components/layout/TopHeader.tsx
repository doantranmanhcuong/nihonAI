'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Award,
  BookOpen,
  GraduationCap,
  BookOpenCheck,
  Headphones,
  Bookmark,
  Compass
} from 'lucide-react';

interface TopHeaderProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ activeTab = 'kanji', onSelectTab }) => {
  const { user, isAuthenticated, isLoading, openAuthModal, logout, revokeAllSessions, updateLevel } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isChangingLevel, setIsChangingLevel] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLevel = async (lvl: string) => {
    setIsChangingLevel(true);
    await updateLevel(lvl);
    setIsChangingLevel(false);
    setIsDropdownOpen(false);
  };

  const currentLevel = user?.targetLevel || 'N5';

  const navTabs = [
    { id: 'kanji', label: 'Hán tự', icon: Sparkles },
    { id: 'vocab', label: 'Từ vựng', icon: BookOpen },
    { id: 'grammar', label: 'Ngữ pháp', icon: GraduationCap },
    { id: 'reading', label: 'Đọc hiểu', icon: BookOpenCheck },
    { id: 'shadowing', label: 'Luyện nghe', icon: Headphones },
    { id: 'exam', label: 'Thi JLPT', icon: Award },
    { id: 'personal', label: 'Sổ tay', icon: Bookmark }
  ];

  return (
    <header id="global-top-header" className="h-[64px] bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40 px-3 sm:px-6 lg:px-8 flex items-center justify-center shadow-2xs">
      <div className="w-full max-w-7xl flex items-center justify-between">
        
        {/* 1. Logo và Trình độ hiện tại */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onSelectTab?.('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="Trang chủ NihonAI"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xs shadow-indigo-600/30">
              <span className="text-white font-black text-sm tracking-tighter">日</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">NihonAI</h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Học Tiếng Nhật Chuẩn JLPT</p>
            </div>
          </div>
        </div>

        {/* 2. Điều hướng chức năng cốt lõi (Desktop) */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-1 px-4">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab?.(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs shadow-indigo-500/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 3. Tiện ích & Hồ sơ người dùng */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoading ? (
            <div className="w-32 h-10 bg-slate-100 animate-pulse rounded-xl"></div>
          ) : !isAuthenticated || !user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-semibold text-slate-600">Khách viếng thăm</span>
              </div>
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold rounded-xl shadow-md shadow-slate-900/20 transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pr-3 rounded-2xl border border-slate-200/70 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all bg-white cursor-pointer shadow-xs"
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.displayName?.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate hidden sm:inline">
                  {user?.displayName}
                </span>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Menu Dropdown Tài khoản & Lối tắt */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Header Dropdown: Thông tin người dùng */}
                  <div className="p-3 bg-indigo-50/70 rounded-xl mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {user?.displayName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-indigo-700 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Tài khoản Học viên NihonAI</span>
                    </div>
                  </div>

                  {/* Điều hướng nhanh từ Dropdown */}
                  <div className="space-y-1 mb-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSelectTab?.('personal');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sổ tay cá nhân</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSelectTab?.('exam');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Thi thử JLPT ({currentLevel})</span>
                    </button>
                  </div>

                  {/* Quản trị hệ thống */}
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => { setIsDropdownOpen(false); onSelectTab?.('admin'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Quản trị hệ thống (Admin)</span>
                    </button>
                  )}

                  <div className="px-2 py-1.5 mb-2 border-t border-slate-100 pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Đổi trình độ mục tiêu
                    </p>
                    <div className="grid grid-cols-5 gap-1">
                      {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          disabled={isChangingLevel}
                          onClick={() => handleSelectLevel(lvl)}
                          className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                            currentLevel === lvl
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectTab?.('profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Quản lý Hồ sơ & Mật khẩu</span>
                  </button>

                  <button
                    onClick={async () => {
                      setIsDropdownOpen(false);
                      await logout();
                      onSelectTab?.('home');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất thiết bị này</span>
                  </button>

                  {/* Nút Thu hồi tất cả phiên đăng nhập */}
                  <button
                    onClick={async () => {
                      if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị (thu hồi phiên đăng nhập)?')) {
                        setIsDropdownOpen(false);
                        await revokeAllSessions();
                        onSelectTab?.('home');
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Hủy toàn bộ token JWT trên mọi thiết bị"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất mọi thiết bị</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
