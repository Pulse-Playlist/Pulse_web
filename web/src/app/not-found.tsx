import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-zinc-200 dark:bg-[#070709] flex justify-center items-start select-none">
      <div className="max-w-[430px] w-full mx-auto min-h-dvh overflow-x-hidden shadow-2xl border-x border-zinc-300/80 dark:border-zinc-800/80 bg-white dark:bg-[#000000] relative flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full rounded-[28px] p-6 bg-[#F5F5F7] dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-xl flex flex-col items-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center">
            <Compass className="w-8 h-8 text-[#3B82F6]" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6]">
              404 NOT FOUND
            </span>
            <h1 className="text-[22px] font-black tracking-tight text-zinc-900 dark:text-white pt-1">
              코스를 이탈했어요
            </h1>
            <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
              <br />
              홈으로 돌아가 러닝 플레이리스트를 만들어 보세요.
            </p>
          </div>

          <Link
            href="/"
            className="w-full h-11 rounded-full bg-[#C4FF00] text-black text-[13px] font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xs"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
