import React, { useState, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { Pen, Eraser, Undo, Trash2, X } from "lucide-react";

export interface CanvasOverlayProps {
  enabled: boolean;
  onClose: () => void;
}

interface Path {
  id: number;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({ enabled, onClose }) => {
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [pathIdCounter, setPathIdCounter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  if (!enabled) return null;

  const getCoordinates = (e: ReactMouseEvent | ReactTouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as ReactMouseEvent).clientX;
      clientY = (e as ReactMouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (x: number, y: number) => {
    isDrawing.current = true;
    if (mode === "pen") {
      setCurrentPath({
        id: pathIdCounter,
        points: [{ x, y }],
        color: "#ef4444", // red pen
        width: 3,
      });
      setPathIdCounter((prev) => prev + 1);
    } else {
      // Eraser mode: check if clicking on a path
      erasePathAt(x, y);
    }
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing.current) return;
    if (mode === "pen" && currentPath) {
      setCurrentPath((prev) => {
        if (!prev) return prev;
        return { ...prev, points: [...prev.points, { x, y }] };
      });
    } else if (mode === "eraser") {
      erasePathAt(x, y);
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    if (currentPath && mode === "pen") {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath(null);
    }
  };

  const erasePathAt = (x: number, y: number) => {
    const threshold = 15; // pixels
    setPaths((prevPaths) => {
      return prevPaths.filter((path) => {
        // check if any point in the path is within threshold
        const hit = path.points.some(
          (pt) => Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2)) < threshold
        );
        return !hit;
      });
    });
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    const { x, y } = getCoordinates(e);
    startDrawing(x, y);
  };
  const handleMouseMove = (e: ReactMouseEvent) => {
    const { x, y } = getCoordinates(e);
    draw(x, y);
  };
  const handleMouseUp = () => stopDrawing();

  const handleTouchStart = (e: ReactTouchEvent) => {
    const { x, y } = getCoordinates(e);
    startDrawing(x, y);
  };
  const handleTouchMove = (e: ReactTouchEvent) => {
    if (e.cancelable) e.preventDefault();
    // e.preventDefault();
    const { x, y } = getCoordinates(e);
    draw(x, y);
  };
  const handleTouchEnd = () => stopDrawing();

  const handleUndo = () => setPaths((prev) => prev.slice(0, -1));
  const handleClear = () => setPaths([]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={containerRef}
        className={`absolute inset-0 pointer-events-auto touch-none ${mode === 'eraser' ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <svg className="w-full h-full">
          {paths.map((p) => (
            <polyline
              key={p.id}
              points={p.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
              fill="none"
              stroke={p.color}
              strokeWidth={p.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath && mode === "pen" && (
            <polyline
              points={currentPath.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
              fill="none"
              stroke={currentPath.color}
              strokeWidth={currentPath.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto bg-white rounded-full shadow-xl border border-slate-200 px-2 py-1.5 flex items-center gap-1">
        <button
          onClick={() => setMode("pen")}
          className={`flex flex-col items-center justify-center w-12 h-10 rounded-full text-[10px] font-bold ${
            mode === "pen" ? "text-rose-600 bg-rose-50" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Pen className="w-4 h-4 mb-0.5" />
          Bút
        </button>
        <button
          onClick={() => setMode("eraser")}
          className={`flex flex-col items-center justify-center w-12 h-10 rounded-full text-[10px] font-bold ${
            mode === "eraser" ? "text-rose-600 bg-rose-50" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Eraser className="w-4 h-4 mb-0.5" />
          Tẩy
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <button
          onClick={handleUndo}
          className="flex flex-col items-center justify-center w-12 h-10 rounded-full text-[10px] font-bold text-slate-500 hover:bg-slate-100"
        >
          <Undo className="w-4 h-4 mb-0.5" />
          Hoàn tác
        </button>
        <button
          onClick={handleClear}
          className="flex flex-col items-center justify-center w-12 h-10 rounded-full text-[10px] font-bold text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="w-4 h-4 mb-0.5" />
          Xóa hết
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <button
          onClick={onClose}
          className="flex flex-col items-center justify-center w-12 h-10 rounded-full text-[10px] font-bold text-slate-500 hover:bg-slate-100"
        >
          <X className="w-4 h-4 mb-0.5" />
          Đóng
        </button>
      </div>
    </div>
  );
};
