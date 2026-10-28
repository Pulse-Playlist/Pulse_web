'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  X,
  Music,
  SkipForward,
  SkipBack,
  ExternalLink,
} from 'lucide-react';
import { Song, AppLanguage, getSongTitle, getSongArtist } from '@/types/song';
import { getSongBpm } from '@/lib/playlistGenerator';
import { getYouTubeMusicUrl } from '@/lib/platformExport';

interface MiniPlayerDockProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  lang?: AppLanguage;
}

export const MiniPlayerDock: React.FC<MiniPlayerDockProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onClose,
  onNext,
  onPrev,
  lang = 'ko',
}) => {
  if (!currentSong) return null;

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const songBpm = getSongBpm(currentSong);
  const title = getSongTitle(currentSong, lang);
  const artist = getSongArtist(currentSong, lang);

  const formatSec = (sec: number) => {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' : ''}${r}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-3">
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-[406px] pointer-events-auto"
        >
          <div className="bg-zinc-950/95 text-white backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-3 shadow-2xl flex flex-col gap-2 ring-1 ring-white/10">
          {/* Progress line */}
          <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden">
            <div
              className="bg-[#C4FF00] h-full transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2.5">
            {/* Song Cover Thumbnail */}
            <div className="w-11 h-11 rounded-2xl overflow-hidden relative shrink-0 bg-zinc-900 border border-zinc-800 shadow-sm">
              {currentSong.cover_url ? (
                <Image
                  src={currentSong.cover_url}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <Music className="w-4 h-4" />
                </div>
              )}

              {/* Pulsing visualizer badge on thumbnail */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-[1.5px] h-3">
                    <span className="w-0.5 bg-[#C4FF00] h-full animate-bounce" />
                    <span className="w-0.5 bg-[#C4FF00] h-2/3 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-0.5 bg-[#C4FF00] h-4/5 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">
                  {title}
                </span>
                <span className="text-[10px] font-black text-black bg-[#C4FF00] px-1.5 py-0.2 rounded-full shrink-0">
                  {songBpm} BPM
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                <span className="truncate">{artist}</span>
                <span>·</span>
                <span className="shrink-0 text-zinc-500 font-mono text-[10px]">
                  {formatSec(currentTime)}/{formatSec(duration)}
                </span>
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Prev Button */}
              {onPrev && (
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label={lang === 'ko' ? '이전 곡' : 'Previous track'}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>
              )}

              {/* Play / Pause Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onTogglePlay}
                aria-label={isPlaying ? (lang === 'ko' ? '일시 정지' : 'Pause') : (lang === 'ko' ? '재생' : 'Play')}
                className="w-9 h-9 rounded-full bg-[#C4FF00] text-black flex items-center justify-center shrink-0 hover:bg-[#B4F000] transition-colors shadow-lg shadow-[#C4FF00]/20 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                )}
              </motion.button>

              {/* Next Button */}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  aria-label={lang === 'ko' ? '다음 곡' : 'Next track'}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              )}

              {/* Direct YouTube Music quick button */}
              <a
                href={getYouTubeMusicUrl(currentSong)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={lang === 'ko' ? '유튜브 뮤직에서 듣기' : 'Listen on YouTube Music'}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors ml-0.5"
                title="YouTube Music"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Close Dock */}
              <button
                type="button"
                onClick={onClose}
                aria-label={lang === 'ko' ? '플레이어 닫기' : 'Close player'}
                className="p-1.5 rounded-full text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
