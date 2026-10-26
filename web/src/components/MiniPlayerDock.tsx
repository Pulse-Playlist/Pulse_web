'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, X, Music } from 'lucide-react';
import { Song } from '@/types/song';
import { getSongBpm } from '@/lib/playlistGenerator';

interface MiniPlayerDockProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onClose: () => void;
}

export const MiniPlayerDock: React.FC<MiniPlayerDockProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onClose,
}) => {
  if (!currentSong) return null;

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const songBpm = getSongBpm(currentSong);

  const formatSec = (sec: number) => {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' : ''}${r}`;
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-zinc-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
        {/* Progress line */}
        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-[#C4FF00] h-full transition-all duration-150 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Song Cover Thumbnail */}
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 bg-zinc-800 border border-zinc-700/60">
            {currentSong.cover_url ? (
              <Image
                src={currentSong.cover_url}
                alt={currentSong.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Music className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">
                {currentSong.title}
              </span>
              <span className="text-[10px] font-black text-black bg-[#C4FF00] px-1 py-0.2 rounded shrink-0">
                {songBpm} BPM
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              {currentSong.artist} · 30초 미리듣기 ({formatSec(currentTime)} / {formatSec(duration)})
            </div>
          </div>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? '일시 정지' : '재생'}
            className="w-9 h-9 rounded-full bg-[#C4FF00] text-black flex items-center justify-center shrink-0 hover:bg-[#B8F500] active:scale-95 transition-all shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          {/* Close Dock */}
          <button
            type="button"
            onClick={onClose}
            aria-label="플레이어 닫기"
            className="p-1 rounded-full text-zinc-400 hover:text-white shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
