'use client';

import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

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
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft
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
    verifyEmail,
    resendVerifyEmail
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetLevel, setTargetLevel] = useState('N5');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái cho luồng Quên mật khẩu & Xác thực OTP
  const [resetStep, setResetStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [resetCode, setResetCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyDebugCode, setVerifyDebugCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Nạp trước Google Identity SDK khi mở Modal
  useEffect(() => {
    if (!isAuthModalOpen) return;
    if (typeof window === 'undefined' || window.google?.accounts?.oauth2) return;

    let script = document.getElementById('google-gsi-client') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [isAuthModalOpen]);

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
      } else if (authModalTab === 'forgot') {
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

  // Kích hoạt Google OAuth 2.0 Popup
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setErrorMessage(
        'Tính năng đăng nhập Google yêu cầu Google Client ID. Vui lòng cấu hình OAuth Client ID trong Google Cloud Console và biến môi trường NEXT_PUBLIC_GOOGLE_CLIENT_ID.'
      );
      return;
    }

    setIsSubmitting(true);

    const openPopup = () => {
      try {
        if (!window.google?.accounts?.oauth2) {
          throw new Error('Google Identity SDK chưa sẵn sàng.');
        }

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsSubmitting(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setErrorMessage('Xác thực Google thất bại: ' + tokenResponse.error);
              }
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await loginWithGoogle({ accessToken: tokenResponse.access_token });
                if (!res.success) {
                  setErrorMessage(res.message || 'Xác thực tài khoản Google thất bại.');
                }
              } catch (err: any) {
                setErrorMessage(err?.message || 'Lỗi gửi xác thực Google: ' + err.message);
              } finally {
                setIsSubmitting(false);
              }
            } else {
              setIsSubmitting(false);
            }
          },
          error_callback: () => {
            setIsSubmitting(false);
            setErrorMessage(
              'Trình duyệt đã chặn cửa sổ Popup của Google. Vui lòng bấm vào biểu tượng chặn Popup ở thanh địa chỉ hoặc tắt AdBlock / Brave Shields để tiếp tục.'
            );
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage('Không thể mở cửa sổ Google: ' + (err.message || 'Lỗi không xác định'));
      }
    };

    if (window.google?.accounts?.oauth2) {
      openPopup();
    } else {
      let script = document.getElementById('google-gsi-client') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      const timer = setTimeout(() => {
        setIsSubmitting(false);
        setErrorMessage('Kết nối tới dịch vụ Google quá thời gian. Vui lòng kiểm tra mạng hoặc tắt AdBlock/Brave Shields.');
      }, 6000);

      script.addEventListener('load', () => {
        clearTimeout(timer);
        setTimeout(openPopup, 50);
      }, { once: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng Modal */}
        <button
          onClick={closeAuthModal}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Phần Đầu (Header) */}
        <div className="px-6 pt-6 pb-4 text-center bg-gradient-to-b from-indigo-50/60 to-white">
          <div className="inline-flex items-center justify-center w-10 h-10 mb-2 bg-indigo-600 rounded-xl text-white font-black text-xl shadow-md shadow-indigo-100">
            日
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {authModalTab === 'login'
              ? 'Đăng nhập NihonAI'
              : authModalTab === 'register'
              ? 'Tạo tài khoản học tập'
              : authModalTab === 'verify'
              ? 'Xác thực Email'
              : 'Khôi phục mật khẩu'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {authModalTab === 'forgot'
              ? 'Mã OTP khôi phục được gửi qua email của bạn'
              : authModalTab === 'verify'
              ? 'Nhập mã 6 chữ số để kích hoạt tài khoản'
              : 'Nền tảng học tiếng Nhật thông minh chuẩn JLPT'}
          </p>

          {/* Thanh chuyển Tab Đăng nhập / Đăng ký */}
          {authModalTab !== 'forgot' && authModalTab !== 'verify' && (
            <div className="grid grid-cols-2 p-1 mt-3.5 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'login'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTab('register')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'register'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng ký mới
              </button>
            </div>
          )}
        </div>

        {/* Thân Form */}
        <div className="px-6 pb-6 pt-1 space-y-3.5">
          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMessage && (
            <div className="flex items-start gap-2 p-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* TAB: XÁC THỰC EMAIL (OTP) */}
          {authModalTab === 'verify' ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 text-center">
                Mã OTP 6 số đã được gửi tới <b>{email}</b>
              </div>

              {verifyDebugCode && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[11px]">Mã thử nghiệm:</p>
                    <p className="font-mono text-sm font-bold tracking-widest text-amber-900">{verifyDebugCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerifyCode(verifyDebugCode)}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                  >
                    Tự điền
                  </button>
                </div>
              )}

              <div>
                <label className="block mb-1 text-[11px] font-semibold text-slate-700">Mã xác thực OTP</label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full h-10 text-center text-lg tracking-[0.4em] font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  placeholder="------"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || verifyCode.length !== 6}
                className="w-full h-10 mt-1 inline-flex items-center justify-center font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Đang xác thực...' : 'Xác thực tài khoản'}
              </button>

              <div className="text-center pt-1">
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
                  className="text-xs text-indigo-600 hover:underline cursor-pointer font-medium"
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          ) : authModalTab === 'forgot' ? (
            /* TAB: QUÊN MẬT KHẨU */
            <form onSubmit={handleSubmit} className="space-y-3">
              {resetStep === 'REQUEST' ? (
                <>
                  <div>
                    <label className="block mb-1 text-[11px] font-semibold text-slate-700">Email tài khoản</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-3 h-9.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Gửi mã xác thực OTP
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-1 text-[11px] font-semibold text-slate-700">Mã OTP 6 số</label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="VD: 123456"
                      className="w-full h-9.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-mono text-center tracking-widest font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] font-semibold text-slate-700">Mật khẩu mới</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-9 pr-9 h-9.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Xác nhận đổi mật khẩu
                      </>
                    )}
                  </button>
                </>
              )}

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchTab('login')}
                  className="text-xs text-indigo-600 hover:underline cursor-pointer font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Quay lại đăng nhập
                </button>
              </div>
            </form>
          ) : (
            /* TAB: ĐĂNG NHẬP / ĐĂNG KÝ */
            <form onSubmit={handleSubmit} className="space-y-3">
              {authModalTab === 'register' && (
                <div>
                  <label className="block mb-1 text-[11px] font-semibold text-slate-700">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full pl-9 pr-3 h-9.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-[11px] font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 h-9.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">Mật khẩu</label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('forgot')}
                      className="text-[11px] font-medium text-indigo-600 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-9 h-9.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Chọn trình độ JLPT mục tiêu khi Đăng ký */}
              {authModalTab === 'register' && (
                <div>
                  <label className="block mb-1 text-[11px] font-semibold text-slate-700">Mục tiêu JLPT</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`h-8 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
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

              {/* Nút bấm Submit chính */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 mt-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : authModalTab === 'login' ? (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    Đăng nhập
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Tạo tài khoản học ngay
                  </>
                )}
              </button>
            </form>
          )}

          {/* KHỐI XÁC THỰC BÊN THỨ 3: GOOGLE OAUTH 2.0 (Chỉ hiện ở Tab Login & Register) */}
          {authModalTab !== 'forgot' && authModalTab !== 'verify' && (
            <>
              {/* Đường ngăn cách */}
              <div className="relative flex items-center justify-center my-3">
                <div className="w-full border-t border-slate-200/80" />
                <span className="absolute px-2.5 text-[10px] font-semibold text-slate-400 bg-white uppercase tracking-wider">
                  Hoặc tiếp tục với
                </span>
              </div>

              {/* Nút Đăng nhập Google chuẩn Popup */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleLogin}
                className="w-full h-10 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 active:scale-[0.99] text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                title="Đăng nhập hoặc đăng ký bằng tài khoản Google"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-indigo-600/40 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span>{isSubmitting ? 'Đang mở cửa sổ Google...' : 'Tiếp tục với tài khoản Google'}</span>
              </button>

              {/* Chuyển hướng nhanh giữa Đăng nhập & Đăng ký */}
              <p className="text-xs text-center text-slate-400 pt-1">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
