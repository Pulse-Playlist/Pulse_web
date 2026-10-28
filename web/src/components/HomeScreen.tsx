'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, Zap, Flame, Plus, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { playTapKick, playPopSound } from '@/lib/soundEffects';
import { AppLanguage, GenreTag, SavedPlaylist, getSongTitle, getSongArtist } from '@/types/song';
import { getPlaylistCoverUrl } from '@/lib/playlistGenerator';

interface HomeScreenProps {
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
}

type BpmFilter = 'all' | 'under130' | '131to160' | 'over161';

const GENRE_LABELS: Record<AppLanguage, Record<GenreTag, string>> = {
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

function formatTimeAgo(isoDate: string, lang: AppLanguage): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return lang === 'ko' ? '방금 전' : 'just now';
    if (diffMins < 60) return lang === 'ko' ? `${diffMins}분 전` : `${diffMins}m ago`;
    if (diffHours < 24) return lang === 'ko' ? `${diffHours}시간 전` : `${diffHours}h ago`;
    return lang === 'ko' ? `${diffDays}일 전` : `${diffDays}d ago`;
  } catch {
    return lang === 'ko' ? '최근' : 'recent';
  }
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
  totalSongsCount = 1320,
}) => {
  const logoSrc = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';
  const [activeFilter, setActiveFilter] = useState<BpmFilter>('all');
  const [likedMap, setLikedMap] = useState<Record<string, number>>({});
  const [userLikedSet, setUserLikedSet] = useState<Set<string>>(new Set());

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

  const filteredPlaylists = communityPlaylists.filter((pl) => {
    if (activeFilter === 'under130') return pl.bpm <= 130;
    if (activeFilter === '131to160') return pl.bpm > 130 && pl.bpm <= 160;
    if (activeFilter === 'over161') return pl.bpm > 160;
    return true;
  });

  return (
    <div className="flex flex-col min-h-dvh select-none pb-12">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 grid grid-cols-3 items-center px-5 h-14 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-900">
        <div />

        <div className="flex items-center justify-center gap-2">
          <div className="relative w-6 h-6 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image src={logoSrc} alt="PULSE" fill className="object-cover" priority />
          </div>
          <span className="font-black tracking-widest text-sm uppercase font-display text-zinc-900 dark:text-white">
            PULSE
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          {/* Minimal Language Toggle Text */}
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onToggleLang();
            }}
            className="text-[11px] font-extrabold tracking-tight text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer px-1 py-0.5"
            aria-label="언어 전환 / Language toggle"
            title="한국어 / English"
          >
            <span className={lang === 'ko' ? 'text-zinc-900 dark:text-[#C4FF00] font-black' : 'text-zinc-400 dark:text-zinc-600'}>
              KO
            </span>
            <span className="mx-0.5 text-zinc-300 dark:text-zinc-700">/</span>
            <span className={lang === 'en' ? 'text-zinc-900 dark:text-[#C4FF00] font-black' : 'text-zinc-400 dark:text-zinc-600'}>
              EN
            </span>
          </button>

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Main Container */}
      <main className="px-5 pt-4 space-y-6">
        {/* Compact, Punchy Hero Card */}
        <section className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-zinc-100 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl">
          {/* Animated Background Pulse Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#C4FF00]/15 dark:bg-[#C4FF00]/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

          {/* Pulsing ECG line behind text */}
          <div className="absolute right-3 top-4 w-32 h-16 pointer-events-none opacity-25 dark:opacity-40">
            <svg viewBox="0 0 160 50" fill="none" className="w-full h-full stroke-[#C4FF00]">
              <motion.path
                d="M 5 25 L 45 25 L 52 10 L 60 40 L 70 5 L 82 45 L 90 20 L 98 30 L 105 25 L 155 25"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0.2, pathOffset: 0 }}
                animate={{ pathOffset: [0, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
          </div>

          <div className="relative z-10 space-y-3">
            {/* Pulsing Neon Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/90 dark:bg-black border border-[#C4FF00]/40 text-[11px] font-black text-[#C4FF00] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4FF00] animate-ping" />
              <Sparkles className="w-3 h-3 text-[#C4FF00]" />
              <span>
                {lang === 'ko'
                  ? `엄선된 러닝 트랙 ${totalSongsCount}곡`
                  : `${totalSongsCount} Running Tracks Ready`}
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white leading-snug">
                {lang === 'ko' ? '내 템포에 맞춘 러닝 플리' : 'Find Your Cadence Flow'}
              </h1>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                {lang === 'ko'
                  ? '러닝 케이던스에 딱 맞는 음악으로 페이스를 유지하세요'
                  : 'Sync your running pace with precision-tuned BPM tracks'}
              </p>
            </div>

            {/* Main CTA Button: + 플레이리스트 만들기 */}
            <motion.button
              type="button"
              onClick={() => {
                playTapKick(1);
                onStart();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-[#C4FF00] hover:bg-[#B5F000] text-black font-black text-sm shadow-lg shadow-[#C4FF00]/25 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-[#B0EC00]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'ko' ? '플레이리스트 만들기' : 'Create Playlist'}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>

            {/* Quick Spotify-Style Artist Bubble Taste Button */}
            {onOpenArtistSelect && (
              <motion.button
                type="button"
                onClick={() => {
                  playPopSound(true);
                  onOpenArtistSelect();
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 px-4 rounded-2xl bg-black/85 dark:bg-zinc-800/90 hover:bg-black text-white dark:text-zinc-100 font-bold text-xs border border-zinc-300/20 dark:border-zinc-700 flex items-center justify-between cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4FF00]" />
                  <span>
                    {lang === 'ko'
                      ? '🫧 내 최애 아티스트 취향 버블 고르기'
                      : '🫧 Pick Favorite Artist Bubbles'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#C4FF00]/20 text-[#C4FF00] text-[10px] font-black">
                  {preferredArtistsCount > 0
                    ? lang === 'ko'
                      ? `${preferredArtistsCount}팀 선택됨`
                      : `${preferredArtistsCount} picked`
                    : 'NEW'}
                </span>
              </motion.button>
            )}
          </div>
        </section>

        {/* Community Playlist Feed Section */}
        <section className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 dark:bg-orange-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white">
                  {lang === 'ko' ? '실시간 러닝 플리 피드' : 'Community Feed'}
                </h2>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {lang === 'ko' ? '러너들이 직접 달리고 저장한 인기 믹스' : 'Trending cadence mixes saved by runners'}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {filteredPlaylists.length}
              {lang === 'ko' ? '개' : ' lists'}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('all');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {lang === 'ko' ? '전체 (All)' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('under130');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                activeFilter === 'under130'
                  ? 'bg-lime-500 text-black shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              🟢 ~130
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('131to160');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                activeFilter === '131to160'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              🔵 131~160
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveFilter('over161');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                activeFilter === 'over161'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              🔴 161+
            </button>
          </div>

          {/* Playlist Cards List */}
          <div className="space-y-3 pt-1">
            <AnimatePresence mode="popLayout">
              {filteredPlaylists.map((pl) => {
                const cover = getPlaylistCoverUrl(pl.bpm);
                const currentLikes = likedMap[pl.id] !== undefined ? likedMap[pl.id] : pl.likes;
                const isLiked = userLikedSet.has(pl.id);

                return (
                  <motion.div
                    key={pl.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    onClick={() => onSelectPlaylist(pl)}
                    className="p-4 rounded-3xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group space-y-3"
                  >
                    {/* Top Row: BPM Cover + Playlist Name & Author */}
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700 bg-black shadow-sm group-hover:scale-105 transition-transform">
                        <Image src={cover} alt={pl.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black text-[#C4FF00] dark:bg-[#C4FF00] dark:text-black shrink-0 shadow-xs">
                            {pl.bpm} BPM
                          </span>
                          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                            {pl.author} · {formatTimeAgo(pl.createdAt, lang)}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-zinc-900 dark:text-white truncate mt-1 group-hover:text-[#00A344] dark:group-hover:text-[#C4FF00] transition-colors">
                          {pl.name}
                        </h3>
                      </div>
                    </div>

                    {/* Category Badges & Track Count */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <div className="flex flex-wrap gap-1">
                        {pl.categories.map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                          >
                            {GENRE_LABELS[lang][cat] || cat}
                          </span>
                        ))}
                      </div>

                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
                        {pl.songs.length}
                        {lang === 'ko' ? '곡 수록' : ' tracks'}
                      </span>
                    </div>

                    {/* Mini Preview of 2-3 Tracks */}
                    {pl.songs && pl.songs.length > 0 && (
                      <div className="space-y-1 bg-white dark:bg-black/40 rounded-xl p-2.5 border border-zinc-200/80 dark:border-zinc-800/80 text-[11px]">
                        {pl.songs.slice(0, 3).map((song, i) => (
                          <div
                            key={song.normalized_key || `${song.title}-${i}`}
                            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 truncate"
                          >
                            <span className="text-[10px] text-zinc-400 font-mono w-3 shrink-0">
                              {i + 1}.
                            </span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                              {getSongArtist(song, lang)}
                            </span>
                            <span className="text-zinc-400">-</span>
                            <span className="truncate">{getSongTitle(song, lang)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Row: Like Button + '바로 듣기 →' Button */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        type="button"
                        onClick={(e) => handleLike(pl.id, pl.likes, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-white dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:text-rose-500'
                        }`}
                        title="좋아요 / Like"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                          }`}
                        />
                        <span>{currentLikes}</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={() => onSelectPlaylist(pl)}
                        className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-black shadow-sm group-hover:bg-[#C4FF00] group-hover:text-black transition-all cursor-pointer"
                      >
                        <Music2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ko' ? '바로 듣기 →' : 'Open →'}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredPlaylists.length === 0 && (
              <div className="p-8 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 text-center border border-dashed border-zinc-300 dark:border-zinc-800">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {lang === 'ko' ? '해당 BPM 조건의 플레이리스트가 없어요' : 'No playlists in this BPM range'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
