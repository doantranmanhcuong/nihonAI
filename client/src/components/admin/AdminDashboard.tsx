'use client';
import AdminAiConsoleView from './AdminAiConsoleView';
import { Settings, Activity, LayoutDashboard, Users, BookOpen, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth, isUserAdmin } from '@/context/AuthContext';
import { AdminOverview } from './AdminOverview';
import { AdminUsersView } from './AdminUsersView';
import { AdminContentView } from './AdminContentView';
import { AdminSettingsView } from './AdminSettingsView';

type AdminTab = 'overview' | 'users' | 'content' | 'ai' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const isAdmin = isUserAdmin(user);

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 mb-2"><Activity size={48} /></div>
        <h2 className="text-xl font-bold text-slate-800">Truy cập bị từ chối</h2>
        <p className="text-slate-500">Bạn không có quyền truy cập trang quản trị.</p>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'content', label: 'Nội dung & Đề thi', icon: BookOpen },
    { id: 'ai', label: 'Cấu hình AI & Logs', icon: SlidersHorizontal },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-5 w-full max-w-7xl mx-auto">
      {/* Sidebar Menu gọn gàng, đồng nhất phong cách */}
      <div className="w-full md:w-60 bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col gap-1.5 h-fit shadow-xs shrink-0">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-1 px-1 pt-1">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Admin Portal</h2>
            <p className="text-[11px] text-slate-400">Quản trị hệ thống NihonAI</p>
          </div>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 overflow-hidden min-w-0">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'users' && <AdminUsersView />}
        {activeTab === 'content' && <AdminContentView />}
        {activeTab === 'ai' && <AdminAiConsoleView />}
        {activeTab === 'settings' && <AdminSettingsView />}
      </div>
    </div>
  );
};