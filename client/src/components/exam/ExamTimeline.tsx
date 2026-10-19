import React from 'react';
import { Clock, BookOpen, Headphones, PlayCircle, Coffee } from 'lucide-react';

interface ExamTimelineProps {
  durationMinutes: number;
  onStart: () => void;
  level: string;
}

export const ExamTimeline: React.FC<ExamTimelineProps> = ({ durationMinutes, onStart, level }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 bg-slate-50 min-h-[80vh] flex flex-col md:flex-row gap-8 items-center justify-center rounded-2xl">
      {/* Timeline Column */}
      <div className="flex-1 w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Tổng thời lượng: {durationMinutes} phút</h2>
        
        <div className="relative pl-6 border-l-2 border-indigo-100 space-y-8">
          
          <div className="relative">
            <div className="absolute -left-[31px] bg-orange-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
            <p className="text-sm font-semibold text-slate-700">Bắt đầu</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-orange-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <p className="text-base font-bold text-slate-800">Từ vựng - Kanji - Ngữ pháp</p>
            </div>
            <p className="text-sm text-slate-500 font-medium">50 phút</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-green-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
            <p className="text-base font-bold text-slate-800 mb-1">Tạm nghỉ</p>
            <p className="text-sm text-slate-500 font-medium">5 phút</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-orange-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <p className="text-base font-bold text-slate-800">Đọc hiểu</p>
            </div>
            <p className="text-sm text-slate-500 font-medium">50 phút</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-green-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
            <p className="text-base font-bold text-slate-800 mb-1">Tạm nghỉ</p>
            <p className="text-sm text-slate-500 font-medium">10 phút</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-orange-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
            <div className="flex items-center gap-2 mb-1">
              <Headphones className="w-4 h-4 text-slate-500" />
              <p className="text-base font-bold text-slate-800">Nghe hiểu</p>
            </div>
            <p className="text-sm text-slate-500 font-medium">45 phút</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-orange-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
            <p className="text-sm font-semibold text-slate-700">Kết thúc</p>
          </div>

        </div>
      </div>

      {/* Action Column */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <p className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-2">ĐỀ THI TIÊU CHUẨN</p>
          <h1 className="text-3xl font-black text-slate-900 mb-4">JLPT {level}</h1>
          <p className="text-slate-500 font-medium">Hệ thống sẽ mô phỏng áp lực thời gian giống 100% khi thi thật. Vui lòng chuẩn bị sẵn sàng trước khi bắt đầu.</p>
        </div>
        
        <button 
          onClick={onStart}
          className="w-full md:w-auto px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
        >
          <PlayCircle className="w-6 h-6" />
          Bắt đầu làm bài
        </button>
      </div>
    </div>
  );
};
