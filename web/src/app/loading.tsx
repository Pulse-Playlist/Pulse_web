import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-zinc-200 dark:bg-[#070709] flex justify-center items-start">
      <div className="max-w-[430px] w-full mx-auto min-h-dvh overflow-x-hidden shadow-2xl border-x border-zinc-300/80 dark:border-zinc-800/80 bg-white dark:bg-[#000000] relative flex flex-col px-5 pt-5 pb-24 space-y-7 select-none">
        {/* Header Skeleton */}
        <header className="pt-2 pb-1 flex items-end justify-between">
          <div className="space-y-2">
            <div className="w-24 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800/90 animate-pulse" />
            <div className="w-16 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800/90 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800/85 animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800/85 animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800/85 animate-pulse" />
          </div>
        </header>

        {/* Top 2 Action Cards Grid Skeleton */}
        <section className="space-y-3">
          <div className="w-28 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-800/90 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((idx) => (
              <div
                key={idx}
                className="w-full rounded-[20px] p-3 bg-zinc-100 dark:bg-[#141416] border border-black/5 dark:border-white/10 space-y-3"
              >
                <div className="w-full aspect-square rounded-[14px] bg-zinc-200 dark:bg-zinc-800/80 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-[#C4FF00]/40 border-t-[#C4FF00] animate-spin" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="w-16 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="w-28 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="w-full h-3 rounded-md bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Row Track Grid Skeleton */}
        <section className="space-y-3">
          <div className="w-44 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-800/90 animate-pulse" />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((pill) => (
              <div
                key={pill}
                className="w-16 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800/80 animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-2 pt-1">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center gap-3 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-b-0"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800/90 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-36 h-3.5 rounded-md bg-zinc-200 dark:bg-zinc-800/90 animate-pulse" />
                  <div className="w-24 h-3 rounded-md bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
                </div>
                <div className="w-14 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800/80 animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* Floating Bottom Tab Bar Skeleton */}
        <div className="fixed bottom-3 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="w-full max-w-[390px] h-[56px] rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-around px-4">
            {[0, 1, 2, 3].map((tab) => (
              <div
                key={tab}
                className="w-12 h-6 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
