'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  Minus,
  Plus,
  Hand,
  ArrowRight,
  Volume2,
  VolumeX,
  Activity,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  playDialTick,
  startBpmMetronome,
  updateBpmMetronome,
  stopBpmMetronome,
} from '@/lib/soundEffects';
import { AppLanguage } from '@/types/song';

interface BpmScreenProps {
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  onOpenTapTempo: () => void;
  onNext: () => void;
  onBack: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  lang?: AppLanguage;
  onToggleLang?: () => void;
}

const BPM_PRESETS = [
  { bpm: 120, labelKo: '120 웜업', labelEn: '120 Warm' },
  { bpm: 140, labelKo: '140 조깅', labelEn: '140 Jog' },
  { bpm: 160, labelKo: '160 지속주', labelEn: '160 Run' },
  { bpm: 170, labelKo: '170 템포', labelEn: '170 Tempo' },
  { bpm: 180, labelKo: '180 스프린트', labelEn: '180 Sprint' },
];

export const BpmScreen: React.FC<BpmScreenProps> = ({
  bpm,
  onChangeBpm,
  onOpenTapTempo,
  onNext,
  onBack,
  isDark,
  onToggleTheme,
  lang = 'ko',
  onToggleLang,
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
        label: lang === 'ko' ? '조깅 · 웜업 페이스' : 'Jogging · Warmup Pace',
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
        label: lang === 'ko' ? '지속주 · 에어로빅 페이스' : 'Aerobic Steady Pace',
        color: '#3B82F6',
        textColor: 'text-[#3B82F6]',
        bgGlow: 'rgba(59, 130, 246, 0.22)',
        borderClass: 'border-[#3B82F6]/50',
        logo: '/logos/logo-blue.png',
        badgeBg: 'bg-[#3B82F6] text-white',
      };
    }
    return {
      label: lang === 'ko' ? '템포런 · 인터벌 스프린트' : 'Tempo · Interval Sprint',
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

  // Find closest preset
  const closestPresetBpm = BPM_PRESETS.reduce((prev, curr) =>
    Math.abs(curr.bpm - bpm) < Math.abs(prev.bpm - bpm) ? curr : prev
  ).bpm;

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6 pb-36 select-none relative overflow-x-hidden">
      {/* Ambient Top Gradient Glow (Apple Music Replay style) */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-72 opacity-25 dark:opacity-30 blur-3xl transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% -20%, ${zone.color} 0%, transparent 70%)`,
        }}
      />

      {/* Top Navigation & Large Title Section */}
      <header className="z-10 pt-1">
        {/* Row 1: Back Button, Brand Pill, Quick Controls */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleNavigateBack}
            aria-label={lang === 'ko' ? '이전' : 'Back'}
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

          <div className="flex items-center gap-1.5">
            {/* Quick Metronome Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleBeatLoop}
              aria-label={isPlayingBeat ? '메트로놈 끄기' : '메트로놈 켜기'}
              className={`w-10 h-10 rounded-full backdrop-blur-xl border border-black/5 dark:border-white/10 flex items-center justify-center shadow-sm transition-transform cursor-pointer active:scale-95 ${
                isPlayingBeat
                  ? 'bg-zinc-900 dark:bg-white text-[#C4FF00] dark:text-black'
                  : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {isPlayingBeat ? (
                <Volume2 className="w-4 h-4 animate-bounce" style={{ color: zone.color }} />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Apple Music Replay Large Title + Zone Capsule Pill */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
              {lang === 'ko' ? 'STEP 1 · 케이던스 설정' : 'STEP 1 · CADENCE SETUP'}
            </span>
            <h1 className="text-[34px] font-black tracking-tight text-zinc-900 dark:text-white leading-none font-display">
              {lang === 'ko' ? '케이던스' : 'Cadence'}
            </h1>
          </div>

          <span
            className={`text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm tracking-wide transition-all duration-300 ${zone.badgeBg}`}
          >
            {zone.label}
          </span>
        </div>

        {/* Apple Music Replay Horizontal BPM Preset Strip */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2.5 mt-3 -mx-6 px-6 border-b border-black/5 dark:border-white/5">
          {BPM_PRESETS.map((p) => {
            const isSelected = p.bpm === closestPresetBpm;
            return (
              <button
                key={p.bpm}
                type="button"
                onClick={() => handleUpdateBpmWithSound(p.bpm)}
                className={`px-3 py-1 rounded-full text-xs shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md ring-1 ring-black/10'
                    : 'font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-black/5 dark:bg-white/5'
                }`}
              >
                {lang === 'ko' ? p.labelKo : p.labelEn}
              </button>
            );
          })}
        </div>

        {/* Apple Music Replay Editorial Statement Headline */}
        <div className="my-4 text-left">
          <h2 className="text-[23px] sm:text-[25px] font-black tracking-tight leading-snug font-display">
            {lang === 'ko' ? (
              <>
                <span className="text-zinc-400 dark:text-zinc-500">현재 목표 케이던스는 </span>
                <span className="text-zinc-900 dark:text-white">{bpm} BPM</span>
                <span className="text-zinc-400 dark:text-zinc-500"> · </span>
                <span style={{ color: zone.color }}>{zone.label}</span>
                <span className="text-zinc-400 dark:text-zinc-500">입니다.</span>
              </>
            ) : (
              <>
                <span className="text-zinc-400 dark:text-zinc-500">You&apos;re locked into </span>
                <span className="text-zinc-900 dark:text-white">{bpm} BPM</span>
                <span className="text-zinc-400 dark:text-zinc-500"> for </span>
                <span style={{ color: zone.color }}>{zone.label}</span>
                <span className="text-zinc-400 dark:text-zinc-500">.</span>
              </>
            )}
          </h2>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
            {lang === 'ko'
              ? '러닝 보폭과 심박수에 최적화된 맞춤 비트를 설정하세요.'
              : 'Dial in your stride cadence to match your ideal running tempo.'}
          </p>
        </div>
      </header>

      {/* Main Apple HIG Glass Dial Card */}
      <main className="flex-1 flex flex-col justify-center py-2 z-10">
        <motion.div
          animate={{
            boxShadow: `0 8px 32px ${isPlayingBeat ? zone.bgGlow : 'rgba(0, 0, 0, 0.08)'}`,
          }}
          transition={{
            duration: beatDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`relative p-6 rounded-[28px] bg-zinc-100/85 dark:bg-zinc-900/85 backdrop-blur-2xl border-2 ${zone.borderClass} shadow-xl transition-colors duration-300`}
        >
          {/* Card Top: Mini Cover Logo + Heartbeat Interval Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                key={zone.logo}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: beatDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-7 h-7 rounded-lg overflow-hidden border border-black/5 dark:border-white/10 shadow-sm"
              >
                <Image src={zone.logo} alt="Zone Cover" fill className="object-cover" />
              </motion.div>
              <span className="text-xs font-black tracking-wide text-zinc-800 dark:text-zinc-200">
                PULSE Engine
              </span>
            </div>

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.65, 1, 0.65],
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
              aria-label={lang === 'ko' ? '1 감소' : '-1 BPM'}
              className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Minus className="w-5 h-5 stroke-[2.5]" />
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
                className="text-xs font-black px-2.5 py-0.5 rounded-full ml-1.5 shadow-sm transition-colors duration-300"
                style={{
                  backgroundColor: zone.color,
                  color: bpm <= 130 ? '#000000' : '#ffffff',
                }}
              >
                BPM
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleNudge(1)}
              aria-label={lang === 'ko' ? '1 증가' : '+1 BPM'}
              className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
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
              <span className={bpm <= 130 ? 'text-zinc-900 dark:text-white font-black' : ''}>
                80 ({lang === 'ko' ? '웜업' : 'Warmup'})
              </span>
              <span
                className={
                  bpm > 130 && bpm <= 160 ? 'text-zinc-900 dark:text-white font-black' : ''
                }
              >
                140 ({lang === 'ko' ? '조깅' : 'Jogging'})
              </span>
              <span className={bpm > 160 ? 'text-zinc-900 dark:text-white font-black' : ''}>
                200 ({lang === 'ko' ? '스프린트' : 'Sprint'})
              </span>
            </div>
          </div>

          {/* Live Beat Audio Feedback Toggle inside Card */}
          <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/10">
            <motion.button
              type="button"
              onClick={handleToggleBeatLoop}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isPlayingBeat
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 ring-2'
                  : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800'
              }`}
              style={isPlayingBeat ? { borderColor: zone.color } : {}}
            >
              {isPlayingBeat ? (
                <>
                  <Volume2 className="w-4 h-4 animate-bounce" style={{ color: zone.color }} />
                  <span>
                    {lang === 'ko'
                      ? `⏹️ ${bpm} BPM 실시간 메트로놈 재생 중`
                      : `⏹️ Playing ${bpm} BPM metronome`}
                  </span>
                  <div className="flex items-center gap-1 ml-1.5">
                    {[0, 1, 2, 3].map((idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-transform ${
                          pulseCount === idx ? 'bg-current scale-150' : 'opacity-30 bg-current'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                  <span>
                    {lang === 'ko' ? '🥁 이 템포 비트 들어보기' : '🥁 Preview this beat'}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Tap Tempo Capsule Button */}
        <motion.button
          type="button"
          onClick={handleNavigateTapTempo}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full mt-4 py-3.5 px-5 rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-xl border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Hand className="w-4 h-4 text-[#C4FF00]" />
          <span>
            {lang === 'ko'
              ? '내 발걸음에 맞추기? 화면 탭해서 템포 찾기'
              : 'Match your stride? Tap tempo to find BPM'}
          </span>
        </motion.button>
      </main>

      {/* Bottom CTA Button */}
      <footer className="pt-3 z-10">
        <motion.button
          type="button"
          onClick={handleNavigateNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-4 px-6 rounded-full bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-base shadow-lg shadow-[#C4FF00]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'ko' ? '다음 단계 (장르 선택)' : 'Next (Select Genres)'}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      </footer>
    </div>
  );
};
