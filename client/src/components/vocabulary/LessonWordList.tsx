'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Star,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  X
} from 'lucide-react';
import { FlashcardWordItem } from './LessonFlashcard';
import { NHKPitchAccentLine } from './NHKPitchAccentLine';
import { VocabDetailCard } from './VocabDetailCard';
import { NotebookApi } from '../personal/notebook.api';
import { useAuth } from '../../context/AuthContext';

interface LessonWordListProps {
  words: FlashcardWordItem[];
  onNavigateToKanji?: (character: string) => void;
  onStartFlashcard: () => void;
  onStartQuiz: () => void;
  onStartListening?: () => void;
}

export const LessonWordList: React.FC<LessonWordListProps> = ({
  words,
  onNavigateToKanji,
  onStartFlashcard,
  onStartQuiz,
  onStartListening
}) => {
  const [starredMap, setStarredMap] = useState<Record<string, boolean>>({});
  const isAllStarred = words.length > 0 && words.every(w => starredMap[w.id]);
  const [selectedVocabModal, setSelectedVocabModal] = useState<FlashcardWordItem | null>(null);
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) {
      setStarredMap({});
      return;
    }
    NotebookApi.getItems({ itemType: 'VOCAB' })
      .then(items => {
        const map: Record<string, boolean> = {};
        // Notebook item has title = word
        items.forEach(item => {
          const found = words.find(w => w.word === item.title);
          if (found) {
            map[found.id] = true;
          }
        });
        setStarredMap(map); // Replace completely instead of merge to avoid state leakage between accounts
      })
      .catch(console.warn);
  }, [isAuthenticated, words]);


  const toggleStar = async (item: FlashcardWordItem) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    const isBookmarked = !!starredMap[item.id];
    setStarredMap((prev) => ({ ...prev, [item.id]: !isBookmarked }));
    
    try {
      if (!isBookmarked) {
        await NotebookApi.createItem({
          itemType: 'VOCAB',
          title: item.word,
          reading: item.reading || '',
          meaningVi: item.meaningVi,
          level: item.jlptLevel || 'N5',
          tags: item.partOfSpeech || '',
          exampleJp: item.exampleJp || '',
          exampleVi: item.exampleVi || ''
        });
      } else {
        await NotebookApi.deleteItemByTitle('VOCAB', item.word);
      }
    } catch (e) {
      console.warn('Lỗi lưu từ vựng:', e);
      setStarredMap((prev) => ({ ...prev, [item.id]: isBookmarked }));
      alert('Lỗi lưu vào sổ tay');
    }
  };

  const handleStarAll = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (isSaving) return;
    const nextState = !isAllStarred;
    
    setIsSaving(true);
    // Optimistic UI update
    
    const newMap: Record<string, boolean> = {};
    words.forEach((w) => {
      newMap[w.id] = nextState;
    });
    setStarredMap(newMap);
    
    try {
      if (nextState) {
        // Save all words that are not already saved
        const promises = words.map(w => 
          NotebookApi.createItem({
            itemType: 'VOCAB',
            title: w.word,
            reading: w.reading || '',
            meaningVi: w.meaningVi,
            level: w.jlptLevel || 'N5',
            tags: w.partOfSpeech || '',
            exampleJp: w.exampleJp || '',
            exampleVi: w.exampleVi || ''
          }).catch(e => console.warn('Lỗi lưu từ', w.word, e))
        );
        await Promise.all(promises);
      } else {
        // Unsave all words
        const promises = words.map(w => 
          NotebookApi.deleteItemByTitle('VOCAB', w.word).catch(e => console.warn('Lỗi xóa từ', w.word, e))
        );
        await Promise.all(promises);
      }
    } catch (e) {
      alert('Có lỗi xảy ra khi lưu cả bài.');
    } finally {
      setIsSaving(false);
    }
  };

  const speak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header Danh Sách & Nút Thêm cả bài vào ôn tập (Khớp Hệt Ảnh 6) */}
      <div className="flex items-center justify-between px-1 py-2">
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Thuật ngữ trong bài này ({words.length})
        </h3>

        <div className="flex items-center gap-2">
          {onStartListening && (
            <button
              onClick={onStartListening}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Luyện nghe câu</span>
            </button>
          )}

          <button
            onClick={handleStarAll}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Star className={`w-4 h-4 ${isAllStarred ? 'fill-slate-950' : ''}`} />
            <span>{isAllStarred ? 'Đã lưu cả bài' : 'Thêm cả bài vào ôn tập'}</span>
          </button>
        </div>
      </div>

      {/* 2. Danh Sách Thẻ Từ Vựng Nền Tối Sang Trọng (Khớp 100% Ảnh 6) */}
      <div className="flex flex-col gap-3">
        {words.map((item, index) => {
          const isStarred = !!starredMap[item.id];

          return (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 transition-all hover:border-blue-300 hover:shadow-md group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-300 pt-1.5 shrink-0 w-6">
                    {index + 1}.
                  </span>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                        {item.word}
                      </h4>
                      {item.reading && item.reading !== item.word && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          {item.reading}
                        </span>
                      )}
                      <button
                        onClick={(e) => speak(e, item.word)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <span className="text-base font-bold text-slate-700">
                      {item.meaningVi}
                    </span>

                    {item.constituentKanjis && item.constituentKanjis.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {item.constituentKanjis.map((k) => (
                          <span 
                            key={k.character}
                            onClick={() => onNavigateToKanji?.(k.character)}
                            className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-100 cursor-pointer transition-colors"
                          >
                            {k.character} ({k.hanViet?.toUpperCase() || k.meaningVi.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>')})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedVocabModal(item)}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all cursor-pointer border border-amber-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Sensei</span>
                  </button>
                  <button
                    onClick={() => toggleStar(item)}
                    className={`p-2 rounded-xl transition-all cursor-pointer border ${
                      isStarred 
                        ? 'bg-amber-50 border-amber-200 text-amber-500' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              {item.exampleJp && (
                <div className="mt-1 sm:pl-9">
                  <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100 relative group/ex">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-slate-700 leading-relaxed">
                        {item.exampleJp}
                      </span>
                      <button
                        onClick={(e) => speak(e, item.exampleJp || "")}
                        className="text-slate-400 hover:text-blue-500 transition-colors p-1 shrink-0 opacity-0 group-hover/ex:opacity-100"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.exampleVi && (
                      <span className="text-xs text-slate-500 font-medium">
                        {item.exampleVi}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Chi tiết Từ Vựng & AI Sensei */}
      {selectedVocabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-1">
            <button
              onClick={() => setSelectedVocabModal(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <VocabDetailCard
              data={selectedVocabModal}
              onNavigateToKanji={(char) => {
                setSelectedVocabModal(null);
                if (onNavigateToKanji) onNavigateToKanji(char);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
