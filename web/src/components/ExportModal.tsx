'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCw,
  Music,
  ChevronRight,
} from 'lucide-react';
import { Song, GenreTag, AppLanguage } from '@/types/song';
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
  playlistName?: string;
  lang?: AppLanguage;
  onPlaylistNameChange?: (name: string) => void;
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
  playlistName,
  lang = 'ko',
  onPlaylistNameChange,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('youtube_music');
  const [copiedType, setCopiedType] = useState<'text' | 'link' | 'platform' | null>(null);

  const defaultName =
    playlistName ||
    (lang === 'ko' ? `PULSE ${targetBpm} BPM 러닝 믹스` : `PULSE ${targetBpm} BPM Mix`);
  const [currentName, setCurrentName] = useState<string>(defaultName);

  useEffect(() => {
    if (playlistName) {
      setCurrentName(playlistName);
    }
  }, [playlistName]);

  const handleNameChange = (val: string) => {
    setCurrentName(val);
    onPlaylistNameChange?.(val);
  };

  // Apple Music direct playlist states
  const [amStatus, setAmStatus] = useState<AppleMusicStatus>('idle');
  const [amProgressMessage, setAmProgressMessage] = useState<string>('');
  const [amResult, setAmResult] = useState<AppleMusicPlaylistResult | null>(null);

  if (!isOpen) return null;

  // Synchronized BPM Zone Color
  const zoneColor = targetBpm <= 130 ? '#C4FF00' : targetBpm <= 160 ? '#3B82F6' : '#FF4B4B';
  const isLime = targetBpm <= 130;

  // Create playlist directly in Apple Music library
  const handleCreateAppleMusic = async () => {
    if (!playlist.length) return;

    setAmStatus('authorizing');
    setAmProgressMessage(lang === 'ko' ? 'Apple ID 인증 중...' : 'Authorizing Apple ID...');

    const result = await createAppleMusicPlaylist(
      playlist,
      targetBpm,
      selectedCategories,
      (msg, step) => {
        setAmProgressMessage(msg);
        setAmStatus(step);
      },
      currentName
    );

    setAmResult(result);
    if (result.success) {
      setAmStatus('done');
      showToast(
        lang === 'ko'
          ? '애플뮤직 보관함에 플레이리스트가 생성되었어요!'
          : 'Playlist created in your Apple Music library!',
        'success'
      );
    } else {
      setAmStatus('error');
      showToast(
        result.error ||
          (lang === 'ko' ? '플레이리스트 생성에 실패했습니다.' : 'Failed to create playlist.'),
        'warning'
      );
    }
  };

  // Copy tracklist in Artist - Title format
  const handleCopyTracklist = (context: 'text' | 'platform') => {
    if (!playlist.length) return;
    const text = formatTracklistForImport(playlist, lang);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedType(context);
        showToast(
          lang === 'ko'
            ? `${playlist.length}곡 트랙 목록이 복사되었어요`
            : `Copied ${playlist.length} tracks to clipboard`,
          'success'
        );
        setTimeout(() => setCopiedType(null), 2500);
      });
    } else {
      showToast(
        lang === 'ko'
          ? '클립보드를 지원하지 않는 환경입니다'
          : 'Clipboard not supported',
        'info'
      );
    }
  };

  // Copy shareable URL
  const handleCopyShareLink = () => {
    const url = getShareableUrl(targetBpm, selectedCategories);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedType('link');
        showToast(
          lang === 'ko'
            ? '공유 링크가 클립보드에 복사되었어요'
            : 'Share link copied to clipboard',
          'success'
        );
        setTimeout(() => setCopiedType(null), 2500);
      });
    } else {
      showToast(
        lang === 'ko'
          ? '클립보드를 지원하지 않는 환경입니다'
          : 'Clipboard not supported',
        'info'
      );
    }
  };

  // Handle clicking a platform row: copy tracklist + select
  const handleSelectPlatform = (key: PlatformKey) => {
    setSelectedPlatform(key);
    handleCopyTracklist('platform');
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (!playlist.length) return;
    downloadPlaylistCsv(playlist, targetBpm, currentName, lang);
    showToast(
      lang === 'ko' ? 'CSV 다운로드를 시작합니다' : 'Downloading CSV playlist',
      'success'
    );
  };

  // Download M3U
  const handleDownloadM3u = () => {
    if (!playlist.length) return;
    downloadPlaylistM3u(playlist, targetBpm, currentName, lang);
    showToast(
      lang === 'ko' ? 'M3U8 다운로드를 시작합니다' : 'Downloading M3U8 playlist',
      'success'
    );
  };

  const isAmLoading =
    amStatus === 'loading_sdk' ||
    amStatus === 'authorizing' ||
    amStatus === 'preparing_tracks' ||
    amStatus === 'creating';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Apple HIG Sheet Container (Constrained to 430px mobile frame) */}
        <motion.div
          initial={{ y: '100%', opacity: 0.9 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 360 }}
          className="relative w-full max-w-[430px] max-h-[85dvh] flex flex-col bg-[#F5F5F7] dark:bg-[#141416] border-t sm:border border-black/[0.08] dark:border-white/[0.1] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden z-10"
        >
          {/* Top Grab Handle */}
          <div
            className="pt-2.5 pb-1 flex justify-center cursor-pointer shrink-0"
            onClick={onClose}
          >
            <div className="w-9 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Sheet Header */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.07] shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={{
                  backgroundColor: zoneColor,
                  color: isLime ? '#000000' : '#FFFFFF',
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              >
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-black tracking-tight text-zinc-900 dark:text-white truncate">
                  {lang === 'ko' ? '플레이리스트 내보내기' : 'Export Playlist'}
                </h2>
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  <span
                    className={`font-bold ${isLime ? 'text-[#3f6212] dark:text-[#C4FF00]' : ''}`}
                    style={!isLime ? { color: zoneColor } : undefined}
                  >
                    {targetBpm} BPM
                  </span>
                  <span>
                    {' '}
                    · {playlist.length}
                    {lang === 'ko' ? '곡' : ' tracks'}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'ko' ? '창 닫기' : 'Close'}
              className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Sheet Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* 1. Playlist Title Input Group */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                {lang === 'ko' ? '플레이리스트 제목' : 'Playlist Title'}
              </label>
              <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] px-3.5 py-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={lang === 'ko' ? '플레이리스트 이름 입력' : 'Enter playlist title'}
                  className="w-full bg-transparent text-[13px] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Primary Action: Apple Music Direct Library Sync */}
            <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#FA243C] text-white flex items-center justify-center shrink-0">
                    <AppleIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold text-zinc-900 dark:text-white truncate">
                      {lang === 'ko' ? 'Apple Music 보관함 연동' : 'Apple Music Library Sync'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {lang === 'ko'
                        ? '로그인 한 번으로 내 보관함에 즉시 생성'
                        : 'Create directly in your Apple Music library'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#FA243C] bg-[#FA243C]/10 px-2 py-0.5 rounded-full shrink-0">
                  MusicKit
                </span>
              </div>

              {amStatus === 'idle' && (
                <button
                  type="button"
                  onClick={handleCreateAppleMusic}
                  className="w-full h-10 px-4 rounded-xl bg-[#FA243C] hover:bg-[#e01d34] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <AppleIcon className="w-4 h-4 fill-current" />
                  <span>
                    {lang === 'ko'
                      ? 'Apple Music 보관함에 바로 생성'
                      : 'Create in Apple Music Library'}
                  </span>
                </button>
              )}

              {isAmLoading && (
                <div className="w-full h-10 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white text-[12px] font-bold flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FA243C]" />
                  <span className="truncate">
                    {amProgressMessage ||
                      (amStatus === 'authorizing'
                        ? lang === 'ko'
                          ? 'Apple ID 인증 중...'
                          : 'Authorizing Apple ID...'
                        : lang === 'ko'
                        ? `${playlist.length}곡 추가 중...`
                        : `Adding ${playlist.length} tracks...`)}
                  </span>
                </div>
              )}

              {amStatus === 'done' && (
                <div className="space-y-2">
                  <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[12px] font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="truncate">
                      {lang === 'ko'
                        ? 'Apple Music 보관함에 생성 완료!'
                        : 'Created in your Apple Music!'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={amResult?.appUrl || 'music://'}
                      className="h-9 px-3 rounded-xl bg-[#FA243C] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <AppleIcon className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'ko' ? '앱 열기' : 'Open App'}</span>
                    </a>
                    <a
                      href={amResult?.webUrl || 'https://music.apple.com/library/playlists'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[12px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                      <span>{lang === 'ko' ? '웹에서 보기' : 'Web'}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                </div>
              )}

              {amStatus === 'error' && (
                <div className="space-y-2">
                  <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span className="leading-snug">
                      {amProgressMessage ||
                        (lang === 'ko'
                          ? '플레이리스트 생성에 실패했습니다.'
                          : 'Failed to create playlist.')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateAppleMusic}
                    className="w-full h-9 px-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{lang === 'ko' ? '다시 시도' : 'Retry'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Streaming Platforms Grouped List (Clean iOS Settings Row Style) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {lang === 'ko'
                    ? '다른 스트리밍 플랫폼 (클릭 시 목록 자동 복사)'
                    : 'Other Platforms (Auto-Copies Tracklist)'}
                </span>
                {copiedType === 'platform' && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {lang === 'ko' ? '복사됨' : 'Copied'}
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.05] dark:divide-white/[0.06] overflow-hidden">
                {(['youtube_music', 'spotify', 'melon', 'bugs'] as PlatformKey[]).map((key) => {
                  const p = PLATFORMS[key];
                  const isSelected = selectedPlatform === key;

                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectPlatform(key)}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-black/[0.03] dark:bg-white/[0.05]'
                          : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.accentColor }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold text-zinc-900 dark:text-white truncate">
                              {p.name}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                              {p.koreanName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={p.homeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyTracklist('platform');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>{lang === 'ko' ? '열기' : 'Open'}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Quick Share & File Export Actions (2x2 Clean Grid) */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                {lang === 'ko' ? '빠른 복사 및 파일 저장' : 'Quick Copy & File Export'}
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Copy Tracklist Text */}
                <button
                  type="button"
                  onClick={() => handleCopyTracklist('text')}
                  className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] flex items-center gap-2.5 text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    {copiedType === 'text' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-zinc-900 dark:text-white truncate">
                      {copiedType === 'text'
                        ? lang === 'ko'
                          ? '복사 완료'
                          : 'Copied!'
                        : lang === 'ko'
                        ? '곡 목록 복사'
                        : 'Copy Tracks'}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                      {playlist.length}
                      {lang === 'ko' ? '곡 텍스트' : ' tracks text'}
                    </div>
                  </div>
                </button>

                {/* Copy Share Link */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] flex items-center gap-2.5 text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    {copiedType === 'link' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Share2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-zinc-900 dark:text-white truncate">
                      {copiedType === 'link'
                        ? lang === 'ko'
                          ? '링크 복사됨'
                          : 'Link Copied!'
                        : lang === 'ko'
                        ? '공유 링크 복사'
                        : 'Share Link'}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                      {targetBpm} BPM URL
                    </div>
                  </div>
                </button>

                {/* CSV Download */}
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] flex items-center gap-2.5 text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-zinc-900 dark:text-white truncate">
                      {lang === 'ko' ? 'CSV 다운로드' : 'Download CSV'}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                      {lang === 'ko' ? '엑셀 / 음원변환용' : 'Spreadsheet'}
                    </div>
                  </div>
                </button>

                {/* M3U8 Download */}
                <button
                  type="button"
                  onClick={handleDownloadM3u}
                  className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] flex items-center gap-2.5 text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-zinc-900 dark:text-white truncate">
                      {lang === 'ko' ? 'M3U8 다운로드' : 'Download M3U8'}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                      {lang === 'ko' ? '오프라인 플레이어' : 'Media Player'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Safe-Area Action Bar */}
          <div className="px-5 py-3 bg-white/80 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.08] shrink-0">
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: zoneColor,
                color: isLime ? '#000000' : '#FFFFFF',
              }}
              className="w-full h-11 rounded-full text-[13px] font-black shadow-xs active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center gap-1"
            >
              <span>{lang === 'ko' ? '완료' : 'Done'}</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
