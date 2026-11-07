'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, Timer, RotateCw, Home } from 'lucide-react';

function RateLimitContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialWait = Math.min(120, Math.max(5, Number(searchParams.get('retry') || 15)));
  const [secondsLeft, setSecondsLeft] = useState<number>(initialWait);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const progressRatio = initialWait > 0 ? ((initialWait - secondsLeft) / initialWait) * 100 : 100;
  const canRetry = secondsLeft === 0;

  return (
    <div className="min-h-screen w-full bg-zinc-200 dark:bg-[#070709] flex justify-center items-start select-none">
      <div className="max-w-[430px] w-full mx-auto min-h-dvh overflow-x-hidden shadow-2xl border-x border-zinc-300/80 dark:border-zinc-800/80 bg-white dark:bg-[#000000] relative flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Apple HIG Rate-Limit Card */}
        <div className="w-full rounded-[28px] p-6 bg-[#F5F5F7] dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-xl flex flex-col items-center space-y-5">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-[#FF4B4B]" />
          </div>

          {/* Text Info */}
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF4B4B]/15 text-[#FF4B4B]">
              429 TOO MANY REQUESTS
            </span>
            <h1 className="text-[22px] font-black tracking-tight text-zinc-900 dark:text-white pt-1">
              잠시 호흡을 가다듬어 주세요
            </h1>
            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              짧은 시간 동안 요청이 너무 많이 발생하여
              <br />
              서버 보호를 위해 잠시 접근이 제한되었습니다.
            </p>
          </div>

          {/* Cooldown Timer Box */}
          <div className="w-full rounded-2xl p-4 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Timer className="w-4 h-4 text-[#C4FF00]" />
                <span>재시도 가능 시간</span>
              </span>
              <span className="text-[15px] font-black tabular-nums text-zinc-900 dark:text-white">
                {canRetry ? '준비 완료' : `${secondsLeft}초 후`}
              </span>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressRatio}%`,
                  backgroundColor: canRetry ? '#C4FF00' : '#3B82F6',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-1">
            <button
              type="button"
              disabled={!canRetry}
              onClick={() => router.push('/')}
              className={`w-full h-11 rounded-full text-[13px] font-black flex items-center justify-center gap-2 transition-all ${
                canRetry
                  ? 'bg-[#C4FF00] text-black active:scale-[0.98] cursor-pointer shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              }`}
            >
              <RotateCw className="w-4 h-4 stroke-[2.5]" />
              <span>{canRetry ? '다시 시작하기' : `${secondsLeft}초 후 다시 시도 가능`}</span>
            </button>

            <a
              href="/"
              className="w-full h-11 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-zinc-800 dark:text-zinc-200 text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Home className="w-4 h-4" />
              <span>홈 화면으로 이동</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RateLimitPage() {
  return (
    <Suspense fallback={null}>
      <RateLimitContent />
    </Suspense>
  );
}
