"""
Shared helpers for the ML tempo ensemble workers (Beat This!, TempoCNN, madmom, audio features).

Every worker:
  * reads the song list `crawler/data/tempo_songlist.json` (written from songs.json),
  * processes only its shard (`--shard i/N`), ground-truth songs FIRST so evaluation can start early,
  * decodes the cached 30 s preview (`/tmp/pulse_audio_cache/{itunes_track_id}.m4a`) via CoreAudio (audioread),
  * appends one JSON line per song to `crawler/data/tempo_cand/{name}_{i}of{N}.jsonl` and is resumable.
Nothing here touches songs.json, web data or Supabase.
"""

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Set

import numpy as np

BASE = Path(__file__).resolve().parent
CRAWLER = BASE.parent
DATA = CRAWLER / "data"
CAND_DIR = DATA / "tempo_cand"
SONGLIST = DATA / "tempo_songlist.json"
GT_PATHS = [DATA / "bpm_gt" / "gt_expanded.json", DATA / "bpm_gt" / "gt_core81_verified.json"]
AUDIO_CACHE = Path("/tmp/pulse_audio_cache")


def audio_path(track_id: Any) -> Path:
    return AUDIO_CACHE / f"{track_id}.m4a"


def ensure_audio(track_id: Any, preview_url: Optional[str]) -> Optional[Path]:
    """Returns the cached preview path, downloading it first if it is missing."""
    p = audio_path(track_id)
    if p.exists() and p.stat().st_size > 10000:
        return p
    if not preview_url:
        return None
    import requests

    AUDIO_CACHE.mkdir(parents=True, exist_ok=True)
    r = requests.get(preview_url, timeout=20)
    r.raise_for_status()
    p.write_bytes(r.content)
    return p


def decode_audio(path: Path, sr: int) -> np.ndarray:
    """m4a/mp3 -> mono float32 at `sr` (CoreAudio via audioread, resampled with librosa)."""
    import audioread
    import librosa

    with audioread.audio_open(str(path)) as f:
        orig_sr, ch = f.samplerate, f.channels
        y = np.frombuffer(b"".join(f), dtype=np.int16).astype(np.float32) / 32768.0
    if ch > 1:
        y = y.reshape(-1, ch).mean(axis=1)
    if orig_sr != sr:
        y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)
    return np.ascontiguousarray(y, dtype=np.float32)


def gt_ids() -> Set[int]:
    ids: Set[int] = set()
    for p in GT_PATHS:
        if p.exists():
            for x in json.load(open(p)):
                ids.add(int(x["itunes_track_id"]))
    return ids


def load_songlist() -> List[Dict[str, Any]]:
    songs = json.load(open(SONGLIST))
    g = gt_ids()
    songs.sort(key=lambda s: (0 if int(s["itunes_track_id"]) in g else 1))
    return songs


def parse_args(name: str) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description=f"{name} tempo candidate extraction")
    ap.add_argument("--shard", default="0/1", help="i/N")
    ap.add_argument("--limit", type=int, default=0, help="debug: stop after this many songs")
    return ap.parse_args()


def run_worker(name: str, process_fn, args: argparse.Namespace) -> None:
    """Generic resumable loop. `process_fn(track_id, audio_path) -> dict` returns the fields to store."""
    si, sn = (int(v) for v in args.shard.split("/"))
    CAND_DIR.mkdir(parents=True, exist_ok=True)
    out_path = CAND_DIR / f"{name}_{si}of{sn}.jsonl"
    done: Set[int] = set()
    if out_path.exists():
        for line in open(out_path):
            try:
                done.add(int(json.loads(line)["id"]))
            except Exception:
                pass
    songs = [s for i, s in enumerate(load_songlist()) if i % sn == si]
    todo = [s for s in songs if int(s["itunes_track_id"]) not in done]
    print(f"[{name} {si}/{sn}] total {len(songs)}, already done {len(done)}, todo {len(todo)}", flush=True)
    t0 = time.time()
    n = 0
    with open(out_path, "a", buffering=1) as fout:
        for s in todo:
            tid = int(s["itunes_track_id"])
            try:
                p = ensure_audio(tid, s.get("preview_url"))
                if p is None:
                    rec = {"id": tid, "error": "no_audio"}
                else:
                    rec = {"id": tid, **process_fn(tid, p)}
            except Exception as exc:  # keep going, record the failure
                rec = {"id": tid, "error": f"{type(exc).__name__}: {str(exc)[:120]}"}
            fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
            n += 1
            if n % 200 == 0:
                el = time.time() - t0
                print(f"[{name} {si}/{sn}] {n}/{len(todo)}  {el:.0f}s  ETA {(len(todo) - n) * el / n / 60:.0f} min", flush=True)
            if args.limit and n >= args.limit:
                break
    print(f"[{name} {si}/{sn}] finished {n} in {time.time() - t0:.0f}s", flush=True)


def tempo_from_beats_mean(beats) -> float:
    """Mean of inlier inter-beat intervals (0.85..1.18 x median): sub-frame resolution (median IBI is frame-quantized)."""
    b = np.asarray(beats, dtype=float)
    if len(b) < 3:
        return float("nan")
    ibi = np.diff(b)
    m = np.median(ibi)
    good = ibi[(ibi > 0.85 * m) & (ibi < 1.18 * m)]
    if len(good) < 2:
        good = ibi
    return float(60.0 / np.mean(good))


def meter_from_downbeats(beats, downbeats) -> Optional[int]:
    b = np.asarray(beats)
    d = np.asarray(downbeats)
    if len(d) < 2:
        return None
    counts = [int(np.sum((b >= a - 1e-3) & (b < c - 1e-3))) for a, c in zip(d[:-1], d[1:])]
    if not counts:
        return None
    vals, cnt = np.unique(counts, return_counts=True)
    return int(vals[np.argmax(cnt)])
