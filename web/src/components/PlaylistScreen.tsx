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
import { playSuccessFanfare } from '@/lib/soundEffects';

export interface PlaylistScreenProps {
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
    edm: '이디엠',
    pop: '팝',
    jpop: '제이팝',
  },
  en: {
    hiphop: 'HIP-HOP',
    rock: 'ROCK',
    kpop: 'K-POP',
    band: 'BAND',
    edm: 'EDM',
    pop: 'POP',
    jpop: 'J-POP',
  },
};

export const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  targetBpm,
  selectedCategories,
  playlist,
  recommendedSongs,
  currentPlayingSong,
  isPlayingAudio,
  isContinuousPlay: _isContinuousPlay,
  onPlaySong,
  onToggleContinuousPlay,
  onRemoveSong,
  onAddSong,
  onReshuffle,
  onRefreshRecommendations,
  onBack,
  isDark,
  onToggleTheme: _onToggleTheme,
  showToast,
  lang,
  onToggleLang: _onToggleLang,
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

  // Mandatory BPM Range Cover Image & Zone metadata
  const coverUrl = getPlaylistCoverUrl(targetBpm);
  const zone = getBpmZoneLabel(targetBpm);
  const zoneColor = targetBpm <= 130 ? '#C4FF00' : targetBpm <= 160 ? '#3B82F6' : '#FF4B4B';
  const isLimeZone = targetBpm <= 130;

  // Total duration in minutes / hours
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

  // Handle Reshuffle with rotation animation + subtle canvas-confetti burst
  const handleReshuffleClick = () => {
    setIsShuffling(true);
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.35 },
        colors: ['#C4FF00', '#3B82F6', '#FF4B4B', '#FFFFFF'],
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti fallback
    }

    onReshuffle();
    setTimeout(() => setIsShuffling(false), 600);
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

      if (res.status === 429) {
        const retry = res.headers.get('Retry-After') || '15';
        window.location.href = `/rate-limit?retry=${retry}`;
        return;
      }

      if (!res.ok) {
        throw new Error('피드 저장에 실패했습니다');
      }

      const data = await res.json();
      setHasSavedToFeed(true);

      // Trigger Confetti & Sound Fanfare
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.4 },
          colors: ['#C4FF00', '#3B82F6', '#FF4B4B', '#FFFFFF'],
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

  const genreSummaryText = useMemo(() => {
    if (selectedCategories.length === 0) {
      return lang === 'ko' ? '전체 장르' : 'All Genres';
    }
    return selectedCategories.map((c) => CATEGORY_NAMES[lang][c] || c).join(' · ');
  }, [selectedCategories, lang]);

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      {/* 1. Clean, Symmetrical Top Navigation Bar (Apple Music iOS 26 detail header) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 pt-3 pb-2 bg-white/75 dark:bg-black/75 backdrop-blur-2xl border-b border-black/5 dark:border-white/5">
        {/* Left: Circular glass Back button */}
        <button
          type="button"
          onClick={onBack}
          aria-label={lang === 'ko' ? '뒤로 가기' : 'Back'}
          className="w-9 h-9 rounded-full bg-zinc-200/80 dark:bg-zinc-800/85 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>

        {/* Center: Subtle PULSE brand / Cadence label */}
        <div className="flex items-center gap-1.5 opacity-80">
          <div className="relative w-4 h-4 rounded-md overflow-hidden">
            <Image
              src={isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png'}
              alt="PULSE"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-black tracking-widest text-[11px] uppercase font-display text-zinc-900 dark:text-white">
            PULSE
          </span>
        </div>

        {/* Right: Symmetrical Circular glass Share/Export button */}
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          aria-label={lang === 'ko' ? '플레이리스트 공유 및 내보내기' : 'Export and share mix'}
          className="w-9 h-9 rounded-full bg-zinc-200/80 dark:bg-zinc-800/85 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-5 pt-3">
        {/* 2. Hero Artwork + Proportional Calendar-Style BPM Badge */}
        <div className="relative w-40 h-40 mx-auto mt-2">
          {/* Clean, static Apple HIG circular cover */}
          <div
            onClick={onToggleContinuousPlay}
            className="w-40 h-40 rounded-full overflow-hidden shadow-xl border border-black/10 dark:border-white/15 relative group cursor-pointer bg-zinc-900"
            title={lang === 'ko' ? '클릭하여 연속 재생' : 'Click to toggle continuous play'}
          >
            <Image
              src={coverUrl}
              alt={`PULSE ${targetBpm} BPM Cover`}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Clean audio playing overlay with zoneColor synchronized dot */}
            {isPlayingAudio && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-md">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: zoneColor }}
                  />
                  <span className="text-[10px] font-bold tracking-wider text-white">
                    PLAYING
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Proportional Calendar-Style Badge in bottom-right corner (Screenshot 4 Sep / 30 replica) */}
          <div className="absolute -bottom-1 -right-1 w-14 h-14 rounded-[16px] bg-zinc-900 dark:bg-zinc-950 border border-white/15 shadow-lg flex flex-col items-center justify-center leading-none z-10 pointer-events-none">
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: zoneColor }}
            >
              BPM
            </span>
            <span className="text-[20px] font-black text-white tracking-tight mt-0.5 font-display">
              {targetBpm}
            </span>
          </div>
        </div>

        {/* Centered Bold Title (Screenshot 4 Bruno Mars style) */}
        <div className="mt-5 text-center px-4">
          {isEditingTitle ? (
            <div className="inline-flex items-center gap-2 max-w-full">
              <input
                type="text"
                autoFocus
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 border-2 border-[#C4FF00] text-[20px] font-black text-zinc-900 dark:text-white focus:outline-none text-center shadow-lg"
              />
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="p-1.5 rounded-xl bg-[#C4FF00] text-black shrink-0 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="group inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-85 transition-opacity max-w-full"
              title={lang === 'ko' ? '클릭하여 이름 수정' : 'Click to edit title'}
            >
              <h1 className="text-[24px] font-black tracking-tight text-zinc-900 dark:text-white leading-tight truncate">
                {playlistTitle}
              </h1>
              <Edit2
                className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-[#C4FF00] shrink-0 transition-colors"
                style={{ color: !isLimeZone ? zoneColor : undefined }}
              />
            </div>
          )}
        </div>

        {/* 3. De-Gimmicked Capsule Action Buttons with ZoneColor Synchronization */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {/* Left Capsule Button — Export Mix */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="py-3 px-4 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-[13px] flex items-center justify-center gap-2 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xs cursor-pointer transition-all active:scale-98"
          >
            <Rocket
              className="w-4 h-4 text-zinc-700 dark:text-zinc-200 shrink-0"
              style={{ color: isLimeZone ? (isDark ? '#C4FF00' : '#4D7C0F') : zoneColor }}
            />
            <span className="truncate">{lang === 'ko' ? '플리 내보내기' : 'Export Mix'}</span>
          </button>

          {/* Right Capsule Button — Play Set List (Continuous Play) */}
          <button
            type="button"
            onClick={onToggleContinuousPlay}
            className={`py-3 px-4 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98 ${
              isPlayingAudio
                ? 'bg-zinc-900 dark:bg-zinc-800 border'
                : 'hover:opacity-90'
            }`}
            style={
              isPlayingAudio
                ? { borderColor: `${zoneColor}80`, color: zoneColor }
                : { backgroundColor: zoneColor, color: isLimeZone ? '#000000' : '#FFFFFF' }
            }
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-4 h-4 fill-current shrink-0" />
                <span className="truncate">{lang === 'ko' ? '일시 정지' : 'Pause Mix'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5 shrink-0" />
                <span className="truncate">{lang === 'ko' ? '연속 재생' : 'Play Mix'}</span>
              </>
            )}
          </button>
        </div>

        {/* 4. Apple HIG Inset Grouped Metadata Card (Screenshot 4 Sofi Stadium card) */}
        <div className="mt-5 rounded-[24px] bg-zinc-100/90 dark:bg-zinc-900/85 backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 divide-y divide-zinc-200/80 dark:divide-zinc-800/80 shadow-xs">
          {/* Row 1 (Cadence & Duration + Save to Feed Circular Button) */}
          <div className="pb-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-zinc-900 dark:text-white truncate">
                {targetBpm} BPM · {zone.label}
              </div>
              <div className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {playlist.length}
                {lang === 'ko' ? '곡 수록' : ' tracks'} ·{' '}
                {lang === 'ko' ? `약 ${durationFormatted} 러닝 코스` : `${durationFormatted} running session`}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveToFeed}
              disabled={isSavingToFeed}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 border ${
                hasSavedToFeed
                  ? 'bg-[#C4FF00]/15 border-[#C4FF00]/40 text-[#C4FF00]'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 border-black/5 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title={
                hasSavedToFeed
                  ? lang === 'ko'
                    ? '피드에 저장됨'
                    : 'Saved to feed'
                  : lang === 'ko'
                  ? '피드에 저장'
                  : 'Save to feed'
              }
            >
              {hasSavedToFeed ? (
                <BookmarkCheck className="w-4 h-4 text-lime-600 dark:text-[#C4FF00]" />
              ) : (
                <BookmarkPlus className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Row 2 (Genres & Artist Taste + Reshuffle & Artist Select Circular Buttons) */}
          <div className="pt-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-zinc-900 dark:text-white truncate">
                {genreSummaryText}
              </div>
              <div className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {preferredArtists.length > 0
                  ? lang === 'ko'
                    ? `최애 아티스트 ${preferredArtists.length}팀 반영`
                    : `${preferredArtists.length} favorite artists`
                  : lang === 'ko'
                  ? '아티스트 취향 설정'
                  : 'Customize favorite artists'}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenArtistSelect && (
                <button
                  type="button"
                  onClick={onOpenArtistSelect}
                  className="w-9 h-9 rounded-full bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-[#C4FF00] cursor-pointer transition-transform active:scale-95"
                  title={lang === 'ko' ? '최애 아티스트 취향 설정' : 'Pick favorite artists'}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleReshuffleClick}
                disabled={isShuffling}
                className="w-9 h-9 rounded-full bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-[#C4FF00] cursor-pointer transition-transform active:scale-95"
                title={lang === 'ko' ? '트랙 순서 새로고침' : 'Reshuffle mix'}
              >
                <motion.div
                  animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <RotateCw className="w-4 h-4" />
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Footnote below Card (Screenshot 4 Powered by Bandsintown style) */}
        <p className="text-center text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-2">
          Powered by PULSE Cadence Engine
        </p>

        {/* 5. Cadence Set List Section & Apple HIG Hairline Tracklist */}
        <section className="mt-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[18px] font-black tracking-tight text-zinc-900 dark:text-white">
              {lang === 'ko' ? '케이던스 셋리스트' : 'Cadence Set List'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              {playlist.length} {lang === 'ko' ? '곡' : 'tracks'}
            </span>
          </div>

          {playlist.length === 0 ? (
            <div className="p-8 rounded-[24px] bg-zinc-100/70 dark:bg-zinc-900/40 text-center border border-dashed border-zinc-300 dark:border-zinc-800">
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-3">
                {lang === 'ko'
                  ? `선택한 장르에 ${targetBpm} ± 2 BPM 곡이 없어요`
                  : `No tracks found in ${targetBpm} ± 2 BPM`}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-full bg-[#C4FF00] text-black text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-transform"
              >
                {lang === 'ko' ? '다른 장르나 BPM 선택하기' : 'Pick another genre or BPM'}
              </button>
            </div>
          ) : (
            <div className="rounded-[24px] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xs overflow-hidden divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              <AnimatePresence mode="popLayout">
                {playlist.map((song, index) => {
                  const songKey = song.normalized_key || song.title + song.artist;
                  const songBpm = getSongBpm(song);
                  const songZoneColor = songBpm <= 130 ? '#C4FF00' : songBpm <= 160 ? '#3B82F6' : '#FF4B4B';
                  const isSongLime = songBpm <= 130;
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`flex flex-col transition-colors duration-150 ${
                        isPlayingThis
                          ? ''
                          : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                      }`}
                      style={isPlayingThis ? { backgroundColor: `${songZoneColor}18` } : undefined}
                    >
                      {/* Main Song Row */}
                      <div className="flex items-center justify-between p-3 gap-2">
                        {/* Index & Cover */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 text-center text-[12px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">
                            {index + 1}
                          </span>

                          {/* Cover Thumbnail with Play/Pause Overlay */}
                          <button
                            type="button"
                            onClick={() => onPlaySong(song)}
                            aria-label={`${displayTitle} 미리듣기 재생`}
                            className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 group cursor-pointer shadow-xs"
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
                                  ? 'opacity-100 bg-black/60'
                                  : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {isPlayingThis ? (
                                <Pause
                                  className="w-4 h-4 fill-current"
                                  style={{ color: songZoneColor }}
                                />
                              ) : (
                                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                              )}
                            </div>
                          </button>

                          {/* Song Title, Artist & Equalizer */}
                          <div className="min-w-0 flex-1 pr-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[13px] font-bold truncate ${
                                  isPlayingThis
                                    ? (isSongLime ? 'text-zinc-950 dark:text-[#C4FF00]' : '')
                                    : 'text-zinc-900 dark:text-white'
                                }`}
                                style={isPlayingThis && !isSongLime ? { color: songZoneColor } : undefined}
                              >
                                {displayTitle}
                              </span>

                              {/* 3-Bar Equalizer when playing (synchronized with songZoneColor) */}
                              {isPlayingThis && (
                                <div className="flex items-end gap-[2px] h-3 w-3 shrink-0 ml-0.5">
                                  <motion.span
                                    className="w-0.5 rounded-full"
                                    style={{ backgroundColor: songZoneColor }}
                                    animate={{ height: ['25%', '100%', '40%', '85%', '25%'] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.8,
                                      ease: 'easeInOut',
                                    }}
                                  />
                                  <motion.span
                                    className="w-0.5 rounded-full"
                                    style={{ backgroundColor: songZoneColor }}
                                    animate={{ height: ['85%', '30%', '100%', '50%', '85%'] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.65,
                                      ease: 'easeInOut',
                                      delay: 0.1,
                                    }}
                                  />
                                  <motion.span
                                    className="w-0.5 rounded-full"
                                    style={{ backgroundColor: songZoneColor }}
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
                              {/* Clean Apple Music Typographic Tags (Zero Emojis) */}
                              {artistTier === 'selected' && (
                                <span className="px-1.5 py-0.5 rounded bg-[#C4FF00]/20 text-lime-800 dark:text-[#C4FF00] text-[9px] font-bold shrink-0">
                                  {lang === 'ko' ? '최애' : 'PICK'}
                                </span>
                              )}
                              {artistTier === 'related' && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold shrink-0">
                                  {lang === 'ko' ? '연관' : 'VIBE'}
                                </span>
                              )}
                              {((song.popularity_score ?? 0) >= 88 ||
                                (song.artist_track_rank ?? 99) <= 5) && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold shrink-0">
                                  {lang === 'ko' ? '인기' : 'HOT'}
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

                        {/* Right side: BPM Badge, Platform pill, Remove (X) */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          {/* Song BPM Badge synchronized with songZoneColor */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isExactOrClose
                                ? 'shadow-xs'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                            }`}
                            style={
                              isExactOrClose
                                ? {
                                    backgroundColor: songZoneColor,
                                    color: isSongLime ? '#000000' : '#FFFFFF',
                                    borderColor: songZoneColor,
                                  }
                                : undefined
                            }
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
                            transition={{ duration: 0.15 }}
                            className="bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200/70 dark:border-zinc-800/70 px-3.5 py-2 flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-bold"
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

        {/* 6. Recommended Tracks & Add to Playlist Section (Apple HIG Hairline Styling, Zero Emojis) */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-zinc-700 dark:text-[#C4FF00]" />
                <h3 className="text-[16px] font-black tracking-tight text-zinc-900 dark:text-white">
                  {lang === 'ko' ? '곡 추가 / 추천곡' : 'Recommended Tracks'}
                </h3>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lang === 'ko'
                  ? '선택한 장르의 BPM 맞춤 추천곡'
                  : 'Add cadence-matched tracks from your selected genres'}
              </p>
            </div>

            <button
              type="button"
              onClick={onRefreshRecommendations}
              className="py-1.5 px-3 rounded-full bg-zinc-200/80 dark:bg-zinc-800/85 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>{lang === 'ko' ? '새로고침' : 'Refresh'}</span>
            </button>
          </div>

          {recommendedSongs.length === 0 ? (
            <div className="p-6 rounded-[24px] bg-zinc-100/70 dark:bg-zinc-900/40 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {lang === 'ko'
                  ? `현재 선택한 장르의 ${targetBpm} ± 2 BPM 곡이 모두 플레이리스트에 담겨 있어요`
                  : `All tracks in ${targetBpm} ± 2 BPM are already in your playlist`}
              </p>
            </div>
          ) : (
            <div className="rounded-[24px] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xs overflow-hidden divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              <AnimatePresence mode="popLayout">
                {recommendedSongs.map((song, index) => {
                  const songKey = song.normalized_key || song.title + song.artist;
                  const songBpm = getSongBpm(song);
                  const recZoneColor = songBpm <= 130 ? '#C4FF00' : songBpm <= 160 ? '#3B82F6' : '#FF4B4B';
                  const isRecLime = songBpm <= 130;
                  const isPlayingThis =
                    currentPlayingSong?.normalized_key === song.normalized_key && isPlayingAudio;
                  const isExactOrClose = Math.abs(songBpm - targetBpm) <= 2;
                  const recTitle = getSongTitle(song, lang);
                  const recArtist = getSongArtist(song, lang);
                  const artistTier = getSongArtistMatchTier(song, preferredArtists);

                  return (
                    <motion.div
                      key={`rec-${songKey}-${index}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between p-3 gap-2 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      style={isPlayingThis ? { backgroundColor: `${recZoneColor}18` } : undefined}
                    >
                      {/* Thumbnail & Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onPlaySong(song)}
                          aria-label={`${recTitle} 미리듣기 재생`}
                          className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group cursor-pointer shadow-xs"
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
                                ? 'opacity-100 bg-black/55'
                                : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isPlayingThis ? (
                              <Pause
                                className="w-3.5 h-3.5 fill-current"
                                style={{ color: recZoneColor }}
                              />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                            )}
                          </div>
                        </button>

                        <div className="min-w-0 flex-1 pr-1">
                          <div
                            className={`text-[13px] font-bold truncate ${
                              !isPlayingThis
                                ? 'text-zinc-900 dark:text-white'
                                : isRecLime
                                ? 'text-zinc-950 dark:text-[#C4FF00]'
                                : ''
                            }`}
                            style={isPlayingThis && !isRecLime ? { color: recZoneColor } : undefined}
                          >
                            {recTitle}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {/* Typographic Tags (Zero Emojis) */}
                            {artistTier === 'selected' && (
                              <span className="px-1.5 py-0.5 rounded bg-[#C4FF00]/20 text-lime-800 dark:text-[#C4FF00] text-[9px] font-bold shrink-0">
                                {lang === 'ko' ? '최애' : 'PICK'}
                              </span>
                            )}
                            {artistTier === 'related' && (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold shrink-0">
                                {lang === 'ko' ? '연관' : 'VIBE'}
                              </span>
                            )}
                            {((song.popularity_score ?? 0) >= 88 ||
                              (song.artist_track_rank ?? 99) <= 5) && (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold shrink-0">
                                {lang === 'ko' ? '인기' : 'HOT'}
                              </span>
                            )}
                            <span className="truncate">{recArtist}</span>
                            <span>·</span>
                            <span className="shrink-0">
                              {CATEGORY_NAMES[lang][song.genre_tag] || song.genre_tag}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: BPM badge & Add (+) button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isExactOrClose
                              ? ''
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                          style={
                            isExactOrClose
                              ? {
                                  backgroundColor: recZoneColor,
                                  color: isRecLime ? '#000000' : '#FFFFFF',
                                  borderColor: recZoneColor,
                                }
                              : undefined
                          }
                        >
                          {songBpm} BPM
                        </span>

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => onAddSong(song)}
                          aria-label={`${recTitle} 플레이리스트에 추가`}
                          className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-[#C4FF00] hover:text-black dark:bg-zinc-800 dark:hover:bg-[#C4FF00] dark:hover:text-black text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all shadow-xs cursor-pointer"
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
