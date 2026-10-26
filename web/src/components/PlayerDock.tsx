'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Bell,
  Minus,
  Plus,
  RotateCcw,
  FastForward,
  Rewind,
  Music,
} from 'lucide-react';
import { Song } from '@/types/song';
import { MetronomeSoundType } from '@/lib/metronome';
import { formatTime } from '@/lib/utils';

interface PlayerDockProps {
  currentSong: Song | null;
  isPlayingAudio: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  audioVolume: number;
  onToggleAudioPlay: () => void;
  onStopAudio: () => void;
  onSeekAudio: (time: number) => void;
  onAudioVolumeChange: (vol: number) => void;

  // Metronome props
  isMetronomePlaying: boolean;
  metronomeBpm: number;
  metronomeMultiplier: 1 | 2;
  metronomeSound: MetronomeSoundType;
  metronomeVolume: number;
  phaseOffsetMs: number;
  beatFlash: boolean;
  onToggleMetronome: () => void;
  onSetMetronomeBpm: (bpm: number) => void;
  onSetMultiplier: (multiplier: 1 | 2) => void;
  onSetSound: (sound: MetronomeSoundType) => void;
  onSetMetronomeVolume: (vol: number) => void;
  onNudgePhase: (deltaMs: number) => void;
  onResetPhase: () => void;
}

export const PlayerDock: React.FC<PlayerDockProps> = ({
  currentSong,
  isPlayingAudio,
  audioCurrentTime,
  audioDuration,
  audioVolume,
  onToggleAudioPlay,
  onStopAudio,
  onSeekAudio,
  onAudioVolumeChange,

  isMetronomePlaying,
  metronomeBpm,
  metronomeMultiplier,
  metronomeSound,
  metronomeVolume,
  phaseOffsetMs,
  beatFlash,
  onToggleMetronome,
  onSetMetronomeBpm,
  onSetMultiplier,
  onSetSound,
  onSetMetronomeVolume,
  onNudgePhase,
  onResetPhase,
}) => {
  const [showMetronomeDetails, setShowMetronomeDetails] = useState(false);

  const sounds: { key: MetronomeSoundType; label: string }[] = [
    { key: 'woodblock', label: 'Woodblock' },
    { key: 'hihat', label: 'Hi-Hat' },
    { key: 'beep', label: 'Beep' },
    { key: 'rimshot', label: 'Rimshot' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-xl shadow-2xl">
      {/* Expanded Metronome Micro-tuning drawer (collapsible) */}
      {showMetronomeDetails && (
        <div className="bg-zinc-900/95 border-b border-zinc-800/80 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Sound Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 font-medium">Click Sound:</span>
              <div className="flex items-center space-x-1">
                {sounds.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onSetSound(s.key)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      metronomeSound === s.key
                        ? 'bg-brand-500 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cadence Multiplier */}
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 font-medium">Cadence Multiplier:</span>
              <div className="flex items-center space-x-1 bg-zinc-800 p-0.5 rounded">
                <button
                  onClick={() => onSetMultiplier(1)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    metronomeMultiplier === 1
                      ? 'bg-zinc-200 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  1x ({metronomeBpm} SPM)
                </button>
                <button
                  onClick={() => onSetMultiplier(2)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    metronomeMultiplier === 2
                      ? 'bg-zinc-200 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  2x ({metronomeBpm * 2} SPM)
                </button>
              </div>
            </div>

            {/* Phase Nudge Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 font-medium">Phase Micro-nudge:</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onNudgePhase(-20)}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 active:scale-95"
                  title="Shift click earlier by 20ms"
                >
                  <Rewind className="h-3 w-3" />
                  <span>-20ms</span>
                </button>
                <button
                  onClick={() => onNudgePhase(20)}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 active:scale-95"
                  title="Shift click later by 20ms"
                >
                  <FastForward className="h-3 w-3" />
                  <span>+20ms</span>
                </button>
                <button
                  onClick={onResetPhase}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                  title="Reset phase offset"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
                <span className="text-[11px] text-zinc-400 ml-1">
                  ({phaseOffsetMs > 0 ? `+${phaseOffsetMs}` : phaseOffsetMs}ms)
                </span>
              </div>
            </div>

            {/* Metronome Volume */}
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 font-medium">Metronome Vol:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={metronomeVolume}
                onChange={(e) => onSetMetronomeVolume(Number(e.target.value))}
                className="w-20 h-1.5 bg-zinc-800 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Currently Playing Track Info */}
          <div className="flex items-center space-x-3 min-w-[240px]">
            {currentSong ? (
              <>
                <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 shadow">
                  {currentSong.cover_url ? (
                    <img
                      src={currentSong.cover_url}
                      alt={currentSong.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-600">
                      <Music className="h-6 w-6" />
                    </div>
                  )}
                  {isPlayingAudio && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="flex space-x-0.5">
                        <span className="w-1 h-3 bg-brand-400 animate-pulse rounded-full" />
                        <span className="w-1 h-4 bg-brand-400 animate-pulse delay-75 rounded-full" />
                        <span className="w-1 h-2 bg-brand-400 animate-pulse delay-150 rounded-full" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
                  <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
                  <span className="text-[10px] text-brand-400 font-semibold">
                    {currentSong.running_bpm} SPM • {currentSong.genre_tag.toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-zinc-500">
                <Music className="h-5 w-5" />
                <span>Select any track to preview audio & BPM sync</span>
              </div>
            )}
          </div>

          {/* Audio Playback Controls + Scrubber */}
          <div className="flex-1 max-w-xl mx-auto w-full flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-1">
              <button
                disabled={!currentSong?.preview_url}
                onClick={onToggleAudioPlay}
                className="h-9 w-9 rounded-full bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:hover:bg-brand-500 text-zinc-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                {isPlayingAudio ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
              {currentSong && (
                <button
                  onClick={onStopAudio}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  title="Stop playback"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Time scrubber */}
            <div className="w-full flex items-center space-x-2 text-[11px] text-zinc-400">
              <span className="w-8 text-right font-mono">{formatTime(audioCurrentTime)}</span>
              <input
                type="range"
                min="0"
                max={audioDuration || 30}
                step="0.1"
                value={audioCurrentTime}
                onChange={(e) => onSeekAudio(Number(e.target.value))}
                disabled={!currentSong}
                className="flex-1 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="w-8 font-mono">{formatTime(audioDuration || 30)}</span>
            </div>
          </div>

          {/* Metronome Engine Quick Dock */}
          <div className="flex items-center space-x-3 self-end md:self-auto">
            {/* Visual Beat Indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`h-4 w-4 rounded-full transition-all duration-75 ${
                  beatFlash
                    ? 'bg-brand-400 scale-125 shadow-[0_0_12px_#34d399]'
                    : isMetronomePlaying
                    ? 'bg-brand-900 border border-brand-500/40'
                    : 'bg-zinc-800'
                }`}
              />
              <span className="text-[9px] text-zinc-500 mt-0.5">BEAT</span>
            </div>

            {/* Metronome Power Toggle */}
            <button
              onClick={onToggleMetronome}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isMetronomePlaying
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>{isMetronomePlaying ? 'CLICK ON' : 'CLICK OFF'}</span>
            </button>

            {/* BPM Adjuster */}
            <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1">
              <button
                onClick={() => onSetMetronomeBpm(metronomeBpm - 1)}
                className="p-1 text-zinc-400 hover:text-white"
                title="-1 BPM"
              >
                <Minus className="h-3 w-3" />
              </button>
              <div className="text-center px-1">
                <span className="text-xs font-bold text-white font-display">
                  {metronomeBpm}
                </span>
                <span className="text-[9px] text-zinc-400 block -mt-0.5">BPM</span>
              </div>
              <button
                onClick={() => onSetMetronomeBpm(metronomeBpm + 1)}
                className="p-1 text-zinc-400 hover:text-white"
                title="+1 BPM"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Micro-tune / Settings expand toggle */}
            <button
              onClick={() => setShowMetronomeDetails(!showMetronomeDetails)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showMetronomeDetails
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
              title="Toggle audio click sound and phase adjustments"
            >
              ⚙
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
