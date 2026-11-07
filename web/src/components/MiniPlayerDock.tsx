'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Music,
  FastForward,
  X,
} from 'lucide-react';
import { Song, AppLanguage, getSongTitle, getSongArtist } from '@/types/song';
import { getSongBpm } from '@/lib/playlistGenerator';

export interface MiniPlayerDockProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  lang?: AppLanguage;
  onOpenPlaylist?: () => void;
  targetBpm?: number;
}

export const MiniPlayerDock: React.FC<MiniPlayerDockProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onClose,
  onNext,
  onPrev: _onPrev,
  lang = 'ko',
  onOpenPlaylist,
  targetBpm = 160,
}) => {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const songBpm = currentSong ? getSongBpm(currentSong) : targetBpm;
  const title = currentSong ? getSongTitle(currentSong, lang) : '';
  const artist = currentSong ? getSongArtist(currentSong, lang) : '';

  return (
    <div className="fixed bottom-[72px] inset-x-0 z-40 flex justify-center pointer-events-none px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="pointer-events-auto w-full max-w-[398px] h-[54px] px-3 rounded-full bg-white/85 dark:bg-zinc-900/88 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_8px_28px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.55)] flex items-center justify-between gap-2.5 relative overflow-hidden"
      >
        {/* Bottom edge progress bar when active */}
        {currentSong && (
          <div className="absolute bottom-0 inset-x-4 h-[2px] bg-black/5 dark:bg-white/10 overflow-hidden rounded-full">
            <div
              className="bg-[#C4FF00] h-full transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Left: Thumbnail & Visualizer */}
        <button
          type="button"
          onClick={onOpenPlaylist}
          aria-label={currentSong ? `${title} - ${artist}` : 'Open Playlist'}
          className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center relative shadow-xs cursor-pointer focus:outline-hidden"
        >
          {currentSong?.cover_url ? (
            <Image
              src={currentSong.cover_url}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <Music className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          )}

          {/* Equalizer animation when playing */}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="flex items-end gap-[1.5px] h-3">
                <span className="w-0.5 bg-[#C4FF00] h-full animate-bounce" />
                <span className="w-0.5 bg-[#C4FF00] h-2/3 animate-bounce [animation-delay:0.15s]" />
                <span className="w-0.5 bg-[#C4FF00] h-4/5 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </button>

        {/* Center: Apple Music 2-line Typography */}
        <button
          type="button"
          onClick={onOpenPlaylist}
          className="flex-1 min-w-0 text-left flex flex-col justify-center cursor-pointer select-none focus:outline-hidden"
        >
          <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-400 truncate flex items-center gap-1">
            <span>PULSE</span>
            <span className="text-zinc-400 dark:text-zinc-500">→</span>
            <span className="text-zinc-500 dark:text-zinc-300 font-bold">
              {currentSong ? `${songBpm} BPM` : `${targetBpm} BPM Cadence`}
            </span>
          </div>
          <div className="text-[13px] font-bold text-zinc-900 dark:text-white truncate leading-tight mt-0.5">
            {currentSong ? (
              `${title} · ${artist}`
            ) : (
              <span className="text-zinc-400 dark:text-zinc-400 font-medium">
                {lang === 'ko' ? '재생 대기 중' : 'Not Playing'}
              </span>
            )}
          </div>
        </button>

        {/* Right: Apple Music Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? (lang === 'ko' ? '일시 정지' : 'Pause') : (lang === 'ko' ? '재생' : 'Play')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-zinc-900 dark:text-white" />
            ) : (
              <Play className="w-4 h-4 fill-current text-zinc-900 dark:text-white ml-0.5" />
            )}
          </button>

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label={lang === 'ko' ? '다음 곡' : 'Next track'}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <FastForward className="w-4 h-4 fill-current text-zinc-900 dark:text-white" />
            </button>
          )}

          {currentSong && (
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'ko' ? '플레이어 닫기' : 'Close player'}
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
