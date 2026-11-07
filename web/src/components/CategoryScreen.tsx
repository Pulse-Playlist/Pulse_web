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
  accentColor: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'hiphop',
    name: { ko: '힙합', en: 'HIP-HOP' },
    sub: 'HIP-HOP',
    accentColor: '#C4FF00',
  },
  {
    id: 'rock',
    name: { ko: '락', en: 'ROCK' },
    sub: 'ROCK',
    accentColor: '#FF4B4B',
  },
  {
    id: 'kpop',
    name: { ko: '케이팝', en: 'K-POP' },
    sub: 'K-POP',
    accentColor: '#3B82F6',
  },
  {
    id: 'band',
    name: { ko: '밴드', en: 'BAND' },
    sub: 'BAND',
    accentColor: '#A855F7',
  },
  {
    id: 'edm',
    name: { ko: '이디엠', en: 'EDM' },
    sub: 'EDM',
    accentColor: '#00E5FF',
  },
  {
    id: 'pop',
    name: { ko: '팝', en: 'POP' },
    sub: 'POP',
    accentColor: '#F59E0B',
  },
  {
    id: 'jpop',
    name: { ko: '제이팝', en: 'J-POP' },
    sub: 'J-POP',
    accentColor: '#EC4899',
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
    <div className="flex flex-col gap-5 px-5 pt-3 pb-24 select-none relative overflow-x-hidden">
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
                ? 'bg-[#C4FF00] text-black'
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
      <main className="flex flex-col z-10">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategories.includes(cat.id);
            const isShaking = shakingId === cat.id;
            const isLastOdd = idx === CATEGORIES.length - 1 && CATEGORIES.length % 2 === 1;

            return (
              <motion.div
                key={cat.id}
                animate={
                  isShaking
                    ? { x: [-6, 6, -4, 4, -2, 2, 0] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3 }}
                onClick={() => handleCardClick(cat.id)}
                className={`relative h-20 p-4 rounded-[20px] flex items-center justify-between cursor-pointer select-none transition-all duration-150 shadow-sm border active:scale-[0.98] ${
                  isLastOdd ? 'col-span-2' : ''
                } ${
                  isSelected
                    ? 'border-[#C4FF00] dark:border-[#C4FF00] ring-1 ring-[#C4FF00]/40 bg-zinc-100 dark:bg-zinc-900'
                    : 'border-black/[0.08] dark:border-white/[0.08] bg-zinc-100/80 dark:bg-zinc-900/80 hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                {/* Left: Accent bar or Dot + Text info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.accentColor }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-white leading-tight font-display truncate">
                      {cat.name[lang]}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mt-0.5">
                      {cat.sub}
                    </span>
                  </div>
                </div>

                {/* Right: Clean Checkmark Circle */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 shrink-0 ${
                    isSelected
                      ? 'bg-[#C4FF00] text-black shadow-sm'
                      : 'border-2 border-zinc-300 dark:border-zinc-700 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3.5]" />}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Track Distribution Badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-[18px] bg-zinc-100/90 dark:bg-zinc-900/90 border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between shadow-sm"
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
      <footer className="mt-2 z-10">
        <button
          type="button"
          disabled={count === 0 || isGenerating}
          onClick={handleCreatePlaylist}
          className={`w-full py-4 px-6 rounded-full font-black text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
            count > 0
              ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black active:scale-[0.98] cursor-pointer'
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
        </button>
      </footer>
    </div>
  );
};
