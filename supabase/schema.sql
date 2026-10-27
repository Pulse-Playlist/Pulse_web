-- PULSE: K-Pop & Band Running Cadence (BPM) Database Schema
-- Target DBMS: Supabase (PostgreSQL 15+)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Track Metadata
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    normalized_key TEXT NOT NULL UNIQUE, -- normalized "artist::title" for deduplication
    album TEXT,
    cover_url TEXT,
    duration_sec INTEGER,
    
    -- Category Classification (7 Core Categories)
    genre_tag TEXT NOT NULL CHECK (genre_tag IN ('band', 'kpop', 'rock', 'hiphop', 'edm', 'pop', 'jpop')),
    
    -- Tempo & Running Cadence Metrics
    raw_bpm NUMERIC(5, 1) NOT NULL,          -- Original extracted musical tempo (e.g., 86.0 or 172.0)
    running_bpm INTEGER NOT NULL,            -- Normalized running cadence target in [140, 195] SPM (or closest)
    cadence_mode TEXT NOT NULL CHECK (cadence_mode IN ('native', 'double_time', 'half_time')),
    deezer_bpm NUMERIC(5, 1),                -- Secondary reference BPM from Deezer if available
    
    -- Audio DSP Quality Metrics for Running (Librosa)
    beat_clarity NUMERIC(4, 3) NOT NULL,     -- Autocorrelation tempogram prominence (0.000 ~ 1.000)
    beat_salience NUMERIC(5, 2) NOT NULL,    -- Ratio of beat onset strength vs background energy
    timing_stability NUMERIC(4, 3) NOT NULL, -- Quantization-compensated beat interval stability (0.000 ~ 1.000)
    energy_rms NUMERIC(5, 4) NOT NULL,       -- Mean RMS loudness / acoustic drive
    running_score NUMERIC(4, 1) NOT NULL,    -- Composite running suitability score (0.0 ~ 100.0)
    
    -- External Platform Identifiers & Preview Audio
    preview_url TEXT,                        -- 30-second AAC (.m4a) preview stream from Apple/iTunes
    itunes_track_id BIGINT,
    deezer_track_id BIGINT,
    melon_song_id TEXT,
    bugs_track_id TEXT,
    source TEXT,                             -- e.g., 'bugs_artist', 'melon_top100', 'bugs_top100', 'itunes_artist'
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup index for playlist generation by category + cadence range + running suitability
CREATE INDEX IF NOT EXISTS idx_songs_genre_bpm_score
    ON public.songs (genre_tag, running_bpm, running_score DESC);

-- Fast lookup index for cadence-first search across all categories
CREATE INDEX IF NOT EXISTS idx_songs_running_bpm_score
    ON public.songs (running_bpm, running_score DESC);

-- Auto-update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_songs_updated_at ON public.songs;
CREATE TRIGGER trg_songs_updated_at
    BEFORE UPDATE ON public.songs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (Public read access for web frontend, service_role write access for crawler)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on songs" ON public.songs;
CREATE POLICY "Allow public read access on songs"
    ON public.songs
    FOR SELECT
    USING (true);
