'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class StudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[StudioErrorBoundary] Caught render error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Nếu là lỗi ChunkLoadError do phiên bản mới được deploy, làm mới trang để nạp chunk mới nhất
    if (this.state.error?.name === 'ChunkLoadError' || this.state.error?.message?.includes('Loading chunk')) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200/80 p-10 flex flex-col items-center justify-center gap-4 min-h-[380px] shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-800">
              {this.props.fallbackTitle || 'Không thể hiển thị phân hệ học tập'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Kết nối mạng gặp gián đoạn hoặc phiên làm việc vừa được cập nhật bản mới. Vui lòng bấm thử lại để tiếp tục học.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Thử tải lại phân hệ</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
