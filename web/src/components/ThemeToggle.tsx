'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="relative p-1.5 rounded-full transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white active:scale-90 cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-zinc-300 hover:text-[#C4FF00] transition-colors" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-600 hover:text-zinc-900 transition-colors" />
      )}
    </button>
  );
};
