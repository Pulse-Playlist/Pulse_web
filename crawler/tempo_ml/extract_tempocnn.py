"""Essentia TempoCNN (deepsquare-k16 / deeptemp-k16) worker. Run inside crawler/tempo_ml/.venv/ess.

Usage: .venv/ess/bin/python extract_tempocnn.py [--shard 0/1]
Essentia does not expose a 256-bin tempo histogram, so we store the global tempo and the per-patch
local tempi (rounded); the resolver turns the local tempi into 'vote share' features per octave candidate.
"""

import numpy as np

from common import BASE, decode_audio, parse_args, run_worker

if __name__ == "__main__":
    args = parse_args("tempocnn")
    import essentia

    essentia.log.warningActive = False
    import essentia.standard as es

    models = {
        n: es.TempoCNN(graphFilename=str(BASE / "models" / f"{n}.pb"))
        for n in ("deepsquare-k16-3", "deeptemp-k16-3")
    }

    def process(tid, path):
        y = decode_audio(path, 11025)  # TempoCNN expects 11025 Hz mono
        out = {}
        for n, m in models.items():
            g, local, lp = m(y)
            key = "sq" if "square" in n else "tp"
            out[key] = float(g)
            out[key + "_local"] = [round(float(v), 1) for v in np.asarray(local)]
            out[key + "_prob"] = round(float(np.mean(lp)), 3) if len(lp) else None
        return out

    run_worker("tempocnn", process, args)
