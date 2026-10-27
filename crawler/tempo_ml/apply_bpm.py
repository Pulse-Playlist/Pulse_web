"""
Applies resolved tempos (data/tempo_resolved.jsonl) to the local dataset and Supabase.

SAFE BY DESIGN
  * dry-run is the default: prints a change report and touches nothing.
  * --write  : 1) backs up songs.json, web/public/data/{songs,playlists}.json and the Supabase BPM columns to
                  data/backups/<timestamp>/, 2) updates the local files, 3) PATCHes ONLY the BPM columns in Supabase
                  (never deletes / inserts rows, never touches genre_tag or any other column), 4) verifies DB == local.
  * --rollback DIR : restores the local files and the Supabase BPM columns from a backup directory.
  * New columns (bpm_alt, bpm_confidence, bpm_source) are written only if they exist in the table
    (see the ALTER TABLE statement in README.md); otherwise they stay in the local JSON and a warning is printed.
  * data/ and web/public/data/*.json are git-ignored: nothing here can end up in a commit.

Run with crawler/tempo_ml/.venv/res/bin/python.
"""

import argparse
import json
import math
import os
import shutil
import sys
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

from common import CRAWLER, DATA

SONGS = DATA / "songs.json"
RESOLVED = DATA / "tempo_resolved.jsonl"
WEB_DATA = CRAWLER.parent / "web" / "public" / "data"
WEB_SONGS = WEB_DATA / "songs.json"
WEB_PLAYLISTS = WEB_DATA / "playlists.json"
BASE_COLS = ["raw_bpm", "running_bpm", "cadence_mode"]
NEW_COLS = ["bpm_alt", "bpm_confidence", "bpm_source"]
SOURCE_TAG = "ens_v1"


def supa() -> Dict[str, Any]:
    load_dotenv(CRAWLER / ".env")
    url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        sys.exit("Supabase credentials missing in crawler/.env")
    h = {"apikey": key}
    if not key.startswith("sb_"):
        h["Authorization"] = f"Bearer {key}"
    return {"url": url, "h": h}


def fetch_rows(s: Dict[str, Any], cols: str) -> List[Dict[str, Any]]:
    rows, off = [], 0
    while True:
        r = requests.get(f"{s['url']}/rest/v1/songs?select={cols}&limit=1000&offset={off}&order=id", headers=s["h"], timeout=60)
        r.raise_for_status()
        d = r.json()
        rows += d
        if len(d) < 1000:
            return rows
        off += 1000


def new_cols_exist(s: Dict[str, Any]) -> bool:
    r = requests.get(f"{s['url']}/rest/v1/songs?select={','.join(NEW_COLS)}&limit=1", headers=s["h"], timeout=30)
    return r.status_code == 200


def patch_rows(s: Dict[str, Any], todo: List[Any], workers: int = 16) -> List[Any]:
    hp = dict(s["h"], **{"Content-Type": "application/json", "Prefer": "return=minimal"})
    fails: List[Any] = []

    def go(t):
        rid, payload = t
        err = ""
        for _ in range(3):
            try:
                r = requests.patch(f"{s['url']}/rest/v1/songs?id=eq.{rid}", headers=hp, json=payload, timeout=30)
                if r.status_code in (200, 204):
                    return
                err = r.text[:150]
            except Exception as e:
                err = str(e)
            time.sleep(1)
        fails.append((rid, err))

    t0 = time.time()
    with ThreadPoolExecutor(workers) as ex:
        for n, _ in enumerate(ex.map(go, todo), 1):
            if n % 3000 == 0:
                print(f"  patched {n}/{len(todo)}  {time.time() - t0:.0f}s", flush=True)
    return fails


def build_new(songs: List[Dict[str, Any]], resolved: Dict[int, Dict[str, Any]]):
    out, changed = [], []
    for sg in songs:
        r = resolved.get(int(sg["itunes_track_id"]))
        if not r:
            out.append(sg)
            continue
        n = dict(sg)
        n["raw_bpm"] = float(r["bpm"])
        n["running_bpm"] = int(round(r["bpm"]))
        n["cadence_mode"] = "native"
        n["bpm_alt"] = r.get("bpm_alt")
        n["bpm_confidence"] = r.get("confidence")
        n["bpm_source"] = SOURCE_TAG
        out.append(n)
        changed.append((sg, n))
    return out, changed


def report(changed, songs_total: int) -> None:
    cls = Counter()
    hist_old, hist_new = Counter(), Counter()
    by_genre: Dict[str, Counter] = {}
    for o, n in changed:
        ob, nb = float(o["raw_bpm"]), float(n["raw_bpm"])
        q = nb / ob
        k = ("same(+-3%)" if abs(q - 1) <= 0.03 else "x2" if abs(q / 2 - 1) <= 0.04 else "x0.5" if abs(q / 0.5 - 1) <= 0.04
             else "x1.5" if abs(q / 1.5 - 1) <= 0.04 else "x0.667" if abs(q / (2 / 3) - 1) <= 0.04 else "other")
        cls[k] += 1
        by_genre.setdefault(o.get("genre_tag") or "?", Counter())[k] += 1
        hist_old[int(ob // 10 * 10)] += 1
        hist_new[int(nb // 10 * 10)] += 1
    print(f"\nresolved songs: {len(changed)} of {songs_total}")
    print("old -> new relation:", dict(cls))
    print("per genre:", {g: dict(c) for g, c in sorted(by_genre.items())})
    print("alt present:", sum(1 for _, n in changed if n.get("bpm_alt")), "| confidence<0.5:", sum(1 for _, n in changed if (n.get("bpm_confidence") or 0) < 0.5))
    print("BPM histogram (10-BPM bins)  old | new")
    for b in sorted(set(hist_old) | set(hist_new)):
        print(f"  [{b:3}-{b + 10:3}) {hist_old[b]:6} | {hist_new[b]:6}")


def sync_playlists(new_by_id: Dict[int, Dict[str, Any]]) -> int:
    if not WEB_PLAYLISTS.exists():
        return 0
    pls = json.load(open(WEB_PLAYLISTS, encoding="utf-8"))
    n = 0
    for pl in pls:
        for s in pl.get("songs", []):
            nw = new_by_id.get(s.get("itunes_track_id"))
            if nw:
                for k in ("raw_bpm", "running_bpm", "cadence_mode") + tuple(NEW_COLS):
                    s[k] = nw.get(k)
                n += 1
    tmp = WEB_PLAYLISTS.with_suffix(".json.tmp")
    json.dump(pls, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    tmp.replace(WEB_PLAYLISTS)
    return n


def write_json_atomic(path: Path, obj: Any) -> None:
    tmp = path.with_suffix(".json.tmp")
    json.dump(obj, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    tmp.replace(path)


def cmd_write(args) -> None:
    songs = json.load(open(SONGS, encoding="utf-8"))
    resolved = {}
    for line in open(RESOLVED):
        r = json.loads(line)
        resolved[int(r["id"])] = r
    new_songs, changed = build_new(songs, resolved)
    report(changed, len(songs))
    if not args.write:
        print("\n[dry-run] nothing written. Re-run with --write to apply.")
        return
    if len(changed) < 0.95 * len(songs) and not args.allow_partial:
        sys.exit(f"only {len(changed)}/{len(songs)} songs resolved; finish the extraction first (or pass --allow-partial)")

    s = supa()
    bdir = DATA / "backups" / datetime.now().strftime("%Y%m%d_%H%M%S")
    bdir.mkdir(parents=True, exist_ok=True)
    for src, nm in ((SONGS, "songs.json"), (WEB_SONGS, "web_songs.json"), (WEB_PLAYLISTS, "playlists.json")):
        if src.exists():
            shutil.copy2(src, bdir / nm)
    has_new = new_cols_exist(s)
    snap_cols = ",".join(["id", "normalized_key", "itunes_track_id"] + BASE_COLS + (NEW_COLS if has_new else []))
    db_rows = fetch_rows(s, snap_cols)
    json.dump(db_rows, open(bdir / "supabase_bpm_columns.json", "w"))
    print(f"\nbackup -> {bdir}  (supabase rows: {len(db_rows)}, new columns present: {has_new})")
    if not has_new:
        print("WARNING: bpm_alt / bpm_confidence / bpm_source columns do not exist in Supabase yet -> only raw_bpm/running_bpm/cadence_mode are patched. "
              "Run the ALTER TABLE from README.md, then re-run with --write.")

    # local files first
    write_json_atomic(SONGS, new_songs)
    if WEB_SONGS.parent.exists():
        shutil.copy2(SONGS, WEB_SONGS)
    new_by_id = {int(n["itunes_track_id"]): n for _, n in changed}
    print("playlists.json embedded songs updated:", sync_playlists(new_by_id))

    # Supabase: PATCH only BPM columns, matched by normalized_key
    local_by_key = {n["normalized_key"]: n for n in new_songs if n.get("normalized_key")}
    todo, unmatched = [], 0
    for row in db_rows:
        n = local_by_key.get(row["normalized_key"])
        if not n or int(n["itunes_track_id"]) not in resolved:
            unmatched += 1
            continue
        payload = {"raw_bpm": n["raw_bpm"], "running_bpm": n["running_bpm"], "cadence_mode": n["cadence_mode"]}
        if has_new:
            payload.update({c: n.get(c) for c in NEW_COLS})
        if all(row.get(k) == v for k, v in payload.items()):
            continue
        todo.append((row["id"], payload))
    print(f"supabase rows to patch: {len(todo)}  (db rows without resolved local match: {unmatched})")
    fails = patch_rows(s, todo)
    print(f"patched {len(todo) - len(fails)}, failed {len(fails)} {fails[:3]}")

    # verification
    after = fetch_rows(s, "normalized_key,raw_bpm,running_bpm")
    bad = [r for r in after if r["normalized_key"] in local_by_key and int(local_by_key[r["normalized_key"]]["itunes_track_id"]) in resolved
           and (abs(float(r["raw_bpm"]) - local_by_key[r["normalized_key"]]["raw_bpm"]) > 0.01
                or r["running_bpm"] != local_by_key[r["normalized_key"]]["running_bpm"])]
    print(f"verification: db rows {len(after)}, mismatches vs local: {len(bad)}")
    print(f"ROLLBACK:  .venv/res/bin/python apply_bpm.py --rollback {bdir}")


def cmd_rollback(args) -> None:
    bdir = Path(args.rollback)
    s = supa()
    for nm, dst in (("songs.json", SONGS), ("web_songs.json", WEB_SONGS), ("playlists.json", WEB_PLAYLISTS)):
        if (bdir / nm).exists():
            shutil.copy2(bdir / nm, dst)
            print("restored", dst)
    snap = json.load(open(bdir / "supabase_bpm_columns.json"))
    has_new = new_cols_exist(s)
    todo = []
    for r in snap:
        p = {k: r.get(k) for k in BASE_COLS}
        if has_new:
            p.update({c: r.get(c) for c in NEW_COLS})  # None when they did not exist before -> cleared
        todo.append((r["id"], p))
    fails = patch_rows(s, todo)
    print(f"rolled back {len(todo) - len(fails)} rows, failed {len(fails)}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--allow-partial", action="store_true")
    ap.add_argument("--rollback", default=None, help="backup directory to restore")
    args = ap.parse_args()
    cmd_rollback(args) if args.rollback else cmd_write(args)


if __name__ == "__main__":
    main()
