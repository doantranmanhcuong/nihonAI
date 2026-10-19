import React, { useState } from 'react';
import { ReadingApi } from './reading.api';
import { BookOpen, BookmarkPlus, Loader2, RefreshCw } from 'lucide-react';



interface Props {
  selectedText: string;
  contextSentence: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export const DokkaiContextualPopup: React.FC<Props> = ({ selectedText, contextSentence, position, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  

  const handleTranslate = async () => {
    if (!selectedText) return;
    setLoading(true);
    try {
      const res = await ReadingApi.translateSelection(selectedText, contextSentence);
      setResult(res);
    } catch (err) {
      alert('Lỗi khi tra cứu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotebook = async () => {
    if (!result) return;
    try {
      await ReadingApi.saveToNotebook({
        itemType: result.type === 'sentence' ? 'GRAMMAR' : 'VOCAB',
        title: result.kanjiWithFurigana || selectedText,
        meaningVi: result.translation || result.grammarMeaning,
        structure: result.grammarStructure,
      });
      alert('Đã lưu vào Sổ tay!');
    } catch (err) {
      alert('Lỗi khi lưu Sổ tay');
    }
  };

  if (!position) return null;

  return (
    <div 
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-indigo-100 w-80 md:w-96 p-4 max-h-[80vh] overflow-y-auto"
      style={{ top: position.y + 10, left: Math.min(position.x - 150, window.innerWidth - 400) }}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-slate-800 line-clamp-2 pr-4">{selectedText}</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center">×</button>
      </div>

      {!result && !loading && (
        <button 
          onClick={handleTranslate}
          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <BookOpen size={16} /> Dịch & Phân tích ngữ cảnh
        </button>
      )}

      {loading && (
        <div className="py-8 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
          <span className="text-sm">AI đang phân tích ngữ cảnh...</span>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm font-semibold text-slate-700 mb-1">
              {result.type === 'sentence' ? 'Dịch nguyên câu / Cấu trúc:' : 'Nghĩa (Theo ngữ cảnh):'}
            </div>
            <div className="text-slate-800">{result.translation}</div>
          </div>
          
          {result.grammarPoint && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <div className="text-xs font-bold text-amber-800 mb-1">ĐIỂM NGỮ PHÁP TỪ CÂU DÀI</div>
              <div className="font-medium text-amber-900">{result.grammarPoint}</div>
              <div className="text-sm text-amber-800 mt-1">{result.grammarStructure}</div>
              <div className="text-sm text-amber-700 mt-1 italic">{result.grammarMeaning}</div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleSaveToNotebook}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <BookmarkPlus size={16} /> Lưu Sổ Tay
            </button>
            <button 
              onClick={handleTranslate}
              className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center transition-colors"
              title="Phân tích lại"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
