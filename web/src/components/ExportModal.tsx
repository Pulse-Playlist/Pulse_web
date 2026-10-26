'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  ExternalLink,
  Sparkles,
  Rocket,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Song, GenreTag } from '@/types/song';
import {
  PLATFORMS,
  PlatformKey,
  CONVERTER_SERVICES,
  formatTracklistForImport,
  downloadPlaylistCsv,
  downloadPlaylistM3u,
  getShareableUrl,
} from '@/lib/platformExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Song[];
  targetBpm: number;
  selectedCategories: GenreTag[];
  isDark: boolean;
  showToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  playlist,
  targetBpm,
  selectedCategories,
  isDark,
  showToast,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('youtube_music');
  const [copiedType, setCopiedType] = useState<'text' | 'link' | 'platform' | null>(null);

  if (!isOpen) return null;

  const currentPlatformMeta = PLATFORMS[selectedPlatform];

  // Copy tracklist in Artist - Title format
  const handleCopyTracklist = (context: 'text' | 'platform') => {
    if (!playlist.length) return;
    const text = formatTracklistForImport(playlist);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedType(context);
        showToast('30곡 트랙 목록이 클립보드에 복사되었어요!', 'success');
        setTimeout(() => setCopiedType(null), 2500);
      });
    } else {
      showToast('클립보드를 지원하지 않는 환경입니다', 'info');
    }
  };

  // Copy shareable URL
  const handleCopyShareLink = () => {
    const url = getShareableUrl(targetBpm, selectedCategories);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedType('link');
        showToast('공유 링크가 클립보드에 복사되었어요!', 'success');
        setTimeout(() => setCopiedType(null), 2500);
      });
    } else {
      showToast('클립보드를 지원하지 않는 환경입니다', 'info');
    }
  };

  // Handle clicking a platform card: auto copy + set active
  const handleSelectPlatform = (key: PlatformKey) => {
    setSelectedPlatform(key);
    handleCopyTracklist('platform');
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (!playlist.length) return;
    downloadPlaylistCsv(playlist, targetBpm);
    showToast(`PULSE_${targetBpm}BPM_Playlist.csv 다운로드 시작!`, 'success');
  };

  // Download M3U
  const handleDownloadM3u = () => {
    if (!playlist.length) return;
    downloadPlaylistM3u(playlist, targetBpm);
    showToast(`PULSE_${targetBpm}BPM_Playlist.m3u8 다운로드 시작!`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-[430px] max-h-[90vh] flex flex-col bg-white dark:bg-[#121216] border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden z-10"
        >
          {/* Top Grab Handle */}
          <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
            <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Modal Header */}
          <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-black text-[#C4FF00] dark:bg-[#C4FF00] dark:text-black flex items-center justify-center shadow-sm">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                  음원사이트로 플리 내보내기
                </h2>
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {targetBpm} BPM 러닝 믹스 · 총 {playlist.length}곡
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="창 닫기"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-zinc-800 dark:text-zinc-200">
            {/* Section 1: Platform Grid */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C4FF00] shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    원클릭 음원사이트 플리 생성
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  30곡 자동 복사 지원
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                플랫폼을 선택하면 <span className="font-bold text-zinc-800 dark:text-zinc-200">30곡 트랙리스트가 즉시 복사</span>되며, 변환기에서 붙여넣기로 10초 만에 플리가 생성됩니다.
              </p>

              {/* 5 Platforms Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(PLATFORMS) as PlatformKey[]).map((key) => {
                  const p = PLATFORMS[key];
                  const isSelected = selectedPlatform === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPlatform(key)}
                      className={`relative flex flex-col p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-[#C4FF00]/10 border-[#C4FF00] dark:bg-[#C4FF00]/15 shadow-sm ring-1 ring-[#C4FF00]'
                          : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${p.badgeColor}`}
                        >
                          {p.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-[#C4FF00]" />
                        )}
                      </div>

                      <span className="text-xs font-black text-zinc-900 dark:text-white truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                        {p.koreanName}
                      </span>
                    </button>
                  );
                })}

                {/* Spotlistr Quick Box */}
                <div className="flex flex-col justify-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 text-left">
                  <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400">
                    전 플랫폼 지원
                  </span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    TuneMyMusic / Soundiiz
                  </span>
                </div>
              </div>

              {/* Active Platform Action Launchers Box */}
              <div className="mt-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: currentPlatformMeta.accentColor }}
                    />
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      {currentPlatformMeta.name} 플리 만들기
                    </span>
                  </div>

                  {copiedType === 'platform' && (
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 30곡 복사됨
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Primary: Open TuneMyMusic Transfer */}
                  <a
                    href="https://www.tunemymusic.com/transfer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-black text-[#C4FF00] dark:bg-[#C4FF00] dark:text-black text-xs font-black flex items-center justify-between shadow-sm active:scale-95 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      TuneMyMusic 무료 변환기로 10초 생성
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  {/* Secondary: Open Platform Web directly */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={currentPlatformMeta.homeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <span>{currentPlatformMeta.koreanName} 앱/웹 열기</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>

                    <a
                      href="https://soundiiz.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <span>Soundiiz 변환기</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                </div>

                {/* Micro Guide */}
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-1 leading-normal border-t border-zinc-200/60 dark:border-zinc-800">
                  👉 변환기 페이지에서 <span className="font-bold underline text-zinc-700 dark:text-zinc-300">텍스트에서 가져오기</span>를 누른 뒤 <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[9px]">Cmd/Ctrl + V</kbd>로 붙여넣으면 내 계정으로 즉시 전송됩니다.
                </p>
              </div>
            </section>

            {/* Section 2: File Download & Link Sharing */}
            <section className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Layers className="w-4 h-4 text-zinc-400 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  파일 다운로드 & 링크 공유
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. CSV Download */}
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all active:scale-95 text-center group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-white">
                    CSV 다운로드
                  </span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    일괄 가져오기용
                  </span>
                </button>

                {/* 2. Text Copy */}
                <button
                  type="button"
                  onClick={() => handleCopyTracklist('text')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all active:scale-95 text-center group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    {copiedType === 'text' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-white">
                    {copiedType === 'text' ? '복사 완료!' : '텍스트 복사'}
                  </span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    가수 - 제목 30곡
                  </span>
                </button>

                {/* 3. Share Link */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all active:scale-95 text-center group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    {copiedType === 'link' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-white">
                    {copiedType === 'link' ? '링크 복사됨!' : '공유 링크 복사'}
                  </span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    BPM/장르 설정
                  </span>
                </button>
              </div>

              {/* M3U8 Download row */}
              <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  오프라인 미디어 플레이어용 (.m3u8)
                </span>
                <button
                  type="button"
                  onClick={handleDownloadM3u}
                  className="py-1 px-2.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Download className="w-3 h-3" />
                  <span>M3U8 받기</span>
                </button>
              </div>
            </section>
          </div>

          {/* Bottom Close Button */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-black shadow-md active:scale-98 transition-transform"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
