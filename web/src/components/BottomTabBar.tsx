'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Sliders, Radio, Library, Sparkles, LucideIcon } from 'lucide-react';
import { AppLanguage } from '@/types/song';
import { playPopSound } from '@/lib/soundEffects';

export type AppStep = 'home' | 'bpm' | 'tap' | 'category' | 'artists' | 'playlist';

export interface BottomTabBarProps {
  activeStep: AppStep;
  onSelectStep: (step: AppStep) => void;
  hasActivePlaylist: boolean;
  lang: AppLanguage;
  isDark: boolean;
}

interface TabItem {
  id: AppStep;
  icon: LucideIcon;
  labelKo: string;
  labelEn: string;
  isActive: (current: AppStep) => boolean;
}

const TABS: TabItem[] = [
  {
    id: 'home',
    icon: Home,
    labelKo: '홈',
    labelEn: 'Home',
    isActive: (curr) => curr === 'home',
  },
  {
    id: 'bpm',
    icon: Sliders,
    labelKo: '케이던스',
    labelEn: 'Cadence',
    isActive: (curr) => curr === 'bpm' || curr === 'category',
  },
  {
    id: 'tap',
    icon: Radio,
    labelKo: '탭 템포',
    labelEn: 'Tap BPM',
    isActive: (curr) => curr === 'tap',
  },
  {
    id: 'playlist',
    icon: Library,
    labelKo: '플레이리스트',
    labelEn: 'Mix',
    isActive: (curr) => curr === 'playlist',
  },
  {
    id: 'artists',
    icon: Sparkles,
    labelKo: '아티스트',
    labelEn: 'Artists',
    isActive: (curr) => curr === 'artists',
  },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeStep,
  onSelectStep,
  hasActivePlaylist: _hasActivePlaylist,
  lang,
  isDark,
}) => {
  const handleTabClick = (tabId: AppStep) => {
    playPopSound(true);
    onSelectStep(tabId);
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-3 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
    >
      <div className="pointer-events-auto w-full max-w-[398px] h-[62px] p-1.5 rounded-full bg-white/85 dark:bg-zinc-900/88 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.16)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.65)] flex items-center justify-between">
        {TABS.map((tab) => {
          const active = tab.isActive(activeStep);
          const Icon = tab.icon;
          const label = lang === 'ko' ? tab.labelKo : tab.labelEn;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="relative flex-1 h-full rounded-full flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer select-none"
            >
              {active && (
                <motion.div
                  layoutId="apple-tab-pill"
                  className="absolute inset-0 rounded-full bg-black/[0.08] dark:bg-white/[0.14] shadow-inner"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 32,
                    mass: 0.8,
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-colors duration-150 ${
                    active
                      ? isDark
                        ? 'text-[#C4FF00] drop-shadow-[0_0_6px_rgba(196,255,0,0.45)]'
                        : 'text-zinc-950 font-black'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] tracking-tight leading-none mt-0.5 flex items-center gap-0.5 transition-colors duration-150 ${
                    active
                      ? isDark
                        ? 'text-[#C4FF00] font-bold'
                        : 'text-zinc-950 font-black'
                      : 'text-zinc-500 dark:text-zinc-400 font-medium'
                  }`}
                >
                  {label}
                  {active && !isDark && (
                    <span className="w-1 h-1 rounded-full bg-[#C4FF00] shrink-0" />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
