'use client';

import React from 'react';

interface NHKPitchAccentLineProps {
  theme?: 'light' | 'dark';
  pitchStr: string | null;
  reading: string;
  word?: string;
}

interface MoraItem {
  text: string;
  isHigh: boolean;
}

// Tách chuỗi tiếng Nhật thành các mora (âm tiết), ghép kèm chữ nhỏ (ゃ, ゅ, ょ, っ...)
function splitMoras(str: string): string[] {
  if (!str) return [];
  const cleanStr = str.replace(/[\[\]\(\)\d\s]/g, '');
  const result: string[] = [];
  const chars = Array.from(cleanStr);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1];
    if (next && /[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/.test(next)) {
      result.push(c + next);
      i++;
    } else {
      result.push(c);
    }
  }
  return result;
}

export const NHKPitchAccentLine: React.FC<NHKPitchAccentLineProps> = ({
  pitchStr,
  reading,
  word,
  theme = 'dark'
}) => {
  let displayReading = reading || word || '';
  // Remove brackets, parentheses and their contents, and trim whitespace
  displayReading = displayReading.replace(/\s*[\[\(].*?[\]\)]\s*/g, '').trim();
  const morasTexts = splitMoras(displayReading);

  if (morasTexts.length === 0) {
    return <span className={`text-4xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{word || reading}</span>;
  }

  // Phân tích loại cao độ
  let accentNumber: number | null = null;
  let hasBracket = false;
  let bracketHighMoras = new Set<number>();
  let pitchTypeLabel = '⓪ 平板 (Heiban - Bằng)';

  // 1. Kiểm tra ký hiệu số trong ngoặc e.g. "(0)", "(1)", "(2)" hoặc chuỗi thuần số "0", "1", "2"
  if (pitchStr) {
    const numMatch = pitchStr.match(/\(?(\d+)\)?/);
    if (numMatch) {
      accentNumber = parseInt(numMatch[1], 10);
    }

    // Kiểm tra ký hiệu ngoặc vuông: e.g. "わ [たし]" hoặc "[か]れ"
    const bracketMatch = pitchStr.match(/^(.*?)\[(.*?)\](.*)$/);
    if (bracketMatch) {
      hasBracket = true;
      const beforeMoras = splitMoras(bracketMatch[1]);
      const insideMoras = splitMoras(bracketMatch[2]);
      for (let i = 0; i < insideMoras.length; i++) {
        bracketHighMoras.add(beforeMoras.length + i);
      }
    }
  }

  const moraCount = morasTexts.length;
  const isHighList: boolean[] = [];

  if (hasBracket) {
    // Phân tích theo ngoặc vuông
    for (let i = 0; i < moraCount; i++) {
      isHighList.push(bracketHighMoras.has(i));
    }
    if (bracketHighMoras.has(0) && !bracketHighMoras.has(1)) {
      pitchTypeLabel = '① 頭高 (Atamadaka - Cao đầu)';
    } else if (bracketHighMoras.has(moraCount - 1)) {
      pitchTypeLabel = '尾高 (Odaka - Cao đuôi)';
    } else {
      pitchTypeLabel = '中高 (Nakadaka - Cao giữa)';
    }
  } else if (accentNumber !== null) {
    // Phân tích theo số cao độ chuẩn Nhật (0, 1, 2, 3...)
    if (accentNumber === 0) {
      pitchTypeLabel = '⓪ 平板 (Heiban - Bằng)';
      // 0: Âm 1 thấp, các âm từ 2 trở đi cao
      for (let i = 0; i < moraCount; i++) {
        isHighList.push(i > 0);
      }
    } else if (accentNumber === 1) {
      pitchTypeLabel = '① 頭高 (Atamadaka - Cao đầu)';
      // 1: Âm 1 cao, các âm sau thấp
      for (let i = 0; i < moraCount; i++) {
        isHighList.push(i === 0);
      }
    } else {
      // 2, 3, 4...: Âm 1 thấp, từ âm 2 đến âm N cao, sau đó hạ thấp
      if (accentNumber === moraCount) {
        pitchTypeLabel = `${accentNumber} 尾高 (Odaka - Cao đuôi)`;
      } else {
        pitchTypeLabel = `${accentNumber} 中高 (Nakadaka - Cao giữa)`;
      }
      for (let i = 0; i < moraCount; i++) {
        const moraIdx1Based = i + 1;
        isHighList.push(moraIdx1Based >= 2 && moraIdx1Based <= accentNumber);
      }
    }
  } else {
    // Mặc định Heiban (chuẩn phổ biến nhất trong tiếng Nhật)
    pitchTypeLabel = '⓪ 平板 (Heiban - Bằng)';
    if (moraCount === 1) {
      isHighList.push(true);
    } else {
      for (let i = 0; i < moraCount; i++) {
        isHighList.push(i > 0);
      }
    }
  }

  const moras: MoraItem[] = morasTexts.map((text, idx) => ({
    text,
    isHigh: isHighList[idx] ?? false
  }));

  const MORA_WIDTH = 76; // Chiều rộng mỗi âm tiết
  const TOTAL_WIDTH = moras.length * MORA_WIDTH;
  const Y_HIGH = 6;     // Độ cao âm bổng (đỉnh)
  const Y_LOW = 24;     // Độ cao âm trầm (đáy)

  // Xây dựng đường line SVG liên tục nối các âm tiết
  let pathD = '';
  const dropPoints: { x: number; y: number }[] = [];

  moras.forEach((mora, idx) => {
    const xStart = idx * MORA_WIDTH;
    const xMid = xStart + MORA_WIDTH / 2;
    const xEnd = (idx + 1) * MORA_WIDTH;
    const yCurrent = mora.isHigh ? Y_HIGH : Y_LOW;

    if (idx === 0) {
      pathD += `M ${xStart + 6} ${yCurrent} L ${xEnd} ${yCurrent}`;
    } else {
      const prevMora = moras[idx - 1];
      const yPrev = prevMora.isHigh ? Y_HIGH : Y_LOW;

      if (yPrev !== yCurrent) {
        // Chuyển bậc (từ bổng hạ trầm hoặc từ trầm lên bổng)
        pathD += ` L ${xStart} ${yCurrent} L ${xEnd} ${yCurrent}`;
        if (yPrev === Y_HIGH && yCurrent === Y_LOW) {
          dropPoints.push({ x: xStart, y: Y_HIGH });
        }
      } else {
        pathD += ` L ${xEnd} ${yCurrent}`;
      }
    }
  });

  return (
    <div className="flex flex-col items-center select-none py-1 gap-1">
      {/* Badge phân loại cao độ NHK */}
      <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${theme === 'light' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-400/20 text-amber-300 border-amber-400/30'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Trọng âm: {pitchTypeLabel}</span>
      </div>

      {/* 1. Đồ thị đường kẻ cao độ Trọng âm chuẩn NHK */}
      <div className="overflow-visible" style={{ width: TOTAL_WIDTH, height: 32 }}>
        <svg
          width={TOTAL_WIDTH}
          height={32}
          className="overflow-visible"
          viewBox={`0 0 ${TOTAL_WIDTH} 32`}
        >
          {/* Đường nền mờ đứt đoạn */}
          <line
            x1="0"
            y1={Y_LOW}
            x2={TOTAL_WIDTH}
            y2={Y_LOW}
            {...{ stroke: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }}
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={Y_HIGH}
            x2={TOTAL_WIDTH}
            y2={Y_HIGH}
            {...{ stroke: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }}
            strokeDasharray="2 2"
            strokeWidth="1"
          />

          {/* Đường line cao độ vàng cam NHK */}
          <path
            d={pathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Điểm rơi cao độ (Drop point) nếu có */}
          {dropPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>

      {/* 2. Các chữ Hiragana nằm tương ứng bên dưới từng cung bậc */}
      <div className="flex items-center justify-center">
        {moras.map((mora, idx) => (
          <div
            key={idx}
            style={{ width: MORA_WIDTH }}
            className={`flex items-center justify-center whitespace-nowrap text-4xl sm:text-5xl font-black transition-colors ${
              mora.isHigh ? (theme === 'light' ? 'text-slate-900' : 'text-white') : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')
            }`}
          >
            {mora.text}
          </div>
        ))}
      </div>
    </div>
  );
};
