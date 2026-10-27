'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Check, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GenreTag, AppLanguage } from '@/types/song';
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
  lang?: AppLanguage;
  onToggleLang?: () => void;
}

interface CategoryItem {
  id: GenreTag;
  name: Record<AppLanguage, string>;
  sub: string;
  icon: string;
  accentColor: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'hiphop', name: { ko: '힙합', en: 'HIP-HOP' }, sub: 'HIP-HOP', icon: '🎤', accentColor: '#C4FF00' },
  { id: 'rock', name: { ko: '락', en: 'ROCK' }, sub: 'ROCK', icon: '🎸', accentColor: '#FF4B4B' },
  { id: 'kpop', name: { ko: '케이팝', en: 'K-POP' }, sub: 'K-POP', icon: '✨', accentColor: '#3B82F6' },
  { id: 'band', name: { ko: '밴드', en: 'BAND' }, sub: 'BAND', icon: '🥁', accentColor: '#A855F7' },
  { id: 'edm', name: { ko: '이디엠', en: 'EDM' }, sub: 'EDM', icon: '🎧', accentColor: '#00E5FF' },
  { id: 'pop', name: { ko: '팝', en: 'POP' }, sub: 'POP', icon: '🌎', accentColor: '#F59E0B' },
  { id: 'jpop', name: { ko: '제이팝', en: 'J-POP' }, sub: 'J-POP', icon: '⚡', accentColor: '#EC4899' },
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
    <div className="flex flex-col min-h-dvh justify-between p-6 select-none relative overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2 z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label={lang === 'ko' ? '이전' : 'Back'}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
        </div>

        <div className="flex items-center gap-2">
          {onToggleLang && (
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
          )}

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col justify-center py-4 z-10">
        <div className="text-center mb-6">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {lang === 'ko' ? 'STEP 2 · 장르 선택' : 'STEP 2 · GENRE SELECT'}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
            {lang === 'ko' ? '좋아하는 러닝 음악 장르' : 'Select Running Genres'}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <span>{lang === 'ko' ? '최대 3개 선택 가능' : 'Select up to 3'}</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span
              className={`font-black ${
                count > 0 ? 'text-[#00A344] dark:text-[#C4FF00]' : 'text-zinc-400'
              }`}
            >
              {lang === 'ko' ? `${count} / 3 선택됨` : `${count} / 3 selected`}
            </span>
          </div>
        </div>

        {/* 7-Genre Grid with Spring Physics */}
        <div className="grid grid-cols-2 gap-3 mb-5">
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
                whileTap={{ scale: 0.94 }}
                onClick={() => handleCardClick(cat.id)}
                className={`relative p-4 rounded-3xl border-2 flex flex-col justify-between h-28 cursor-pointer select-none transition-all duration-200 overflow-hidden ${
                  isLastOdd ? 'col-span-2' : ''
                } ${
                  isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-[#C4FF00] shadow-lg shadow-[#C4FF00]/15 ring-2 ring-[#C4FF00]/30'
                    : 'bg-zinc-100/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Background Accent Glow when Selected */}
                {isSelected && (
                  <div
                    className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: cat.accentColor }}
                  />
                )}

                <div className="flex items-center justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isSelected
                        ? 'bg-[#C4FF00] text-black shadow-sm'
                        : 'border-2 border-zinc-300 dark:border-zinc-700 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {cat.name[lang]}
                  </h3>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
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
              className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00A344] dark:text-[#C4FF00]" />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {lang === 'ko' ? '장르별 수록 비율' : 'Tracks per Genre'}
                </span>
              </div>
              <span className="text-xs font-black text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                {lang === 'ko'
                  ? `장르당 약 ${songsPerGenre}곡씩 총 30곡`
                  : `~${songsPerGenre} tracks each (30 total)`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom CTA */}
      <footer className="pb-4 pt-2 z-10">
        <motion.button
          type="button"
          disabled={count === 0 || isGenerating}
          onClick={handleCreatePlaylist}
          whileHover={count > 0 ? { scale: 1.02 } : {}}
          whileTap={count > 0 ? { scale: 0.96 } : {}}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${
            count > 0
              ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black shadow-lg shadow-[#C4FF00]/25 cursor-pointer'
              : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span>{lang === 'ko' ? '30곡 맞춤 믹스 생성 중...' : 'Generating 30 Tracks...'}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{lang === 'ko' ? '30곡 플레이리스트 만들기' : 'Create 30-Track Playlist'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </footer>
    </div>
  );
};
