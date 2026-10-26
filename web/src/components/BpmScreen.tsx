'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, Minus, Plus, Hand, ArrowRight, Volume2, VolumeX, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import {
  playDialTick,
  startBpmMetronome,
  updateBpmMetronome,
  stopBpmMetronome,
} from '@/lib/soundEffects';

interface BpmScreenProps {
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  onOpenTapTempo: () => void;
  onNext: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const BpmScreen: React.FC<BpmScreenProps> = ({
  bpm,
  onChangeBpm,
  onOpenTapTempo,
  onNext,
  onBack,
  isDark,
  onToggleTheme,
}) => {
  const [inputText, setInputText] = useState(String(bpm));
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';
  const lastTickTime = useRef(0);

  // Sync internal input state when prop changes
  useEffect(() => {
    setInputText(String(bpm));
  }, [bpm]);

  // Clean up looping metronome on unmount
  useEffect(() => {
    return () => {
      stopBpmMetronome();
    };
  }, []);

  // Determine BPM Zone, Colors & corresponding mini logo
  const getBpmZone = (val: number) => {
    if (val <= 130) {
      return {
        label: '조깅 · 웜업 페이스',
        color: '#C4FF00',
        textColor: 'text-[#C4FF00]',
        bgGlow: 'rgba(196, 255, 0, 0.22)',
        borderClass: 'border-[#C4FF00]/50',
        logo: '/logos/logo-green.png',
        badgeBg: 'bg-[#C4FF00] text-black',
      };
    }
    if (val <= 160) {
      return {
        label: '지속주 · 에어로빅 페이스',
        color: '#3B82F6',
        textColor: 'text-[#3B82F6]',
        bgGlow: 'rgba(59, 130, 246, 0.22)',
        borderClass: 'border-[#3B82F6]/50',
        logo: '/logos/logo-blue.png',
        badgeBg: 'bg-[#3B82F6] text-white',
      };
    }
    return {
      label: '템포런 · 인터벌 스프린트',
      color: '#FF4B4B',
      textColor: 'text-[#FF4B4B]',
      bgGlow: 'rgba(255, 75, 75, 0.22)',
      borderClass: 'border-[#FF4B4B]/50',
      logo: '/logos/logo-red.png',
      badgeBg: 'bg-[#FF4B4B] text-white',
    };
  };

  const zone = getBpmZone(bpm);
  const beatDuration = 60 / Math.max(60, Math.min(220, bpm));

  // Toggle Live Metronome Loop
  const handleToggleBeatLoop = () => {
    if (isPlayingBeat) {
      stopBpmMetronome();
      setIsPlayingBeat(false);
    } else {
      startBpmMetronome(bpm, () => {
        setPulseCount((c) => (c + 1) % 4);
      });
      setIsPlayingBeat(true);
    }
  };

  const handleUpdateBpmWithSound = (newBpm: number) => {
    const clamped = Math.max(60, Math.min(220, newBpm));
    const now = performance.now();
    if (now - lastTickTime.current > 35) {
      playDialTick(clamped);
      lastTickTime.current = now;
    }
    onChangeBpm(clamped);
    if (isPlayingBeat) {
      updateBpmMetronome(clamped);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      handleUpdateBpmWithSound(val);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInputText(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 60 && num <= 220) {
      handleUpdateBpmWithSound(num);
    }
  };

  const handleInputBlur = () => {
    const num = parseInt(inputText, 10);
    if (isNaN(num)) {
      setInputText(String(bpm));
    } else {
      const clamped = Math.max(60, Math.min(220, num));
      handleUpdateBpmWithSound(clamped);
      setInputText(String(clamped));
    }
  };

  const handleNudge = (delta: number) => {
    handleUpdateBpmWithSound(bpm + delta);
  };

  const handleNavigateNext = () => {
    stopBpmMetronome();
    setIsPlayingBeat(false);
    onNext();
  };

  const handleNavigateTapTempo = () => {
    stopBpmMetronome();
    setIsPlayingBeat(false);
    onOpenTapTempo();
  };

  const handleNavigateBack = () => {
    stopBpmMetronome();
    setIsPlayingBeat(false);
    onBack();
  };

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6 select-none relative">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2 z-10">
        <button
          type="button"
          onClick={handleNavigateBack}
          aria-label="이전"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center py-4 text-center z-10">
        <div className="mb-6">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            STEP 1 · TEMPO SELECT
          </span>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
            원하는 BPM을 입력하세요
          </h2>
        </div>

        {/* Live BPM-Synced Visual Pulse Card */}
        <motion.div
          animate={{
            boxShadow: `0 0 ${isPlayingBeat ? '36px' : '22px'} ${zone.bgGlow}`,
          }}
          transition={{
            duration: beatDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`relative p-6 sm:p-7 rounded-3xl bg-zinc-100/90 dark:bg-zinc-900/90 border-2 ${zone.borderClass} mb-4 backdrop-blur-md transition-colors duration-300`}
        >
          {/* Top Info Header with Dynamic Zone Badge and Mini Cover Logo */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Mini cover logo spinning/bouncing to the beat */}
              <motion.div
                key={zone.logo}
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [0, 4, -4, 0],
                }}
                transition={{
                  duration: beatDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-300/80 dark:border-zinc-700/80 shadow-md"
              >
                <Image src={zone.logo} alt="Zone Cover" fill className="object-cover" />
              </motion.div>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${zone.badgeBg}`}>
                {zone.label}
              </span>
            </div>

            {/* Live Beat Visual Heartbeat Rate Indicator */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: beatDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{ color: zone.color }}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{beatDuration.toFixed(2)}s/beat</span>
            </motion.div>
          </div>

          {/* Stepper & Number Display */}
          <div className="flex items-center justify-center gap-4 py-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleNudge(-1)}
              aria-label="1 감소"
              className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center shadow-sm cursor-pointer"
            >
              <Minus className="w-5 h-5" />
            </motion.button>

            <div className="flex items-baseline justify-center">
              <input
                type="text"
                inputMode="numeric"
                value={inputText}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                aria-label="BPM 숫자 입력"
                className="w-32 text-center text-6xl font-black tracking-tighter text-zinc-900 dark:text-white bg-transparent border-b-2 border-transparent focus:border-current focus:outline-none font-display transition-colors"
                style={{ caretColor: zone.color }}
              />
              <span
                className="text-xs font-black px-2 py-0.5 rounded-md ml-1 shadow-sm transition-colors duration-300"
                style={{ backgroundColor: zone.color, color: bpm <= 130 ? '#000000' : '#ffffff' }}
              >
                BPM
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleNudge(1)}
              aria-label="1 증가"
              className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Smooth Tactile Slider */}
          <div className="mt-5 px-1">
            <input
              type="range"
              min={80}
              max={200}
              step={1}
              value={Math.max(80, Math.min(200, bpm))}
              onChange={handleSliderChange}
              style={{ accentColor: zone.color }}
              className="w-full cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[11px] font-bold text-zinc-400 mt-2">
              <span className={bpm <= 130 ? 'text-zinc-900 dark:text-white font-extrabold' : ''}>
                80 (Warmup)
              </span>
              <span
                className={
                  bpm > 130 && bpm <= 160 ? 'text-zinc-900 dark:text-white font-extrabold' : ''
                }
              >
                140 (Jogging)
              </span>
              <span className={bpm > 160 ? 'text-zinc-900 dark:text-white font-extrabold' : ''}>
                200 (Sprint)
              </span>
            </div>
          </div>

          {/* Live Beat Audio Feedback Toggle Button */}
          <div className="mt-5 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <motion.button
              type="button"
              onClick={handleToggleBeatLoop}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isPlayingBeat
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md ring-2'
                  : 'bg-white dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
              style={isPlayingBeat ? { borderColor: zone.color } : {}}
            >
              {isPlayingBeat ? (
                <>
                  <Volume2 className="w-4 h-4 animate-bounce" style={{ color: zone.color }} />
                  <span>⏹️ {bpm} BPM 실시간 비트 재생 중 (탭하여 정지)</span>
                  {/* Visual 4-beat dot indicator */}
                  <div className="flex items-center gap-1 ml-1.5">
                    {[0, 1, 2, 3].map((idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          pulseCount === idx ? 'bg-current scale-125' : 'opacity-30 bg-current'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                  <span>🥁 이 템포 비트 들어보기</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Tap Tempo Entry Button */}
        <motion.button
          type="button"
          onClick={handleNavigateTapTempo}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
        >
          <Hand className="w-4 h-4 text-[#C4FF00]" />
          <span>내 발걸음에 맞추기? 화면 탭해서 템포 찾기</span>
        </motion.button>
      </main>

      {/* Bottom CTA */}
      <footer className="pb-4 pt-2 z-10">
        <motion.button
          type="button"
          onClick={handleNavigateNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-4 px-6 rounded-2xl bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-base shadow-lg shadow-[#C4FF00]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>다음 단계 (장르 선택)</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </footer>
    </div>
  );
};
