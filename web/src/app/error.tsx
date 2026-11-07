'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('PULSE Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-zinc-200 dark:bg-[#070709] flex justify-center items-start select-none">
      <div className="max-w-[430px] w-full mx-auto min-h-dvh overflow-x-hidden shadow-2xl border-x border-zinc-300/80 dark:border-zinc-800/80 bg-white dark:bg-[#000000] relative flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Apple HIG Status Card */}
        <div className="w-full rounded-[28px] p-6 bg-[#F5F5F7] dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-xl flex flex-col items-center space-y-5">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-[#FF4B4B]" />
          </div>

          {/* Text Info */}
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF4B4B]/15 text-[#FF4B4B]">
              SYSTEM ERROR
            </span>
            <h1 className="text-[22px] font-black tracking-tight text-zinc-900 dark:text-white pt-1">
              일시적인 오류가 발생했어요
            </h1>
            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              페이지를 불러오는 중 예상치 못한 문제가 발생했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
          </div>

          {error?.message && (
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.06] text-left">
              <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-1">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full h-11 rounded-full bg-[#C4FF00] text-black text-[13px] font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer shadow-xs"
            >
              <RotateCw className="w-4 h-4 stroke-[2.5]" />
              <span>다시 시도하기</span>
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
