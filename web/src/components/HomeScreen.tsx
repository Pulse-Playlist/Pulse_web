'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { playTapKick } from '@/lib/soundEffects';

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
  totalSongsCount = 465,
}) => {
  const logoSrc = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  // 3D Tilt Card Physics with MotionValues & Springs
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 280 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-14deg', '14deg']);

  // Shockwave ripples spawned on logo tap
  const [shockwaves, setShockwaves] = useState<{ id: number }[]>([]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogoTap = () => {
    playTapKick(1);
    const newId = Date.now();
    setShockwaves((prev) => [...prev.slice(-3), { id: newId }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((item) => item.id !== newId));
    }, 900);
  };

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6 select-none relative overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2 z-10">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            whileTap={{ scale: 0.92 }}
            className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <Image src={logoSrc} alt="PULSE" fill className="object-cover" />
          </motion.div>
          <span className="font-black tracking-tighter text-lg font-display text-zinc-900 dark:text-white">
            PULSE
          </span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Center Hero: 3D Tilt Card + Heartbeat Pulse & ECG */}
      <main className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8 z-10">
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated SVG ECG heartbeat line pulsing behind the logo */}
          <div className="absolute w-[340px] h-28 pointer-events-none -z-10 opacity-30 dark:opacity-40 flex items-center justify-center">
            <svg
              viewBox="0 0 340 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full stroke-[#C4FF00]"
            >
              <motion.path
                d="M 10 40 L 95 40 L 105 24 L 115 56 L 125 8 L 137 72 L 149 32 L 157 44 L 165 40 L 330 40"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0.2, pathOffset: 0 }}
                animate={{
                  pathOffset: [0, 1],
                  opacity: [0.35, 0.9, 0.35],
                }}
                transition={{
                  pathOffset: { duration: 2.8, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            </svg>
          </div>

          {/* Continuous Ambient Heartbeat Glow Ring */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.65, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-56 h-56 rounded-[38px] bg-[#C4FF00]/15 dark:bg-[#C4FF00]/10 blur-xl pointer-events-none -z-10"
          />

          {/* Interactive 3D-Tilt PULSE Logo Card */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onClick={handleLogoTap}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="relative w-52 h-52 rounded-[32px] overflow-hidden shadow-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-black cursor-pointer group select-none transition-shadow duration-300 hover:shadow-[#C4FF00]/25"
          >
            <Image
              src={logoSrc}
              alt="PULSE Logo"
              fill
              priority
              className="object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
            />

            {/* Subtle holographic glare highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Expanding Neon Shockwave Rings on Tap */}
            <AnimatePresence>
              {shockwaves.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-[32px] border-2 border-[#C4FF00] pointer-events-none"
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Minimal Title & Tracks Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-2.5"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-extrabold text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-3 h-3 text-[#C4FF00]" />
            <span>엄선된 러닝 트랙 {totalSongsCount}곡 수록</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            내 템포에 맞춘 러닝 플레이리스트
          </h1>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            러닝 케이던스에 딱 맞는 음악으로 페이스를 유지하세요
          </p>
        </motion.div>
      </main>

      {/* Bottom CTA with Spring Physics */}
      <footer className="pb-4 pt-2 z-10">
        <motion.button
          type="button"
          onClick={() => {
            playTapKick(1);
            onStart();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 px-6 rounded-2xl bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-lg shadow-lg shadow-[#C4FF00]/25 transition-colors flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>플레이리스트 만들기</span>
          <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
        </motion.button>
      </footer>
    </div>
  );
};
