'use client';

import React from 'react';
import { Activity, Music2, Flame, ListMusic, Disc3 } from 'lucide-react';

interface StatsHeaderProps {
  total: number;
  categoryCounts: Record<string, number>;
  avgBpm: number;
  playlistCount: number;
  onOpenPlaylist: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  total,
  categoryCounts,
  avgBpm,
  playlistCount,
  onOpenPlaylist,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-cyan-400 p-[1px] shadow-lg glow-brand flex items-center justify-center">
              <div className="h-full w-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Activity className="h-6 w-6 text-brand-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-wider text-white font-display">
                  PULSE
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  v2.0 Next.js
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline-block">
                  DSP Analyzer
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Precision BPM & Running Cadence Synchronizer
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar & Playlist trigger */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
            <div className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 shadow-sm">
              <Disc3 className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>
                Tracks: <strong className="text-white font-semibold">{total}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 shadow-sm">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>
                Avg Cadence: <strong className="text-white font-semibold">{avgBpm || 157} SPM</strong>
              </span>
            </div>

            <button
              onClick={onOpenPlaylist}
              className="relative flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-brand-900/40 active:scale-95"
            >
              <ListMusic className="h-4 w-4" />
              <span>Running Playlist</span>
              {playlistCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-zinc-950 text-[10px] font-bold">
                  {playlistCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
