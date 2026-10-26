export type GenreTag = 'band' | 'kpop' | 'rock' | 'hiphop';

export interface Song {
  title: string;
  artist: string;
  normalized_key: string;
  album: string | null;
  cover_url: string | null;
  duration_sec: number;
  genre_tag: GenreTag;
  raw_bpm: number;
  running_bpm: number;
  cadence_mode: 'native' | 'doubled' | 'halved' | string;
  deezer_bpm: number | null;
  beat_clarity: number;
  beat_salience: number;
  timing_stability: number;
  energy_rms: number;
  running_score: number;
  preview_url: string | null;
  itunes_track_id?: number | null;
  deezer_track_id?: number | null;
  melon_song_id?: number | null;
  bugs_track_id?: number | null;
  source?: string;
}

export interface SongsResponse {
  total: number;
  category_counts: Record<string, number>;
  bpm_min: number;
  bpm_max: number;
  bpm_avg: number;
  songs: Song[];
}
