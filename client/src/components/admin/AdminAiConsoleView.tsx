'use client';
import React, { useState, useEffect } from 'react';
import { Bot, Settings } from 'lucide-react';
import { authApi } from '@/context/AuthContext';

export default function AdminAiConsoleView() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiLimit, setAiLimit] = useState<number>(5);
  const [aiGlobalEnabled, setAiGlobalEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await authApi.get('/admin/settings');
      if (res.data?.success && res.data?.data) {
        const settings = res.data.data;
        if (settings.AI_LIMIT) setAiLimit(parseInt(settings.AI_LIMIT, 10));
        if (settings.AI_GLOBAL_ENABLED) setAiGlobalEnabled(settings.AI_GLOBAL_ENABLED === 'true');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await authApi.put('/admin/settings', {
        AI_LIMIT: aiLimit.toString(),
        AI_GLOBAL_ENABLED: aiGlobalEnabled ? 'true' : 'false'
      });
      if (res.data.success) {
        alert('Đã lưu cấu hình hạn mức AI thành công!');
      }
    } catch (e) {
      alert('Lỗi khi lưu cấu hình');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const logRes = await authApi.get('/admin/ai/logs');
      if (logRes.data.success) {
        setLogs(logRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cấu hình Quản lý Lượt gọi AI (Quota & Rate Limit) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">Quản lý Hạn mức & Caching AI</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="font-bold text-emerald-900 mb-1">Cơ chế Caching 100%</h3>
              <p className="text-xs text-emerald-800">Tất cả giải thích của AI cho các câu hỏi Đọc hiểu (Dokkai) sẽ được tự động lưu vĩnh viễn vào Database. Học viên sau chỉ cần bấm Xem là có ngay giải thích mà không tốn thêm 1 Token nào của hệ thống.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới hạn yêu cầu AI / Học viên / Ngày</label>
              <div className="flex items-center gap-2">
                <input type="number" value={aiLimit} onChange={(e) => setAiLimit(parseInt(e.target.value) || 0)} className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 text-sm" />
                <span className="text-xs text-slate-500">lượt/ngày (Free API)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="global-ai" checked={aiGlobalEnabled} onChange={(e) => setAiGlobalEnabled(e.target.checked)} />
              <label htmlFor="global-ai" className="text-sm font-bold text-slate-700 cursor-pointer">Bật tính năng "Nhờ AI Giải Thích" trên toàn hệ thống</label>
            </div>
            <button onClick={handleSaveSettings} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
              Lưu cấu hình hạn mức
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Nhật ký Hoạt động AI (AI Audit Console)</h2>
        <p className="text-sm text-slate-500">Giám sát toàn bộ lượt gọi API Gemini của hệ thống (Tính năng AI Giải thích, Sinh đề thi).</p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
          <span>Nhật ký Lượt gọi AI (Audit Logs)</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-1 rounded-md">Lịch sử {logs.length} lượt tương tác</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tài khoản (Email)</th>
                <th className="px-6 py-4">Hành động / Prompt</th>
                <th className="px-6 py-4">Nội dung AI trả lời</th>
                <th className="px-6 py-4">Token SD</th>
                <th className="px-6 py-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length > 0 ? logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-600">
                    {log.user?.email || log.userId?.substring(0, 8) + '...'}
                  </td>
                  <td className="px-6 py-4 max-w-[250px] truncate" title={log.query || log.prompt}>
                    {log.query || log.prompt}
                  </td>
                  <td className="px-6 py-4 max-w-[250px] truncate text-slate-600" title={log.response}>
                    {log.response}
                  </td>
                  <td className="px-6 py-4">
                    {log.tokens ? <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{log.tokens}</span> : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Bot className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Chưa có lượt học viên nào gọi AI giải thích hoặc tạo bài.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
