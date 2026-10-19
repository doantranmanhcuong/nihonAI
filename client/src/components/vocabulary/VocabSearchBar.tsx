'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, BookOpen, X, Lock, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGateway } from '@/services/api-gateway.client';

export interface AutocompleteItem {
  id: string;
  word: string;
  reading: string;
  romaji?: string | null;
  hanViet: string | null;
  meaningVi: string;
  jlptLevel: string;
  lesson?: number | null;
  partOfSpeech: string | null;
  pitchAccent: string | null;
}

interface VocabSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLevel: string;
  onLevelChange: (lvl: string) => void;
  selectedLesson: number | null;
  onLessonChange: (lesson: number | null) => void;
  selectedPos: string;
  onPosChange: (pos: string) => void;
  totalResults: number;
  onSelectSuggestion?: (item: AutocompleteItem) => void;
}

export const VocabSearchBar: React.FC<VocabSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedLesson,
  onLessonChange,
  selectedPos,
  onPosChange,
  totalResults,
  onSelectSuggestion
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const levelTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'N5', label: 'N5 (Miễn phí)', isFree: true },
    { id: 'N4', label: 'N4' },
    { id: 'N3', label: 'N3' },
    { id: 'N2', label: 'N2' },
    { id: 'N1', label: 'N1' }
  ];

  const partOfSpeechList = [
    { id: 'all', label: 'Tất cả từ loại' },
    { id: 'Danh từ', label: 'Danh từ' },
    { id: 'Động từ', label: 'Động từ' },
    { id: 'Tính từ', label: 'Tính từ' },
    { id: 'Đại từ', label: 'Đại từ' }
  ];

  const handleLevelClick = (lvlId: string, isFree?: boolean) => {
    if (!isAuthenticated && !isFree && lvlId !== 'all') {
      openAuthModal('login');
      return;
    }
    onLevelChange(lvlId);
  };

  // Lắng nghe thay đổi từ khóa để gọi API đề xuất tự động (Autocomplete Typeahead)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await apiGateway.vocab.autocomplete(q, 8);
        if (res.success && Array.isArray(res.data)) {
          setSuggestions(res.data);
          setIsOpen(res.data.length > 0);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error('Lỗi khi lấy gợi ý từ vựng:', err);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: AutocompleteItem) => {
    onSearchChange(item.word);
    setIsOpen(false);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-4 w-full">
      {/* Hàng trên: Thanh tìm kiếm thông minh kèm Autocomplete Dropdown */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full" ref={dropdownRef}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tra từ vựng bằng Kanji, Hiragana, Romaji (taberu) hoặc Tiếng Việt (ăn, học sinh)..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* ================= AUTOCOMPLETE SUGGESTIONS DROPDOWN ================= */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gợi ý từ khóa & Phân biệt từ đồng âm / chung chữ Hán:
                </span>
                <span className="text-slate-400">Dùng phím ↑ ↓ Enter</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {suggestions.map((item, idx) => {
                  const isSelected = activeIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Từ vựng chính */}
                        <span className="text-base sm:text-lg font-black text-slate-900 shrink-0">
                          {item.word}
                        </span>

                        {/* Cách đọc Hiragana */}
                        <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shrink-0">
                          {item.reading}
                        </span>

                        {/* Âm Hán Việt */}
                        {item.hanViet && (
                          <span className="text-[11px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 uppercase shrink-0">
                            {item.hanViet}
                          </span>
                        )}

                        {/* Trọng âm nếu có */}
                        {item.pitchAccent && (
                          <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1 py-0.2 rounded shrink-0 hidden sm:inline-block">
                            {item.pitchAccent}
                          </span>
                        )}

                        {/* Cấp độ JLPT */}
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded shrink-0">
                          {item.jlptLevel}
                        </span>
                      </div>

                      {/* Nghĩa Tiếng Việt rõ ràng phân biệt nghĩa */}
                      <div className="flex items-center gap-2 pl-3 text-right shrink-0 max-w-[45%] sm:max-w-[50%]">
                        <span className="text-xs font-semibold text-slate-700 truncate" title={item.meaningVi}>
                          {item.meaningVi}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Thống kê số lượng kết quả */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-700 shrink-0">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>
            {totalResults} từ {searchQuery.trim() ? '(CSDL & API Mở Rộng)' : 'cốt lõi'}
          </span>
        </div>
      </div>

      {/* Hàng dưới: Các bộ lọc kết hợp (Cấp độ JLPT, Bài Minna, Từ loại) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Bộ lọc Cấp độ JLPT */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {levelTabs.map((tab) => {
            const isActive = selectedLevel === tab.id;
            const isLocked = !isAuthenticated && !tab.isFree && tab.id !== 'all';

            return (
              <button
                key={tab.id}
                onClick={() => handleLevelClick(tab.id, tab.isFree)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Các Dropdown lọc bổ sung */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Lọc theo Bài Minna (Bài 1 - 50) */}
          <select
            value={selectedLesson || ''}
            onChange={(e) => onLessonChange(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">Tất cả bài học Minna</option>
            {Array.from({ length: 50 }, (_, i) => i + 1).map((les) => (
              <option key={les} value={les}>
                Bài {les} ({les <= 25 ? 'N5' : 'N4'})
              </option>
            ))}
          </select>

          {/* Lọc theo Từ loại */}
          <select
            value={selectedPos}
            onChange={(e) => onPosChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {partOfSpeechList.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
