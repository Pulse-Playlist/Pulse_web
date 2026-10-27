"""madmom (RNN beat activation + DBN beat tracker, comb tempo estimator) worker. Run inside crawler/tempo_ml/.venv/mm.

Usage: SHARD via flag: .venv/mm/bin/python extract_madmom.py --shard 0/4
"""

from madmom.audio.signal import Signal
from madmom.features.beats import DBNBeatTrackingProcessor, RNNBeatProcessor
from madmom.features.tempo import TempoEstimationProcessor

from common import decode_audio, parse_args, run_worker, tempo_from_beats_mean

if __name__ == "__main__":
    args = parse_args("madmom")
    rnn = RNNBeatProcessor()
    dbn = DBNBeatTrackingProcessor(fps=100)
    tempo = TempoEstimationProcessor(fps=100, min_bpm=40, max_bpm=250)

    def process(tid, path):
        y = decode_audio(path, 44100)
        sig = Signal(y, sample_rate=44100, num_channels=1)
        act = rnn(sig)
        beats = dbn(act)
        tp = tempo(act)  # [[bpm, strength], ...] sorted by strength
        return {
            "bpm": tempo_from_beats_mean(beats),
            "nbeats": int(len(beats)),
            "comb": float(tp[0, 0]),
            "comb2": float(tp[1, 0]) if len(tp) > 1 else None,
            "comb_s1": float(tp[0, 1]),
            "comb_s2": float(tp[1, 1]) if len(tp) > 1 else None,
        }

    run_worker("madmom", process, args)
