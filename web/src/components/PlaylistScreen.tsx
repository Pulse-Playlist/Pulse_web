'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  RotateCw,
  Play,
  Pause,
  X,
  Plus,
  Sparkles,
  Music,
  Zap,
  Rocket,
  ExternalLink,
  BookmarkCheck,
  BookmarkPlus,
  Edit2,
  Check,
  Share2,
} from 'lucide-react';
import { Song, GenreTag, AppLanguage, SavedPlaylist, getSongTitle, getSongArtist } from '@/types/song';
import { getPlaylistCoverUrl, getSongBpm, getBpmZoneLabel } from '@/lib/playlistGenerator';
import { getSongArtistMatchTier } from '@/lib/artistClusters';
import {
  getYouTubeMusicUrl,
  getSpotifyUrl,
  getAppleMusicUrl,
  getMelonUrl,
  getBugsUrl,
} from '@/lib/platformExport';
import { ExportModal } from './ExportModal';
import { ThemeToggle } from './ThemeToggle';
import { playSuccessFanfare, playPopSound } from '@/lib/soundEffects';

interface PlaylistScreenProps {
  targetBpm: number;
  selectedCategories: GenreTag[];
  playlist: Song[];
  recommendedSongs: Song[];
  currentPlayingSong: Song | null;
  isPlayingAudio: boolean;
  isContinuousPlay: boolean;
  onPlaySong: (song: Song) => void;
  onToggleContinuousPlay: () => void;
  onRemoveSong: (songKey: string) => void;
  onAddSong: (song: Song) => void;
  onReshuffle: () => void;
  onRefreshRecommendations: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  showToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
  lang: AppLanguage;
  onToggleLang: () => void;
  initialPlaylistName?: string;
  onSavedToFeed?: (playlist: SavedPlaylist) => void;
  preferredArtists?: string[];
  onOpenArtistSelect?: () => void;
}

const CATEGORY_NAMES: Record<AppLanguage, Record<GenreTag, string>> = {
  ko: {
    hiphop: '힙합',
    rock: '락',
    kpop: '케이팝',
    band: '밴드',
  },
  en: {
    hiphop: 'HIP-HOP',
    rock: 'ROCK',
    kpop: 'K-POP',
    band: 'BAND',
  },
};

export const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  targetBpm,
  selectedCategories,
  playlist,
  recommendedSongs,
  currentPlayingSong,
  isPlayingAudio,
  isContinuousPlay,
  onPlaySong,
  onToggleContinuousPlay,
  onRemoveSong,
  onAddSong,
  onReshuffle,
  onRefreshRecommendations,
  onBack,
  isDark,
  onToggleTheme,
  showToast,
  lang,
  onToggleLang,
  initialPlaylistName,
  onSavedToFeed,
  preferredArtists = [],
  onOpenArtistSelect,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [expandedSongKey, setExpandedSongKey] = useState<string | null>(null);

  // Custom Playlist Name State
  const defaultTitle =
    initialPlaylistName ||
    (lang === 'ko' ? `PULSE ${targetBpm} BPM 러닝 믹스` : `PULSE ${targetBpm} BPM Mix`);
  const [playlistTitle, setPlaylistTitle] = useState(defaultTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSavingToFeed, setIsSavingToFeed] = useState(false);
  const [hasSavedToFeed, setHasSavedToFeed] = useState(false);

  useEffect(() => {
    if (initialPlaylistName) {
      setPlaylistTitle(initialPlaylistName);
    }
  }, [initialPlaylistName]);

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
    if (lang === 'en') {
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins} mins`;
    }
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  }, [totalDurationSec, lang]);

  // Handle Reshuffle with rotation animation + canvas-confetti burst
  const handleReshuffleClick = () => {
    setIsShuffling(true);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.35 },
        colors: ['#C4FF00', '#00E5FF', '#FF0055', '#FFFFFF'],
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti fallback
    }

    onReshuffle();
    setTimeout(() => setIsShuffling(false), 700);
  };

  // Save to Community Feed via POST /api/playlists
  const handleSaveToFeed = async () => {
    if (!playlist.length) return;
    if (isSavingToFeed) return;

    try {
      setIsSavingToFeed(true);
      const nameToSave = playlistTitle.trim() || defaultTitle;

      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameToSave,
          author: lang === 'ko' ? 'PULSE 러너' : 'PULSE Runner',
          bpm: targetBpm,
          categories: selectedCategories,
          songs: playlist,
        }),
      });

      if (!res.ok) {
        throw new Error('피드 저장에 실패했습니다');
      }

      const data = await res.json();
      setHasSavedToFeed(true);

      // Trigger Confetti & Sound Fanfare
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#C4FF00', '#00E5FF', '#FF0055', '#FFFFFF'],
        });
      } catch {
        // ignore
      }
      playSuccessFanfare();

      showToast(
        lang === 'ko'
          ? '내 플레이리스트가 홈 피드에 저장되었어요!'
          : 'Saved to the community feed!',
        'success'
      );

      if (data.playlist && onSavedToFeed) {
        onSavedToFeed(data.playlist);
      }
    } catch (err) {
      console.error(err);
      showToast(
        lang === 'ko' ? '저장 중 오류가 발생했습니다.' : 'Failed to save playlist.',
        'warning'
      );
    } finally {
      setIsSavingToFeed(false);
    }
  };

  // Toggle song's platform links drawer
  const toggleSongLinks = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSongKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col min-h-dvh pb-32">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          aria-label={lang === 'ko' ? '뒤로 가기' : 'Back'}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image
              src={isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png'}
              alt="PULSE"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs font-black tracking-widest text-zinc-900 dark:text-white uppercase font-display">
            PULSE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* KO / EN Language Toggle Pill */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => {
              playPopSound();
              onToggleLang();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border transition-colors bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-sm"
            aria-label="언어 전환"
          >
            <span
              className={
                lang === 'ko'
                  ? 'text-black dark:text-[#C4FF00] font-black'
                  : 'text-zinc-400 font-semibold'
              }
            >
              한
            </span>
            <span className="text-zinc-400 text-[10px]">/</span>
            <span
              className={
                lang === 'en'
                  ? 'text-black dark:text-[#C4FF00] font-black'
                  : 'text-zinc-400 font-semibold'
              }
            >
              EN
            </span>
          </motion.button>

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 pt-4">
        {/* Header Summary Card */}
        <div className="relative p-5 rounded-3xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xl mb-6">
          <div className="flex items-start gap-4">
            {/* BPM-Matched Cover Image with pulse effect matching running cadence */}
            <motion.div
              animate={
                isPlayingAudio
                  ? {
                      scale: [1, 1.03, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(196, 255, 0, 0)',
                        '0 0 24px 6px rgba(196, 255, 0, 0.4)',
                        '0 0 0 0 rgba(196, 255, 0, 0)',
                      ],
                    }
                  : { scale: 1, boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' }
              }
              transition={
                isPlayingAudio
                  ? {
                      repeat: Infinity,
                      duration: Math.max(0.35, 60 / targetBpm),
                      ease: 'easeInOut',
                    }
                  : { duration: 0.3 }
              }
              className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-zinc-300 dark:border-zinc-700 bg-black cursor-pointer group"
              onClick={onToggleContinuousPlay}
              title={lang === 'ko' ? '클릭하여 연속 재생' : 'Click to toggle continuous play'}
            >
              <Image
                src={coverUrl}
                alt={`PULSE ${targetBpm} BPM Cover`}
                fill
                priority
                className="object-cover transition-transform group-hover:scale-105"
              />

              {/* Pulsing audio indicator badge */}
              {isPlayingAudio && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm border border-[#C4FF00]/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4FF00] animate-ping" />
                  <span className="text-[9px] font-black text-[#C4FF00]">LIVE</span>
                </div>
              )}
            </motion.div>

            {/* Meta details */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-[#C4FF00] dark:bg-[#C4FF00] dark:text-black text-[11px] font-black tracking-tight mb-1.5 shadow-sm">
                <Zap className="w-3 h-3" />
                <span>{targetBpm} BPM</span>
              </div>

              {/* Editable Playlist Title Bar */}
              <div className="relative group/title mt-0.5">
                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={playlistTitle}
                      onChange={(e) => setPlaylistTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingTitle(false);
                      }}
                      className="w-full px-2 py-1 rounded-lg bg-white dark:bg-black border-2 border-[#C4FF00] text-sm font-black text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      className="p-1 rounded-lg bg-[#C4FF00] text-black shrink-0"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingTitle(true)}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                    title={lang === 'ko' ? '클릭하여 이름 수정' : 'Click to edit title'}
                  >
                    <h1 className="text-base font-black tracking-tight text-zinc-900 dark:text-white truncate">
                      {playlistTitle}
                    </h1>
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400 group-hover/title:text-[#C4FF00] shrink-0 transition-colors" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    {CATEGORY_NAMES[lang][cat] || cat}
                  </span>
                ))}
                {onOpenArtistSelect && (
                  <button
                    type="button"
                    onClick={onOpenArtistSelect}
                    className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#C4FF00]/20 hover:bg-[#C4FF00]/30 border border-[#C4FF00]/50 text-lime-800 dark:text-[#C4FF00] cursor-pointer transition-colors"
                  >
                    {preferredArtists.length > 0
                      ? lang === 'ko'
                        ? `🫧 최애 ${preferredArtists.length}팀 반영됨`
                        : `🫧 ${preferredArtists.length} Artists`
                      : lang === 'ko'
                      ? '🫧 아티스트 취향 설정'
                      : '🫧 Pick Artists'}
                  </button>
                )}
              </div>

              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {playlist.length}
                {lang === 'ko' ? '곡' : ' tracks'} · 약 {durationFormatted}
              </div>
            </div>
          </div>

          {/* Continuous Playback Button (Full Width) */}
          <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
            <button
              type="button"
              onClick={onToggleContinuousPlay}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md cursor-pointer ${
                isPlayingAudio
                  ? 'bg-zinc-900 text-[#C4FF00] dark:bg-zinc-800 dark:text-[#C4FF00] border border-[#C4FF00]/50 ring-1 ring-[#C4FF00]/30'
                  : 'bg-zinc-900 text-white dark:bg-white dark:text-black hover:opacity-95'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>
                    {lang === 'ko' ? '연속 재생 일시 정지' : 'Pause Non-stop Play'}
                  </span>
                  <div className="flex items-end gap-[2px] h-3 ml-1.5">
                    <span className="w-0.5 bg-[#C4FF00] h-full animate-bounce" />
                    <span className="w-0.5 bg-[#C4FF00] h-2/3 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-0.5 bg-[#C4FF00] h-4/5 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>
                    {lang === 'ko'
                      ? `${playlist.length}곡 연속 논스톱 프리뷰 재생`
                      : `Play ${playlist.length} Tracks Non-stop Preview`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons Row: Save to Feed + Export (Neon CTA) + Reshuffle */}
          <div className="grid grid-cols-3 gap-2 mt-2.5">
            {/* 💾 Save to Feed Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleSaveToFeed}
              disabled={isSavingToFeed}
              className={`py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer border ${
                hasSavedToFeed
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-900 dark:text-white'
              }`}
              title={lang === 'ko' ? '홈 피드에 저장' : 'Save to community feed'}
            >
              {hasSavedToFeed ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <BookmarkPlus className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              )}
              <span className="truncate">
                {hasSavedToFeed
                  ? lang === 'ko'
                    ? '피드 저장됨'
                    : 'Saved'
                  : lang === 'ko'
                  ? '피드에 저장'
                  : 'Save to Feed'}
              </span>
            </motion.button>

            {/* 🚀 Prominent Neon CTA Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="py-2.5 px-2 rounded-xl bg-[#C4FF00] hover:bg-[#B4F000] text-black text-xs font-black flex items-center justify-center gap-1 shadow-lg shadow-[#C4FF00]/20 transition-all border border-[#B0EC00] cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {lang === 'ko' ? '플리 내보내기' : 'Export'}
              </span>
            </motion.button>

            {/* Reshuffle Button with spinning icon */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleReshuffleClick}
              className="py-2.5 px-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
            >
              <motion.div
                animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <RotateCw className="w-3.5 h-3.5 text-zinc-600 dark:text-[#C4FF00]" />
              </motion.div>
              <span className="truncate">
                {lang === 'ko' ? '다시 섞기' : 'Reshuffle'}
              </span>
            </motion.button>
          </div>
        </div>

        {/* 30-Song Playlist Tracklist Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                {lang === 'ko' ? '플레이리스트 트랙' : 'Playlist Tracks'}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {playlist.length}
                {lang === 'ko' ? '곡' : ' tracks'}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {lang === 'ko' ? '각 곡 플랫폼 바로가기 지원' : 'Direct platform links'}
            </span>
          </div>

          {playlist.length === 0 ? (
            <div className="p-8 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 text-center border border-dashed border-zinc-300 dark:border-zinc-800">
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                {lang === 'ko'
                  ? `선택한 장르에 ${targetBpm} ± 2 BPM 곡이 없어요`
                  : `No tracks found in ${targetBpm} ± 2 BPM`}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-[#C4FF00] text-black text-xs font-black shadow-md cursor-pointer"
              >
                {lang === 'ko' ? '다른 장르나 BPM 선택하기' : 'Pick another genre or BPM'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {playlist.map((song, index) => {
                  const songKey = song.normalized_key || song.title + song.artist;
                  const songBpm = getSongBpm(song);
                  const isPlayingThis =
                    currentPlayingSong?.normalized_key === song.normalized_key && isPlayingAudio;
                  const isExactOrClose = Math.abs(songBpm - targetBpm) <= 2;
                  const isExpanded = expandedSongKey === songKey;

                  const displayTitle = getSongTitle(song, lang);
                  const displayArtist = getSongArtist(song, lang);
                  const artistTier = getSongArtistMatchTier(song, preferredArtists);

                  return (
                    <motion.div
                      key={songKey}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -60, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className={`flex flex-col rounded-2xl border transition-all duration-150 overflow-hidden ${
                        isPlayingThis
                          ? 'bg-[#C4FF00]/10 dark:bg-[#C4FF00]/15 border-[#C4FF00] shadow-md ring-1 ring-[#C4FF00]/40'
                          : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Main Song Row */}
                      <div className="flex items-center justify-between p-2.5">
                        {/* Index & Cover */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 text-center text-[11px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">
                            {index + 1}
                          </span>

                          {/* Cover Thumbnail with Play/Pause Overlay */}
                          <button
                            type="button"
                            onClick={() => onPlaySong(song)}
                            aria-label={`${displayTitle} 미리듣기 재생`}
                            className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group cursor-pointer"
                          >
                            {song.cover_url ? (
                              <Image
                                src={song.cover_url}
                                alt={displayTitle}
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
                                isPlayingThis
                                  ? 'opacity-100 bg-black/55'
                                  : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {isPlayingThis ? (
                                <Pause className="w-4 h-4 fill-[#C4FF00] text-[#C4FF00]" />
                              ) : (
                                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                              )}
                            </div>
                          </button>

                          {/* Song Title, Artist & Animated 3-Bar Equalizer */}
                          <div className="min-w-0 flex-1 pr-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isPlayingThis
                                    ? 'text-[#0A0A0A] dark:text-[#C4FF00]'
                                    : 'text-zinc-900 dark:text-white'
                                }`}
                              >
                                {displayTitle}
                              </span>

                              {/* 3-Bar Equalizer when playing */}
                              {isPlayingThis && (
                                <div className="flex items-end gap-[2px] h-3 w-3 shrink-0 ml-0.5">
                                  <motion.span
                                    className="w-0.5 bg-[#C4FF00] rounded-full"
                                    animate={{ height: ['25%', '100%', '40%', '85%', '25%'] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.8,
                                      ease: 'easeInOut',
                                    }}
                                  />
                                  <motion.span
                                    className="w-0.5 bg-[#C4FF00] rounded-full"
                                    animate={{ height: ['85%', '30%', '100%', '50%', '85%'] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.65,
                                      ease: 'easeInOut',
                                      delay: 0.1,
                                    }}
                                  />
                                  <motion.span
                                    className="w-0.5 bg-[#C4FF00] rounded-full"
                                    animate={{ height: ['40%', '95%', '25%', '70%', '40%'] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.75,
                                      ease: 'easeInOut',
                                      delay: 0.2,
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                              {artistTier === 'selected' && (
                                <span className="px-1.5 py-0.2 rounded bg-[#C4FF00] text-black text-[9px] font-black shrink-0">
                                  {lang === 'ko' ? '★ 최애' : '★ Pick'}
                                </span>
                              )}
                              {artistTier === 'related' && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-[9px] font-black shrink-0">
                                  {lang === 'ko' ? '🔗 연관' : '🔗 Vibe'}
                                </span>
                              )}
                              <span className="truncate">{displayArtist}</span>
                              <span>·</span>
                              <span className="shrink-0">
                                {CATEGORY_NAMES[lang][song.genre_tag] || song.genre_tag}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Platform pill, BPM Badge, Remove (X) */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
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

                          {/* Quick Platform Expand Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleSongLinks(songKey, e)}
                            aria-label={`${displayTitle} 음원사이트 바로가기`}
                            className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer ${
                              isExpanded
                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                            }`}
                            title={lang === 'ko' ? '음원사이트 바로듣기 링크' : 'Platform links'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Song Button */}
                          <button
                            type="button"
                            onClick={() => onRemoveSong(songKey)}
                            aria-label={`${displayTitle} 목록에서 삭제`}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Per-Song Direct Platform Launchers Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-zinc-50 dark:bg-zinc-950/70 border-t border-zinc-200/80 dark:border-zinc-800 px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-bold"
                          >
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0 mr-1">
                              {lang === 'ko' ? '바로듣기:' : 'Listen:'}
                            </span>

                            {/* YouTube Music */}
                            <a
                              href={getYouTubeMusicUrl(song)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 shrink-0 transition-colors flex items-center gap-1"
                            >
                              <span>유튜브뮤직</span>
                            </a>

                            {/* Spotify */}
                            <a
                              href={getSpotifyUrl(song)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 shrink-0 transition-colors flex items-center gap-1"
                            >
                              <span>Spotify</span>
                            </a>

                            {/* Apple Music */}
                            <a
                              href={getAppleMusicUrl(song)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-md bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 shrink-0 transition-colors flex items-center gap-1"
                            >
                              <span>Apple Music</span>
                            </a>

                            {/* Melon */}
                            <a
                              href={getMelonUrl(song)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-md bg-lime-500/10 hover:bg-lime-500/20 text-lime-600 dark:text-lime-400 shrink-0 transition-colors flex items-center gap-1"
                            >
                              <span>멜론</span>
                            </a>

                            {/* Bugs */}
                            <a
                              href={getBugsUrl(song)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 shrink-0 transition-colors flex items-center gap-1"
                            >
                              <span>벅스</span>
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
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
                  {lang === 'ko' ? '곡 추가 / 추천곡' : 'Recommended Tracks'}
                </h3>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lang === 'ko'
                  ? '선택한 장르의 BPM 맞춤 추천곡을 내 플레이리스트에 담아보세요'
                  : 'Add cadence-matched tracks from your selected genres'}
              </p>
            </div>

            <button
              type="button"
              onClick={onRefreshRecommendations}
              className="py-1.5 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>{lang === 'ko' ? '다른 곡 보기' : 'Refresh'}</span>
            </button>
          </div>

          {recommendedSongs.length === 0 ? (
            <div className="p-5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {lang === 'ko'
                  ? `현재 선택한 장르의 ${targetBpm} ± 2 BPM 곡이 모두 플레이리스트에 담겨 있어요`
                  : `All tracks in ${targetBpm} ± 2 BPM are already in your playlist`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {recommendedSongs.map((song, index) => {
                  const songKey = song.normalized_key || song.title + song.artist;
                  const songBpm = getSongBpm(song);
                  const isPlayingThis =
                    currentPlayingSong?.normalized_key === song.normalized_key && isPlayingAudio;
                  const isExactOrClose = Math.abs(songBpm - targetBpm) <= 2;
                  const recTitle = getSongTitle(song, lang);
                  const recArtist = getSongArtist(song, lang);

                  return (
                    <motion.div
                      key={`rec-${songKey}-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                    >
                      {/* Thumbnail & Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onPlaySong(song)}
                          aria-label={`${recTitle} 미리듣기 재생`}
                          className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group cursor-pointer"
                        >
                          {song.cover_url ? (
                            <Image
                              src={song.cover_url}
                              alt={recTitle}
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
                              isPlayingThis
                                ? 'opacity-100 bg-black/50'
                                : 'opacity-0 group-hover:opacity-100'
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
                            {recTitle}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {recArtist} · {CATEGORY_NAMES[lang][song.genre_tag] || song.genre_tag}
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

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => onAddSong(song)}
                          aria-label={`${recTitle} 플레이리스트에 추가`}
                          className="p-1.5 rounded-xl bg-zinc-100 hover:bg-[#C4FF00] hover:text-black dark:bg-zinc-800 dark:hover:bg-[#C4FF00] dark:hover:text-black text-zinc-700 dark:text-zinc-300 transition-all shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Sleek Export & Platform Deployment Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        playlist={playlist}
        targetBpm={targetBpm}
        selectedCategories={selectedCategories}
        isDark={isDark}
        showToast={showToast}
        playlistName={playlistTitle}
        lang={lang}
        onPlaylistNameChange={(newName) => setPlaylistTitle(newName)}
      />
    </div>
  );
};
