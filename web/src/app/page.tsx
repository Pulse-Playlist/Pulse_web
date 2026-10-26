'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song, GenreTag, SongsResponse } from '@/types/song';
import { generatePlaylist, getRecommendedSongs } from '@/lib/playlistGenerator';
import { HomeScreen } from '@/components/HomeScreen';
import { BpmScreen } from '@/components/BpmScreen';
import { TapTempoScreen } from '@/components/TapTempoScreen';
import { CategoryScreen } from '@/components/CategoryScreen';
import { PlaylistScreen } from '@/components/PlaylistScreen';
import { MiniPlayerDock } from '@/components/MiniPlayerDock';
import { Toast, ToastMessage } from '@/components/Toast';

type Step = 'home' | 'bpm' | 'tap' | 'category' | 'playlist';

export default function Page() {
  // Navigation & Step state
  const [step, setStep] = useState<Step>('home');

  // Songs dataset state
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);

  // User input settings
  const [targetBpm, setTargetBpm] = useState<number>(160);
  const [selectedCategories, setSelectedCategories] = useState<GenreTag[]>(['hiphop', 'rock', 'band']);

  // Playlist & Recommendation state
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);

  // Dark / Light Theme state
  const [isDark, setIsDark] = useState<boolean>(true);

  // In-app Toast message
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Audio preview playback state
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize theme from localStorage & document class
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('pulse_theme');
      if (storedTheme === 'light') {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      } else {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        if (next) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('pulse_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('pulse_theme', 'light');
        }
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      text,
      type,
    });
  }, []);

  // Fetch song database
  useEffect(() => {
    async function loadSongs() {
      try {
        setIsLoadingSongs(true);
        const res = await fetch('/api/songs');
        if (!res.ok) throw new Error('곡 데이터베이스 로드 실패');
        const data: SongsResponse = await res.json();
        setAllSongs(data.songs || []);
      } catch (err) {
        console.error('Failed to load songs:', err);
        showToast('곡 목록을 불러오지 못했습니다. 다시 시도해 주세요.', 'warning');
      } finally {
        setIsLoadingSongs(false);
      }
    }
    loadSongs();
  }, [showToast]);

  // Audio element setup
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 30);
    const onEnded = () => {
      setIsPlayingAudio(false);
      setCurrentTime(0);
    };
    const onError = () => {
      setIsPlayingAudio(false);
      showToast('미리듣기 음원을 재생할 수 없습니다', 'warning');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, [showToast]);

  // Play / Pause song preview handler
  const handlePlaySong = (song: Song) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // Toggle pause if clicking already playing song
    if (currentPlayingSong?.normalized_key === song.normalized_key) {
      if (isPlayingAudio) {
        audio.pause();
        setIsPlayingAudio(false);
      } else {
        audio.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
      }
      return;
    }

    // Play new song
    if (!song.preview_url) {
      showToast('이 곡은 미리듣기를 지원하지 않습니다', 'info');
      return;
    }

    audio.pause();
    audio.src = song.preview_url;
    audio.load();
    audio
      .play()
      .then(() => {
        setCurrentPlayingSong(song);
        setIsPlayingAudio(true);
      })
      .catch((err) => {
        console.warn('Playback error:', err);
        setIsPlayingAudio(false);
      });
  };

  const handleToggleMiniPlayerPlay = () => {
    if (!audioRef.current || !currentPlayingSong) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
    }
  };

  const handleCloseMiniPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingAudio(false);
    setCurrentPlayingSong(null);
  };

  // Category toggle handler (max 3)
  const handleToggleCategory = (cat: GenreTag) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      }
      if (prev.length >= 3) {
        showToast('최대 3개까지 선택할 수 있어요', 'warning');
        return prev;
      }
      return [...prev, cat];
    });
  };

  // Generate 30-song playlist
  const handleGeneratePlaylist = () => {
    if (!selectedCategories.length) {
      showToast('장르를 1개 이상 선택해 주세요', 'warning');
      return;
    }

    const newPlaylist = generatePlaylist(allSongs, targetBpm, selectedCategories);
    const recs = getRecommendedSongs(allSongs, targetBpm, selectedCategories, newPlaylist, 8);

    setPlaylist(newPlaylist);
    setRecommendedSongs(recs);
    setStep('playlist');
    showToast(`${targetBpm} BPM ${newPlaylist.length}곡 플레이리스트가 완성되었어요!`, 'success');
  };

  // Re-shuffle playlist handler
  const handleReshuffle = () => {
    const newPlaylist = generatePlaylist(allSongs, targetBpm, selectedCategories);
    const recs = getRecommendedSongs(allSongs, targetBpm, selectedCategories, newPlaylist, 8);
    setPlaylist(newPlaylist);
    setRecommendedSongs(recs);
    showToast('새로운 30곡으로 다시 섞었어요!', 'success');
  };

  // Refresh recommendations handler
  const handleRefreshRecommendations = () => {
    const recs = getRecommendedSongs(allSongs, targetBpm, selectedCategories, playlist, 8);
    setRecommendedSongs(recs);
    showToast('새로운 추천곡을 불러왔어요', 'info');
  };

  // Remove song from playlist
  const handleRemoveSong = (songKey: string) => {
    setPlaylist((prev) => {
      const removedSong = prev.find((s) => (s.normalized_key || s.title + s.artist) === songKey);
      if (removedSong && currentPlayingSong?.normalized_key === removedSong.normalized_key) {
        handleCloseMiniPlayer();
      }
      const updated = prev.filter((s) => (s.normalized_key || s.title + s.artist) !== songKey);
      showToast('곡이 목록에서 삭제되었어요', 'info');
      return updated;
    });

    // Refresh recommendations to include newly available slots
    setTimeout(() => {
      setRecommendedSongs(() => {
        return getRecommendedSongs(allSongs, targetBpm, selectedCategories, playlist, 8);
      });
    }, 50);
  };

  // Add recommended song to playlist
  const handleAddSong = (song: Song) => {
    setPlaylist((prev) => [...prev, song]);
    setRecommendedSongs((prev) =>
      prev.filter((s) => (s.normalized_key || s.title + s.artist) !== (song.normalized_key || song.title + song.artist))
    );
    showToast(`'${song.title}' 곡이 플레이리스트에 추가되었어요!`, 'success');
  };

  // Tap tempo confirmation handler
  const handleConfirmTapBpm = (measured: number) => {
    setTargetBpm(measured);
    showToast(`${measured} BPM으로 설정되었습니다`, 'success');
    setStep('category');
  };

  return (
    <div className="min-h-screen w-full bg-zinc-200 dark:bg-[#070709] flex justify-center items-start transition-colors duration-200">
      {/* Centered Mobile Container strictly constrained on desktop */}
      <div className="max-w-[430px] w-full mx-auto min-h-dvh shadow-2xl border-x border-zinc-300/80 dark:border-zinc-800/80 bg-white dark:bg-[#000000] relative flex flex-col">
        {/* Global In-App Toast */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* 4-Step Screen Routing */}
        {step === 'home' && (
          <HomeScreen
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onStart={() => setStep('bpm')}
            totalSongsCount={allSongs.length || 465}
          />
        )}

        {step === 'bpm' && (
          <BpmScreen
            bpm={targetBpm}
            onChangeBpm={setTargetBpm}
            onOpenTapTempo={() => setStep('tap')}
            onNext={() => setStep('category')}
            onBack={() => setStep('home')}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {step === 'tap' && (
          <TapTempoScreen
            initialBpm={targetBpm}
            onConfirmBpm={handleConfirmTapBpm}
            onBack={() => setStep('bpm')}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {step === 'category' && (
          <CategoryScreen
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onNext={handleGeneratePlaylist}
            onBack={() => setStep('bpm')}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            showToast={showToast}
          />
        )}

        {step === 'playlist' && (
          <PlaylistScreen
            targetBpm={targetBpm}
            selectedCategories={selectedCategories}
            playlist={playlist}
            recommendedSongs={recommendedSongs}
            currentPlayingSong={currentPlayingSong}
            isPlayingAudio={isPlayingAudio}
            onPlaySong={handlePlaySong}
            onRemoveSong={handleRemoveSong}
            onAddSong={handleAddSong}
            onReshuffle={handleReshuffle}
            onRefreshRecommendations={handleRefreshRecommendations}
            onBack={() => setStep('category')}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            showToast={showToast}
          />
        )}

        {/* Floating Mini Player Dock (visible on any screen when audio is active) */}
        {currentPlayingSong && (
          <MiniPlayerDock
            currentSong={currentPlayingSong}
            isPlaying={isPlayingAudio}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={handleToggleMiniPlayerPlay}
            onClose={handleCloseMiniPlayer}
          />
        )}
      </div>
    </div>
  );
}
