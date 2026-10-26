import { Song, GenreTag } from '@/types/song';

// Extend window object for MusicKit JS v3
declare global {
  interface Window {
    MusicKit?: any;
  }
}

export interface AppleMusicConfigStatus {
  configured: boolean;
  token?: string;
  error?: string;
}

export interface CreatePlaylistProgressCallback {
  (message: string, step: 'idle' | 'loading_sdk' | 'authorizing' | 'preparing_tracks' | 'creating' | 'done' | 'error'): void;
}

export interface AppleMusicPlaylistResult {
  success: boolean;
  playlistId?: string;
  playlistName: string;
  addedTracksCount: number;
  totalTracksCount: number;
  appUrl: string;
  webUrl: string;
  error?: string;
}

const MUSICKIT_JS_URL = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';

let scriptLoadPromise: Promise<void> | null = null;

/**
 * Dynamically loads Apple's official MusicKit JS v3 script if not already loaded.
 */
export function loadMusicKitScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('MusicKit JS can only be loaded in a browser environment'));
  }

  if (window.MusicKit) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    // Check if an existing script tag already exists in DOM
    const existingScript = document.querySelector(`script[src*="musickit.js"]`);
    if (existingScript) {
      if (window.MusicKit) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load MusicKit JS')));
      return;
    }

    const script = document.createElement('script');
    script.src = MUSICKIT_JS_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';

    const onMusicKitLoaded = () => {
      document.removeEventListener('musickitloaded', onMusicKitLoaded);
      resolve();
    };
    document.addEventListener('musickitloaded', onMusicKitLoaded);

    script.onload = () => {
      if (window.MusicKit) {
        resolve();
      }
    };

    script.onerror = () => {
      document.removeEventListener('musickitloaded', onMusicKitLoaded);
      reject(new Error('Apple MusicKit JS 스크립트를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Fetches Apple Music developer token status from our server API.
 */
export async function getAppleMusicTokenStatus(): Promise<AppleMusicConfigStatus> {
  try {
    const res = await fetch('/api/apple-music/token', { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      configured: false,
      error: err instanceof Error ? err.message : '토큰 엔드포인트에 연결할 수 없습니다.',
    };
  }
}

/**
 * Initializes MusicKit JS v3 with developer token.
 */
export async function initMusicKit(): Promise<{ music: any; developerToken: string }> {
  await loadMusicKitScript();

  if (!window.MusicKit) {
    throw new Error('MusicKit JS가 브라우저에 로드되지 않았습니다.');
  }

  const tokenStatus = await getAppleMusicTokenStatus();
  if (!tokenStatus.configured || !tokenStatus.token) {
    throw new Error(
      tokenStatus.error ||
        'Apple Music 개발자 토큰이 구성되지 않았습니다. .env에 APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY를 설정해주세요.'
    );
  }

  const developerToken = tokenStatus.token;

  let musicInstance: any = null;
  try {
    musicInstance = window.MusicKit.getInstance();
  } catch {
    // Not yet configured
  }

  if (!musicInstance) {
    musicInstance = await window.MusicKit.configure({
      developerToken,
      app: {
        name: 'PULSE RUN',
        build: '1.0.0',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : undefined,
      },
    });
  }

  return { music: musicInstance, developerToken };
}

/**
 * Authorizes user with Apple ID via MusicKit popup dialog.
 * Returns user token and music instance.
 */
export async function authorizeAppleMusic(): Promise<{ music: any; developerToken: string; musicUserToken: string }> {
  const { music, developerToken } = await initMusicKit();

  let musicUserToken: string | null = music.musicUserToken || null;

  if (!music.isAuthorized || !musicUserToken) {
    musicUserToken = await music.authorize();
  }

  if (!musicUserToken && music.musicUserToken) {
    musicUserToken = music.musicUserToken;
  }

  if (!musicUserToken) {
    throw new Error('Apple Music 로그인 및 보관함 권한 승인이 필요합니다.');
  }

  return { music, developerToken, musicUserToken };
}

/**
 * Searches Apple Music catalog by artist + title in the user's storefront.
 */
async function searchCatalogTrackId(
  song: Song,
  developerToken: string,
  storefront = 'kr'
): Promise<string | null> {
  try {
    const term = `${song.artist} ${song.title}`;
    const url = `https://api.music.apple.com/v1/catalog/${storefront}/search?term=${encodeURIComponent(
      term
    )}&types=songs&limit=1`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${developerToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const first = data?.results?.songs?.data?.[0];
      if (first?.id) {
        return String(first.id);
      }
    }
  } catch (err) {
    console.warn(`Apple Music catalog search failed for ${song.artist} - ${song.title}:`, err);
  }

  return null;
}

/**
 * Resolves valid storefront catalog track IDs for a list of songs.
 * First verifies existing itunes_track_ids in bulk against the user's storefront,
 * and falls back to storefront catalog search for any missing or region-mismatched tracks.
 */
async function resolveStorefrontTrackIds(
  playlist: Song[],
  developerToken: string,
  storefront = 'kr'
): Promise<{ id: string; type: 'songs' }[]> {
  const candidateIds = playlist
    .map((s) => (s.itunes_track_id ? String(s.itunes_track_id) : null))
    .filter((id): id is string => Boolean(id));

  const validIdsInStorefront = new Set<string>();

  if (candidateIds.length > 0) {
    try {
      const verifyUrl = `https://api.music.apple.com/v1/catalog/${storefront}/songs?ids=${candidateIds.join(',')}`;
      const res = await fetch(verifyUrl, {
        headers: {
          Authorization: `Bearer ${developerToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const foundSongs = data?.data || [];
        for (const item of foundSongs) {
          if (item?.id) {
            validIdsInStorefront.add(String(item.id));
          }
        }
      }
    } catch (err) {
      console.warn('Bulk catalog ID verification failed, falling back to individual resolution:', err);
    }
  }

  const resolvedItems: { id: string; type: 'songs' }[] = [];

  for (const song of playlist) {
    const rawId = song.itunes_track_id ? String(song.itunes_track_id) : null;
    if (rawId && validIdsInStorefront.has(rawId)) {
      resolvedItems.push({ id: rawId, type: 'songs' });
    } else {
      const searchedId = await searchCatalogTrackId(song, developerToken, storefront);
      if (searchedId) {
        resolvedItems.push({ id: searchedId, type: 'songs' });
      } else if (rawId) {
        resolvedItems.push({ id: rawId, type: 'songs' });
      }
    }
  }

  return resolvedItems;
}

/**
 * Creates a playlist directly in the user's Apple Music library!
 */
export async function createAppleMusicPlaylist(
  playlist: Song[],
  targetBpm: number,
  selectedCategories: GenreTag[] = [],
  onProgress?: CreatePlaylistProgressCallback,
  customPlaylistName?: string
): Promise<AppleMusicPlaylistResult> {
  const playlistName = (customPlaylistName && customPlaylistName.trim())
    ? customPlaylistName.trim()
    : `PULSE ${targetBpm} BPM 러닝 플레이리스트`;
  const genresStr = selectedCategories.length > 0 ? ` [${selectedCategories.join(', ').toUpperCase()}]` : '';
  const description = `PULSE RUN 맞춤 케이던스 믹스${genresStr} · ${playlist.length}곡 · https://pulserun.app`;

  try {
    onProgress?.('MusicKit JS 로딩 중...', 'loading_sdk');
    const { music, developerToken, musicUserToken } = await authorizeAppleMusic();

    onProgress?.('트랙 ID 확인 및 준비 중...', 'preparing_tracks');
    const storefront = music.storefrontId || 'kr';

    // Collect and verify storefront catalog track IDs
    const trackItems = await resolveStorefrontTrackIds(playlist, developerToken, storefront);

    onProgress?.(`애플뮤직 보관함에 ${trackItems.length}곡 플레이리스트 생성 중...`, 'creating');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${developerToken}`,
      'Music-User-Token': musicUserToken,
      'Content-Type': 'application/json',
    };

    // 1. Attempt creating the playlist with tracks in the creation payload
    const createPayload = {
      attributes: {
        name: playlistName,
        description,
      },
      relationships: {
        tracks: {
          data: trackItems,
        },
      },
    };

    let res = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
      method: 'POST',
      headers,
      body: JSON.stringify(createPayload),
    });

    let playlistId = '';

    if (res.ok) {
      const resJson = await res.json();
      playlistId = resJson?.data?.[0]?.id || '';
    } else {
      // Fallback: If creating with tracks failed (e.g. an ID was rejected by storefront),
      // create empty playlist first, then batch append tracks
      console.warn('Direct tracks payload failed, falling back to empty playlist creation...');
      const emptyPayload = {
        attributes: {
          name: playlistName,
          description,
        },
      };

      const fallbackRes = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
        method: 'POST',
        headers,
        body: JSON.stringify(emptyPayload),
      });

      if (!fallbackRes.ok) {
        const errData = await fallbackRes.text();
        throw new Error(`플레이리스트 생성에 실패했습니다: ${fallbackRes.status} ${errData}`);
      }

      const fallbackJson = await fallbackRes.json();
      playlistId = fallbackJson?.data?.[0]?.id || '';

      // Try appending tracks in batches
      if (playlistId && trackItems.length > 0) {
        try {
          await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ data: trackItems }),
          });
        } catch (appendErr) {
          console.warn('Error appending tracks to empty playlist:', appendErr);
        }
      }
    }

    onProgress?.(`✅ 내 애플뮤직에 플레이리스트가 생성되었어요!`, 'done');

    const appUrl = playlistId
      ? `music://music.apple.com/library/playlist/${playlistId}`
      : 'music://';
    const webUrl = playlistId
      ? `https://music.apple.com/library/playlist/${playlistId}`
      : 'https://music.apple.com/library/playlists';

    return {
      success: true,
      playlistId,
      playlistName,
      addedTracksCount: trackItems.length,
      totalTracksCount: playlist.length,
      appUrl,
      webUrl,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    onProgress?.(`❌ ${errorMsg}`, 'error');
    return {
      success: false,
      playlistName,
      addedTracksCount: 0,
      totalTracksCount: playlist.length,
      appUrl: 'music://',
      webUrl: 'https://music.apple.com/library/playlists',
      error: errorMsg,
    };
  }
}
