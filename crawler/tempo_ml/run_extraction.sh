#!/usr/bin/env bash
# Launches all extraction workers in the background (resumable: re-run to continue after an interruption).
# Thread counts are capped: uncapped BLAS/TF/torch threads oversubscribe the 8 cores (load > 60) and slow everything down.
# Logs: crawler/data/tempo_cand/logs/*.log
set -uo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1 PYTHONWARNINGS=ignore TF_CPP_MIN_LOG_LEVEL=3
export OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 VECLIB_MAXIMUM_THREADS=1 NUMBA_NUM_THREADS=1
mkdir -p ../data/tempo_cand/logs
L=../data/tempo_cand/logs

TF_NUM_INTRAOP_THREADS=2 TF_NUM_INTEROP_THREADS=1 nohup .venv/ess/bin/python extract_tempocnn.py --shard 0/1 >>"$L/tempocnn.log" 2>&1 &
OMP_NUM_THREADS=2 nohup .venv/bt/bin/python extract_beatthis.py --shard 0/1 >>"$L/beatthis.log" 2>&1 &
for i in 0 1; do
  nohup .venv/bt/bin/python extract_feats.py --shard $i/2 >>"$L/feats_$i.log" 2>&1 &
done
# madmom is NOT part of the default pipeline: adding it changed cross-validated accuracy by < 1 song in 590 while costing
# ~8 h of CPU. To run it anyway: for i in 0 1 2 3; do nohup nice -n 5 .venv/mm/bin/python extract_madmom.py --shard $i/4 ... & done
echo "launched"
