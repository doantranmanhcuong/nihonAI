'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SharedLibraryView } from './SharedLibraryView';
import { DokkaiStudyView } from './DokkaiStudyView';
import { AiGeneratorModal } from './AiGeneratorModal';
import { ReadingArticle, QuotaStatus } from './reading.types';
import { ReadingApi } from './reading.api';
import { useAuth } from '@/context/AuthContext';

export const ReadingStudio: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LIBRARY' | 'DOKKAI'>('LIBRARY');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ReadingArticle | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const { user } = useAuth();
  const selectedArticleIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedArticleIdRef.current = selectedArticleId;
  }, [selectedArticleId]);

  const fetchQuota = useCallback(async () => {
    try {
      const q = await ReadingApi.getQuota(user?.id || 'guest_user');
      setQuota(q);
    } catch (e) {
      console.error('Failed to load quota:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const parseArticleIdFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (hash.includes('id=')) {
      const match = hash.match(/[?&]id=([^&]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
    }
    if (search.includes('id=')) {
      const match = search.match(/[?&]id=([^&]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
    }
    return null;
  }, []);

  const handleSelectArticle = useCallback((articleId: string, updateUrl: boolean = true) => {
    setSelectedArticleId(articleId);
    setSelectedArticle(null);
    setCurrentView('DOKKAI');

    if (updateUrl && typeof window !== 'undefined') {
      window.history.pushState(null, '', `#reading?id=${encodeURIComponent(articleId)}`);
    }
  }, []);

  // Sync URL hash on initial load
  useEffect(() => {
    const initialId = parseArticleIdFromUrl();
    if (initialId) {
      handleSelectArticle(initialId, false);
    }
  }, [parseArticleIdFromUrl, handleSelectArticle]);

  // Sync on browser back/forward buttons
  useEffect(() => {
    const handleUrlChange = () => {
      const id = parseArticleIdFromUrl();
      if (id) {
        if (id !== selectedArticleIdRef.current) {
          handleSelectArticle(id, false);
        }
      } else {
        setSelectedArticleId(null);
        setSelectedArticle(null);
        setCurrentView('LIBRARY');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [parseArticleIdFromUrl, handleSelectArticle]);

  const handleBackToLibrary = useCallback(() => {
    setSelectedArticleId(null);
    setSelectedArticle(null);
    setCurrentView('LIBRARY');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '#reading');
    }
    fetchQuota();
  }, [fetchQuota]);

  const handleArticleGenerated = (newArticle: ReadingArticle) => {
    fetchQuota();
    handleSelectArticle(newArticle.id, true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Màn hình Thư viện & Nhập bài đọc Dokkai */}
      {currentView === 'LIBRARY' && (
        <SharedLibraryView
          onSelectArticle={(id) => handleSelectArticle(id, true)}
          onArticleGenerated={handleArticleGenerated}
          quota={quota}
        />
      )}

      {/* 2. Màn hình Đọc Hiểu JLPT Dokkai Tương Tác Chuyên Sâu */}
      {currentView === 'DOKKAI' && selectedArticleId && (
        <DokkaiStudyView
          articleId={selectedArticleId}
          onSelectArticle={(id) => handleSelectArticle(id, true)}
          onBack={handleBackToLibrary}
        />
      )}

      {/* 3. Modal Tạo Bài Đọc Bằng AI (Hạn ngạch mỗi ngày) */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        quota={quota}
        onArticleGenerated={handleArticleGenerated}
      />
    </div>
  );
};
