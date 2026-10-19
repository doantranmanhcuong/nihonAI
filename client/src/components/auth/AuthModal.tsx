'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  GraduationCap, ShieldCheck
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
    forgotPassword,
    resetPassword,
    loginDemo
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetLevel, setTargetLevel] = useState('N5');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái cho luồng Quên mật khẩu & Xác thực
  const [resetStep, setResetStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [resetCode, setResetCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyDebugCode, setVerifyDebugCode] = useState('');
  const { verifyEmail, resendVerifyEmail } = useAuth();
  const [newPassword, setNewPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMessage('');
    setSuccessMessage('');
    setShowPassword(false);
    setResetStep('REQUEST');
    setResetCode('');
    setVerifyCode('');
    setVerifyDebugCode('');
    setNewPassword('');
  };

  const handleSwitchTab = (tab: 'login' | 'register' | 'forgot') => {
    resetForm();
    openAuthModal(tab);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (authModalTab === 'verify') {
        const res = await verifyEmail(email, verifyCode);
        if (res.success) {
          setSuccessMessage(res.message || 'Xác thực thành công!');
        } else {
          setErrorMessage(res.message || 'Xác thực thất bại.');
        }
      } else if (authModalTab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Đăng nhập thất bại.');
        }
      } else if (authModalTab === 'register') {
        const res = await register(email, password, displayName, targetLevel);
        if (res.success) {
          if (res.debugCode) {
            setVerifyDebugCode(res.debugCode);
          }
        } else {
          setErrorMessage(res.message || 'Đăng ký thất bại.');
        }
      } else if (authModalTab === 'forgot' || authModalTab === 'verify') {
        if (resetStep === 'REQUEST') {
          const res = await forgotPassword(email);
          if (res.success) {
            setSuccessMessage(res.message);
            if (res.debugCode) {
              setResetCode(res.debugCode);
            }
            setResetStep('VERIFY');
          } else {
            setErrorMessage(res.message || 'Không thể gửi yêu cầu.');
          }
        } else {
          const res = await resetPassword(email, resetCode, newPassword);
          if (!res.success) {
            setErrorMessage(res.message || 'Đặt lại mật khẩu thất bại.');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      // Giả lập hoặc liên kết Google OAuth 2.0 (Xác thực bên thứ 3)
      const targetGoogleEmail = email && email.includes('@') ? email : 'student.nihonai@gmail.com';
      const targetName = displayName || targetGoogleEmail.split('@')[0];

      const res = await loginWithGoogle({
        email: targetGoogleEmail,
        displayName: targetName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(targetName)}`,
        googleId: `google_oauth_sub_${Math.random().toString(36).substring(2, 10)}`
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Xác thực Google thất bại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const res = await loginDemo();
      if (!res.success) {
        setErrorMessage(res.message || 'Không thể đăng nhập Demo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng Modal */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Phần Đầu (Header Modal) */}
        <div className="p-6 pb-4 text-center bg-gradient-to-b from-indigo-50/70 to-white border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-indigo-600 rounded-2xl text-white font-black text-2xl shadow-md shadow-indigo-200">
            日
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {authModalTab === 'login'
              ? 'Đăng nhập vào NihonAI'
              : authModalTab === 'verify' ? 'Xác thực Email' : authModalTab === 'register'
              ? 'Tạo tài khoản học tập'
              : 'Khôi phục mật khẩu tài khoản'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {authModalTab === 'forgot'
              ? 'Mã xác thực OTP có hiệu lực trong 15 phút qua Redis Cache'
              : 'Nền tảng học tiếng Nhật thông minh ứng dụng AI & Khoa học nhận thức'}
          </p>

          {/* Thanh chuyển Tab (Chỉ hiện khi login hoặc register) */}
          {authModalTab !== 'forgot' && authModalTab !== 'verify' && (
            <div className="flex p-1 mt-4 bg-slate-100/90 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalTab === 'login'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTab('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalTab === 'register'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng ký mới
              </button>
            </div>
          )}
        </div>

        {/* Nội dung Form */}
        <div className="p-6 pt-4 space-y-4">
          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Thông báo thành công nếu có */}
          {successMessage && (
            <div className="flex items-start gap-2.5 p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORM 1: QUÊN MẬT KHẨU (FORGOT PASSWORD OTP FLOW) */}
          
            {authModalTab === 'verify' ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 text-center">
                  Mã OTP 6 số đã được gửi tới email <b>{email}</b>. (Có hiệu lực trong 15 phút)
                </div>

                {verifyDebugCode && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold">💡 Mã xác thực thử nghiệm (Dev):</p>
                      <p className="font-mono text-base font-black tracking-widest text-amber-900 mt-0.5">{verifyDebugCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVerifyCode(verifyDebugCode)}
                      className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 rounded-lg text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                    >
                      Tự động điền
                    </button>
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700">Mã xác thực OTP</label>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="w-full h-10 px-4 text-center text-lg tracking-[0.5em] font-bold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="------"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || verifyCode.length !== 6}
                  className="w-full h-11 inline-flex items-center justify-center font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-sm rounded-xl transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? 'Đang xác thực...' : 'Xác Thực Tài Khoản'}
                </button>
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={async () => {
                      setErrorMessage('');
                      const res = await resendVerifyEmail(email);
                      if (res.success) {
                        setSuccessMessage(res.message || 'Đã gửi lại OTP');
                        if (res.debugCode) setVerifyDebugCode(res.debugCode);
                      } else {
                        setErrorMessage(res.message || 'Lỗi gửi lại OTP');
                      }
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </form>
            ) : authModalTab === 'forgot' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {resetStep === 'REQUEST' ? (
                <>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-slate-700">
                      Địa chỉ Email tài khoản
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="VD: ban@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Gửi mã xác thực OTP (15 phút)
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-slate-700">
                      Mã OTP xác thực 6 số (Lưu trên Redis TTL 15 phút)
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Nhập mã 6 số (VD: 123456)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-mono text-center tracking-widest text-base font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-slate-700">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Xác nhận & Đổi mật khẩu ngay
                      </>
                    )}
                  </button>
                </>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchTab('login')}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  ← Quay lại Đăng nhập
                </button>
              </div>
            </form>
          ) : (
            /* FORM 2: ĐĂNG NHẬP / ĐĂNG KÝ TRUYỀN THỐNG */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalTab === 'register' && (
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700">
                    Họ và tên hiển thị
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nhap@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('forgot')}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Chọn trình độ mục tiêu (Khi Đăng ký) */}
              {authModalTab === 'register' && (
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700">
                    Mục tiêu JLPT hiện tại
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          targetLevel === lvl
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút bấm Đăng nhập / Đăng ký */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : authModalTab === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Tạo tài khoản học ngay
                  </>
                )}
              </button>
            </form>
          )}

          {/* Đường ngăn cách */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute px-3 text-[10px] font-medium text-slate-400 bg-white">
              HOẶC XÁC THỰC BÊN THỨ 3
            </span>
          </div>

          {/* Nút Đăng nhập / Khôi phục qua Google OAuth 2.0 (Third-Party Identity) */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 active:scale-[0.99] text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            title="Đăng nhập hoặc khôi phục tài khoản qua Google OAuth 2.0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Tiếp tục với tài khoản Google</span>
          </button>

          

          {authModalTab !== 'forgot' && (
            <p className="text-[11px] text-center text-slate-400">
              {authModalTab === 'login' ? (
                <>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('register')}
                    className="font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('login')}
                    className="font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
