'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Check, ArrowRight } from 'lucide-react';
import { GenreTag } from '@/types/song';
import { ThemeToggle } from './ThemeToggle';

interface CategoryScreenProps {
  selectedCategories: GenreTag[];
  onToggleCategory: (cat: GenreTag) => void;
  onNext: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  showToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
}

const CATEGORIES: { id: GenreTag; name: string; sub: string }[] = [
  { id: 'hiphop', name: '힙합', sub: 'HIP-HOP' },
  { id: 'rock', name: '락', sub: 'ROCK' },
  { id: 'kpop', name: '케이팝', sub: 'K-POP' },
  { id: 'band', name: '밴드', sub: 'BAND' },
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
  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  const handleCardClick = (catId: GenreTag) => {
    const isSelected = selectedCategories.includes(catId);
    if (!isSelected && selectedCategories.length >= 3) {
      showToast('최대 3개까지 선택할 수 있어요', 'warning');
      setShakingId(catId);
      setTimeout(() => setShakingId(null), 400);
      return;
    }
    onToggleCategory(catId);
  };

  const count = selectedCategories.length;

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="이전"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col justify-center py-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
            카테고리를 선택하세요
          </h2>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            최대 3개 ({count} / 3)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            const isShaking = shakingId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCardClick(cat.id)}
                className={`relative p-5 rounded-3xl text-left border-2 transition-all duration-150 active:scale-[0.97] flex flex-col justify-between h-32 ${
                  isShaking ? 'animate-shake border-red-500' : ''
                } ${
                  isSelected
                    ? 'border-[#C4FF00] bg-[#C4FF00] text-black shadow-lg shadow-[#C4FF00]/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[11px] font-extrabold tracking-wider ${
                      isSelected ? 'text-black/70' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {cat.sub}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-black text-[#C4FF00]'
                        : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <div className="text-xl font-black tracking-tight">{cat.name}</div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom CTA */}
      <footer className="pb-4 pt-2">
        <button
          type="button"
          disabled={count === 0}
          onClick={onNext}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${
            count > 0
              ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black shadow-lg shadow-[#C4FF00]/20 active:scale-[0.98]'
              : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
          }`}
        >
          <span>30곡 플레이리스트 만들기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
