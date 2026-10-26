'use client';

import React from 'react';
import { Play, Pause, Bell, Plus, Check, Zap, Disc } from 'lucide-react';
import { Song } from '@/types/song';
import { getCadenceZone, getScoreColor } from '@/lib/utils';

interface TrackCardProps {
  song: Song;
  isPlaying: boolean;
  isMetronomeActive: boolean;
  isInPlaylist: boolean;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onSyncMetronome: (song: Song) => void;
  onTogglePlaylist: (song: Song) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  song,
  isPlaying,
  isMetronomeActive,
  isInPlaylist,
  onPlay,
  onPause,
  onSyncMetronome,
  onTogglePlaylist,
}) => {
  const zone = getCadenceZone(song.running_bpm);
  const scoreColor = getScoreColor(song.running_score);

  return (
    <div className="group relative bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-brand-500/5">
      {/* Top section: Album Art + Meta */}
      <div>
        <div className="flex items-start space-x-3.5">
          {/* Cover Art with Play Button Overlay */}
          <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800 shadow-md">
            {song.cover_url ? (
              <img
                src={song.cover_url}
                alt={`${song.title} - ${song.artist}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                <Disc className="h-8 w-8 animate-spin" />
              </div>
            )}

            {/* Play/Pause Overlay */}
            {song.preview_url && (
              <button
                onClick={() => (isPlaying ? onPause() : onPlay(song))}
                className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity ${
                  isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title={isPlaying ? 'Pause preview' : 'Play 30s preview'}
              >
                <div className="h-10 w-10 rounded-full bg-brand-500 text-zinc-950 flex items-center justify-center shadow-lg transform transition-transform active:scale-95">
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Title, Artist, Album & Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {song.genre_tag}
              </span>
              {song.cadence_mode && song.cadence_mode !== 'native' && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800/80 text-cyan-400 border border-cyan-500/20">
                  {song.cadence_mode === 'doubled' ? '2x Doubled' : '1/2 Halved'}
                </span>
              )}
            </div>

            <h3
              className="text-sm font-bold text-white truncate group-hover:text-brand-300 transition-colors"
              title={song.title}
            >
              {song.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate font-medium" title={song.artist}>
              {song.artist}
            </p>
            {song.album && (
              <p className="text-[11px] text-zinc-500 truncate" title={song.album}>
                {song.album}
              </p>
            )}
          </div>
        </div>

        {/* Cadence & Running Score Row */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-zinc-800/60">
          {/* Running BPM Box */}
          <div className={`rounded-xl p-2.5 border ${zone.bgColor} ${zone.borderColor}`}>
            <span className="text-[10px] font-medium text-zinc-400 block uppercase">
              Running Cadence
            </span>
            <div className="flex items-baseline space-x-1">
              <span className={`text-xl font-black font-display ${zone.textColor}`}>
                {song.running_bpm}
              </span>
              <span className="text-[11px] font-semibold text-zinc-400">SPM</span>
            </div>
            <span className={`text-[10px] font-medium block truncate ${zone.textColor}`}>
              {zone.label}
            </span>
          </div>

          {/* Running Score Box */}
          <div className="rounded-xl p-2.5 bg-zinc-800/40 border border-zinc-800">
            <span className="text-[10px] font-medium text-zinc-400 block uppercase">
              Running Score
            </span>
            <div className="flex items-baseline space-x-1">
              <span className={`text-xl font-black font-display ${scoreColor}`}>
                {song.running_score}
              </span>
              <span className="text-[11px] text-zinc-500">/100</span>
            </div>
            {/* Score progress bar */}
            <div className="w-full h-1.5 bg-zinc-700/60 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  song.running_score >= 85
                    ? 'bg-emerald-400'
                    : song.running_score >= 70
                    ? 'bg-amber-400'
                    : 'bg-zinc-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, song.running_score))}%` }}
              />
            </div>
          </div>
        </div>

        {/* DSP Metrics Breakdown (Subtle) */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500 px-1">
          <span>Clarity: <strong className="text-zinc-300">{song.beat_clarity?.toFixed(2)}</strong></span>
          <span>Stability: <strong className="text-zinc-300">{(song.timing_stability * 100)?.toFixed(0)}%</strong></span>
          <span>Energy: <strong className="text-zinc-300">{song.energy_rms?.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Action Buttons: Metronome Sync & Playlist Toggle */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        <button
          onClick={() => onSyncMetronome(song)}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all ${
            isMetronomeActive
              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
          }`}
          title="Sync high-precision metronome to track BPM"
        >
          <Bell className={`h-3.5 w-3.5 ${isMetronomeActive ? 'animate-bounce' : ''}`} />
          <span>{isMetronomeActive ? 'Metronome Synced' : 'Sync Metronome'}</span>
        </button>

        <button
          onClick={() => onTogglePlaylist(song)}
          className={`p-2 rounded-lg transition-colors ${
            isInPlaylist
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title={isInPlaylist ? 'Remove from running playlist' : 'Add to running playlist'}
        >
          {isInPlaylist ? (
            <Check className="h-4 w-4 text-brand-400" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};
