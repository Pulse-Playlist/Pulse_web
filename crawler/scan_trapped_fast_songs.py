"""
Universal Unbiased Autocorrelation Harmonic Pair Scanner for all 9,975 songs.
Finds every song where `librosa.beat.beat_track(start_bpm=124.0)` trapped a fast
145..206 BPM band/rock/kpop track into a 0.5x half-time (85..104 BPM) or 2/3x
triplet-subharmonic (105..133 BPM) tempo!
"""

from concurrent.futures import ProcessPoolExecutor
import json
from pathlib import Path
import librosa
import numpy as np

from mass_collector_lib import CACHE_DIR, _load_audio_mono

BASE_DIR = Path(__file__).resolve().parent


def scan_track_harmonic_pairs(s: dict):
    tid = s.get("itunes_track_id")
    p = CACHE_DIR / f"{tid}.m4a"
    if not p.exists():
        return None
    try:
        y, sr = _load_audio_mono(str(p), sr=22050)
        hop = 128
        onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
        ac = librosa.autocorrelate(onset, max_size=int(sr / hop * 3.0))
        ac_norm = ac / (ac[0] + 1e-6)

        l_min = int(60 * sr / (hop * 208))
        l_max = int(60 * sr / (hop * 65))
        peaks = []
        for lag in range(l_min, min(l_max, len(ac_norm) - 2)):
            if ac_norm[lag] > ac_norm[lag - 1] and ac_norm[lag] > ac_norm[lag + 1]:
                denom = ac_norm[lag - 1] - 2.0 * ac_norm[lag] + ac_norm[lag + 1] + 1e-12
                delta = float(np.clip(0.5 * (ac_norm[lag - 1] - ac_norm[lag + 1]) / denom, -0.5, 0.5))
                bpm_v = round(60.0 * sr / (hop * (lag + delta)), 1)
                peaks.append((round(float(ac_norm[lag]), 3), bpm_v))
        peaks.sort(reverse=True)

        pair_candidates = []
        for v1, b1 in peaks:
            if 72.0 <= b1 <= 104.5:
                for v2, b2 in peaks:
                    if abs(b2 - 2.0 * b1) / (2.0 * b1) <= 0.038:
                        pair_candidates.append((round(v1 + v2, 3), b1, b2, v1, v2))
        pair_candidates.sort(reverse=True)

        mid_peaks = [(v, b) for v, b in peaks if 105.0 <= b <= 135.5]
        vm, bm = mid_peaks[0] if mid_peaks else (0.0, 0.0)

        if not pair_candidates:
            return None

        pair_sum, b1, b2, v1, v2 = pair_candidates[0]
        cur_bpm = float(s.get("raw_bpm") or 0)

        # We are looking for songs currently stuck in 85..135 BPM where (b1, b2) is the true dominant harmonic pair!
        if 84.0 <= cur_bpm <= 135.5 and v1 >= 0.62 and v2 >= 0.62:
            # Check if cur_bpm is either ~b1 (half-time trap) or ~1.333*b1 (triplet 2/3 trap of b2)
            is_half_trap = abs(cur_bpm - b1) <= 4.5
            is_triplet_trap = abs(cur_bpm - (b2 * 2.0 / 3.0)) <= 5.5 and v1 >= vm * 0.90 and v2 >= vm * 0.90
            if is_half_trap or is_triplet_trap:
                S = np.abs(librosa.stft(y, n_fft=2048, hop_length=256))
                flat = round(float(np.mean(librosa.feature.spectral_flatness(S=S))), 4)
                cent = int(round(float(np.mean(librosa.feature.spectral_centroid(S=S, sr=sr)))))
                rms = round(float(np.mean(librosa.feature.rms(S=S))), 3)
                zcr = round(float(np.mean(librosa.feature.zero_crossing_rate(y))), 3)
                return {
                    "key": s["normalized_key"],
                    "genre_tag": s["genre_tag"],
                    "artist": s["artist"],
                    "title": s["title"],
                    "cur_bpm": cur_bpm,
                    "b1": b1,
                    "b2": b2,
                    "v1": v1,
                    "v2": v2,
                    "vm": vm,
                    "trap_type": "HALF_TRAP" if is_half_trap else "TRIPLET_2_3_TRAP",
                    "rms": rms,
                    "flat": flat,
                    "cent": cent,
                    "zcr": zcr,
                }
        return None
    except Exception:
        return None


def main():
    with open(BASE_DIR / "data" / "songs.json", "r", encoding="utf-8") as f:
        songs = json.load(f)

    # Scan band, rock, kpop tracks in 84..135.5 BPM that were NOT just intentionally halved from >=134
    decisions = {}
    for cat in ["kpop", "band", "rock", "hiphop"]:
        p = Path(f"/tmp/decisions_{cat}.json")
        if p.exists():
            decisions.update(json.loads(p.read_text()))

    candidates = [
        s
        for s in songs
        if s["genre_tag"] in ("band", "rock", "kpop")
        and 84.0 <= (s.get("raw_bpm") or 0) <= 135.5
        and decisions.get(s.get("normalized_key")) != "HALVE"
    ]
    print(f"Scanning {len(candidates)} band/rock/kpop tracks in 84..135.5 BPM for 0.5x and 2/3x traps...")

    found = []
    with ProcessPoolExecutor(max_workers=6) as pool:
        for res in pool.map(scan_track_harmonic_pairs, candidates):
            if res:
                found.append(res)

    print(f"Found {len(found)} tracks with strong (B1, B2) harmonic pairs!")
    for cat in ("band", "rock", "kpop"):
        c_list = [x for x in found if x["genre_tag"] == cat]
        with open(f"/tmp/trapped_{cat}.json", "w", encoding="utf-8") as f:
            json.dump(c_list, f, ensure_ascii=False, indent=2)
        print(f"  Saved /tmp/trapped_{cat}.json: {len(c_list)} tracks")


if __name__ == "__main__":
    main()
