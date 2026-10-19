'use client';
import AdminAiConsoleView from './AdminAiConsoleView';
import { Bot, Settings, Activity, LayoutDashboard, Users, BookOpen, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminOverview } from './AdminOverview';
import { AdminUsersView } from './AdminUsersView';
import { AdminContentView } from './AdminContentView';
import { AdminSettingsView } from './AdminSettingsView';

type AdminTab = 'overview' | 'users' | 'content' | 'ai' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 mb-2"><Activity size={48} /></div>
        <h2 className="text-xl font-bold text-slate-800">Truy cập bị từ chối</h2>
        <p className="text-slate-500">Bạn không có quyền truy cập trang quản trị.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-6 w-full max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 h-fit shadow-sm">
        <div className="pb-4 border-b border-slate-100 mb-2 px-2">
          <h2 className="text-lg font-bold text-slate-800">Admin Portal</h2>
          <p className="text-xs text-slate-500">Quản trị hệ thống NihonAI</p>
        </div>
        
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" /> Người dùng
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'content' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Tài liệu & Đề thi
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'ai' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bot className="w-4 h-4" /> AI Console
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" /> Cài đặt
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'users' && <AdminUsersView />}
        {activeTab === 'content' && <AdminContentView />}
        {activeTab === 'ai' && <AdminAiConsoleView />}
        {activeTab === 'settings' && <AdminSettingsView />}
      </div>
    </div>
  );
};