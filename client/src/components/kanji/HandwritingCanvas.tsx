'use client';

import React, { useRef, useState, useEffect } from 'react';
import { apiGateway } from '@/services/api-gateway.client';
import { Trash2, Loader2, PenTool, Sparkles } from 'lucide-react';

interface HandwritingCanvasProps {
  onSelectKanji: (character: string) => void;
  onClear: () => void;
  selectedKanji: string | null;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  onSelectKanji,
  onClear,
  selectedKanji
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<number[][][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number[]; y: number[]; t: number[] }>({
    x: [],
    y: [],
    t: []
  });
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Khởi tạo và vẽ lưới chữ thập nét đứt trên Canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Đường lưới chữ thập nét đứt thanh lịch
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Đường ngang giữa
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Đường dọc giữa
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke({ x: [x], y: [y], t: [Date.now()] });

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    setCurrentStroke(prev => ({
      x: [...prev.x, x],
      y: [...prev.y, y],
      t: [...prev.t, Date.now()]
    }));
  };

  const endDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.x.length > 0) {
      const updatedStrokes = [...strokes, [currentStroke.x, currentStroke.y, currentStroke.t]];
      setStrokes(updatedStrokes);
      await recognizeStrokes(updatedStrokes);
    }
  };

  const recognizeStrokes = async (strokeData: number[][][]) => {
    try {
      setIsRecognizing(true);
      const res = await apiGateway.kanji.recognizeHandwriting(strokeData);

      if (res && res.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
        if (res.candidates[0]) {
          onSelectKanji(res.candidates[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi nhận diện viết tay:', err);
    } finally {
      setIsRecognizing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx, canvas.width, canvas.height);
    setStrokes([]);
    setCurrentStroke({ x: [], y: [], t: [] });
    setCandidates([]);
    onClear();
  };

  return (
    <div className="flex flex-col items-center bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 w-full">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-indigo-600" />
          Khung Vẽ Nhận Diện Kanji
        </h3>
        {isRecognizing ? (
          <span className="text-[11px] text-indigo-600 flex items-center gap-1 font-bold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang nhận diện...
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">Vẽ tay bằng chuột/cảm ứng</span>
        )}
      </div>

      {/* Khung Canvas vẽ tay */}
      <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50 cursor-crosshair w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="touch-none"
        />
      </div>

      {/* Dãy nút ứng viên nhận diện & Nút Xóa (Chỉ hiện khi đã vẽ hoặc có ứng viên) */}
      {candidates.length > 0 ? (
        <div className="flex items-center gap-2 mt-4 w-full overflow-x-auto pb-1 animate-in fade-in duration-300">
          <button
            onClick={clearCanvas}
            title="Xóa bảng vẽ"
            className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {candidates.map((char, index) => {
              const isSelected = selectedKanji === char;
              return (
                <button
                  key={index}
                  onClick={() => onSelectKanji(char)}
                  className={`min-w-[42px] h-10 px-2.5 text-xl font-black rounded-xl border transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between w-full px-1 text-xs text-slate-400">
          <span>Khung vẽ đang trống</span>
          {strokes.length > 0 && (
            <button
              onClick={clearCanvas}
              className="text-red-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa
            </button>
          )}
        </div>
      )}
    </div>
  );
};
