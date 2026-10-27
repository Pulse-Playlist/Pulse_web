export type GenreTag = 'band' | 'kpop' | 'rock' | 'hiphop' | 'edm' | 'pop' | 'jpop';

export type AppLanguage = 'ko' | 'en';

export interface Song {
  title: string;
  artist: string;
  title_ko?: string;
  title_en?: string;
  artist_ko?: string;
  artist_en?: string;
  normalized_key: string;
  album: string | null;
  cover_url: string | null;
  duration_sec: number;
  genre_tag: GenreTag;
  raw_bpm: number;
  running_bpm: number;
  cadence_mode: 'native' | 'double_time' | 'half_time' | string;
  deezer_bpm: number | null;
  /** Octave-related alternative tempo (x2 or x0.5 of raw_bpm) when the tempo is ambiguous, otherwise null. */
  bpm_alt?: number | null;
  /** Probability (0~1) the tempo resolver assigns to raw_bpm. */
  bpm_confidence?: number | null;
  /** Which pipeline produced raw_bpm (e.g. 'ens_v1'). */
  bpm_source?: string | null;
  beat_clarity: number;
  beat_salience: number;
  timing_stability: number;
  energy_rms: number;
  running_score: number;
  popularity_score?: number;
  artist_track_rank?: number;
  preview_url: string | null;
  itunes_track_id?: number | null;
  deezer_track_id?: number | null;
  melon_song_id?: number | null;
  bugs_track_id?: number | null;
  source?: string;
}

export function getSongTitle(song: Song, lang: AppLanguage = 'ko'): string {
  if (lang === 'en') {
    return song.title_en || song.title || '';
  }
  return song.title_ko || song.title || '';
}

export function getSongArtist(song: Song, lang: AppLanguage = 'ko'): string {
  if (lang === 'en') {
    return song.artist_en || song.artist || '';
  }
  return song.artist_ko || song.artist || '';
}

export interface SavedPlaylist {
  id: string;
  name: string;
  author: string;
  bpm: number;
  categories: GenreTag[];
  songs: Song[];
  likes: number;
  createdAt: string;
}

export interface SongsResponse {
  total: number;
  category_counts: Record<string, number>;
  bpm_min: number;
  bpm_max: number;
  bpm_avg: number;
  songs: Song[];
}
