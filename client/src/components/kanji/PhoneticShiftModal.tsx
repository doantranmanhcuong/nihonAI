'use client';

import React from 'react';
import { X, Sparkles, ArrowRight, BookOpen, Volume2 } from 'lucide-react';

interface PhoneticShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: string;
  hanViet: string;
  onyomi: string;
}

// BẢNG 10 QUY TẮC CHUYỂN ÂM VÀNG HÁN VIỆT SANG ONYOMI
const PHONETIC_RULES = [
  {
    initial: 'T, TH',
    target: 'Hàng S, SH (サ, シ, ス, セ, ソ)',
    example: 'TÍCH → SEKI (セキ), TÂN → SHIN (シン), TIÊN → SEN (セン), THỜI → JI (ジ)'
  },
  {
    initial: 'Đ, D',
    target: 'Hàng T, D (タ, チ, ツ, テ, ト / ダ, デ, ド)',
    example: 'ĐẠI → DAI (ダイ), ĐỘC → DOKU (ドク), ĐAO → TOU (トウ), DỊCH → EKI (エキ)'
  },
  {
    initial: 'K, C, QU',
    target: 'Hàng K (カ, キ, ク, ケ, コ)',
    example: 'KIM → KIN (キン), CÔNG → KOU (コウ), CƠ → KI (キ), QUỐC → KOKU (コク)'
  },
  {
    initial: 'B, P, PH',
    target: 'Hàng H, B, P (ハ, ヒ, フ, ヘ, ホ / バ, ビ)',
    example: 'BÁCH → HYAKU (ヒャク), BỔN → HON (ホン), PHÊ → HI (ヒ), PHÁP → HOU (ホウ)'
  },
  {
    initial: 'L',
    target: 'Hàng R (ラ, リ, ル, レ, ロ)',
    example: 'LẬP → RITSU (リツ), LỤC → ROKU (ロク), LÝ → RI (リ), LUYỆN → REN (レン)'
  },
  {
    initial: 'M',
    target: 'Hàng M, B (マ, ミ, ム, メ, モ / バ, ビ)',
    example: 'MỘC → MOKU (モク), MỸ → BI (ビ), MÃ → BA (バ), MÔN → MON (モン)'
  },
  {
    initial: 'N, NG, NH',
    target: 'Hàng G, N (ガ, ギ, グ / ナ, ニ)',
    example: 'NGÔN → GEN (ゲン), NGHỆ → GEI (ゲイ), NGUYỆT → GETSU (ゲツ), NHẬT → NICHI (ニチ)'
  },
  {
    initial: 'H',
    target: 'Hàng K, G (カ, ガ, コウ, カイ)',
    example: 'HOA → KA (カ), HỘI → KAI (カイ), HỌC → GAKU (ガク), HỎA → KA (カ)'
  },
  {
    initial: 'Vần ICH, ÊCH',
    target: 'Đuôi EKI, IKI (エキ, イキ)',
    example: 'TÍCH → SEKI (セキ), ĐÍCH → TEKI (テキ), LỊCH → REKI (レキ), DỊCH → EKI (エキ)'
  },
  {
    initial: 'Vần ANG, ÔNG, ƯƠNG, ANH',
    target: 'Trường âm OU, EI (オウ, エイ)',
    example: 'QUẢNG → KOU (コウ), ĐÔNG → TOU (トウ), TRƯƠNG → CHOU (チョウ), THANH → SEI (セイ)'
  }
];

function analyzeSpecificShift(hanViet: string, onyomi: string): string {
  const hv = hanViet.toUpperCase().trim();
  const firstLetter = hv.charAt(0);

  if (hv.includes('TÍCH') || hv.endsWith('ÍCH')) {
    return `Chữ có âm Hán Việt bắt đầu bằng phụ âm 'T' chuyển sang hàng 'S' (セ), vần 'ÍCH' chuyển thành đuôi 'EKI' → Tạo thành âm On chuẩn: ${onyomi}`;
  }
  if (hv.startsWith('T')) {
    return `Chữ có âm Hán Việt bắt đầu bằng 'T/TH' chuyển sang hàng 'S/SH' (サ, シ, ス, セ, ソ) trong tiếng Nhật → Âm On: ${onyomi}`;
  }
  if (hv.startsWith('Đ') || hv.startsWith('D')) {
    return `Chữ có âm Hán Việt bắt đầu bằng 'Đ/D' chuyển sang hàng 'T/D' (タ, テ, ト / ダイ) → Âm On: ${onyomi}`;
  }
  if (hv.startsWith('K') || hv.startsWith('C') || hv.startsWith('QU')) {
    return `Chữ có âm Hán Việt bắt đầu bằng 'K/C/QU' chuyển sang hàng 'K' (カ, キ, ク, コウ) → Âm On: ${onyomi}`;
  }
  if (hv.startsWith('B') || hv.startsWith('P')) {
    return `Chữ có âm Hán Việt bắt đầu bằng 'B/P/PH' chuyển sang hàng 'H/B' (ホン, ヒ, ハン) → Âm On: ${onyomi}`;
  }
  if (hv.startsWith('L')) {
    return `Chữ có âm Hán Việt bắt đầu bằng 'L' chuyển sang hàng 'R' (リ, ル, レ, ロ) → Âm On: ${onyomi}`;
  }
  if (hv.startsWith('H')) {
    return `Chữ có âm Hán Việt bắt đầu bằng 'H' chuyển sang hàng 'K/G' (カ, カイ, ガク) → Âm On: ${onyomi}`;
  }

  return `Âm Hán Việt '${hanViet}' kết hợp với các quy tắc vần âm để chuyển hóa thành âm Onyomi chuẩn: ${onyomi}`;
}

export const PhoneticShiftModal: React.FC<PhoneticShiftModalProps> = ({
  isOpen,
  onClose,
  character,
  hanViet,
  onyomi
}) => {
  if (!isOpen) return null;

  const specificAnalysis = analyzeSpecificShift(hanViet, onyomi);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Quy Tắc Chuyển Âm Hán Việt → Tiếng Nhật (Onyomi)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bí quyết đoán 90% cách đọc Onyomi từ âm Hán Việt không cần học vẹt.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Hộp Phân Tích Cụ Thể Chữ Đang Học */}
          <div className="p-5 bg-orange-50/80 border-2 border-orange-200 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-orange-600" />
                Áp dụng cụ thể cho chữ {character} ({hanViet})
              </span>
              <span className="text-xs font-black px-2.5 py-1 bg-white text-orange-600 rounded-lg border border-orange-200">
                Âm On: {onyomi}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              👉 {specificAnalysis}
            </p>
          </div>

          {/* Bảng 10 Quy Tắc Vàng */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
              Bảng 10 Quy Tắc Chuyển Âm Chuẩn Nhật Bản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PHONETIC_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1.5 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-700">
                      {idx + 1}. Phụ âm: {rule.initial}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {rule.target}
                  </span>
                  <span className="text-[11px] text-slate-500 italic mt-0.5">
                    Ví dụ: {rule.example}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Đã hiểu quy tắc
          </button>
        </div>
      </div>
    </div>
  );
};
