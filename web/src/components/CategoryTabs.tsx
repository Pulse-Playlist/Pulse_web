'use client';

import React from 'react';
import { Layers, Radio, Sparkles, Guitar, Mic2 } from 'lucide-react';

export type CategoryKey = 'all' | 'band' | 'kpop' | 'rock' | 'hiphop';

interface CategoryTabsProps {
  activeCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
  counts: Record<string, number>;
  total: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
  total,
}) => {
  const tabs: { key: CategoryKey; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: 'all',
      label: 'ALL TRACKS',
      icon: <Layers className="h-4 w-4" />,
      count: total,
    },
    {
      key: 'band',
      label: 'K-BAND',
      icon: <Guitar className="h-4 w-4" />,
      count: counts.band || 0,
    },
    {
      key: 'kpop',
      label: 'K-POP',
      icon: <Sparkles className="h-4 w-4" />,
      count: counts.kpop || 0,
    },
    {
      key: 'rock',
      label: 'ROCK / METAL',
      icon: <Radio className="h-4 w-4" />,
      count: counts.rock || 0,
    },
    {
      key: 'hiphop',
      label: 'HIP-HOP',
      icon: <Mic2 className="h-4 w-4" />,
      count: counts.hiphop || 0,
    },
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectCategory(tab.key)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            <span className={isActive ? 'text-zinc-950' : 'text-zinc-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-zinc-900 text-zinc-200'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
