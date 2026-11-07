'use client';

import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen antialiased bg-[#070709] text-white flex justify-center items-center p-5">
        <div className="max-w-[390px] w-full rounded-[28px] p-6 bg-[#141416] border border-white/[0.1] shadow-2xl flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-[#FF4B4B]" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF4B4B]/15 text-[#FF4B4B]">
              CRITICAL ERROR
            </span>
            <h1 className="text-[21px] font-black tracking-tight text-white pt-1">
              앱을 불러올 수 없습니다
            </h1>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              네트워크 상태를 확인하거나 페이지를 새로고침 해주세요.
            </p>
          </div>

          {error?.message && (
            <div className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/5 text-left">
              <p className="text-[11px] font-mono text-zinc-400 truncate">{error.message}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => reset()}
            className="w-full h-11 rounded-full bg-[#C4FF00] text-black text-[13px] font-black flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            <RotateCw className="w-4 h-4 stroke-[2.5]" />
            <span>새로고침</span>
          </button>
        </div>
      </body>
    </html>
  );
}
