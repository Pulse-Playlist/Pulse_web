#!/usr/bin/env bash
# Creates the three Python 3.11 virtualenvs used by the ML tempo ensemble.
# All envs live under crawler/tempo_ml/.venv/ (git-ignored by the `.venv/` rule).
# Python 3.15 (crawler/.venv) has no torch / essentia wheels, hence the separate envs.
# Requires `uv` (https://docs.astral.sh/uv/). No Homebrew / ffmpeg needed (audio is decoded via CoreAudio/audioread).
set -euo pipefail
cd "$(dirname "$0")"
UV="${UV:-$HOME/.local/bin/uv}"
mkdir -p .venv models

# 1) Beat This! (PyTorch, MPS on Apple Silicon)
"$UV" venv --python 3.11 .venv/bt
"$UV" pip install --python .venv/bt/bin/python torch torchaudio beat-this soundfile audioread librosa numpy scipy

# 2) madmom (git version, numpy<2, build isolation off)
"$UV" venv --python 3.11 .venv/mm
"$UV" pip install --python .venv/mm/bin/python "numpy<2" cython setuptools wheel mido scipy soundfile audioread librosa
"$UV" pip install --python .venv/mm/bin/python --no-build-isolation "git+https://github.com/CPJKU/madmom"

# 3) Essentia TempoCNN
"$UV" venv --python 3.11 .venv/ess
"$UV" pip install --python .venv/ess/bin/python essentia-tensorflow soundfile audioread librosa numpy scipy
for m in deepsquare-k16-3 deeptemp-k16-3; do
  [ -f "models/$m.pb" ] || curl -fL -o "models/$m.pb" "https://essentia.upf.edu/models/tempo/tempocnn/$m.pb"
done

# 4) Light env for the octave resolver / evaluation / apply step (scikit-learn)
"$UV" venv --python 3.11 .venv/res
"$UV" pip install --python .venv/res/bin/python numpy scipy scikit-learn requests python-dotenv

echo "OK: envs ready under $(pwd)/.venv"
