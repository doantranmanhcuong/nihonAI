'use client';

import React from 'react';
import { Share2 } from 'lucide-react';

interface RadicalGraphProps {
  kanji: string;
  radicals: { symbol: string; name: string }[];
}

export const RadicalGraph: React.FC<RadicalGraphProps> = ({ kanji, radicals }) => {
  // Lọc bỏ những bộ thủ trùng hoàn toàn với chính chữ đó (trừ phi chỉ có 1 bộ thủ tự thân)
  const validRadicals = (radicals || []).filter(
    (r) => r.symbol && (radicals.length === 1 || r.symbol !== kanji)
  );

  const isSingleRadical =
    validRadicals.length <= 1 &&
    (!validRadicals[0] || validRadicals[0].symbol === kanji);

  const numNodes = validRadicals.length;
  const svgHeight = 220;
  const targetX = 195;
  const targetY = 110;

  return (
    <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-indigo-600" />
          Sơ đồ Cấu tạo Bộ thủ
        </h4>
        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md font-bold">
          {isSingleRadical ? 'Bộ thủ tự thân (Đơn lập)' : `${validRadicals.length} Bộ thủ thành phần`}
        </span>
      </div>

      {/* Đồ họa SVG động tự thích ứng mọi số lượng bộ thủ */}
      <div className="relative w-full h-56 flex items-center justify-center bg-slate-50/80 rounded-2xl border border-slate-200/70 overflow-hidden shadow-inner p-2">
        {isSingleRadical ? (
          /* TRƯỜNG HỢP 1: Chữ đơn lập (Bộ thủ độc lập) */
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-5xl font-black shadow-md border-4 border-white">
                {kanji}
              </div>
              <div className="absolute -bottom-2 -right-1 px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full shadow-2xs border border-white">
                Bộ thủ gốc
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium text-center max-w-[220px] mt-1">
              Chữ <span className="font-bold text-slate-800">{kanji}</span> là chữ tượng hình đơn lập, kiêm luôn vai trò bộ thủ tự thân.
            </p>
          </div>
        ) : (
          /* TRƯỜNG HỢP 2: Chữ ghép từ 2 bộ thủ trở lên (Đa phân rã động) */
          <svg viewBox="0 0 260 220" className="w-full h-full">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#6366f1" />
              </marker>
              <linearGradient id="gradRadical" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="gradKanji" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>

            {/* Render các đường nối từ mỗi bộ thủ sang chữ Kanji đích */}
            {validRadicals.map((_, idx) => {
              const nodeY = (svgHeight / (numNodes + 1)) * (idx + 1);
              const nodeX = 55;
              return (
                <g key={`line-${idx}`}>
                  <line
                    x1={nodeX + 22}
                    y1={nodeY}
                    x2={targetX - 28}
                    y2={targetY}
                    stroke="#818cf8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrowhead)"
                  />
                  <circle
                    cx={(nodeX + targetX) / 2}
                    cy={(nodeY + targetY) / 2}
                    r="2.5"
                    fill="#6366f1"
                  />
                </g>
              );
            })}

            {/* Dấu cộng giữa các bộ thủ nếu có 2 bộ thủ */}
            {numNodes === 2 && (
              <text
                x="55"
                y="115"
                textAnchor="middle"
                className="text-lg font-black fill-slate-400 select-none"
              >
                +
              </text>
            )}

            {/* Render các Node Bộ thủ bên trái */}
            {validRadicals.map((rad, idx) => {
              const nodeY = (svgHeight / (numNodes + 1)) * (idx + 1);
              const nodeX = 55;
              const radius = numNodes > 2 ? 20 : 25;
              return (
                <g
                  key={`node-${idx}`}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  style={{ transformOrigin: `${nodeX}px ${nodeY}px` }}
                >
                  <circle
                    cx={nodeX}
                    cy={nodeY}
                    r={radius}
                    fill="url(#gradRadical)"
                    stroke="#ffffff"
                    strokeWidth="3"
                    className="shadow-sm"
                  />
                  <text
                    x={nodeX}
                    y={nodeY + (radius > 22 ? 8 : 6)}
                    textAnchor="middle"
                    className={`${radius > 22 ? 'text-2xl' : 'text-xl'} font-black fill-white select-none`}
                  >
                    {rad.symbol}
                  </text>
                </g>
              );
            })}

            {/* Node Kanji Đích (Phía phải - Màu Xanh Indigo) */}
            <g
              className="cursor-pointer hover:scale-105 transition-transform"
              style={{ transformOrigin: `${targetX}px ${targetY}px` }}
            >
              <circle
                cx={targetX}
                cy={targetY}
                r="34"
                fill="url(#gradKanji)"
                stroke="#ffffff"
                strokeWidth="4"
                className="shadow-lg"
              />
              <text
                x={targetX}
                y={targetY + 11}
                textAnchor="middle"
                className="text-3xl font-black fill-white select-none"
              >
                {kanji}
              </text>
            </g>
          </svg>
        )}
      </div>

      {/* Danh sách nhãn bộ thủ tiếng Việt */}
      <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center w-full">
        {validRadicals.map((rad, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 bg-amber-50 border border-amber-200/90 text-amber-950 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1"
          >
            <span className="text-amber-700 font-extrabold text-sm">{rad.symbol}:</span>
            <span>{rad.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
