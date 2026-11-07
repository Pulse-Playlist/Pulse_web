'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, RotateCcw, Check, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTapKick } from '@/lib/soundEffects';
import { AppLanguage } from '@/types/song';

interface TapTempoScreenProps {
  initialBpm?: number;
  onConfirmBpm: (bpm: number) => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  lang?: AppLanguage;
  onToggleLang?: () => void;
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
  lang = 'ko',
  onToggleLang,
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
            badgeText = `${currentCombo} STREAK`;
            badgeColor = '#FF4B4B';
          } else if (variance < 40) {
            badgeText = 'PERFECT RHYTHM';
            badgeColor = '#C4FF00';
          } else if (variance < 85) {
            badgeText = 'GOOD TEMPO';
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
        setFloatingBadges([{ id: badgeId, text: 'FIRST BEAT', color: '#C4FF00' }]);
        setTimeout(() => {
          setFloatingBadges((b) => b.filter((item) => item.id !== badgeId));
        }, 900);
      }
      return updated;
    });
  };

  const hasEnoughTaps = taps.length >= 2 && measuredBpm !== null;

  return (
    <div className="flex flex-col gap-5 px-5 pt-3 pb-24 select-none relative overflow-x-hidden">
      {/* Top Bar */}
      <header className="z-10 pt-1">
        {/* Row 1: Back Button, Brand Pill, Reset Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={lang === 'ko' ? '뒤로 가기' : 'Back'}
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

          {taps.length > 0 ? (
            <button
              type="button"
              onClick={resetTaps}
              aria-label={lang === 'ko' ? '초기화' : 'Reset'}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center shadow-sm text-zinc-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* Row 2: Apple HIG Large Title `Tap Tempo` + Right Status Badge */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
              {lang === 'ko' ? 'RHYTHM STUDIO · 탭 템포' : 'RHYTHM STUDIO · TAP TEMPO'}
            </span>
            <h1 className="text-[32px] font-black tracking-tight text-zinc-900 dark:text-white leading-none font-display">
              {lang === 'ko' ? '탭 템포' : 'Tap Tempo'}
            </h1>
          </div>

          <div
            className="px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm tracking-wide transition-colors duration-300"
            style={{
              backgroundColor: hasEnoughTaps ? activeColor : 'rgba(161, 161, 170, 0.2)',
              color: hasEnoughTaps && activeColor === '#C4FF00' ? '#000000' : '#ffffff',
            }}
          >
            {hasEnoughTaps ? `${measuredBpm} BPM` : 'READY'}
          </div>
        </div>

        {/* Editorial Subtitle */}
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2">
          {lang === 'ko'
            ? '달리는 발걸음 박자에 맞춰 원형 패드를 가볍게 연속으로 터치하세요.'
            : 'Tap the circular studio pad to match your natural running cadence.'}
        </p>
      </header>

      {/* Main Studio Tap Pad Section */}
      <main className="flex flex-col items-center justify-center text-center py-2 z-10">
        {/* Central Rhythm Game Tap Pad Container */}
        <div className="relative flex items-center justify-center my-2">
          {/* Floating Rhythm Combo Badges */}
          <div className="absolute -top-10 inset-x-0 flex flex-col items-center pointer-events-none z-20">
            <AnimatePresence>
              {floatingBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ y: 0, opacity: 0, scale: 0.8 }}
                  animate={{ y: -26, opacity: 1, scale: 1.05 }}
                  exit={{ y: -45, opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="px-3.5 py-1 rounded-full text-[11px] font-black shadow-sm backdrop-blur-md tracking-wider uppercase"
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
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute w-56 h-56 rounded-full border-2 pointer-events-none"
                  style={{ borderColor: activeColor }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Rhythm Game Interactive Central Apple HIG Studio Pad */}
          <button
            type="button"
            onClick={handleTap}
            className={`relative w-56 h-56 rounded-full flex flex-col items-center justify-center p-6 border-2 cursor-pointer select-none transition-transform bg-zinc-100 dark:bg-zinc-900 shadow-md active:scale-95 ${
              hasEnoughTaps ? '' : 'border-black/10 dark:border-white/10'
            }`}
            style={{
              borderColor: hasEnoughTaps ? activeColor : undefined,
            }}
          >
            {/* Combo streak clean indicator */}
            {comboCount >= 3 && (
              <div
                className="absolute top-5 flex items-center gap-1 text-[11px] font-black tracking-wider uppercase"
                style={{ color: activeColor }}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{comboCount} STREAK</span>
              </div>
            )}

            <span className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-white font-display">
              {measuredBpm ? measuredBpm : 'TAP'}
            </span>

            <span
              className="text-xs font-black px-3 py-0.5 rounded-full mt-2 shadow-sm transition-colors duration-200"
              style={{
                backgroundColor: hasEnoughTaps ? activeColor : '#C4FF00',
                color: hasEnoughTaps && activeColor !== '#C4FF00' ? '#ffffff' : '#000000',
              }}
            >
              {measuredBpm
                ? lang === 'ko'
                  ? 'BPM 감지됨'
                  : 'BPM Detected'
                : lang === 'ko'
                ? '박자에 맞춰 탭'
                : 'Tap with Stride'}
            </span>

            {/* Tap progress indicator dots */}
            <div className="absolute bottom-5 flex items-center gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    taps.length >= step
                      ? 'scale-125'
                      : 'opacity-25 bg-zinc-400 dark:bg-zinc-600'
                  }`}
                  style={{
                    backgroundColor: taps.length >= step ? activeColor : undefined,
                  }}
                />
              ))}
            </div>
          </button>
        </div>

        {/* Tip & Reset Button */}
        <div className="flex flex-col items-center gap-2 mt-3">
          <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
            {hasEnoughTaps
              ? lang === 'ko'
                ? '꾸준히 탭할수록 더 정밀한 평균 케이던스가 계산됩니다.'
                : 'Keep tapping for a more precise average BPM.'
              : lang === 'ko'
              ? '최소 2번 이상 러닝 리듬에 맞춰 탭해 주세요.'
              : 'Tap at least 2 times to measure tempo.'}
          </p>

          {taps.length > 0 && (
            <button
              type="button"
              onClick={resetTaps}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mt-1 py-1.5 px-3.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/5 dark:border-white/10 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? '기록 초기화' : 'Reset'}</span>
            </button>
          )}
        </div>
      </main>

      {/* Bottom CTA Capsule Button */}
      <footer className="mt-2 z-10">
        <button
          type="button"
          disabled={!hasEnoughTaps}
          onClick={() => onConfirmBpm(currentEffectiveBpm)}
          style={
            hasEnoughTaps
              ? {
                  backgroundColor: activeColor,
                  color: currentEffectiveBpm <= 130 ? '#000000' : '#FFFFFF',
                }
              : undefined
          }
          className={`w-full py-4 px-6 rounded-full font-black text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
            hasEnoughTaps
              ? 'active:scale-[0.98] cursor-pointer'
              : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>
            {hasEnoughTaps
              ? lang === 'ko'
                ? `${currentEffectiveBpm} BPM으로 설정 완료`
                : `Confirm ${currentEffectiveBpm} BPM`
              : lang === 'ko'
              ? '박자에 맞춰 탭해 주세요'
              : 'Tap to the rhythm'}
          </span>
        </button>
      </footer>
    </div>
  );
};
