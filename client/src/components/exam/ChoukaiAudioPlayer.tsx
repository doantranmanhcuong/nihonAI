'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones } from 'lucide-react';

interface ChoukaiAudioPlayerProps {
  src: string;
  orderNumber?: number;
  title?: string;
  className?: string;
}

export function ChoukaiAudioPlayer({
  src,
  orderNumber,
  title = 'Âm thanh nghe hiểu Choukai',
  className = ''
}: ChoukaiAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 font-sans ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Headphones className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 truncate">{title}</div>
            {orderNumber !== undefined && (
              <div className="text-[11px] text-slate-400 font-medium">Câu hỏi số {orderNumber}</div>
            )}
          </div>
        </div>

        {/* Center / Controls */}
        <div className="flex-1 max-w-md flex items-center gap-3 w-full">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center shrink-0 transition-transform cursor-pointer shadow-sm"
            title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
          </button>

          {/* Time display: Current / Total */}
          <span className="text-[11px] font-mono text-slate-300 w-24 shrink-0 text-center select-none">
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>

          {/* Seek slider */}
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Right: Speed pills & Mute */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {/* Speed selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeRate(rate)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Mute button */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
