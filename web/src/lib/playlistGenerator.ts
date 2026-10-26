import { GenreTag, Song } from '@/types/song';

/**
 * Returns the effective BPM of a song.
 * Uses running_bpm first, falls back to Math.round(raw_bpm), then 160.
 */
export function getSongBpm(song: Song): number {
  if (song.running_bpm && !isNaN(song.running_bpm) && song.running_bpm > 0) {
    return Math.round(song.running_bpm);
  }
  if (song.raw_bpm && !isNaN(song.raw_bpm) && song.raw_bpm > 0) {
    return Math.round(song.raw_bpm);
  }
  return 160;
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
    return { label: 'Green Zone (회복/워킹 130 이하)', color: 'text-lime-400 border-lime-400/40 bg-lime-400/10' };
  } else if (bpm <= 160) {
    return { label: 'Blue Zone (기본/지구력 131~160)', color: 'text-blue-400 border-blue-400/40 bg-blue-400/10' };
  } else {
    return { label: 'Red Zone (스피드/레이스 161+)', color: 'text-red-400 border-red-400/40 bg-red-400/10' };
  }
}

/**
 * Generates an equal-ratio 30-song playlist according to the mandatory algorithm:
 * - Equal quota per selected category:
 *   - 1 category: 30 tracks
 *   - 2 categories: 15 + 15 tracks
 *   - 3 categories: 10 + 10 + 10 tracks
 * - BPM matching priority:
 *   - Priority 1: targetBpm ± 2 (Fisher-Yates shuffled)
 *   - Priority 2: targetBpm ± 5 (Fisher-Yates shuffled)
 *   - Priority 3: targetBpm ± 10 (Fisher-Yates shuffled)
 *   - Priority 4: closest BPM remaining in category
 * - Final list is Fisher-Yates shuffled across categories.
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
    const categorySongs = allSongs.filter((s) => s.genre_tag === cat);
    const catPicked: Song[] = [];

    // Helper to add songs ensuring uniqueness
    const addCandidates = (candidates: Song[], limit: number) => {
      const available = candidates.filter((s) => !pickedKeys.has(s.normalized_key || s.title + s.artist));
      const shuffled = shuffleArray(available);
      for (const s of shuffled) {
        if (catPicked.length >= limit) break;
        const key = s.normalized_key || s.title + s.artist;
        pickedKeys.add(key);
        catPicked.push(s);
      }
    };

    // Priority 1: targetBpm ± 2
    const p1 = categorySongs.filter((s) => Math.abs(getSongBpm(s) - targetBpm) <= 2);
    addCandidates(p1, categoryQuota);

    // Priority 2: targetBpm ± 5
    if (catPicked.length < categoryQuota) {
      const p2 = categorySongs.filter((s) => Math.abs(getSongBpm(s) - targetBpm) <= 5);
      addCandidates(p2, categoryQuota);
    }

    // Priority 3: targetBpm ± 10
    if (catPicked.length < categoryQuota) {
      const p3 = categorySongs.filter((s) => Math.abs(getSongBpm(s) - targetBpm) <= 10);
      addCandidates(p3, categoryQuota);
    }

    // Priority 4: Closest BPM in this category
    if (catPicked.length < categoryQuota) {
      const remaining = categorySongs
        .filter((s) => !pickedKeys.has(s.normalized_key || s.title + s.artist))
        .sort((a, b) => {
          const diffA = Math.abs(getSongBpm(a) - targetBpm);
          const diffB = Math.abs(getSongBpm(b) - targetBpm);
          if (diffA === diffB) {
            return Math.random() - 0.5;
          }
          return diffA - diffB;
        });

      addCandidates(remaining, categoryQuota);
    }

    pickedSongs.push(...catPicked);
  }

  // Shuffle the combined tracks so categories alternate/intermix naturally
  return shuffleArray(pickedSongs);
}

/**
 * Gets recommended songs from the selected categories excluding songs currently in the playlist.
 * Prioritizes targetBpm ± 2 then nearby BPMs.
 */
export function getRecommendedSongs(
  allSongs: Song[],
  targetBpm: number,
  selectedCategories: GenreTag[],
  playlistSongs: Song[],
  limit = 8
): Song[] {
  const playlistKeySet = new Set(playlistSongs.map((s) => s.normalized_key || s.title + s.artist));

  const eligible = allSongs.filter(
    (s) =>
      selectedCategories.includes(s.genre_tag) &&
      !playlistKeySet.has(s.normalized_key || s.title + s.artist)
  );

  if (!eligible.length) return [];

  // Group by BPM proximity
  const p1 = eligible.filter((s) => Math.abs(getSongBpm(s) - targetBpm) <= 2);
  const p2 = eligible.filter((s) => {
    const diff = Math.abs(getSongBpm(s) - targetBpm);
    return diff > 2 && diff <= 5;
  });
  const p3 = eligible.filter((s) => {
    const diff = Math.abs(getSongBpm(s) - targetBpm);
    return diff > 5 && diff <= 10;
  });
  const p4 = eligible.filter((s) => Math.abs(getSongBpm(s) - targetBpm) > 10);

  const pool = [
    ...shuffleArray(p1),
    ...shuffleArray(p2),
    ...shuffleArray(p3),
    ...shuffleArray(p4),
  ];

  return pool.slice(0, limit);
}
