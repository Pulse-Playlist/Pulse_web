"""
Octave / meter resolver for the ML tempo ensemble.

Pipeline (see crawler/tempo_ml/README.md):
  extract_*.py  ->  data/tempo_cand/*.jsonl   (Beat This!, TempoCNN x2, madmom, audio features)
  octave_resolver.py  (this file)             -> picks ONE beat tempo per song among octave-related candidates

How it works
  1. Every estimator gives an opinion e_k (Beat This!, madmom DBN, madmom comb, TempoCNN square/temporal, previous DSP value).
  2. Candidates = clusters (within 4 %) of {e, 2e, e/2} over all opinions, restricted to 50-230 BPM.
  3. A small logistic model scores each candidate from song-independent features: exact votes / half / double votes,
     TempoCNN local-tempo vote share, log2(BPM/120) (+genre interaction), onset-envelope autocorrelation support at the
     candidate, 2x, 1/2 and 1/3 tempo (binary vs ternary hierarchy), onsets per beat, loudness, low-band share.
     NO titles, artists or per-song rules are used anywhere.
  4. Output: bpm (best candidate, sub-frame refined), bpm_alt (octave-related runner-up when it is plausible),
     bpm_confidence (normalised probability of the winner), bpm_source.

CLI (run with crawler/tempo_ml/.venv/res/bin/python):
  octave_resolver.py cv [--folds 5]     cross-validated evaluation on the ground-truth songs + baselines
  octave_resolver.py train              fit on all ground truth, write octave_model.json
  octave_resolver.py predict            resolve every song that has candidates -> data/tempo_resolved.jsonl
"""

import argparse
import glob
import json
import math
import sys
from collections import Counter, defaultdict
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from common import BASE, CAND_DIR, DATA, GT_PATHS, SONGLIST

MODEL_PATH = BASE / "octave_model.json"
RESOLVED_PATH = DATA / "tempo_resolved.jsonl"
GENRES = ["kpop", "hiphop", "rock", "band", "pop", "edm", "jpop"]
TOL_LABEL = 0.03  # +-3 % counts as the right tempo
TOL_VOTE = 0.04  # +-4 % counts as 'same tempo' between estimators
GRID0 = 40.0  # first BPM of the stored autocorrelation grid (1 BPM step)
BPM_MIN, BPM_MAX = 50.0, 230.0
MODELS = ["bt", "mm", "mmc", "sq", "tp"]  # audio models (the previous DSP value is handled separately as 'old')

FEATURE_NAMES: List[str] = []
USE_MADMOM = True  # set False by --no-madmom: madmom values are then ignored completely (train AND predict must match)


# --------------------------------------------------------------------------- data loading
def load_records() -> Dict[int, Dict[str, Any]]:
    """Merge all worker outputs + old DSP value into one dict per song id."""
    recs: Dict[int, Dict[str, Any]] = defaultdict(dict)
    for s in json.load(open(SONGLIST)):
        i = int(s["itunes_track_id"])
        recs[i]["genre"] = s.get("genre_tag")
        recs[i]["old"] = s.get("raw_bpm")
    for path in glob.glob(str(CAND_DIR / "*.jsonl")):
        name = path.split("/")[-1].split("_")[0]
        for line in open(path):
            try:
                r = json.loads(line)
            except Exception:
                continue
            if "error" in r:
                continue
            recs[int(r["id"])][name] = r
    return recs


def load_gt() -> Dict[int, Dict[str, Any]]:
    """id -> {true, alts[], conf, genre}. 'alts' are other octave readings for songs with disagreeing sources."""
    out: Dict[int, Dict[str, Any]] = {}
    for p in GT_PATHS:
        if not p.exists():
            continue
        for x in json.load(open(p)):
            i = int(x["itunes_track_id"])
            t = float(x["true_bpm"])
            alts = []
            if x.get("alt_bpm"):
                alts.append(float(x["alt_bpm"]))
            if x.get("confidence") == "ambiguous":
                for s in x.get("sources") or []:
                    try:
                        b = float(s.get("bpm"))
                    except Exception:
                        continue
                    r = b / t
                    if any(abs(r / m - 1) <= TOL_LABEL for m in (2.0, 0.5)):
                        alts.append(b)
            out[i] = {"true": t, "alts": alts, "conf": x.get("confidence", "high")}
    return out


# --------------------------------------------------------------------------- candidates & features
def _f(v: Any) -> Optional[float]:
    try:
        v = float(v)
        return v if math.isfinite(v) and v > 0 else None
    except Exception:
        return None


def estimates(rec: Dict[str, Any]) -> Dict[str, Optional[float]]:
    bt = rec.get("beatthis") or {}
    mm = rec.get("madmom") or {}
    tc = rec.get("tempocnn") or {}
    return {
        "bt": _f(bt.get("bpm")),
        "mm": _f(mm.get("bpm")) if USE_MADMOM else None,
        "mmc": _f(mm.get("comb")) if USE_MADMOM else None,
        "sq": _f(tc.get("sq")),
        "tp": _f(tc.get("tp")),
        "old": _f(rec.get("old")),
    }


def make_candidates(est: Dict[str, Optional[float]]) -> List[float]:
    raw = []
    for k, e in est.items():
        if e is None:
            continue
        for m in (1.0, 2.0, 0.5):
            c = e * m
            if BPM_MIN <= c <= BPM_MAX:
                raw.append((c, 0 if m == 1.0 else 1))
    raw.sort()
    clusters: List[List[Tuple[float, int]]] = []
    for c, d in raw:
        if clusters and abs(c / np.median([x[0] for x in clusters[-1]]) - 1) <= TOL_VOTE:
            clusters[-1].append((c, d))
        else:
            clusters.append([(c, d)])
    cands = []
    for cl in clusters:
        prim = [c for c, d in cl if d == 0]
        cands.append(float(np.median(prim if prim else [c for c, _ in cl])))
    return cands


def _near(a: Optional[float], b: float, tol: float = TOL_VOTE) -> float:
    return 1.0 if a is not None and abs(a / b - 1) <= tol else 0.0


def _ac(feats: Dict[str, Any], bpm: float) -> float:
    g = feats.get("ac_grid")
    if not g:
        return 0.0
    x = bpm - GRID0
    if x < 0 or x > len(g) - 1:
        return 0.0
    k = int(x)
    fr = x - k
    return float((1 - fr) * g[k] + fr * g[min(k + 1, len(g) - 1)])


def candidate_features(c: float, est: Dict[str, Optional[float]], rec: Dict[str, Any], genre: Optional[str]) -> np.ndarray:
    f = rec.get("feats") or {}
    tc = rec.get("tempocnn") or {}
    audio = [est[k] for k in MODELS]
    ex = [_near(e, c) for e in audio]
    hf = [_near(e, c / 2) for e in audio]  # model says half of c
    db = [_near(e, c * 2) for e in audio]  # model says double of c
    local = [v for key in ("sq_local", "tp_local") for v in (tc.get(key) or [])]
    nl = max(len(local), 1)
    ls = sum(_near(v, c) for v in local) / nl
    lh = sum(_near(v, c / 2) for v in local) / nl
    ld = sum(_near(v, c * 2) for v in local) / nl
    old = est["old"]
    n_ex = sum(ex)
    logc = math.log2(c / 120.0)
    a0, ah, ad, a3 = _ac(f, c), _ac(f, c / 2), _ac(f, c * 2), _ac(f, c / 3)
    onset_rate = float(f.get("onset_rate") or 0.0)
    opb = math.log2(max(onset_rate, 0.2) / (c / 60.0))
    br = f.get("band_ratio") or [0.33, 0.33, 0.34]
    gen = [1.0 if genre == g else 0.0 for g in GENRES]
    bt_meter = (rec.get("beatthis") or {}).get("meter")
    vals = (
        ex  # 5
        + [n_ex, sum(hf), sum(db)]  # 3
        + [_near(old, c), _near(old, c / 2), _near(old, c * 2)]  # 3
        + [ls, lh, ld]  # 3
        + [logc, logc * logc]  # 2
        + [g * logc for g in gen]  # 7
        + [a0, ah, ad, a3, a0 - ah, ad - a0]  # 6
        + [opb, opb * logc]  # 2
        + [float(f.get("rms") or 0.0) * 10, float(br[0]), float(f.get("flux") or 0.0)]  # 3
        + [1.0 if bt_meter == 3 else 0.0]  # 1
    )
    return np.asarray(vals, dtype=np.float64)


FEATURE_NAMES = (
    [f"vote_{k}" for k in MODELS]
    + ["n_exact", "n_half", "n_double"]
    + ["old_exact", "old_half", "old_double"]
    + ["local_share", "local_half", "local_double"]
    + ["log2_bpm", "log2_bpm_sq"]
    + [f"genre_{g}_x_log" for g in GENRES]
    + ["ac_c", "ac_half", "ac_double", "ac_third", "ac_c_minus_half", "ac_double_minus_c"]
    + ["onsets_per_beat", "opb_x_log"]
    + ["rms", "low_band", "flux"]
    + ["meter3"]
)


def build_song(rec: Dict[str, Any]) -> Tuple[List[float], np.ndarray, Dict[str, Optional[float]]]:
    est = estimates(rec)
    cands = make_candidates(est)
    genre = rec.get("genre")
    X = np.vstack([candidate_features(c, est, rec, genre) for c in cands]) if cands else np.zeros((0, len(FEATURE_NAMES)))
    return cands, X, est


def has_core(rec: Dict[str, Any], need_madmom: bool = True) -> bool:
    need = ["beatthis", "tempocnn", "feats"] + (["madmom"] if need_madmom else [])
    return all(k in rec for k in need)


def refine(c: float, est: Dict[str, Optional[float]]) -> float:
    """Sub-frame tempo: mean of the sub-frame estimators (Beat This!, madmom DBN) that agree with c (or with c/2, c*2)."""
    vals = []
    for k in ("bt", "mm"):
        e = est.get(k)
        if e is None:
            continue
        for m in (1.0, 2.0, 0.5):
            if abs(e * m / c - 1) <= 0.03:
                vals.append(e * m)
                break
    if not vals:
        vals = [e * m for k in ("sq", "tp", "mmc") if (e := est.get(k)) for m in (1.0, 2.0, 0.5) if abs(e * m / c - 1) <= 0.03][:1]
    return round(float(np.mean(vals)), 1) if vals else round(c, 1)


# --------------------------------------------------------------------------- labels & evaluation
def positives(cands: List[float], gt: Dict[str, Any]) -> np.ndarray:
    vals = [gt["true"]] + gt["alts"]
    return np.array([1.0 if any(abs(c / v - 1) <= TOL_LABEL for v in vals) else 0.0 for c in cands])


def _hit(pred: float, gt: Dict[str, Any], any_alt: bool) -> bool:
    vals = [gt["true"]] + (gt["alts"] if any_alt else [])
    return any(abs(pred / v - 1) <= TOL_LABEL for v in vals)


class Model:
    def __init__(self, coef, intercept, mean, scale):
        self.coef, self.intercept, self.mean, self.scale = coef, intercept, mean, scale

    def logits(self, X: np.ndarray) -> np.ndarray:
        return ((X - self.mean) / self.scale) @ self.coef + self.intercept

    def probs(self, X: np.ndarray) -> np.ndarray:
        z = self.logits(X)
        z = z - z.max()
        p = np.exp(z)
        return p / p.sum()

    def to_json(self) -> Dict[str, Any]:
        return {"features": FEATURE_NAMES, "coef": self.coef.tolist(), "intercept": float(self.intercept),
                "mean": self.mean.tolist(), "scale": self.scale.tolist()}

    @staticmethod
    def from_json(d: Dict[str, Any]) -> "Model":
        assert d["features"] == FEATURE_NAMES, "feature list changed: retrain octave_model.json"
        return Model(np.array(d["coef"]), d["intercept"], np.array(d["mean"]), np.array(d["scale"]))


def fit(rows_X: List[np.ndarray], rows_y: List[np.ndarray], C: float) -> Model:
    from sklearn.linear_model import LogisticRegression

    X = np.vstack(rows_X)
    y = np.concatenate(rows_y)
    mean = X.mean(axis=0)
    scale = X.std(axis=0)
    scale[scale < 1e-9] = 1.0
    lr = LogisticRegression(C=C, max_iter=2000, class_weight="balanced")
    lr.fit((X - mean) / scale, y)
    return Model(lr.coef_[0], lr.intercept_[0], mean, scale)


def dataset(recs, gt, need_madmom: bool):
    items = []
    for i, g in gt.items():
        rec = recs.get(i)
        if not rec or not has_core(rec, need_madmom):
            continue
        cands, X, est = build_song(rec)
        if not cands:
            continue
        items.append({"id": i, "gt": g, "cands": cands, "X": X, "est": est, "y": positives(cands, g), "genre": rec.get("genre")})
    return items


def vote_baseline(it) -> float:
    """Plain exact-vote ensemble (the best non-learned method from the benchmark): most exact votes, tie -> closer to 120 BPM."""
    n = it["X"][:, FEATURE_NAMES.index("n_exact")]
    best = max(range(len(n)), key=lambda k: (n[k], -abs(math.log2(it["cands"][k] / 120.0))))
    return refine(it["cands"][best], it["est"])


def cmd_cv(args) -> None:
    from sklearn.model_selection import StratifiedKFold

    recs, gt = load_records(), load_gt()
    items = dataset(recs, gt, need_madmom=not args.no_madmom)
    print(f"songs with ground truth: {len(gt)}, with all candidates: {len(items)}")
    recall = sum(1 for it in items if it["y"].sum() > 0)
    print(f"candidate recall (a correct tempo is among the candidates): {recall}/{len(items)}")
    usable = [it for it in items if it["y"].sum() > 0]
    strat = [f"{it['genre']}_{it['gt']['conf']=='ambiguous'}" for it in usable]
    results: Dict[str, Dict[str, Any]] = {}
    probs_by_id: Dict[float, Dict[int, np.ndarray]] = {}
    for C in args.C:
        preds: Dict[int, float] = {}
        probs_by_id[C] = {}
        skf = StratifiedKFold(n_splits=args.folds, shuffle=True, random_state=7)
        for tr, te in skf.split(np.zeros(len(usable)), strat):
            m = fit([usable[k]["X"] for k in tr], [usable[k]["y"] for k in tr], C)
            for k in te:
                it = usable[k]
                p = m.probs(it["X"])
                probs_by_id[C][it["id"]] = p
                preds[it["id"]] = refine(it["cands"][int(np.argmax(p))], it["est"])
        results[f"LR C={C}"] = preds
    results["vote baseline"] = {it["id"]: vote_baseline(it) for it in items}
    results["old DSP (DB)"] = {it["id"]: (it["est"]["old"] or 0.0) for it in items}
    for nm in ("bt", "mm", "sq", "tp"):
        results[f"single {nm}"] = {it["id"]: (it["est"][nm] or 0.0) for it in items}
    print(f"\n{'method':18} {'confident Acc1':>16} {'ambiguous(any)':>16} {'all(any alt)':>14}")
    conf = [it for it in items if it["gt"]["conf"] != "ambiguous"]
    amb = [it for it in items if it["gt"]["conf"] == "ambiguous"]
    for nm, pr in results.items():
        a = sum(_hit(pr.get(it["id"], 0.0) or 1e9, it["gt"], False) for it in conf)
        b = sum(_hit(pr.get(it["id"], 0.0) or 1e9, it["gt"], True) for it in amb)
        print(f"{nm:18} {a:>8}/{len(conf)} {100 * a / len(conf):5.1f}% {b:>8}/{len(amb)} {sum(_hit(pr.get(it['id'], 0.0) or 1e9, it['gt'], True) for it in items):>8}/{len(items)}")
    best = max((k for k in results if k.startswith("LR")), key=lambda k: sum(_hit(results[k].get(it["id"], 0.0) or 1e9, it["gt"], False) for it in conf))
    print("\nbest LR:", best)
    pr = results[best]
    print("\nper genre (confident songs) [LR best | vote | old]")
    for g in GENRES:
        sub = [it for it in conf if it["genre"] == g]
        if sub:
            f = lambda r: sum(_hit(r.get(it["id"], 0.0) or 1e9, it["gt"], False) for it in sub)
            print(f"  {g:7} n={len(sub):3}  {f(pr):3} | {f(results['vote baseline']):3} | {f(results['old DSP (DB)']):3}")
    cls = Counter()
    for it in conf:
        p, t = pr.get(it["id"]) or 0.0, it["gt"]["true"]
        q = p / t if p else 0
        cls["ok" if abs(q - 1) <= TOL_LABEL else "2x" if abs(q / 2 - 1) <= 0.03 else "0.5x" if abs(q / 0.5 - 1) <= 0.03 else "other"] += 1
    print("error classes (confident):", dict(cls))
    bestC = float(best.split("=")[1])
    hi = [it for it in conf if it["gt"]["conf"] == "high"]
    print(f"\nhigh-confidence labels only (non-Spotify sources agree): n={len(hi)}  LR {sum(_hit(pr.get(it['id'], 0.0) or 1e9, it['gt'], False) for it in hi)}"
          f" | vote {sum(_hit(results['vote baseline'].get(it['id'], 0.0) or 1e9, it['gt'], False) for it in hi)}"
          f" | old {sum(_hit(results['old DSP (DB)'].get(it['id'], 0.0) or 1e9, it['gt'], False) for it in hi)}")
    print("\nbpm_alt coverage on confident songs (threshold: share of songs flagged | truth is winner-or-alt):")
    for thr in (0.25, 0.15, 0.10, 0.05):
        flagged = covered = 0
        for it in conf:
            if it["id"] not in probs_by_id[bestC]:
                continue
            p = probs_by_id[bestC][it["id"]]
            b = int(np.argmax(p))
            alt = pick_alt(it["cands"], p, b, it["est"], thr)
            flagged += alt is not None
            pv = refine(it["cands"][b], it["est"])
            covered += _hit(pv, it["gt"], False) or (alt is not None and _hit(alt, it["gt"], False))
        print(f"  thr {thr:.2f}: flagged {100 * flagged / len(conf):4.1f}% | covered {covered}/{len(conf)} ({100 * covered / len(conf):.1f}%)")
    json.dump({"best": best, "preds": {str(k): v for k, v in pr.items()}}, open(DATA / "tempo_cv_preds.json", "w"))


def cmd_train(args) -> None:
    recs, gt = load_records(), load_gt()
    items = [it for it in dataset(recs, gt, need_madmom=not args.no_madmom) if it["y"].sum() > 0]
    m = fit([it["X"] for it in items], [it["y"] for it in items], args.C_final)
    d = m.to_json()
    d.update({"trained_on": len(items), "C": args.C_final, "need_madmom": not args.no_madmom})
    json.dump(d, open(MODEL_PATH, "w"), indent=1)
    print("trained on", len(items), "songs ->", MODEL_PATH)
    top = sorted(zip(FEATURE_NAMES, m.coef), key=lambda x: -abs(x[1]))[:12]
    print("largest weights:", [(n, round(float(w), 2)) for n, w in top])


ALT_THRESHOLD = 0.10  # runner-up must be an octave (x2 / x0.5) of the winner and have at least this probability


def pick_alt(cands: List[float], p: np.ndarray, best: int, est: Dict[str, Optional[float]], thr: float = ALT_THRESHOLD) -> Optional[float]:
    for k in np.argsort(-p)[1:]:
        k = int(k)
        r = cands[k] / cands[best]
        if any(abs(r / m - 1) <= 0.06 for m in (2.0, 0.5)) and p[k] >= thr:
            return refine(cands[k], est)
    return None


def resolve(rec: Dict[str, Any], model: Model) -> Optional[Dict[str, Any]]:
    cands, X, est = build_song(rec)
    if not cands:
        return None
    p = model.probs(X)
    order = np.argsort(-p)
    best = int(order[0])
    bpm = refine(cands[best], est)
    alt = pick_alt(cands, p, best, est)
    return {"bpm": bpm, "bpm_alt": alt, "confidence": round(float(p[best]), 3),
            "cands": [[round(c, 1), round(float(pp), 3)] for c, pp in zip(cands, p)]}


def cmd_predict(args) -> None:
    global USE_MADMOM
    d = json.load(open(MODEL_PATH))
    model = Model.from_json(d)
    USE_MADMOM = bool(d.get("need_madmom", True))
    recs = load_records()
    n = skipped = 0
    with open(RESOLVED_PATH, "w") as fo:
        for i, rec in recs.items():
            if not has_core(rec, d.get("need_madmom", True)):
                skipped += 1
                continue
            r = resolve(rec, model)
            if r:
                fo.write(json.dumps({"id": i, **r}, ensure_ascii=False) + "\n")
                n += 1
    print(f"resolved {n} songs, skipped {skipped} (missing candidates) -> {RESOLVED_PATH}")


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("cv")
    p.add_argument("--folds", type=int, default=5)
    p.add_argument("--C", type=float, nargs="+", default=[0.03, 0.1, 0.3, 1.0])
    p.add_argument("--no-madmom", action="store_true")
    p = sub.add_parser("train")
    p.add_argument("--C-final", type=float, default=0.3)
    p.add_argument("--no-madmom", action="store_true")
    sub.add_parser("predict")
    args = ap.parse_args()
    global USE_MADMOM
    USE_MADMOM = not getattr(args, "no_madmom", False)
    {"cv": cmd_cv, "train": cmd_train, "predict": cmd_predict}[args.cmd](args)


if __name__ == "__main__":
    main()
