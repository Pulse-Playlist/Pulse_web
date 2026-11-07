'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Critical Space Fix: When !currentSong, return null to avoid stealing screen space and colliding with bottom CTAs
  if (!currentSong) {
    return null;
  }

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const songBpm = getSongBpm(currentSong) || targetBpm;
  const songZoneColor = songBpm <= 130 ? '#C4FF00' : songBpm <= 160 ? '#3B82F6' : '#FF4B4B';
  const isLime = songBpm <= 130;
  const title = getSongTitle(currentSong, lang);
  const artist = getSongArtist(currentSong, lang);

  return (
    <AnimatePresence>
      <div className="fixed bottom-[76px] inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          className="pointer-events-auto w-full max-w-[390px] h-[52px] px-3 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_6px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2.5 relative overflow-hidden"
        >
          {/* Bottom edge progress bar synchronized with songZoneColor */}
          {duration > 0 && (
            <div className="absolute bottom-0 inset-x-4 h-[2px] bg-black/5 dark:bg-white/10 overflow-hidden rounded-full">
              <div
                className="h-full transition-all duration-150 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: songZoneColor }}
              />
            </div>
          )}

          {/* Left: Thumbnail (Crisp and clean, with BPM zone border glow when playing) */}
          <button
            type="button"
            onClick={onOpenPlaylist}
            aria-label={`${title} - ${artist}`}
            style={isPlaying ? { borderColor: `${songZoneColor}80`, borderWidth: '1.5px' } : undefined}
            className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-zinc-200/80 dark:bg-zinc-800 border border-transparent flex items-center justify-center relative shadow-xs cursor-pointer focus:outline-hidden transition-colors"
          >
            {currentSong.cover_url ? (
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
              <span
                className={`font-bold ${isLime ? 'text-[#3f6212] dark:text-[#C4FF00]' : ''}`}
                style={!isLime ? { color: songZoneColor } : undefined}
              >
                {songBpm} BPM
              </span>
            </div>
            <div className="text-[13px] font-bold text-zinc-900 dark:text-white truncate leading-tight mt-0.5">
              {title} · {artist}
            </div>
          </button>

          {/* Right: Apple Music Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? (lang === 'ko' ? '일시 정지' : 'Pause') : (lang === 'ko' ? '재생' : 'Play')}
              style={
                isPlaying
                  ? {
                      backgroundColor: songZoneColor,
                      color: isLime ? '#000000' : '#FFFFFF',
                    }
                  : undefined
              }
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isPlaying
                  ? 'shadow-xs'
                  : 'text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {onNext && (
              <button
                type="button"
                onClick={onNext}
                aria-label={lang === 'ko' ? '다음 곡' : 'Next track'}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <FastForward className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'ko' ? '플레이어 닫기' : 'Close player'}
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
