import { GenreTag, Song } from '@/types/song';
import { getSongArtistMatchTier } from './artistClusters';

/**
 * Returns the true musical BPM of a song (`Math.round(raw_bpm)`).
 * Does NOT artificially double slow 80 BPM songs to 160 BPM or halve fast songs,
 * ensuring the song's actual perceived tempo matches the user's selected BPM.
 */
export function getSongBpm(song: Song): number {
  const rawBpm = song.raw_bpm && !isNaN(song.raw_bpm) ? Math.round(song.raw_bpm) : 0;
  if (rawBpm > 0) return rawBpm;
  const runBpm = song.running_bpm && !isNaN(song.running_bpm) ? Math.round(song.running_bpm) : 0;
  if (runBpm > 0) return runBpm;
  return 160;
}

/**
 * Checks whether a song's true BPM strictly falls within `targetBpm ± 2`.
 */
export function isSongWithinTargetBpm(song: Song, targetBpm: number, tolerance = 2): boolean {
  const actualBpm = getSongBpm(song);
  return Math.abs(actualBpm - targetBpm) <= tolerance;
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
 * - When `preferredArtists` are provided:
 *   - Prioritizes Tier 1 (user's selected favorite artists), then Tier 2 (related artists in similarity cluster),
 *     then Tier 3 (other tracks in the selected genres) within `targetBpm ± 2`.
 * - Normalizes each returned song's `running_bpm` to its matched BPM in `[targetBpm - 2, targetBpm + 2]`
 *   so every badge displays the exact matched BPM.
 */
export function generatePlaylist(
  allSongs: Song[],
  targetBpm: number,
  selectedCategories: GenreTag[],
  preferredArtists: string[] = []
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

    let orderedPool: Song[];
    if (preferredArtists && preferredArtists.length > 0) {
      const tier1: Song[] = [];
      const tier2: Song[] = [];
      const tier3: Song[] = [];

      for (const s of matchingCategorySongs) {
        const tier = getSongArtistMatchTier(s, preferredArtists);
        if (tier === 'selected') tier1.push(s);
        else if (tier === 'related') tier2.push(s);
        else tier3.push(s);
      }

      orderedPool = [
        ...shuffleArray(tier1),
        ...shuffleArray(tier2),
        ...shuffleArray(tier3),
      ];
    } else {
      orderedPool = shuffleArray(matchingCategorySongs);
    }

    let countForCat = 0;

    for (const s of orderedPool) {
      if (countForCat >= categoryQuota) break;
      const key = s.normalized_key || s.title + s.artist;
      if (pickedKeys.has(key)) continue;

      pickedKeys.add(key);
      const matchedBpm = getSongBpm(s);
      pickedSongs.push({
        ...s,
        running_bpm: matchedBpm,
      });
      countForCat += 1;
    }
  }

  // If preferredArtists are active, keep preferred & related tracks near the top of the playlist
  if (preferredArtists && preferredArtists.length > 0) {
    const topPreferred: Song[] = [];
    const topRelated: Song[] = [];
    const rest: Song[] = [];

    for (const s of pickedSongs) {
      const tier = getSongArtistMatchTier(s, preferredArtists);
      if (tier === 'selected') topPreferred.push(s);
      else if (tier === 'related') topRelated.push(s);
      else rest.push(s);
    }

    return [
      ...shuffleArray(topPreferred),
      ...shuffleArray(topRelated),
      ...shuffleArray(rest),
    ];
  }

  return shuffleArray(pickedSongs);
}

/**
 * Gets recommended songs from the selected categories strictly within `targetBpm ± 2`,
 * excluding songs currently in the playlist, and prioritizing preferred/related artists first.
 */
export function getRecommendedSongs(
  allSongs: Song[],
  targetBpm: number,
  selectedCategories: GenreTag[],
  playlistSongs: Song[],
  limit = 10,
  preferredArtists: string[] = []
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
      running_bpm: getSongBpm(s),
    }));

  if (preferredArtists && preferredArtists.length > 0) {
    const tier1: Song[] = [];
    const tier2: Song[] = [];
    const tier3: Song[] = [];

    for (const s of eligible) {
      const tier = getSongArtistMatchTier(s, preferredArtists);
      if (tier === 'selected') tier1.push(s);
      else if (tier === 'related') tier2.push(s);
      else tier3.push(s);
    }

    return [
      ...shuffleArray(tier1),
      ...shuffleArray(tier2),
      ...shuffleArray(tier3),
    ].slice(0, limit);
  }

  return shuffleArray(eligible).slice(0, limit);
}
