'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, RotateCcw, Check } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface TapTempoScreenProps {
  initialBpm?: number;
  onConfirmBpm: (bpm: number) => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const TapTempoScreen: React.FC<TapTempoScreenProps> = ({
  initialBpm = 160,
  onConfirmBpm,
  onBack,
  isDark,
  onToggleTheme,
}) => {
  const [taps, setTaps] = useState<number[]>([]);
  const [measuredBpm, setMeasuredBpm] = useState<number | null>(null);
  const [isBeating, setIsBeating] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  const resetTaps = useCallback(() => {
    setTaps([]);
    setMeasuredBpm(null);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const handleTap = () => {
    const now = performance.now();

    setIsBeating(true);
    setTimeout(() => setIsBeating(false), 110);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setTaps([]);
    }, 2500);

    setTaps((prev) => {
      const isIdleReset = prev.length > 0 && now - prev[prev.length - 1] > 2500;
      const updated = isIdleReset ? [now] : [...prev, now].slice(-8);

      if (updated.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < updated.length; i++) {
          intervals.push(updated[i] - updated[i - 1]);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        if (avgInterval > 0) {
          const calculated = Math.round(60000 / avgInterval);
          setMeasuredBpm(Math.max(60, Math.min(220, calculated)));
        }
      }
      return updated;
    });
  };

  const currentEffectiveBpm = measuredBpm || initialBpm;
  const hasEnoughTaps = taps.length >= 2 && measuredBpm !== null;

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6 select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Main Tap Pad */}
      <main className="flex-1 flex flex-col items-center justify-center text-center py-4">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-8">
          화면을 탭해서 템포를 맞춰보세요
        </h2>

        <button
          type="button"
          onClick={handleTap}
          className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center p-6 transition-all duration-100 active:scale-95 border-4 ${
            isBeating
              ? 'scale-105 border-[#C4FF00] bg-[#C4FF00]/25 shadow-2xl shadow-[#C4FF00]/30'
              : hasEnoughTaps
              ? 'border-[#C4FF00] bg-zinc-100 dark:bg-zinc-900 shadow-xl'
              : 'border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900'
          }`}
        >
          <span className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-white font-display">
            {measuredBpm ? measuredBpm : 'TAP'}
          </span>
          <span className="text-xs font-black text-black bg-[#C4FF00] px-2 py-0.5 rounded mt-2">
            {measuredBpm ? 'BPM' : '여기를 연속 탭'}
          </span>
        </button>

        {taps.length > 0 && (
          <button
            type="button"
            onClick={resetTaps}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mt-6 py-1.5 px-3 rounded-full bg-zinc-100 dark:bg-zinc-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>
        )}
      </main>

      {/* Bottom CTA */}
      <footer className="pb-4 pt-2">
        <button
          type="button"
          disabled={!hasEnoughTaps}
          onClick={() => onConfirmBpm(currentEffectiveBpm)}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${
            hasEnoughTaps
              ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black shadow-lg shadow-[#C4FF00]/25 active:scale-[0.98]'
              : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasEnoughTaps ? `${currentEffectiveBpm} BPM 선택 완료` : '2번 이상 탭하세요'}</span>
        </button>
      </footer>
    </div>
  );
};
