'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TopHeader } from '@/components/layout/TopHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { LandingPage } from '@/components/home/LandingPage';
import { useAuth } from '@/context/AuthContext';
import { applyGlobalPreferences } from '@/utils/studyPreferences';
import { apiGateway } from '@/services/api-gateway.client';

import { StudioErrorBoundary } from '@/components/common/StudioErrorBoundary';

const StudioLoadingFallback = () => (
  <div className="bg-white/80 rounded-3xl border border-slate-200/80 p-12 flex flex-col items-center justify-center gap-3 min-h-[360px] shadow-xs">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-bold text-slate-500">Đang tải phân hệ học tập...</span>
  </div>
);

const KanjiExplorerView = dynamic(
  () => import('@/components/kanji/KanjiExplorerView').then((m) => m.KanjiExplorerView),
  { loading: () => <StudioLoadingFallback /> }
);
const VocabStudio = dynamic(
  () => import('@/components/vocabulary/VocabStudio').then((m) => m.VocabStudio),
  { loading: () => <StudioLoadingFallback /> }
);
const GrammarStudio = dynamic(
  () => import('@/components/grammar/GrammarStudio').then((m) => m.GrammarStudio),
  { loading: () => <StudioLoadingFallback /> }
);
const ReadingStudio = dynamic(
  () => import('@/components/reading/ReadingStudio').then((m) => m.ReadingStudio),
  { loading: () => <StudioLoadingFallback /> }
);
const ShadowingStudio = dynamic(
  () => import('@/components/shadowing/ShadowingStudio').then((m) => m.ShadowingStudio),
  { loading: () => <StudioLoadingFallback /> }
);
const ExamStudio = dynamic(
  () => import('@/components/exam/ExamStudio').then((m) => m.ExamStudio),
  { loading: () => <StudioLoadingFallback /> }
);
const PersonalStudio = dynamic(
  () => import('@/components/personal/PersonalStudio').then((m) => m.PersonalStudio),
  { loading: () => <StudioLoadingFallback /> }
);
const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard').then((m) => m.AdminDashboard),
  { loading: () => <StudioLoadingFallback /> }
);
const UserProfileView = dynamic(
  () => import('@/components/personal/UserProfileView').then((m) => m.UserProfileView),
  { loading: () => <StudioLoadingFallback /> }
);

export default function Home() {
  const [activeTab, setActiveTabState] = useState<string>('home');
  const { isAuthenticated, isLoading } = useAuth();

  // Khởi tạo tùy biến học tập (Furigana, TTS) & làm nóng dữ liệu nền ngay khi ứng dụng khởi chạy
  useEffect(() => {
    applyGlobalPreferences();
    apiGateway.prefetchCoreData();
  }, []);

  // Sync activeTab with URL Hash for Browser Back Button support
  useEffect(() => {
    const parseTabFromHash = () => {
      if (typeof window === 'undefined') return 'home';
      const hash = window.location.hash.replace('#', '');
      if (!hash) return 'home';
      return hash.split('?')[0].split('/')[0] || 'home';
    };

    setActiveTabState(parseTabFromHash());

    const handlePopState = () => {
      setActiveTabState(parseTabFromHash());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const [isExamActive, setIsExamActive] = useState(false);

  const setActiveTab = useCallback((tab: string) => {
    if (isExamActive && tab !== 'exam') {
      const confirmLeave = window.confirm(
        'Bạn đang trong phòng thi. Nếu rời khỏi đây, bài làm sẽ bị hủy. Bạn có chắc chắn muốn thoát?'
      );
      if (!confirmLeave) return;
      setIsExamActive(false);
    }
    setActiveTabState(tab);
    window.history.pushState(null, '', `#${tab}`);
  }, [isExamActive]);

  // Cảnh báo người dùng khi cố đóng tab / reload trình duyệt trong lúc đang làm bài thi
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isExamActive) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isExamActive]);

  // Bảo vệ điều hướng: Nếu chưa đăng nhập mà đang ở profile hoặc admin thì tự động quay về trang chủ
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (activeTab === 'profile' || activeTab === 'admin') {
        setActiveTab('home');
      }
    }
  }, [isAuthenticated, isLoading, activeTab, setActiveTab]);
  const [selectedKanjiFromVocab, setSelectedKanjiFromVocab] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* 1. Header tinh tế kèm thanh điều hướng trung tâm (Tự động ẩn khi vào phòng thi) */}
      {!isExamActive && (
        <TopHeader activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      {/* 2. Workspace Học Tập Rộng Rãi, Thoáng Đãng */}
      <main className={`flex-1 w-full ${isExamActive ? 'p-0 pb-0' : 'px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-10'}`}>
        <div className={isExamActive ? 'w-full' : 'max-w-7xl mx-auto flex flex-col gap-6'}>
          <StudioErrorBoundary>
            {/* Phân hệ 0: Trang chủ / Landing Page */}
            {activeTab === 'home' && (
              <LandingPage onNavigate={setActiveTab} />
            )}

            {/* Phân hệ 1: Tra cứu & Luyện tập Hán tự Kanji */}
            {activeTab === 'kanji' && (
              <KanjiExplorerView
                initialKanji={selectedKanjiFromVocab}
                onNavigateToVocab={() => setActiveTab('vocab')}
              />
            )}

            {/* Phân hệ 2: Từ vựng theo Giáo trình (Minna, Tango, Mimikara) */}
            {activeTab === 'vocab' && (
              <VocabStudio
                onNavigateToKanji={(char) => {
                  setSelectedKanjiFromVocab(char);
                  setActiveTab('kanji');
                }}
              />
            )}

            {/* Phân hệ 3: Ngữ pháp JLPT N5 - N1 */}
            {activeTab === 'grammar' && (
              <GrammarStudio
                onNavigateToReading={() => setActiveTab('reading')}
              />
            )}

            {/* Phân hệ 4: Đọc Hiểu Chuẩn JLPT Dokkai */}
            {activeTab === 'reading' && <ReadingStudio />}

            {/* Phân hệ 5: Luyện Nghe & Video Shadowing */}
            {activeTab === 'shadowing' && <ShadowingStudio />}

            {/* Phân hệ 6: Thi Thử JLPT Bấm Giờ */}
            {activeTab === 'exam' && (
              <ExamStudio
                onNavigateToReading={() => setActiveTab('reading')}
                onNavigateToGrammar={() => setActiveTab('grammar')}
                onNavigateToVocab={() => setActiveTab('vocab')}
                onTakingStateChange={setIsExamActive}
              />
            )}

            {/* Phân hệ 7: Sổ Tay Cá Nhân & Điều Hướng Nhanh */}
            {(activeTab === 'personal' || activeTab === 'notebook') && (
              <PersonalStudio
                onNavigate={(tabId) => setActiveTab(tabId)}
              />
            )}

            {/* Phân hệ 8: Admin Dashboard & Hồ sơ */}
            {activeTab === 'admin' && <AdminDashboard />}
            {activeTab === 'profile' && <UserProfileView onNavigate={setActiveTab} />}
          </StudioErrorBoundary>
        </div>
      </main>

      {/* 3. Thanh Điều Hướng Đáy Màn Hình Cho Điện Thoại (Tự động ẩn khi làm bài thi) */}
      {!isExamActive && (
        <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
    </div>
  );
}
