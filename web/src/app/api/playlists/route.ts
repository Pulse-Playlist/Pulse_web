import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SavedPlaylist, Song, GenreTag } from '@/types/song';
import { getSongBpm } from '@/lib/playlistGenerator';

function getPlaylistsFilePaths(): { primary: string; candidates: string[] } {
  const candidates = [
    path.resolve(process.cwd(), 'public/data/playlists.json'),
    path.resolve(process.cwd(), 'web/public/data/playlists.json'),
    '/Users/appledeveloperacademy/Documents/GitHub/Pulse_web/web/public/data/playlists.json',
  ];
  const primary = fs.existsSync(path.resolve(process.cwd(), 'public'))
    ? path.resolve(process.cwd(), 'public/data/playlists.json')
    : path.resolve(process.cwd(), 'web/public/data/playlists.json');

  return { primary, candidates };
}

function loadSongsFromLocal(): Song[] {
  const songCandidates = [
    path.resolve(process.cwd(), 'public/data/songs.json'),
    path.resolve(process.cwd(), 'web/public/data/songs.json'),
    '/Users/appledeveloperacademy/Documents/GitHub/Pulse_web/web/public/data/songs.json',
    path.resolve(process.cwd(), '../crawler/data/songs.json'),
  ];
  for (const p of songCandidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Song[];
        }
      }
    } catch {
      // ignore and try next
    }
  }
  return [];
}

function generateStarterPlaylists(allSongs: Song[]): SavedPlaylist[] {
  const pickSongs = (targetBpm: number, cats: GenreTag[], count = 20): Song[] => {
    const eligible = allSongs.filter(
      (s) => cats.includes(s.genre_tag) && Math.abs(getSongBpm(s) - targetBpm) <= 2
    );
    return eligible.slice(0, count).map((s) => ({
      ...s,
      running_bpm: getSongBpm(s),
    }));
  };

  return [
    {
      id: 'pl-starter-1',
      name: '120 BPM 한강 밤산책 조깅',
      author: '새벽러너 수진',
      bpm: 120,
      categories: ['band', 'kpop'],
      songs: pickSongs(120, ['band', 'kpop'], 20),
      likes: 128,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'pl-starter-2',
      name: '130 BPM 가벼운 아침 조깅',
      author: '런린이 민수',
      bpm: 130,
      categories: ['kpop', 'band'],
      songs: pickSongs(130, ['kpop', 'band'], 20),
      likes: 94,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'pl-starter-3',
      name: '145 BPM 퇴근길 빌드업 러닝',
      author: '마라토너 지훈',
      bpm: 145,
      categories: ['hiphop', 'kpop'],
      songs: pickSongs(145, ['hiphop', 'kpop'], 20),
      likes: 215,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'pl-starter-4',
      name: '160 BPM 밴드 질주 케이던스',
      author: '홍대 러닝크루',
      bpm: 160,
      categories: ['band', 'rock'],
      songs: pickSongs(160, ['band', 'rock'], 24),
      likes: 342,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'pl-starter-5',
      name: '170 BPM 불금 인터벌 스프린트',
      author: '인터벌 킬러',
      bpm: 170,
      categories: ['rock', 'hiphop'],
      songs: pickSongs(170, ['rock', 'hiphop'], 24),
      likes: 176,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'pl-starter-6',
      name: '175 BPM 한계돌파 락&밴드',
      author: '케이던스 마스터',
      bpm: 175,
      categories: ['rock', 'band'],
      songs: pickSongs(175, ['rock', 'band'], 20),
      likes: 289,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  ];
}

function readPlaylists(): SavedPlaylist[] {
  const { candidates } = getPlaylistsFilePaths();
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as SavedPlaylist[];
        }
      }
    } catch {
      // ignore and try next
    }
  }

  // Generate starters if file does not exist or empty
  const songs = loadSongsFromLocal();
  const starters = generateStarterPlaylists(songs);
  writePlaylists(starters);
  return starters;
}

function writePlaylists(playlists: SavedPlaylist[]): void {
  const { primary, candidates } = getPlaylistsFilePaths();
  let targetPath = primary;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      targetPath = c;
      break;
    }
  }

  try {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(playlists, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write playlists.json:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bpm = searchParams.get('bpm') ? Number(searchParams.get('bpm')) : null;
    const category = searchParams.get('category');

    let playlists = readPlaylists();

    if (bpm) {
      playlists = playlists.filter((p) => Math.abs(p.bpm - bpm) <= 5);
    }
    if (category && category !== 'all') {
      playlists = playlists.filter((p) => p.categories.includes(category as GenreTag));
    }

    return NextResponse.json({
      playlists,
      total: playlists.length,
    });
  } catch (err) {
    console.error('Error fetching playlists:', err);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, author, bpm, categories, songs } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }
    if (!bpm || typeof bpm !== 'number') {
      return NextResponse.json({ error: 'Valid BPM is required' }, { status: 400 });
    }
    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json({ error: 'Songs array is required' }, { status: 400 });
    }

    const newPlaylist: SavedPlaylist = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      author: (author && typeof author === 'string' && author.trim()) || 'PULSE 러너',
      bpm,
      categories: Array.isArray(categories) && categories.length > 0 ? categories : ['band', 'rock'],
      songs,
      likes: 1, // Start with 1 like for the creator
      createdAt: new Date().toISOString(),
    };

    const currentPlaylists = readPlaylists();
    const updatedPlaylists = [newPlaylist, ...currentPlaylists];
    writePlaylists(updatedPlaylists);

    return NextResponse.json({
      playlist: newPlaylist,
      playlists: updatedPlaylists,
    });
  } catch (err) {
    console.error('Error creating playlist:', err);
    return NextResponse.json({ error: 'Failed to save playlist' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Playlist id is required' }, { status: 400 });
    }

    const playlists = readPlaylists();
    let updatedLikes = 0;
    let found = false;

    const updated = playlists.map((p) => {
      if (p.id === id) {
        found = true;
        updatedLikes = (p.likes || 0) + 1;
        return { ...p, likes: updatedLikes };
      }
      return p;
    });

    if (!found) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    writePlaylists(updated);

    return NextResponse.json({
      success: true,
      id,
      likes: updatedLikes,
    });
  } catch (err) {
    console.error('Error updating playlist likes:', err);
    return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
  }
}
