'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, RotateCcw, Check, Sparkles, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { playTapKick } from '@/lib/soundEffects';

interface TapTempoScreenProps {
  initialBpm?: number;
  onConfirmBpm: (bpm: number) => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

interface FloatingBadge {
  id: number;
  text: string;
  color: string;
}

interface ShockwaveRing {
  id: number;
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
  const [floatingBadges, setFloatingBadges] = useState<FloatingBadge[]>([]);
  const [shockwaves, setShockwaves] = useState<ShockwaveRing[]>([]);
  const [comboCount, setComboCount] = useState(0);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  const resetTaps = useCallback(() => {
    setTaps([]);
    setMeasuredBpm(null);
    setComboCount(0);
    setFloatingBadges([]);
    setShockwaves([]);
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

  // Determine dynamic color based on measured or initial BPM
  const currentEffectiveBpm = measuredBpm || initialBpm;
  const getBpmColor = (val: number) => {
    if (val <= 130) return '#C4FF00';
    if (val <= 160) return '#3B82F6';
    return '#FF4B4B';
  };
  const activeColor = getBpmColor(currentEffectiveBpm);

  const handleTap = () => {
    const now = performance.now();
    const newTapCount = taps.length + 1;

    // 1. Play zero-latency kick SFX (accent on every 4th tap)
    playTapKick(newTapCount);

    // 2. Spawn Expanding Neon Shockwave Ring
    const waveId = Date.now() + Math.random();
    setShockwaves((prev) => [...prev.slice(-4), { id: waveId }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((w) => w.id !== waveId));
    }, 700);

    // 3. Reset idle timer after 2.5s
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setTaps([]);
      setComboCount(0);
    }, 2500);

    // 4. Calculate BPM & Rhythm Consistency
    setTaps((prev) => {
      const isIdleReset = prev.length > 0 && now - prev[prev.length - 1] > 2500;
      const updated = isIdleReset ? [now] : [...prev, now].slice(-10);

      if (updated.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < updated.length; i++) {
          intervals.push(updated[i] - updated[i - 1]);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        if (avgInterval > 0) {
          const calculated = Math.round(60000 / avgInterval);
          const clamped = Math.max(60, Math.min(220, calculated));
          setMeasuredBpm(clamped);

          // Calculate variance for rhythm badge evaluation
          const variance =
            intervals.reduce((acc, val) => acc + Math.abs(val - avgInterval), 0) / intervals.length;

          const currentCombo = updated.length;
          setComboCount(currentCombo);

          let badgeText = '';
          let badgeColor = '#C4FF00';

          if (currentCombo >= 6) {
            badgeText = `🔥 ${currentCombo} COMBO!`;
            badgeColor = '#FF4B4B';
          } else if (variance < 40) {
            badgeText = '⚡ PERFECT RHYTHM!';
            badgeColor = '#C4FF00';
          } else if (variance < 85) {
            badgeText = '✨ GOOD TEMPO!';
            badgeColor = '#3B82F6';
          } else {
            badgeText = `TAP ${currentCombo}`;
            badgeColor = '#A1A1AA';
          }

          const badgeId = Date.now() + Math.random();
          setFloatingBadges((b) => [...b.slice(-3), { id: badgeId, text: badgeText, color: badgeColor }]);
          setTimeout(() => {
            setFloatingBadges((b) => b.filter((item) => item.id !== badgeId));
          }, 900);
        }
      } else {
        const badgeId = Date.now();
        setFloatingBadges([{ id: badgeId, text: 'FIRST BEAT!', color: '#C4FF00' }]);
        setTimeout(() => {
          setFloatingBadges((b) => b.filter((item) => item.id !== badgeId));
        }, 900);
      }
      return updated;
    });
  };

  const hasEnoughTaps = taps.length >= 2 && measuredBpm !== null;

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6 select-none relative overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2 z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Main Tap Pad Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center py-4 z-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400 mb-2">
            <Sparkles className="w-3 h-3 text-[#C4FF00]" />
            <span>발걸음 박자에 맞춰 연속으로 탭하세요</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            화면을 탭해서 템포 맞추기
          </h2>
        </div>

        {/* Central Rhythm Game Tap Pad Container */}
        <div className="relative flex items-center justify-center my-4">
          {/* Floating Rhythm Combo Badges */}
          <div className="absolute -top-12 inset-x-0 flex flex-col items-center pointer-events-none z-20">
            <AnimatePresence>
              {floatingBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ y: 0, opacity: 0, scale: 0.8 }}
                  animate={{ y: -30, opacity: 1, scale: 1.1 }}
                  exit={{ y: -50, opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="px-3.5 py-1 rounded-full text-xs font-black shadow-lg backdrop-blur-md"
                  style={{
                    backgroundColor: badge.color,
                    color: badge.color === '#C4FF00' ? '#000000' : '#ffffff',
                  }}
                >
                  {badge.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Expanding Neon Shockwave Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence>
              {shockwaves.map((wave) => (
                <motion.div
                  key={wave.id}
                  initial={{ scale: 0.9, opacity: 0.95 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="absolute w-64 h-64 rounded-full border-2 pointer-events-none"
                  style={{ borderColor: activeColor }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Rhythm Game Interactive Central Pad */}
          <motion.button
            type="button"
            onClick={handleTap}
            whileTap={{ scale: 0.92, rotate: [-1, 1.5, 0] }}
            animate={{
              boxShadow: hasEnoughTaps
                ? `0 0 35px ${activeColor}40`
                : '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
            transition={{ duration: 0.2 }}
            className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center p-6 border-4 cursor-pointer select-none transition-colors duration-200 ${
              hasEnoughTaps
                ? 'bg-zinc-100 dark:bg-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800'
            }`}
            style={{
              borderColor: hasEnoughTaps ? activeColor : undefined,
            }}
          >
            {/* Combo streak flame indicator */}
            {comboCount >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-6 flex items-center gap-1 text-[11px] font-black"
                style={{ color: activeColor }}
              >
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span>{comboCount} STREAK</span>
              </motion.div>
            )}

            <motion.span
              key={measuredBpm || 'tap'}
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-white font-display"
            >
              {measuredBpm ? measuredBpm : 'TAP'}
            </motion.span>

            <span
              className="text-xs font-black px-2.5 py-0.5 rounded-md mt-2 shadow-sm transition-colors duration-200"
              style={{
                backgroundColor: hasEnoughTaps ? activeColor : '#C4FF00',
                color: hasEnoughTaps && activeColor !== '#C4FF00' ? '#ffffff' : '#000000',
              }}
            >
              {measuredBpm ? 'BPM 감지됨' : '박자에 맞춰 탭'}
            </span>

            {/* Tap progress indicator dots */}
            <div className="absolute bottom-6 flex items-center gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    taps.length >= step
                      ? 'scale-110'
                      : 'opacity-25 bg-zinc-400 dark:bg-zinc-600'
                  }`}
                  style={{
                    backgroundColor: taps.length >= step ? activeColor : undefined,
                  }}
                />
              ))}
            </div>
          </motion.button>
        </div>

        {/* Tip & Reset Button */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
            {hasEnoughTaps
              ? '💡 꾸준히 탭할수록 더 정밀한 템포가 계산됩니다'
              : '최소 2번 이상 리듬에 맞춰 탭해 주세요'}
          </p>

          {taps.length > 0 && (
            <motion.button
              type="button"
              onClick={resetTaps}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mt-1 py-1.5 px-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </motion.button>
          )}
        </div>
      </main>

      {/* Bottom CTA */}
      <footer className="pb-4 pt-2 z-10">
        <motion.button
          type="button"
          disabled={!hasEnoughTaps}
          onClick={() => onConfirmBpm(currentEffectiveBpm)}
          whileHover={hasEnoughTaps ? { scale: 1.02 } : {}}
          whileTap={hasEnoughTaps ? { scale: 0.96 } : {}}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${
            hasEnoughTaps
              ? 'bg-[#C4FF00] hover:bg-[#B8F500] text-black shadow-lg shadow-[#C4FF00]/25 cursor-pointer'
              : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>{hasEnoughTaps ? `${currentEffectiveBpm} BPM으로 설정 완료` : '박자에 맞춰 탭해 주세요'}</span>
        </motion.button>
      </footer>
    </div>
  );
};
