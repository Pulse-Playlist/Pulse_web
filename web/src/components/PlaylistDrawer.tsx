'use client';

import React from 'react';
import {
  X,
  Trash2,
  Download,
  Share2,
  ChevronUp,
  ChevronDown,
  Play,
  Clock,
  Gauge,
  ListMusic,
  Check,
} from 'lucide-react';
import { Song } from '@/types/song';
import { formatTime, getCadenceZone } from '@/lib/utils';

interface PlaylistDrawerProps {
  isOpen: boolean;
  playlist: Song[];
  onClose: () => void;
  onRemoveTrack: (index: number) => void;
  onMoveTrack: (index: number, direction: 'up' | 'down') => void;
  onClearPlaylist: () => void;
  onPlayTrack: (song: Song) => void;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  playlist,
  onClose,
  onRemoveTrack,
  onMoveTrack,
  onClearPlaylist,
  onPlayTrack,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const totalDurationSec = playlist.reduce((acc, s) => acc + (s.duration_sec || 0), 0);
  const avgCadence =
    playlist.length > 0
      ? Math.round(
          playlist.reduce((acc, s) => acc + (s.running_bpm || s.raw_bpm || 0), 0) /
            playlist.length
        )
      : 0;

  const handleCopyTracklist = () => {
    const text = playlist
      .map((s, idx) => `${idx + 1}. [${s.running_bpm} SPM] ${s.artist} - ${s.title}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadM3U = () => {
    let m3u = '#EXTM3U\n';
    playlist.forEach((s) => {
      m3u += `#EXTINF:${s.duration_sec || 30},${s.artist} - ${s.title}\n`;
      m3u += `${s.preview_url || ''}\n`;
    });
    const blob = new Blob([m3u], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse_running_playlist_${avgCadence}spm.m3u`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
                <ListMusic className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Running Playlist</h3>
                <p className="text-xs text-zinc-400">
                  Curated pacing set for your run
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Aggregate Stats Summary */}
          <div className="p-4 bg-zinc-900/60 border-b border-zinc-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Tracks</span>
              <span className="text-lg font-black text-white font-display">
                {playlist.length}
              </span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Avg SPM</span>
              <span className="text-lg font-black text-brand-400 font-display">
                {avgCadence || '—'}
              </span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Est. Run</span>
              <span className="text-lg font-black text-white font-display">
                {formatTime(totalDurationSec)}
              </span>
            </div>
          </div>

          {/* Track List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {playlist.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500">
                <ListMusic className="h-10 w-10 mb-2 stroke-1 text-zinc-600" />
                <p className="text-sm font-medium">Your playlist is empty</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
                  Click the + icon on any track card to add it to your running queue.
                </p>
              </div>
            ) : (
              playlist.map((song, idx) => {
                const zone = getCadenceZone(song.running_bpm);
                return (
                  <div
                    key={`${song.normalized_key || song.title}-${idx}`}
                    className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                  >
                    <span className="text-xs font-mono text-zinc-500 w-4 text-center">
                      {idx + 1}
                    </span>

                    <img
                      src={song.cover_url || ''}
                      alt={song.title}
                      className="h-11 w-11 rounded-lg object-cover bg-zinc-800 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                      <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`text-[10px] font-bold ${zone.textColor}`}>
                          {song.running_bpm} SPM
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatTime(song.duration_sec)}
                        </span>
                      </div>
                    </div>

                    {/* Reorder and Action buttons */}
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => onPlayTrack(song)}
                        className="p-1 rounded text-zinc-400 hover:text-brand-400"
                        title="Play"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                      <div className="flex flex-col">
                        <button
                          disabled={idx === 0}
                          onClick={() => onMoveTrack(idx, 'up')}
                          className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-20"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          disabled={idx === playlist.length - 1}
                          onClick={() => onMoveTrack(idx, 'down')}
                          className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-20"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveTrack(idx)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-400"
                        title="Remove track"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls & Export */}
          {playlist.length > 0 && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyTracklist}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-brand-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Copy Tracklist</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadM3U}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download M3U</span>
                </button>
              </div>

              <button
                onClick={onClearPlaylist}
                className="w-full py-1.5 text-center text-xs text-rose-400/80 hover:text-rose-400 font-medium transition-colors"
              >
                Clear Entire Playlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
