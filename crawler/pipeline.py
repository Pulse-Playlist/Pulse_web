"""
PULSE End-to-End Music BPM & Running Cadence Pipeline.

Modes:
- `--mode test`  : Verifies Melon/Bugs chart scrapers and runs DSP BPM analysis on 12 iconic sample tracks (3 per category).
- `--mode seed`  : Builds the full seed database ensuring >= 100 analyzed songs for EACH of the 4 categories ('band', 'kpop', 'rock', 'hiphop').
- `--mode daily` : Incremental daily crawler for newly charted songs on Melon/Bugs TOP 100.

Storage:
- Always persists to `crawler/data/songs.json` (with periodic checkpoints).
- Automatically upserts to Supabase `public.songs` if `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env`.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Set

from dotenv import load_dotenv

from audio_analyzer import (
    analyze_preview_audio,
    fetch_deezer_reference,
    match_itunes_track,
)
from collectors import (
    collect_category_candidates,
    fetch_bugs_top100,
    fetch_melon_top100,
    make_normalized_key,
)
from config import (
    CATEGORIES,
    CATEGORY_SEED_ARTISTS,
    MIN_SONGS_PER_CATEGORY,
    TEST_SAMPLE_TRACKS,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SONGS_JSON_PATH = DATA_DIR / "songs.json"


def load_existing_songs(path: Path = SONGS_JSON_PATH) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as exc:
        print(f"[WARN] Could not load existing songs.json: {exc}")
        return []


def save_songs_json(songs: List[Dict[str, Any]], path: Path = SONGS_JSON_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(".json.tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    tmp_path.replace(path)


def upsert_to_supabase(songs: List[Dict[str, Any]]) -> None:
    """Upserts analyzed song records to Supabase if credentials are configured."""
    load_dotenv(BASE_DIR / ".env")
    supabase_url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    supabase_key = (
        os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
    )
    if not supabase_url or not supabase_key:
        return

    try:
        import requests

        endpoint = f"{supabase_url}/rest/v1/songs?on_conflict=normalized_key"
        headers: Dict[str, str] = {
            "apikey": supabase_key,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        }
        if not supabase_key.startswith("sb_"):
            headers["Authorization"] = f"Bearer {supabase_key}"

        batch_size = 200
        for idx in range(0, len(songs), batch_size):
            batch = songs[idx : idx + batch_size]
            res = requests.post(endpoint, headers=headers, json=batch, timeout=20)
            if res.status_code not in (200, 201, 204):
                print(f"[WARN] Supabase batch upsert returned {res.status_code}: {res.text[:200]}")
                return
        print(f"[SUPABASE] Successfully upserted {len(songs)} tracks to public.songs.")
    except Exception as exc:
        print(f"[WARN] Supabase upsert failed: {exc}")


def analyze_candidate(
    candidate: Dict[str, Any],
    use_deezer: bool = False,
) -> Optional[Dict[str, Any]]:
    """
    Takes a candidate track dict, ensures it has an iTunes `preview_url`,
    runs Librosa DSP analysis, and returns a complete schema-ready song record.
    """
    title = candidate["title"]
    artist = candidate["artist"]
    genre_tag = candidate["genre_tag"]
    norm_key = candidate.get("normalized_key") or make_normalized_key(artist, title)

    preview_url = candidate.get("preview_url")
    itunes_track_id = candidate.get("itunes_track_id")
    cover_url = candidate.get("cover_url")
    album = candidate.get("album") or ""
    duration_sec = candidate.get("duration_sec")

    # Fetch iTunes preview if not already populated by batch catalog
    if not preview_url:
        matched = match_itunes_track(title, artist, sleep_sec=1.0)
        if not matched or not matched.get("preview_url"):
            return None
        preview_url = matched["preview_url"]
        itunes_track_id = matched.get("itunes_track_id")
        cover_url = cover_url or matched.get("cover_url")
        album = album or matched.get("album") or ""
        duration_sec = duration_sec or matched.get("duration_sec")

    deezer_bpm = None
    deezer_track_id = None
    if use_deezer:
        deezer_bpm, deezer_track_id = fetch_deezer_reference(title, artist)

    dsp = analyze_preview_audio(preview_url, deezer_bpm=deezer_bpm)
    if not dsp:
        return None

    return {
        "title": title,
        "artist": artist,
        "normalized_key": norm_key,
        "album": album,
        "cover_url": cover_url,
        "duration_sec": duration_sec,
        "genre_tag": genre_tag,
        "raw_bpm": dsp["raw_bpm"],
        "running_bpm": dsp["running_bpm"],
        "cadence_mode": dsp["cadence_mode"],
        "deezer_bpm": dsp["deezer_bpm"],
        "beat_clarity": dsp["beat_clarity"],
        "beat_salience": dsp["beat_salience"],
        "timing_stability": dsp["timing_stability"],
        "energy_rms": dsp["energy_rms"],
        "running_score": dsp["running_score"],
        "preview_url": preview_url,
        "itunes_track_id": itunes_track_id,
        "deezer_track_id": deezer_track_id,
        "melon_song_id": candidate.get("melon_song_id"),
        "bugs_track_id": candidate.get("bugs_track_id"),
        "source": candidate.get("source", "seed"),
    }


def run_test_mode() -> None:
    print("=== [PULSE] Running Verification Test Mode ===")
    melon_chart = fetch_melon_top100()
    bugs_chart = fetch_bugs_top100()
    print(f"[CHART CHECK] Melon TOP 100 fetched: {len(melon_chart)} tracks")
    print(f"[CHART CHECK] Bugs TOP 100 fetched:  {len(bugs_chart)} tracks")

    results: List[Dict[str, Any]] = []
    for sample in TEST_SAMPLE_TRACKS:
        record = analyze_candidate(sample, use_deezer=True)
        if record:
            results.append(record)
            print(
                f"  ✅ [{record['genre_tag'].upper():6s}] {record['artist']} - {record['title']} | "
                f"raw={record['raw_bpm']} -> running={record['running_bpm']} SPM ({record['cadence_mode']}) | "
                f"score={record['running_score']}"
            )
        else:
            print(f"  ❌ Failed to analyze sample: {sample['artist']} - {sample['title']}")

    if results:
        save_songs_json(results, DATA_DIR / "test_songs.json")
        print(f"\n[TEST COMPLETE] Saved {len(results)} test tracks to crawler/data/test_songs.json")


def run_seed_mode(min_per_category: int = MIN_SONGS_PER_CATEGORY, workers: int = 4) -> None:
    print(
        f"=== [PULSE] Running Full Seed Collection Mode "
        f"(Target: >= {min_per_category} songs/category across {CATEGORIES}) ==="
    )
    existing_songs = load_existing_songs()
    songs_by_key: Dict[str, Dict[str, Any]] = {
        s["normalized_key"]: s for s in existing_songs if "normalized_key" in s
    }

    for category in CATEGORIES:
        current_cat_songs = [
            s for s in songs_by_key.values() if s.get("genre_tag") == category
        ]
        needed = max(0, min_per_category - len(current_cat_songs))
        missing_seed_artists = [
            a for a in CATEGORY_SEED_ARTISTS.get(category, [])[:5]
            if not any(make_normalized_key(a, "").split("::")[0] in s.get("normalized_key", "") for s in current_cat_songs)
        ]
        print(
            f"\n>>> Category [{category.upper()}]: currently {len(current_cat_songs)}/{min_per_category} tracks "
            f"(need {needed} more, missing key seeds: {missing_seed_artists})"
        )
        if needed == 0 and not missing_seed_artists:
            continue

        # Collect buffer of candidates so even if any preview download fails we hit >= min_per_category
        target_candidates = int(needed * 1.4) + 25 if needed > 0 else 15
        candidates = collect_category_candidates(
            category=category,
            target_candidates=target_candidates,
            existing_keys=set(songs_by_key.keys()),
        )
        print(f"    Collected {len(candidates)} candidate tracks for [{category.upper()}]. Analyzing audio...")

        # Separate pre-enriched candidates (have preview_url, safe for parallel DSP) vs un-enriched
        with_preview = [c for c in candidates if c.get("preview_url")]
        without_preview = [c for c in candidates if not c.get("preview_url")]

        added_in_cat = 0
        # 1. Analyze pre-enriched candidates in parallel
        with ThreadPoolExecutor(max_workers=workers) as pool:
            future_map = {
                pool.submit(analyze_candidate, cand, False): cand for cand in with_preview
            }
            for future in as_completed(future_map):
                res = future.result()
                if res:
                    songs_by_key[res["normalized_key"]] = res
                    added_in_cat += 1
                    cat_total = len([s for s in songs_by_key.values() if s.get("genre_tag") == category])
                    if added_in_cat % 10 == 0 or cat_total >= min_per_category:
                        print(
                            f"    [{category.upper()}] Progress: {cat_total}/{min_per_category} "
                            f"(latest: {res['artist']} - {res['title']} -> {res['running_bpm']} SPM)"
                        )
                        save_songs_json(list(songs_by_key.values()))
                        if cat_total >= min_per_category + 10:
                            break

        # 2. If still below min_per_category, process remaining candidates sequentially (rate-limited iTunes lookup)
        cat_total = len([s for s in songs_by_key.values() if s.get("genre_tag") == category])
        for cand in without_preview:
            if cat_total >= min_per_category + 5:
                break
            res = analyze_candidate(cand, use_deezer=False)
            if res:
                songs_by_key[res["normalized_key"]] = res
                cat_total += 1
                if cat_total % 5 == 0:
                    save_songs_json(list(songs_by_key.values()))

        save_songs_json(list(songs_by_key.values()))
        final_cat_count = len([s for s in songs_by_key.values() if s.get("genre_tag") == category])
        print(f"=== Category [{category.upper()}] Complete: {final_cat_count} tracks stored ===")

    all_songs = list(songs_by_key.values())
    save_songs_json(all_songs)
    upsert_to_supabase(all_songs)

    print("\n================ FINAL SEED SUMMARY ================")
    for cat in CATEGORIES:
        cnt = len([s for s in all_songs if s.get("genre_tag") == cat])
        print(f"  - {cat.upper():8s}: {cnt} tracks")
    print(f"  - TOTAL   : {len(all_songs)} tracks saved to {SONGS_JSON_PATH}")
    print("====================================================")


def run_daily_mode() -> None:
    print("=== [PULSE] Running Daily Chart Incremental Update ===")
    existing_songs = load_existing_songs()
    songs_by_key: Dict[str, Dict[str, Any]] = {
        s["normalized_key"]: s for s in existing_songs if "normalized_key" in s
    }

    chart_tracks = fetch_melon_top100() + fetch_bugs_top100()
    new_candidates: List[Dict[str, Any]] = []
    seen_keys: Set[str] = set(songs_by_key.keys())

    for tr in chart_tracks:
        key = make_normalized_key(tr["artist"], tr["title"])
        if key in seen_keys:
            continue
        seen_keys.add(key)
        tr["normalized_key"] = key
        tr["genre_tag"] = "kpop"
        new_candidates.append(tr)

    print(f"[DAILY] Found {len(new_candidates)} new chart tracks to analyze.")
    new_records: List[Dict[str, Any]] = []
    for cand in new_candidates:
        res = analyze_candidate(cand, use_deezer=True)
        if res:
            songs_by_key[res["normalized_key"]] = res
            new_records.append(res)
            print(f"  + Added: {res['artist']} - {res['title']} ({res['running_bpm']} SPM)")

    if new_records:
        all_songs = list(songs_by_key.values())
        save_songs_json(all_songs)
        upsert_to_supabase(new_records)
    print(f"[DAILY COMPLETE] Added {len(new_records)} new tracks. Total DB size: {len(songs_by_key)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="PULSE Music BPM & Cadence Pipeline")
    parser.add_argument(
        "--mode",
        choices=["test", "seed", "daily"],
        default="test",
        help="Execution mode: test (12 sample tracks), seed (100+ per category), daily (chart diff)",
    )
    parser.add_argument(
        "--min-per-category",
        type=int,
        default=MIN_SONGS_PER_CATEGORY,
        help="Minimum number of validated songs per category in seed mode (default: 100)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of parallel audio DSP analysis threads (default: 4)",
    )
    args = parser.parse_args()

    start_ts = time.time()
    if args.mode == "test":
        run_test_mode()
    elif args.mode == "seed":
        run_seed_mode(min_per_category=args.min_per_category, workers=args.workers)
    elif args.mode == "daily":
        run_daily_mode()
    elapsed = time.time() - start_ts
    print(f"\nDone in {elapsed:.1f}s.")


if __name__ == "__main__":
    main()
