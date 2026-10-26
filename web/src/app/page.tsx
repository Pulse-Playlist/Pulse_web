'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

  // Continuous playback state
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(true);

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

  // Synchronized refs for audio event callbacks to prevent stale closures
  const playlistRef = useRef<Song[]>(playlist);
  const currentPlayingSongRef = useRef<Song | null>(currentPlayingSong);
  const isContinuousPlayRef = useRef<boolean>(isContinuousPlay);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentPlayingSongRef.current = currentPlayingSong;
  }, [currentPlayingSong]);

  useEffect(() => {
    isContinuousPlayRef.current = isContinuousPlay;
  }, [isContinuousPlay]);

  // Toast notification helper
  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      text,
      type,
    });
  }, []);

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

  // Internal audio play helper
  const playTrackInternal = useCallback(
    (song: Song) => {
      if (!audioRef.current) return;
      const audio = audioRef.current;

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
    },
    [showToast]
  );

  // Setup Audio instance and continuous playback auto-advance listener
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 30);

    // Auto-advance to the next track when preview ends
    const onEnded = () => {
      if (isContinuousPlayRef.current && playlistRef.current.length > 0) {
        const current = currentPlayingSongRef.current;
        const list = playlistRef.current;
        const currentKey = current?.normalized_key || (current ? current.title + current.artist : '');

        const idx = list.findIndex(
          (s) => (s.normalized_key || s.title + s.artist) === currentKey
        );

        if (idx !== -1) {
          const nextIdx = idx + 1 < list.length ? idx + 1 : 0; // loop back to first song
          const nextSong = list[nextIdx];

          if (nextSong && nextSong.preview_url) {
            audio.pause();
            audio.src = nextSong.preview_url;
            audio.load();
            audio
              .play()
              .then(() => {
                setCurrentPlayingSong(nextSong);
                setIsPlayingAudio(true);
                showToast(`▶️ 다음 곡: ${nextSong.title}`, 'info');
              })
              .catch(() => {
                setIsPlayingAudio(false);
              });
            return;
          }
        }
      }

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

  // Fetch song database and handle initial URL query params (?bpm=170&cats=band,rock)
  useEffect(() => {
    async function loadSongs() {
      try {
        setIsLoadingSongs(true);
        const res = await fetch('/api/songs');
        if (!res.ok) throw new Error('곡 데이터베이스 로드 실패');
        const data: SongsResponse = await res.json();
        const songs = data.songs || [];
        setAllSongs(songs);

        // Check URL query parameters for shared playlist
        if (typeof window !== 'undefined' && songs.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const bpmParam = params.get('bpm');
          const catsParam = params.get('cats');

          if (bpmParam || catsParam) {
            let activeBpm = 160;
            if (bpmParam) {
              const parsedBpm = parseInt(bpmParam, 10);
              if (!isNaN(parsedBpm) && parsedBpm >= 60 && parsedBpm <= 220) {
                activeBpm = parsedBpm;
                setTargetBpm(activeBpm);
              }
            }

            let activeCats: GenreTag[] = ['hiphop', 'rock', 'band'];
            if (catsParam) {
              const validCats: GenreTag[] = ['hiphop', 'rock', 'band', 'kpop'];
              const parsed = catsParam
                .split(',')
                .map((c) => c.trim().toLowerCase() as GenreTag)
                .filter((c) => validCats.includes(c));
              if (parsed.length > 0) {
                activeCats = parsed.slice(0, 3);
                setSelectedCategories(activeCats);
              }
            }

            // Auto-generate playlist and direct to playlist screen
            const initialPlaylist = generatePlaylist(songs, activeBpm, activeCats);
            const recs = getRecommendedSongs(songs, activeBpm, activeCats, initialPlaylist, 8);
            setPlaylist(initialPlaylist);
            setRecommendedSongs(recs);
            setStep('playlist');
            showToast(`공유받은 ${activeBpm} BPM 러닝 믹스를 열었어요!`, 'success');
          }
        }
      } catch (err) {
        console.error('Failed to load songs:', err);
        showToast('곡 목록을 불러오지 못했습니다. 다시 시도해 주세요.', 'warning');
      } finally {
        setIsLoadingSongs(false);
      }
    }
    loadSongs();
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

    playTrackInternal(song);
  };

  // Continuous playback toggle handler on header card
  const handleToggleContinuousPlay = () => {
    setIsContinuousPlay(true);
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (currentPlayingSong) {
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
      } else if (playlist.length > 0) {
        playTrackInternal(playlist[0]);
      }
    }
  };

  // Next song in playlist
  const handlePlayNextSong = () => {
    if (!playlist.length) return;
    const current = currentPlayingSongRef.current;
    if (!current) {
      playTrackInternal(playlist[0]);
      return;
    }
    const currentKey = current.normalized_key || current.title + current.artist;
    const idx = playlist.findIndex((s) => (s.normalized_key || s.title + s.artist) === currentKey);

    if (idx !== -1 && idx + 1 < playlist.length) {
      playTrackInternal(playlist[idx + 1]);
    } else if (playlist.length > 0) {
      playTrackInternal(playlist[0]);
    }
  };

  // Prev song in playlist
  const handlePlayPrevSong = () => {
    if (!playlist.length) return;
    const current = currentPlayingSongRef.current;
    if (!current) {
      playTrackInternal(playlist[0]);
      return;
    }
    const currentKey = current.normalized_key || current.title + current.artist;
    const idx = playlist.findIndex((s) => (s.normalized_key || s.title + s.artist) === currentKey);

    if (idx > 0) {
      playTrackInternal(playlist[idx - 1]);
    } else if (playlist.length > 0) {
      playTrackInternal(playlist[playlist.length - 1]);
    }
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

        {/* 4-Step Screen Routing with Smooth Spring Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
            className="flex-1 flex flex-col w-full"
          >
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
                isContinuousPlay={isContinuousPlay}
                onPlaySong={handlePlaySong}
                onToggleContinuousPlay={handleToggleContinuousPlay}
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
          </motion.div>
        </AnimatePresence>

        {/* Floating Mini Player Dock (visible on any screen when audio is active) */}
        {currentPlayingSong && (
          <MiniPlayerDock
            currentSong={currentPlayingSong}
            isPlaying={isPlayingAudio}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={handleToggleMiniPlayerPlay}
            onClose={handleCloseMiniPlayer}
            onNext={handlePlayNextSong}
            onPrev={handlePlayPrevSong}
          />
        )}
      </div>
    </div>
  );
}
