"""
Enrich Bilingual Metadata (title_ko, title_en, artist_ko, artist_en) &
Acoustic Double-Time (80 BPM vs 160 BPM) Disambiguation across all PULSE songs.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import shutil
import tempfile
import time
from typing import Any, Dict, List, Optional, Tuple

import jwt
import librosa
import numpy as np
import requests

from audio_analyzer import load_audio_preview, resolve_bpm_multi_band_dsp
from collectors import clean_parentheses
from pipeline import upsert_to_supabase

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
SONGS_JSON_PATH = DATA_DIR / "songs.json"
WEB_SONGS_JSON_PATH = PROJECT_ROOT / "web" / "public" / "data" / "songs.json"
AUTH_KEY_PATH = PROJECT_ROOT / "web" / "AuthKey_YDN5P2LVLK.p8"

APPLE_KEY_ID = "YDN5P2LVLK"
APPLE_TEAM_ID = "8ZUB5C2R66"


def generate_apple_developer_token() -> str:
    """Generates an Apple Music Developer Token JWT signed with ES256."""
    with open(AUTH_KEY_PATH, "r", encoding="utf-8") as f:
        private_key = f.read()

    headers = {
        "alg": "ES256",
        "kid": APPLE_KEY_ID,
    }
    payload = {
        "iss": APPLE_TEAM_ID,
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 * 30,  # 30 days validity
    }
    return jwt.encode(payload, private_key, algorithm="ES256", headers=headers)


def fetch_bilingual_catalog_metadata(
    track_ids: List[str],
    token: str,
    batch_size: int = 250,
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    """
    Fetches ko-KR and en-US metadata from Apple Music catalog for all track IDs.
    Tries catalog/kr first, then falls back to catalog/us for any missing IDs.
    Returns (meta_ko, meta_en) dictionaries keyed by track ID.
    """
    headers = {"Authorization": f"Bearer {token}"}
    meta_ko: Dict[str, Dict[str, Any]] = {}
    meta_en: Dict[str, Dict[str, Any]] = {}

    print(f"[APPLE MUSIC] Querying catalog for {len(track_ids)} unique track IDs in batches of {batch_size}...")

    for i in range(0, len(track_ids), batch_size):
        batch = track_ids[i : i + batch_size]
        batch_ids_str = ",".join(batch)

        # 1. Query catalog/kr
        url_kr_ko = f"https://api.music.apple.com/v1/catalog/kr/songs?ids={batch_ids_str}&l=ko-KR"
        url_kr_en = f"https://api.music.apple.com/v1/catalog/kr/songs?ids={batch_ids_str}&l=en-US"

        res_kr_ko = requests.get(url_kr_ko, headers=headers, timeout=20)
        res_kr_en = requests.get(url_kr_en, headers=headers, timeout=20)

        found_ids: set[str] = set()
        if res_kr_ko.status_code == 200:
            for item in res_kr_ko.json().get("data", []):
                tid = str(item.get("id"))
                meta_ko[tid] = item.get("attributes", {})
                found_ids.add(tid)

        if res_kr_en.status_code == 200:
            for item in res_kr_en.json().get("data", []):
                tid = str(item.get("id"))
                meta_en[tid] = item.get("attributes", {})

        missing_ids = [tid for tid in batch if tid not in found_ids]
        if missing_ids:
            missing_ids_str = ",".join(missing_ids)
            url_us_ko = f"https://api.music.apple.com/v1/catalog/us/songs?ids={missing_ids_str}&l=ko-KR"
            url_us_en = f"https://api.music.apple.com/v1/catalog/us/songs?ids={missing_ids_str}&l=en-US"

            res_us_ko = requests.get(url_us_ko, headers=headers, timeout=20)
            res_us_en = requests.get(url_us_en, headers=headers, timeout=20)

            if res_us_ko.status_code == 200:
                for item in res_us_ko.json().get("data", []):
                    tid = str(item.get("id"))
                    meta_ko[tid] = item.get("attributes", {})

            if res_us_en.status_code == 200:
                for item in res_us_en.json().get("data", []):
                    tid = str(item.get("id"))
                    meta_en[tid] = item.get("attributes", {})

        print(f"  Batch {i // batch_size + 1}/{(len(track_ids) + batch_size - 1) // batch_size}: processed {len(batch)} IDs (found in KR: {len(found_ids)}, missing fallback to US: {len(missing_ids)})")

    return meta_ko, meta_en


def analyze_double_time_acoustic(
    song: Dict[str, Any],
) -> Tuple[str, bool, float, Dict[str, float]]:
    """
    Downloads preview_url and evaluates acoustic features to determine if
    raw_bpm >= 148.0 is a doubled 8th-note subdivision of a true 74~98 BPM track.
    Returns (normalized_key, should_halve, new_bpm, debug_metrics).
    """
    key = song.get("normalized_key", song.get("title", ""))
    url = song.get("preview_url")
    raw_bpm = float(song.get("raw_bpm", 0.0))

    if not url:
        return key, False, raw_bpm, {}

    tmp_path: Optional[str] = None
    try:
        res = requests.get(url, timeout=15)
        res.raise_for_status()

        suffix = ".mp3" if ".mp3" in url.lower() else ".m4a"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
            tmp_file.write(res.content)
            tmp_path = tmp_file.name

        y, sr = load_audio_preview(tmp_path, sr=22050, mono=True)
        if len(y) < sr * 5:
            return key, False, raw_bpm, {}

        new_bpm = resolve_bpm_multi_band_dsp(
            y,
            sr,
            genre_tag=song.get("genre_tag"),
            deezer_bpm=song.get("deezer_bpm"),
            title=song.get("title"),
        )
        should_halve = (abs(new_bpm - raw_bpm / 2.0) <= 3.0) and (raw_bpm >= 138.0)
        return key, should_halve, new_bpm, {"resolved_bpm": new_bpm}
    except Exception as exc:
        print(f"[WARN] DSP analysis failed for {key}: {exc}")
        return key, False, raw_bpm, {}
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass


def main() -> None:
    print("=== [PULSE] Task A: Bilingual Metadata & Acoustic Double-Time Disambiguation ===")

    # 1. Load songs.json
    with open(SONGS_JSON_PATH, "r", encoding="utf-8") as f:
        songs: List[Dict[str, Any]] = json.load(f)

    print(f"Loaded {len(songs)} songs from {SONGS_JSON_PATH}")

    # =========================================================================
    # Step 1: Enrich Bilingual Metadata from Apple Music API
    # =========================================================================
    token = generate_apple_developer_token()
    unique_ids = list(dict.fromkeys(str(s["itunes_track_id"]) for s in songs if s.get("itunes_track_id")))

    meta_ko, meta_en = fetch_bilingual_catalog_metadata(unique_ids, token, batch_size=250)

    enriched_count = 0
    title_updated_count = 0

    for song in songs:
        tid = str(song.get("itunes_track_id", ""))
        attr_ko = meta_ko.get(tid, {})
        attr_en = meta_en.get(tid, {})

        raw_name_ko = attr_ko.get("name") or song.get("title", "")
        raw_name_en = attr_en.get("name") or song.get("title", "")
        raw_artist_ko = attr_ko.get("artistName") or song.get("artist", "")
        raw_artist_en = attr_en.get("artistName") or song.get("artist", "")

        title_ko = clean_parentheses(raw_name_ko).strip() or song.get("title", "").strip()
        title_en = clean_parentheses(raw_name_en).strip() or song.get("title", "").strip()
        artist_ko = raw_artist_ko.strip() or song.get("artist", "").strip()
        artist_en = raw_artist_en.strip() or song.get("artist", "").strip()

        song["title_ko"] = title_ko
        song["artist_ko"] = artist_ko
        song["title_en"] = title_en
        song["artist_en"] = artist_en

        old_title = song.get("title")
        song["title"] = song["title_ko"] or song["title"]
        if old_title != song["title"]:
            title_updated_count += 1

        enriched_count += 1

    print(f"[STEP 1 COMPLETE] Enriched {enriched_count} songs with bilingual metadata. Default Korean title updated for {title_updated_count} songs.")

    # =========================================================================
    # Step 2: Fix Remaining Double-Time BPM Songs
    # =========================================================================
    hiphop_fixed = 0
    for song in songs:
        raw_bpm = float(song.get("raw_bpm", 0.0))
        if song.get("genre_tag") == "hiphop" and raw_bpm >= 146.0:
            halved_bpm = round(raw_bpm / 2.0, 1)
            song["raw_bpm"] = halved_bpm
            song["running_bpm"] = int(round(halved_bpm))
            hiphop_fixed += 1

    print(f"[STEP 2.1 COMPLETE] Halved {hiphop_fixed} double-time hiphop tracks (>= 146 BPM -> 73~99 BPM).")

    # Acoustic disambiguation for band, kpop, rock >= 148.0 BPM
    acoustic_candidates = [
        s for s in songs
        if s.get("genre_tag") in ("band", "kpop", "rock") and float(s.get("raw_bpm", 0.0)) >= 148.0
    ]
    print(f"[STEP 2.2] Analyzing {len(acoustic_candidates)} band/kpop/rock tracks (>= 148 BPM) with 12 workers...")

    results_by_key: Dict[str, Tuple[bool, float, Dict[str, float]]] = {}
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {
            executor.submit(analyze_double_time_acoustic, song): song.get("normalized_key")
            for song in acoustic_candidates
        }
        for future in as_completed(futures):
            key, should_halve, new_bpm, metrics = future.result()
            results_by_key[key] = (should_halve, new_bpm, metrics)

    acoustic_halved = 0
    acoustic_kept = 0
    for song in songs:
        key = song.get("normalized_key")
        if key in results_by_key:
            should_halve, new_bpm, metrics = results_by_key[key]
            if should_halve:
                song["raw_bpm"] = new_bpm
                song["running_bpm"] = int(round(new_bpm))
                acoustic_halved += 1
            else:
                acoustic_kept += 1

    print(f"[STEP 2.2 COMPLETE] Acoustic analysis halved {acoustic_halved} tracks to 74~98 BPM, kept {acoustic_kept} tracks fast.")

    # =========================================================================
    # Step 3: Save & Upsert to Supabase
    # =========================================================================
    # 1. Save to crawler/data/songs.json
    SONGS_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SONGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    print(f"[SAVED] crawler/data/songs.json ({len(songs)} tracks)")

    # 2. Copy to web/public/data/songs.json
    WEB_SONGS_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SONGS_JSON_PATH, WEB_SONGS_JSON_PATH)
    print(f"[SAVED] web/public/data/songs.json ({len(songs)} tracks)")

    # 3. Upsert to Supabase public.songs
    print("[SUPABASE] Starting Supabase public.songs upsert...")
    upsert_to_supabase(songs)

    # =========================================================================
    # Verification
    # =========================================================================
    print("\n=== VERIFICATION TARGET CHECKS ===")
    verification_targets = [
        ("DAY6 - 예뻤어", ["예뻤어", "You Were Beautiful"], (70, 95)),
        ("넬 - 기억을 걷는 시간", ["기억을 걷는 시간", "Time Walking"], (70, 95)),
        ("자우림 - 스물다섯, 스물하나", ["스물다섯, 스물하나"], (70, 95)),
        ("이영지 - Small girl", ["Small girl"], (70, 95)),
        ("박재범 - Joah", ["좋아", "Joah"], (70, 95)),
        ("지코 - 새삥", ["새삥", "New Thing"], (70, 95)),
        ("DAY6 - 한 페이지가 될 수 있게", ["한 페이지가 될 수 있게", "Time of Our Life"], (165, 185)),
        ("DAY6 - HAPPY", ["HAPPY"], (150, 170)),
    ]

    for label, patterns, (bpm_min, bpm_max) in verification_targets:
        match = None
        for s in songs:
            for pat in patterns:
                if pat.lower() in s.get("title", "").lower() or pat.lower() in s.get("title_ko", "").lower() or pat.lower() in s.get("title_en", "").lower():
                    if "DAY6" in label and not ("DAY6" in s.get("artist", "") or "데이식스" in s.get("artist_ko", "")):
                        continue
                    if "박재범" in label and not ("박재범" in s.get("artist", "") or "Jay Park" in s.get("artist_en", "")):
                        continue
                    match = s
                    break
            if match:
                break

        if match:
            in_range = bpm_min <= match["raw_bpm"] <= bpm_max
            status = "✅ PASS" if in_range else "❌ FAIL"
            print(f"{status} | {label:<30} -> title: '{match['title']}' | title_ko: '{match.get('title_ko')}' | title_en: '{match.get('title_en')}' | raw_bpm: {match['raw_bpm']} | running_bpm: {match['running_bpm']}")
        else:
            print(f"⚠️ NOT FOUND | {label}")


if __name__ == "__main__":
    main()
