import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { Song, SongsResponse } from '@/types/song';
import { fetchAllSongsFromSupabase } from '@/lib/supabaseSongs';

export const dynamic = 'force-dynamic';

let cachedServerSongs: Song[] | null = null;
let cachedAt = 0;

function loadLocalSongs(): Song[] {
  const candidatePaths = [
    path.resolve(process.cwd(), '../crawler/data/songs.json'),
    path.resolve(process.cwd(), 'public/data/songs.json'),
    '/Users/appledeveloperacademy/Documents/GitHub/Pulse_web/crawler/data/songs.json',
    '/Users/appledeveloperacademy/Documents/GitHub/Pulse_web/web/public/data/songs.json',
  ];

  for (const filePath of candidatePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Song[];
        }
      }
    } catch (err) {
      console.warn(`Could not read songs from ${filePath}:`, err);
    }
  }

  return [];
}

async function loadSongs(): Promise<Song[]> {
  if (cachedServerSongs && cachedServerSongs.length > 0 && Date.now() - cachedAt < 300_000) {
    return cachedServerSongs;
  }

  const localSongs = loadLocalSongs();
  const localByKey = new Map<string, Song>();
  for (const s of localSongs) {
    if (s.normalized_key) {
      localByKey.set(s.normalized_key, s);
    }
  }

  try {
    const supabaseSongs = await fetchAllSongsFromSupabase(undefined, localByKey);
    if (supabaseSongs.length >= 100) {
      cachedServerSongs = supabaseSongs;
      cachedAt = Date.now();
      return supabaseSongs;
    }
  } catch (err) {
    console.warn('Supabase fetch fallback to local songs.json:', err);
  }

  if (localSongs.length > 0) {
    cachedServerSongs = localSongs;
    cachedAt = Date.now();
  }
  return localSongs;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || searchParams.get('genre');
    const cadence = searchParams.get('cadence') ? Number(searchParams.get('cadence')) : null;
    const tolerance = searchParams.get('tolerance') ? Number(searchParams.get('tolerance')) : null;
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : null;

    const allSongs = await loadSongs();

    // Compute global category counts
    const category_counts: Record<string, number> = {
      band: 0,
      kpop: 0,
      rock: 0,
      hiphop: 0,
      edm: 0,
      pop: 0,
      jpop: 0,
    };

    let bpmSum = 0;
    let bpmMin = 999;
    let bpmMax = 0;

    for (const s of allSongs) {
      if (s.genre_tag && category_counts[s.genre_tag] !== undefined) {
        category_counts[s.genre_tag]++;
      }
      const bpm = s.raw_bpm || s.running_bpm || 0;
      if (bpm > 0) {
        bpmSum += bpm;
        if (bpm < bpmMin) bpmMin = bpm;
        if (bpm > bpmMax) bpmMax = bpm;
      }
    }

    const bpmAvg = allSongs.length > 0 ? Math.round((bpmSum / allSongs.length) * 10) / 10 : 0;

    // Filter songs if requested
    let filtered = allSongs;

    if (category && category.toLowerCase() !== 'all') {
      filtered = filtered.filter(
        (s) => s.genre_tag?.toLowerCase() === category.toLowerCase()
      );
    }

    if (cadence !== null && !isNaN(cadence) && cadence > 0) {
      const tol = tolerance !== null && !isNaN(tolerance) ? tolerance : 5;
      const minBpm = cadence - tol;
      const maxBpm = cadence + tol;
      filtered = filtered.filter((s) => {
        const bpm = s.raw_bpm || s.running_bpm;
        return bpm >= minBpm && bpm <= maxBpm;
      });
    }

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.title?.toLowerCase().includes(search) ||
          s.artist?.toLowerCase().includes(search) ||
          s.album?.toLowerCase().includes(search)
      );
    }

    const totalFiltered = filtered.length;
    if (offset > 0) {
      filtered = filtered.slice(offset);
    }
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    const response: SongsResponse & { filtered_count: number } = {
      total: allSongs.length,
      filtered_count: totalFiltered,
      category_counts,
      bpm_min: bpmMin === 999 ? 0 : bpmMin,
      bpm_max: bpmMax,
      bpm_avg: bpmAvg,
      songs: filtered,
    };

    const jsonString = JSON.stringify(response);
    const acceptEncoding = request.headers.get('accept-encoding') || '';

    // Compress large payloads with gzip so Vercel Serverless Functions stay under the 4.5MB limit
    if (acceptEncoding.includes('gzip') && jsonString.length > 500_000) {
      const compressed = zlib.gzipSync(Buffer.from(jsonString, 'utf-8'));
      return new NextResponse(compressed, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Encoding': 'gzip',
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/songs route handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error loading songs database' },
      { status: 500 }
    );
  }
}
