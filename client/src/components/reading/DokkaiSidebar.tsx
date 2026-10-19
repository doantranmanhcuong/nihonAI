'use client';

import React from 'react';
import { BookOpen, GraduationCap, ExternalLink, BookmarkPlus } from 'lucide-react';
import { ReadingVocabItem, ReadingGrammarItem, ReadingSentence } from './reading.types';

interface DokkaiSidebarProps {
  sentences?: ReadingSentence[];
  vocabularies?: ReadingVocabItem[];
  grammars?: ReadingGrammarItem[];
  highlightedKeyword?: string | null;
  selectedGrammarPoint?: string | null;
  onSelectKeyword: (keyword: string) => void;
  onSelectGrammar?: (grammar: ReadingGrammarItem) => void;
  onSaveNotebook?: (type: 'VOCAB' | 'GRAMMAR', item: any) => void;
}

export const DokkaiSidebar: React.FC<DokkaiSidebarProps> = ({
  vocabularies = [],
  grammars = [],
  sentences = [],
  highlightedKeyword,
  selectedGrammarPoint,
  onSelectKeyword,
  onSelectGrammar,
  onSaveNotebook
}) => {
  return (
    <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-[200px] self-start">
      {/* PHẦN 1: TỪ VỰNG TRỌNG ĐIỂM */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <BookOpen className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-800">Từ vựng trọng điểm</h3>
          <span className="text-[11px] text-slate-400 font-medium">
            ({vocabularies.length})
          </span>
        </div>

        <div className="overflow-y-auto max-h-[360px] space-y-2.5 pr-1 select-none">
          {vocabularies.map((v) => (
            <div
              key={v.id}
              onClick={() => onSelectKeyword(v.word)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-0.5 ${
                highlightedKeyword === v.word
                  ? 'border-blue-500 bg-blue-50/60 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-baseline justify-between">
                
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-slate-900 font-japanese">
                    {v.word}
                  </span>
                  <span className="text-xs text-slate-400 font-japanese">{v.reading}</span>
                  {v.hanViet && (
                    <span className="text-xs font-black text-sky-600 uppercase tracking-wider">
                      {v.hanViet}
                    </span>
                  )}
                </div>
                {onSaveNotebook && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSaveNotebook('VOCAB', v); }}
                    className="text-slate-400 hover:text-indigo-600 p-1 bg-slate-50 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Lưu vào sổ tay"
                  >
                    <BookmarkPlus size={14} />
                  </button>
                )}

              </div>
              <p className="text-xs text-slate-600 font-sans mt-0.5">{v.meaningVi}</p>
              {/* Context Sentence */}
              {(() => {
                const ctx = sentences.find(s => s.sentenceJp.includes(v.word));
                if (!ctx) return null;
                // Highlight the word in the context
                const parts = ctx.sentenceJp.split(v.word);
                return (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-slate-600 text-xs leading-relaxed border-l-2 border-indigo-200">
                    <span className="font-japanese">
                      {parts.map((part, i) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < parts.length - 1 && <span className="font-bold text-indigo-700 bg-indigo-100 px-0.5 rounded">{v.word}</span>}
                        </React.Fragment>
                      ))}
                    </span>
                    {ctx.sentenceVi && (
                      <span className="block mt-1.5 text-slate-500 font-sans italic">{ctx.sentenceVi}</span>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* PHẦN 2: MẪU NGỮ PHÁP TRONG BÀI */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <GraduationCap className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-800">Mẫu ngữ pháp trong bài</h3>
          <span className="text-[11px] text-slate-400 font-medium">
            ({grammars.length})
          </span>
        </div>

        <div className="overflow-y-auto max-h-[380px] space-y-3 pr-1 select-none">
          {grammars.map((g) => {
            const isSelected = selectedGrammarPoint === g.grammarPoint || highlightedKeyword === g.grammarPoint;
            return (
              <div
                key={g.id}
                onClick={() => {
                  if (onSelectGrammar) {
                    onSelectGrammar(g);
                  } else {
                    onSelectKeyword(g.grammarPoint);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-300'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-blue-600 font-japanese hover:underline">
                      {g.grammarPoint}
                    </span>
                    <ExternalLink className="w-3 h-3 text-blue-400" />
                  </div>
                  {g.level && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                      {g.level}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-700 font-sans">{g.meaningVi}</p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-japanese leading-relaxed">
                  {g.excerpt}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
