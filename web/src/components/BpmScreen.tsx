'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, Minus, Plus, Hand, ArrowRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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
  const brandLogo = isDark ? '/logos/logo-dark.png' : '/logos/logo-green.png';

  useEffect(() => {
    setInputText(String(bpm));
  }, [bpm]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChangeBpm(Math.max(60, Math.min(220, val)));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInputText(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 60 && num <= 220) {
      onChangeBpm(num);
    }
  };

  const handleInputBlur = () => {
    const num = parseInt(inputText, 10);
    if (isNaN(num)) {
      setInputText(String(bpm));
    } else {
      const clamped = Math.max(60, Math.min(220, num));
      onChangeBpm(clamped);
      setInputText(String(clamped));
    }
  };

  const handleNudge = (delta: number) => {
    onChangeBpm(Math.max(60, Math.min(220, bpm + delta)));
  };

  return (
    <div className="flex flex-col min-h-dvh justify-between p-6">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="이전"
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <Image src={brandLogo} alt="PULSE" fill className="object-cover" />
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center py-6 text-center">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-8">
          원하는 BPM을 입력하세요
        </h2>

        {/* Direct BPM Input & Stepper */}
        <div className="p-7 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-5">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleNudge(-1)}
              aria-label="1 감소"
              className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center active:scale-95 transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="flex items-baseline justify-center">
              <input
                type="text"
                inputMode="numeric"
                value={inputText}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                aria-label="BPM 숫자 입력"
                className="w-28 text-center text-6xl font-black tracking-tighter text-zinc-900 dark:text-white bg-transparent border-b-2 border-transparent focus:border-[#C4FF00] focus:outline-none font-display"
              />
              <span className="text-xs font-black text-black bg-[#C4FF00] px-2 py-0.5 rounded-md ml-1">
                BPM
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleNudge(1)}
              aria-label="1 증가"
              className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Smooth Slider */}
          <div className="mt-7 px-1">
            <input
              type="range"
              min={80}
              max={200}
              step={1}
              value={Math.max(80, Math.min(200, bpm))}
              onChange={handleSliderChange}
              className="w-full accent-[#C4FF00]"
            />
            <div className="flex justify-between text-[11px] font-bold text-zinc-400 mt-2">
              <span>80</span>
              <span>140</span>
              <span>200</span>
            </div>
          </div>
        </div>

        {/* Tap Tempo Entry Button */}
        <button
          type="button"
          onClick={onOpenTapTempo}
          className="w-full py-4 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Hand className="w-4 h-4 text-[#0A0A0A] dark:text-[#C4FF00]" />
          <span>잘 모르겠다면? 화면 탭해서 템포 맞추기</span>
        </button>
      </main>

      {/* Bottom CTA */}
      <footer className="pb-4 pt-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-4 px-6 rounded-2xl bg-[#C4FF00] hover:bg-[#B8F500] text-black font-black text-base shadow-lg shadow-[#C4FF00]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>다음</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
