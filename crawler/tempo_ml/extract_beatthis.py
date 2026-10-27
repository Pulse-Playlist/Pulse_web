"""Beat This! (CPJKU, ISMIR 2024) worker. Run inside crawler/tempo_ml/.venv/bt.

Usage: .venv/bt/bin/python extract_beatthis.py [--shard 0/1] [--device mps|cpu]
Stores: tempo from inlier-mean IBI, beat/downbeat counts, meter, beat times (compact) for later features.
"""

import argparse
import sys

import torch

from common import decode_audio, meter_from_downbeats, parse_args, run_worker, tempo_from_beats_mean

if __name__ == "__main__":
    pre = argparse.ArgumentParser(add_help=False)
    pre.add_argument("--device", default="mps" if torch.backends.mps.is_available() else "cpu")
    pre_args, rest = pre.parse_known_args()
    sys.argv = [sys.argv[0]] + rest
    args = parse_args("beatthis")

    from beat_this.inference import Audio2Beats

    model = Audio2Beats(checkpoint_path="final0", device=pre_args.device, dbn=False)

    def process(tid, path):
        y = decode_audio(path, 22050)
        beats, downs = model(y, 22050)
        if pre_args.device == "mps":
            torch.mps.synchronize()
        return {
            "bpm": tempo_from_beats_mean(beats),
            "meter": meter_from_downbeats(beats, downs),
            "nbeats": int(len(beats)),
            "beats": [round(float(b), 3) for b in beats],
            "downbeats": [round(float(b), 3) for b in downs],
        }

    run_worker("beatthis", process, args)
