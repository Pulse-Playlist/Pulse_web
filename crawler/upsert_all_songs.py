"""
Supabase Upsert Script for PULSE Song Dataset.
Upserts all deduplicated, DSP-audited songs into Supabase public.songs table.
"""

import json
import os
from pathlib import Path
import time
from typing import Any, Dict, List

from dotenv import load_dotenv
import requests

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SONGS_JSON_PATH = DATA_DIR / "songs.json"

ALLOWED_SUPABASE_COLUMNS = {
    "title",
    "artist",
    "normalized_key",
    "album",
    "cover_url",
    "duration_sec",
    "genre_tag",
    "raw_bpm",
    "running_bpm",
    "cadence_mode",
    "deezer_bpm",
    "beat_clarity",
    "beat_salience",
    "timing_stability",
    "energy_rms",
    "running_score",
    "preview_url",
    "itunes_track_id",
    "deezer_track_id",
    "melon_song_id",
    "bugs_track_id",
    "source",
}


def main() -> None:
    load_dotenv(BASE_DIR / ".env")
    supabase_url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    supabase_key = (
        os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
    )

    if not supabase_url or not supabase_key:
        print("[ERROR] Supabase credentials missing in crawler/.env!")
        return

    if not SONGS_JSON_PATH.exists():
        print(f"[ERROR] {SONGS_JSON_PATH} not found!")
        return

    with open(SONGS_JSON_PATH, "r", encoding="utf-8") as f:
        songs: List[Dict[str, Any]] = json.load(f)

    print(f"=== [SUPABASE] Starting Upsert of {len(songs)} tracks to public.songs ===")
    endpoint = f"{supabase_url}/rest/v1/songs?on_conflict=normalized_key"
    headers: Dict[str, str] = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    batch_size = 200
    total_upserted = 0
    t0 = time.time()

    for idx in range(0, len(songs), batch_size):
        raw_batch = songs[idx : idx + batch_size]
        batch = []
        for s in raw_batch:
            item = {k: v for k, v in s.items() if k in ALLOWED_SUPABASE_COLUMNS}
            # Ensure required fields have valid defaults
            if not item.get("cadence_mode"):
                item["cadence_mode"] = "native"
            batch.append(item)

        res = requests.post(endpoint, headers=headers, json=batch, timeout=30)
        if res.status_code not in (200, 201, 204):
            print(f"[ERROR] Batch {idx // batch_size + 1} failed ({res.status_code}): {res.text[:300]}")
            return
        total_upserted += len(batch)
        print(f"  + Upserted batch {idx // batch_size + 1} ({total_upserted}/{len(songs)} tracks)")

    print(f"[SUCCESS] Upserted {total_upserted} tracks to Supabase in {time.time() - t0:.1f}s!")


if __name__ == "__main__":
    main()
