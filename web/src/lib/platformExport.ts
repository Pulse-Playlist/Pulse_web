import { Song, GenreTag } from '@/types/song';
import { getSongBpm } from './playlistGenerator';

export type PlatformKey = 'youtube_music' | 'spotify' | 'apple_music' | 'melon' | 'bugs';

/**
 * Direct platform song link resolvers
 */

export function getAppleMusicUrl(song: Song): string {
  if (song.itunes_track_id) {
    return `https://music.apple.com/kr/song/${song.itunes_track_id}`;
  }
  return `https://music.apple.com/kr/search?term=${encodeURIComponent(song.artist + ' ' + song.title)}`;
}

export function getYouTubeMusicUrl(song: Song): string {
  return `https://music.youtube.com/search?q=${encodeURIComponent(song.artist + ' ' + song.title)}`;
}

export function getSpotifyUrl(song: Song): string {
  return `https://open.spotify.com/search/${encodeURIComponent(song.artist + ' ' + song.title)}`;
}

export function getMelonUrl(song: Song): string {
  if (song.melon_song_id) {
    return `https://www.melon.com/song/detail.htm?songId=${song.melon_song_id}`;
  }
  return `https://www.melon.com/search/total/index.htm?q=${encodeURIComponent(song.artist + ' ' + song.title)}`;
}

export function getBugsUrl(song: Song): string {
  if (song.bugs_track_id) {
    return `https://music.bugs.co.kr/track/${song.bugs_track_id}`;
  }
  return `https://music.bugs.co.kr/search/integrated?q=${encodeURIComponent(song.artist + ' ' + song.title)}`;
}

export function getPlatformTrackUrl(platform: PlatformKey, song: Song): string {
  switch (platform) {
    case 'youtube_music':
      return getYouTubeMusicUrl(song);
    case 'spotify':
      return getSpotifyUrl(song);
    case 'apple_music':
      return getAppleMusicUrl(song);
    case 'melon':
      return getMelonUrl(song);
    case 'bugs':
      return getBugsUrl(song);
  }
}

export interface PlatformMetadata {
  key: PlatformKey;
  name: string;
  koreanName: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  homeUrl: string;
  description: string;
  getTrackUrl: (song: Song) => string;
}

export const PLATFORMS: Record<PlatformKey, PlatformMetadata> = {
  apple_music: {
    key: 'apple_music',
    name: 'Apple Music',
    koreanName: '애플 뮤직',
    badge: '원클릭 공식 연동',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    accentColor: '#FA243C',
    homeUrl: 'https://music.apple.com/kr',
    description: 'MusicKit JS로 내 보관함에 즉시 플레이리스트 생성',
    getTrackUrl: getAppleMusicUrl,
  },
  youtube_music: {
    key: 'youtube_music',
    name: 'YouTube Music',
    koreanName: '유튜브 뮤직',
    badge: '인기 1위',
    badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30',
    accentColor: '#FF0000',
    homeUrl: 'https://music.youtube.com',
    description: 'YouTube Music 검색 및 웹 바로가기',
    getTrackUrl: getYouTubeMusicUrl,
  },
  spotify: {
    key: 'spotify',
    name: 'Spotify',
    koreanName: '스포티파이',
    badge: '글로벌 1위',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    accentColor: '#1DB954',
    homeUrl: 'https://open.spotify.com',
    description: 'Spotify 검색 및 웹 바로가기',
    getTrackUrl: getSpotifyUrl,
  },
  melon: {
    key: 'melon',
    name: 'Melon',
    koreanName: '멜론',
    badge: '국내 1위',
    badgeColor: 'bg-lime-500/10 text-lime-500 border-lime-500/30',
    accentColor: '#00CD3C',
    homeUrl: 'https://www.melon.com',
    description: '멜론 검색 및 곡 ID 연동 바로가기',
    getTrackUrl: getMelonUrl,
  },
  bugs: {
    key: 'bugs',
    name: 'Bugs',
    koreanName: '벅스',
    badge: '고음질 FLAC',
    badgeColor: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    accentColor: '#FF3B30',
    homeUrl: 'https://music.bugs.co.kr',
    description: '벅스 검색 및 트랙 ID 연동 바로가기',
    getTrackUrl: getBugsUrl,
  },
};

export const CONVERTER_SERVICES = [
  {
    name: 'TuneMyMusic 무료 변환기',
    badge: '추천 No.1',
    description: '복사된 트랙 텍스트를 붙여넣으면 YouTube Music / Spotify / Apple Music에 10초 만에 플리가 생성됩니다.',
    url: 'https://www.tunemymusic.com/transfer',
    actionText: 'TuneMyMusic에서 플리 만들기',
  },
  {
    name: 'Soundiiz 텍스트 변환기',
    badge: 'CSV 지원',
    description: 'CSV 파일 업로드 또는 텍스트 입력으로 모든 음원 플랫폼 간에 플레이리스트를 변환합니다.',
    url: 'https://soundiiz.com',
    actionText: 'Soundiiz 열기',
  },
  {
    name: 'Spotlistr 변환기',
    badge: 'Spotify 전용',
    description: '텍스트 박스에 30곡 붙여넣기로 스포티파이 공개/비공개 플레이리스트를 즉시 생성합니다.',
    url: 'https://www.spotlistr.com/search/textbox',
    actionText: 'Spotlistr 열기',
  },
];

/**
 * Clean `Artist - Title` lines (standard format accepted by TuneMyMusic, Soundiiz, Spotlistr, and Melon/Spotify text importers).
 */
export function formatTracklistForImport(playlist: Song[]): string {
  return playlist.map((song) => `${song.artist} - ${song.title}`).join('\n');
}

/**
 * Detailed tracklist formatted with index, BPM, and genre.
 */
export function formatTracklistDetailed(playlist: Song[], targetBpm: number): string {
  const lines = playlist.map((song, idx) => {
    const bpm = getSongBpm(song);
    return `${idx + 1}. ${song.artist} - ${song.title} (${bpm} BPM)`;
  });
  return `🏃 PULSE RUN ${targetBpm} BPM 러닝 믹스 (${playlist.length}곡)\n\n${lines.join('\n')}\n\nhttps://pulserun.app`;
}

/**
 * Escapes a CSV column value.
 */
function escapeCsv(val: string | number | null | undefined): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Downloads `PULSE_${targetBpm}BPM_Playlist.csv` with columns:
 * Title,Artist,Album,BPM,Genre,AppleMusicURL,YouTubeMusicURL
 * Includes UTF-8 BOM so Excel opens it with perfect Korean encoding.
 */
export function downloadPlaylistCsv(playlist: Song[], targetBpm: number): void {
  const headers = ['Title', 'Artist', 'Album', 'BPM', 'Genre', 'AppleMusicURL', 'YouTubeMusicURL'];
  const rows = playlist.map((song) => [
    escapeCsv(song.title),
    escapeCsv(song.artist),
    escapeCsv(song.album || ''),
    escapeCsv(getSongBpm(song)),
    escapeCsv(song.genre_tag),
    escapeCsv(getAppleMusicUrl(song)),
    escapeCsv(getYouTubeMusicUrl(song)),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, `PULSE_${targetBpm}BPM_Playlist.csv`);
}

/**
 * Downloads `.m3u8` playlist file.
 */
export function downloadPlaylistM3u(playlist: Song[], targetBpm: number): void {
  const header = `#EXTM3U\n#PLAYLIST:PULSE ${targetBpm} BPM Running Playlist\n`;
  const tracks = playlist
    .map((song) => {
      const dur = song.duration_sec || 210;
      const title = `${song.artist} - ${song.title}`;
      const url = song.preview_url || getYouTubeMusicUrl(song);
      return `#EXTINF:${dur},${title}\n${url}`;
    })
    .join('\n');

  const content = header + tracks;
  const blob = new Blob([content], { type: 'audio/x-mpegurl;charset=utf-8;' });
  triggerBrowserDownload(blob, `PULSE_${targetBpm}BPM_Playlist.m3u8`);
}

/**
 * Generates a shareable URL with query params `?bpm=${targetBpm}&cats=${categories.join(',')}`
 * so sharing the link opens that exact playlist config!
 */
export function getShareableUrl(targetBpm: number, categories: GenreTag[]): string {
  const cats = categories.join(',');
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?bpm=${targetBpm}&cats=${encodeURIComponent(cats)}`;
  }
  return `https://pulserun.app/?bpm=${targetBpm}&cats=${encodeURIComponent(cats)}`;
}

/**
 * Helper to trigger file download in browser
 */
function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
