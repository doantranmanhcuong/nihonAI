'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  targetLevel: string;
  avatar: string | null;
  role: string;
  authProvider?: string;
  isEmailVerified?: boolean;
  studyStreak?: number;
  lastStudyDate?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot' | 'verify';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot' | 'verify') => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    email: string,
    password?: string,
    displayName?: string,
    targetLevel?: string
  ) => Promise<{ success: boolean; message?: string; debugCode?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  resendVerifyEmail: (email: string) => Promise<{ success: boolean; message?: string; debugCode?: string }>;
  loginWithGoogle: (data: {
    credential?: string; 
    email?: string;
    displayName?: string;
    avatar?: string;
    googleId?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; debugCode?: string }>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  revokeAllSessions: () => Promise<boolean>;
  loginDemo: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateLevel: (newLevel: string) => Promise<boolean>;
  updateProfile: (data: { displayName?: string; targetLevel?: string; avatar?: string }) => Promise<{ success: boolean; message?: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const USER_KEY = 'nihonai_user';

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');

  useEffect(() => {
    const requestInterceptor = authApi.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = authApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
            if (res.data.success) {
              const newToken = res.data.data.token;
              setToken(newToken);
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return authApi(originalRequest);
            }
          } catch (refreshError) {
            handleLogoutState();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      authApi.interceptors.request.eject(requestInterceptor);
      authApi.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          if (res.data.success) {
            setToken(res.data.data.token);
              localStorage.setItem('nihonai_token', res.data.data.token);
            setUser(res.data.data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.data.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid. Clearing state.');
          handleLogoutState();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const handleLogoutState = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('nihonai_token');
    // Clear potentially leaked state between accounts
    localStorage.removeItem('nihonai_saved_vocab');
    localStorage.removeItem('nihonai_saved_grammar');
    localStorage.removeItem('nihonai_saved_kanji');
  };

  const setAuthData = (authUser: AuthUser, authToken: string) => {
    localStorage.setItem('nihonai_token', authToken);
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' | 'verify' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const res = await authApi.post('/auth/login', { email, password });
      if (res.data.success) {
        setAuthData(res.data.data.user, res.data.data.token);
        
        // If not verified, force them to verify tab
        if (!res.data.data.user.isEmailVerified && res.data.data.user.authProvider === 'LOCAL') {
          openAuthModal('verify');
          return { success: true, message: 'Vui lòng xác thực email của bạn.' };
        }
        
        closeAuthModal();
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Lỗi đăng nhập' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const register = async (email: string, password?: string, displayName?: string, targetLevel?: string) => {
    try {
      const res = await authApi.post('/auth/register', { email, password, displayName, targetLevel });
      if (res.data.success) {
        setAuthData(res.data.data.user, res.data.data.token);
        openAuthModal('verify');
        return { success: true, debugCode: res.data.data?.debugCode };
      }
      return { success: false, message: res.data.message || 'Lỗi đăng ký' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const res = await authApi.post('/auth/verify-email', { email, code });
      if (res.data.success) {
        setUser(res.data.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.data.user));
        closeAuthModal();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const resendVerifyEmail = async (email: string) => {
    try {
      const res = await authApi.post('/auth/resend-verify', { email });
      return { success: true, message: res.data.message, debugCode: res.data.debugCode };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const loginDemo = async () => {
    try {
      const res = await authApi.post('/auth/demo');
      if (res.data.success) {
        setAuthData(res.data.data.user, res.data.data.token);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, message: 'Lỗi đăng nhập Demo' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const loginWithGoogle = async (data: { credential?: string; email?: string; displayName?: string; avatar?: string; googleId?: string; }) => {
    try {
      const res = await authApi.post('/auth/google', data);
      if (res.data.success) {
        setAuthData(res.data.data.user, res.data.data.token);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Lỗi Google Auth' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const logout = async () => {
    // Optimistically clear state to avoid UI lag
    handleLogoutState();
    try {
      await authApi.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API failed', e);
    }
  };

  const revokeAllSessions = async () => {
    try {
      const res = await authApi.post('/auth/revoke-all');
      if (res.data.success) {
        handleLogoutState();
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const updateLevel = async (newLevel: string) => {
    if (!token) {
      openAuthModal('login');
      return false;
    }
    try {
      const res = await authApi.put('/auth/me/level', { targetLevel: newLevel });
      if (res.data.success) {
        const updatedUser = res.data.data;
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await authApi.post('/auth/forgot-password', { email });
      return { success: true, message: res.data.message, debugCode: res.data.debugCode };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const res = await authApi.post('/auth/reset-password', { email, code, newPassword });
      if (res.data.success) {
        setAuthData(res.data.data.user, res.data.data.token);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Lỗi kết nối' };
    }
  };

  const updateProfile = async (data: { displayName?: string; targetLevel?: string; avatar?: string }) => {
    try {
      const res = await authApi.patch('/auth/me/profile', data);
      if (res.data.success) {
        if (res.data.data) {
          const updatedUser = { ...user, ...res.data.data };
          setUser(updatedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Lỗi cập nhật hồ sơ' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        verifyEmail,
        resendVerifyEmail,
        loginWithGoogle,
        forgotPassword,
        resetPassword,
        revokeAllSessions,
        loginDemo,
        logout,
        updateLevel,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
