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
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Loader2,
  AlertCircle,
  RotateCw,
  Music,
} from 'lucide-react';
import { Song, GenreTag } from '@/types/song';
import {
  PLATFORMS,
  PlatformKey,
  formatTracklistForImport,
  downloadPlaylistCsv,
  downloadPlaylistM3u,
  getShareableUrl,
} from '@/lib/platformExport';
import {
  createAppleMusicPlaylist,
  AppleMusicPlaylistResult,
} from '@/lib/appleMusic';

const AppleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.02.6-2.66 1.34-.56.65-.99 1.7-0.85 2.73.99.08 1.98-.45 2.59-1.2z" />
  </svg>
);

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Song[];
  targetBpm: number;
  selectedCategories: GenreTag[];
  isDark: boolean;
  showToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
}

type AppleMusicStatus =
  | 'idle'
  | 'loading_sdk'
  | 'authorizing'
  | 'preparing_tracks'
  | 'creating'
  | 'done'
  | 'error';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  playlist,
  targetBpm,
  selectedCategories,
  showToast,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('youtube_music');
  const [copiedType, setCopiedType] = useState<'text' | 'link' | 'platform' | null>(null);

  // Apple Music direct playlist states
  const [amStatus, setAmStatus] = useState<AppleMusicStatus>('idle');
  const [amProgressMessage, setAmProgressMessage] = useState<string>('');
  const [amResult, setAmResult] = useState<AppleMusicPlaylistResult | null>(null);

  if (!isOpen) return null;

  const currentPlatformMeta = PLATFORMS[selectedPlatform];

  // Create playlist directly in Apple Music library
  const handleCreateAppleMusic = async () => {
    if (!playlist.length) return;

    setAmStatus('authorizing');
    setAmProgressMessage('Apple ID 인증 중...');

    const result = await createAppleMusicPlaylist(
      playlist,
      targetBpm,
      selectedCategories,
      (msg, step) => {
        setAmProgressMessage(msg);
        setAmStatus(step);
      }
    );

    setAmResult(result);
    if (result.success) {
      setAmStatus('done');
      showToast('애플뮤직 보관함에 플레이리스트가 생성되었어요!', 'success');
    } else {
      setAmStatus('error');
      showToast(result.error || '플레이리스트 생성에 실패했습니다.', 'warning');
    }
  };

  // Copy tracklist in Artist - Title format
  const handleCopyTracklist = (context: 'text' | 'platform') => {
    if (!playlist.length) return;
    const text = formatTracklistForImport(playlist);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedType(context);
        showToast(`${playlist.length}곡 트랙 목록이 클립보드에 복사되었어요!`, 'success');
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

  const isAmLoading =
    amStatus === 'loading_sdk' ||
    amStatus === 'authorizing' ||
    amStatus === 'preparing_tracks' ||
    amStatus === 'creating';

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
          className="relative w-full max-w-[440px] max-h-[90vh] flex flex-col bg-white dark:bg-[#121216] border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden z-10"
        >
          {/* Top Grab Handle */}
          <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
            <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Modal Header */}
          <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-black text-[#C4FF00] dark:bg-[#C4FF00] dark:text-black flex items-center justify-center shadow-sm">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                  플레이리스트 내보내기
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
            {/* ============================================================== */}
            {/* FEATURED: Apple Music Direct Library Creation (Native MusicKit) */}
            {/* ============================================================== */}
            <section className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent p-4 shadow-sm dark:border-rose-500/20 dark:from-rose-950/40 dark:via-zinc-900/60 dark:to-zinc-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <AppleIcon className="w-4 h-4 text-[#FA243C]" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    Apple Music 보관함 연동
                  </span>
                </div>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> 원클릭 자동 생성
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mb-3.5 leading-relaxed">
                Apple ID 로그인 한 번으로 <span className="font-bold text-zinc-900 dark:text-white">{targetBpm} BPM 러닝 믹스({playlist.length}곡)</span>가 내 Apple Music 보관함에 즉시 플레이리스트로 생성됩니다.
              </p>

              {/* Status Views */}
              {amStatus === 'idle' && (
                <button
                  type="button"
                  onClick={handleCreateAppleMusic}
                  className="w-full py-3 px-4 rounded-xl bg-[#FA243C] hover:bg-[#e01d34] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 active:scale-[0.98] transition-all"
                >
                  <AppleIcon className="w-4 h-4 fill-current" />
                  <span>🍎 Apple Music 내 보관함에 바로 생성</span>
                </button>
              )}

              {isAmLoading && (
                <div className="w-full py-3 px-4 rounded-xl bg-zinc-900/90 text-white dark:bg-zinc-800 text-xs font-black flex items-center justify-center gap-2.5 border border-zinc-700/50 shadow-inner">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FA243C]" />
                  <span>
                    {amProgressMessage ||
                      (amStatus === 'authorizing'
                        ? 'Apple ID 인증 중...'
                        : `애플뮤직 보관함에 ${playlist.length}곡 추가 중...`)}
                  </span>
                </div>
              )}

              {amStatus === 'done' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>내 애플뮤직에 플레이리스트가 생성되었어요!</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={amResult?.appUrl || 'music://'}
                      className="py-2.5 px-3 rounded-xl bg-[#FA243C] hover:bg-[#e01d34] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <AppleIcon className="w-3.5 h-3.5 fill-current" />
                      <span>애플뮤직 앱 열기</span>
                    </a>

                    <a
                      href={amResult?.webUrl || 'https://music.apple.com/library/playlists'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <span>웹에서 보기</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAmStatus('idle');
                        setAmResult(null);
                      }}
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
                    >
                      <RotateCw className="w-2.5 h-2.5" /> 다시 생성하기
                    </button>
                  </div>
                </div>
              )}

              {amStatus === 'error' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span className="leading-snug">{amProgressMessage || '플레이리스트 생성에 실패했습니다.'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateAppleMusic}
                    className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>다시 시도하기</span>
                  </button>
                </div>
              )}
            </section>

            {/* ============================================================== */}
            {/* Section 2: Other Streaming Platforms (Direct Link & Quick Copy) */}
            {/* ============================================================== */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-zinc-400 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    다른 플랫폼에서 듣기
                  </h3>
                </div>
                {copiedType === 'platform' && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> {playlist.length}곡 복사됨
                  </span>
                )}
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                플랫폼을 누르면 <span className="font-bold text-zinc-800 dark:text-zinc-200">전체 트랙리스트가 자동 복사</span>되며 해당 플랫폼으로 바로 이동합니다.
              </p>

              {/* Platform Grid */}
              <div className="grid grid-cols-2 gap-2">
                {(['youtube_music', 'spotify', 'melon', 'bugs'] as PlatformKey[]).map((key) => {
                  const p = PLATFORMS[key];
                  const isSelected = selectedPlatform === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPlatform(key)}
                      className={`relative flex flex-col p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-white shadow-sm'
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
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
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
              </div>

              {/* Active Platform Direct Launcher */}
              {selectedPlatform !== 'apple_music' && (
                <div className="mt-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: currentPlatformMeta.accentColor }}
                    />
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      {currentPlatformMeta.name} 바로가기
                    </span>
                  </div>

                  <a
                    href={currentPlatformMeta.homeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>앱/웹 열기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </section>

            {/* ============================================================== */}
            {/* Section 3: File Download & Link Sharing */}
            {/* ============================================================== */}
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
                    엑셀/보관용
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
                    가수 - 제목 {playlist.length}곡
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
