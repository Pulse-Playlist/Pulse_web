"""
Parallel Recalculation Script for PULSE Song BPMs.
Re-analyzes all tracks in crawler/data/songs.json using fine-resolution (hop_length=128)
autocorrelation peak parabolic interpolation and Deezer reference cross-checking.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
import copy
import json
import os
from pathlib import Path
import shutil
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

from audio_analyzer import analyze_preview_audio, fetch_deezer_reference

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SONGS_JSON_PATH = DATA_DIR / "songs.json"
WEB_SONGS_JSON_PATH = BASE_DIR.parent / "web" / "public" / "data" / "songs.json"


def process_single_track(idx: int, track: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    """Processes a single song record: queries Deezer, runs DSP analysis, returns (idx, updated_track)."""
    updated = copy.deepcopy(track)
    title = updated.get("title", "")
    artist = updated.get("artist", "")
    preview_url = updated.get("preview_url")

    if not preview_url:
        return idx, updated

    # 1. Fetch Deezer reference with fast timeout if not already present
    deezer_bpm = updated.get("deezer_bpm")
    deezer_track_id = updated.get("deezer_track_id")
    if deezer_bpm is None:
        try:
            d_bpm, d_id = fetch_deezer_reference(title, artist, timeout=1.5)
            if d_bpm is not None:
                deezer_bpm = d_bpm
            if d_id is not None:
                deezer_track_id = d_id
        except Exception:
            pass

    # 2. Run DSP analysis with retry
    dsp: Optional[Dict[str, Any]] = None
    for attempt in range(2):
        dsp = analyze_preview_audio(
            preview_url, deezer_bpm=deezer_bpm, genre_tag=updated.get("genre_tag")
        )
        if dsp is not None:
            break
        time.sleep(0.3)

    if dsp is not None:
        updated["raw_bpm"] = dsp["raw_bpm"]
        updated["running_bpm"] = int(round(dsp["raw_bpm"]))
        updated["cadence_mode"] = "native"
        updated["deezer_bpm"] = dsp["deezer_bpm"]
        updated["deezer_track_id"] = deezer_track_id
        updated["beat_clarity"] = dsp["beat_clarity"]
        updated["beat_salience"] = dsp["beat_salience"]
        updated["timing_stability"] = dsp["timing_stability"]
        updated["energy_rms"] = dsp["energy_rms"]
        updated["running_score"] = dsp["running_score"]
    else:
        # Fallback if preview audio temporary download failed
        if "raw_bpm" in updated:
            updated["running_bpm"] = int(round(updated["raw_bpm"]))
            updated["cadence_mode"] = "native"

    return idx, updated


def main() -> None:
    if not SONGS_JSON_PATH.exists():
        print(f"[ERROR] {SONGS_JSON_PATH} not found!")
        sys.exit(1)

    with open(SONGS_JSON_PATH, "r", encoding="utf-8") as f:
        songs: List[Dict[str, Any]] = json.load(f)

    total_songs = len(songs)
    print(f"=== [PULSE] Starting Continuous BPM Recalculation for {total_songs} songs ===")
    print(f"Max workers: 16, fine resolution hop_length=128 with parabolic interpolation and octave disambiguation")

    results: List[Optional[Dict[str, Any]]] = [None] * total_songs
    completed_count = 0
    t0 = time.time()

    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {
            executor.submit(process_single_track, idx, track): idx
            for idx, track in enumerate(songs)
        }

        for future in as_completed(futures):
            idx, updated_track = future.result()
            results[idx] = updated_track
            completed_count += 1

            if completed_count % 25 == 0 or completed_count == total_songs:
                elapsed = time.time() - t0
                rate = completed_count / elapsed if elapsed > 0 else 0
                remaining = (total_songs - completed_count) / rate if rate > 0 else 0
                current_bpms = set(
                    r["running_bpm"] for r in results if r is not None and "running_bpm" in r
                )
                print(
                    f"[{completed_count:>3}/{total_songs}] "
                    f"Elapsed: {elapsed:5.1f}s | "
                    f"ETA: {remaining:5.1f}s | "
                    f"Unique running_bpms so far: {len(current_bpms)}"
                )

    # Ensure all slots are filled
    final_songs = [r for r in results if r is not None]
    if len(final_songs) != total_songs:
        print(f"[WARN] Expected {total_songs} songs, got {len(final_songs)}")

    # Calculate final BPM distribution
    running_bpms = [s["running_bpm"] for s in final_songs if "running_bpm" in s]
    unique_bpms = sorted(set(running_bpms))
    print("\n" + "=" * 60)
    print(f"Recalculation Complete in {time.time() - t0:.1f}s!")
    print(f"Total songs processed: {len(final_songs)}")
    print(f"Unique running_bpm values count: {len(unique_bpms)}")
    print(f"Unique running_bpm values list:\n{unique_bpms}")
    print("=" * 60 + "\n")

    # Save to crawler/data/songs.json
    tmp_path = SONGS_JSON_PATH.with_suffix(".json.tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(final_songs, f, ensure_ascii=False, indent=2)
    tmp_path.replace(SONGS_JSON_PATH)
    print(f"[OK] Saved updated dataset to {SONGS_JSON_PATH}")

    # Copy to web/public/data/songs.json
    if WEB_SONGS_JSON_PATH.parent.exists():
        shutil.copy2(SONGS_JSON_PATH, WEB_SONGS_JSON_PATH)
        print(f"[OK] Copied updated dataset to {WEB_SONGS_JSON_PATH}")
    else:
        print(f"[WARN] Destination directory {WEB_SONGS_JSON_PATH.parent} not found!")

    if len(unique_bpms) < 60:
        print(f"[WARNING] Unique running_bpm count ({len(unique_bpms)}) is less than 60!")
        sys.exit(2)
    else:
        print(f"[SUCCESS] Target reached: {len(unique_bpms)} unique running_bpm integer values (>= 60)!")


if __name__ == "__main__":
    main()
