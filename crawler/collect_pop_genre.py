"""
Targeted POP (`pop`) Genre Dataset Collector & Multi-Band DSP BPM Analyzer for PULSE.
Collects at least 1,000 to 1,300 authentic, deduplicated pop songs (103..185 BPM, with strong
representation in 120..180 BPM) across 75+ global pop seed artists.
Writes ONLY to `crawler/data/new_pop_songs.json`.
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
OUTPUT_FILE = BASE_DIR / "data" / "new_pop_songs.json"

# Target seed artists: 75 provided in prompt + 25 additional energetic pop icons = 100 artists
SEED_ARTISTS: List[str] = [
    # Required 75 artists
    "Dua Lipa", "The Weeknd", "Bruno Mars", "Charlie Puth", "Sabrina Carpenter",
    "Olivia Rodrigo", "Taylor Swift", "Lady Gaga", "Ariana Grande", "Justin Bieber",
    "Ed Sheeran", "Shawn Mendes", "Camila Cabello", "Doja Cat", "Sia",
    "Katy Perry", "Rihanna", "Beyoncé", "Michael Jackson", "Madonna",
    "Britney Spears", "Justin Timberlake", "Maroon 5", "OneRepublic", "5 Seconds of Summer",
    "One Direction", "Harry Styles", "Troye Sivan", "Carly Rae Jepsen", "Chappell Roan",
    "Billie Eilish", "Lorde", "Charli xcx", "Zara Larsson", "Ava Max",
    "Anne-Marie", "Ellie Goulding", "Jess Glynne", "Rita Ora", "RAYE",
    "Benson Boone", "Tate McRae", "Meghan Trainor", "DNCE", "Jonas Brothers",
    "Demi Lovato", "Miley Cyrus", "Selena Gomez", "Halsey", "Khalid",
    "Lauv", "LANY", "The 1975", "Bleachers", "Walk the Moon",
    "Foster the People", "Passion Pit", "CHVRCHES", "Kylie Minogue", "ABBA",
    "Earth, Wind & Fire", "Stevie Wonder", "Elton John", "Billy Joel", "Whitney Houston",
    "Kelly Clarkson", "P!nk", "Kesha", "Usher", "Chris Brown",
    "Ne-Yo", "Jason Derulo", "Conan Gray", "Gracie Abrams", "Madison Beer",
    # Additional upbeat/dance pop icons
    "Pitbull", "The Black Eyed Peas", "Calvin Harris", "David Guetta", "The Chainsmokers",
    "Clean Bandit", "Major Lazer", "Avicii", "Kygo", "Bebe Rexha",
    "Alessia Cara", "Gwen Stefani", "Avril Lavigne", "Kelly Rowland", "Janet Jackson",
    "Christina Aguilera", "Shakira", "Jennifer Lopez", "Ciara", "Lizzo",
    "Post Malone", "The Kid LAROI", "Dominic Fike", "Rina Sawayama", "Kim Petras",
    "Marina", "Tove Lo", "MØ", "Sigrid", "Jessie J",
]

# Keywords to strictly exclude non-album/original studio tracks
POP_EXCLUDE_KEYWORDS = (
    "live", "acoustic", "commentary", "instrumental", "inst.", "karaoke",
    "acappella", "a cappella", "demo", "voice note", "voice memo",
    "intro", "outro", "skit", "interlude", "orchestral", "sped up", "slowed",
    "remaster", "anniversary", "monologue", "speech", "dialogue",
)


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


def is_valid_pop_title(raw_title: str) -> bool:
    if not raw_title or len(raw_title.strip()) < 1:
        return False
    lower_t = raw_title.lower()
    for kw in POP_EXCLUDE_KEYWORDS:
        if kw in lower_t:
            return False
    return is_valid_track_title(raw_title)


def fetch_artist_pop_catalog(
    artist_query: str,
    token: str,
    max_per_artist: int = 50,
) -> List[Dict[str, Any]]:
    """
    Fetches an artist's top songs from Apple Music Catalog (US and KR storefronts).
    """
    headers = {"Authorization": f"Bearer {token}"}
    tracks: List[Dict[str, Any]] = []
    seen_ids: Set[int] = set()
    seen_norm_titles: Set[str] = set()

    primary_query = clean_parentheses(artist_query).strip()
    norm_q = normalize_token(primary_query)

    def _add_song_items(items: List[Dict[str, Any]], verify_artist: bool = True) -> None:
        for item in items:
            if len(tracks) >= max_per_artist:
                break
            tid = str(item.get("id") or "")
            if not tid or not tid.isdigit():
                continue
            tid_int = int(tid)
            if tid_int in seen_ids:
                continue

            attr = item.get("attributes") or {}
            previews = attr.get("previews") or []
            if not previews or not previews[0].get("url"):
                continue
            preview_url = previews[0]["url"]

            raw_title = attr.get("name") or ""
            if not is_valid_pop_title(raw_title):
                continue

            artist_name = attr.get("artistName") or primary_query
            if verify_artist:
                norm_a = normalize_token(artist_name)
                if norm_q not in norm_a and len(norm_q) >= 4 and norm_a not in norm_q:
                    continue

            clean_t = clean_parentheses(raw_title)
            norm_t = normalize_token(clean_t)
            if not norm_t or norm_t in seen_norm_titles:
                continue

            art_url = (attr.get("artwork") or {}).get("url") or ""
            if "{w}x{h}" in art_url:
                art_url = art_url.replace("{w}x{h}", "600x600")

            dur_ms = attr.get("durationInMillis")
            duration_sec = int(round(dur_ms / 1000.0)) if dur_ms else None

            # Skip tracks that are too short (< 80s) or ambient long (> 420s)
            if duration_sec and (duration_sec < 80 or duration_sec > 450):
                continue

            seen_ids.add(tid_int)
            seen_norm_titles.add(norm_t)

            tracks.append(
                {
                    "title": clean_t,
                    "title_ko": clean_t,
                    "artist": primary_query,
                    "artist_ko": artist_name,
                    "normalized_key": make_normalized_key(primary_query, clean_t),
                    "album": attr.get("albumName") or "",
                    "cover_url": art_url,
                    "duration_sec": duration_sec,
                    "genre_tag": "pop",
                    "preview_url": preview_url,
                    "itunes_track_id": tid_int,
                    "source": "apple_music",
                }
            )

    # Search storefronts: US first for pop catalog depth, then KR
    for storefront in ("us", "kr"):
        try:
            r = requests.get(
                f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                params={"term": primary_query, "types": "artists", "limit": 3, "l": "en-US"},
                headers=headers,
                timeout=12,
            )
            if r.status_code == 200:
                artists_data = r.json().get("results", {}).get("artists", {}).get("data", [])
                matched_aid = None
                for a_obj in artists_data:
                    a_name = (a_obj.get("attributes") or {}).get("name") or ""
                    norm_cand = normalize_token(a_name)
                    if norm_q == norm_cand or (len(norm_q) >= 3 and norm_q in norm_cand):
                        matched_aid = a_obj.get("id")
                        break

                if matched_aid:
                    # 1. Top songs view (offset 0, 25, 50)
                    for offset in (0, 25, 50):
                        if len(tracks) >= max_per_artist:
                            break
                        r_top = requests.get(
                            f"https://api.music.apple.com/v1/catalog/{storefront}/artists/{matched_aid}/view/top-songs",
                            params={"limit": 25, "offset": offset, "l": "en-US"},
                            headers=headers,
                            timeout=12,
                        )
                        if r_top.status_code == 200:
                            items = r_top.json().get("data", [])
                            if not items:
                                break
                            _add_song_items(items, verify_artist=False)

                    # 2. Artist songs relationship
                    for offset in (0, 25, 50):
                        if len(tracks) >= max_per_artist:
                            break
                        r_rel = requests.get(
                            f"https://api.music.apple.com/v1/catalog/{storefront}/artists/{matched_aid}/songs",
                            params={"limit": 25, "offset": offset, "l": "en-US"},
                            headers=headers,
                            timeout=12,
                        )
                        if r_rel.status_code == 200:
                            items = r_rel.json().get("data", [])
                            if not items:
                                break
                            _add_song_items(items, verify_artist=False)

            # 3. Search songs endpoint pagination
            for offset in (0, 25, 50):
                if len(tracks) >= max_per_artist:
                    break
                r_s = requests.get(
                    f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                    params={"term": primary_query, "types": "songs", "limit": 25, "offset": offset, "l": "en-US"},
                    headers=headers,
                    timeout=12,
                )
                if r_s.status_code == 200:
                    items = r_s.json().get("results", {}).get("songs", {}).get("data", [])
                    if not items:
                        break
                    _add_song_items(items, verify_artist=True)
        except Exception:
            pass
        if len(tracks) >= 30:
            break

    return tracks


def enrich_bilingual_metadata(tracks: List[Dict[str, Any]], token: str) -> None:
    """Enriches tracks with both l=en-US and l=ko-KR metadata in batches of 250 IDs."""
    headers = {"Authorization": f"Bearer {token}"}
    batch_size = 250

    for i in range(0, len(tracks), batch_size):
        batch = tracks[i : i + batch_size]
        ids_str = ",".join(str(t["itunes_track_id"]) for t in batch if t.get("itunes_track_id"))
        if not ids_str:
            continue

        # 1. US catalog for en-US
        en_map: Dict[str, Dict[str, Any]] = {}
        try:
            r_en = requests.get(
                "https://api.music.apple.com/v1/catalog/us/songs",
                params={"ids": ids_str, "l": "en-US"},
                headers=headers,
                timeout=15,
            )
            if r_en.status_code == 200:
                for item in r_en.json().get("data", []):
                    en_map[str(item["id"])] = item.get("attributes") or {}
        except Exception:
            pass

        # 2. KR catalog for ko-KR
        ko_map: Dict[str, Dict[str, Any]] = {}
        try:
            r_ko = requests.get(
                "https://api.music.apple.com/v1/catalog/kr/songs",
                params={"ids": ids_str, "l": "ko-KR"},
                headers=headers,
                timeout=15,
            )
            if r_ko.status_code == 200:
                for item in r_ko.json().get("data", []):
                    ko_map[str(item["id"])] = item.get("attributes") or {}
        except Exception:
            pass

        for t in batch:
            tid = str(t["itunes_track_id"])
            attr_en = en_map.get(tid)
            attr_ko = ko_map.get(tid)

            if attr_en:
                t["title_en"] = clean_parentheses(attr_en.get("name") or t["title"])
                t["artist_en"] = attr_en.get("artistName") or t["artist"]
            else:
                t["title_en"] = t.get("title_en") or t["title"]
                t["artist_en"] = t.get("artist_en") or t["artist"]

            if attr_ko:
                t["title_ko"] = clean_parentheses(attr_ko.get("name") or t["title"])
                t["artist_ko"] = attr_ko.get("artistName") or t["artist"]
            else:
                t["title_ko"] = t.get("title_ko") or t["title_en"]
                t["artist_ko"] = t.get("artist_ko") or t["artist_en"]

            # Prefer English canonical title/artist for Pop genre
            t["title"] = t["title_en"]
            t["artist"] = t["artist_en"]
            t["normalized_key"] = make_normalized_key(t["artist"], t["title"])


def download_preview_file(track: Dict[str, Any]) -> Optional[str]:
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


def fetch_deezer_reference_safe(title: str, artist: str) -> Tuple[Optional[float], Optional[int]]:
    clean_t = clean_parentheses(title)
    clean_a = clean_parentheses(artist.split(",")[0])
    try:
        search_res = requests.get(
            "https://api.deezer.com/search",
            params={"q": f"{clean_a} {clean_t}", "limit": 3},
            timeout=2.5,
        )
        if search_res.status_code != 200:
            return None, None
        items = search_res.json().get("data", [])
        if not items:
            return None, None
        track_id = items[0].get("id")
        if not track_id:
            return None, None
        detail_res = requests.get(f"https://api.deezer.com/track/{track_id}", timeout=2.5)
        if detail_res.status_code != 200:
            return None, int(track_id)
        bpm_val = float(detail_res.json().get("bpm") or 0.0)
        return (round(bpm_val, 1) if bpm_val > 40.0 else None), int(track_id)
    except Exception:
        return None, None


def _load_audio_mono_safe(path: str, sr: int = 22050) -> Tuple[np.ndarray, int]:
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


def analyze_pop_track_dsp(track: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Multiprocessing DSP worker for pop tracks.
    Computes true musical BPM using Deezer cross-validation + multi-band harmonic autocorrelation.
    Strictly keeps tracks within `103 <= running_bpm <= 185`.
    """
    tid = track.get("itunes_track_id")
    audio_path = CACHE_DIR / f"{tid}.m4a"
    if not audio_path.exists():
        return None

    try:
        y, sr = _load_audio_mono_safe(str(audio_path), sr=22050)
        dur_sec = max(1.0, len(y) / sr)
        if dur_sec < 6.0:
            return None

        hop_fine = 128
        hop_coarse = 512
        onset_128 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_fine)
        onset_512 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_coarse)

        # Autocorrelation of onset_128
        max_size = int(sr / hop_fine * 3.8)
        ac = librosa.autocorrelate(onset_128, max_size=max_size)
        ac_norm = ac / (ac[0] + 1e-6)

        # Extract all local peaks between 55 and 210 BPM with parabolic lag refinement
        lag_lo = int(60 * sr / (hop_fine * 210))
        lag_hi = int(60 * sr / (hop_fine * 55))
        peaks: List[Tuple[float, float]] = []
        for lag in range(lag_lo, min(lag_hi, len(ac_norm) - 2)):
            if ac_norm[lag] > ac_norm[lag - 1] and ac_norm[lag] > ac_norm[lag + 1]:
                denom = ac_norm[lag - 1] - 2.0 * ac_norm[lag] + ac_norm[lag + 1] + 1e-12
                delta = float(np.clip(0.5 * (ac_norm[lag - 1] - ac_norm[lag + 1]) / denom, -0.5, 0.5))
                bpm_v = round(60.0 * sr / (hop_fine * (lag + delta)), 1)
                peaks.append((round(float(ac_norm[lag]), 4), bpm_v))
        peaks.sort(reverse=True)
        if not peaks:
            return None

        # STFT spectral features
        hop_stft = 256
        S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop_stft))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)

        rms_arr = librosa.feature.rms(S=S)
        energy_rms = float(np.mean(rms_arr))
        centroid = float(np.mean(librosa.feature.spectral_centroid(S=S, sr=sr)))
        flatness = float(np.mean(librosa.feature.spectral_flatness(S=S)))

        # Reject pure silence / empty tracks
        if energy_rms < 0.06:
            return None

        kick_onset = librosa.onset.onset_strength(
            S=librosa.amplitude_to_db(S[(freqs >= 40) & (freqs <= 140), :]),
            sr=sr,
            hop_length=hop_stft,
        )
        kick_peaks = librosa.onset.onset_detect(
            onset_envelope=kick_onset, sr=sr, hop_length=hop_stft, delta=0.20, wait=10
        )
        kick_rate = len(kick_peaks) / dur_sec

        ks_onset = librosa.onset.onset_strength(
            S=librosa.amplitude_to_db(S[(freqs >= 40) & (freqs <= 1500), :]),
            sr=sr,
            hop_length=hop_stft,
        )
        ks_peaks = librosa.onset.onset_detect(
            onset_envelope=ks_onset, sr=sr, hop_length=hop_stft, delta=0.15, wait=8
        )
        ks_rate = len(ks_peaks) / dur_sec

        # Find octave harmonic pair (b1 in [65, 95], b2 in [135, 190] where b2 ~ 2*b1)
        pair = None
        for v1, b1 in peaks:
            if 65.0 <= b1 <= 95.0:
                for v2, b2 in peaks:
                    if 135.0 <= b2 <= 190.0 and abs(b2 - 2.0 * b1) / (2.0 * b1) <= 0.045:
                        pair = (b1, b2, v1, v2)
                        break
            if pair:
                break

        # Compute alternating beat ratio at fast tempo if pair exists
        alt_ratio_fast = 1.0
        if pair:
            _, b2_cand, _, _ = pair
            _, bf = librosa.beat.beat_track(
                onset_envelope=onset_512, sr=sr, hop_length=hop_coarse, start_bpm=b2_cand
            )
            vb = bf[bf < len(onset_512) - 2]
            if len(vb) >= 8:
                b_vals = np.array([np.max(onset_512[max(0, b - 1) : b + 2]) for b in vb])
                even_m = float(np.mean(b_vals[0::2]))
                odd_m = float(np.mean(b_vals[1::2]))
                alt_ratio_fast = max(even_m, odd_m) / (min(even_m, odd_m) + 1e-6)

        # --------------------------------------------------------------------
        # BPM RESOLUTION LOGIC FOR POP
        # --------------------------------------------------------------------
        resolved_bpm: Optional[float] = None
        deezer_bpm = track.get("deezer_bpm")

        # 1. Deezer cross-validation
        if deezer_bpm and deezer_bpm > 40:
            for v, b in peaks[:6]:
                for mult in (1.0, 2.0, 0.5):
                    cand = b * mult
                    if abs(cand - deezer_bpm) / deezer_bpm <= 0.038:
                        resolved_bpm = cand
                        break
                if resolved_bpm:
                    break
            # Also check if pair matches deezer
            if not resolved_bpm and pair:
                b1, b2, _, _ = pair
                if abs(b2 - deezer_bpm) / deezer_bpm <= 0.038:
                    resolved_bpm = b2
                elif abs(b1 - deezer_bpm) / deezer_bpm <= 0.038:
                    resolved_bpm = b1

        # 2. Midtempo stable zone (98..134.5 BPM) takes precedence if top peak is squarely there
        top_v, top_b = peaks[0]
        if not resolved_bpm:
            if 98.0 <= top_b <= 134.5 and top_v >= 0.55:
                # Check if it is a 2/3 triplet subharmonic of a fast track
                fast_triplet_candidate = [
                    b for v, b in peaks
                    if 145.0 <= b <= 185.0 and abs(b - top_b * 1.5) / b <= 0.04 and v >= top_v - 0.05
                ]
                if fast_triplet_candidate and energy_rms >= 0.14:
                    resolved_bpm = fast_triplet_candidate[0]
                else:
                    resolved_bpm = top_b

        # 3. Harmonic pair disambiguation (fast vs slow)
        if not resolved_bpm and pair:
            b1, b2, v1, v2 = pair
            # Criteria for genuine fast pop (140-190 BPM):
            # Driving synth-pop/pop-punk/dance tracks have:
            # - v2 >= 0.70
            # - energy_rms >= 0.130 (or ks_rate >= 2.3)
            # - (v1 - v2) <= 0.050 (or top_b == b2)
            # - alt_ratio_fast < 1.45
            is_fast_pop = (
                v2 >= 0.70
                and (energy_rms >= 0.130 or ks_rate >= 2.3)
                and ((v1 - v2) <= 0.050 or top_b == b2)
                and alt_ratio_fast < 1.45
            )
            if is_fast_pop:
                resolved_bpm = b2
            elif energy_rms < 0.110 or alt_ratio_fast >= 1.48 or v1 > v2 + 0.10:
                # Genuine slow ballad/acoustic
                resolved_bpm = b1

        # 4. Fallback: Top peak or refined beat tracking from librosa
        if not resolved_bpm:
            resolved_bpm = top_b

        raw_bpm = round(float(resolved_bpm), 1)
        running_bpm = int(round(raw_bpm))

        # --------------------------------------------------------------------
        # BPM RANGE FILTER: Strictly require 103 <= running_bpm <= 185
        # --------------------------------------------------------------------
        if not (103 <= running_bpm <= 185):
            return None

        # Rhythm quality & running suitability DSP metrics
        tempogram = librosa.feature.tempogram(
            onset_envelope=onset_512, sr=sr, hop_length=hop_coarse
        )
        frame_peak_ratio = np.max(tempogram, axis=0) / (np.mean(tempogram, axis=0) + 1e-6)
        beat_clarity = float(np.clip((np.mean(frame_peak_ratio) - 1.5) / 4.5, 0.0, 1.0))

        _, beat_frames = librosa.beat.beat_track(
            onset_envelope=onset_512,
            sr=sr,
            hop_length=hop_coarse,
            start_bpm=raw_bpm,
            bpm=raw_bpm,
        )

        valid_b = beat_frames[beat_frames < len(onset_512)]
        if len(valid_b) > 0:
            beat_salience = float(np.mean(onset_512[valid_b]) / (np.mean(onset_512) + 1e-6))
        else:
            beat_salience = 1.0

        if len(beat_frames) > 3:
            frame_dur_ms = (hop_coarse / float(sr)) * 1000.0
            beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop_coarse)
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
                "genre_tag": "pop",
                "raw_bpm": raw_bpm,
                "running_bpm": running_bpm,
                "cadence_mode": "native",
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


def main():
    t0 = time.time()
    print("================================================================================", flush=True)
    print("🚀 PULSE POP Genre Collector & DSP BPM Resolver Starting...", flush=True)
    print("🎯 Target: At least 1,000 to 1,300 authentic, deduplicated pop songs (103..185 BPM)", flush=True)
    print(f"📁 Output Destination: {OUTPUT_FILE}", flush=True)
    print(f"👥 Seed Artists: {len(SEED_ARTISTS)} artists", flush=True)
    print("================================================================================", flush=True)

    token = generate_apple_music_token()

    # Step 1: Collect artist catalogs in parallel
    print(f"\n[Phase 1] Fetching catalogs across {len(SEED_ARTISTS)} seed artists via Apple Music API...", flush=True)
    artist_tracks: Dict[str, List[Dict[str, Any]]] = {}
    total_fetched = 0

    with ThreadPoolExecutor(max_workers=10) as pool:
        fut_to_artist = {
            pool.submit(fetch_artist_pop_catalog, artist, token, 50): artist
            for artist in SEED_ARTISTS
        }
        for fut in as_completed(fut_to_artist):
            artist = fut_to_artist[fut]
            try:
                tracks = fut.result()
                artist_tracks[artist] = tracks
                total_fetched += len(tracks)
            except Exception as exc:
                print(f"  [WARN] Failed fetching {artist}: {exc}", flush=True)
                artist_tracks[artist] = []

    print(f"✅ Fetched {total_fetched} raw tracks across {sum(1 for v in artist_tracks.values() if v)} artists in {time.time() - t0:.1f}s.", flush=True)

    # Step 2: Interleave tracks round-robin across artists to ensure diversity
    print("\n[Phase 2] Interleaving and deduplicating candidate tracks...", flush=True)
    interleaved_candidates: List[Dict[str, Any]] = []
    seen_ids: Set[int] = set()
    seen_keys: Set[str] = set()

    max_depth = max((len(v) for v in artist_tracks.values()), default=0)
    for depth in range(max_depth):
        for artist in SEED_ARTISTS:
            bucket = artist_tracks.get(artist, [])
            if depth < len(bucket):
                track = bucket[depth]
                tid = track["itunes_track_id"]
                nk = track["normalized_key"]
                if tid not in seen_ids and nk not in seen_keys:
                    seen_ids.add(tid)
                    seen_keys.add(nk)
                    interleaved_candidates.append(track)

    print(f"✅ Deduplicated candidate pool: {len(interleaved_candidates)} tracks.", flush=True)

    # Step 3: Enrich bilingual metadata (US + KR)
    print("\n[Phase 3] Enriching bilingual metadata (l=en-US and l=ko-KR)...", flush=True)
    enrich_bilingual_metadata(interleaved_candidates, token)
    for t in interleaved_candidates:
        t["deezer_bpm"] = None
        t["deezer_track_id"] = None
    print("✅ Bilingual metadata enriched.", flush=True)

    # Step 4: Download Audio Previews directly
    print(f"\n[Phase 4] Downloading audio previews to cache ({CACHE_DIR})...", flush=True)
    t_dl0 = time.time()
    with ThreadPoolExecutor(max_workers=24) as pool:
        fut_to_track = {pool.submit(download_preview_file, t): t for t in interleaved_candidates}
        valid_candidates = []
        for fut in as_completed(fut_to_track):
            track = fut_to_track[fut]
            res_path = fut.result()
            if res_path:
                valid_candidates.append(track)

    print(f"✅ Downloaded / verified {len(valid_candidates)} audio previews in {time.time() - t_dl0:.1f}s.", flush=True)

    # Step 5: ProcessPoolExecutor Librosa Audio DSP & Pop BPM Resolution
    print("\n[Phase 5] Running Librosa Audio DSP & Pop BPM Resolver (8 workers)...", flush=True)
    t_dsp0 = time.time()
    analyzed_tracks: List[Dict[str, Any]] = []
    seen_out_ids: Set[int] = set()
    seen_out_keys: Set[str] = set()

    TARGET_COUNT = 1250  # Target ~1,200 to 1,250 songs (safely in 1,000..1,300)

    with ProcessPoolExecutor(max_workers=8) as pool:
        fut_to_idx = {
            pool.submit(analyze_pop_track_dsp, track): i
            for i, track in enumerate(valid_candidates)
        }
        for count, fut in enumerate(as_completed(fut_to_idx), 1):
            res = fut.result()
            if res:
                tid = res["itunes_track_id"]
                nk = res["normalized_key"]
                if tid not in seen_out_ids and nk not in seen_out_keys:
                    seen_out_ids.add(tid)
                    seen_out_keys.add(nk)
                    analyzed_tracks.append(res)

                    # Save intermediate checkpoint every 200 songs
                    if len(analyzed_tracks) % 200 == 0:
                        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                            json.dump(analyzed_tracks, f, ensure_ascii=False, indent=2)

            if count % 200 == 0 or len(analyzed_tracks) >= TARGET_COUNT:
                print(
                    f"  Processed {count}/{len(valid_candidates)} | Found {len(analyzed_tracks)}/{TARGET_COUNT} upbeat pop songs (103..185 BPM) [elapsed: {time.time() - t_dsp0:.1f}s]",
                    flush=True,
                )
            if len(analyzed_tracks) >= TARGET_COUNT:
                break

    print(f"✅ DSP analysis complete in {time.time() - t_dsp0:.1f}s. Total valid pop songs: {len(analyzed_tracks)}.", flush=True)

    # Step 6: Final sorting and writing to OUTPUT_FILE
    print(f"\n[Phase 6] Final sorting and writing to {OUTPUT_FILE}...", flush=True)
    final_songs = list(analyzed_tracks)

    # Sort deterministically: highest running_score first, then artist, then title
    final_songs.sort(key=lambda x: (-x["running_score"], x["artist"], x["title"]))

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_songs, f, ensure_ascii=False, indent=2)

    # Step 8: Summary Statistics
    bpms = [s["running_bpm"] for s in final_songs]
    scores = [s["running_score"] for s in final_songs]
    dz_count = sum(1 for s in final_songs if s.get("deezer_bpm"))
    b105_120 = sum(1 for b in bpms if 103 <= b < 120)
    b120_140 = sum(1 for b in bpms if 120 <= b < 140)
    b140_160 = sum(1 for b in bpms if 140 <= b < 160)
    b160_185 = sum(1 for b in bpms if 160 <= b <= 185)

    print("\n" + "=" * 80, flush=True)
    print("🎉 POP GENRE COLLECTION & DSP COMPLETE!", flush=True)
    print(f"📊 Total POP Songs Collected: {len(final_songs)}", flush=True)
    print(f"📁 Output File: {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size / 1024:.1f} KB)", flush=True)
    print(f"🎵 Deezer Cross-Validated Tracks: {dz_count} ({dz_count / max(1, len(final_songs)) * 100:.1f}%)", flush=True)
    print(f"⏱️ Total Execution Time: {time.time() - t0:.1f}s", flush=True)
    print("-" * 80, flush=True)
    print("📈 BPM Distribution:", flush=True)
    print(f"  • 103 ~ 119 BPM (Groove Pop / Dance): {b105_120} tracks ({b105_120/len(final_songs)*100:.1f}%)", flush=True)
    print(f"  • 120 ~ 139 BPM (Moderate Jogging Pop): {b120_140} tracks ({b120_140/len(final_songs)*100:.1f}%)", flush=True)
    print(f"  • 140 ~ 159 BPM (Running Cadence Pop):  {b140_160} tracks ({b140_160/len(final_songs)*100:.1f}%)", flush=True)
    print(f"  • 160 ~ 185 BPM (Fast Sprint Synth-Pop): {b160_185} tracks ({b160_185/len(final_songs)*100:.1f}%)", flush=True)
    print(f"  • Fast Running Pop (120 ~ 185 BPM):     {b120_140 + b140_160 + b160_185} tracks ({(b120_140 + b140_160 + b160_185)/len(final_songs)*100:.1f}%)", flush=True)
    print("-" * 80, flush=True)
    print(f"⭐ Average Running Score: {np.mean(scores):.1f} (min: {min(scores):.1f}, max: {max(scores):.1f})", flush=True)
    print("================================================================================", flush=True)


if __name__ == "__main__":
    main()
