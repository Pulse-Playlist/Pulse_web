'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Check, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GenreTag, AppLanguage } from '@/types/song';
import { playPopSound, playSuccessFanfare, playDialTick } from '@/lib/soundEffects';

interface CategoryScreenProps {
  selectedCategories: GenreTag[];
  onToggleCategory: (cat: GenreTag) => void;
  onNext: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  showToast: (text: string, type?: 'info' | 'warning' | 'error') => void;
  lang?: AppLanguage;
  onToggleLang?: () => void;
}

interface CategoryItem {
  id: GenreTag;
  name: Record<AppLanguage, string>;
  sub: string;
  icon: string;
  accentColor: string;
  gradientDark: string;
  gradientLight: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'hiphop',
    name: { ko: '힙합', en: 'HIP-HOP' },
    sub: 'HIP-HOP',
    icon: '🎤',
    accentColor: '#C4FF00',
    gradientDark: 'from-lime-950/40 via-zinc-900/80 to-zinc-900/95',
    gradientLight: 'from-lime-100/60 via-zinc-100/90 to-white',
  },
  {
    id: 'rock',
    name: { ko: '락', en: 'ROCK' },
    sub: 'ROCK',
    icon: '🎸',
    accentColor: '#FF4B4B',
    gradientDark: 'from-red-950/40 via-zinc-900/80 to-zinc-900/95',
    gradientLight: 'from-red-100/60 via-zinc-100/90 to-white',
  },
  {
    id: 'kpop',
    name: { ko: '케이팝', en: 'K-POP' },
    sub: 'K-POP',
    icon: '✨',
    accentColor: '#3B82F6',
    gradientDark: 'from-blue-950/40 via-zinc-900/80 to-zinc-900/95',
    gradientLight: 'from-blue-100/60 via-zinc-100/90 to-white',
  },
  {
    id: 'band',
    name: { ko: '밴드', en: 'BAND' },
    sub: 'BAND',
    icon: '🥁',
    accentColor: '#A855F7',
    gradientDark: 'from-purple-950/40 via-zinc-900/80 to-zinc-900/95',
    gradientLight: 'from-purple-100/60 via-zinc-100/90 to-white',
  },
  {
    id: 'edm',
    name: { ko: '이디엠', en: 'EDM' },
    sub: 'EDM',
    icon: '🎧',
    accentColor: '#00E5FF',
    gradientDark: 'from-cyan-950/40 via-zinc-900/80 to-zinc-900/95',
    gradientLight: 'from-cyan-100/60 via-zinc-100/90 to-white',
  },
  {
    id: 'pop',
    name: { ko: '팝', en: 'POP' },
    sub: 'POP',
    icon: '🌎',
    accentColor: '#F59E0B',
    gradientDark: 'from-amber-950/40 via-zinc-900/80 to-zinc-900/95',
    gradientLight: 'from-amber-100/60 via-zinc-100/90 to-white',
  },
  {
    id: 'jpop',
    name: { ko: '제이팝', en: 'J-POP' },
    sub: 'J-POP',
    icon: '⚡',
    accentColor: '#EC4899',
    gradientDark: 'from-pink-950/40 via-zinc-900/80 to-zinc-900/95',
    gradientLight: 'from-pink-100/60 via-zinc-100/90 to-white',
  },
];

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  selectedCategories,
  onToggleCategory,
  onNext,
  onBack,
  isDark,
  onToggleTheme,
  showToast,
  lang = 'ko',
  onToggleLang,
}) => {
  const [shakingId, setShakingId] = useState<GenreTag | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  const handleCardClick = (catId: GenreTag) => {
    const isSelected = selectedCategories.includes(catId);
    if (!isSelected && selectedCategories.length >= 3) {
      showToast(
        lang === 'ko' ? '최대 3개까지 선택할 수 있어요' : 'You can select up to 3 genres',
        'warning'
      );
      playDialTick(220);
      setShakingId(catId);
      setTimeout(() => setShakingId(null), 450);
      return;
    }

    // Play bubble pop sound
    playPopSound(!isSelected);
    onToggleCategory(catId);
  };

  const count = selectedCategories.length;
  const songsPerGenre = count > 0 ? Math.floor(30 / count) : 0;

  const handleCreatePlaylist = () => {
    if (count === 0) {
      showToast(
        lang === 'ko' ? '장르를 1개 이상 선택해 주세요' : 'Please select at least 1 genre',
        'warning'
      );
      return;
    }

    setIsGenerating(true);
    playSuccessFanfare();

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
      // ignore
    }

    setTimeout(() => {
      onNext();
      setIsGenerating(false);
    }, 220);
  };

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6 pb-36 select-none relative overflow-x-hidden">
      {/* Top Ambient Glow */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-72 opacity-20 dark:opacity-25 blur-3xl transition-colors duration-700"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, #C4FF00 0%, transparent 70%)',
        }}
      />

      {/* Top Header */}
      <header className="z-10 pt-1">
        {/* Row 1: Back Button, Brand Pill, Spacer */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={lang === 'ko' ? '이전' : 'Back'}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center shadow-sm text-zinc-900 dark:text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm">
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
            </div>
            <span className="font-black tracking-widest text-xs uppercase font-display text-zinc-900 dark:text-white">
              PULSE
            </span>
          </div>

          <div className="w-10 h-10" />
        </div>

        {/* Row 2: Apple Music Large Title `Genres` + Count Pill Badge */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
              {lang === 'ko' ? 'STEP 2 · 장르 탐색' : 'STEP 2 · BROWSE GENRES'}
            </span>
            <h1 className="text-[32px] font-black tracking-tight text-zinc-900 dark:text-white leading-none font-display">
              {lang === 'ko' ? '장르 선택' : 'Genres'}
            </h1>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm tracking-wide transition-all duration-300 ${
              count > 0
                ? 'bg-[#C4FF00] text-black shadow-[#C4FF00]/20'
                : 'bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {lang === 'ko' ? `${count} / 3 선택됨` : `${count} / 3 selected`}
          </div>
        </div>

        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2">
          {lang === 'ko'
            ? '달릴 때 에너지를 북돋아 줄 좋아하는 장르를 최대 3개 선택하세요.'
            : 'Select up to 3 favorite genres that match your stride rhythm.'}
        </p>
      </header>

      {/* Main Apple Music Browse Category Tiles */}
      <main className="flex-1 flex flex-col justify-center py-4 z-10">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategories.includes(cat.id);
            const isShaking = shakingId === cat.id;
            const isLastOdd = idx === CATEGORIES.length - 1 && CATEGORIES.length % 2 === 1;

            return (
              <motion.div
                key={cat.id}
                animate={
                  isShaking
                    ? { x: [-8, 8, -6, 6, -3, 3, 0] }
                    : { scale: isSelected ? 1.02 : 1 }
                }
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(cat.id)}
                className={`relative p-4 rounded-[24px] h-28 flex flex-col justify-between cursor-pointer select-none transition-all duration-200 overflow-hidden shadow-sm backdrop-blur-xl border ${
                  isLastOdd ? 'col-span-2' : ''
                } ${
                  isSelected
                    ? 'border-[#C4FF00] shadow-lg shadow-[#C4FF00]/15 ring-2 ring-[#C4FF00]/40'
                    : 'border-black/5 dark:border-white/10 hover:border-black/15 dark:hover:border-white/20'
                } bg-gradient-to-br ${
                  isDark ? cat.gradientDark : cat.gradientLight
                }`}
              >
                {/* Background Ambient Accent Glow */}
                {isSelected && (
                  <div
                    className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full blur-2xl opacity-35 pointer-events-none"
                    style={{ backgroundColor: cat.accentColor }}
                  />
                )}

                {/* Top Row: Icon + Apple HIG Checkmark Badge */}
                <div className="flex items-center justify-between z-10">
                  <span className="text-3xl drop-shadow-sm">{cat.icon}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#C4FF00] text-black shadow-md scale-110'
                        : 'border-2 border-zinc-300 dark:border-zinc-700 bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                  </div>
                </div>

                {/* Bottom Row: Large Genre Name + Eyebrow Sub */}
                <div className="z-10">
                  <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white leading-tight font-display">
                    {cat.name[lang]}
                  </h3>
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {cat.sub}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Track Distribution Badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C4FF00]" />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {lang === 'ko' ? '장르별 수록 비율' : 'Tracks per Genre'}
                </span>
              </div>
              <span className="text-xs font-black text-zinc-900 dark:text-white bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full border border-black/5 dark:border-white/10">
                {lang === 'ko'
                  ? `장르당 약 ${songsPerGenre}곡씩 총 30곡`
                  : `~${songsPerGenre} tracks each (30 total)`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom CTA Capsule Button */}
      <footer className="pt-2 z-10">
        <motion.button
          type="button"
          disabled={count === 0 || isGenerating}
          onClick={handleCreatePlaylist}
          whileHover={count > 0 ? { scale: 1.02 } : {}}
          whileTap={count > 0 ? { scale: 0.96 } : {}}
          className={`w-full py-4 px-6 rounded-full font-black text-base transition-all flex items-center justify-center gap-2 ${
            count > 0
              ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black shadow-lg shadow-[#C4FF00]/25 cursor-pointer'
              : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              <span>{lang === 'ko' ? '30곡 맞춤 믹스 생성 중...' : 'Generating 30 Tracks...'}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{lang === 'ko' ? '30곡 플레이리스트 만들기' : 'Create 30-Track Playlist'}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </motion.button>
      </footer>
    </div>
  );
};
