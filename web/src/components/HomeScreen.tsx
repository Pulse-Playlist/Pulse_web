'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Star,
  Play,
  Pause,
  Plus,
  ChevronRight,
  MoreHorizontal,
  Heart,
  ArrowRight,
  Music2,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { playTapKick, playPopSound } from '@/lib/soundEffects';
import {
  AppLanguage,
  SavedPlaylist,
  Song,
  getSongTitle,
  getSongArtist,
} from '@/types/song';
import { getPlaylistCoverUrl } from '@/lib/playlistGenerator';

export interface HomeScreenProps {
  isDark: boolean;
  onToggleTheme: () => void;
  lang: AppLanguage;
  onToggleLang: () => void;
  onStart: () => void;
  onOpenArtistSelect?: () => void;
  preferredArtistsCount?: number;
  onSelectPlaylist: (playlist: SavedPlaylist) => void;
  communityPlaylists?: SavedPlaylist[];
  onLikePlaylist?: (id: string) => void;
  totalSongsCount?: number;
  allSongs?: Song[];
  preferredArtists?: string[];
  currentPlayingSong?: Song | null;
  isPlayingAudio?: boolean;
  onSelectSongPreview?: (song: Song) => void;
}

type BpmFilter = 'all' | 'under130' | '131to160' | 'over161';

function getBpmZoneStyle(bpm: number) {
  if (bpm <= 130) {
    return {
      bg: 'bg-[#C4FF00]/15',
      text: 'text-[#4d7c0f] dark:text-[#C4FF00]',
      border: 'border-[#C4FF00]/30',
      badgeBg: 'bg-[#C4FF00] text-black',
      accent: '#C4FF00',
    };
  }
  if (bpm <= 160) {
    return {
      bg: 'bg-[#3B82F6]/15',
      text: 'text-blue-600 dark:text-[#3B82F6]',
      border: 'border-[#3B82F6]/30',
      badgeBg: 'bg-[#3B82F6] text-white',
      accent: '#3B82F6',
    };
  }
  return {
    bg: 'bg-[#FF4B4B]/15',
    text: 'text-red-600 dark:text-[#FF4B4B]',
    border: 'border-[#FF4B4B]/30',
    badgeBg: 'bg-[#FF4B4B] text-white',
    accent: '#FF4B4B',
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isDark,
  onToggleTheme,
  lang,
  onToggleLang,
  onStart,
  onOpenArtistSelect,
  preferredArtistsCount = 0,
  onSelectPlaylist,
  communityPlaylists = [],
  onLikePlaylist,
  totalSongsCount = 22019,
  allSongs = [],
  preferredArtists = [],
  currentPlayingSong = null,
  isPlayingAudio = false,
  onSelectSongPreview,
}) => {
  const [activeFilter, setActiveFilter] = useState<BpmFilter>('all');
  const [likedMap, setLikedMap] = useState<Record<string, number>>({});
  const [userLikedSet, setUserLikedSet] = useState<Set<string>>(new Set());

  // Formatted date caption for Apple HIG header (e.g. "SATURDAY, NOV 7" or "11월 7일 토요일")
  const todayDateStr = useMemo(() => {
    try {
      return new Date()
        .toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
        .toUpperCase();
    } catch {
      return lang === 'ko' ? '오늘의 케이던스' : 'TODAY';
    }
  }, [lang]);

  const handleLike = (id: string, initialLikes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playPopSound();

    const isAlreadyLiked = userLikedSet.has(id);
    const currentLikes = likedMap[id] !== undefined ? likedMap[id] : initialLikes;
    const nextLikes = isAlreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    setLikedMap((prev) => ({ ...prev, [id]: nextLikes }));
    setUserLikedSet((prev) => {
      const next = new Set(prev);
      if (isAlreadyLiked) next.delete(id);
      else next.add(id);
      return next;
    });

    onLikePlaylist?.(id);
  };

  // Filtered community playlists based on BPM filter
  const filteredPlaylists = useMemo(() => {
    return communityPlaylists.filter((pl) => {
      if (activeFilter === 'under130') return pl.bpm <= 130;
      if (activeFilter === '131to160') return pl.bpm > 130 && pl.bpm <= 160;
      if (activeFilter === 'over161') return pl.bpm > 160;
      return true;
    });
  }, [communityPlaylists, activeFilter]);

  // Pool of tracks for the 4-row track grid (Section 2)
  const songsPool = useMemo(() => {
    let source: Song[] = [];
    if (allSongs && allSongs.length > 0) {
      source = allSongs;
    } else if (communityPlaylists && communityPlaylists.length > 0) {
      source = communityPlaylists.flatMap((p) => p.songs || []);
    }

    // Deduplicate songs
    const seen = new Set<string>();
    const unique: Song[] = [];
    for (const song of source) {
      const key = song.normalized_key || `${song.artist}-${song.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(song);
      }
    }

    // Filter by active BPM filter
    const filtered = unique.filter((song) => {
      const bpm = song.running_bpm || song.raw_bpm || 150;
      if (activeFilter === 'under130') return bpm <= 130;
      if (activeFilter === '131to160') return bpm > 130 && bpm <= 160;
      if (activeFilter === 'over161') return bpm > 160;
      return true;
    });

    // Prioritize preferred artists or high popularity
    filtered.sort((a, b) => {
      const aPref = preferredArtists?.some((pa) =>
        a.artist?.toLowerCase().includes(pa.toLowerCase())
      )
        ? 1
        : 0;
      const bPref = preferredArtists?.some((pa) =>
        b.artist?.toLowerCase().includes(pa.toLowerCase())
      )
        ? 1
        : 0;
      if (aPref !== bPref) return bPref - aPref;
      const aPop = a.popularity_score || a.running_score || 0;
      const bPop = b.popularity_score || b.running_score || 0;
      return bPop - aPop;
    });

    return filtered.slice(0, 16);
  }, [allSongs, communityPlaylists, activeFilter, preferredArtists]);

  // Group into columns of 4 for the 4-row grid
  const songColumns = useMemo(() => {
    const cols: Song[][] = [];
    for (let i = 0; i < songsPool.length; i += 4) {
      cols.push(songsPool.slice(i, i + 4));
    }
    return cols;
  }, [songsPool]);

  return (
    <div className="flex flex-col min-h-dvh select-none pb-24 px-5 pt-3 space-y-7">
      {/* ========================================================
          Apple HIG Large Title Header Bar
          ======================================================== */}
      <header className="pt-2 pb-1 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-black tracking-wider uppercase text-zinc-400 dark:text-zinc-500 mb-0.5">
            {todayDateStr}
          </p>
          <h1 className="text-[34px] font-black tracking-tight leading-none text-zinc-900 dark:text-white font-display">
            {lang === 'ko' ? '홈' : 'Home'}
          </h1>
        </div>

        {/* Circular Apple HIG glass avatar/control buttons */}
        <div className="flex items-center gap-2">
          {/* Language Toggle circular glass button */}
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onToggleLang();
            }}
            className="w-9 h-9 rounded-full bg-zinc-200/75 dark:bg-zinc-800/85 backdrop-blur-md border border-black/5 dark:border-white/10 text-[11px] font-black text-zinc-800 dark:text-[#C4FF00] flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-xs"
            aria-label="언어 전환 / Language toggle"
            title="한국어 / English"
          >
            {lang === 'ko' ? 'EN' : 'KO'}
          </button>

          {/* ThemeToggle inside matching glass circle */}
          <div className="w-9 h-9 rounded-full bg-zinc-200/75 dark:bg-zinc-800/85 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center shadow-xs">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>

          {/* Circular Profile/Artist Bubble badge */}
          {onOpenArtistSelect && (
            <button
              type="button"
              onClick={() => {
                playPopSound(true);
                onOpenArtistSelect();
              }}
              className="w-9 h-9 rounded-full bg-zinc-200/75 dark:bg-zinc-800/85 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-xs relative"
              aria-label="최애 아티스트 취향 설정"
              title={lang === 'ko' ? '최애 아티스트 취향 설정' : 'Artist Taste Profile'}
            >
              {preferredArtistsCount > 0 ? (
                <span className="text-[11px] font-black text-zinc-900 dark:text-[#C4FF00]">
                  {preferredArtistsCount}
                </span>
              ) : (
                <Sparkles className="w-4 h-4 text-zinc-700 dark:text-[#C4FF00]" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* ========================================================
          Section 1: Top Picks for You (Fixed 2-Column Side-by-Side Grid, No Horizontal Scroll)
          ======================================================== */}
      <section className="space-y-3">
        <h2 className="text-[21px] font-black tracking-tight text-zinc-900 dark:text-white">
          {lang === 'ko' ? '맞춤 추천' : 'Top Picks for You'}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1 — Primary "Create Cadence Mix" Card */}
          <div
            onClick={() => {
              playTapKick(1);
              onStart();
            }}
            className="w-full rounded-[20px] p-3 flex flex-col justify-between bg-[#161618] dark:bg-[#141416] text-white shadow-md border border-black/5 dark:border-white/10 cursor-pointer group relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            {/* Top inner square artwork box */}
            <div className="w-full aspect-square rounded-[14px] bg-zinc-900 border border-white/[0.07] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <Star className="w-12 h-12 text-[#C4FF00] fill-[#C4FF00] group-hover:scale-[1.03] transition-transform duration-200" />

              <div className="absolute bottom-2 left-2">
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                  160 BPM
                </span>
              </div>

              {/* + Create overlay on hover */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <span className="px-3 py-1 rounded-full bg-[#C4FF00] text-black font-black text-xs shadow-md flex items-center gap-1 scale-95 group-hover:scale-100 transition-transform">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  {lang === 'ko' ? '만들기' : 'Create'}
                </span>
              </div>
            </div>

            {/* Bottom editorial caption inside the dark card */}
            <div className="pt-2.5">
              <p className="text-[10px] font-semibold text-zinc-400">
                {lang === 'ko' ? '맞춤 러닝 케이던스' : 'Made for Your Pace'}
              </p>
              <div className="text-[14px] font-black text-white leading-snug mt-0.5 flex items-center justify-between gap-1">
                <span className="truncate">{lang === 'ko' ? '러닝 플리 만들기' : 'Create Cadence Mix'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C4FF00] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                {lang === 'ko'
                  ? `${totalSongsCount.toLocaleString()}곡 중 내 보폭에 맞는 30곡 생성`
                  : `Sync 30 tracks from ${totalSongsCount.toLocaleString()} songs.`}
              </p>
            </div>
          </div>

          {/* Card 2 — "Artist Taste Selection" Fixed Side-by-Side Card */}
          <div
            onClick={() => {
              playPopSound(true);
              onOpenArtistSelect?.();
            }}
            className="w-full rounded-[20px] p-3 flex flex-col justify-between bg-[#161618] dark:bg-[#141416] text-white shadow-md border border-black/5 dark:border-white/10 cursor-pointer group relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            {/* Inner square graphic box */}
            <div className="w-full aspect-square rounded-[14px] bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/[0.07] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              {/* Minimal concentric rings / geometric accent */}
              <div className="absolute w-24 h-24 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute w-16 h-16 rounded-full border border-white/10 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-200">
                  <Sparkles className="w-5 h-5 text-[#C4FF00]" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2">
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                  {preferredArtistsCount > 0 ? `${preferredArtistsCount} ARTISTS` : 'TASTE PROFILE'}
                </span>
              </div>
            </div>

            {/* Bottom text */}
            <div className="pt-2.5">
              <p className="text-[10px] font-semibold text-[#C4FF00]">
                {lang === 'ko' ? '취향 아티스트' : 'Taste Profile'}
              </p>
              <div className="text-[14px] font-black text-white leading-snug mt-0.5 flex items-center justify-between gap-1">
                <span className="truncate">{lang === 'ko' ? '최애 아티스트 고르기' : 'Pick Favorite Artists'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C4FF00] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                {preferredArtistsCount > 0
                  ? lang === 'ko'
                    ? `${preferredArtistsCount}팀의 최애 아티스트 취향 반영 중`
                    : `${preferredArtistsCount} favorite artists active`
                  : lang === 'ko'
                  ? '좋아하는 아티스트를 골라 플리에 반영'
                  : 'Pick artists to personalize your mix'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          Section 2: ☆ Favourite Cadence Hits > — Apple Music 4-Row Horizontal Track Grid
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#C4FF00] fill-[#C4FF00]" />
              <h2 className="text-[20px] font-black tracking-tight text-zinc-900 dark:text-white">
                {lang === 'ko' ? '인기 러닝 케이던스 트랙' : 'Favourite Cadence Hits'}
              </h2>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>

          {/* Compact BPM Zone filter pills with Apple HIG colored dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('all');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {lang === 'ko' ? '전체' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('under130');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center ${
                activeFilter === 'under130'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#C4FF00] inline-block mr-1.5 shrink-0" />
              ~130 BPM
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('131to160');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center ${
                activeFilter === '131to160'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] inline-block mr-1.5 shrink-0" />
              131~160 BPM
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('over161');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center ${
                activeFilter === 'over161'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4B4B] inline-block mr-1.5 shrink-0" />
              161+ BPM
            </button>
          </div>
        </div>

        {/* 4-Row Horizontal Scroll-Snap Track Grid */}
        {songColumns.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 scrollbar-none -mx-5 px-5 py-1">
            {songColumns.map((col, colIdx) => (
              <div
                key={colIdx}
                className="w-[86%] shrink-0 snap-start flex flex-col"
              >
                {col.map((song, rowIdx) => {
                  const bpm = song.running_bpm || song.raw_bpm || 150;
                  const zoneStyle = getBpmZoneStyle(bpm);
                  const isStarred =
                    (preferredArtists &&
                      preferredArtists.some((pa) =>
                        song.artist?.toLowerCase().includes(pa.toLowerCase())
                      )) ||
                    (song.popularity_score || 0) > 70;
                  const isCurrentTrack =
                    currentPlayingSong?.normalized_key === song.normalized_key;
                  const isPlaying = isCurrentTrack && isPlayingAudio;

                  return (
                    <div
                      key={song.normalized_key || `${colIdx}-${rowIdx}`}
                      onClick={() => {
                        playPopSound();
                        onSelectSongPreview?.(song);
                      }}
                      className={`flex items-center gap-3 py-2 border-b border-zinc-200/70 dark:border-zinc-800/70 last:border-b-0 group cursor-pointer rounded-xl px-1.5 transition-colors ${
                        isCurrentTrack
                          ? `${zoneStyle.bg} border-transparent`
                          : 'hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/5 dark:active:bg-white/5'
                      }`}
                    >
                      {/* Left: Star indicator */}
                      <div className="w-3.5 shrink-0 flex items-center justify-center">
                        {isStarred ? (
                          <Star
                            className="w-3.5 h-3.5 fill-current"
                            style={{ color: zoneStyle.accent }}
                          />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      {/* Album Cover Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-zinc-200 dark:bg-zinc-800 border border-black/5 dark:border-white/10 shadow-xs">
                        {song.cover_url ? (
                          <Image
                            src={song.cover_url}
                            alt={song.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                            <Music2 className="w-5 h-5 text-zinc-400" />
                          </div>
                        )}

                        {/* Play/Pause overlay */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-all ${
                            isPlaying
                              ? 'bg-black/50 opacity-100'
                              : 'bg-black/40 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isPlaying ? (
                            <Pause
                              className="w-4 h-4 fill-current"
                              style={{ color: zoneStyle.accent }}
                            />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      {/* Song Title & Subtitle (Clean layout without redundant BPM to prevent truncation) */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h4
                          className={`text-[14px] font-bold truncate transition-colors ${
                            isCurrentTrack
                              ? zoneStyle.text
                              : 'text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                          }`}
                        >
                          {getSongTitle(song, lang)}
                        </h4>
                        <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {getSongArtist(song, lang)}
                        </p>
                      </div>

                      {/* Right: BPM Zone Badge & More button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md tabular-nums ${zoneStyle.bg} ${zoneStyle.text} border ${zoneStyle.border}`}
                        >
                          {bpm} BPM
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPopSound();
                            onSelectSongPreview?.(song);
                          }}
                          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {lang === 'ko'
                ? '해당 BPM 조건의 트랙이 없습니다'
                : 'No tracks found in this BPM range'}
            </p>
          </div>
        )}
      </section>

      {/* ========================================================
          Section 3: Community Cadence Mixes > — Apple Music Square Album Carousel
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h2 className="text-[20px] font-black tracking-tight text-zinc-900 dark:text-white">
              {lang === 'ko' ? '실시간 러닝 플리' : 'Community Cadence Mixes'}
            </h2>
            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            {filteredPlaylists.length} {lang === 'ko' ? '개' : 'mixes'}
          </span>
        </div>

        {/* Square Album Horizontal Scroll-Snap Container (w-[148px] for optimal mobile viewport proportion) */}
        {filteredPlaylists.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 scrollbar-none -mx-5 px-5 pb-4">
            {filteredPlaylists.map((pl) => {
              const cover = getPlaylistCoverUrl(pl.bpm);
              const currentLikes =
                likedMap[pl.id] !== undefined ? likedMap[pl.id] : pl.likes;
              const isLiked = userLikedSet.has(pl.id);
              const zoneStyle = getBpmZoneStyle(pl.bpm);

              return (
                <div
                  key={pl.id}
                  onClick={() => {
                    playPopSound();
                    onSelectPlaylist(pl);
                  }}
                  className="w-[148px] shrink-0 snap-start cursor-pointer group"
                >
                  {/* Square Artwork */}
                  <div className="w-[148px] h-[148px] rounded-[18px] overflow-hidden relative bg-zinc-900 border border-black/5 dark:border-white/10 shadow-sm group-hover:scale-[1.02] transition-transform">
                    <Image src={cover} alt={pl.name} fill className="object-cover" />

                    {/* Top-left pill badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${zoneStyle.badgeBg} shadow-xs`}
                      >
                        {pl.bpm} BPM
                      </span>
                    </div>

                    {/* Bottom-right heart like button */}
                    <button
                      type="button"
                      onClick={(e) => handleLike(pl.id, pl.likes, e)}
                      className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-xs ${
                        isLiked
                          ? 'bg-rose-500 text-white'
                          : 'bg-black/60 text-white/90 hover:bg-black/80 border border-white/10'
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          isLiked ? 'fill-white text-white' : 'text-white'
                        }`}
                      />
                      <span>{currentLikes}</span>
                    </button>

                    {/* Play hover overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Below square artwork */}
                  <h3 className="text-[13px] font-bold text-zinc-900 dark:text-white truncate mt-1.5 group-hover:text-[#00A344] dark:group-hover:text-[#C4FF00] transition-colors">
                    {pl.name}
                  </h3>
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                    {pl.author} · {pl.songs.length}
                    {lang === 'ko' ? '곡' : ' tracks'}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full py-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {lang === 'ko'
                ? '해당 BPM 조건의 플레이리스트가 없어요'
                : 'No playlists in this BPM range'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
