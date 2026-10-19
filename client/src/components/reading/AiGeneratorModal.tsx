'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, BookOpen, Layers, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { QuotaStatus, ReadingArticle } from './reading.types';
import { ReadingApi } from './reading.api';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota: QuotaStatus | null;
  onArticleGenerated: (article: ReadingArticle) => void;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  quota,
  onArticleGenerated
}) => {
  const [activeMode, setActiveMode] = useState<'AI_GEN' | 'CUSTOM_TEXT'>('AI_GEN');
  const [level, setLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N3');
  const [topic, setTopic] = useState<string>('Đời sống & Văn hóa');
  const [customRequirement, setCustomRequirement] = useState<string>('');
  const [providedText, setProvidedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const levelSpecs = {
    N5: { length: '100 - 180 chữ', questions: '4 câu hỏi', desc: 'Đoản văn đời sống ngắn, email, tin nhắn' },
    N4: { length: '180 - 250 chữ', questions: '5 câu hỏi', desc: 'Đoản văn chỉ dẫn, nội quy, mẩu chuyện' },
    N3: { length: '250 - 380 chữ', questions: '6 câu hỏi', desc: 'Trung văn tản văn, phong tục, so sánh' },
    N2: { length: '380 - 550 chữ', questions: '7 câu hỏi', desc: 'Trung văn bình luận xã hội, tâm lý' },
    N1: { length: '550 - 750 chữ', questions: '8 câu hỏi', desc: 'Trường văn triết luận, văn hóa sâu sắc' }
  };

  const topicsList = [
    'Đời sống & Văn hóa',
    'Ẩm thực Nhật Bản',
    'Du lịch & Danh lam thắng cảnh',
    'Môi trường & Khoa học',
    'Công nghệ & Trí tuệ nhân tạo',
    'Kinh tế & Công sở (Business)',
    'Quan hệ con người & Tâm lý'
  ];

  const handleGenerate = async () => {
    if (!quota?.canGenerate) {
      setErrorMessage('Bạn đã đạt hạn ngạch tối đa 5 bài tạo bằng AI hôm nay.');
      return;
    }

    if (activeMode === 'CUSTOM_TEXT' && !providedText.trim()) {
      setErrorMessage('Vui lòng dán đoạn văn tiếng Nhật bạn muốn phân tích.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await ReadingApi.generateArticle({
        level,
        topic: activeMode === 'CUSTOM_TEXT' ? 'Văn bản người dùng' : topic,
        customRequirement: customRequirement.trim() || undefined,
        providedText: activeMode === 'CUSTOM_TEXT' ? providedText.trim() : undefined
      });

      onArticleGenerated(res.article);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi tạo bài đọc.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-6 text-white flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Dokkai Master · Gemini 3.5 Flash Lite</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">Tạo Bài Đọc Hiểu Chuẩn JLPT</h2>
            <p className="text-xs text-indigo-100 mt-1">
              Soạn bài theo cấu trúc đề thi Dokkai thật, tăng cường nhiều câu hỏi trắc nghiệm luyện tập thỏa thích
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota Indicator Bar */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-900">Hạn ngạch hôm nay:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-2 rounded-sm transition-all ${
                    i <= (quota?.usedToday || 0)
                      ? 'bg-amber-500 shadow-2xs'
                      : 'bg-amber-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-amber-800 font-semibold ml-1">
              {quota?.usedToday ?? 0}/5 bài
            </span>
            <span className="text-slate-500">
              (Còn {quota?.remaining ?? 5} lượt)
            </span>
          </div>

          <div className="text-[11px] text-amber-700 font-medium">
            Tự động lưu vào Thư viện dùng chung (0 Token cho người sau)
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quota Exceeded Warning */}
          {quota && !quota.canGenerate && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col gap-2 text-amber-900 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Bạn đã dùng hết 5 lượt tạo bài đọc AI hôm nay!
              </div>
              <p className="text-slate-600">
                Để bảo toàn tài nguyên hệ thống, bạn có thể luyện tập không giới hạn với hàng chục bài đọc chuẩn thi mẫu có sẵn trong <strong>Thư viện bài đọc</strong> (Hoàn toàn miễn phí, 0 token!).
              </p>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveMode('AI_GEN')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'AI_GEN'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Tự Biên Soạn Theo Cấp Độ
            </button>
            <button
              onClick={() => setActiveMode('CUSTOM_TEXT')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'CUSTOM_TEXT'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Dán Đoạn Văn Tiếng Nhật Của Bạn
            </button>
          </div>

          {/* 1. Chọn Cấp Độ JLPT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Cấp Độ JLPT & Chuẩn Độ Dài Dokkai:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => {
                const isSelected = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-3 px-2 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <span className="text-base font-black">{lvl}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {levelSpecs[lvl].questions}
                    </span>
                    <span className="text-[9px] text-indigo-600 font-semibold px-1 py-0.5 rounded bg-indigo-100/60">
                      {levelSpecs[lvl].length}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              💡 {levelSpecs[level].desc}
            </p>
          </div>

          {activeMode === 'AI_GEN' ? (
            <>
              {/* 2. Chọn Chủ Đề */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Chủ Đề Bài Đọc:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {topicsList.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`text-left text-xs p-2.5 rounded-xl border transition cursor-pointer ${
                        topic === t
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Yêu Cầu Chi Tiết (Tùy Chọn) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Yêu Cầu Chi Tiết Cho AI (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={customRequirement}
                  onChange={(e) => setCustomRequirement(e.target.value)}
                  placeholder="Ví dụ: Kể về trải nghiệm đi xem pháo hoa mùa hè ở Tokyo..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                />
              </div>
            </>
          ) : (
            /* Chế độ dán văn bản */
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dán Đoạn Văn Tiếng Nhật Bạn Cần Học:
              </label>
              <textarea
                rows={5}
                value={providedText}
                onChange={(e) => setProvidedText(e.target.value)}
                placeholder="Dán đoạn văn tiếng Nhật vào đây. AI sẽ tách câu, tạo Furigana, dịch song ngữ và soạn nhiều câu hỏi trắc nghiệm chuẩn JLPT..."
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden resize-none font-japanese leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Số ký tự hiện tại: {providedText.length} ký tự (Khuyến nghị chuẩn {levelSpecs[level].length} để đạt chất lượng sư phạm cao nhất).
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Đóng
          </button>

          <button
            onClick={handleGenerate}
            disabled={isLoading || (quota !== null && !quota.canGenerate)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
              isLoading || (quota !== null && !quota.canGenerate)
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>AI Đang Phân Tích & Soạn Câu Hỏi...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bắt Đầu Tạo Bài Đọc</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
