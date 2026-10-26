'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  RotateCw,
  Play,
  Pause,
  X,
  Plus,
  Copy,
  Share2,
  Sparkles,
  Music,
  Check,
  Zap,
} from 'lucide-react';
import { Song, GenreTag } from '@/types/song';
import { getPlaylistCoverUrl, getSongBpm, getBpmZoneLabel } from '@/lib/playlistGenerator';
import { ThemeToggle } from './ThemeToggle';

interface PlaylistScreenProps {
  targetBpm: number;
  selectedCategories: GenreTag[];
  playlist: Song[];
  recommendedSongs: Song[];
  currentPlayingSong: Song | null;
  isPlayingAudio: boolean;
  onPlaySong: (song: Song) => void;
  onRemoveSong: (songKey: string) => void;
  onAddSong: (song: Song) => void;
  onReshuffle: () => void;
  onRefreshRecommendations: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  showToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
}

const CATEGORY_NAMES: Record<GenreTag, string> = {
  hiphop: '힙합',
  rock: '락',
  kpop: '케이팝',
  band: '밴드',
};

export const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  targetBpm,
  selectedCategories,
  playlist,
  recommendedSongs,
  currentPlayingSong,
  isPlayingAudio,
  onPlaySong,
  onRemoveSong,
  onAddSong,
  onReshuffle,
  onRefreshRecommendations,
  onBack,
  isDark,
  onToggleTheme,
  showToast,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Mandatory BPM Range Cover Image
  const coverUrl = getPlaylistCoverUrl(targetBpm);
  const zone = getBpmZoneLabel(targetBpm);

  // Total duration in minutes
  const totalDurationSec = useMemo(() => {
    return playlist.reduce((sum, s) => sum + (s.duration_sec || 210), 0);
  }, [playlist]);

  const durationFormatted = useMemo(() => {
    const hours = Math.floor(totalDurationSec / 3600);
    const mins = Math.floor((totalDurationSec % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  }, [totalDurationSec]);

  // Copy tracklist to clipboard
  const handleCopyTracklist = () => {
    if (!playlist.length) return;
    const text = playlist
      .map(
        (s, idx) =>
          `${idx + 1}. ${s.title} - ${s.artist} [${getSongBpm(s)} BPM / ${CATEGORY_NAMES[s.genre_tag] || s.genre_tag}]`
      )
      .join('\n');

    const fullContent = `🏃‍♂️ PULSE RUN ${targetBpm} BPM 러닝 플레이리스트 (${playlist.length}곡)\n${text}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullContent).then(() => {
        setIsCopied(true);
        showToast('곡 목록이 클립보드에 복사되었어요!', 'success');
        setTimeout(() => setIsCopied(false), 2000);
      });
    } else {
      showToast('클립보드를 지원하지 않는 환경입니다', 'info');
    }
  };

  return (
    <div className="flex flex-col min-h-dvh pb-28">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <Image
            src={isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png'}
            alt="PULSE"
            fill
            className="object-cover"
          />
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Main Content */}
      <main className="px-5 pt-4">
        {/* Header Summary Card */}
        <div className="relative p-5 rounded-3xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xl mb-6">
          <div className="flex items-start gap-4">
            {/* BPM-Matched Cover Image */}
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-zinc-300 dark:border-zinc-700 bg-black">
              <Image
                src={coverUrl}
                alt={`PULSE ${targetBpm} BPM Cover`}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Meta details */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-[#C4FF00] dark:bg-[#C4FF00] dark:text-black text-[11px] font-black tracking-tight mb-1.5 shadow-sm">
                <Zap className="w-3 h-3" />
                <span>{targetBpm} BPM</span>
              </div>

              <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white truncate">
                러닝 믹스 {targetBpm}
              </h1>

              <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    {CATEGORY_NAMES[cat]}
                  </span>
                ))}
              </div>

              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                총 {playlist.length}곡 · 약 {durationFormatted}
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
            <button
              type="button"
              onClick={onReshuffle}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-[#C4FF00]" />
              <span>다시 섞기</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTracklist}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">복사 완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>트랙목록 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 30-Song Playlist Tracklist Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                플레이리스트 트랙
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {playlist.length}곡
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              30초 미리듣기 지원
            </span>
          </div>

          {playlist.length === 0 ? (
            <div className="p-8 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 text-center border border-dashed border-zinc-300 dark:border-zinc-800">
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                플레이리스트가 비어있어요
              </p>
              <button
                type="button"
                onClick={onReshuffle}
                className="px-4 py-2 rounded-xl bg-[#C4FF00] text-black text-xs font-black shadow-md"
              >
                다시 30곡 생성하기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {playlist.map((song, index) => {
                const songKey = song.normalized_key || song.title + song.artist;
                const songBpm = getSongBpm(song);
                const isPlayingThis =
                  currentPlayingSong?.normalized_key === song.normalized_key && isPlayingAudio;
                const isExactOrClose = Math.abs(songBpm - targetBpm) <= 2;

                return (
                  <div
                    key={`${songKey}-${index}`}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-150 ${
                      isPlayingThis
                        ? 'bg-[#C4FF00]/10 dark:bg-[#C4FF00]/15 border-[#C4FF00] shadow-sm'
                        : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {/* Index & Cover */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-5 text-center text-[11px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">
                        {index + 1}
                      </span>

                      {/* Cover Thumbnail with Play/Pause Overlay */}
                      <button
                        type="button"
                        onClick={() => onPlaySong(song)}
                        aria-label={`${song.title} 미리듣기 재생`}
                        className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group cursor-pointer"
                      >
                        {song.cover_url ? (
                          <Image
                            src={song.cover_url}
                            alt={song.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <Music className="w-5 h-5" />
                          </div>
                        )}

                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                            isPlayingThis ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isPlayingThis ? (
                            <Pause className="w-4 h-4 fill-white text-white animate-pulse" />
                          ) : (
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          )}
                        </div>
                      </button>

                      {/* Song Title, Artist & Genre */}
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {song.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          <span className="truncate">{song.artist}</span>
                          <span>·</span>
                          <span className="shrink-0">{CATEGORY_NAMES[song.genre_tag] || song.genre_tag}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: XXX BPM Badge & Remove Button */}
                    <div className="flex items-center gap-2 shrink-0 pl-1">
                      {/* Song BPM Badge */}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          isExactOrClose
                            ? 'bg-[#C4FF00] text-black border-[#C4FF00] shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {songBpm} BPM
                      </span>

                      {/* Remove Song Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveSong(songKey)}
                        aria-label={`${song.title} 목록에서 삭제`}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommended Songs & Add to Playlist Section */}
        <section className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0A0A0A] dark:text-[#C4FF00]" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  곡 추가 / 추천곡
                </h3>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                선택한 장르의 BPM 맞춤 추천곡을 내 플레이리스트에 담아보세요
              </p>
            </div>

            <button
              type="button"
              onClick={onRefreshRecommendations}
              className="py-1.5 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors active:scale-95"
            >
              <RotateCw className="w-3 h-3" />
              <span>다른 곡 보기</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recommendedSongs.map((song, index) => {
              const songKey = song.normalized_key || song.title + song.artist;
              const songBpm = getSongBpm(song);
              const isPlayingThis =
                currentPlayingSong?.normalized_key === song.normalized_key && isPlayingAudio;
              const isExactOrClose = Math.abs(songBpm - targetBpm) <= 2;

              return (
                <div
                  key={`rec-${songKey}-${index}`}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onPlaySong(song)}
                      aria-label={`${song.title} 미리듣기 재생`}
                      className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group cursor-pointer"
                    >
                      {song.cover_url ? (
                        <Image
                          src={song.cover_url}
                          alt={song.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Music className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                          isPlayingThis ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Pause className="w-3.5 h-3.5 fill-white text-white" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </button>

                    <div className="min-w-0 flex-1 pr-1">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {song.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {song.artist} · {CATEGORY_NAMES[song.genre_tag] || song.genre_tag}
                      </div>
                    </div>
                  </div>

                  {/* Right side: BPM badge & Add (+) button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isExactOrClose
                          ? 'bg-[#C4FF00] text-black border-[#C4FF00]'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {songBpm} BPM
                    </span>

                    <button
                      type="button"
                      onClick={() => onAddSong(song)}
                      aria-label={`${song.title} 플레이리스트에 추가`}
                      className="p-1.5 rounded-xl bg-zinc-100 hover:bg-[#C4FF00] hover:text-black dark:bg-zinc-800 dark:hover:bg-[#C4FF00] dark:hover:text-black text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
