"""
Extracts detailed acoustic & rhythmic diagnostics for all tracks with running_bpm >= 134
so we can accurately disambiguate 2x double-time errors across all 9,975 songs.
"""

from concurrent.futures import ProcessPoolExecutor
import json
from pathlib import Path
import librosa
import numpy as np

from mass_collector_lib import CACHE_DIR, _load_audio_mono

BASE_DIR = Path(__file__).resolve().parent


def compute_extra_features(s: dict):
    tid = s.get("itunes_track_id")
    p = CACHE_DIR / f"{tid}.m4a"
    if not p.exists():
        return (s["normalized_key"], None)
    try:
        y, sr = _load_audio_mono(str(p), sr=22050)
        hop = 256
        S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
        dur = max(1.0, len(y) / sr)

        ks_onset = librosa.onset.onset_strength(
            S=librosa.amplitude_to_db(S[(freqs >= 40) & (freqs <= 1500), :]),
            sr=sr,
            hop_length=hop,
        )
        ks_peaks = librosa.onset.onset_detect(
            onset_envelope=ks_onset, sr=sr, hop_length=hop, delta=0.15, wait=8
        )
        ks_rate = round(len(ks_peaks) / dur, 2)

        kick_onset = librosa.onset.onset_strength(
            S=librosa.amplitude_to_db(S[(freqs >= 40) & (freqs <= 130), :]),
            sr=sr,
            hop_length=hop,
        )
        kick_peaks = librosa.onset.onset_detect(
            onset_envelope=kick_onset, sr=sr, hop_length=hop, delta=0.20, wait=10
        )
        kick_rate = round(len(kick_peaks) / dur, 2)

        flat = round(float(np.mean(librosa.feature.spectral_flatness(S=S))), 4)
        cent = int(round(float(np.mean(librosa.feature.spectral_centroid(S=S, sr=sr)))))
        rms = round(float(np.mean(librosa.feature.rms(S=S))), 3)

        # Also check autocorrelation at half-tempo lag vs full-tempo lag on low+mid onset
        ac = librosa.autocorrelate(ks_onset, max_size=int(sr / hop * 4))
        bpm = float(s.get("raw_bpm") or 140.0)
        lag1 = max(1, int(round(60.0 * sr / (hop * bpm))))
        lag2 = max(1, int(round(60.0 * sr / (hop * (bpm / 2.0)))))
        ac_half_ratio = round(float(ac[lag2] / (ac[lag1] + 1e-6)), 2) if lag2 < len(ac) else 1.0

        return (
            s["normalized_key"],
            {
                "ks_rate": ks_rate,
                "kick_rate": kick_rate,
                "flat": flat,
                "cent": cent,
                "stft_rms": rms,
                "ac_half_ratio": ac_half_ratio,
            },
        )
    except Exception:
        return (s["normalized_key"], None)


def main():
    with open(BASE_DIR / "data" / "songs.json", "r", encoding="utf-8") as f:
        songs = json.load(f)

    high_songs = [s for s in songs if (s.get("running_bpm") or 0) >= 134]
    print(f"Computing extra features for {len(high_songs)} songs >= 134 BPM...")

    with ProcessPoolExecutor(max_workers=6) as pool:
        res = dict(pool.map(compute_extra_features, high_songs))

    for cat in ["kpop", "band", "rock", "hiphop"]:
        cat_list = []
        for s in high_songs:
            if s["genre_tag"] != cat:
                continue
            ex = res.get(s["normalized_key"]) or {}
            cat_list.append(
                {
                    "key": s["normalized_key"],
                    "artist": s["artist"],
                    "title": s["title"],
                    "title_en": s.get("title_en", ""),
                    "album": s.get("album", ""),
                    "raw_bpm": s["raw_bpm"],
                    "running_bpm": s["running_bpm"],
                    "half_bpm": round(s["raw_bpm"] / 2.0, 1),
                    "energy_rms": s.get("energy_rms", 0),
                    "beat_clarity": s.get("beat_clarity", 0),
                    "ks_rate": ex.get("ks_rate", 0),
                    "kick_rate": ex.get("kick_rate", 0),
                    "flat": ex.get("flat", 0),
                    "cent": ex.get("cent", 0),
                    "ac_half_ratio": ex.get("ac_half_ratio", 1.0),
                }
            )
        cat_list.sort(key=lambda x: -x["raw_bpm"])
        out_p = Path(f"/tmp/high_audit_{cat}.json")
        with open(out_p, "w", encoding="utf-8") as f:
            json.dump(cat_list, f, ensure_ascii=False, indent=2)
        print(f"Saved {out_p}: {len(cat_list)} songs")


if __name__ == "__main__":
    main()
