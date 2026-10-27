"""Cheap audio descriptors that help the octave resolver (run inside crawler/tempo_ml/.venv/bt, librosa).

Per clip: onset density (onsets/s), RMS, low/mid/high onset-energy ratios, spectral flux level,
and the unbiased autocorrelation of the onset envelope sampled on a fine BPM grid (55-215 BPM, 1 BPM step)
so the resolver can score any candidate tempo c with ac(c), ac(c/2 -> 2x lag) etc. without re-reading audio.
"""

import numpy as np
import librosa

from common import decode_audio, parse_args, run_worker

HOP = 256
SR = 22050


def unbiased_ac(x):
    x = x - np.mean(x)
    n = len(x)
    nfft = 1 << (2 * n - 1).bit_length()
    fx = np.fft.rfft(x, n=nfft)
    ac = np.fft.irfft(fx * np.conj(fx), n=nfft)[:n] / np.maximum(n - np.arange(n), 1)
    return ac / ac[0] if ac[0] > 1e-12 else ac


if __name__ == "__main__":
    args = parse_args("feats")
    fps = SR / HOP
    grid = np.arange(40.0, 400.0, 1.0)  # candidate beat tempos (wide enough for 2x / 0.5x / 1.5x relatives)

    def process(tid, path):
        y = decode_audio(path, SR)
        dur = len(y) / SR
        osm = librosa.onset.onset_strength_multi(y=y, sr=SR, hop_length=HOP, channels=[0, 16, 64, 128])
        full = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
        ons = librosa.onset.onset_detect(onset_envelope=full, sr=SR, hop_length=HOP)
        ac = 0.40 * unbiased_ac(full) + 0.25 * unbiased_ac(osm[1]) + 0.25 * unbiased_ac(osm[2]) + 0.10 * unbiased_ac(osm[0])
        lags = 60.0 * fps / grid
        ac_at = np.interp(lags, np.arange(len(ac)), ac, right=0.0)
        band_e = np.array([float(np.mean(osm[i])) for i in range(3)]) + 1e-9
        return {
            "onset_rate": round(len(ons) / dur, 3),
            "rms": round(float(np.mean(librosa.feature.rms(y=y))), 5),
            "flux": round(float(np.mean(full)), 4),
            "band_ratio": [round(float(v), 4) for v in band_e / band_e.sum()],
            "ac_grid": [round(float(v), 4) for v in ac_at],
        }

    run_worker("feats", process, args)
