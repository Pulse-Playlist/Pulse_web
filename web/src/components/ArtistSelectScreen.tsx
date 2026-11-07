'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  Check,
  Search,
  ArrowRight,
  X,
  Music,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GenreTag, AppLanguage, Song } from '@/types/song';
import {
  ArtistNode,
  INITIAL_SEED_ARTISTS,
  buildArtistCatalog,
  getExpandedArtistSets,
} from '@/lib/artistClusters';
import { playPopSound, playSuccessFanfare } from '@/lib/soundEffects';

interface ArtistSelectScreenProps {
  allSongs: Song[];
  targetBpm: number;
  selectedCategories: GenreTag[];
  preferredArtists: string[];
  onToggleArtist: (artistName: string) => void;
  onClearArtists: () => void;
  /**
   * 'onboarding': first-visit flow. No back button; user can skip.
   * 'edit': revisited later from Home / Playlist to modify the saved taste.
   */
  mode: 'onboarding' | 'edit';
  /** Called when the user confirms (saves) their selection. */
  onDone: () => void;
  /** Called when the user skips onboarding without choosing anyone. */
  onSkip: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  lang: AppLanguage;
  onToggleLang?: () => void;
}

type FilterTab = 'recommended' | GenreTag | 'all';

export const ArtistSelectScreen: React.FC<ArtistSelectScreenProps> = ({
  allSongs,
  targetBpm,
  selectedCategories,
  preferredArtists,
  onToggleArtist,
  onClearArtists,
  mode,
  onDone,
  onSkip,
  onBack,
  isDark,
  onToggleTheme,
  lang,
  onToggleLang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('recommended');
  // In-place ordered list of artist names in the grid (stable order + in-place insertion)
  const [gridArtistNames, setGridArtistNames] = useState<string[]>([]);
  // Track which artists were dynamically inserted into the grid by clicking a parent artist
  const [spawnedByMap, setSpawnedByMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const lastTabKeyRef = useRef<string>('');

  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  // Build artist catalog dynamically from all songs
  const catalog = useMemo(
    () => buildArtistCatalog(allSongs, targetBpm),
    [allSongs, targetBpm]
  );

  const { selectedSet, relatedSet } = useMemo(
    () => getExpandedArtistSets(preferredArtists),
    [preferredArtists]
  );

  // Build initial base list whenever activeTab or selectedCategories changes (or on first populate)
  useEffect(() => {
    if (catalog.size === 0) return;

    const tabKey = `${activeTab}::${selectedCategories.join(',')}`;
    const isTabChange = lastTabKeyRef.current !== tabKey;

    if (!isTabChange && gridArtistNames.length > 0) {
      return;
    }
    lastTabKeyRef.current = tabKey;

    const allNodes = Array.from(catalog.values());
    const targetGenres: GenreTag[] =
      activeTab === 'recommended'
        ? selectedCategories.length > 0
          ? selectedCategories
          : ['band', 'kpop', 'rock', 'hiphop', 'edm', 'pop', 'jpop']
        : activeTab === 'all'
        ? ['band', 'kpop', 'rock', 'hiphop', 'edm', 'pop', 'jpop']
        : [activeTab];

    const initialNames: string[] = [];
    const seen = new Set<string>();

    // 1. Curated seed artists for the active genres
    for (const g of targetGenres) {
      for (const sName of INITIAL_SEED_ARTISTS[g] || []) {
        if (catalog.has(sName) && !seen.has(sName)) {
          seen.add(sName);
          initialNames.push(sName);
        }
      }
    }

    // 2. Top artists by track count in those genres
    const topGenreArtists = allNodes
      .filter((n) => targetGenres.includes(n.genre))
      .sort((a, b) => b.bpm130_180Count - a.bpm130_180Count || b.trackCount - a.trackCount);

    for (const node of topGenreArtists) {
      if (initialNames.length >= 36) break;
      if (!seen.has(node.name)) {
        seen.add(node.name);
        initialNames.push(node.name);
      }
    }

    setGridArtistNames(initialNames);
    setSpawnedByMap({});
  }, [catalog, activeTab, selectedCategories, gridArtistNames.length]);

  // In-place bubble expansion
  const handleBubbleTap = (artistName: string) => {
    const isAlreadySelected = selectedSet.has(artistName);
    playPopSound(!isAlreadySelected);

    if (!isAlreadySelected && !searchQuery.trim()) {
      const node = catalog.get(artistName);
      if (node && node.related.length > 0) {
        setGridArtistNames((prev) => {
          const idx = prev.indexOf(artistName);
          if (idx === -1) return prev;

          const existingSet = new Set(prev);
          const toInsert: string[] = [];

          for (const relName of node.related) {
            if (toInsert.length >= 3) break;
            const relNode = catalog.get(relName);
            if (!relNode) continue;
            if (existingSet.has(relName)) continue;
            if (
              activeTab !== 'recommended' &&
              activeTab !== 'all' &&
              relNode.genre !== activeTab
            ) {
              continue;
            }
            toInsert.push(relName);
            existingSet.add(relName);
          }

          if (toInsert.length === 0) return prev;

          setSpawnedByMap((oldMap) => {
            const nextMap = { ...oldMap };
            for (const item of toInsert) {
              nextMap[item] = artistName;
            }
            return nextMap;
          });

          const nextGrid = [...prev];
          nextGrid.splice(idx + 1, 0, ...toInsert);
          return nextGrid;
        });
      }
    }

    onToggleArtist(artistName);
  };

  // Resolve the list of ArtistNodes for the 3-column grid
  const displayedArtistNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length > 0) {
      return Array.from(catalog.values())
        .filter(
          (n) =>
            n.name.toLowerCase().includes(q) ||
            n.nameKo.toLowerCase().includes(q) ||
            n.nameEn.toLowerCase().includes(q)
        )
        .sort((a, b) => b.trackCount - a.trackCount)
        .slice(0, 60);
    }

    const list: ArtistNode[] = [];
    for (const name of gridArtistNames) {
      const node = catalog.get(name);
      if (node) list.push(node);
    }
    return list;
  }, [catalog, searchQuery, gridArtistNames]);

  // Apple Music Replay: "Your Top Artists >" 6-Card Carousel list
  // Prioritize user's preferredArtists first, then fill from displayedArtistNodes
  const topCarouselArtists = useMemo(() => {
    const list: ArtistNode[] = [];
    const seen = new Set<string>();

    for (const name of preferredArtists) {
      const node = catalog.get(name);
      if (node && !seen.has(node.name)) {
        seen.add(node.name);
        list.push(node);
      }
    }

    for (const node of displayedArtistNodes) {
      if (list.length >= 8) break;
      if (!seen.has(node.name)) {
        seen.add(node.name);
        list.push(node);
      }
    }

    if (list.length < 6) {
      const all = Array.from(catalog.values()).sort(
        (a, b) => (b.bpm130_180Count || b.trackCount) - (a.bpm130_180Count || a.trackCount)
      );
      for (const node of all) {
        if (list.length >= 6) break;
        if (!seen.has(node.name)) {
          seen.add(node.name);
          list.push(node);
        }
      }
    }

    return list;
  }, [catalog, preferredArtists, displayedArtistNodes]);

  const handleConfirm = () => {
    if (mode === 'onboarding' && preferredArtists.length === 0) {
      onSkip();
      return;
    }

    setIsSaving(true);
    playSuccessFanfare();

    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.8 },
        colors: ['#C4FF00', '#00E5FF', '#A855F7', '#FFFFFF'],
        ticks: 180,
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onDone();
      setIsSaving(false);
    }, 200);
  };

  return (
    <div className="flex flex-col min-h-dvh justify-between select-none relative overflow-x-hidden pb-48">
      {/* Ambient Top Glow */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-64 opacity-20 dark:opacity-25 blur-3xl transition-colors duration-700"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, #C4FF00 0%, transparent 70%)',
        }}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-30 px-5 pt-3 pb-2.5 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'edit' ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={lang === 'ko' ? '이전' : 'Back'}
                className="w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center shadow-sm text-zinc-900 dark:text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-sm">
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
                </div>
                <span className="font-black tracking-widest text-xs uppercase font-display text-zinc-900 dark:text-white">
                  PULSE
                </span>
              </div>
            )}
          </div>

          {/* Quick Header CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              preferredArtists.length > 0
                ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black shadow-[#C4FF00]/25'
                : 'bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {preferredArtists.length > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{lang === 'ko' ? '선택 완료' : 'Done'}</span>
              </>
            ) : mode === 'onboarding' ? (
              <span>{lang === 'ko' ? '건너뛰기' : 'Skip'}</span>
            ) : (
              <span>{lang === 'ko' ? '완료' : 'Done'}</span>
            )}
          </button>
        </div>

        {/* Large Title Row */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
              {lang === 'ko' ? 'TASTE PROFILE · 아티스트' : 'TASTE PROFILE · ARTISTS'}
            </span>
            <h1 className="text-[32px] font-black tracking-tight text-zinc-900 dark:text-white leading-none font-display">
              {lang === 'ko' ? '아티스트 선택' : 'Artists'}
            </h1>
          </div>

          {preferredArtists.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C4FF00]/15 border border-[#C4FF00]/40 text-[#00A344] dark:text-[#C4FF00] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{preferredArtists.length}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-3 z-10">
        {/* NEW — Apple Music "Your Top Artists >" Numbered Portrait Cards Carousel (Screenshot 2 bottom) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[19px] font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1 font-display">
              <span>{lang === 'ko' ? '추천 및 인기 아티스트' : 'Your Top Artists'}</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </h2>
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
              {lang === 'ko' ? '카드 터치로 선택' : 'Tap to pick'}
            </span>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 scrollbar-none -mx-5 px-5 pb-2">
            {topCarouselArtists.map((node, index) => {
              const isSelected = selectedSet.has(node.name);
              const displayName = lang === 'ko' ? node.nameKo : node.nameEn;
              const trackCount = node.bpm130_180Count || node.trackCount;

              return (
                <motion.div
                  key={node.name}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBubbleTap(node.name)}
                  className={`w-[150px] h-[205px] rounded-[24px] overflow-hidden relative shrink-0 snap-start cursor-pointer group shadow-lg border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#C4FF00] ring-2 ring-[#C4FF00]/40 shadow-[#C4FF00]/20'
                      : 'border-black/5 dark:border-white/10'
                  }`}
                >
                  {/* Full-bleed Artist Cover */}
                  {node.coverUrl ? (
                    <Image
                      src={node.coverUrl}
                      alt={displayName}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                      <Music className="w-10 h-10" />
                    </div>
                  )}

                  {/* Gradient Overlay for Apple Music Look */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

                  {/* Top-Left Giant Rank Number (Screenshot 2 exact style) */}
                  <span className="absolute top-2.5 left-3.5 text-[34px] font-black leading-none text-white drop-shadow-md font-display select-none">
                    {index + 1}
                  </span>

                  {/* Top-Right Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#C4FF00] text-black flex items-center justify-center shadow-md border border-black/20">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    </div>
                  )}

                  {/* Bottom Text Details */}
                  <div className="absolute bottom-3 inset-x-0 px-2.5 text-center flex flex-col items-center">
                    <span className="text-[13px] font-black text-white truncate w-full leading-tight drop-shadow-sm font-display">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-semibold text-[#C4FF00] mt-0.5 tracking-tight truncate w-full">
                      {trackCount} cadence tracks
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section Divider: All Artists Search & Browse */}
        <div className="mb-3">
          <h3 className="text-[16px] font-black tracking-tight text-zinc-900 dark:text-white mb-2 font-display">
            {lang === 'ko' ? '전체 아티스트 탐색' : 'Explore All Artists'}
          </h3>

          {/* Search Input */}
          <div className="relative mb-2.5">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ko' ? '아티스트 검색 (한글 / 영문)' : 'Search artists'}
              className="w-full pl-9 pr-9 py-2.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#C4FF00] focus:ring-1 focus:ring-[#C4FF00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Genre Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5">
            {(
              [
                { id: 'recommended', ko: '추천', en: 'For You' },
                { id: 'band', ko: '밴드', en: 'Band' },
                { id: 'kpop', ko: '케이팝', en: 'K-Pop' },
                { id: 'rock', ko: '락', en: 'Rock' },
                { id: 'hiphop', ko: '힙합', en: 'Hip-Hop' },
                { id: 'edm', ko: '이디엠', en: 'EDM' },
                { id: 'pop', ko: '팝', en: 'Pop' },
                { id: 'jpop', ko: '제이팝', en: 'J-Pop' },
                { id: 'all', ko: '전체', en: 'All' },
              ] as { id: FilterTab; ko: string; en: string }[]
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setActiveTab(tab.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#C4FF00] text-black shadow-sm'
                      : 'bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30'
                  }`}
                >
                  {lang === 'ko' ? tab.ko : tab.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Circular Artist Grid with In-Place Dynamic Expansion */}
        <motion.div layout className="grid grid-cols-3 gap-x-4 gap-y-6 pt-1">
          <AnimatePresence mode="popLayout">
            {displayedArtistNodes.map((node) => {
              const isSelected = selectedSet.has(node.name);
              const spawnedParent = spawnedByMap[node.name];
              const displayName = lang === 'ko' ? node.nameKo : node.nameEn;

              return (
                <motion.button
                  key={node.name}
                  type="button"
                  layout
                  initial={
                    spawnedParent
                      ? { opacity: 0, scale: 0.25, y: 10 }
                      : { opacity: 0, scale: 0.85 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 26,
                  }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleBubbleTap(node.name)}
                  className="flex flex-col items-center text-center cursor-pointer group focus:outline-none"
                >
                  {/* Circular Artist Avatar */}
                  <div className="relative w-24 h-24">
                    <div
                      className={`relative w-full h-full rounded-full overflow-hidden transition-all duration-200 bg-zinc-900 ${
                        isSelected
                          ? 'ring-[3px] ring-[#C4FF00] shadow-lg shadow-[#C4FF00]/25'
                          : spawnedParent
                          ? 'ring-2 ring-zinc-300 dark:ring-zinc-600 shadow-md'
                          : 'shadow-md border border-black/5 dark:border-white/10'
                      }`}
                    >
                      {node.coverUrl ? (
                        <Image
                          src={node.coverUrl}
                          alt={displayName}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          <Music className="w-7 h-7" />
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute inset-0 bg-black/30 transition-opacity" />
                      )}
                    </div>

                    {/* Apple Music Checkmark Badge */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute top-0.5 right-0.5 w-7 h-7 rounded-full bg-[#C4FF00] text-black flex items-center justify-center shadow-md border-2 border-white dark:border-black"
                        >
                          <Check className="w-4 h-4 stroke-[3.5]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Artist Name cleanly below circle */}
                  <span
                    className={`mt-2 text-xs font-black leading-tight line-clamp-1 w-full transition-colors ${
                      isSelected
                        ? 'text-zinc-900 dark:text-[#C4FF00]'
                        : 'text-zinc-800 dark:text-zinc-100'
                    }`}
                  >
                    {displayName}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Floating Selected Artists Confirmation Tray
          Positioned at bottom-[140px] so it NEVER collides with MiniPlayerDock (bottom-[72px]) or BottomTabBar (bottom-3) */}
      {preferredArtists.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-[140px] inset-x-0 mx-auto max-w-[398px] w-[92%] z-30 px-4 py-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 shadow-2xl flex items-center justify-between"
        >
          {/* Left: Stacked Avatars & Count */}
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="flex -space-x-2 overflow-hidden shrink-0">
              {preferredArtists.slice(-4).map((artistName) => {
                const node = catalog.get(artistName);
                return (
                  <div
                    key={artistName}
                    className="relative inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-black overflow-hidden bg-zinc-800"
                  >
                    {node?.coverUrl && (
                      <Image
                        src={node.coverUrl}
                        alt={artistName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-xs font-black text-zinc-900 dark:text-white truncate">
              {lang === 'ko'
                ? `${preferredArtists.length}명 선택됨 (+${relatedSet.size}팀)`
                : `${preferredArtists.length} selected (+${relatedSet.size})`}
            </span>
          </div>

          {/* Right: Reset & Confirm Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                playPopSound(false);
                onClearArtists();
              }}
              aria-label={lang === 'ko' ? '초기화' : 'Clear'}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <motion.button
              type="button"
              disabled={isSaving}
              onClick={handleConfirm}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-full bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-xs shadow-md shadow-[#C4FF00]/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{lang === 'ko' ? '완료' : 'Done'}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
