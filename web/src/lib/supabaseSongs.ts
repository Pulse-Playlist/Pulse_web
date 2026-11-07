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

const IDB_NAME = 'pulse_songs_cache_db';
const IDB_STORE = 'songs_store';
const IDB_KEY = 'all_songs_v1';
const IDB_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours cache TTL
const SESSION_TOP_SONGS_KEY = 'pulse_top_songs_v1';

interface CachedSongsEntry {
  timestamp: number;
  songs: Song[];
}

function readSongsFromIndexedDB(): Promise<CachedSongsEntry | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const openReq = window.indexedDB.open(IDB_NAME, 1);
      openReq.onupgradeneeded = () => {
        const db = openReq.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      openReq.onsuccess = () => {
        try {
          const db = openReq.result;
          const tx = db.transaction(IDB_STORE, 'readonly');
          const store = tx.objectStore(IDB_STORE);
          const getReq = store.get(IDB_KEY);
          getReq.onsuccess = () => {
            resolve((getReq.result as CachedSongsEntry) || null);
          };
          getReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      openReq.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function writeSongsToIndexedDB(songs: Song[]): void {
  if (typeof window === 'undefined' || !('indexedDB' in window) || songs.length === 0) {
    return;
  }
  try {
    const openReq = window.indexedDB.open(IDB_NAME, 1);
    openReq.onupgradeneeded = () => {
      const db = openReq.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    openReq.onsuccess = () => {
      try {
        const db = openReq.result;
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        const entry: CachedSongsEntry = { timestamp: Date.now(), songs };
        store.put(entry, IDB_KEY);
      } catch {
        // ignore IndexedDB quota/write errors
      }
    };
  } catch {
    // ignore
  }
}

export function getInstantCachedSongs(): Song[] {
  if (clientSongsCache && clientSongsCache.length > 0) {
    return clientSongsCache;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(SESSION_TOP_SONGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Song[];
        }
      }
    } catch {
      // ignore
    }
  }
  return [];
}

function saveTopSongsSnapshot(songs: Song[]): void {
  if (typeof window === 'undefined' || songs.length === 0) return;
  try {
    const topSlice = [...songs]
      .sort((a, b) => (b.popularity_score || b.running_score || 0) - (a.popularity_score || a.running_score || 0))
      .slice(0, 120);
    localStorage.setItem(SESSION_TOP_SONGS_KEY, JSON.stringify(topSlice));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Fetches all songs directly from Supabase REST API in parallel batches,
 * backed by a 3-tier cache (in-memory -> localStorage instant snapshot -> IndexedDB 24h full cache).
 */
export async function fetchAllSongsFromSupabase(
  onProgress?: (partialSongs: Song[]) => void,
  localByKey?: Map<string, Song>
): Promise<Song[]> {
  if (typeof window !== 'undefined' && clientSongsCache && clientSongsCache.length > 0) {
    onProgress?.(clientSongsCache);
    return clientSongsCache;
  }

  // Emit instant localStorage top-songs snapshot immediately (0ms) so Home screen is populated on first paint
  if (typeof window !== 'undefined' && onProgress) {
    const instant = getInstantCachedSongs();
    if (instant.length > 0) {
      onProgress(instant);
    }
  }

  // Check IndexedDB full 22k song cache before hitting network
  if (typeof window !== 'undefined') {
    const idbCached = await readSongsFromIndexedDB();
    if (idbCached && Array.isArray(idbCached.songs) && idbCached.songs.length > 1000) {
      clientSongsCache = idbCached.songs;
      onProgress?.(idbCached.songs);
      // If cache is still fresh (< 24h), skip network completely!
      if (Date.now() - idbCached.timestamp < IDB_TTL_MS) {
        return idbCached.songs;
      }
    }
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
    const fetchPage = async (offset: number, limit = 1000): Promise<Song[]> => {
      const endpoint = `${url}/rest/v1/songs?select=${SONG_SELECT_COLUMNS}&order=id.asc&offset=${offset}&limit=${limit}`;
      const res = await fetch(endpoint, { headers, cache: 'force-cache' });
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

    // Wave 0: Ultra-fast 200-song initial batch so first-visit Home screen renders in <150ms
    const wave0Songs = await fetchPage(0, 200);
    if (wave0Songs.length > 0 && onProgress && !clientSongsCache) {
      onProgress(wave0Songs);
      saveTopSongsSnapshot(wave0Songs);
    }

    // Wave 1: Fetch first 6,000 songs immediately for sub-second initial artist & playlist readiness
    const wave1Offsets = Array.from({ length: 6 }, (_, i) => i * 1000);
    const wave1Pages = await Promise.all(wave1Offsets.map((off) => fetchPage(off, 1000)));
    const wave1Songs = wave1Pages.flat();

    if (wave1Songs.length === 0) {
      return [];
    }

    if (onProgress && wave1Songs.length > 0) {
      onProgress(wave1Songs);
    }

    // Wave 2: Fetch remaining pages (6,000 ~ 25,000) in parallel
    const wave2Offsets = Array.from({ length: 19 }, (_, i) => (i + 6) * 1000);
    const wave2Pages = await Promise.all(wave2Offsets.map((off) => fetchPage(off, 1000)));
    const allSongs = [...wave1Songs, ...wave2Pages.flat()];

    if (typeof window !== 'undefined' && allSongs.length > 0) {
      clientSongsCache = allSongs;
      saveTopSongsSnapshot(allSongs);
      writeSongsToIndexedDB(allSongs);
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
