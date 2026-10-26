import { GenreTag, Song } from '@/types/song';

/**
 * Returns the effective BPM of a song relative to an optional targetBpm.
 * Checks both `running_bpm` and `Math.round(raw_bpm)` (as well as half/double octave)
 * so if a song matches `targetBpm ± 2` in either native or double-time cadence,
 * it returns the exact BPM value in that target window.
 */
export function getSongBpm(song: Song, targetBpm?: number): number {
  const runBpm = song.running_bpm && !isNaN(song.running_bpm) ? Math.round(song.running_bpm) : 0;
  const rawBpm = song.raw_bpm && !isNaN(song.raw_bpm) ? Math.round(song.raw_bpm) : 0;
  const doubleRaw = rawBpm > 0 ? Math.round(song.raw_bpm * 2) : 0;
  const halfRaw = rawBpm > 0 ? Math.round(song.raw_bpm / 2) : 0;

  if (typeof targetBpm === 'number' && targetBpm > 0) {
    const candidates = [runBpm, rawBpm, doubleRaw, halfRaw].filter((v) => v > 0);
    for (const c of candidates) {
      if (Math.abs(c - targetBpm) <= 2) {
        return c;
      }
    }
  }

  if (runBpm > 0) return runBpm;
  if (rawBpm > 0) return rawBpm;
  return 160;
}

/**
 * Checks whether a song strictly falls within `targetBpm ± 2`.
 */
export function isSongWithinTargetBpm(song: Song, targetBpm: number, tolerance = 2): boolean {
  const matchedBpm = getSongBpm(song, targetBpm);
  return Math.abs(matchedBpm - targetBpm) <= tolerance;
}

/**
 * Truly random Fisher-Yates shuffle.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Mandatory BPM Range Cover Image Rule:
 * 0 ~ 130 BPM (bpm <= 130): /logos/logo-green.png
 * 131 ~ 160 BPM (130 < bpm <= 160): /logos/logo-blue.png
 * 161+ BPM (bpm > 160): /logos/logo-red.png
 */
export function getPlaylistCoverUrl(bpm: number): string {
  if (bpm <= 130) {
    return '/logos/logo-green.png';
  } else if (bpm <= 160) {
    return '/logos/logo-blue.png';
  } else {
    return '/logos/logo-red.png';
  }
}

export function getBpmZoneLabel(bpm: number): { label: string; color: string } {
  if (bpm <= 130) {
    return { label: 'Green Zone (0~130 BPM)', color: 'text-lime-400 border-lime-400/40 bg-lime-400/10' };
  } else if (bpm <= 160) {
    return { label: 'Blue Zone (131~160 BPM)', color: 'text-blue-400 border-blue-400/40 bg-blue-400/10' };
  } else {
    return { label: 'Red Zone (161+ BPM)', color: 'text-red-400 border-red-400/40 bg-red-400/10' };
  }
}

/**
 * Generates a playlist strictly within `targetBpm ± 2`:
 * - Max quota per selected category:
 *   - 1 category: up to 30 tracks
 *   - 2 categories: up to 15 + 15 tracks
 *   - 3 categories: up to 10 + 10 + 10 tracks
 * - ONLY includes songs where `|BPM - targetBpm| <= 2`.
 * - If a category has fewer than the max quota (e.g., fewer than 30, 15, or 10 tracks within ±2 BPM),
 *   ONLY those matching tracks are included (never pads with mismatched BPMs).
 * - Normalizes each returned song's `running_bpm` to its matched BPM in `[targetBpm - 2, targetBpm + 2]`
 *   so every badge displays the exact matched BPM.
 */
export function generatePlaylist(
  allSongs: Song[],
  targetBpm: number,
  selectedCategories: GenreTag[]
): Song[] {
  if (!allSongs.length || !selectedCategories.length) {
    return [];
  }

  const categoryQuota = Math.floor(30 / selectedCategories.length);
  const pickedSongs: Song[] = [];
  const pickedKeys = new Set<string>();

  for (const cat of selectedCategories) {
    const matchingCategorySongs = allSongs.filter(
      (s) => s.genre_tag === cat && isSongWithinTargetBpm(s, targetBpm, 2)
    );

    const shuffled = shuffleArray(matchingCategorySongs);
    let countForCat = 0;

    for (const s of shuffled) {
      if (countForCat >= categoryQuota) break;
      const key = s.normalized_key || s.title + s.artist;
      if (pickedKeys.has(key)) continue;

      pickedKeys.add(key);
      const matchedBpm = getSongBpm(s, targetBpm);
      pickedSongs.push({
        ...s,
        running_bpm: matchedBpm,
      });
      countForCat += 1;
    }
  }

  return shuffleArray(pickedSongs);
}

/**
 * Gets recommended songs from the selected categories strictly within `targetBpm ± 2`,
 * excluding songs currently in the playlist.
 */
export function getRecommendedSongs(
  allSongs: Song[],
  targetBpm: number,
  selectedCategories: GenreTag[],
  playlistSongs: Song[],
  limit = 10
): Song[] {
  const playlistKeySet = new Set(playlistSongs.map((s) => s.normalized_key || s.title + s.artist));

  const eligible = allSongs
    .filter(
      (s) =>
        selectedCategories.includes(s.genre_tag) &&
        !playlistKeySet.has(s.normalized_key || s.title + s.artist) &&
        isSongWithinTargetBpm(s, targetBpm, 2)
    )
    .map((s) => ({
      ...s,
      running_bpm: getSongBpm(s, targetBpm),
    }));

  return shuffleArray(eligible).slice(0, limit);
}
