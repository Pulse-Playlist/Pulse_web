'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  X,
  Music,
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
  // In-place ordered list of artist names in the grid (Spotify-style stable order + in-place insertion)
  const [gridArtistNames, setGridArtistNames] = useState<string[]>([]);
  // Track which artists were dynamically inserted into the grid by clicking a parent artist
  const [spawnedByMap, setSpawnedByMap] = useState<Record<string, string>>({});
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

  // Build initial base list whenever activeTab or catalog changes
  useEffect(() => {
    if (catalog.size === 0) return;

    const allNodes = Array.from(catalog.values());
    const targetGenres: GenreTag[] =
      activeTab === 'recommended'
        ? selectedCategories.length > 0
          ? selectedCategories
          : ['band', 'kpop', 'rock', 'hiphop']
        : activeTab === 'all'
        ? ['band', 'kpop', 'rock', 'hiphop']
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
  }, [catalog, activeTab, selectedCategories]);

  // Spotify-style in-place bubble expansion:
  // Tapping an artist keeps it in its exact spot and splices 3 related artists directly after it in the grid!
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
          // Insert right after the clicked artist so new bubbles appear immediately adjacent in the 3-col grid
          nextGrid.splice(idx + 1, 0, ...toInsert);
          return nextGrid;
        });
      }
    }

    onToggleArtist(artistName);
  };

  // Resolve the final list of ArtistNodes to render
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
            PULSE
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
        {/* Clean Spotify-Style Header */}
        <div className="mb-3.5">
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            {lang === 'ko' ? '좋아하는 아티스트를 선택하세요' : 'Choose artists you like'}
          </h2>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            {lang === 'ko'
              ? '아티스트를 고르면 비슷한 무드의 아티스트가 바로 옆에 추가됩니다'
              : 'Tap an artist to reveal similar artists right next to it'}
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
              lang === 'ko' ? '아티스트 검색' : 'Search artists'
            }
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#C4FF00]"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {(
            [
              { id: 'recommended', ko: '추천', en: 'For You' },
              { id: 'band', ko: '밴드', en: 'Band' },
              { id: 'kpop', ko: '케이팝', en: 'K-Pop' },
              { id: 'rock', ko: '락', en: 'Rock' },
              { id: 'hiphop', ko: '힙합', en: 'Hip-Hop' },
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
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                {lang === 'ko' ? tab.ko : tab.en}
              </button>
            );
          })}
        </div>

        {/* Authentic Spotify 3-Column Circular Artist Grid (In-Place Expansion) */}
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
                          ? 'ring-[3px] ring-[#C4FF00] shadow-lg shadow-[#C4FF00]/20'
                          : spawnedParent
                          ? 'ring-2 ring-zinc-300 dark:ring-zinc-600 shadow-md'
                          : 'shadow-md'
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

                      {/* Darkened overlay when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/30 transition-opacity" />
                      )}
                    </div>

                    {/* Spotify-style top-right Checkmark Badge when selected */}
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
                    className={`mt-2 text-xs font-extrabold leading-tight line-clamp-1 w-full transition-colors ${
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

      {/* Fixed Bottom Dock: Selected Artists Tray + Generate Playlist CTA */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full z-30 px-5 pt-3 pb-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {preferredArtists.length > 0 && (
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* Stacked Avatars of Selected Artists (Spotify bottom bar style) */}
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
                  ? `${preferredArtists.length}명 선택됨 (연관 +${relatedSet.size}팀 반영)`
                  : `${preferredArtists.length} selected (+${relatedSet.size} related)`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playPopSound(false);
                onClearArtists();
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-rose-500 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'ko' ? '초기화' : 'Clear'}</span>
            </button>
          </div>
        )}

        {/* Primary Action Button */}
        <motion.button
          type="button"
          disabled={isGenerating}
          onClick={handleConfirm}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-3.5 px-5 rounded-full bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-sm shadow-lg shadow-[#C4FF00]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                    ? '완료 · 30곡 플레이리스트 만들기'
                    : 'Done · Create 30-Track Mix'
                  : lang === 'ko'
                  ? '건너뛰고 30곡 만들기'
                  : 'Skip & Create 30 Tracks'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </footer>
    </div>
  );
};
