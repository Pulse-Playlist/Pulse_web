"""
Computes real-world Popularity Scores (`popularity_score`: 0~100, `artist_track_rank`: 1..N)
for all 22,019 songs across 1,162 artists in `songs.json` using:
1. Apple Music KR / US / JP Top Charts (`/v1/catalog/{sf}/charts?types=songs&limit=200`)
2. Apple Music KR Artist Popularity Search Order (`/v1/catalog/kr/search?term={artist}&types=songs&limit=25`) with 429 retry
3. Original `view/top-songs` & `melon_top100`/`bugs_top100` discovery rank from `HEAD:crawler/data/songs.json`
4. Artist Tier Popularity (Curated Seed / Headliner Tier S, Cluster Tier A, Catalog Tier B)
"""

from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import subprocess
import time
from typing import Any, Dict, List, Set, Tuple

import requests

from unify_artists_and_dedup import (
    BASE_DIR,
    SONGS_JSON_PATH,
    WEB_SONGS_JSON_PATH,
    generate_apple_token,
    norm_token,
)

# Tier S headliner / seed artists across all 7 genres
TIER_S_ARTISTS: Set[str] = {
    # Band
    "DAY6", "QWER", "루시", "실리카겔", "잔나비", "터치드", "유다빈밴드", "엔플라잉",
    "페퍼톤스", "소란", "한로로", "혁오", "새소년", "드래곤포니", "극동아시아타이거즈",
    "너드커넥션", "데이브레이크", "원위", "더 로즈", "엑스디너리 히어로즈", "10CM",
    "AKMU", "볼빨간사춘기", "멜로망스", "장기하와 얼굴들", "검정치마", "카더가든",
    "wave to earth", "SURL", "나상현씨밴드", "브로콜리너마저", "언니네 이발관", "델리스파이스",
    # K-Pop
    "NewJeans", "아일릿", "aespa", "IVE", "LE SSERAFIM", "리센느", "투어스", "보이넥스트도어",
    "세븐틴", "방탄소년단", "Stray Kids", "TWICE", "BLACKPINK", "소녀시대", "카라", "빅뱅",
    "샤이니", "플레이브", "(여자)아이들", "ITZY", "STAYC", "ENHYPEN", "ATEEZ", "투모로우바이투게더",
    "라이즈", "제로베이스원", "레드벨벳", "EXO", "NCT DREAM", "NCT 127", "아이유", "태연",
    "싸이", "지드래곤", "제니", "로제", "정국", "2NE1", "f(x)", "여자친구", "오마이걸",
    "키스오브라이프", "베이비몬스터", "프로미스나인", "아이즈원", "인피니트", "하이라이트",
    # Rock
    "국카스텐", "쏜애플", "크라잉넛", "노브레인", "자우림", "체리필터", "버즈", "서태지와 아이들",
    "윤도현밴드", "넬", "로맨틱펀치", "부활", "김경호", "넥스트", "신해철", "Green Day",
    "Linkin Park", "Blink-182", "Muse", "Oasis", "Queen", "My Chemical Romance", "Fall Out Boy",
    "Sum 41", "The Offspring", "Foo Fighters", "Red Hot Chili Peppers", "Nirvana", "Bon Jovi",
    "AC/DC", "Guns N' Roses", "Arctic Monkeys", "The Strokes", "The Killers", "Måneskin",
    # Hip-Hop
    "에픽하이", "다이나믹 듀오", "리쌍", "빈지노", "박재범", "창모", "지코", "이영지",
    "비와이", "기리보이", "사이먼 도미닉", "로꼬", "그레이", "코드 쿤스트", "크러쉬", "딘",
    "비오", "애쉬 아일랜드", "ASH ISLAND", "릴러말즈", "더 콰이엇", "도끼", "프라이머리",
    "Eminem", "Kendrick Lamar", "Travis Scott", "J. Cole", "Kanye West", "Drake", "Post Malone",
    "21 Savage", "Future", "Metro Boomin", "Lil Uzi Vert", "Juice WRLD", "A$AP Rocky",
    "Snoop Dogg", "Dr. Dre", "50 Cent", "Jay-Z", "Nas", "Tyler, The Creator", "Central Cee",
    # EDM
    "Calvin Harris", "Avicii", "Zedd", "David Guetta", "Martin Garrix", "Swedish House Mafia",
    "Daft Punk", "Peggy Gou", "Fred again..", "Disclosure", "Tiësto", "Alan Walker",
    "Marshmello", "The Chainsmokers", "Kygo", "Galantis", "Clean Bandit", "Major Lazer",
    "DJ Snake", "Skrillex", "Porter Robinson", "Madeon", "Illenium", "Pendulum", "Sub Focus",
    "Wilkinson", "Chase & Status", "Rudimental", "Netsky", "Dimension", "Armin van Buuren",
    "Hardwell", "Deadmau5", "Eric Prydz", "Justice", "The Chemical Brothers", "The Prodigy",
    # Pop
    "The Weeknd", "Dua Lipa", "Bruno Mars", "Sabrina Carpenter", "Olivia Rodrigo",
    "Taylor Swift", "Charlie Puth", "Lady Gaga", "Ariana Grande", "Maroon 5", "Justin Bieber",
    "Doja Cat", "OneRepublic", "Coldplay", "Imagine Dragons", "Harry Styles", "Ed Sheeran",
    "Shawn Mendes", "Sia", "Katy Perry", "Rihanna", "Beyoncé", "Michael Jackson",
    "Justin Timberlake", "Billie Eilish", "Charli xcx", "Chappell Roan", "Carly Rae Jepsen",
    "Troye Sivan", "Benson Boone", "Tate McRae", "Pitbull", "Flo Rida", "Black Eyed Peas",
    # J-Pop
    "YOASOBI", "Mrs. GREEN APPLE", "Official HIGE DANdism", "Vaundy", "King Gnu",
    "Kenshi Yonezu", "Ado", "ZUTOMAYO", "Yorushika", "ONE OK ROCK", "RADWIMPS",
    "BUMP OF CHICKEN", "SPYAIR", "ELLEGARDEN", "imase", "Aimyon", "back number",
    "Creepy Nuts", "LiSA", "Fujii Kaze", "SEKAI NO OWARI", "Yuuri", "tuki.", "Aimer",
    "milet", "Tatsuya Kitani", "natori", "KANA-BOON", "ASIAN KUNG-FU GENERATION",
    "UVERworld", "UNISON SQUARE GARDEN", "Ryokuoushoku Shakai", "Kessoku Band",
}


def fetch_top_charts_ids(token: str) -> Set[str]:
    headers = {"Authorization": f"Bearer {token}"}
    chart_ids: Set[str] = set()
    for sf in ("kr", "us", "jp"):
        for offset in (0, 200):
            try:
                r = requests.get(
                    f"https://api.music.apple.com/v1/catalog/{sf}/charts",
                    params={"types": "songs", "limit": 200, "offset": offset},
                    headers=headers,
                    timeout=10,
                )
                if r.status_code == 200:
                    songs_charts = r.json().get("results", {}).get("songs", [])
                    for chart in songs_charts:
                        for item in chart.get("data", []):
                            tid = str(item.get("id") or "")
                            if tid:
                                chart_ids.add(tid)
            except Exception:
                pass
    return chart_ids


def fetch_artist_popular_tracks(
    artist_name: str, search_term: str, token: str
) -> Tuple[str, List[Tuple[str, str]]]:
    """
    Queries Apple Music KR search for `search_term` (top 25 songs in Apple Music's popularity rank order)
    with retry on 429 rate limits.
    Returns (artist_name, list of (track_id_str, norm_title)).
    """
    headers = {"Authorization": f"Bearer {token}"}
    ranked: List[Tuple[str, str]] = []
    seen_nt: Set[str] = set()

    for attempt in range(3):
        try:
            r = requests.get(
                "https://api.music.apple.com/v1/catalog/kr/search",
                params={
                    "term": search_term,
                    "types": "songs",
                    "limit": 25,
                    "offset": 0,
                    "l": "ko-KR",
                },
                headers=headers,
                timeout=10,
            )
            if r.status_code == 429:
                time.sleep(0.8 * (attempt + 1))
                continue
            if r.status_code == 200:
                items = r.json().get("results", {}).get("songs", {}).get("data", [])
                for it in items:
                    tid = str(it.get("id") or "")
                    attr = it.get("attributes") or {}
                    t_name = attr.get("name") or ""
                    nt = norm_token(t_name)
                    if tid and nt and nt not in seen_nt:
                        seen_nt.add(nt)
                        ranked.append((tid, nt))
            break
        except Exception:
            time.sleep(0.5)

    return artist_name, ranked


def main() -> None:
    t0 = time.time()
    # Load from git HEAD so original `view/top-songs` per-artist ordering is intact
    raw_head = subprocess.check_output(
        ["git", "show", "HEAD:crawler/data/songs.json"],
        cwd=str(BASE_DIR.parent),
    )
    songs: List[Dict[str, Any]] = json.loads(raw_head)
    print(f"Loaded {len(songs)} songs in original discovery order from HEAD:crawler/data/songs.json")

    token = generate_apple_token()

    print("[1/3] Fetching Apple Music KR/US/JP Top Charts...")
    chart_ids = fetch_top_charts_ids(token)
    print(f"  + Retrieved {len(chart_ids)} charting track IDs.")

    by_artist: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    artist_search_term: Dict[str, str] = {}
    for s in songs:
        a = s["artist"]
        by_artist[a].append(s)
        if a not in artist_search_term:
            # Prefer Korean name for K-Pop/Band artists when querying KR storefront
            if s.get("genre_tag") in ("kpop", "band", "rock", "hiphop") and s.get("artist_ko"):
                artist_search_term[a] = s["artist_ko"]
            else:
                artist_search_term[a] = a

    all_artists = sorted(by_artist.keys())
    print(f"[2/3] Fetching Apple Music KR popularity rankings across {len(all_artists)} artists (12 threads with retry)...")

    artist_apple_ranks: Dict[str, List[Tuple[str, str]]] = {}
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {
            pool.submit(fetch_artist_popular_tracks, a, artist_search_term[a], token): a
            for a in all_artists
        }
        done_cnt = 0
        for fut in as_completed(futures):
            done_cnt += 1
            a_name, ranked_list = fut.result()
            artist_apple_ranks[a_name] = ranked_list
            if done_cnt % 250 == 0 or done_cnt == len(all_artists):
                print(f"  + Ranked {done_cnt}/{len(all_artists)} artists ({time.time() - t0:.1f}s)...")

    print("[3/3] Computing multi-signal `popularity_score` (0~100) and `artist_track_rank` for all 22,019 songs...")

    for artist, track_list in by_artist.items():
        apple_ranked = artist_apple_ranks.get(artist, [])
        tid_to_rank: Dict[str, int] = {}
        nt_to_rank: Dict[str, int] = {}

        for idx, (tid, nt) in enumerate(apple_ranked, start=1):
            if tid not in tid_to_rank:
                tid_to_rank[tid] = idx
            if nt not in nt_to_rank:
                nt_to_rank[nt] = idx

        scored_for_ordering = []
        for orig_idx, s in enumerate(track_list):
            tid_str = str(s.get("itunes_track_id") or "")
            apple_rank = tid_to_rank.get(tid_str, 999)
            if apple_rank == 999:
                for fn in ("title", "title_ko", "title_en"):
                    nt = norm_token(s.get(fn) or "")
                    if nt and nt in nt_to_rank:
                        apple_rank = min(apple_rank, nt_to_rank[nt])

            is_chart_source = (
                tid_str in chart_ids
                or s.get("source") in ("melon_top100", "bugs_top100")
            )
            # Combine Apple Music search rank with original top-songs rank (`orig_idx + 1`)
            # so neither a missing search hit nor a new single displaces core hits!
            orig_rank = orig_idx + 1
            if is_chart_source:
                blended_rank = min(apple_rank, orig_rank, 5)
            elif apple_rank < 999:
                blended_rank = (apple_rank * 0.65) + (min(orig_rank, 35) * 0.35)
            else:
                blended_rank = orig_rank + 8.0

            scored_for_ordering.append((blended_rank, apple_rank, orig_idx, is_chart_source, s))

        scored_for_ordering.sort(key=lambda x: (x[0], x[1], x[2]))

        if artist in TIER_S_ARTISTS:
            artist_base = 35.0
        elif len(track_list) >= 25 or any(s.get("source") in ("melon_top100", "bugs_top100") for s in track_list):
            artist_base = 30.5
        elif len(track_list) >= 12:
            artist_base = 26.5
        else:
            artist_base = 22.0

        for intra_rank, (_, apple_rank, _, is_chart_source, s) in enumerate(scored_for_ordering, start=1):
            if intra_rank == 1:
                intra_pts = 50.0
            elif intra_rank == 2:
                intra_pts = 49.0
            elif intra_rank == 3:
                intra_pts = 48.0
            elif intra_rank <= 5:
                intra_pts = 46.5 - (intra_rank - 3) * 1.0
            elif intra_rank <= 10:
                intra_pts = 44.5 - (intra_rank - 5) * 1.3
            elif intra_rank <= 20:
                intra_pts = 38.0 - (intra_rank - 10) * 1.1
            elif intra_rank <= 35:
                intra_pts = 27.0 - (intra_rank - 20) * 0.7
            else:
                intra_pts = max(8.0, 16.5 - (intra_rank - 35) * 0.25)

            if apple_rank <= 5 or is_chart_source:
                intra_pts = min(50.0, intra_pts + 2.5)
            elif apple_rank <= 15:
                intra_pts = min(49.0, intra_pts + 1.5)

            chart_bonus = 0.0
            if is_chart_source:
                chart_bonus = 8.0
            elif apple_rank <= 10:
                chart_bonus = 5.5
            elif apple_rank <= 25:
                chart_bonus = 3.0

            run_score = float(s.get("running_score") or 75.0)
            run_bonus = min(7.0, (run_score / 100.0) * 7.0)

            pop_score = round(min(99.9, max(15.0, artist_base + intra_pts + chart_bonus + run_bonus)), 1)
            s["popularity_score"] = pop_score
            s["artist_track_rank"] = intra_rank

    # Sort globally by popularity_score DESC, then running_score DESC
    songs.sort(key=lambda s: (-float(s.get("popularity_score") or 0.0), -float(s.get("running_score") or 0.0)))

    with open(SONGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    with open(WEB_SONGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)

    print(f"Saved popularity-scored dataset ({len(songs)} songs) to {SONGS_JSON_PATH} and {WEB_SONGS_JSON_PATH} in {time.time() - t0:.1f}s!")

    for sample_a in ["DAY6", "QWER", "NewJeans", "aespa", "IVE", "국카스텐", "에픽하이", "YOASOBI", "Calvin Harris", "The Weeknd"]:
        sub = [s for s in songs if s["artist"] == sample_a]
        top_str = ", ".join(f"{s['title']}({s['popularity_score']})" for s in sub[:6])
        print(f"  [{sample_a:14s}] Top 6: {top_str}")


if __name__ == "__main__":
    main()
