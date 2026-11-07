'use client';
import React, { useState, useEffect } from 'react';
import { Bot, Settings, Save, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { authApi } from '@/context/AuthContext';

export default function AdminAiConsoleView() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPromptKey, setSavingPromptKey] = useState<string | null>(null);

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
        const limitVal = settings.daily_ai_quota ?? settings.AI_LIMIT;
        if (limitVal !== undefined) setAiLimit(parseInt(limitVal, 10));
        if (settings.AI_GLOBAL_ENABLED !== undefined) {
          setAiGlobalEnabled(settings.AI_GLOBAL_ENABLED !== 'false');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await authApi.put('/admin/settings', {
        daily_ai_quota: aiLimit.toString(),
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
      const [logRes, promptRes] = await Promise.all([
        authApi.get('/admin/ai/logs'),
        authApi.get('/admin/ai/prompts')
      ]);
      if (logRes.data.success) {
        setLogs(logRes.data.data || []);
      }
      if (promptRes.data.success) {
        setPrompts(promptRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async (promptItem: any) => {
    try {
      setSavingPromptKey(promptItem.key);
      const res = await authApi.put(`/admin/ai/prompts/${promptItem.key}`, {
        promptText: promptItem.promptText,
        isActive: promptItem.isActive
      });
      if (res.data.success) {
        alert(`Đã lưu cấu hình Prompt [${promptItem.key}] thành công!`);
      }
    } catch (err) {
      alert('Lỗi khi lưu Prompt');
    } finally {
      setSavingPromptKey(null);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử Nhật ký gọi AI không?')) return;
    try {
      const res = await authApi.delete('/admin/ai/logs');
      if (res.data.success) {
        setLogs([]);
      }
    } catch (err) {
      alert('Lỗi khi xóa nhật ký AI');
    }
  };

  const handleDeleteSingleLog = async (id: string) => {
    try {
      const res = await authApi.delete(`/admin/ai/logs/${id}`);
      if (res.data.success) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      alert('Lỗi khi xóa dòng nhật ký AI');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 1. Cấu hình Quản lý Lượt gọi AI (Quota & Rate Limit) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">Quản lý Hạn mức & Caching AI</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="font-bold text-emerald-900 mb-1">Cơ chế Caching & 0-AI YouTube Pipeline</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                • Phụ đề Video Shadowing & Dịch nghĩa tiếng Việt chạy hoàn toàn qua Kuromoji + Google Translate GTX (0 tốn quota Gemini).
                <br />• Giải thích Kanji / Từ vựng được lưu vĩnh viễn vào Database sau lần đầu tiên.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới hạn yêu cầu AI / Học viên / Ngày
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={aiLimit}
                  onChange={(e) => setAiLimit(parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 text-sm font-bold"
                />
                <span className="text-xs text-slate-500">lượt/ngày (Đồng bộ với Cài đặt hệ thống)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="global-ai"
                checked={aiGlobalEnabled}
                onChange={(e) => setAiGlobalEnabled(e.target.checked)}
              />
              <label htmlFor="global-ai" className="text-sm font-bold text-slate-700 cursor-pointer">
                Bật tính năng Trợ lý AI & Tạo bài đọc AI trên toàn hệ thống
              </label>
            </div>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Lưu cấu hình hạn mức
            </button>
          </div>
        </div>
      </div>

      {/* 2. Cấu hình System Prompts (NihonAI Sensei) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cấu hình System Prompts (NihonAI Sensei)</h2>
              <p className="text-xs text-slate-500">
                Tùy chỉnh chỉ dẫn hệ thống (System Prompt) cho trợ lý ảo và bộ phân tích ngữ pháp.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {prompts.map((item, idx) => (
            <div key={item.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-mono text-xs font-bold">
                    {item.key}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive !== false}
                      onChange={(e) => {
                        const next = [...prompts];
                        next[idx] = { ...item, isActive: e.target.checked };
                        setPrompts(next);
                      }}
                    />
                    Kích hoạt
                  </label>
                </div>
                <button
                  onClick={() => handleSavePrompt(item)}
                  disabled={savingPromptKey === item.key}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingPromptKey === item.key ? 'Đang lưu...' : 'Lưu Prompt'}
                </button>
              </div>
              <textarea
                rows={3}
                value={item.promptText || ''}
                onChange={(e) => {
                  const next = [...prompts];
                  next[idx] = { ...item, promptText: e.target.value };
                  setPrompts(next);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Nhật ký Hoạt động AI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Nhật ký Hoạt động AI (AI Audit Console)</h2>
            <p className="text-sm text-slate-500">
              Giám sát 50 lượt gọi API Gemini gần nhất của hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa lịch sử
              </button>
            )}
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
            <span>Nhật ký Lượt gọi AI (Audit Logs)</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-1 rounded-md">
              Lịch sử {logs.length} lượt tương tác
            </span>
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
                  <th className="px-6 py-4 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-600">
                        {log.user?.email || (log.userId ? log.userId.substring(0, 8) + '...' : 'System')}
                      </td>
                      <td className="px-6 py-4 max-w-[250px] truncate" title={log.query || log.prompt}>
                        {log.query || log.prompt}
                      </td>
                      <td className="px-6 py-4 max-w-[250px] truncate text-slate-600" title={log.response}>
                        {log.response}
                      </td>
                      <td className="px-6 py-4">
                        {log.tokens ? (
                          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {log.tokens}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteSingleLog(log.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa dòng nhật ký này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
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
    </div>
  );
}
