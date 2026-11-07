import { Song } from '@/types/song';

// Default publishable Supabase configuration (safe for browser & server; protected by Supabase RLS)
export const DEFAULT_SUPABASE_URL = 'https://imirpbaghyveiujjytrp.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_JVjucS8DqbA_XCF0amgm0w_WYxHPH3V';

export function getSupabaseConfig(): { url: string; key: string } {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).replace(/\/$/, '');

  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}

export function getSupabaseHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: key,
    Accept: 'application/json',
  };
  if (!key.startsWith('sb_')) {
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

const SONG_SELECT_COLUMNS =
  'id,title,artist,normalized_key,album,cover_url,duration_sec,genre_tag,raw_bpm,running_bpm,running_score,preview_url,itunes_track_id,source';

/**
 * Normalizes a raw Supabase row (unpacking the JSON metadata stored in `source`) into a clean `Song` object.
 */
export function normalizeSupabaseSongRow(
  row: Song,
  localFallback?: Song
): Song {
  let meta: Record<string, unknown> = {};
  if (typeof row.source === 'string' && row.source.startsWith('{')) {
    try {
      meta = JSON.parse(row.source);
    } catch {
      // ignore malformed JSON
    }
  }

  return {
    ...row,
    title: row.title,
    artist: row.artist,
    normalized_key: row.normalized_key,
    album: row.album ?? null,
    cover_url: row.cover_url ?? null,
    duration_sec: row.duration_sec ?? 0,
    raw_bpm: row.raw_bpm ?? 0,
    running_bpm: row.running_bpm ?? 0,
    cadence_mode: row.cadence_mode ?? 'native',
    deezer_bpm: row.deezer_bpm ?? null,
    beat_clarity: row.beat_clarity ?? 1,
    beat_salience: row.beat_salience ?? 1,
    timing_stability: row.timing_stability ?? 1,
    energy_rms: row.energy_rms ?? 0.1,
    running_score: row.running_score ?? 75,
    preview_url: row.preview_url ?? null,
    itunes_track_id: row.itunes_track_id ?? null,
    source: (meta.src as string) || 'apple_music_kr',
    genre_tag:
      (meta.g as Song['genre_tag']) ||
      localFallback?.genre_tag ||
      row.genre_tag,
    popularity_score:
      (typeof meta.pop === 'number' ? meta.pop : undefined) ??
      localFallback?.popularity_score ??
      row.popularity_score ??
      row.running_score,
    artist_track_rank:
      (typeof meta.rank === 'number' ? meta.rank : undefined) ??
      localFallback?.artist_track_rank ??
      row.artist_track_rank,
    title_ko:
      (meta.t_ko as string) ||
      row.title_ko ||
      localFallback?.title_ko ||
      row.title,
    title_en:
      (meta.t_en as string) ||
      row.title_en ||
      localFallback?.title_en ||
      row.title,
    artist_ko:
      (meta.a_ko as string) ||
      row.artist_ko ||
      localFallback?.artist_ko ||
      row.artist,
    artist_en:
      (meta.a_en as string) ||
      row.artist_en ||
      localFallback?.artist_en ||
      row.artist,
  };
}

let clientSongsCache: Song[] | null = null;
let clientFetchPromise: Promise<Song[]> | null = null;

/**
 * Fetches all songs directly from Supabase REST API in parallel batches.
 * Bypasses Vercel Serverless Function's 4.5MB response body limit (`FUNCTION_PAYLOAD_TOO_LARGE`)
 * and streams an initial batch via `onProgress` so the UI renders artists & songs immediately.
 */
export async function fetchAllSongsFromSupabase(
  onProgress?: (partialSongs: Song[]) => void,
  localByKey?: Map<string, Song>
): Promise<Song[]> {
  if (typeof window !== 'undefined' && clientSongsCache && clientSongsCache.length > 0) {
    onProgress?.(clientSongsCache);
    return clientSongsCache;
  }

  if (typeof window !== 'undefined' && clientFetchPromise) {
    const res = await clientFetchPromise;
    onProgress?.(res);
    return res;
  }

  const doFetch = async (): Promise<Song[]> => {
    const { url, key } = getSupabaseConfig();
    if (!url || !key) return [];

    const headers = getSupabaseHeaders(key);
    const fetchPage = async (offset: number): Promise<Song[]> => {
      const endpoint = `${url}/rest/v1/songs?select=${SONG_SELECT_COLUMNS}&order=id.asc&offset=${offset}&limit=1000`;
      const res = await fetch(endpoint, { headers, cache: 'no-store' });
      if (!res.ok) return [];
      const rows = await res.json();
      if (!Array.isArray(rows)) return [];
      return (rows as Song[]).map((r) =>
        normalizeSupabaseSongRow(
          r,
          r.normalized_key ? localByKey?.get(r.normalized_key) : undefined
        )
      );
    };

    // Wave 1: Fetch first 6,000 songs immediately for sub-second initial artist & playlist readiness
    const wave1Offsets = Array.from({ length: 6 }, (_, i) => i * 1000);
    const wave1Pages = await Promise.all(wave1Offsets.map(fetchPage));
    const wave1Songs = wave1Pages.flat();

    if (wave1Songs.length === 0) {
      return [];
    }

    if (onProgress && wave1Songs.length > 0) {
      onProgress(wave1Songs);
    }

    // Wave 2: Fetch remaining pages (6,000 ~ 25,000) in parallel
    const wave2Offsets = Array.from({ length: 19 }, (_, i) => (i + 6) * 1000);
    const wave2Pages = await Promise.all(wave2Offsets.map(fetchPage));
    const allSongs = [...wave1Songs, ...wave2Pages.flat()];

    if (typeof window !== 'undefined' && allSongs.length > 0) {
      clientSongsCache = allSongs;
    }

    return allSongs;
  };

  if (typeof window !== 'undefined') {
    clientFetchPromise = doFetch().finally(() => {
      clientFetchPromise = null;
    });
    return clientFetchPromise;
  }

  return doFetch();
}
