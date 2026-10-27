import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Song, SongsResponse } from '@/types/song';

export const dynamic = 'force-dynamic';

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
  const localSongs = loadLocalSongs();
  const localByKey = new Map<string, Song>();
  for (const s of localSongs) {
    if (s.normalized_key) {
      localByKey.set(s.normalized_key, s);
    }
  }

  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).replace(/\/$/, '');
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  if (supabaseUrl && supabaseKey) {
    try {
      const headers: Record<string, string> = {
        apikey: supabaseKey,
        Accept: 'application/json',
      };
      if (!supabaseKey.startsWith('sb_')) {
        headers.Authorization = `Bearer ${supabaseKey}`;
      }

      const pageOffsets = Array.from({ length: 16 }, (_, i) => i * 1000);
      const responses = await Promise.all(
        pageOffsets.map((offset) =>
          fetch(`${supabaseUrl}/rest/v1/songs?select=*&order=id.asc&offset=${offset}&limit=1000`, {
            headers,
            cache: 'no-store',
          })
        )
      );

      if (responses[0].ok) {
        const pages = await Promise.all(
          responses.map(async (r) => (r.ok ? await r.json() : []))
        );
        const data = pages.flatMap((p) => (Array.isArray(p) ? p : []));
        if (data.length >= 100) {
          return (data as Song[]).map((row) => {
            const local = row.normalized_key ? localByKey.get(row.normalized_key) : undefined;
            if (!local) return row;
            return {
              ...row,
              title_ko: row.title_ko || local.title_ko || row.title,
              title_en: row.title_en || local.title_en || row.title,
              artist_ko: row.artist_ko || local.artist_ko || row.artist,
              artist_en: row.artist_en || local.artist_en || row.artist,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Supabase fetch fallback to local songs.json:', err);
    }
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
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : null;

    const allSongs = await loadSongs();

    // Compute global category counts
    const category_counts: Record<string, number> = {
      band: 0,
      kpop: 0,
      rock: 0,
      hiphop: 0,
    };

    let bpmSum = 0;
    let bpmMin = 999;
    let bpmMax = 0;

    for (const s of allSongs) {
      if (s.genre_tag && category_counts[s.genre_tag] !== undefined) {
        category_counts[s.genre_tag]++;
      }
      const bpm = s.running_bpm || s.raw_bpm || 0;
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
        const bpm = s.running_bpm || s.raw_bpm;
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

    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    const response: SongsResponse & { filtered_count: number } = {
      total: allSongs.length,
      filtered_count: filtered.length,
      category_counts,
      bpm_min: bpmMin === 999 ? 0 : bpmMin,
      bpm_max: bpmMax,
      bpm_avg: bpmAvg,
      songs: filtered,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/songs route handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error loading songs database' },
      { status: 500 }
    );
  }
}
