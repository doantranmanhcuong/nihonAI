'use client';

import React from 'react';
import { FileText, CheckCircle2, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

export interface LessonSummaryItem {
  lesson: number;
  title: string;
  topic: string;
  wordCount: number;
  progressPercent: number;
  samples?: string[];
}

interface LessonGridViewProps {
  curriculumTitle: string;
  totalLessons: number;
  lessons: LessonSummaryItem[];
  onSelectLesson: (lessonNum: number) => void;
  isLoading: boolean;
}

export const LessonGridView: React.FC<LessonGridViewProps> = ({
  curriculumTitle,
  totalLessons,
  lessons,
  onSelectLesson,
  isLoading
}) => {
  // Tính tổng tiến độ hoàn thành
  const completedLessons = lessons.filter((l) => l.progressPercent >= 100).length;
  const inProgressLessons = lessons.filter((l) => l.progressPercent > 0).length;
  const overallPercent = totalLessons > 0 ? Math.round((inProgressLessons / totalLessons) * 100) : 0;

  if (isLoading) {
    return (
      <div className="bg-white p-16 rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-600">Đang tải danh sách bài học...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* 1. Header Giáo trình & Thanh Tiến độ Tổng quan (Tương ứng Ảnh 1) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{curriculumTitle}</span>
              <span className="text-xs font-extrabold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                {totalLessons} bài học
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Lộ trình bài bản với ngữ cảnh thực tế, trọng âm chuẩn NHK và liên kết Hán tự chuyên sâu.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-slate-700">
              {inProgressLessons} / {totalLessons} bài
            </span>
            <span className="text-xs font-bold text-indigo-600 ml-2">
              ({overallPercent}% hoàn thành)
            </span>
          </div>
        </div>

        {/* Thanh tiến độ */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(overallPercent, 2)}%` }}
          />
        </div>
      </div>

      {/* 2. Lưới Thẻ Bài Học (Responsive 2 Cột giống giao diện trong Ảnh 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {lessons.map((item) => {
          const isDone = item.progressPercent >= 100;
          const hasStarted = item.progressPercent > 0;

          return (
            <div
              key={item.lesson}
              onClick={() => onSelectLesson(item.lesson)}
              className="p-4 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-xs"
            >
              {/* Bên trái: Icon + Tên bài + Chủ đề bài học */}
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  hasStarted ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    {isDone && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium block truncate max-w-[220px] sm:max-w-[280px]">
                    {item.topic}
                  </span>
                </div>
              </div>

              {/* Bên phải: Số lượng từ vựng + Mũi tên */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors shrink-0">
                  {item.wordCount} từ
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
