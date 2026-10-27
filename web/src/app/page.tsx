'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Song, GenreTag, SongsResponse, AppLanguage, SavedPlaylist, getSongTitle } from '@/types/song';
import { generatePlaylist, getRecommendedSongs } from '@/lib/playlistGenerator';
import { HomeScreen } from '@/components/HomeScreen';
import { BpmScreen } from '@/components/BpmScreen';
import { TapTempoScreen } from '@/components/TapTempoScreen';
import { CategoryScreen } from '@/components/CategoryScreen';
import { ArtistSelectScreen } from '@/components/ArtistSelectScreen';
import { PlaylistScreen } from '@/components/PlaylistScreen';
import { MiniPlayerDock } from '@/components/MiniPlayerDock';
import { Toast, ToastMessage } from '@/components/Toast';

type Step = 'home' | 'bpm' | 'tap' | 'category' | 'artists' | 'playlist';

export default function Page() {
  // Navigation & Step state
  const [step, setStep] = useState<Step>('home');

  // Songs dataset state
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);

  // Community Feed Playlists
  const [communityPlaylists, setCommunityPlaylists] = useState<SavedPlaylist[]>([]);

  // User input settings
  const [targetBpm, setTargetBpm] = useState<number>(160);
  const [selectedCategories, setSelectedCategories] = useState<GenreTag[]>(['hiphop', 'rock', 'band']);
  const [preferredArtists, setPreferredArtists] = useState<string[]>([]);

  // Playlist & Recommendation state
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [customPlaylistName, setCustomPlaylistName] = useState<string>('');

  // Continuous playback state
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(true);

  // Dark / Light Theme state
  const [isDark, setIsDark] = useState<boolean>(true);

  // Korean / English Language State
  const [lang, setLang] = useState<AppLanguage>('ko');

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
  const langRef = useRef<AppLanguage>(lang);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentPlayingSongRef.current = currentPlayingSong;
  }, [currentPlayingSong]);

  useEffect(() => {
    isContinuousPlayRef.current = isContinuousPlay;
  }, [isContinuousPlay]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

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

  // Initialize language from localStorage
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem('pulse_lang');
      if (storedLang === 'en' || storedLang === 'ko') {
        setLang(storedLang);
      }
      const storedArtists = localStorage.getItem('pulse_preferred_artists');
      if (storedArtists) {
        const parsed = JSON.parse(storedArtists);
        if (Array.isArray(parsed)) {
          setPreferredArtists(parsed.filter((x) => typeof x === 'string'));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleArtist = useCallback((artistName: string) => {
    setPreferredArtists((prev) => {
      const next = prev.includes(artistName)
        ? prev.filter((a) => a !== artistName)
        : [...prev, artistName];
      try {
        localStorage.setItem('pulse_preferred_artists', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const handleClearArtists = useCallback(() => {
    setPreferredArtists([]);
    try {
      localStorage.removeItem('pulse_preferred_artists');
    } catch {
      // Ignore
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

  const handleToggleLang = () => {
    setLang((prev) => {
      const next: AppLanguage = prev === 'ko' ? 'en' : 'ko';
      try {
        localStorage.setItem('pulse_lang', next);
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
        showToast(
          langRef.current === 'ko'
            ? '이 곡은 미리듣기를 지원하지 않습니다'
            : 'Preview not available for this track',
          'info'
        );
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
                const title = getSongTitle(nextSong, langRef.current);
                showToast(
                  langRef.current === 'ko' ? `▶️ 다음 곡: ${title}` : `▶️ Next: ${title}`,
                  'info'
                );
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
      showToast(
        langRef.current === 'ko'
          ? '미리듣기 음원을 재생할 수 없습니다'
          : 'Could not stream preview audio',
        'warning'
      );
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

  // Fetch community playlists
  useEffect(() => {
    async function loadCommunityPlaylists() {
      try {
        const res = await fetch('/api/playlists');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.playlists)) {
            setCommunityPlaylists(data.playlists);
          }
        }
      } catch (err) {
        console.warn('Failed to load community playlists:', err);
      }
    }
    loadCommunityPlaylists();
  }, []);

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
            setCustomPlaylistName(
              langRef.current === 'ko' ? `PULSE ${activeBpm} BPM 러닝 믹스` : `PULSE ${activeBpm} BPM Mix`
            );
            setStep('playlist');
            showToast(
              langRef.current === 'ko'
                ? `공유받은 ${activeBpm} BPM 러닝 믹스를 열었어요!`
                : `Loaded shared ${activeBpm} BPM running mix!`,
              'success'
            );
          }
        }
      } catch (err) {
        console.error('Failed to load songs:', err);
        showToast(
          langRef.current === 'ko'
            ? '곡 목록을 불러오지 못했습니다. 다시 시도해 주세요.'
            : 'Failed to load songs database.',
          'warning'
        );
      } finally {
        setIsLoadingSongs(false);
      }
    }
    loadSongs();
  }, [showToast]);

  // Open community playlist from feed directly into PlaylistScreen
  const handleSelectCommunityPlaylist = (selected: SavedPlaylist) => {
    setTargetBpm(selected.bpm);
    setSelectedCategories(selected.categories);
    setPlaylist(selected.songs);
    setCustomPlaylistName(selected.name);
    setRecommendedSongs(
      getRecommendedSongs(allSongs, selected.bpm, selected.categories, selected.songs, 8)
    );
    setStep('playlist');
    showToast(
      lang === 'ko'
        ? `"${selected.name}" 플레이리스트를 열었어요!`
        : `Loaded "${selected.name}" playlist!`,
      'success'
    );
  };

  // Like community playlist via PATCH /api/playlists
  const handleLikePlaylist = async (id: string) => {
    setCommunityPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );

    try {
      await fetch('/api/playlists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.warn('Failed to PATCH likes:', err);
    }
  };

  // When a playlist is saved in PlaylistScreen, update local community feed
  const handleSavedToFeed = (saved: SavedPlaylist) => {
    setCommunityPlaylists((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
  };

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
        showToast(
          lang === 'ko' ? '최대 3개까지 선택할 수 있어요' : 'You can select up to 3 genres',
          'warning'
        );
        return prev;
      }
      return [...prev, cat];
    });
  };

  // Generate 30-song playlist
  const handleGeneratePlaylist = () => {
    if (!selectedCategories.length) {
      showToast(
        lang === 'ko' ? '장르를 1개 이상 선택해 주세요' : 'Please select at least 1 genre',
        'warning'
      );
      return;
    }

    const newPlaylist = generatePlaylist(allSongs, targetBpm, selectedCategories, preferredArtists);
    const recs = getRecommendedSongs(allSongs, targetBpm, selectedCategories, newPlaylist, 8, preferredArtists);

    setPlaylist(newPlaylist);
    setRecommendedSongs(recs);
    setCustomPlaylistName(
      lang === 'ko' ? `PULSE ${targetBpm} BPM 러닝 믹스` : `PULSE ${targetBpm} BPM Mix`
    );
    setStep('playlist');
    showToast(
      preferredArtists.length > 0
        ? lang === 'ko'
          ? `최애 아티스트 ${preferredArtists.length}팀 취향이 반영된 ${targetBpm} BPM ${newPlaylist.length}곡 완성!`
          : `Generated ${newPlaylist.length} tracks at ${targetBpm} BPM with your favorite artists!`
        : lang === 'ko'
        ? `${targetBpm} BPM ${newPlaylist.length}곡 플레이리스트가 완성되었어요!`
        : `Generated ${newPlaylist.length} tracks at ${targetBpm} BPM!`,
      'success'
    );
  };

  // Re-shuffle playlist handler
  const handleReshuffle = () => {
    const newPlaylist = generatePlaylist(allSongs, targetBpm, selectedCategories, preferredArtists);
    const recs = getRecommendedSongs(allSongs, targetBpm, selectedCategories, newPlaylist, 10, preferredArtists);
    setPlaylist(newPlaylist);
    setRecommendedSongs(recs);
    showToast(
      lang === 'ko'
        ? `${targetBpm}±2 BPM ${newPlaylist.length}곡으로 다시 섞었어요!`
        : `Reshuffled ${newPlaylist.length} tracks at ${targetBpm}±2 BPM!`,
      'success'
    );
  };

  // Refresh recommendations handler
  const handleRefreshRecommendations = () => {
    const recs = getRecommendedSongs(allSongs, targetBpm, selectedCategories, playlist, 10, preferredArtists);
    setRecommendedSongs(recs);
    showToast(
      lang === 'ko' ? '추천곡 목록을 새로고침했어요' : 'Refreshed recommended tracks',
      'info'
    );
  };

  // Remove song from playlist
  const handleRemoveSong = (songKey: string) => {
    const removedSong = playlist.find((s) => (s.normalized_key || s.title + s.artist) === songKey);
    if (removedSong && currentPlayingSong?.normalized_key === removedSong.normalized_key) {
      handleCloseMiniPlayer();
    }
    const updated = playlist.filter((s) => (s.normalized_key || s.title + s.artist) !== songKey);
    setPlaylist(updated);
    setRecommendedSongs(getRecommendedSongs(allSongs, targetBpm, selectedCategories, updated, 10, preferredArtists));
    showToast(
      lang === 'ko' ? '곡이 목록에서 삭제되었어요' : 'Track removed from playlist',
      'info'
    );
  };

  // Add recommended song to playlist
  const handleAddSong = (song: Song) => {
    setPlaylist((prev) => [...prev, song]);
    setRecommendedSongs((prev) =>
      prev.filter((s) => (s.normalized_key || s.title + s.artist) !== (song.normalized_key || song.title + song.artist))
    );
    const songTitle = getSongTitle(song, lang);
    showToast(
      lang === 'ko'
        ? `'${songTitle}' 곡이 플레이리스트에 추가되었어요!`
        : `Added '${songTitle}' to playlist!`,
      'success'
    );
  };

  // Tap tempo confirmation handler
  const handleConfirmTapBpm = (measured: number) => {
    setTargetBpm(measured);
    showToast(
      lang === 'ko' ? `${measured} BPM으로 설정되었습니다` : `Cadence set to ${measured} BPM`,
      'success'
    );
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
                lang={lang}
                onToggleLang={handleToggleLang}
                onStart={() => setStep('bpm')}
                onOpenArtistSelect={() => setStep('artists')}
                preferredArtistsCount={preferredArtists.length}
                onSelectPlaylist={handleSelectCommunityPlaylist}
                communityPlaylists={communityPlaylists}
                onLikePlaylist={handleLikePlaylist}
                totalSongsCount={allSongs.length || 14707}
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
                lang={lang}
                onToggleLang={handleToggleLang}
              />
            )}

            {step === 'tap' && (
              <TapTempoScreen
                initialBpm={targetBpm}
                onConfirmBpm={handleConfirmTapBpm}
                onBack={() => setStep('bpm')}
                isDark={isDark}
                onToggleTheme={handleToggleTheme}
                lang={lang}
                onToggleLang={handleToggleLang}
              />
            )}

            {step === 'category' && (
              <CategoryScreen
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onNext={handleGeneratePlaylist}
                onOpenArtistSelect={() => setStep('artists')}
                preferredArtists={preferredArtists}
                onBack={() => setStep('bpm')}
                isDark={isDark}
                onToggleTheme={handleToggleTheme}
                showToast={showToast}
                lang={lang}
                onToggleLang={handleToggleLang}
              />
            )}

            {step === 'artists' && (
              <ArtistSelectScreen
                allSongs={allSongs}
                targetBpm={targetBpm}
                selectedCategories={selectedCategories}
                preferredArtists={preferredArtists}
                onToggleArtist={handleToggleArtist}
                onClearArtists={handleClearArtists}
                onNext={handleGeneratePlaylist}
                onBack={() => setStep('category')}
                isDark={isDark}
                onToggleTheme={handleToggleTheme}
                lang={lang}
                onToggleLang={handleToggleLang}
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
                lang={lang}
                onToggleLang={handleToggleLang}
                initialPlaylistName={customPlaylistName}
                onSavedToFeed={handleSavedToFeed}
                preferredArtists={preferredArtists}
                onOpenArtistSelect={() => setStep('artists')}
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
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
