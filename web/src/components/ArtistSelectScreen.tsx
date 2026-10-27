'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  X,
  Music,
  Zap,
  RotateCcw,
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
import { ThemeToggle } from './ThemeToggle';
import { playPopSound, playSuccessFanfare } from '@/lib/soundEffects';

interface ArtistSelectScreenProps {
  allSongs: Song[];
  targetBpm: number;
  selectedCategories: GenreTag[];
  preferredArtists: string[];
  onToggleArtist: (artistName: string) => void;
  onClearArtists: () => void;
  onNext: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  lang: AppLanguage;
  onToggleLang: () => void;
}

type FilterTab = 'recommended' | GenreTag | 'all';

const GENRE_BADGE: Record<
  GenreTag,
  { ko: string; en: string; color: string; ring: string }
> = {
  band: {
    ko: '밴드',
    en: 'BAND',
    color: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
    ring: 'ring-purple-500/40',
  },
  kpop: {
    ko: '케이팝',
    en: 'K-POP',
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
    ring: 'ring-blue-500/40',
  },
  rock: {
    ko: '락',
    en: 'ROCK',
    color: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    ring: 'ring-rose-500/40',
  },
  hiphop: {
    ko: '힙합',
    en: 'HIP-HOP',
    color: 'bg-lime-500/15 text-lime-700 dark:text-[#C4FF00] border-lime-500/30',
    ring: 'ring-lime-500/40',
  },
};

export const ArtistSelectScreen: React.FC<ArtistSelectScreenProps> = ({
  allSongs,
  targetBpm,
  selectedCategories,
  preferredArtists,
  onToggleArtist,
  onClearArtists,
  onNext,
  onBack,
  isDark,
  onToggleTheme,
  lang,
  onToggleLang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('recommended');
  // Track which artist was most recently selected to highlight its spawned cluster
  const [lastSelectedArtist, setLastSelectedArtist] = useState<string | null>(
    preferredArtists.length > 0 ? preferredArtists[preferredArtists.length - 1] : null
  );
  // Keep ordered list of dynamically spawned artists + their parent artist name
  const [spawnedFromMap, setSpawnedFromMap] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  // Build artist catalog dynamically from all 14,707 songs
  const catalog = useMemo(
    () => buildArtistCatalog(allSongs, targetBpm),
    [allSongs, targetBpm]
  );

  const { selectedSet, relatedSet } = useMemo(
    () => getExpandedArtistSets(preferredArtists),
    [preferredArtists]
  );

  // Handle tapping an artist bubble
  const handleBubbleTap = (artistName: string) => {
    const isAlreadySelected = selectedSet.has(artistName);
    playPopSound(!isAlreadySelected);

    if (!isAlreadySelected) {
      setLastSelectedArtist(artistName);
      const node = catalog.get(artistName);
      if (node && node.related.length > 0) {
        setSpawnedFromMap((prev) => {
          const next = { ...prev };
          for (const rel of node.related) {
            if (!next[rel] && !selectedSet.has(rel)) {
              next[rel] = artistName;
            }
          }
          return next;
        });
      }
    } else if (lastSelectedArtist === artistName) {
      const remaining = preferredArtists.filter((a) => a !== artistName);
      setLastSelectedArtist(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }

    onToggleArtist(artistName);
  };

  // Build the ordered list of ArtistNodes to display as bubbles:
  // When an artist is selected, its related artists are injected right next to it!
  const displayedArtistNodes = useMemo(() => {
    const allNodes = Array.from(catalog.values());
    const q = searchQuery.trim().toLowerCase();

    // 1. If searching, filter across all 800+ artists in the catalog
    if (q.length > 0) {
      return allNodes
        .filter(
          (n) =>
            n.name.toLowerCase().includes(q) ||
            n.nameKo.toLowerCase().includes(q) ||
            n.nameEn.toLowerCase().includes(q)
        )
        .sort((a, b) => {
          const aSel = selectedSet.has(a.name) ? 1 : 0;
          const bSel = selectedSet.has(b.name) ? 1 : 0;
          if (aSel !== bSel) return bSel - aSel;
          return b.trackCount - a.trackCount;
        })
        .slice(0, 60);
    }

    // 2. Determine base seed list according to activeTab
    const targetGenres: GenreTag[] =
      activeTab === 'recommended'
        ? selectedCategories.length > 0
          ? selectedCategories
          : ['band', 'kpop', 'rock', 'hiphop']
        : activeTab === 'all'
        ? ['band', 'kpop', 'rock', 'hiphop']
        : [activeTab];

    const seedNames: string[] = [];
    const seen = new Set<string>();

    // Always keep already-selected artists in the visible pool if they match genre or in 'recommended'/'all'
    for (const sel of preferredArtists) {
      const node = catalog.get(sel);
      if (node && (activeTab === 'recommended' || activeTab === 'all' || node.genre === activeTab)) {
        if (!seen.has(sel)) {
          seen.add(sel);
          seedNames.push(sel);
        }
      }
    }

    // Add curated seed artists for the active genres
    for (const g of targetGenres) {
      for (const sName of INITIAL_SEED_ARTISTS[g] || []) {
        if (catalog.has(sName) && !seen.has(sName)) {
          seen.add(sName);
          seedNames.push(sName);
        }
      }
    }

    // Also add top artists by track count in those genres
    const topGenreArtists = allNodes
      .filter((n) => targetGenres.includes(n.genre))
      .sort((a, b) => b.bpm130_180Count - a.bpm130_180Count || b.trackCount - a.trackCount);

    for (const node of topGenreArtists) {
      if (seedNames.length >= 42) break;
      if (!seen.has(node.name)) {
        seen.add(node.name);
        seedNames.push(node.name);
      }
    }

    // 3. Now weave related artists right after each selected artist (Spotify bubble expansion!)
    const finalOrdered: ArtistNode[] = [];
    const placed = new Set<string>();

    for (const name of seedNames) {
      const node = catalog.get(name);
      if (!node || placed.has(name)) continue;

      finalOrdered.push(node);
      placed.add(name);

      // If this artist is selected by the user, immediately inject up to 4 of its related artists right beside it!
      if (selectedSet.has(name)) {
        let injected = 0;
        for (const relName of node.related) {
          if (injected >= 4) break;
          const relNode = catalog.get(relName);
          if (
            relNode &&
            !placed.has(relName) &&
            (activeTab === 'recommended' || activeTab === 'all' || relNode.genre === activeTab)
          ) {
            finalOrdered.push(relNode);
            placed.add(relName);
            injected += 1;
          }
        }
      }
    }

    return finalOrdered;
  }, [catalog, searchQuery, activeTab, selectedCategories, preferredArtists, selectedSet]);

  // Related artists specifically for the most recently tapped artist (shown in the Spotlight Expansion Strip)
  const spotlightRelatedNodes = useMemo(() => {
    if (!lastSelectedArtist) return [];
    const parentNode = catalog.get(lastSelectedArtist);
    if (!parentNode) return [];

    const list: ArtistNode[] = [];
    for (const relName of parentNode.related) {
      const n = catalog.get(relName);
      if (n && !selectedSet.has(n.name)) {
        list.push(n);
      }
    }
    return list.slice(0, 8);
  }, [lastSelectedArtist, catalog, selectedSet]);

  const handleConfirm = () => {
    setIsGenerating(true);
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
      onNext();
      setIsGenerating(false);
    }, 200);
  };

  return (
    <div className="flex flex-col min-h-dvh justify-between select-none relative overflow-hidden pb-36">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          aria-label={lang === 'ko' ? '이전' : 'Back'}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
          </div>
          <span className="text-xs font-black tracking-widest text-zinc-900 dark:text-white uppercase font-display">
            PULSE TASTE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => {
              playPopSound();
              onToggleLang();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border transition-colors bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-sm"
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
      <main className="flex-1 px-5 pt-4 z-10">
        {/* Title & Subtitle */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C4FF00]/15 border border-[#C4FF00]/40 text-[10px] font-black text-lime-700 dark:text-[#C4FF00] mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>
              {lang === 'ko'
                ? `STEP 3 · 아티스트 취향 버블 (${targetBpm} BPM 맞춤)`
                : `STEP 3 · ARTIST TASTE BUBBLES (${targetBpm} BPM)`}
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            {lang === 'ko' ? '내가 좋아하는 아티스트를 골라보세요' : 'Pick Artists You Love'}
          </h2>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
            {lang === 'ko'
              ? '버블을 탭하면 연관 무드의 아티스트들이 톡! 튀어나오며 추천됩니다'
              : 'Tap an artist bubble to pop out similar artists in that vibe'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ko'
                ? '아티스트 검색 (예: DAY6, 뉴진스, 실리카겔, 국카스텐...)'
                : 'Search 800+ artists (e.g. DAY6, NewJeans, Oasis...)'
            }
            className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#C4FF00]"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {(
            [
              {
                id: 'recommended',
                ko: '🔥 선택 장르 추천',
                en: '🔥 Selected Genres',
              },
              { id: 'band', ko: '🥁 밴드', en: '🥁 Band' },
              { id: 'kpop', ko: '✨ 케이팝', en: '✨ K-Pop' },
              { id: 'rock', ko: '🎸 락', en: '🎸 Rock' },
              { id: 'hiphop', ko: '🎤 힙합', en: '🎤 Hip-Hop' },
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
                className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#C4FF00] text-black shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                {lang === 'ko' ? tab.ko : tab.en}
              </button>
            );
          })}
        </div>

        {/* Dynamic Related-Artist Expansion Drawer (when an artist was just tapped!) */}
        <AnimatePresence mode="popLayout">
          {lastSelectedArtist && spotlightRelatedNodes.length > 0 && !searchQuery && (
            <motion.div
              key={`cluster-${lastSelectedArtist}`}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="mb-5 p-3.5 rounded-3xl bg-gradient-to-r from-[#C4FF00]/15 via-emerald-500/10 to-cyan-500/15 dark:from-[#C4FF00]/15 dark:via-zinc-900 dark:to-cyan-500/15 border border-[#C4FF00]/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C4FF00] animate-ping" />
                  <span className="text-xs font-black text-zinc-900 dark:text-white">
                    {lang === 'ko'
                      ? `✨ '${lastSelectedArtist}' 좋아하신다면 이 아티스트도 탭!`
                      : `✨ Because you like '${lastSelectedArtist}':`}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-lime-700 dark:text-[#C4FF00]">
                  {lang === 'ko' ? '연관 무드 자동 포함됨' : 'Auto-linked'}
                </span>
              </div>

              {/* Horizontal Connected Bubble Strip */}
              <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
                {spotlightRelatedNodes.map((relNode, idx) => {
                  const displayName = lang === 'ko' ? relNode.nameKo : relNode.nameEn;
                  return (
                    <motion.button
                      key={relNode.name}
                      type="button"
                      initial={{ opacity: 0, scale: 0.4, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 22,
                        delay: idx * 0.04,
                      }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBubbleTap(relNode.name)}
                      className="flex flex-col items-center shrink-0 w-16 group cursor-pointer"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C4FF00]/70 shadow-md group-hover:scale-105 transition-transform bg-zinc-900">
                        <Image
                          src={relNode.coverUrl}
                          alt={displayName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-black text-[#C4FF00] text-center py-0.5">
                          + {lang === 'ko' ? '선택' : 'ADD'}
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-zinc-900 dark:text-white truncate w-full text-center mt-1">
                        {displayName}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spotify-Style Circular Artist Bubble Grid */}
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 pt-1">
          <AnimatePresence mode="popLayout">
            {displayedArtistNodes.map((node, idx) => {
              const isSelected = selectedSet.has(node.name);
              const isRelated = !isSelected && relatedSet.has(node.name);
              const spawnedParent = spawnedFromMap[node.name];
              const displayName = lang === 'ko' ? node.nameKo : node.nameEn;
              const badge = GENRE_BADGE[node.genre];

              // Staggered organic Spotify bubble sizing
              const isFeaturedSize = idx % 4 === 0 || isSelected;

              return (
                <motion.div
                  key={node.name}
                  layout
                  initial={{ opacity: 0, scale: 0.55 }}
                  animate={{
                    opacity: 1,
                    scale: isSelected ? 1.05 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 25,
                  }}
                  onClick={() => handleBubbleTap(node.name)}
                  className="flex flex-col items-center text-center cursor-pointer group"
                >
                  {/* Circular Artist Bubble */}
                  <div
                    className={`relative rounded-full overflow-hidden transition-all duration-200 ${
                      isFeaturedSize ? 'w-24 h-24' : 'w-[86px] h-[86px]'
                    } ${
                      isSelected
                        ? 'ring-4 ring-[#C4FF00] shadow-xl shadow-[#C4FF00]/30'
                        : isRelated
                        ? 'ring-2 ring-cyan-400 dark:ring-cyan-400/80 shadow-lg shadow-cyan-500/20'
                        : 'border-2 border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 shadow-md'
                    } bg-zinc-900`}
                  >
                    {node.coverUrl ? (
                      <Image
                        src={node.coverUrl}
                        alt={displayName}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <Music className="w-7 h-7" />
                      </div>
                    )}

                    {/* Subtle Gradient Overlay */}
                    <div
                      className={`absolute inset-0 transition-opacity ${
                        isSelected
                          ? 'bg-black/35'
                          : 'bg-gradient-to-t from-black/65 via-black/10 to-transparent group-hover:from-black/45'
                      }`}
                    />

                    {/* Selected Neon Check Overlay */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#C4FF00]/25 backdrop-blur-[1px]"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#C4FF00] text-black flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 stroke-[3.5]" />
                        </div>
                      </motion.div>
                    )}

                    {/* Related Artist Spawn Badge inside Bubble */}
                    {!isSelected && isRelated && (
                      <div className="absolute top-1.5 inset-x-0 flex justify-center">
                        <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-black text-[8px] font-black shadow-sm">
                          {spawnedParent
                            ? lang === 'ko'
                              ? `🔗 ${spawnedParent}`
                              : `🔗 Related`
                            : lang === 'ko'
                            ? '✨ 연관 추천'
                            : '✨ Similar'}
                        </span>
                      </div>
                    )}

                    {/* Target BPM Matching Track Count Pill at Bottom of Bubble */}
                    {node.bpm130_180Count > 0 && (
                      <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
                        <span className="px-1.5 py-0.5 rounded-full bg-black/80 text-[#C4FF00] text-[9px] font-black flex items-center gap-0.5 border border-[#C4FF00]/40">
                          <Zap className="w-2.5 h-2.5" />
                          <span>
                            {node.bpm130_180Count}
                            {lang === 'ko' ? '곡' : ''}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Artist Name & Genre Tag below Bubble */}
                  <div className="mt-2 max-w-[100px]">
                    <p
                      className={`text-xs font-black truncate transition-colors ${
                        isSelected
                          ? 'text-[#00A344] dark:text-[#C4FF00]'
                          : isRelated
                          ? 'text-cyan-600 dark:text-cyan-300'
                          : 'text-zinc-900 dark:text-white'
                      }`}
                    >
                      {displayName}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.color}`}
                      >
                        {lang === 'ko' ? badge.ko : badge.en}
                      </span>
                      <span className="text-[9px] font-semibold text-zinc-400">
                        {node.trackCount}곡
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Bottom Dock: Selected Artists Tray + Generate Playlist CTA */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full z-30 px-5 pt-3 pb-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Selected Artists Chips & Related Count */}
        {preferredArtists.length > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <div className="flex items-center gap-1.5 font-black text-zinc-800 dark:text-zinc-200">
                <span className="text-[#00A344] dark:text-[#C4FF00]">
                  {lang === 'ko'
                    ? `최애 ${preferredArtists.length}팀 선택됨`
                    : `${preferredArtists.length} Picked`}
                </span>
                <span className="text-zinc-400">·</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                  {lang === 'ko'
                    ? `연관 아티스트 +${relatedSet.size}팀 자동 확장`
                    : `+${relatedSet.size} Related Expanded`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound(false);
                  setLastSelectedArtist(null);
                  setSpawnedFromMap({});
                  onClearArtists();
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-rose-500 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'ko' ? '초기화' : 'Clear'}</span>
              </button>
            </div>

            {/* Selected Artist Mini Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {preferredArtists.map((artistName) => {
                const node = catalog.get(artistName);
                const label = node
                  ? lang === 'ko'
                    ? node.nameKo
                    : node.nameEn
                  : artistName;
                return (
                  <button
                    key={artistName}
                    type="button"
                    onClick={() => handleBubbleTap(artistName)}
                    className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-zinc-900 text-[#C4FF00] dark:bg-zinc-800 dark:text-[#C4FF00] border border-[#C4FF00]/50 text-[10px] font-black shrink-0 cursor-pointer"
                  >
                    {node?.coverUrl && (
                      <div className="relative w-4 h-4 rounded-full overflow-hidden">
                        <Image
                          src={node.coverUrl}
                          alt={label}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span>{label}</span>
                    <X className="w-3 h-3 text-zinc-400 hover:text-white" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <motion.button
          type="button"
          disabled={isGenerating}
          onClick={handleConfirm}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-sm shadow-lg shadow-[#C4FF00]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              <span>
                {lang === 'ko'
                  ? '취향 맞춤 30곡 플레이리스트 생성 중...'
                  : 'Building Custom 30-Track Mix...'}
              </span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {preferredArtists.length > 0
                  ? lang === 'ko'
                    ? `취향 아티스트 반영해 30곡 만들기`
                    : `Create 30-Track Mix with ${preferredArtists.length} Artists`
                  : lang === 'ko'
                  ? '건너뛰고 장르 전체에서 30곡 만들기'
                  : 'Skip & Create 30-Track Genre Mix'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </footer>
    </div>
  );
};
