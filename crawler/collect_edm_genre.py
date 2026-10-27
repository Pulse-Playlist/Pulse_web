"""
High-Speed EDM Genre Dataset Collector & Multiprocessing DSP Audio Analyzer for PULSE.
Collects 1,000 ~ 1,300 authentic, deduplicated EDM songs (House, Tech House, Progressive House,
UK Garage, Festival EDM, Trance, Techno, and Drum & Bass across 115~180 BPM)
from Apple Music Catalog API and writes exclusively to `crawler/data/new_edm_songs.json`.
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

from collectors import clean_parentheses, is_artist_match, make_normalized_key, normalize_token

BASE_DIR = Path(__file__).resolve().parent
P8_PATH = BASE_DIR.parent / "web" / "AuthKey_YDN5P2LVLK.p8"
CACHE_DIR = Path("/tmp/pulse_audio_cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE = BASE_DIR / "data" / "new_edm_songs.json"

# =====================================================================
# Curated Seed Artists (115+ artists)
# =====================================================================

# Drum & Bass artists (165~178 BPM Running Goldmine)
DNB_ARTISTS_LIST = [
    "Pendulum",
    "Sub Focus",
    "Wilkinson",
    "Chase & Status",
    "Rudimental",
    "Netsky",
    "Dimension",
    "Culture Shock",
    "Fox Stevenson",
    "Andy C",
    "High Contrast",
    "Hybrid Minds",
    "Kanine",
    "Metrik",
    "Grafix",
    "Koven",
    "Nia Archives",
    "Sigma",
    "DJ Fresh",
    "Delta Heavy",
    "Maduk",
    "Luude",
    "Bru-C",
    "Hedex",
    "Bou",
    "Matrix & Futurebound",
    "Camo & Krooked",
    "Fred V & Grafix",
    "Fred V",
    "Shy FX",
    "Goldie",
    "Roni Size",
    "Noisia",
    "Tantrum Desire",
    "1991",
    "Goddard.",
    "Venbee",
    "K motionz",
    "A.M.C",
    "Macky Gee",
]

# Trance / Techno / Hardstyle / Eurodance artists (135~155 BPM)
TRANCE_TECHNO_ARTISTS_LIST = [
    "Armin van Buuren",
    "Above & Beyond",
    "Charlotte de Witte",
    "Amelie Lens",
    "Alan Fitzpatrick",
    "Darude",
    "Cascada",
    "Scooter",
    "W&W",
    "Timmy Trumpet",
    "Hardwell",
    "Eric Prydz",
    "Bicep",
    "Paul van Dyk",
    "ATB",
    "Faithless",
    "Underworld",
    "Benny Benassi",
    "Knife Party",
    "Boys Noize",
    "Kavinsky",
    "Enrico Sangiuliano",
    "Reinier Zonneveld",
    "Adam Beyer",
    "I Hate Models",
]

# House / Festival / Tech House / Progressive / UK Garage / Electro (120~135 BPM)
HOUSE_EDM_ARTISTS_LIST = [
    "Calvin Harris",
    "Avicii",
    "Zedd",
    "David Guetta",
    "Martin Garrix",
    "Swedish House Mafia",
    "Daft Punk",
    "Peggy Gou",
    "Fred again..",
    "Disclosure",
    "Tiësto",
    "Alan Walker",
    "Marshmello",
    "The Chainsmokers",
    "Kygo",
    "Galantis",
    "Clean Bandit",
    "Major Lazer",
    "DJ Snake",
    "Skrillex",
    "Diplo",
    "Porter Robinson",
    "Madeon",
    "Illenium",
    "Gryffin",
    "Lost Frequencies",
    "Robin Schulz",
    "Jonas Blue",
    "Sigala",
    "Joel Corry",
    "Jax Jones",
    "MEDUZA",
    "Fisher",
    "Chris Lake",
    "Dom Dolla",
    "John Summit",
    "250",
    "Deadmau5",
    "Nicky Romero",
    "Afrojack",
    "Steve Aoki",
    "Dimitri Vegas & Like Mike",
    "Don Diablo",
    "Oliver Heldens",
    "Tchami",
    "Dillon Francis",
    "RL Grime",
    "Flume",
    "ODESZA",
    "Justice",
    "Gesaffelstein",
    "The Chemical Brothers",
    "Fatboy Slim",
    "The Prodigy",
    "R3HAB",
    "Alok",
    "KSHMR",
    "Krewella",
    "Klingande",
    "Bakermat",
    "Duke Dumont",
    "Gorgon City",
    "MK",
    "Sonny Fodera",
    "Vintage Culture",
    "ACRAZE",
    "James Hype",
    "Sammy Virji",
    "Mau P",
    "Four Tet",
    "Salute",
    "Overmono",
    "Barry Can't Swim",
    "Lane 8",
    "Seven Lions",
    "Kaskade",
    "Alesso",
    "Fedde Le Grand",
    "Bob Sinclar",
    "San Holo",
    "Rezz",
]

ALL_EDM_ARTISTS = DNB_ARTISTS_LIST + TRANCE_TECHNO_ARTISTS_LIST + HOUSE_EDM_ARTISTS_LIST

DNB_TOKENS = {normalize_token(a) for a in DNB_ARTISTS_LIST}
TRANCE_TECHNO_TOKENS = {normalize_token(a) for a in TRANCE_TECHNO_ARTISTS_LIST}

EDM_ARTIST_KO_MAP: Dict[str, str] = {
    "Calvin Harris": "캘빈 해리스",
    "Avicii": "아비치",
    "Zedd": "제드",
    "David Guetta": "데이비드 게타",
    "Martin Garrix": "마틴 개릭스",
    "Swedish House Mafia": "스웨디시 하우스 마피아",
    "Daft Punk": "다프트 펑크",
    "Peggy Gou": "페기 구",
    "Tiësto": "티에스토",
    "Alan Walker": "알렌 워커",
    "Marshmello": "마시멜로",
    "The Chainsmokers": "체인스모커스",
    "Kygo": "카이고",
    "Galantis": "갈란티스",
    "Clean Bandit": "클린 밴딧",
    "Major Lazer": "메이저 레이저",
    "DJ Snake": "디제이 스네이크",
    "Skrillex": "스크릴렉스",
    "Diplo": "디플로",
    "Steve Aoki": "스티브 아오키",
    "Afrojack": "아프로잭",
    "Hardwell": "하드웰",
    "Armin van Buuren": "아민 반 뷰렌",
    "Deadmau5": "데드마우스",
    "The Chemical Brothers": "케미컬 브라더스",
    "The Prodigy": "프로디지",
    "Fatboy Slim": "팻보이 슬림",
    "Disclosure": "디스클로저",
    "Robin Schulz": "로빈 슐츠",
    "Lost Frequencies": "로스트 프리퀀시스",
    "Jonas Blue": "조나스 블루",
    "Cascada": "카스카다",
    "Scooter": "스쿠터",
    "250": "이오공",
    "Above & Beyond": "어보브 앤 비욘드",
    "Justice": "저스티스",
    "The Chainsmokers": "체인스모커스",
    "Porter Robinson": "포터 로빈슨",
    "Madeon": "마데온",
    "Alesso": "알레소",
    "Kaskade": "카스케이드",
    "Charlotte de Witte": "샬롯 드 비트",
    "Amelie Lens": "아멜리 렌즈",
    "Pendulum": "펜듈럼",
    "Rudimental": "루디멘탈",
    "Chase & Status": "체이스 앤 스테이터스",
    "Sub Focus": "서브 포커스",
    "Wilkinson": "윌킨슨",
    "Sigma": "시그마",
}

EXCLUDE_TITLE_KEYWORDS = (
    "inst.",
    "instrumental",
    "반주",
    "mr",
    "karaoke",
    "acappella",
    "a cappella",
    "commentary",
    "intro",
    "outro",
    "skit",
    "interlude",
    "remaster",
    "live at",
    "concert live",
    "sped up",
    "slowed",
    "nightcore",
    "acoustic version",
    "acoustic mix",
    "unplugged",
    "podcast",
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


def clean_edm_title(title: str) -> str:
    """Cleans title by stripping parenthetical tags and standard EDM mix suffixes."""
    t = clean_parentheses(title)
    t = re.sub(
        r"\s*[-–—]\s*(Radio Edit|Club Mix|Extended Mix|Original Mix|VIP Mix|VIP|Short Edit|Acoustic Version|Extended Version)\b.*$",
        "",
        t,
        flags=re.IGNORECASE,
    )
    return t.strip() or title.strip()


def is_valid_edm_title(title: str) -> bool:
    """Rejects non-music or unwanted variations."""
    if not title or len(title.strip()) < 1:
        return False
    lower = title.lower()
    for kw in EXCLUDE_TITLE_KEYWORDS:
        if kw in lower:
            return False
    return True


def fetch_artist_edm_tracks(
    artist_query: str,
    token: str,
    max_per_artist: int = 35,
) -> List[Dict[str, Any]]:
    """
    Fetches up to `max_per_artist` top tracks for an EDM artist across KR and US storefronts.
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
            if not is_valid_edm_title(raw_title):
                continue

            artist_name = attr.get("artistName") or primary_query
            if verify_artist:
                norm_a = normalize_token(artist_name)
                if norm_q not in norm_a and not (len(norm_q) >= 4 and norm_a in norm_q):
                    continue

            clean_t = clean_edm_title(raw_title)
            norm_t = normalize_token(clean_t)
            if not norm_t or norm_t in seen_norm_titles:
                continue

            seen_ids.add(tid_int)
            seen_norm_titles.add(norm_t)

            art_url = (attr.get("artwork") or {}).get("url") or ""
            if "{w}x{h}" in art_url:
                art_url = art_url.replace("{w}x{h}", "600x600")

            dur_ms = attr.get("durationInMillis")
            artist_ko = EDM_ARTIST_KO_MAP.get(primary_query) or artist_name
            tracks.append(
                {
                    "title": clean_t,
                    "title_ko": clean_t,
                    "artist": primary_query,
                    "artist_ko": artist_ko,
                    "normalized_key": make_normalized_key(primary_query, clean_t),
                    "album": attr.get("albumName") or "",
                    "cover_url": art_url,
                    "duration_sec": int(round(dur_ms / 1000.0)) if dur_ms else None,
                    "genre_tag": "edm",
                    "preview_url": preview_url,
                    "itunes_track_id": tid_int,
                    "source": "apple_music_kr",
                }
            )

    def _safe_get(url: str, params: Dict[str, Any]) -> Optional[requests.Response]:
        for attempt in range(4):
            try:
                resp = requests.get(url, params=params, headers=headers, timeout=12)
                if resp.status_code in (429, 403, 503):
                    time.sleep(1.5 * (attempt + 1))
                    continue
                return resp
            except Exception:
                time.sleep(0.5)
        return None

    # First attempt: KR catalog (with l=ko-KR)
    for storefront in ("kr", "us"):
        try:
            r = _safe_get(
                f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                params={"term": primary_query, "types": "artists", "limit": 4, "l": "ko-KR"},
            )
            if r and r.status_code == 200:
                artists_data = r.json().get("results", {}).get("artists", {}).get("data", [])
                matched_aid = None
                for a_obj in artists_data:
                    a_name = (a_obj.get("attributes") or {}).get("name") or ""
                    norm_cand = normalize_token(a_name)
                    if norm_q == norm_cand or (len(norm_q) >= 4 and norm_q in norm_cand):
                        matched_aid = a_obj.get("id")
                        break
                if matched_aid:
                    # Fetch top songs
                    for offset in (0, 25, 50):
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

            # Secondary query: song search if needed
            if len(tracks) < 15:
                r_s = _safe_get(
                    f"https://api.music.apple.com/v1/catalog/{storefront}/search",
                    params={"term": primary_query, "types": "songs", "limit": 25, "l": "ko-KR"},
                )
                if r_s and r_s.status_code == 200:
                    s_items = r_s.json().get("results", {}).get("songs", {}).get("data", [])
                    _add_song_items(s_items, verify_artist=True)
        except Exception:
            pass

        if len(tracks) >= 15:
            break

    return tracks


def enrich_english_metadata(tracks: List[Dict[str, Any]], token: str) -> None:
    """Enriches tracks with l=en-US metadata in batches of 250 IDs."""
    headers = {"Authorization": f"Bearer {token}"}
    batch_size = 250
    for i in range(0, len(tracks), batch_size):
        batch = tracks[i : i + batch_size]
        ids_str = ",".join(str(t["itunes_track_id"]) for t in batch if t.get("itunes_track_id"))
        if not ids_str:
            continue
        en_map: Dict[str, Dict[str, Any]] = {}
        for sf_code in ("kr", "us"):
            missing = [str(t["itunes_track_id"]) for t in batch if str(t["itunes_track_id"]) not in en_map]
            if not missing:
                break
            try:
                r = requests.get(
                    f"https://api.music.apple.com/v1/catalog/{sf_code}/songs",
                    params={"ids": ",".join(missing[:200]), "l": "en-US"},
                    headers=headers,
                    timeout=12,
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
                t["title_en"] = clean_edm_title(attr.get("name") or t["title"])
                t["artist_en"] = attr.get("artistName") or t["artist"]
            else:
                t["title_en"] = t["title"]
                t["artist_en"] = t["artist"]


def download_preview_worker(track: Dict[str, Any]) -> Optional[str]:
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


def analyze_edm_track_dsp(track: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    High-precision EDM Multiprocessing DSP Audio Analyzer.
    Applies genre-specialized priors (174 BPM for DnB, 138 BPM for Trance/Techno, 128 BPM for House),
    fine-hop parabolic lag refinement, and accurate harmonic disambiguation.
    Requires verified running_bpm strictly in [115, 180].
    """
    tid = track.get("itunes_track_id")
    audio_path = CACHE_DIR / f"{tid}.m4a"
    if not audio_path.exists():
        return None

    try:
        y, sr = _load_audio_mono_safe(str(audio_path), sr=22050)
        if len(y) < sr * 5:
            return None

        # Energy & spectral density
        rms_arr = librosa.feature.rms(y=y)
        energy_rms = float(np.mean(rms_arr))
        if energy_rms < 0.055:
            return None

        norm_artist = normalize_token(track.get("artist", ""))
        title_lower = (track.get("title") or "").lower()

        is_dnb = (
            norm_artist in DNB_TOKENS
            or "dnb" in title_lower
            or "drum & bass" in title_lower
            or "drum and bass" in title_lower
            or "jungle" in title_lower
        )
        is_trance_techno = (
            norm_artist in TRANCE_TECHNO_TOKENS
            or "trance" in title_lower
            or "techno" in title_lower
            or "hardstyle" in title_lower
            or "hardcore" in title_lower
        )

        # Onset envelopes
        hop = 512
        hop_fine = 128
        onset_512 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
        onset_128 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_fine)

        # Choose start_bpm prior based on subgenre
        if is_dnb:
            start_bpm = 174.0
        elif is_trance_techno:
            start_bpm = 138.0
        else:
            start_bpm = 128.0

        tempo_arr, beat_frames = librosa.beat.beat_track(
            onset_envelope=onset_512, sr=sr, hop_length=hop, start_bpm=start_bpm
        )
        coarse_bpm = float(np.atleast_1d(tempo_arr)[0])

        # Autocorrelation fine lag refinement
        max_size = int(sr / hop_fine * 3.5)
        ac = librosa.autocorrelate(onset_128, max_size=max_size)

        L_exp = (60.0 * sr) / (hop_fine * coarse_bpm)
        k_min = max(1, int(np.floor(L_exp * 0.92)))
        k_max = min(len(ac) - 2, int(np.ceil(L_exp * 1.08)))
        if k_min <= k_max and k_max < len(ac) - 1:
            k = k_min + int(np.argmax(ac[k_min : k_max + 1]))
            denom = ac[k - 1] - 2.0 * ac[k] + ac[k + 1] + 1e-12
            delta = float(np.clip(0.5 * (ac[k - 1] - ac[k + 1]) / denom, -0.5, 0.5))
            base_bpm = float((60.0 * sr) / (hop_fine * (k + delta)))
        else:
            base_bpm = coarse_bpm

        # Disambiguate BPM
        if is_dnb:
            # DnB is genuinely 165~178 BPM
            if base_bpm < 95.0:
                base_bpm *= 2.0  # restore from half-time (e.g. 87 -> 174)
            elif 110.0 <= base_bpm <= 122.0:
                base_bpm *= 1.5  # restore from 2/3 hemiola triplet lag (e.g. 116 -> 174)
            elif 127.0 <= base_bpm <= 134.0:
                base_bpm *= (4.0 / 3.0)  # restore from 3/4 lag (e.g. 130.5 -> 174)
            elif base_bpm > 185.0:
                base_bpm /= 2.0
        elif is_trance_techno:
            # Trance/Techno/Hardstyle is 135~155 BPM
            if base_bpm < 85.0:
                base_bpm *= 2.0
            elif base_bpm > 185.0:
                base_bpm /= 2.0
        else:
            # House / UKG / Festival EDM
            if 55.0 <= base_bpm < 95.0:
                base_bpm *= 2.0  # restore from half-time (e.g. 64 -> 128, 87 -> 174)
            elif base_bpm > 185.0:
                base_bpm /= 2.0

        raw_bpm = round(float(base_bpm), 1)
        running_bpm = int(round(raw_bpm))

        # Strict tempo window for running: 115 <= running_bpm <= 180
        if not (115 <= running_bpm <= 180):
            return None

        # Tempogram clarity
        tempogram = librosa.feature.tempogram(onset_envelope=onset_512, sr=sr, hop_length=hop)
        frame_peak_ratio = np.max(tempogram, axis=0) / (np.mean(tempogram, axis=0) + 1e-6)
        beat_clarity = float(np.clip((np.mean(frame_peak_ratio) - 1.5) / 4.5, 0.0, 1.0))

        # Beat salience
        valid_b = beat_frames[beat_frames < len(onset_512) - 2]
        if len(valid_b) > 0:
            beat_salience = float(np.mean(onset_512[valid_b]) / (np.mean(onset_512) + 1e-6))
        else:
            beat_salience = 1.0

        # Timing stability
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


def run_edm_collection() -> None:
    t0 = time.time()
    print("=" * 70)
    print("Starting PULSE EDM Genre Collector & DSP Analyzer")
    print(f"Target Artists: {len(ALL_EDM_ARTISTS)} artists")
    print(f"Output File: {OUTPUT_FILE}")
    print("=" * 70)

    token = generate_apple_music_token()

    # Step 1: Multithreaded Apple Music Catalog Query
    print(f"\n[Step 1/4] Fetching artist catalog top songs for {len(ALL_EDM_ARTISTS)} artists...")
    all_raw_tracks: List[Dict[str, Any]] = []
    seen_track_ids: Set[int] = set()
    seen_keys: Set[str] = set()

    with ThreadPoolExecutor(max_workers=15) as executor:
        future_to_artist = {
            executor.submit(fetch_artist_edm_tracks, artist, token, 35): artist
            for artist in ALL_EDM_ARTISTS
        }
        done_cnt = 0
        for future in as_completed(future_to_artist):
            done_cnt += 1
            art = future_to_artist[future]
            try:
                artist_tracks = future.result()
                for tr in artist_tracks:
                    tid = tr["itunes_track_id"]
                    nk = tr["normalized_key"]
                    if tid not in seen_track_ids and nk not in seen_keys:
                        seen_track_ids.add(tid)
                        seen_keys.add(nk)
                        all_raw_tracks.append(tr)
            except Exception as e:
                print(f"  Error fetching {art}: {e}")
            if done_cnt % 20 == 0 or done_cnt == len(ALL_EDM_ARTISTS):
                print(f"  Progress: {done_cnt}/{len(ALL_EDM_ARTISTS)} artists done, {len(all_raw_tracks)} tracks queued")

    print(f"Total raw tracks discovered: {len(all_raw_tracks)}")

    # Step 2: Bilingual Metadata Enrichment (l=en-US)
    print("\n[Step 2/4] Enriching bilingual English metadata (title_en, artist_en)...")
    enrich_english_metadata(all_raw_tracks, token)
    print("Bilingual enrichment complete.")

    # Step 3: Multithreaded Preview Audio Caching
    print("\n[Step 3/4] Downloading 30s preview audio files to /tmp/pulse_audio_cache/...")
    cached_count = 0
    with ThreadPoolExecutor(max_workers=25) as executor:
        futures = [executor.submit(download_preview_worker, tr) for tr in all_raw_tracks]
        for f in as_completed(futures):
            res = f.result()
            if res:
                cached_count += 1
    print(f"Audio cache ready: {cached_count}/{len(all_raw_tracks)} preview files available.")

    # Step 4: Multiprocessing Librosa DSP Analysis (8 workers)
    print("\n[Step 4/4] Running ProcessPoolExecutor (max_workers=8) Librosa DSP rhythm analysis...")
    analyzed_tracks: List[Dict[str, Any]] = []

    with ProcessPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(analyze_edm_track_dsp, tr) for tr in all_raw_tracks]
        for i, f in enumerate(as_completed(futures), 1):
            res = f.result()
            if res:
                analyzed_tracks.append(res)
            if i % 250 == 0 or i == len(all_raw_tracks):
                print(f"  DSP Progress: {i}/{len(all_raw_tracks)} analyzed, {len(analyzed_tracks)} valid in 115..180 BPM")

    # Deduplicate again just in case
    final_tracks: List[Dict[str, Any]] = []
    final_seen_ids: Set[int] = set()
    final_seen_keys: Set[str] = set()

    # Sort by running_score descending
    analyzed_tracks.sort(key=lambda x: x.get("running_score", 0.0), reverse=True)

    for tr in analyzed_tracks:
        tid = tr["itunes_track_id"]
        nk = tr["normalized_key"]
        if tid not in final_seen_ids and nk not in final_seen_keys:
            final_seen_ids.add(tid)
            final_seen_keys.add(nk)
            final_tracks.append(tr)

    print(f"\nFinal Deduplicated EDM Songs: {len(final_tracks)}")

    # Write output ONLY to crawler/data/new_edm_songs.json
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_tracks, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - t0
    print(f"Successfully saved {len(final_tracks)} EDM songs to {OUTPUT_FILE} in {elapsed:.1f}s")

    # Print summary statistics
    bpms = [t["running_bpm"] for t in final_tracks]
    scores = [t["running_score"] for t in final_tracks]
    b115_124 = sum(1 for b in bpms if 115 <= b <= 124)
    b125_130 = sum(1 for b in bpms if 125 <= b <= 130)
    b131_140 = sum(1 for b in bpms if 131 <= b <= 140)
    b141_160 = sum(1 for b in bpms if 141 <= b <= 160)
    b161_180 = sum(1 for b in bpms if 161 <= b <= 180)

    print("\n" + "=" * 50)
    print("EDM DATASET SUMMARY STATISTICS")
    print("=" * 50)
    print(f"Total Songs: {len(final_tracks)}")
    print(f"Average Running Score: {np.mean(scores):.1f} (min: {np.min(scores):.1f}, max: {np.max(scores):.1f})")
    print("BPM Cadence Distribution:")
    print(f"  115..124 BPM (Warmup / Deep / Melodic): {b115_124} ({b115_124/len(final_tracks)*100:.1f}%)")
    print(f"  125..130 BPM (Peak House / Mainstage):  {b125_130} ({b125_130/len(final_tracks)*100:.1f}%)")
    print(f"  131..140 BPM (Tech / Trance / UKG):      {b131_140} ({b131_140/len(final_tracks)*100:.1f}%)")
    print(f"  141..160 BPM (Fast Trance / Hardstyle):  {b141_160} ({b141_160/len(final_tracks)*100:.1f}%)")
    print(f"  161..180 BPM (Drum & Bass Sprints):     {b161_180} ({b161_180/len(final_tracks)*100:.1f}%)")
    print("=" * 50)


if __name__ == "__main__":
    run_edm_collection()
