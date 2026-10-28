'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isWarning = toast.type === 'warning';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div
        className={`w-full max-w-[380px] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-200 ${
          isWarning
            ? 'bg-zinc-900/95 text-white border-amber-400/50 shadow-amber-500/10 animate-shake'
            : isSuccess
            ? 'bg-zinc-900/95 text-white border-[#C4FF00]/50 shadow-[#C4FF00]/10'
            : 'bg-zinc-900/95 text-white border-zinc-700/60'
        }`}
      >
        {isWarning && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#C4FF00] shrink-0" />}
        {!isWarning && !isSuccess && <Info className="w-5 h-5 text-zinc-300 shrink-0" />}
        <span className="text-sm font-semibold tracking-tight">{toast.text}</span>
      </div>
    </div>
  );
};
