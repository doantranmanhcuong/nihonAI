'use client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckSquare, Activity, MonitorPlay } from 'lucide-react';
import { authApi } from '@/context/AuthContext';

export const AdminOverview = () => {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalShadowing: 0,
    totalReading: 0,
    totalKanji: 0,
    totalVocab: 0,
    activeUsers: 0,
    systemHealth: 'Loading...',
    charts: { days: [], userGrowth: [], examActivity: [] }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await authApi.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải thống kê...</div>;

  const statCards = [
    { title: 'Tổng Học Viên', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Hoạt động (7 ngày)', value: stats.activeUsers, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Đề Thi JLPT', value: stats.totalExams, icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Video Shadowing', value: stats.totalShadowing, icon: MonitorPlay, color: 'text-rose-600', bg: 'bg-rose-100' },
    { title: 'Bài đọc AI', value: stats.totalReading, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Tổng quan hệ thống</h2>
        <p className="text-sm text-slate-500">Thống kê dữ liệu hoạt động của toàn bộ nền tảng.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg} ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-black text-slate-800">{card.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* User Growth Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Tăng trưởng Người dùng (7 ngày qua)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.charts?.days?.map((d: string, i: number) => ({ name: d, users: stats.charts.userGrowth[i] })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="users" name="Người dùng mới" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Lượt thi (7 ngày qua)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts?.days?.map((d: string, i: number) => ({ name: d, exams: stats.charts.examActivity[i] })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="exams" name="Lượt thi" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
