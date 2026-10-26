'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowUpDown, Disc3, AlertCircle } from 'lucide-react';
import { Song, SongsResponse } from '@/types/song';
import { getMetronome, MetronomeSoundType, PulseMetronome } from '@/lib/metronome';
import { StatsHeader } from '@/components/StatsHeader';
import { CategoryTabs, CategoryKey } from '@/components/CategoryTabs';
import { CadenceFilter } from '@/components/CadenceFilter';
import { TrackCard } from '@/components/TrackCard';
import { PlayerDock } from '@/components/PlayerDock';
import { PlaylistDrawer } from '@/components/PlaylistDrawer';

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [category, setCategory] = useState<CategoryKey>('all');
  const [cadenceFilterEnabled, setCadenceFilterEnabled] = useState(false);
  const [targetCadence, setTargetCadence] = useState(165);
  const [cadenceTolerance, setCadenceTolerance] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'cadence_asc' | 'cadence_desc' | 'title' | 'duration'>('score');

  // Playlist drawer state
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  // Audio preview playback state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(30);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Metronome engine state
  const metronomeRef = useRef<PulseMetronome | null>(null);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(165);
  const [metronomeMultiplier, setMetronomeMultiplier] = useState<1 | 2>(1);
  const [metronomeSound, setMetronomeSound] = useState<MetronomeSoundType>('woodblock');
  const [metronomeVolume, setMetronomeVolume] = useState(0.8);
  const [phaseOffsetMs, setPhaseOffsetMs] = useState(0);
  const [beatFlash, setBeatFlash] = useState(false);

  // Initialize Metronome and Audio element on client
  useEffect(() => {
    const metro = getMetronome();
    metronomeRef.current = metro;

    const unsubscribe = metro.onBeat(() => {
      setBeatFlash(true);
      setTimeout(() => setBeatFlash(false), 90);
    });

    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setAudioCurrentTime(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration || 30);
    });
    audio.addEventListener('ended', () => {
      setIsPlayingAudio(false);
      setAudioCurrentTime(0);
    });
    audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      setIsPlayingAudio(false);
    });

    return () => {
      unsubscribe();
      metro.stop();
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Fetch songs dataset from API
  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        const res = await fetch('/api/songs');
        if (!res.ok) {
          throw new Error(`Failed to load songs: ${res.statusText}`);
        }
        const data: SongsResponse = await res.json();
        setSongs(data.songs || []);
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch songs database');
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      band: 0,
      kpop: 0,
      rock: 0,
      hiphop: 0,
    };
    songs.forEach((s) => {
      if (s.genre_tag && counts[s.genre_tag] !== undefined) {
        counts[s.genre_tag]++;
      }
    });
    return counts;
  }, [songs]);

  const avgBpm = useMemo(() => {
    if (songs.length === 0) return 0;
    const total = songs.reduce((acc, s) => acc + (s.running_bpm || s.raw_bpm || 0), 0);
    return Math.round((total / songs.length) * 10) / 10;
  }, [songs]);

  // Audio control functions
  const playSong = (song: Song) => {
    if (!song.preview_url) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong?.normalized_key !== song.normalized_key) {
      setCurrentSong(song);
      audio.src = song.preview_url;
      audio.volume = audioVolume;
      audio.currentTime = 0;
    }

    audio.play().then(() => {
      setIsPlayingAudio(true);
    }).catch((err) => {
      console.warn('Playback failed:', err);
      setIsPlayingAudio(false);
    });
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      setAudioCurrentTime(0);
    }
  };

  const seekAudio = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioCurrentTime(time);
    }
  };

  const changeAudioVolume = (vol: number) => {
    setAudioVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Metronome control functions
  const toggleMetronome = () => {
    const metro = metronomeRef.current;
    if (!metro) return;

    if (isMetronomePlaying) {
      metro.stop();
      setIsMetronomePlaying(false);
    } else {
      metro.start(metronomeBpm, metronomeMultiplier);
      setIsMetronomePlaying(true);
    }
  };

  const syncMetronomeToSong = (song: Song) => {
    const metro = metronomeRef.current;
    if (!metro) return;

    const targetBpm = song.running_bpm || song.raw_bpm || 160;
    setMetronomeBpm(targetBpm);
    metro.setBpm(targetBpm);

    // If audio is playing for this song, align playhead
    if (currentSong?.normalized_key === song.normalized_key && isPlayingAudio) {
      metro.syncToPlayhead();
    }

    metro.start(targetBpm, metronomeMultiplier);
    setIsMetronomePlaying(true);
  };

  const setBpm = (bpm: number) => {
    const clamped = Math.max(40, Math.min(260, bpm));
    setMetronomeBpm(clamped);
    if (metronomeRef.current) {
      metronomeRef.current.setBpm(clamped);
    }
  };

  const setMultiplier = (mul: 1 | 2) => {
    setMetronomeMultiplier(mul);
    if (metronomeRef.current) {
      metronomeRef.current.setMultiplier(mul);
    }
  };

  const setSound = (sound: MetronomeSoundType) => {
    setMetronomeSound(sound);
    if (metronomeRef.current) {
      metronomeRef.current.setSoundType(sound);
    }
  };

  const setMetroVol = (vol: number) => {
    setMetronomeVolume(vol);
    if (metronomeRef.current) {
      metronomeRef.current.setVolume(vol);
    }
  };

  const nudgePhase = (deltaMs: number) => {
    if (metronomeRef.current) {
      metronomeRef.current.nudgePhase(deltaMs / 1000);
      setPhaseOffsetMs(Math.round(metronomeRef.current.phaseOffsetSec * 1000));
    }
  };

  const resetPhase = () => {
    if (metronomeRef.current) {
      metronomeRef.current.resetPhase();
      setPhaseOffsetMs(0);
    }
  };

  // Playlist handlers
  const togglePlaylistTrack = (song: Song) => {
    setPlaylist((prev) => {
      const exists = prev.some((s) => s.normalized_key === song.normalized_key);
      if (exists) {
        return prev.filter((s) => s.normalized_key !== song.normalized_key);
      }
      return [...prev, song];
    });
  };

  const removePlaylistTrack = (index: number) => {
    setPlaylist((prev) => prev.filter((_, i) => i !== index));
  };

  const movePlaylistTrack = (index: number, direction: 'up' | 'down') => {
    setPlaylist((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Filtered and Sorted Songs
  const filteredSongs = useMemo(() => {
    return songs
      .filter((s) => {
        // Category filter
        if (category !== 'all' && s.genre_tag !== category) {
          return false;
        }
        // Cadence filter
        if (cadenceFilterEnabled) {
          const bpm = s.running_bpm || s.raw_bpm;
          const minBpm = targetCadence - cadenceTolerance;
          const maxBpm = targetCadence + cadenceTolerance;
          if (bpm < minBpm || bpm > maxBpm) return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = s.title?.toLowerCase().includes(q);
          const matchArtist = s.artist?.toLowerCase().includes(q);
          const matchAlbum = s.album?.toLowerCase().includes(q);
          if (!matchTitle && !matchArtist && !matchAlbum) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return (b.running_score || 0) - (a.running_score || 0);
        }
        if (sortBy === 'cadence_asc') {
          return (a.running_bpm || 0) - (b.running_bpm || 0);
        }
        if (sortBy === 'cadence_desc') {
          return (b.running_bpm || 0) - (a.running_bpm || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'duration') {
          return (b.duration_sec || 0) - (a.duration_sec || 0);
        }
        return 0;
      });
  }, [songs, category, cadenceFilterEnabled, targetCadence, cadenceTolerance, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-36">
      {/* Top Header with Live Metrics */}
      <StatsHeader
        total={songs.length}
        categoryCounts={categoryCounts}
        avgBpm={avgBpm}
        playlistCount={playlist.length}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Category Navigation Tabs */}
        <CategoryTabs
          activeCategory={category}
          onSelectCategory={setCategory}
          counts={categoryCounts}
          total={songs.length}
        />

        {/* Cadence SPM Slider & Tolerance Controller */}
        <CadenceFilter
          enabled={cadenceFilterEnabled}
          cadence={targetCadence}
          tolerance={cadenceTolerance}
          onCadenceChange={setTargetCadence}
          onToleranceChange={setCadenceTolerance}
          onToggleEnabled={setCadenceFilterEnabled}
        />

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800/80 p-3 sm:p-4 rounded-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title, artist, or album (e.g., DAY6, NewJeans, Linkin Park)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <span className="text-xs text-zinc-400 flex items-center space-x-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-brand-500/80 cursor-pointer"
            >
              <option value="score">Running Score (Highest)</option>
              <option value="cadence_desc">Cadence (Fastest SPM)</option>
              <option value="cadence_asc">Cadence (Slowest SPM)</option>
              <option value="title">Title (A to Z)</option>
              <option value="duration">Duration (Longest)</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredSongs.length}</strong> of{' '}
            <strong className="text-zinc-300">{songs.length}</strong> verified tracks
          </span>
          {cadenceFilterEnabled && (
            <span className="text-brand-400 font-medium">
              Filtered window: {targetCadence - cadenceTolerance} – {targetCadence + cadenceTolerance} SPM
            </span>
          )}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Disc3 className="h-10 w-10 text-brand-400 animate-spin" />
            <p className="text-sm text-zinc-400">Loading PULSE analyzed music database...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Songs Grid */}
        {!loading && !error && (
          <>
            {filteredSongs.length === 0 ? (
              <div className="py-20 text-center bg-zinc-900/30 border border-zinc-800/60 rounded-2xl">
                <p className="text-sm font-semibold text-zinc-300">No tracks found matching your criteria</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try broadening your cadence tolerance or clearing the search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSongs.map((song) => (
                  <TrackCard
                    key={song.normalized_key || `${song.artist}-${song.title}`}
                    song={song}
                    isPlaying={currentSong?.normalized_key === song.normalized_key && isPlayingAudio}
                    isMetronomeActive={
                      isMetronomePlaying &&
                      Math.abs(metronomeBpm - (song.running_bpm || song.raw_bpm)) <= 1
                    }
                    isInPlaylist={playlist.some(
                      (p) => p.normalized_key === song.normalized_key
                    )}
                    onPlay={playSong}
                    onPause={pauseAudio}
                    onSyncMetronome={syncMetronomeToSong}
                    onTogglePlaylist={togglePlaylistTrack}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Player & Metronome Dock */}
      <PlayerDock
        currentSong={currentSong}
        isPlayingAudio={isPlayingAudio}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        audioVolume={audioVolume}
        onToggleAudioPlay={() => {
          if (isPlayingAudio) pauseAudio();
          else if (currentSong) playSong(currentSong);
        }}
        onStopAudio={stopAudio}
        onSeekAudio={seekAudio}
        onAudioVolumeChange={changeAudioVolume}

        isMetronomePlaying={isMetronomePlaying}
        metronomeBpm={metronomeBpm}
        metronomeMultiplier={metronomeMultiplier}
        metronomeSound={metronomeSound}
        metronomeVolume={metronomeVolume}
        phaseOffsetMs={phaseOffsetMs}
        beatFlash={beatFlash}
        onToggleMetronome={toggleMetronome}
        onSetMetronomeBpm={setBpm}
        onSetMultiplier={setMultiplier}
        onSetSound={setSound}
        onSetMetronomeVolume={setMetroVol}
        onNudgePhase={nudgePhase}
        onResetPhase={resetPhase}
      />

      {/* Running Playlist Slide-over Drawer */}
      <PlaylistDrawer
        isOpen={isPlaylistOpen}
        playlist={playlist}
        onClose={() => setIsPlaylistOpen(false)}
        onRemoveTrack={removePlaylistTrack}
        onMoveTrack={movePlaylistTrack}
        onClearPlaylist={() => setPlaylist([])}
        onPlayTrack={playSong}
      />
    </div>
  );
}
