"""
Targeted 130..180 BPM Collector & Unbiased Harmonic-Pair DSP Verifier
for adding 5,000 genuine upbeat running songs (130 <= running_bpm <= 180)
to the PULSE database (~15,000 total songs).
"""

from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import re
import time
from typing import Any, Dict, List, Optional, Set, Tuple

import librosa
import numpy as np
import requests

from collectors import clean_parentheses, is_valid_track_title, make_normalized_key, normalize_token
from mass_collector_lib import (
    CACHE_DIR,
    _load_audio_mono,
    download_preview_to_cache,
    enrich_english_metadata_batch,
    generate_apple_music_token,
)

BASE_DIR = Path(__file__).resolve().parent

# Explicit ballad / slow acoustic / folk / slow R&B artists that should NEVER be promoted into 130..180 BPM
SLOW_ARTIST_TOKENS = {
    normalize_token(a)
    for a in [
        "김광석", "김동률", "유재하", "전람회", "산울림", "동물원", "자전거 탄 풍경",
        "변진섭", "이문세", "신승훈", "조성모", "성시경", "박효신", "나얼", "브라운 아이즈",
        "어반자카파", "스탠딩 에그", "멜로망스", "폴킴", "권진아", "샘김", "적재", "김필",
        "정준일", "짙은", "루시드폴", "곽진언", "로이킴", "하현상", "옥상달빛", "제이레빗",
        "가을방학", "스웨덴세탁소", "바닐라 어쿠스틱", "커피소년", "치즈", "선우정아",
        "백예린", "우효", "카더가든", "검정치마", "wave to earth", "웨이브투어스",
        "크르르", "모트", "다섯", "해서웨이", "10CM", "십센치", "이하이", "죠지", "쏠", "따마",
        "크러쉬", "딘", "헤이즈", "자이언티", "프리스타일", "버벌진트", "바비킴",
    ]
}


def fetch_artist_deep_catalog_apple_music(
    artist_query: str,
    token: str,
    genre_tag: str,
    max_per_artist: int = 85,
    existing_ids: Optional[Set[int]] = None,
    existing_keys: Optional[Set[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Deep catalog fetcher using Apple Music API:
    1. Artist `view/top-songs` (offset 0, 25, 50)
    2. Artist `songs` relationship (offset 0, 25, 50, 75, 100)
    3. Catalog search for `songs` (offset 0, 25, 50, 75, 100)
    """
    headers = {"Authorization": f"Bearer {token}"}
    tracks: List[Dict[str, Any]] = []
    seen_ids: Set[str] = set()
    seen_norm_titles: Set[str] = set()

    primary_query = clean_parentheses(artist_query).strip()
    alias_match = re.search(r"\((.*?)\)", artist_query)
    secondary_query = alias_match.group(1).strip() if alias_match else ""

    norm_q1 = normalize_token(primary_query)
    norm_q2 = normalize_token(secondary_query) if secondary_query else ""

    def _add_song_items(items: List[Dict[str, Any]], verify_artist: bool = True) -> None:
        for item in items:
            if len(tracks) >= max_per_artist:
                break
            tid = str(item.get("id") or "")
            if not tid or not tid.isdigit() or tid in seen_ids:
                continue
            tid_int = int(tid)
            if existing_ids and tid_int in existing_ids:
                continue

            attr = item.get("attributes") or {}
            previews = attr.get("previews") or []
            if not previews or not previews[0].get("url"):
                continue
            preview_url = previews[0]["url"]
            raw_title = attr.get("name") or ""
            if not is_valid_track_title(raw_title):
                continue
            artist_name = attr.get("artistName") or primary_query
            if verify_artist:
                norm_a = normalize_token(artist_name)
                if norm_q1 not in norm_a and (not norm_q2 or norm_q2 not in norm_a):
                    continue

            clean_t = clean_parentheses(raw_title)
            norm_t = normalize_token(clean_t)
            if not norm_t or norm_t in seen_norm_titles:
                continue

            nk = make_normalized_key(primary_query, clean_t)
            if existing_keys and nk in existing_keys:
                continue

            seen_ids.add(tid)
            seen_norm_titles.add(norm_t)

            art_url = (attr.get("artwork") or {}).get("url") or ""
            if "{w}x{h}" in art_url:
                art_url = art_url.replace("{w}x{h}", "600x600")

            dur_ms = attr.get("durationInMillis")
            tracks.append(
                {
                    "title": clean_t,
                    "title_ko": clean_t,
                    "artist": primary_query,
                    "artist_ko": artist_name,
                    "normalized_key": nk,
                    "album": attr.get("albumName") or "",
                    "cover_url": art_url,
                    "duration_sec": int(round(dur_ms / 1000.0)) if dur_ms else None,
                    "genre_tag": genre_tag,
                    "preview_url": preview_url,
                    "itunes_track_id": tid_int,
                    "source": "apple_music_kr",
                }
            )

    for storefront in ("kr", "us"):
        for q in [q for q in (primary_query, secondary_query) if q]:
            try:
                r = requests.get(
                    f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                    params={"term": q, "types": "artists", "limit": 3, "l": "ko-KR"},
                    headers=headers,
                    timeout=10,
                )
                if r.status_code == 200:
                    artists_data = r.json().get("results", {}).get("artists", {}).get("data", [])
                    matched_aid = None
                    for a_obj in artists_data:
                        a_name = (a_obj.get("attributes") or {}).get("name") or ""
                        norm_cand = normalize_token(a_name)
                        if (
                            norm_q1 == norm_cand
                            or (norm_q2 and norm_q2 == norm_cand)
                            or (len(norm_q1) >= 3 and norm_q1 in norm_cand)
                        ):
                            matched_aid = a_obj.get("id")
                            break
                    if matched_aid:
                        # 1. Top songs view
                        for offset in (0, 25, 50):
                            if len(tracks) >= max_per_artist:
                                break
                            r_top = requests.get(
                                f"https://api.music.apple.com/v1/catalog/{storefront}/artists/{matched_aid}/view/top-songs",
                                params={"limit": 25, "offset": offset, "l": "ko-KR"},
                                headers=headers,
                                timeout=10,
                            )
                            if r_top.status_code == 200:
                                top_items = r_top.json().get("data", [])
                                if not top_items:
                                    break
                                _add_song_items(top_items, verify_artist=False)

                        # 2. Artist songs relationship
                        for offset in (0, 25, 50, 75, 100, 125, 150):
                            if len(tracks) >= max_per_artist:
                                break
                            r_rel = requests.get(
                                f"https://api.music.apple.com/v1/catalog/{storefront}/artists/{matched_aid}/songs",
                                params={"limit": 25, "offset": offset, "l": "ko-KR"},
                                headers=headers,
                                timeout=10,
                            )
                            if r_rel.status_code == 200:
                                rel_items = r_rel.json().get("data", [])
                                if not rel_items:
                                    break
                                _add_song_items(rel_items, verify_artist=False)

                # 3. Search songs pagination
                for offset in (0, 25, 50, 75, 100, 125, 150):
                    if len(tracks) >= max_per_artist:
                        break
                    r_s = requests.get(
                        f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                        params={"term": q, "types": "songs", "limit": 25, "offset": offset, "l": "ko-KR"},
                        headers=headers,
                        timeout=10,
                    )
                    if r_s.status_code == 200:
                        s_items = r_s.json().get("results", {}).get("songs", {}).get("data", [])
                        if not s_items:
                            break
                        _add_song_items(s_items, verify_artist=True)
            except Exception:
                pass
            if len(tracks) >= max_per_artist:
                break
        if len(tracks) >= 40:
            break

    return tracks


def analyze_130_180_track_worker(track: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Unbiased Harmonic-Pair + Acoustic-Energy DSP Analyzer that returns the analyzed track
    ONLY if its verified true musical tempo falls strictly within `130 <= running_bpm <= 180`!
    Never allows slow ballads/R&B/acoustic songs to be 2x-doubled into 130..180 BPM,
    and automatically rescues fast 145..180 BPM band/rock/kpop songs trapped at 0.5x or 2/3x!
    """
    tid = track.get("itunes_track_id")
    audio_path = CACHE_DIR / f"{tid}.m4a"
    if not audio_path.exists():
        return None

    norm_artist = normalize_token(track.get("artist") or "")
    if norm_artist in SLOW_ARTIST_TOKENS:
        return None

    try:
        y, sr = _load_audio_mono(str(audio_path), sr=22050)
        if len(y) < sr * 5:
            return None

        hop = 512
        hop_fine = 128
        onset_512 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
        onset_128 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_fine)

        # STFT spectral & percussive features
        hop_stft = 256
        S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop_stft))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
        dur_sec = max(1.0, len(y) / sr)

        rms_arr = librosa.feature.rms(S=S)
        energy_rms = float(np.mean(rms_arr))
        centroid = float(np.mean(librosa.feature.spectral_centroid(S=S, sr=sr)))
        flatness = float(np.mean(librosa.feature.spectral_flatness(S=S)))
        zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))

        # Reject quiet ballads / acoustic / lo-fi songs upfront so they NEVER get 2x-doubled into 130..180 BPM
        if energy_rms < 0.115 or (flatness < 0.008 and centroid < 1850):
            return None

        ks_onset = librosa.onset.onset_strength(
            S=librosa.amplitude_to_db(S[(freqs >= 40) & (freqs <= 1500), :]),
            sr=sr,
            hop_length=hop_stft,
        )
        ks_peaks = librosa.onset.onset_detect(
            onset_envelope=ks_onset, sr=sr, hop_length=hop_stft, delta=0.15, wait=8
        )
        ks_rate = len(ks_peaks) / dur_sec

        kick_onset = librosa.onset.onset_strength(
            S=librosa.amplitude_to_db(S[(freqs >= 40) & (freqs <= 130), :]),
            sr=sr,
            hop_length=hop_stft,
        )
        kick_peaks = librosa.onset.onset_detect(
            onset_envelope=kick_onset, sr=sr, hop_length=hop_stft, delta=0.20, wait=10
        )
        kick_rate = len(kick_peaks) / dur_sec

        # Require genuine upbeat rhythmic density
        if ks_rate < 2.15:
            return None

        # 1. Standard librosa beat_track + parabolic fine lag refinement
        tempo_arr, beat_frames = librosa.beat.beat_track(
            onset_envelope=onset_512, sr=sr, hop_length=hop, start_bpm=148.0
        )
        coarse_bpm = float(np.atleast_1d(tempo_arr)[0])

        max_size = int(sr / hop_fine * 3.5)
        ac = librosa.autocorrelate(onset_128, max_size=max_size)
        ac_norm = ac / (ac[0] + 1e-6)

        L_exp = (60.0 * sr) / (hop_fine * coarse_bpm)
        l_min = max(1, int(np.floor(L_exp * 0.92)))
        l_max = min(len(ac) - 2, int(np.ceil(L_exp * 1.08)))
        if l_min <= l_max and l_max < len(ac) - 1:
            k = l_min + int(np.argmax(ac[l_min : l_max + 1]))
            denom = ac[k - 1] - 2.0 * ac[k] + ac[k + 1] + 1e-12
            delta = float(np.clip(0.5 * (ac[k - 1] - ac[k + 1]) / denom, -0.5, 0.5))
            base_bpm = float((60.0 * sr) / (hop_fine * (k + delta)))
        else:
            base_bpm = coarse_bpm

        # 2. Unbiased Autocorrelation Harmonic Pair (B1, B2) Detection
        lag_lo = int(60 * sr / (hop_fine * 183))
        lag_hi = int(60 * sr / (hop_fine * 64))
        peaks = []
        for lag in range(lag_lo, min(lag_hi, len(ac_norm) - 2)):
            if ac_norm[lag] > ac_norm[lag - 1] and ac_norm[lag] > ac_norm[lag + 1]:
                denom = ac_norm[lag - 1] - 2.0 * ac_norm[lag] + ac_norm[lag + 1] + 1e-12
                delta = float(np.clip(0.5 * (ac_norm[lag - 1] - ac_norm[lag + 1]) / denom, -0.5, 0.5))
                bpm_v = round(60.0 * sr / (hop_fine * (lag + delta)), 1)
                peaks.append((round(float(ac_norm[lag]), 3), bpm_v))
        peaks.sort(reverse=True)

        pair_candidates = []
        for v1, b1 in peaks:
            if 64.5 <= b1 <= 90.4:
                for v2, b2 in peaks:
                    if 129.0 <= b2 <= 180.5 and abs(b2 - 2.0 * b1) / (2.0 * b1) <= 0.042:
                        pair_candidates.append((round(v1 + v2, 3), b1, b2, v1, v2))
        pair_candidates.sort(reverse=True)

        # Alternating beat ratio
        valid_b = beat_frames[beat_frames < len(onset_512) - 2]
        if len(valid_b) >= 8:
            b_vals = np.array([np.max(onset_512[max(0, b - 1) : b + 2]) for b in valid_b])
            even_m = float(np.mean(b_vals[0::2]))
            odd_m = float(np.mean(b_vals[1::2]))
            alt_ratio = max(even_m, odd_m) / (min(even_m, odd_m) + 1e-6)
        else:
            alt_ratio = 1.0

        genre = track.get("genre_tag", "")
        raw_bpm = base_bpm

        # 3. Disambiguate True Fast (130..180 BPM) vs Trapped Fast vs Doubled Slow
        if genre in ("band", "rock"):
            # If trapped in 65..128 BPM (0.5x or 2/3x trap) and has upbeat rock/band acoustic profile + harmonic pair (b1, b2)
            if 65.0 <= base_bpm <= 128.5 and pair_candidates:
                _, b1, b2, v1, v2 = pair_candidates[0]
                is_half_or_triplet = abs(base_bpm - b1) <= 5.0 or abs(base_bpm - (b2 * 2.0 / 3.0)) <= 5.5
                if (
                    is_half_or_triplet
                    and v1 >= 0.56
                    and v2 >= 0.56
                    and energy_rms >= 0.130
                    and (flatness >= 0.015 or centroid >= 2100)
                    and ks_rate >= 2.25
                ):
                    raw_bpm = b2
            # If raw_bpm >= 134, verify it is genuinely fast rock/band and NOT a slow rock ballad
            if raw_bpm >= 134.0:
                if (
                    energy_rms < 0.125
                    or ks_rate < 2.20
                    or (flatness < 0.011 and centroid < 1950)
                    or alt_ratio >= 1.52
                ):
                    raw_bpm = raw_bpm / 2.0
        elif genre == "kpop":
            if 65.0 <= base_bpm <= 128.5 and pair_candidates:
                _, b1, b2, v1, v2 = pair_candidates[0]
                is_half_or_triplet = abs(base_bpm - b1) <= 4.5 or abs(base_bpm - (b2 * 2.0 / 3.0)) <= 5.0
                if (
                    is_half_or_triplet
                    and v1 >= 0.60
                    and v2 >= 0.60
                    and energy_rms >= 0.145
                    and (flatness >= 0.018 or centroid >= 2250)
                    and ks_rate >= 2.50
                ):
                    raw_bpm = b2
            if raw_bpm >= 134.0:
                if (
                    energy_rms < 0.135
                    or ks_rate < 2.35
                    or (flatness < 0.012 and centroid < 2000)
                    or alt_ratio >= 1.48
                ):
                    raw_bpm = raw_bpm / 2.0
        elif genre == "hiphop":
            if 65.0 <= base_bpm <= 128.5 and pair_candidates:
                _, b1, b2, v1, v2 = pair_candidates[0]
                is_half_or_triplet = abs(base_bpm - b1) <= 4.5 or abs(base_bpm - (b2 * 2.0 / 3.0)) <= 5.0
                if (
                    is_half_or_triplet
                    and v1 >= 0.60
                    and v2 >= 0.60
                    and energy_rms >= 0.145
                    and kick_rate >= 2.10
                    and ks_rate >= 2.55
                ):
                    raw_bpm = b2
            if raw_bpm >= 136.0:
                if energy_rms < 0.135 or ks_rate < 2.40 or alt_ratio >= 1.48:
                    raw_bpm = raw_bpm / 2.0
            elif 128.8 <= raw_bpm < 136.0:
                if energy_rms < 0.125 or ks_rate < 2.20:
                    raw_bpm = raw_bpm / 2.0

        # Snap 128.8..129.9 BPM tracks whose true tempo is 130 BPM
        if 128.8 <= raw_bpm < 130.0:
            raw_bpm = 130.0

        raw_bpm = round(float(raw_bpm), 1)
        running_bpm = int(round(raw_bpm))

        # STRICT FILTER: ONLY keep tracks whose verified running_bpm is in [130, 180]!
        if not (130 <= running_bpm <= 180):
            return None

        tempogram = librosa.feature.tempogram(onset_envelope=onset_512, sr=sr, hop_length=hop)
        frame_peak_ratio = np.max(tempogram, axis=0) / (np.mean(tempogram, axis=0) + 1e-6)
        beat_clarity = float(np.clip((np.mean(frame_peak_ratio) - 1.5) / 4.5, 0.0, 1.0))

        if len(valid_b) > 0:
            beat_salience = float(np.mean(onset_512[valid_b]) / (np.mean(onset_512) + 1e-6))
        else:
            beat_salience = 1.0

        if len(beat_frames) > 3:
            frame_dur_ms = (hop / float(sr)) * 1000.0
            beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop)
            ibis_ms = np.diff(beat_times) * 1000.0
            raw_std_ms = float(np.std(ibis_ms))
            quant_floor_ms = frame_dur_ms / np.sqrt(6.0)
            true_jitter_ms = float(np.sqrt(max(0.0, (raw_std_ms ** 2) - (quant_floor_ms ** 2))))
            timing_stability = float(np.clip(1.0 - (true_jitter_ms / 45.0), 0.0, 1.0))
        else:
            timing_stability = 0.5

        salience_norm = float(np.clip((beat_salience - 1.0) / 1.4, 0.0, 1.0))
        energy_norm = float(np.clip(energy_rms / 0.22, 0.0, 1.0))
        running_score = (
            (salience_norm * 0.30)
            + (timing_stability * 0.30)
            + (beat_clarity * 0.20)
            + (energy_norm * 0.20)
        ) * 100.0

        out = dict(track)
        out.update(
            {
                "raw_bpm": raw_bpm,
                "running_bpm": running_bpm,
                "cadence_mode": "native",
                "deezer_bpm": None,
                "deezer_track_id": None,
                "melon_song_id": None,
                "bugs_track_id": None,
                "beat_clarity": round(beat_clarity, 3),
                "beat_salience": round(beat_salience, 2),
                "timing_stability": round(timing_stability, 3),
                "energy_rms": round(energy_rms, 4),
                "running_score": round(float(np.clip(running_score, 10.0, 99.9)), 1),
            }
        )
        return out
    except Exception:
        return None


def collect_130_180_for_category(
    category: str,
    artists: List[str],
    output_path: str,
    target_new_130_180: int = 1250,
    dl_workers: int = 24,
    dsp_workers: int = 4,
) -> None:
    """
    Collects `target_new_130_180` NEW tracks strictly in `130 <= running_bpm <= 180`
    for `category` across `artists`, saving incremental checkpoints to `output_path`.
    """
    t0 = time.time()
    token = generate_apple_music_token()

    existing_path = BASE_DIR / "data" / "songs.json"
    seen_ids: Set[int] = set()
    seen_keys: Set[str] = set()

    if existing_path.exists():
        with open(existing_path, "r", encoding="utf-8") as f:
            for s in json.load(f):
                if s.get("itunes_track_id"):
                    seen_ids.add(int(s["itunes_track_id"]))
                if s.get("normalized_key"):
                    seen_keys.add(s["normalized_key"])

    out_p = Path(output_path)
    collected_130_180: List[Dict[str, Any]] = []
    if out_p.exists():
        try:
            with open(out_p, "r", encoding="utf-8") as f:
                ckpt = json.load(f)
            for s in ckpt:
                tid = s.get("itunes_track_id")
                nk = s.get("normalized_key")
                if tid and int(tid) not in seen_ids and nk not in seen_keys:
                    seen_ids.add(int(tid))
                    if nk:
                        seen_keys.add(nk)
                    collected_130_180.append(s)
        except Exception:
            pass

    if len(collected_130_180) >= target_new_130_180:
        print(f"[{category.upper()}] Already have {len(collected_130_180)} >= {target_new_130_180} new 130..180 BPM songs!")
        return

    needed = target_new_130_180 - len(collected_130_180)
    print(f"[{category.upper()}] Checkpoint has {len(collected_130_180)} songs. Need {needed} more 130..180 BPM songs across {len(artists)} artists.")

    # Filter out slow artists upfront
    upbeat_artists = [a for a in artists if normalize_token(clean_parentheses(a)) not in SLOW_ARTIST_TOKENS]
    artist_buckets: Dict[str, List[Dict[str, Any]]] = {a: [] for a in upbeat_artists}

    with ThreadPoolExecutor(max_workers=10) as pool:
        future_to_artist = {
            pool.submit(
                fetch_artist_deep_catalog_apple_music,
                artist,
                token,
                category,
                160,
                seen_ids,
                seen_keys,
            ): artist
            for artist in upbeat_artists
        }
        for fut in as_completed(future_to_artist):
            artist = future_to_artist[fut]
            try:
                cat_items = fut.result()
                added = 0
                for item in cat_items:
                    tid = item.get("itunes_track_id")
                    nk = item.get("normalized_key")
                    if not tid or tid in seen_ids or nk in seen_keys:
                        continue
                    seen_ids.add(tid)
                    seen_keys.add(nk)
                    artist_buckets[artist].append(item)
                    added += 1
            except Exception as exc:
                print(f"  [WARN] {artist} failed: {exc}")

    # Round-robin interleave across all upbeat artists
    candidates: List[Dict[str, Any]] = []
    max_depth = max((len(v) for v in artist_buckets.values()), default=0)
    for depth in range(max_depth):
        for artist in upbeat_artists:
            bucket = artist_buckets.get(artist, [])
            if depth < len(bucket):
                candidates.append(bucket[depth])

    print(f"[{category.upper()}] Interleaved {len(candidates)} deep-catalog candidates across {sum(1 for v in artist_buckets.values() if v)} artists.")

    # Process in chunks of 900 candidates until we hit `target_new_130_180`!
    chunk_size = 900
    for c_start in range(0, len(candidates), chunk_size):
        if len(collected_130_180) >= target_new_130_180:
            break
        chunk = candidates[c_start : c_start + chunk_size]
        # Refresh token every chunk in case >1hr
        token = generate_apple_music_token()
        print(f"[{category.upper()}] Chunk {c_start // chunk_size + 1}: Downloading {len(chunk)} previews...")
        with ThreadPoolExecutor(max_workers=dl_workers) as pool:
            fut_to_idx = {pool.submit(download_preview_to_cache, c): i for i, c in enumerate(chunk)}
            ok_indices = [fut_to_idx[fut] for fut in as_completed(fut_to_idx) if fut.result()]
        valid_chunk = [chunk[i] for i in sorted(ok_indices)]

        print(f"[{category.upper()}] Analyzing {len(valid_chunk)} tracks for 130..180 BPM ({dsp_workers} workers)...")
        matched_in_chunk: List[Dict[str, Any]] = []
        with ProcessPoolExecutor(max_workers=dsp_workers) as pool:
            fut_to_idx = {pool.submit(analyze_130_180_track_worker, c): i for i, c in enumerate(valid_chunk)}
            res_map: Dict[int, Dict[str, Any]] = {}
            for count, fut in enumerate(as_completed(fut_to_idx), 1):
                i = fut_to_idx[fut]
                res = fut.result()
                if res:
                    res_map[i] = res
                if count % 250 == 0 or len(collected_130_180) + len(res_map) >= target_new_130_180:
                    print(
                        f"  [{category.upper()}] Inspected {count}/{len(valid_chunk)} in chunk | Found {len(collected_130_180) + len(res_map)}/{target_new_130_180} 130..180 BPM tracks (elapsed: {time.time() - t0:.1f}s)"
                    )
                    if len(collected_130_180) + len(res_map) >= target_new_130_180 + 15:
                        break
            matched_in_chunk = [res_map[k] for k in sorted(res_map.keys())]

        if matched_in_chunk:
            enrich_english_metadata_batch(matched_in_chunk, token)
            collected_130_180.extend(matched_in_chunk)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(collected_130_180[:target_new_130_180], f, ensure_ascii=False, indent=2)
            print(f"  [{category.upper()}] Saved checkpoint {output_path}: {len(collected_130_180[:target_new_130_180])} tracks")

    print(f"=== [{category.upper()} 130..180 BPM COMPLETE] Total collected: {len(collected_130_180[:target_new_130_180])} tracks in {time.time() - t0:.1f}s ===")
