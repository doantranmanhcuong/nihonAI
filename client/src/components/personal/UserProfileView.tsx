'use client';

import React, { useState, useEffect } from 'react';
import { authApi, useAuth } from '@/context/AuthContext';
import {
  User,
  Lock,
  Save,
  Shield,
  Flame,
  Target,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  Smartphone,
  Check,
  Sparkles,
  Volume2,
  Calendar,
  Sliders,
  BarChart3,
  CheckCircle,
  XCircle,
  ExternalLink,
  Play
} from 'lucide-react';
import {
  UserPreferences,
  getStudyPreferences,
  saveStudyPreferences,
  speakJapanese,
  playFeedbackSound
} from '@/utils/studyPreferences';

interface LearningSummary {
  user: {
    id: string;
    email: string;
    displayName: string;
    targetLevel: string;
    avatar: string | null;
    role: string;
    status: string;
    isEmailVerified: boolean;
    studyStreak: number;
    lastStudyDate: string | null;
    lastLoginAt: string | null;
    createdAt: string;
  };
  notebook: {
    total: number;
    vocabCount: number;
    kanjiCount: number;
    grammarCount: number;
    noteCount: number;
    masteredCount: number;
    reviewingCount: number;
    learningCount: number;
  };
  exams: {
    totalAttempts: number;
    passedAttempts: number;
    highestScore: number;
    recentAttempts: Array<{
      id: string;
      examTitle: string;
      level: string;
      year: number;
      session: string;
      totalScore: number;
      totalCorrect: number;
      totalQuestions: number;
      isPassed: boolean;
      createdAt: string;
    }>;
  };
}

const PRESET_AVATARS = [
  { name: 'Samurai', label: 'Võ sĩ Samurai', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Samurai' },
  { name: 'Ninja', label: 'Nhẫn giả Ninja', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ninja' },
  { name: 'Sakura', label: 'Hoa Anh Đào', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sakura' },
  { name: 'Shiba', label: 'Chú chó Shiba', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shiba' },
  { name: 'Miko', label: 'Vu nữ Miko', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Miko' },
  { name: 'Sensei', label: 'Thầy Sensei', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sensei' },
  { name: 'Tokyo', label: 'Khám phá Tokyo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tokyo' },
  { name: 'Fuji', label: 'Núi Phú Sĩ', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fuji' },
];

const JLPT_LEVELS = [
  { level: 'N5', title: 'Nhập môn', desc: 'Kiến thức sơ cấp căn bản (Hiragana, Katakana, ~100 Kanji)' },
  { level: 'N4', title: 'Sơ cấp', desc: 'Giao tiếp tình huống hàng ngày (~300 Kanji, ~1500 từ vựng)' },
  { level: 'N3', title: 'Trung cấp', desc: 'Hiểu các bài văn đời sống, tin tức ngắn (~650 Kanji)' },
  { level: 'N2', title: 'Trung cao', desc: 'Giao tiếp thành thạo, đọc báo chí và làm việc (~1000 Kanji)' },
  { level: 'N1', title: 'Cao cấp', desc: 'Trình độ bản ngữ, bài luận xã hội, chuyên ngành (~2000 Kanji)' },
];

interface UserProfileViewProps {
  onNavigate?: (tab: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, isLoading, openAuthModal, updateProfile, logout, revokeAllSessions } = useAuth();

  // Tự động điều hướng về trang chủ nếu chưa đăng nhập hoặc vừa đăng xuất
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      if (onNavigate) {
        onNavigate('home');
      } else {
        window.location.hash = '#home';
      }
    }
  }, [isLoading, isAuthenticated, user, onNavigate]);

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'analytics' | 'security'>('profile');

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [targetLevel, setTargetLevel] = useState(user?.targetLevel || 'N5');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => getStudyPreferences());

  // Summary / Stats state
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Loading & notification states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingRevoke, setLoadingRevoke] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setTargetLevel(user.targetLevel || 'N5');
      if (user.avatar) setSelectedAvatar(user.avatar);
    }
  }, [user]);

  // Load summary data
  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await authApi.get('/auth/me/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Save Preferences
  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    saveStudyPreferences(updated);
    setMsg({ type: 'success', text: 'Đã lưu và áp dụng thiết lập tùy biến học tập trên toàn hệ thống!' });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // Submit Profile Changes
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      return setMsg({ type: 'error', text: 'Tên hiển thị không được để trống' });
    }

    try {
      setLoadingProfile(true);
      const avatarToSave = customAvatarUrl.trim() || selectedAvatar;
      const res = await updateProfile({
        displayName: displayName.trim(),
        targetLevel,
        avatar: avatarToSave
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        fetchSummary();
      } else {
        setMsg({ type: 'error', text: res.message || 'Lỗi cập nhật' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi cập nhật hồ sơ' });
    } finally {
      setLoadingProfile(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      return setMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại' });
    }
    if (newPassword.length < 6) {
      return setMsg({ type: 'error', text: 'Mật khẩu mới phải dài ít nhất 6 ký tự' });
    }
    if (newPassword !== confirmPassword) {
      return setMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp' });
    }

    try {
      setLoadingPassword(true);
      const res = await authApi.patch('/auth/me/password', { currentPassword, newPassword });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi đổi mật khẩu' });
    } finally {
      setLoadingPassword(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    }
  };

  // Revoke All Other Sessions
  const handleRevokeAllSessions = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) {
      return;
    }
    try {
      setLoadingRevoke(true);
      const success = await revokeAllSessions();
      if (success) {
        setMsg({ type: 'success', text: 'Đã hủy phiên đăng nhập trên các thiết bị khác.' });
        setTimeout(() => {
          if (onNavigate) onNavigate('home');
          else window.location.hash = '#home';
        }, 1000);
      } else {
        setMsg({ type: 'error', text: 'Không thể thu hồi các phiên đăng nhập.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Lỗi khi thu hồi phiên.' });
    } finally {
      setLoadingRevoke(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    }
  };

  const streakDays = summary?.user?.studyStreak ?? user?.studyStreak ?? 0;
  const currentAvatar = customAvatarUrl.trim() || selectedAvatar || user?.avatar || PRESET_AVATARS[0].url;

  if (!isLoading && (!isAuthenticated || !user)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Bạn chưa đăng nhập</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Vui lòng đăng nhập để truy cập trang thông tin và quản lý hồ sơ cá nhân của bạn.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn py-2 sm:py-4 px-2 sm:px-4">
      {/* 1. HERO PROFILE CARD */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Preview */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur-md p-1 border-2 border-indigo-400/30 shadow-lg overflow-hidden flex items-center justify-center">
              <img
                src={currentAvatar}
                alt="Avatar"
                className="w-full h-full object-contain rounded-xl transform transition-transform group-hover:scale-105"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white shadow-sm border border-indigo-300">
              {targetLevel}
            </span>
          </div>

          {/* User Basic Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {user?.displayName || 'Học viên NihonAI'}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Học viên JLPT {targetLevel}
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium flex items-center justify-center md:justify-start gap-2">
              <span>{user?.email}</span>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực
                </span>
              ) : (
                <span className="text-amber-400 text-xs font-semibold">Chưa xác thực</span>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Gia nhập: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '2026'}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Vai trò: {user?.role === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Người học (Member)'}
              </span>
            </div>
          </div>

          {/* 4 Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
            {/* Streak */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                <span className="text-lg font-black">{streakDays}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-300">Chuỗi ngày</p>
            </div>

            {/* Target Level */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-indigo-300 mb-0.5">
                <Target className="w-4 h-4" />
                <span className="text-lg font-black">{targetLevel}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-300">Mục tiêu</p>
            </div>

            {/* Notebook Items */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <BookOpen className="w-4 h-4" />
                <span className="text-lg font-black">{summary?.notebook?.total ?? '--'}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-300">Mục sổ tay</p>
            </div>

            {/* Exam Score */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-rose-400 mb-0.5">
                <Award className="w-4 h-4" />
                <span className="text-lg font-black">{summary?.exams?.highestScore ?? '--'}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-300">Điểm thi cao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Alerts / Messages */}
      {msg.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Hồ sơ & Mục tiêu</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Tùy biến học tập</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analytics');
            if (!summary) fetchSummary();
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tiến độ & Kết quả thi</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Bảo mật & Phiên</span>
        </button>
      </div>

      {/* 3. TAB 1: THÔNG TIN CÁ NHÂN & MỤC TIÊU */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột 1: Chọn Avatar */}
            <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Ảnh đại diện (Avatar)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn hình ảnh phong cách Nhật Bản độc đáo hoặc nhập link avatar riêng
                </p>
              </div>

              {/* Grid 8 avatars */}
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.url && !customAvatarUrl;
                  return (
                    <button
                      key={av.name}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative p-1.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 group ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                      title={av.label}
                    >
                      <img src={av.url} alt={av.name} className="w-10 h-10 object-contain rounded-xl" />
                      <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">
                        {av.name}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Avatar URL */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Hoặc dán URL ảnh cá nhân
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Cột 2 & 3: Tên hiển thị & Cấp độ JLPT Mục tiêu */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  Thông tin học tập cá nhân
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tùy chỉnh thông tin để NihonAI cá nhân hóa lộ trình và tài liệu cho bạn
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email (Readonly) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Địa chỉ Email (Định danh tài khoản)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 font-medium cursor-not-allowed"
                  />
                </div>

                {/* Tên hiển thị */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Tên hiển thị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên bạn muốn hiển thị"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Trình độ JLPT Mục tiêu */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Trình độ JLPT Mục Tiêu Hiện Tại
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {JLPT_LEVELS.map((item) => {
                    const isSelected = targetLevel === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setTargetLevel(item.level)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-lg font-black ${
                              isSelected ? 'text-indigo-600' : 'text-slate-800'
                            }`}
                          >
                            {item.level}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút lưu */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Thay đổi sẽ được áp dụng ngay lập tức trên hệ thống
                </p>
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/25 active:scale-95"
                >
                  {loadingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loadingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 4. TAB 2: TÙY BIẾN HỌC TẬP & TRẢI NGHIỆM */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Furigana Display */}
          <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hiển thị Furigana (Cách đọc chữ Hán)</h3>
                <p className="text-xs text-slate-500">Quy định cách hiển thị phiên âm chữ Hán trong bài học</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { key: 'always', title: 'Luôn hiển thị (Khuyên dùng)', desc: 'Hiện cách đọc Furigana trên mọi Hán tự trong bài học và tin tức' },
                { key: 'hover', title: 'Chỉ hiển thị khi chạm / di chuột', desc: 'Rèn luyện phản xạ nhớ mặt chữ Kanji trước khi xem đáp án' },
                { key: 'hidden', title: 'Ẩn hoàn toàn', desc: 'Dành cho người học nâng cao muốn thử thách đọc hiểu chuyên sâu' },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    preferences.furiganaMode === opt.key
                      ? 'border-indigo-600 bg-indigo-50/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="furiganaMode"
                    value={opt.key}
                    checked={preferences.furiganaMode === opt.key}
                    onChange={() => handlePreferenceChange('furiganaMode', opt.key)}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">{opt.title}</span>
                    <span className="text-xs text-slate-500">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Voice TTS Speed */}
          <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tốc độ phát âm giọng đọc (TTS)</h3>
                <p className="text-xs text-slate-500">Tốc độ đọc mẫu các câu văn, từ vựng và bài đọc hiểu</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { speed: '0.8', title: '0.8x - Chậm & Rõ ràng', desc: 'Thích hợp cho người mới bắt đầu luyện ngữ điệu và phát âm chuẩn' },
                { speed: '1.0', title: '1.0x - Chuẩn bản xứ (Mặc định)', desc: 'Tốc độ giao tiếp tự nhiên của người Nhật hàng ngày' },
                { speed: '1.2', title: '1.2x - Nhanh & Thử thách', desc: 'Luyện tai nghe phản xạ cho kỳ thi JLPT N2, N1 và thực tế' },
              ].map((opt) => (
                <label
                  key={opt.speed}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    preferences.ttsSpeed === opt.speed
                      ? 'border-blue-600 bg-blue-50/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="ttsSpeed"
                    value={opt.speed}
                    checked={preferences.ttsSpeed === opt.speed}
                    onChange={() => handlePreferenceChange('ttsSpeed', opt.speed)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">{opt.title}</span>
                    <span className="text-xs text-slate-500">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SRS Notebook Review Mode */}
          <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Chế độ ôn tập Sổ tay ưu tiên</h3>
                <p className="text-xs text-slate-500">Định dạng mặc định khi bắt đầu phiên ôn luyện SRS</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { mode: 'flashcard', title: 'Thẻ Flashcard lật 2 mặt', desc: 'Truyền thống, ghi nhớ sâu qua phương pháp ngắt quãng Leitner' },
                { mode: 'quiz', title: 'Trắc nghiệm phản xạ 4 đáp án', desc: 'Kiểm tra tốc độ nhận diện ngữ nghĩa và cách đọc cấp tốc' },
              ].map((opt) => (
                <label
                  key={opt.mode}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    preferences.reviewMode === opt.mode
                      ? 'border-amber-500 bg-amber-50/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reviewMode"
                    value={opt.mode}
                    checked={preferences.reviewMode === opt.mode}
                    onChange={() => handlePreferenceChange('reviewMode', opt.mode)}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">{opt.title}</span>
                    <span className="text-xs text-slate-500">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Audio Feedback / Sound Effects */}
          <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hiệu ứng âm thanh tương tác</h3>
                <p className="text-xs text-slate-500">Phát âm thanh sinh động khi trả lời bài tập và thăng hạng</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Âm thanh phản hồi kết quả</span>
                  <span className="text-xs text-slate-500">Tiếng chuông chúc mừng đúng hoặc nhắc nhở sai</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => handlePreferenceChange('soundEffects', e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* PHÒNG THỬ NGHIỆM TƯƠNG TÁC (LIVE PREVIEW & TESTING PLAYGROUND) */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Phòng Thử Nghiệm Trực Quan (Live Interactive Playground)
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Thời gian thực
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-200/80">
                    Thử nghiệm ngay lập tức các hiệu ứng phát âm, hiển thị Furigana và âm thanh bạn vừa chọn
                  </p>
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('notebook')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Mở Sổ tay SRS</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Card 1: Thử nghiệm Furigana */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    1. Hiển thị Furigana
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-bold">
                    {preferences.furiganaMode}
                  </span>
                </div>
                
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 text-center select-none min-h-[75px] flex items-center justify-center">
                  <p className="text-xl font-bold leading-relaxed text-amber-200">
                    <ruby className="cursor-pointer">私<rt className="text-xs text-amber-400">わたし</rt></ruby>は
                    <ruby className="cursor-pointer">日本語<rt className="text-xs text-amber-400">にほんご</rt></ruby>を
                    <ruby className="cursor-pointer">勉強<rt className="text-xs text-amber-400">べんきょう</rt></ruby>します。
                  </p>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                  {preferences.furiganaMode === 'always' && (
                    <p className="text-emerald-300">✅ <strong>Luôn hiển thị:</strong> Chữ phiên âm Hiragana nhỏ luôn hiển thị phía trên Hán tự.</p>
                  )}
                  {preferences.furiganaMode === 'hover' && (
                    <p className="text-amber-300">👆 <strong>Di chuột/Chạm:</strong> Furigana đang ẩn. Hãy <strong>rê chuột hoặc chạm</strong> vào chữ Hán ở trên để hiện cách đọc!</p>
                  )}
                  {preferences.furiganaMode === 'hidden' && (
                    <p className="text-rose-300">🙈 <strong>Ẩn hoàn toàn:</strong> Furigana đã được ẩn triệt để để bạn tự lực nhớ mặt chữ.</p>
                  )}
                </div>
              </div>

              {/* Card 2: Thử nghiệm Giọng đọc TTS */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      2. Giọng đọc Tiếng Nhật (TTS)
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-bold">
                      {preferences.ttsSpeed}x tốc độ
                    </span>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
                    <p className="text-sm font-semibold text-slate-200">
                      「こんにちは、日本語の勉強を頑張りましょう！」
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      (Xin chào, chúc bạn học tập tiếng Nhật thật tốt!)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakJapanese('こんにちは、日本語の勉強を頑張りましょう！')}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Nghe Thử Phát Âm Chuẩn ({preferences.ttsSpeed}x)</span>
                </button>
              </div>

              {/* Card 3: Thử nghiệm Hiệu ứng âm thanh & Sổ tay */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      3. Âm Thanh Phản Hồi
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      preferences.soundEffects 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : 'bg-rose-950 text-rose-300 border-rose-800/60'
                    }`}>
                      {preferences.soundEffects ? 'Đang BẬT' : 'Đang TẮT'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Chuông báo thông minh qua Web Audio API không tốn băng thông, phát tức thì khi làm bài:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => playFeedbackSound(true)}
                      className="py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chuông ĐÚNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => playFeedbackSound(false)}
                      className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Chuông SAI</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Chế độ ôn tập SRS:</span>
                  <span className="font-bold text-amber-300">
                    {preferences.reviewMode === 'flashcard' ? '🃏 Flashcard 2 mặt' : '🎯 Trắc nghiệm 4 đáp án'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: TIẾN ĐỘ & KẾT QUẢ THI */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loadingSummary ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Đang đồng bộ thống kê học tập...</p>
            </div>
          ) : (
            <>
              {/* Thống kê Sổ tay & Trạng thái SRS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phân loại mục sổ tay */}
                <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Phân bố mục sổ tay ({summary?.notebook?.total || 0})
                      </h3>
                      <p className="text-xs text-slate-500">Tổng hợp kiến thức đã lưu trữ trong Sổ tay cá nhân</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-indigo-700">Từ vựng (Vocab)</p>
                        <p className="text-2xl font-black text-indigo-900">{summary?.notebook?.vocabCount || 0}</p>
                      </div>
                      <span className="text-xl">📖</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-amber-700">Hán tự (Kanji)</p>
                        <p className="text-2xl font-black text-amber-900">{summary?.notebook?.kanjiCount || 0}</p>
                      </div>
                      <span className="text-xl">🈴</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-emerald-700">Ngữ pháp (Grammar)</p>
                        <p className="text-2xl font-black text-emerald-900">{summary?.notebook?.grammarCount || 0}</p>
                      </div>
                      <span className="text-xl">⛩️</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-purple-700">Ghi chú & Mẹo</p>
                        <p className="text-2xl font-black text-purple-900">{summary?.notebook?.noteCount || 0}</p>
                      </div>
                      <span className="text-xl">📝</span>
                    </div>
                  </div>
                </div>

                {/* Trạng thái SRS Mastery */}
                <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Tiến trình ghi nhớ SRS (Spaced Repetition)
                    </h3>
                    <p className="text-xs text-slate-500">Mức độ nhuần nhuyễn của các mục trong sổ tay</p>
                  </div>

                  <div className="space-y-4">
                    {/* Đã thuộc */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã thuộc (Mastered)
                        </span>
                        <span className="text-emerald-800">{summary?.notebook?.masteredCount || 0} mục</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              summary?.notebook?.total
                                ? ((summary.notebook.masteredCount / summary.notebook.total) * 100).toFixed(0)
                                : 0
                            }%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Cần ôn lại */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-amber-700 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Cần ôn lại (Reviewing)
                        </span>
                        <span className="text-amber-800">{summary?.notebook?.reviewingCount || 0} mục</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              summary?.notebook?.total
                                ? ((summary.notebook.reviewingCount / summary.notebook.total) * 100).toFixed(0)
                                : 0
                            }%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Đang học */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-blue-700 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" /> Mới học (Learning)
                        </span>
                        <span className="text-blue-800">{summary?.notebook?.learningCount || 0} mục</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              summary?.notebook?.total
                                ? ((summary.notebook.learningCount / summary.notebook.total) * 100).toFixed(0)
                                : 0
                            }%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lịch sử thi thử JLPT gần đây */}
              <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-rose-500" />
                      Kết quả thi thử JLPT gần đây
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tổng số bài thi: {summary?.exams?.totalAttempts || 0} | Đạt chuẩn đỗ:{' '}
                      {summary?.exams?.passedAttempts || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                      Điểm cao nhất: {summary?.exams?.highestScore || 0}/180
                    </span>
                  </div>
                </div>

                {summary?.exams?.recentAttempts && summary.exams.recentAttempts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-3">Bài thi & Cấp độ</th>
                          <th className="py-3 px-3 text-center">Số câu đúng</th>
                          <th className="py-3 px-3 text-center">Tổng điểm</th>
                          <th className="py-3 px-3 text-center">Kết quả</th>
                          <th className="py-3 px-3 text-right">Ngày thi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {summary.exams.recentAttempts.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-black text-[11px] border border-indigo-200">
                                  {att.level}
                                </span>
                                <span className="font-bold text-slate-800">{att.examTitle}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center font-medium text-slate-600">
                              {att.totalCorrect}/{att.totalQuestions}
                            </td>
                            <td className="py-3.5 px-3 text-center font-black text-slate-900 text-sm">
                              {att.totalScore}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {att.isPassed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" /> ĐỖ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                                  <XCircle className="w-3 h-3 text-rose-600" /> CHƯA ĐẠT
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right text-slate-500 font-medium">
                              {new Date(att.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <Award className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Chưa có lịch sử làm bài thi thử nào</p>
                    <p className="text-[11px] text-slate-400">
                      Hãy chuyển sang phân hệ "Thi Thử JLPT" để bấm giờ làm đề và đánh giá năng lực!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 6. TAB 4: BẢO MẬT & QUẢN LÝ PHIÊN */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột 1 & 2: Form Đổi Mật Khẩu */}
          <form
            onSubmit={handleChangePassword}
            className="lg:col-span-2 bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-5"
          >
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                Đổi mật khẩu tài khoản
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mật khẩu mới cần dài ít nhất 6 ký tự để bảo vệ tài khoản của bạn
              </p>
            </div>

            <div className="space-y-4">
              {/* Mật khẩu hiện tại */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang sử dụng"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nhập lại mật khẩu mới */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Xác nhận lại mật khẩu mới
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loadingPassword}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-slate-900/20 active:scale-95"
              >
                {loadingPassword ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{loadingPassword ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>

          {/* Cột 3: Quản lý thiết bị & Phiên làm việc */}
          <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  Quản lý phiên đăng nhập
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm soát các phiên làm việc và bảo mật tài khoản từ xa
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Trạng thái bảo mật</span>
                </div>
                <p className="text-slate-500">
                  Tài khoản đang được bảo vệ bởi JWT Token mã hóa và kiểm tra phiên tự động.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRevokeAllSessions}
                disabled={loadingRevoke}
                className="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  {loadingRevoke ? 'Đang thu hồi...' : 'Đăng xuất khỏi tất cả thiết bị khác'}
                </span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  if (onNavigate) onNavigate('home');
                  else window.location.hash = '#home';
                }}
                className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span>Đăng xuất tài khoản này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
