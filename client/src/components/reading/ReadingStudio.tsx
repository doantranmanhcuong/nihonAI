'use client';

import React, { useState, useEffect } from 'react';
import { SharedLibraryView } from './SharedLibraryView';
import { DokkaiStudyView } from './DokkaiStudyView';
import { VideoShadowingView } from './VideoShadowingView';
import { AiGeneratorModal } from './AiGeneratorModal';
import { ReadingArticle, QuotaStatus } from './reading.types';
import { ReadingApi } from './reading.api';
import { useAuth } from '@/context/AuthContext';

export const ReadingStudio: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LIBRARY' | 'DOKKAI' | 'VIDEO'>('LIBRARY');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ReadingArticle | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const { isAuthenticated, openAuthModal } = useAuth();

  const fetchQuota = async () => {
    try {
      const q = await ReadingApi.getQuota();
      setQuota(q);
    } catch (e) {
      console.error('Failed to load quota:', e);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const handleSelectArticle = async (articleId: string) => {
    setSelectedArticleId(articleId);
    try {
      const art = await ReadingApi.getArticleDetail(articleId);
      setSelectedArticle(art);
      setCurrentView('DOKKAI');
    } catch (err) {
      console.error('Failed to load article detail:', err);
    }
  };

  const handleArticleGenerated = (newArticle: ReadingArticle) => {
    fetchQuota();
    setSelectedArticleId(newArticle.id);
    setSelectedArticle(newArticle);
    setCurrentView('DOKKAI');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Màn hình Thư viện & Nhập bài đọc Dokkai */}
      {currentView === 'LIBRARY' && (
        <SharedLibraryView
          onSelectArticle={handleSelectArticle}
          onArticleGenerated={handleArticleGenerated}
          quota={quota}
          onNavigateToVideo={() => setCurrentView('VIDEO')}
        />
      )}

      {/* 2. Màn hình Đọc Hiểu JLPT Dokkai Tương Tác Chuyên Sâu */}
      {currentView === 'DOKKAI' && selectedArticleId && (
        <DokkaiStudyView
          articleId={selectedArticleId}
          onSelectArticle={handleSelectArticle}
          onBack={() => {
            setCurrentView('LIBRARY');
            fetchQuota();
          }}
        />
      )}

      {/* 3. Màn hình Video Shadowing Studio */}
      {currentView === 'VIDEO' && (
        <VideoShadowingView
          onBack={() => {
            setCurrentView('LIBRARY');
            fetchQuota();
          }}
        />
      )}

      {/* 4. Modal Tạo Bài Đọc Bằng AI (Hạn ngạch 5 bài/ngày) */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        quota={quota}
        onArticleGenerated={handleArticleGenerated}
      />
    </div>
  );
};
