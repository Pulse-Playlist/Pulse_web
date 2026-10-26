"""
High-Speed Apple Music API Top-Songs Collector & Multiprocessing DSP Analyzer
for building the 10,000-song PULSE database (2,500 songs per category across 350+ artists).
"""

import base64
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import re
import time
from typing import Any, Dict, List, Optional, Set, Tuple

import audioread
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils
import librosa
import numpy as np
import requests
import soundfile as sf

from collectors import clean_parentheses, is_valid_track_title, make_normalized_key, normalize_token

BASE_DIR = Path(__file__).resolve().parent
P8_PATH = BASE_DIR.parent / "web" / "AuthKey_YDN5P2LVLK.p8"
CACHE_DIR = Path("/tmp/pulse_audio_cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def generate_apple_music_token() -> str:
    with open(P8_PATH, "rb") as f:
        priv = serialization.load_pem_private_key(f.read(), password=None)
    now = int(time.time())
    hdr = _b64url(json.dumps({"alg": "ES256", "kid": "YDN5P2LVLK"}).encode())
    pay = _b64url(json.dumps({"iss": "8ZUB5C2R66", "iat": now, "exp": now + 10800}).encode())
    der_sig = priv.sign(f"{hdr}.{pay}".encode(), ec.ECDSA(hashes.SHA256()))
    r_val, s_val = utils.decode_dss_signature(der_sig)
    raw_sig = r_val.to_bytes(32, "big") + s_val.to_bytes(32, "big")
    return f"{hdr}.{pay}.{_b64url(raw_sig)}"


def fetch_artist_top_tracks_apple_music(
    artist_query: str,
    token: str,
    genre_tag: str,
    max_per_artist: int = 40,
) -> List[Dict[str, Any]]:
    """
    Uses official Apple Music Catalog API (KR first, US fallback) to fetch an artist's
    popularity-ranked top songs (`view/top-songs` + song search pagination).
    """
    headers = {"Authorization": f"Bearer {token}"}
    tracks: List[Dict[str, Any]] = []
    seen_ids: Set[str] = set()
    seen_norm_titles: Set[str] = set()

    # Clean query if it has parenthetical alias like "아이유 (IU)"
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
            if not tid or tid in seen_ids:
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
                    "normalized_key": make_normalized_key(primary_query, clean_t),
                    "album": attr.get("albumName") or "",
                    "cover_url": art_url,
                    "duration_sec": int(round(dur_ms / 1000.0)) if dur_ms else None,
                    "genre_tag": genre_tag,
                    "preview_url": preview_url,
                    "itunes_track_id": int(tid) if tid.isdigit() else None,
                    "source": "apple_music_kr",
                }
            )

    def _safe_get(url: str, params: Dict[str, Any]) -> Optional[requests.Response]:
        for attempt in range(5):
            try:
                resp = requests.get(url, params=params, headers=headers, timeout=15)
                if resp.status_code in (429, 403, 503):
                    time.sleep(2.0 * (attempt + 1))
                    continue
                return resp
            except Exception:
                time.sleep(1.0)
        return None

    for storefront in ("kr", "us"):
        for q in [q for q in (primary_query, secondary_query) if q]:
            try:
                # 1. Find artist ID
                r = _safe_get(
                    f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                    params={"term": q, "types": "artists", "limit": 3, "l": "ko-KR"},
                )
                if r and r.status_code == 200:
                    artists_data = r.json().get("results", {}).get("artists", {}).get("data", [])
                    matched_aid = None
                    for a_obj in artists_data:
                        a_name = (a_obj.get("attributes") or {}).get("name") or ""
                        norm_cand = normalize_token(a_name)
                        if norm_q1 == norm_cand or (norm_q2 and norm_q2 == norm_cand) or (len(norm_q1) >= 3 and norm_q1 in norm_cand):
                            matched_aid = a_obj.get("id")
                            break
                    if matched_aid:
                        for offset in (0, 25):
                            if len(tracks) >= max_per_artist:
                                break
                            r_top = _safe_get(
                                f"https://api.music.apple.com/v1/catalog/{storefront}/artists/{matched_aid}/view/top-songs",
                                params={"limit": 25, "offset": offset, "l": "ko-KR"},
                            )
                            if r_top and r_top.status_code == 200:
                                top_items = r_top.json().get("data", [])
                                if not top_items:
                                    break
                                _add_song_items(top_items, verify_artist=False)

                # 2. If still under quota, paginate song search
                for offset in (0, 25, 50):
                    if len(tracks) >= max_per_artist:
                        break
                    r_s = _safe_get(
                        f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                        params={"term": q, "types": "songs", "limit": 25, "offset": offset, "l": "ko-KR"},
                    )
                    if r_s and r_s.status_code == 200:
                        s_items = r_s.json().get("results", {}).get("songs", {}).get("data", [])
                        if not s_items:
                            break
                        _add_song_items(s_items, verify_artist=True)
            except Exception:
                pass
            if len(tracks) >= max_per_artist:
                break
        if len(tracks) >= 15:
            break

    return tracks


def enrich_english_metadata_batch(tracks: List[Dict[str, Any]], token: str) -> None:
    """Fetches l=en-US title_en and artist_en in batches of 250 IDs."""
    headers = {"Authorization": f"Bearer {token}"}
    need_en = [t for t in tracks if not t.get("title_en") and t.get("itunes_track_id")]
    batch_size = 250
    for i in range(0, len(need_en), batch_size):
        batch = need_en[i : i + batch_size]
        ids_str = ",".join(str(t["itunes_track_id"]) for t in batch)
        en_map: Dict[str, Dict[str, Any]] = {}
        for sf_code in ("kr", "us"):
            missing = [str(t["itunes_track_id"]) for t in batch if str(t["itunes_track_id"]) not in en_map]
            if not missing:
                break
            try:
                r = requests.get(
                    f"https://api.music.apple.com/v1/catalog/{sf_code}/songs",
                    params={"ids": ",".join(missing), "l": "en-US"},
                    headers=headers,
                    timeout=15,
                )
                if r.status_code == 200:
                    for item in r.json().get("data", []):
                        en_map[str(item["id"])] = item.get("attributes") or {}
            except Exception:
                pass
        for t in batch:
            tid = str(t["itunes_track_id"])
            attr = en_map.get(tid)
            if attr:
                t["title_en"] = clean_parentheses(attr.get("name") or t["title"])
                t["artist_en"] = attr.get("artistName") or t["artist"]
            else:
                t["title_en"] = t.get("title_en") or t["title"]
                t["artist_en"] = t.get("artist_en") or t["artist"]


def download_preview_to_cache(track: Dict[str, Any]) -> Optional[str]:
    tid = track.get("itunes_track_id")
    url = track.get("preview_url")
    if not url or not tid:
        return None
    dest = CACHE_DIR / f"{tid}.m4a"
    if dest.exists() and dest.stat().st_size > 10000:
        return str(dest)
    for attempt in range(2):
        try:
            r = requests.get(url, timeout=12)
            if r.status_code == 200 and len(r.content) > 10000:
                with open(dest, "wb") as f:
                    f.write(r.content)
                return str(dest)
        except Exception:
            time.sleep(0.3)
    return None


def _load_audio_mono(path: str, sr: int = 22050) -> Tuple[np.ndarray, int]:
    try:
        y, orig_sr = sf.read(path, dtype="float32")
        if y.ndim > 1:
            y = y.mean(axis=1)
        if orig_sr != sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)
        return y, sr
    except Exception:
        with audioread.audio_open(path) as f:
            orig_sr = f.samplerate
            ch = f.channels
            buf = b"".join(f)
            y = np.frombuffer(buf, dtype=np.int16).astype(np.float32) / 32768.0
            if ch > 1:
                y = y.reshape(-1, ch).mean(axis=1)
            if orig_sr != sr:
                y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)
            return y, sr


def analyze_cached_track_worker(track: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Fast multiprocessing worker that computes continuous BPM (with 2x/0.5x disambiguation)
    and rhythm metrics from `/tmp/pulse_audio_cache/{tid}.m4a`.
    """
    tid = track.get("itunes_track_id")
    audio_path = CACHE_DIR / f"{tid}.m4a"
    if not audio_path.exists():
        return None
    try:
        y, sr = _load_audio_mono(str(audio_path), sr=22050)
        if len(y) < sr * 5:
            return None

        hop = 512
        hop_fine = 128
        onset_512 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
        onset_128 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_fine)

        tempo_arr, beat_frames = librosa.beat.beat_track(
            onset_envelope=onset_512, sr=sr, hop_length=hop, start_bpm=124.0
        )
        coarse_bpm = float(np.atleast_1d(tempo_arr)[0])

        max_size = int(sr / hop_fine * 4)
        ac = librosa.autocorrelate(onset_128, max_size=max_size)
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

        # Fast STFT acoustic features for 2x / 0.5x disambiguation
        hop_stft = 256
        S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop_stft))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
        dur_sec = max(1.0, len(y) / sr)

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

        rms_arr = librosa.feature.rms(S=S)
        energy_rms = float(np.mean(rms_arr))
        centroid = float(np.mean(librosa.feature.spectral_centroid(S=S, sr=sr)))
        flatness = float(np.mean(librosa.feature.spectral_flatness(S=S)))

        # Alternating beat ratio when base_bpm >= 142
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

        # Disambiguate ONLY outside the natural [100, 142) range
        if base_bpm >= 142.0:
            if genre == "hiphop":
                # Keep fast hiphop only if genuine fast club/electronic/punk-rap beat
                if kick_rate >= 3.1 and ks_rate >= 3.6 and flatness >= 0.025 and alt_ratio < 1.32:
                    raw_bpm = base_bpm
                else:
                    raw_bpm = base_bpm / 2.0
            else:
                # For kpop, band, rock: check if it's a slow ballad / R&B / mid-tempo doubled by 2x
                if (
                    alt_ratio >= 1.40
                    or ks_rate < 2.55
                    or (flatness < 0.015 and centroid < 2150)
                    or energy_rms < 0.145
                ):
                    raw_bpm = base_bpm / 2.0
                else:
                    raw_bpm = base_bpm
        elif base_bpm < 96.0 and genre in ("band", "rock", "kpop"):
            # Check if a fast driving punk/rock/dance song was halved into < 96 BPM
            if ks_rate >= 3.45 and flatness >= 0.028 and energy_rms >= 0.24 and centroid >= 2350:
                raw_bpm = base_bpm * 2.0

        raw_bpm = round(float(raw_bpm), 1)
        running_bpm = int(round(raw_bpm))

        # Rhythm quality metrics
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


def build_category_2500(
    category: str,
    artists: List[str],
    output_path: str,
    target_count: int = 2500,
    dl_workers: int = 20,
    dsp_workers: int = 3,
) -> None:
    """
    Collects and analyzes `target_count` tracks for `category` across `artists`,
    preserving existing verified tracks from `crawler/data/songs.json`.
    """
    t0 = time.time()
    token = generate_apple_music_token()

    # Load existing verified tracks for this category AND resume from output_path checkpoint if present
    existing_path = BASE_DIR / "data" / "songs.json"
    existing_cat: List[Dict[str, Any]] = []
    seen_ids: Set[int] = set()
    seen_keys: Set[str] = set()

    if existing_path.exists():
        with open(existing_path, "r", encoding="utf-8") as f:
            all_existing = json.load(f)
        for s in all_existing:
            if s.get("itunes_track_id"):
                seen_ids.add(int(s["itunes_track_id"]))
            if s.get("normalized_key"):
                seen_keys.add(s["normalized_key"])
            if s.get("genre_tag") == category:
                existing_cat.append(s)

    out_p = Path(output_path)
    if out_p.exists():
        try:
            with open(out_p, "r", encoding="utf-8") as f:
                ckpt_list = json.load(f)
            for s in ckpt_list:
                tid = s.get("itunes_track_id")
                nk = s.get("normalized_key")
                if tid and int(tid) not in seen_ids and nk not in seen_keys:
                    seen_ids.add(int(tid))
                    if nk:
                        seen_keys.add(nk)
                    existing_cat.append(s)
        except Exception:
            pass

    if len(existing_cat) >= target_count:
        print(f"[{category.upper()}] Checkpoint already has {len(existing_cat)} >= {target_count} tracks! Skipping.")
        return

    print(f"[{category.upper()}] Loaded {len(existing_cat)} existing verified tracks. Need {target_count - len(existing_cat)} new tracks across {len(artists)} artists.")

    needed = max(0, target_count - len(existing_cat))
    target_candidates = int(needed * 1.12) + 120
    per_artist_quota = max(35, (target_candidates // max(1, len(artists))) + 12)

    artist_buckets: Dict[str, List[Dict[str, Any]]] = {a: [] for a in artists}

    # Fetch artist catalogs in parallel (3 threads with 429 retry)
    with ThreadPoolExecutor(max_workers=3) as pool:
        future_to_artist = {
            pool.submit(fetch_artist_top_tracks_apple_music, artist, token, category, per_artist_quota): artist
            for artist in artists
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
                print(f"  [{category.upper()}] {artist}: +{added} new popular tracks")
            except Exception as exc:
                print(f"  [WARN] {artist} failed: {exc}")

    # Round-robin interleave across all artists in original seed order so every artist's #1, #2, #3... popular songs are included evenly
    candidates: List[Dict[str, Any]] = []
    max_depth = max((len(v) for v in artist_buckets.values()), default=0)
    for depth in range(max_depth):
        for artist in artists:
            bucket = artist_buckets.get(artist, [])
            if depth < len(bucket):
                candidates.append(bucket[depth])

    # Trim candidates to needed + 140 buffer
    candidates = candidates[: needed + 140]
    print(f"[{category.upper()}] Round-robin interleaved {len(candidates)} candidates across {sum(1 for v in artist_buckets.values() if v)} active artists. Enriching English metadata...")
    enrich_english_metadata_batch(candidates, token)

    print(f"[{category.upper()}] Downloading {len(candidates)} audio previews with {dl_workers} threads...")
    valid_candidates: List[Dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=dl_workers) as pool:
        fut_to_idx = {pool.submit(download_preview_to_cache, c): i for i, c in enumerate(candidates)}
        ok_indices: Set[int] = set()
        for count, fut in enumerate(as_completed(fut_to_idx), 1):
            i = fut_to_idx[fut]
            if fut.result():
                ok_indices.add(i)
            if count % 250 == 0 or count == len(candidates):
                print(f"  [{category.upper()}] Downloaded {count}/{len(candidates)} (valid: {len(ok_indices)})")
    # Preserve round-robin artist popularity order!
    valid_candidates = [candidates[i] for i in sorted(ok_indices)]

    print(f"[{category.upper()}] Running multiprocessing DSP on {len(valid_candidates)} tracks ({dsp_workers} processes)...")
    analyzed_map: Dict[int, Dict[str, Any]] = {}
    with ProcessPoolExecutor(max_workers=dsp_workers) as pool:
        fut_to_idx = {pool.submit(analyze_cached_track_worker, c): i for i, c in enumerate(valid_candidates)}
        for count, fut in enumerate(as_completed(fut_to_idx), 1):
            i = fut_to_idx[fut]
            res = fut.result()
            if res:
                analyzed_map[i] = res
            if count % 100 == 0 or len(analyzed_map) >= needed:
                print(f"  [{category.upper()}] DSP analyzed {len(analyzed_map)}/{needed} new tracks (elapsed: {time.time() - t0:.1f}s)")
                ordered_so_far = [analyzed_map[k] for k in sorted(analyzed_map.keys())]
                ckpt_songs = existing_cat + ordered_so_far[:needed]
                with open(output_path, "w", encoding="utf-8") as f:
                    json.dump(ckpt_songs, f, ensure_ascii=False, indent=2)
                if len(analyzed_map) >= needed + 20:
                    break

    analyzed_new = [analyzed_map[k] for k in sorted(analyzed_map.keys())]
    final_cat_songs = existing_cat + analyzed_new[:needed]
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_cat_songs, f, ensure_ascii=False, indent=2)

    print(f"=== [{category.upper()} COMPLETE] Saved {len(final_cat_songs)} tracks to {output_path} in {time.time() - t0:.1f}s ===")
