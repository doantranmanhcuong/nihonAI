'use client';

import React, { useState, useEffect } from 'react';
import { authApi } from '@/context/AuthContext';
import { Settings, ShieldAlert, UserPlus, Cpu, Bot } from 'lucide-react';

export const AdminSettingsView = () => {
  const [settings, setSettings] = useState<any>({
    maintenance_mode: false,
    allow_registration: true,
    daily_ai_quota: 5,
    AI_GLOBAL_ENABLED: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await authApi.get('/admin/settings');
      if (res.data.success) {
        const d = res.data.data || {};
        setSettings({
          maintenance_mode: d.maintenance_mode === 'true',
          allow_registration: d.allow_registration !== 'false',
          daily_ai_quota: parseInt(d.daily_ai_quota ?? d.AI_LIMIT ?? '5', 10),
          AI_GLOBAL_ENABLED: d.AI_GLOBAL_ENABLED !== 'false'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authApi.put('/admin/settings', {
        maintenance_mode: settings.maintenance_mode ? 'true' : 'false',
        allow_registration: settings.allow_registration ? 'true' : 'false',
        daily_ai_quota: settings.daily_ai_quota.toString(),
        AI_LIMIT: settings.daily_ai_quota.toString(),
        AI_GLOBAL_ENABLED: settings.AI_GLOBAL_ENABLED ? 'true' : 'false'
      });
      alert('Đã lưu cài đặt hệ thống thành công!');
    } catch (err) {
      alert('Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải cài đặt...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6" /> Cài đặt hệ thống
        </h2>
        <p className="text-sm text-slate-500">Cấu hình các tham số hoạt động của toàn bộ nền tảng NihonAI.</p>
      </div>

      <div className="space-y-6">
        {/* Maintenance Mode */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Chế độ bảo trì</h3>
              <p className="text-sm text-slate-500">
                Tạm khóa truy cập của học viên để bảo trì. Tài khoản Quản trị viên (Admin) vẫn có thể đăng nhập và sử dụng bình thường.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* Allow Registration */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Mở đăng ký tài khoản mới</h3>
              <p className="text-sm text-slate-500">
                Cho phép học viên mới tạo tài khoản. Khi tắt, các tài khoản hiện có vẫn đăng nhập học tập bình thường.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.allow_registration}
              onChange={(e) => setSettings({ ...settings, allow_registration: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Global AI Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Kích hoạt Trợ lý AI toàn hệ thống</h3>
              <p className="text-sm text-slate-500">
                Cho phép học viên sử dụng tính năng Chat với NihonAI Sensei và tạo bài đọc AI theo chủ đề.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.AI_GLOBAL_ENABLED}
              onChange={(e) => setSettings({ ...settings, AI_GLOBAL_ENABLED: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* AI Quota */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Hạn mức AI miễn phí mỗi ngày</h3>
              <p className="text-sm text-slate-500">
                Số lượt tạo nội dung AI tối đa mỗi ngày của tài khoản học viên.
              </p>
            </div>
          </div>
          <div className="w-24 shrink-0 ml-3">
            <input
              type="number"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={settings.daily_ai_quota}
              onChange={(e) => setSettings({ ...settings, daily_ai_quota: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
};
