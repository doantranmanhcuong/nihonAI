'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Eye,
  Gauge,
  CheckCircle2,
  Repeat,
  Sparkles,
  Trophy,
  HelpCircle,
  Undo2
} from 'lucide-react';

interface StrokeOrderAnimationProps {
  character: string;
  svgStrokes: string[];
  strokeCount: number;
}

interface StrokePoint {
  x: number;
  y: number;
}

export const StrokeOrderAnimation: React.FC<StrokeOrderAnimationProps> = ({
  character,
  svgStrokes,
  strokeCount
}) => {
  // Chuẩn hóa strokes: nếu rỗng, sinh nét giả lập
  const effectiveStrokes = useMemo(() => {
    if (svgStrokes && svgStrokes.length > 0) return svgStrokes;
    const count = strokeCount > 0 ? strokeCount : 4;
    const approximated: string[] = [];
    for (let i = 0; i < count; i++) {
      const y = 20 + (65 / (count + 1)) * (i + 1);
      approximated.push(`M 20,${y} L 85,${y}`);
    }
    return approximated;
  }, [svgStrokes, strokeCount]);

  const totalStrokes = effectiveStrokes.length;

  // Mode: 'watch' (xem hoạt họa) | 'practice' (tập viết đè thông minh)
  const [mode, setMode] = useState<'watch' | 'practice'>('watch');

  // Watch Mode states
  const [currentStep, setCurrentStep] = useState<number>(totalStrokes);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1200);

  // Practice Mode states
  const [practiceStep, setPracticeStep] = useState<number>(0); // 0 đến totalStrokes - 1
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [strokeScores, setStrokeScores] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [userTrail, setUserTrail] = useState<StrokePoint[]>([]);
  const [practiceFeedback, setPracticeFeedback] = useState<{ text: string; type: 'success' | 'warn' | 'info' } | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [lastSnappedStroke, setLastSnappedStroke] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const resetPractice = () => {
    setPracticeStep(0);
    setCompletedStrokes([]);
    setStrokeScores([]);
    setUserTrail([]);
    setPracticeFeedback({ text: 'Tự do vẽ đè lên nét chữ mờ để in nét chuẩn', type: 'info' });
    setIsCelebrationOpen(false);
    setLastSnappedStroke(null);
  };

  // Reset khi đổi chữ Hán
  useEffect(() => {
    setCurrentStep(totalStrokes);
    setIsPlaying(false);
    resetPractice();
  }, [character, effectiveStrokes, totalStrokes]);

  // Watch Mode Auto-play Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (currentStep < totalStrokes) {
        timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, speed);
      } else if (currentStep === totalStrokes) {
        timer = setTimeout(() => {
          if (isLooping) {
            setCurrentStep(1);
          } else {
            setIsPlaying(false);
          }
        }, speed + 600);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalStrokes, speed, isLooping]);

  // Trích xuất tọa độ điểm bắt đầu nét từ chuỗi SVG d="M x y ..."
  const activeStrokeStart = useMemo((): StrokePoint => {
    if (practiceStep >= totalStrokes) return { x: 54, y: 54 };
    const pathStr = effectiveStrokes[practiceStep];
    if (!pathStr) return { x: 54, y: 54 };

    // Regex tìm tọa độ ngay sau M hoặc m
    const match = pathStr.match(/^[Mm]\s*([0-9.]+)[,\s]+([0-9.]+)/);
    if (match) {
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    return { x: 30, y: 30 };
  }, [effectiveStrokes, practiceStep, totalStrokes]);

  // Trích xuất tọa độ điểm kết thúc nét (ước lượng từ chuỗi SVG)
  const activeStrokeEnd = useMemo((): StrokePoint => {
    if (practiceStep >= totalStrokes) return { x: 54, y: 54 };
    const pathStr = effectiveStrokes[practiceStep];
    if (!pathStr) return { x: 54, y: 54 };

    // Tìm cặp số cuối cùng trong chuỗi
    const numbers = pathStr.match(/-?[0-9]+\.?[0-9]*/g);
    if (numbers && numbers.length >= 2) {
      return {
        x: parseFloat(numbers[numbers.length - 2]),
        y: parseFloat(numbers[numbers.length - 1])
      };
    }
    return { x: 80, y: 80 };
  }, [effectiveStrokes, practiceStep, totalStrokes]);

  // Chuyển đổi tọa độ Touch/Mouse thành tọa độ SVG (0 - 109)
  const getSvgCoordinates = (e: React.PointerEvent<SVGSVGElement>): StrokePoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 109;
    const y = ((e.clientY - rect.top) / rect.height) * 109;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (mode !== 'practice' || practiceStep >= totalStrokes) return;
    const pt = getSvgCoordinates(e);
    if (!pt) return;

    setIsDrawing(true);
    setUserTrail([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || mode !== 'practice' || practiceStep >= totalStrokes) return;
    const pt = getSvgCoordinates(e);
    if (!pt) return;

    setUserTrail((prev) => [...prev, pt]);
  };

  const handlePointerUp = () => {
    if (!isDrawing || mode !== 'practice' || practiceStep >= totalStrokes) return;
    setIsDrawing(false);

    if (userTrail.length < 2) {
      setUserTrail([]);
      return;
    }

    // Đánh giá nét vẽ của người dùng so với nét chuẩn
    const userStart = userTrail[0];
    const userEnd = userTrail[userTrail.length - 1];

    const distStart = Math.hypot(userStart.x - activeStrokeStart.x, userStart.y - activeStrokeStart.y);
    const distEnd = Math.hypot(userEnd.x - activeStrokeEnd.x, userEnd.y - activeStrokeEnd.y);

    // Tính tổng độ dài nét vẽ người dùng
    let userLength = 0;
    for (let i = 1; i < userTrail.length; i++) {
      userLength += Math.hypot(userTrail[i].x - userTrail[i - 1].x, userTrail[i].y - userTrail[i - 1].y);
    }

    // Tự do vẽ đè lên nét mờ: nếu người dùng vẽ nét có độ dài tối thiểu
    if (userLength >= 8) {
      // Tự động in khớp (snap) đẹp chuẩn nét mờ
      const deviation = Math.min(distStart, distEnd);
      const strokeScore = Math.max(85, Math.min(100, Math.round(100 - deviation * 0.4)));

      const nextCompleted = [...completedStrokes, practiceStep];
      const nextScores = [...strokeScores, strokeScore];

      setCompletedStrokes(nextCompleted);
      setStrokeScores(nextScores);
      setLastSnappedStroke(practiceStep);

      // Hiệu ứng phản hồi
      setPracticeFeedback({
        text: `Đã in nét ${practiceStep + 1} chuẩn xác! (${strokeScore}/100 điểm)`,
        type: 'success'
      });

      setUserTrail([]);

      if (nextCompleted.length === totalStrokes) {
        // Hoàn thành cả chữ!
        setTimeout(() => {
          setIsCelebrationOpen(true);
        }, 400);
      } else {
        setPracticeStep((prev) => prev + 1);
      }
    } else {
      setUserTrail([]);
    }
  };

  // Nút hỗ trợ Tự động Snap nét hiện tại (nếu người học gặp nét khó)
  const handleAutoSnapCurrentStroke = () => {
    if (practiceStep >= totalStrokes) return;
    const nextCompleted = [...completedStrokes, practiceStep];
    const nextScores = [...strokeScores, 85];

    setCompletedStrokes(nextCompleted);
    setStrokeScores(nextScores);
    setLastSnappedStroke(practiceStep);
    setUserTrail([]);

    setPracticeFeedback({
      text: `Đã tự động khớp nét ${practiceStep + 1}`,
      type: 'info'
    });

    if (nextCompleted.length === totalStrokes) {
      setTimeout(() => setIsCelebrationOpen(true), 400);
    } else {
      setPracticeStep((prev) => prev + 1);
    }
  };

  // Quay lại nét trước đó trong lúc luyện tập
  const handleUndoPracticeStroke = () => {
    if (practiceStep <= 0 || completedStrokes.length === 0) return;
    setCompletedStrokes((prev) => prev.slice(0, -1));
    setStrokeScores((prev) => prev.slice(0, -1));
    setPracticeStep((prev) => Math.max(0, prev - 1));
    setUserTrail([]);
    setPracticeFeedback({ text: 'Đã quay lại nét trước', type: 'info' });
  };

  // Tính điểm trung bình tổng kết
  const averageScore = useMemo(() => {
    if (strokeScores.length === 0) return 0;
    const sum = strokeScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / strokeScores.length);
  }, [strokeScores]);

  const scoreEvaluation = useMemo(() => {
    if (averageScore >= 90) {
      return {
        title: 'Xuất sắc! Tuyệt vời!',
        stars: '⭐⭐⭐',
        desc: 'Nét chữ điêu luyện, chuẩn xác thứ tự và độ nghiêng tuyệt đối!',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    } else if (averageScore >= 75) {
      return {
        title: 'Rất tốt! Khá điêu luyện!',
        stars: '⭐⭐',
        desc: 'Đúng thứ tự nét vẽ và bố cục chuẩn. Hãy luyện thêm cho nét đầm tay hơn!',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    }
    return {
      title: 'Cần luyện thêm!',
      stars: '⭐',
      desc: 'Hãy chú ý thứ tự xuất phát và điểm gãy của các nét phức tạp nhé!',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    };
  }, [averageScore]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center gap-5 w-full select-none">
      {/* Header & Chuyển đổi Chế độ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-slate-800">Thứ tự nét viết:</span>
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-md">
            {totalStrokes} nét
          </span>
          <span className="text-xs text-slate-400 font-medium">【{character}】</span>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'watch' && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs font-bold text-slate-600">
              <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {[
                { label: 'Chậm', val: 1800 },
                { label: 'Chuẩn', val: 1200 },
                { label: 'Nhanh', val: 700 }
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setSpeed(s.val)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    speed === s.val ? 'bg-indigo-600 text-white shadow-2xs' : 'hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setMode('watch');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mode === 'watch' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Xem hoạt họa
            </button>
            <button
              onClick={() => {
                setMode('practice');
                setIsPlaying(false);
                resetPractice();
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mode === 'practice' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Tập viết đè (Khớp tự động)
            </button>
          </div>
        </div>
      </div>

      {/* ================= CHẾ ĐỘ 1: XEM HOẠT HỌA ================= */}
      {mode === 'watch' && (
        <>
          <div className="relative w-68 h-68 bg-slate-50 rounded-3xl border-2 border-slate-200/90 shadow-inner flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 109 109" className="w-full h-full absolute inset-0">
              {/* Lưới chữ thập nét đứt */}
              <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Chữ mờ tham chiếu toàn bộ */}
              {effectiveStrokes.map((strokePath, idx) => (
                <path
                  key={`ghost-${idx}`}
                  d={strokePath}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Vẽ từng nét SVG xuất hiện theo bước */}
              {effectiveStrokes.slice(0, currentStep).map((strokePath, idx) => {
                const isLastStroke = idx === currentStep - 1;
                return (
                  <path
                    key={`stroke-${idx}`}
                    d={strokePath}
                    fill="none"
                    stroke={isLastStroke && isPlaying ? '#4f46e5' : '#0f172a'}
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5">
              {currentStep === totalStrokes ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành ({totalStrokes}/{totalStrokes})
                </span>
              ) : (
                <span>
                  Nét {currentStep} / {totalStrokes}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(Math.max(1, currentStep - 1));
              }}
              disabled={currentStep <= 1}
              className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl disabled:opacity-30 transition-all shadow-2xs"
              title="Lùi 1 nét"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  if (currentStep >= totalStrokes) setCurrentStep(1);
                  setIsPlaying(true);
                }
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Tạm dừng' : currentStep === totalStrokes ? 'Xem lại từ đầu' : 'Xem tự động'}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(Math.min(totalStrokes, currentStep + 1));
              }}
              disabled={currentStep >= totalStrokes}
              className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl disabled:opacity-30 transition-all shadow-2xs"
              title="Tiến 1 nét"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentStep(1);
                setIsPlaying(true);
              }}
              className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-2xs"
              title="Phát lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2.5 border rounded-xl transition-all shadow-2xs ${
                isLooping
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={isLooping ? 'Tắt lặp lại' : 'Bật tự động lặp lại'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* ================= CHẾ ĐỘ 2: TẬP VIẾT ĐÈ THÔNG MINH ================= */}
      {mode === 'practice' && (
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Thông báo hướng dẫn & Trạng thái nét */}
          {practiceFeedback && (
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                practiceFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                  : practiceFeedback.type === 'warn'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{practiceFeedback.text}</span>
            </div>
          )}

          {/* Vùng vẽ tương tác SVG trực tiếp */}
          <div className="relative w-72 h-72 bg-slate-50/90 rounded-3xl border-2 border-indigo-200 shadow-inner overflow-hidden cursor-crosshair touch-none">
            <svg
              ref={svgRef}
              viewBox="0 0 109 109"
              className="w-full h-full absolute inset-0"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Lưới chữ thập ô chữ */}
              <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Lớp nền chữ Hán mờ toàn bộ */}
              {effectiveStrokes.map((strokePath, idx) => (
                <path
                  key={`bg-ghost-${idx}`}
                  d={strokePath}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Nét đang cần vẽ: Viền nét đứt hướng dẫn */}
              {practiceStep < totalStrokes && effectiveStrokes[practiceStep] && (
                <path
                  d={effectiveStrokes[practiceStep]}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 3"
                  className="animate-pulse"
                />
              )}

              {/* Các nét đã vẽ đúng (Đã SNAP) */}
              {completedStrokes.map((sIdx) => (
                <path
                  key={`snapped-${sIdx}`}
                  d={effectiveStrokes[sIdx]}
                  fill="none"
                  stroke="#4338ca"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={lastSnappedStroke === sIdx ? 'transition-all duration-300' : ''}
                />
              ))}

              {/* Nét tay người dùng đang vẽ thời gian thực */}
              {userTrail.length > 1 && (
                <polyline
                  points={userTrail.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.8"
                />
              )}
            </svg>

            {/* Chỉ báo tiến độ nét */}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 shadow-2xs">
              Nét {Math.min(practiceStep + 1, totalStrokes)} / {totalStrokes}
            </div>
          </div>

          {/* Thanh công cụ hỗ trợ luyện viết */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <button
              onClick={handleUndoPracticeStroke}
              disabled={practiceStep === 0}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <Undo2 className="w-3.5 h-3.5" /> Nét trước
            </button>

            <button
              onClick={handleAutoSnapCurrentStroke}
              disabled={practiceStep >= totalStrokes}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Tự động khớp nét
            </button>

            <button
              onClick={resetPractice}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Viết lại từ đầu
            </button>
          </div>

          {/* Modal / Thẻ Chúc mừng & Đánh giá điểm */}
          {isCelebrationOpen && (
            <div className="w-full max-w-sm p-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50 rounded-2xl border-2 border-indigo-200 shadow-md flex flex-col items-center text-center gap-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                <Trophy className="w-6 h-6" />
              </div>

              <div>
                <span className="text-lg">{scoreEvaluation.stars}</span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">{scoreEvaluation.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{scoreEvaluation.desc}</p>
              </div>

              <div className="flex items-center gap-4 py-2 border-y border-slate-100 w-full justify-center">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Điểm độ khớp</span>
                  <span className="text-2xl font-black text-indigo-600">{averageScore}/100</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Số nét hoàn thành</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {completedStrokes.length}/{totalStrokes}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={resetPractice}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all"
                >
                  Luyện viết lại
                </button>
                <button
                  onClick={() => setIsCelebrationOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
