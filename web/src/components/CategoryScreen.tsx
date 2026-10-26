'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Check, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GenreTag } from '@/types/song';
import { ThemeToggle } from './ThemeToggle';
import { playPopSound, playSuccessFanfare, playDialTick } from '@/lib/soundEffects';

interface CategoryScreenProps {
  selectedCategories: GenreTag[];
  onToggleCategory: (cat: GenreTag) => void;
  onNext: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  showToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
}

interface CategoryItem {
  id: GenreTag;
  name: string;
  sub: string;
  icon: string;
  accentColor: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'hiphop', name: '힙합', sub: 'HIP-HOP', icon: '🎤', accentColor: '#C4FF00' },
  { id: 'rock', name: '락', sub: 'ROCK', icon: '🎸', accentColor: '#FF4B4B' },
  { id: 'kpop', name: '케이팝', sub: 'K-POP', icon: '✨', accentColor: '#3B82F6' },
  { id: 'band', name: '밴드', sub: 'BAND', icon: '🥁', accentColor: '#A855F7' },
];

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  selectedCategories,
  onToggleCategory,
  onNext,
  onBack,
  isDark,
  onToggleTheme,
  showToast,
}) => {
  const [shakingId, setShakingId] = useState<GenreTag | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  const handleCardClick = (catId: GenreTag) => {
    const isSelected = selectedCategories.includes(catId);
    if (!isSelected && selectedCategories.length >= 3) {
      showToast('최대 3개까지 선택할 수 있어요', 'warning');
      playDialTick(220);
      setShakingId(catId);
      setTimeout(() => setShakingId(null), 450);
      return;
    }

    // Play bubble pop sound (true = chirps up on select, false = chirps down on deselect)
    playPopSound(!isSelected);
    onToggleCategory(catId);
  };

  const count = selectedCategories.length;

  // Calculate tracks per genre: 30 / count
  const songsPerGenre = count > 0 ? Math.floor(30 / count) : 0;

  const handleCreatePlaylist = () => {
    if (count === 0) {
      showToast('장르를 1개 이상 선택해 주세요', 'warning');
      return;
    }

    setIsGenerating(true);

    // 1. Play Bright Success Fanfare Chord Chime
    playSuccessFanfare();

    // 2. Fire Canvas Confetti Celebration Explosion
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.8 },
        colors: ['#C4FF00', '#0044FF', '#FF4B4B', '#FFFFFF'],
        ticks: 200,
        gravity: 1.1,
        scalar: 1.05,
      });
    } catch {
      // Fallback gracefully if canvas context is restricted
    }

    // 3. Smooth transition to playlist screen
    setTimeout(() => {
      onNext();
      setIsGenerating(false);
    }, 220);
  };

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6 select-none relative overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2 z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="이전"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col justify-center py-4 z-10">
        <div className="text-center mb-6">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            STEP 2 · GENRE SELECT
          </span>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
            원하는 장르를 선택하세요
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <span>최대 3개 선택 가능</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span
              className={`font-black ${
                count > 0 ? 'text-[#C4FF00]' : 'text-zinc-400'
              }`}
            >
              {count} / 3 선택됨
            </span>
          </div>
        </div>

        {/* Animated Equal-Ratio 30-Track Distribution Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-[11px] font-extrabold mb-2.5">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-[#C4FF00]" />
              <span>30곡 균등 비율 배분</span>
            </div>
            <span className="text-zinc-400 dark:text-zinc-500">
              {count === 0 ? '선택 대기 중' : `${count}개 장르 균등 수록`}
            </span>
          </div>

          {/* Equal split progress bar */}
          <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex p-0.5 gap-1">
            <AnimatePresence>
              {count === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[9px] font-bold text-zinc-400">장르 카드를 선택해 주세요</span>
                </div>
              ) : (
                selectedCategories.map((catId) => {
                  const cat = CATEGORIES.find((c) => c.id === catId);
                  if (!cat) return null;
                  return (
                    <motion.div
                      key={catId}
                      layout
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${100 / count}%`, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      className="h-full rounded-full flex items-center justify-center text-[9px] font-black text-black shadow-sm overflow-hidden whitespace-nowrap"
                      style={{ backgroundColor: '#C4FF00' }}
                    >
                      <span>{cat.name} {songsPerGenre}곡</span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tactile Spring Category Cards */}
        <div className="grid grid-cols-2 gap-3.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            const isShaking = shakingId === cat.id;

            return (
              <motion.button
                key={cat.id}
                type="button"
                layout
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.93 }}
                animate={
                  isShaking
                    ? { x: [-7, 7, -6, 6, -3, 3, 0], borderColor: '#FF4B4B' }
                    : {}
                }
                transition={{ duration: 0.3 }}
                onClick={() => handleCardClick(cat.id)}
                className={`relative p-5 rounded-3xl text-left border-2 transition-colors duration-150 flex flex-col justify-between h-34 cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#C4FF00] bg-[#C4FF00] text-black shadow-lg shadow-[#C4FF00]/25'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Header with Subtitle and Checkbox */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{cat.icon}</span>
                    <span
                      className={`text-[11px] font-extrabold tracking-wider ${
                        isSelected ? 'text-black/75' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {cat.sub}
                    </span>
                  </div>

                  <motion.div
                    animate={{
                      scale: isSelected ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-black text-[#C4FF00]'
                        : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.div>
                </div>

                {/* Genre Name & Allocated Songs Badge */}
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-xl font-black tracking-tight">{cat.name}</div>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[11px] font-black px-2 py-0.5 rounded-full bg-black/15 text-black"
                    >
                      {songsPerGenre}곡
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      {/* Bottom CTA with Spring Physics and Confetti */}
      <footer className="pb-4 pt-2 z-10">
        <motion.button
          type="button"
          disabled={count === 0 || isGenerating}
          onClick={handleCreatePlaylist}
          whileHover={count > 0 ? { scale: 1.02 } : {}}
          whileTap={count > 0 ? { scale: 0.95 } : {}}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 select-none ${
            count > 0
              ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black shadow-lg shadow-[#C4FF00]/25 cursor-pointer'
              : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5 text-black" />
          <span>30곡 플레이리스트 만들기</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </footer>
    </div>
  );
};
