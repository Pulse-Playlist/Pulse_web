'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HomeScreenProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onStart: () => void;
  totalSongsCount?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isDark,
  onToggleTheme,
  onStart,
}) => {
  const logoSrc = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image src={logoSrc} alt="PULSE" fill className="object-cover" />
          </div>
          <span className="font-black tracking-tighter text-lg font-display text-zinc-900 dark:text-white">
            PULSE
          </span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Center Hero: Just Logo & Minimal Title */}
      <main className="flex-1 flex flex-col items-center justify-center text-center my-auto">
        <div className="relative w-52 h-52 rounded-[32px] overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-black mb-7 transition-transform duration-300 hover:scale-[1.02]">
          <Image
            src={logoSrc}
            alt="PULSE Logo"
            fill
            priority
            className="object-cover"
          />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          내 템포에 맞춘 러닝 플레이리스트
        </h1>
      </main>

      {/* Bottom CTA */}
      <footer className="pb-4 pt-2">
        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 px-6 rounded-2xl bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-lg shadow-lg shadow-[#C4FF00]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>플레이리스트 만들기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
