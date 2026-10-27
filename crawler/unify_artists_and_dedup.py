"""
Comprehensive Artist Canonicalization (KO/EN unification), Bilingual Metadata Enrichment,
Misattribution Cleanup, Variant/Bilingual Song Deduplication, and Supabase `public.songs` Sync.
"""

from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import re
import time
from typing import Any, Dict, List, Optional, Set, Tuple

from dotenv import load_dotenv
import jwt
import requests

from collectors import clean_parentheses
from fast_130_180_seeds import (
    BAND_FAST_ARTISTS_130,
    HIPHOP_FAST_ARTISTS_160,
    KPOP_FAST_ARTISTS_140,
    ROCK_FAST_ARTISTS_160,
)
from mass_seed_artists import (
    BAND_ARTISTS_100,
    HIPHOP_ARTISTS_100,
    KPOP_ARTISTS_100,
    ROCK_ARTISTS_100,
)

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
SONGS_JSON_PATH = BASE_DIR / "data" / "songs.json"
WEB_SONGS_JSON_PATH = PROJECT_ROOT / "web" / "public" / "data" / "songs.json"
AUTH_KEY_PATH = PROJECT_ROOT / "web" / "AuthKey_YDN5P2LVLK.p8"

load_dotenv(BASE_DIR / ".env")
load_dotenv(PROJECT_ROOT / "web" / ".env.local")

APPLE_KEY_ID = "YDN5P2LVLK"
APPLE_TEAM_ID = "8ZUB5C2R66"

ALLOWED_SUPABASE_COLUMNS = {
    "title",
    "artist",
    "normalized_key",
    "album",
    "cover_url",
    "duration_sec",
    "genre_tag",
    "raw_bpm",
    "running_bpm",
    "cadence_mode",
    "deezer_bpm",
    "beat_clarity",
    "beat_salience",
    "timing_stability",
    "energy_rms",
    "running_score",
    "preview_url",
    "itunes_track_id",
    "deezer_track_id",
    "melon_song_id",
    "bugs_track_id",
    "source",
}


def has_hangul(s: str) -> bool:
    return bool(re.search(r"[가-힣]", s or ""))


def clean_display_title(s: str) -> str:
    """Cleans inline bilingual translations, encore/anniversary prefixes, and version suffixes."""
    if not s:
        return ""
    s = clean_parentheses(s).replace("\xa0", " ").strip()
    # Specific inline bilingual or prefix/suffix cleanup
    s = re.sub(r"^앵콜_\s*", "", s)
    s = re.sub(r"^판타스틱 듀오 2 Part\.\d+\s*['\"](.+?)['\"]$", r"\1", s)
    s = re.sub(r"^노브레인 30주년,\s*Pt\.\s*\d+\s*-\s*", "", s)
    s = re.sub(r"\s+Sweet Little Kitty$", "", s, flags=re.I)
    s = re.sub(r"\s+Flying Duck$", "", s, flags=re.I)
    s = re.sub(r"\s+Ready-Merry-Go!$", "", s, flags=re.I)
    s = re.sub(r"^챠우챠우-아무리.*$", "챠우챠우", s)
    s = re.sub(
        r"\s*[-–—]\s*(?:JP|Japanese|Twin|Alternate|Acoustic|Live|Remaster(?:ed)?|Inst(?:rumental)?|English|Korean)\s*(?:Ver\.?|Version)?[-–—]?\s*$",
        "",
        s,
        flags=re.I,
    )
    s = re.sub(r"\s+(?:25th|2020|2021|2022|2023|2024)$", "", s, flags=re.I)
    return s.strip()


def norm_token(s: str) -> str:
    if not s:
        return ""
    s = clean_display_title(s)
    return re.sub(r"[\s\W_]+", "", s.lower())


def generate_apple_token() -> str:
    with open(AUTH_KEY_PATH, "r", encoding="utf-8") as f:
        private_key = f.read()
    headers = {"alg": "ES256", "kid": APPLE_KEY_ID}
    payload = {
        "iss": APPLE_TEAM_ID,
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 * 7,
    }
    return jwt.encode(payload, private_key, algorithm="ES256", headers=headers)


def fetch_apple_bilingual_batch(
    track_ids: List[str], token: str, batch_size: int = 250
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    headers = {"Authorization": f"Bearer {token}"}
    meta_ko: Dict[str, Dict[str, Any]] = {}
    meta_en: Dict[str, Dict[str, Any]] = {}

    batches = [track_ids[i : i + batch_size] for i in range(0, len(track_ids), batch_size)]

    def _fetch_one_batch(batch: List[str]):
        b_ko: Dict[str, Dict[str, Any]] = {}
        b_en: Dict[str, Dict[str, Any]] = {}
        ids_str = ",".join(batch)
        found: Set[str] = set()
        try:
            r_ko = requests.get(
                f"https://api.music.apple.com/v1/catalog/kr/songs?ids={ids_str}&l=ko-KR",
                headers=headers,
                timeout=20,
            )
            if r_ko.status_code == 200:
                for item in r_ko.json().get("data", []):
                    tid = str(item.get("id"))
                    b_ko[tid] = item.get("attributes", {})
                    found.add(tid)

            r_en = requests.get(
                f"https://api.music.apple.com/v1/catalog/kr/songs?ids={ids_str}&l=en-US",
                headers=headers,
                timeout=20,
            )
            if r_en.status_code == 200:
                for item in r_en.json().get("data", []):
                    tid = str(item.get("id"))
                    b_en[tid] = item.get("attributes", {})

            missing = [tid for tid in batch if tid not in found]
            if missing:
                m_str = ",".join(missing)
                ru_ko = requests.get(
                    f"https://api.music.apple.com/v1/catalog/us/songs?ids={m_str}&l=ko-KR",
                    headers=headers,
                    timeout=20,
                )
                if ru_ko.status_code == 200:
                    for item in ru_ko.json().get("data", []):
                        tid = str(item.get("id"))
                        b_ko[tid] = item.get("attributes", {})

                ru_en = requests.get(
                    f"https://api.music.apple.com/v1/catalog/us/songs?ids={m_str}&l=en-US",
                    headers=headers,
                    timeout=20,
                )
                if ru_en.status_code == 200:
                    for item in ru_en.json().get("data", []):
                        tid = str(item.get("id"))
                        b_en[tid] = item.get("attributes", {})
        except Exception as e:
            print(f"[WARN] Apple batch error: {e}")
        return b_ko, b_en

    print(f"[APPLE MUSIC] Fetching ko-KR & en-US metadata for {len(track_ids)} tracks across {len(batches)} batches...")
    with ThreadPoolExecutor(max_workers=8) as pool:
        for b_ko, b_en in pool.map(_fetch_one_batch, batches):
            meta_ko.update(b_ko)
            meta_en.update(b_en)

    print(f"[APPLE MUSIC] Retrieved {len(meta_ko)} ko-KR and {len(meta_en)} en-US track records.")
    return meta_ko, meta_en


def build_master_artist_canon() -> Tuple[
    Dict[str, str],
    Dict[str, Tuple[str, str]],
]:
    """
    Returns:
      1. alias_to_canon: maps any raw artist string to its canonical `artist` key.
      2. canon_to_bilingual: maps canonical `artist` -> `(artist_ko, artist_en)` where `artist_ko` is pure Korean
         and `artist_en` is pure English.
    """
    explicit_canon: Dict[str, Tuple[str, str, str]] = {
        # raw_artist -> (canonical_artist, artist_ko, artist_en)
        "DAY6": ("DAY6", "데이식스", "DAY6"),
        "데이식스": ("DAY6", "데이식스", "DAY6"),
        "DAY6 (데이식스)": ("DAY6", "데이식스", "DAY6"),
        "DAY6\xa0(데이식스)": ("DAY6", "데이식스", "DAY6"),
        "IVE": ("IVE", "아이브", "IVE"),
        "IVE (아이브)": ("IVE", "아이브", "IVE"),
        "아이브": ("IVE", "아이브", "IVE"),
        "(여자)아이들": ("(여자)아이들", "(여자)아이들", "(G)I-DLE"),
        "(G)I-DLE": ("(여자)아이들", "(여자)아이들", "(G)I-DLE"),
        "i-dle": ("(여자)아이들", "(여자)아이들", "(G)I-DLE"),
        "아이들": ("(여자)아이들", "(여자)아이들", "(G)I-DLE"),
        "K/DA, League of Legends Music & i-dle": ("(여자)아이들", "(여자)아이들", "(G)I-DLE"),
        "K/DA, Madison Beer & i-dle": ("(여자)아이들", "(여자)아이들", "(G)I-DLE"),
        "투어스": ("투어스", "투어스", "TWS"),
        "TWS": ("투어스", "투어스", "TWS"),
        "보이넥스트도어": ("보이넥스트도어", "보이넥스트도어", "BOYNEXTDOOR"),
        "BOYNEXTDOOR": ("보이넥스트도어", "보이넥스트도어", "BOYNEXTDOOR"),
        "제로베이스원": ("제로베이스원", "제로베이스원", "ZEROBASEONE"),
        "ZEROBASEONE": ("제로베이스원", "제로베이스원", "ZEROBASEONE"),
        "라이즈": ("라이즈", "라이즈", "RIIZE"),
        "RIIZE": ("라이즈", "라이즈", "RIIZE"),
        "더 로즈": ("더 로즈", "더 로즈", "The Rose"),
        "The Rose": ("더 로즈", "더 로즈", "The Rose"),
        "SURL": ("SURL", "설", "SURL"),
        "설": ("SURL", "설", "SURL"),
        "ELLEGARDEN": ("ELLEGARDEN", "엘르가든", "ELLEGARDEN"),
        "엘르가든": ("ELLEGARDEN", "엘르가든", "ELLEGARDEN"),
        "SPYAIR": ("SPYAIR", "스파이웨어", "SPYAIR"),
        "스파이웨어": ("SPYAIR", "스파이웨어", "SPYAIR"),
        "비와이": ("비와이", "비와이", "BewhY"),
        "BewhY": ("비와이", "비와이", "BewhY"),
        "BewhY, 사이먼 도미닉": ("비와이", "비와이", "BewhY"),
        "그루비룸": ("그루비룸", "그루비룸", "GroovyRoom"),
        "GroovyRoom": ("그루비룸", "그루비룸", "GroovyRoom"),
        "기리보이": ("기리보이", "기리보이", "GIRIBOY"),
        "GIRIBOY": ("기리보이", "기리보이", "GIRIBOY"),
        "기리보이, 저스디스": ("기리보이", "기리보이", "GIRIBOY"),
        "염따": ("염따", "염따", "YUMDDA"),
        "YUMDDA": ("염따", "염따", "YUMDDA"),
        "프라이머리": ("프라이머리", "프라이머리", "Primary"),
        "Primary": ("프라이머리", "프라이머리", "Primary"),
        "어반자카파": ("어반자카파", "어반자카파", "Urban Zakapa"),
        "Urban Zakapa": ("어반자카파", "어반자카파", "Urban Zakapa"),
        "f": ("f(x)", "에프엑스", "f(x)"),
        "f(x)": ("f(x)", "에프엑스", "f(x)"),
        "에프엑스": ("f(x)", "에프엑스", "f(x)"),
        "러브홀릭": ("러브홀릭스", "러브홀릭스", "Loveholics"),
        "러브홀릭스": ("러브홀릭스", "러브홀릭스", "Loveholics"),
        "NewJeans": ("NewJeans", "뉴진스", "NewJeans"),
        "뉴진스": ("NewJeans", "뉴진스", "NewJeans"),
        "aespa": ("aespa", "에스파", "aespa"),
        "에스파": ("aespa", "에스파", "aespa"),
        "LE SSERAFIM": ("LE SSERAFIM", "르세라핌", "LE SSERAFIM"),
        "르세라핌": ("LE SSERAFIM", "르세라핌", "LE SSERAFIM"),
        "STAYC": ("STAYC", "스테이씨", "STAYC"),
        "스테이씨": ("STAYC", "스테이씨", "STAYC"),
        "ITZY": ("ITZY", "있지", "ITZY"),
        "있지": ("ITZY", "있지", "ITZY"),
        "Stray Kids": ("Stray Kids", "스트레이 키즈", "Stray Kids"),
        "스트레이 키즈": ("Stray Kids", "스트레이 키즈", "Stray Kids"),
        "ENHYPEN": ("ENHYPEN", "엔하이픈", "ENHYPEN"),
        "엔하이픈": ("ENHYPEN", "엔하이픈", "ENHYPEN"),
        "ATEEZ": ("ATEEZ", "에이티즈", "ATEEZ"),
        "에이티즈": ("ATEEZ", "에이티즈", "ATEEZ"),
        "TREASURE": ("TREASURE", "트레저", "TREASURE"),
        "트레저": ("TREASURE", "트레저", "TREASURE"),
        "BLACKPINK": ("BLACKPINK", "블랙핑크", "BLACKPINK"),
        "블랙핑크": ("BLACKPINK", "블랙핑크", "BLACKPINK"),
        "TWICE": ("TWICE", "트와이스", "TWICE"),
        "트와이스": ("TWICE", "트와이스", "TWICE"),
        "EXO": ("EXO", "엑소", "EXO"),
        "엑소": ("EXO", "엑소", "EXO"),
        "GOT7": ("GOT7", "갓세븐", "GOT7"),
        "갓세븐": ("GOT7", "갓세븐", "GOT7"),
        "AKMU": ("AKMU", "악뮤", "AKMU"),
        "악뮤": ("AKMU", "악뮤", "AKMU"),
        "QWER": ("QWER", "QWER", "QWER"),
        "10CM": ("10CM", "십센치", "10CM"),
        "십센치": ("10CM", "십센치", "10CM"),
        "wave to earth": ("wave to earth", "웨이브투어스", "wave to earth"),
        "웨이브투어스": ("wave to earth", "웨이브투어스", "wave to earth"),
        "pH-1, 식케이": ("pH-1", "피에이치원", "pH-1"),
        "pH-1": ("pH-1", "피에이치원", "pH-1"),
        "박재범, pH-1, 식케이": ("박재범", "박재범", "Jay Park"),
        "사이먼 도미닉, 로꼬": ("사이먼 도미닉", "사이먼 도미닉", "Simon Dominic"),
        "사이먼 도미닉, 코드 쿤스트": ("사이먼 도미닉", "사이먼 도미닉", "Simon Dominic"),
        "이영지, 다이나믹 듀오": ("이영지", "이영지", "Lee Young Ji"),
        "창모, ASH ISLAND": ("창모", "창모", "CHANGMO"),
        "창모, ASH ISLAND, 릴러말즈": ("창모", "창모", "CHANGMO"),
        "창모, 개코": ("창모", "창모", "CHANGMO"),
        "창모, 빈지노": ("창모", "창모", "CHANGMO"),
        "ASH ISLAND": ("ASH ISLAND", "애쉬 아일랜드", "ASH ISLAND"),
        "래드윔프스": ("RADWIMPS", "래드윔프스", "RADWIMPS"),
        "RADWIMPS": ("RADWIMPS", "래드윔프스", "RADWIMPS"),
        "미세스 그린 애플": ("Mrs. GREEN APPLE", "미세스 그린 애플", "Mrs. GREEN APPLE"),
        "Mrs. GREEN APPLE": ("Mrs. GREEN APPLE", "미세스 그린 애플", "Mrs. GREEN APPLE"),
        "오피셜히게단디즘": ("Official HIGE DANdism", "오피셜히게단디즘", "Official HIGE DANdism"),
        "Official HIGE DANdism": ("Official HIGE DANdism", "오피셜히게단디즘", "Official HIGE DANdism"),
        "범프 오브 치킨": ("BUMP OF CHICKEN", "범프 오브 치킨", "BUMP OF CHICKEN"),
        "BUMP OF CHICKEN": ("BUMP OF CHICKEN", "범프 오브 치킨", "BUMP OF CHICKEN"),
        "요아소비": ("YOASOBI", "요아소비", "YOASOBI"),
        "YOASOBI": ("YOASOBI", "요아소비", "YOASOBI"),
        "바운디": ("Vaundy", "바운디", "Vaundy"),
        "Vaundy": ("Vaundy", "바운디", "Vaundy"),
        "킹누": ("King Gnu", "킹누", "King Gnu"),
        "King Gnu": ("King Gnu", "킹누", "King Gnu"),
        "원 오크 록": ("ONE OK ROCK", "원 오크 록", "ONE OK ROCK"),
        "ONE OK ROCK": ("ONE OK ROCK", "원 오크 록", "ONE OK ROCK"),
        "아시안 쿵푸 제너레이션": ("ASIAN KUNG-FU GENERATION", "아시안 쿵푸 제너레이션", "ASIAN KUNG-FU GENERATION"),
        "ASIAN KUNG-FU GENERATION": ("ASIAN KUNG-FU GENERATION", "아시안 쿵푸 제너레이션", "ASIAN KUNG-FU GENERATION"),
        "우버월드": ("UVERworld", "우버월드", "UVERworld"),
        "UVERworld": ("UVERworld", "우버월드", "UVERworld"),
        "카나분": ("KANA-BOON", "카나분", "KANA-BOON"),
        "KANA-BOON": ("KANA-BOON", "카나분", "KANA-BOON"),
    }

    alias_to_canon: Dict[str, str] = {}
    canon_to_bilingual: Dict[str, Tuple[str, str]] = {}

    all_seeds = (
        KPOP_ARTISTS_100
        + BAND_ARTISTS_100
        + ROCK_ARTISTS_100
        + HIPHOP_ARTISTS_100
        + ROCK_FAST_ARTISTS_160
        + BAND_FAST_ARTISTS_130
        + KPOP_FAST_ARTISTS_140
        + HIPHOP_FAST_ARTISTS_160
    )

    for raw in all_seeds:
        raw_clean = raw.replace("\xa0", " ").strip()
        if raw_clean.startswith("f(x)"):
            p, sec = "f(x)", "에프엑스"
        elif raw_clean.startswith("(여자)아이들"):
            p, sec = "(여자)아이들", "(G)I-DLE"
        else:
            p = re.sub(r"\s*\(.*?\)\s*", "", raw_clean).strip()
            m = re.search(r"\((.*?)\)", raw_clean)
            sec = m.group(1).strip() if m else ""

        if p in explicit_canon:
            c_name, ko_name, en_name = explicit_canon[p]
        elif sec and sec in explicit_canon:
            c_name, ko_name, en_name = explicit_canon[sec]
        else:
            c_name = p
            if has_hangul(p) and sec and not has_hangul(sec):
                ko_name, en_name = p, sec
            elif not has_hangul(p) and sec and has_hangul(sec):
                ko_name, en_name = sec, p
            else:
                ko_name, en_name = p, sec if sec else p

        alias_to_canon[p] = c_name
        if sec:
            alias_to_canon[sec] = c_name
        if c_name not in canon_to_bilingual:
            canon_to_bilingual[c_name] = (ko_name, en_name)

    for raw_k, (c_name, ko_name, en_name) in explicit_canon.items():
        alias_to_canon[raw_k] = c_name
        canon_to_bilingual[c_name] = (ko_name, en_name)

    return alias_to_canon, canon_to_bilingual


def sync_to_supabase(songs: List[Dict[str, Any]]) -> None:
    supabase_url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    supabase_key = (
        os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
    )
    if not supabase_url or not supabase_key:
        print("[WARN] Supabase credentials missing; skipping Supabase sync.")
        return

    print(f"=== [SUPABASE] Starting Clean Sync of {len(songs)} tracks to public.songs ===")
    endpoint = f"{supabase_url}/rest/v1/songs?on_conflict=normalized_key"
    headers: Dict[str, str] = {
        "apikey": supabase_key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    if not supabase_key.startswith("sb_"):
        headers["Authorization"] = f"Bearer {supabase_key}"

    del_res = requests.delete(
        f"{supabase_url}/rest/v1/songs?id=not.is.null",
        headers={"apikey": supabase_key},
        timeout=30,
    )
    print(f"  - Cleared previous rows in public.songs (status {del_res.status_code})")

    batch_size = 250
    total_upserted = 0
    t0 = time.time()

    for idx in range(0, len(songs), batch_size):
        raw_batch = songs[idx : idx + batch_size]
        batch = []
        for s in raw_batch:
            item = {k: v for k, v in s.items() if k in ALLOWED_SUPABASE_COLUMNS}
            if not item.get("cadence_mode"):
                item["cadence_mode"] = "native"
            batch.append(item)

        res = requests.post(endpoint, headers=headers, json=batch, timeout=30)
        if res.status_code not in (200, 201, 204):
            print(f"[ERROR] Batch {idx // batch_size + 1} failed ({res.status_code}): {res.text[:300]}")
            return
        total_upserted += len(batch)
        if (idx // batch_size + 1) % 10 == 0 or total_upserted == len(songs):
            print(f"  + Upserted {total_upserted}/{len(songs)} tracks...")

    print(f"[SUCCESS] Synced {total_upserted} tracks to Supabase public.songs in {time.time() - t0:.1f}s!")


def main() -> None:
    with open(SONGS_JSON_PATH, "r", encoding="utf-8") as f:
        songs: List[Dict[str, Any]] = json.load(f)

    print(f"Loaded {len(songs)} raw songs from {SONGS_JSON_PATH}")

    alias_to_canon, canon_to_bilingual = build_master_artist_canon()

    all_tids = sorted({str(s["itunes_track_id"]) for s in songs if s.get("itunes_track_id")})
    token = generate_apple_token()
    meta_ko, meta_en = fetch_apple_bilingual_batch(all_tids, token, batch_size=250)

    seotaiji_boys_titles = {"난알아요", "우리들만의추억", "필승", "발해를꿈꾸며", "하여가"}

    cleaned_songs: List[Dict[str, Any]] = []
    removed_misattributed = 0
    reassigned_count = 0

    for s in songs:
        raw_artist = (s.get("artist") or "").replace("\xa0", " ").strip()
        tid_str = str(s.get("itunes_track_id") or "")
        m_ko = meta_ko.get(tid_str, {})
        m_en = meta_en.get(tid_str, {})

        actual_itunes_artist_ko = m_ko.get("artistName") or s.get("artist_ko") or raw_artist
        actual_itunes_artist_en = m_en.get("artistName") or s.get("artist_en") or raw_artist
        isrc = m_ko.get("isrc") or m_en.get("isrc") or ""

        ako_lower = actual_itunes_artist_ko.lower()
        aen_lower = actual_itunes_artist_en.lower()

        if raw_artist == "넥스트" and ("보이넥스트도어" in ako_lower or "boynextdoor" in aen_lower):
            raw_artist = "보이넥스트도어"
            s["genre_tag"] = "kpop"
            reassigned_count += 1
        elif raw_artist == "이브" and ("아이브" in ako_lower or aen_lower == "ive" or "ive (" in aen_lower):
            raw_artist = "IVE"
            s["genre_tag"] = "kpop"
            reassigned_count += 1
        elif raw_artist == "아이즈" and ("아이즈원" in ako_lower or "iz*one" in aen_lower):
            raw_artist = "아이즈원"
            s["genre_tag"] = "kpop"
            reassigned_count += 1
        elif raw_artist == "아이들" and ("여자친구" in ako_lower or "gfriend" in aen_lower):
            raw_artist = "여자친구"
            s["genre_tag"] = "kpop"
            reassigned_count += 1
        elif raw_artist == "패닉" and "panic! at the disco" in ako_lower:
            raw_artist = "Panic! At The Disco"
            s["genre_tag"] = "rock"
            reassigned_count += 1
        elif raw_artist == "비" and ("비오" in ako_lower or "be'o" in aen_lower):
            raw_artist = "비오"
            s["genre_tag"] = "hiphop"
            reassigned_count += 1
        elif raw_artist == "비" and ("수퍼비" in ako_lower or "슈퍼비" in ako_lower or "superbee" in aen_lower):
            raw_artist = "슈퍼비"
            s["genre_tag"] = "hiphop"
            reassigned_count += 1
        elif raw_artist == "피아" and "피아워십" in ako_lower:
            removed_misattributed += 1
            continue
        elif raw_artist == "딘" and "dean lewis" in ako_lower:
            removed_misattributed += 1
            continue
        elif raw_artist == "버즈" and "buzzie" in ako_lower:
            removed_misattributed += 1
            continue
        elif raw_artist in ("f", "f(x)") and ("huntr/x" in ako_lower or "maximum the hormone" in ako_lower):
            removed_misattributed += 1
            continue
        elif raw_artist == "익스" and "에로틱웜즈익스히비션" in ako_lower:
            removed_misattributed += 1
            continue
        elif raw_artist == "위클리" and "위클리 스위트" in ako_lower:
            removed_misattributed += 1
            continue
        elif raw_artist == "[Alexandros]" and "aryan kumar" in ako_lower:
            removed_misattributed += 1
            continue
        elif raw_artist == "트렌디" and "parable" in ako_lower:
            removed_misattributed += 1
            continue

        canon_artist = alias_to_canon.get(raw_artist, raw_artist)

        raw_t = clean_display_title(s.get("title") or "")
        t_ko_apple = clean_display_title(m_ko.get("name") or "")
        t_en_apple = clean_display_title(m_en.get("name") or "")

        title_ko = t_ko_apple or clean_display_title(s.get("title_ko") or "") or raw_t
        title_en = t_en_apple or clean_display_title(s.get("title_en") or "") or raw_t

        # Special case: Loveholics 'Nice to see you again' == '다시 만난 오늘'
        if canon_artist == "러브홀릭스" and norm_token(title_en) == "nicetoseeyouagain":
            title_ko = "다시 만난 오늘"

        primary_title = title_ko if has_hangul(title_ko) else (raw_t or title_en)

        # Unify Seo Taiji and Boys classics under '서태지와 아이들'
        if canon_artist == "서태지" and norm_token(primary_title) in seotaiji_boys_titles:
            canon_artist = "서태지와 아이들"

        if canon_artist in canon_to_bilingual:
            artist_ko, artist_en = canon_to_bilingual[canon_artist]
        else:
            artist_ko = canon_artist
            artist_en = canon_artist

        s["artist"] = canon_artist
        s["artist_ko"] = artist_ko
        s["artist_en"] = artist_en
        s["title"] = primary_title
        s["title_ko"] = title_ko
        s["title_en"] = title_en
        s["_isrc"] = isrc

        cleaned_songs.append(s)

    print(
        f"After artist canonicalization & misattribution cleanup: {len(cleaned_songs)} songs "
        f"(reassigned={reassigned_count}, removed_misattributed={removed_misattributed})"
    )

    # Deduplicate songs:
    # 1. Same canonical artist AND shared normalized token across (title, title_ko, title_en)
    # 2. Same ISRC across any artist
    # 3. Same (cover_url, norm_token(title)) across featuring/collab artists
    deduped_songs: List[Dict[str, Any]] = []
    seen_artist_title_keys: Dict[Tuple[str, str], Dict[str, Any]] = {}
    seen_isrcs: Dict[str, Dict[str, Any]] = {}
    seen_cover_title: Dict[Tuple[str, str], Dict[str, Any]] = {}
    dup_removed = 0

    for s in cleaned_songs:
        ca = norm_token(s["artist"])
        t_keys = set()
        for f_name in ("title", "title_ko", "title_en"):
            nt = norm_token(s.get(f_name) or "")
            if nt:
                t_keys.add((ca, nt))

        isrc = s.pop("_isrc", "")
        cover = (s.get("cover_url") or "").strip()
        nt_primary = norm_token(s.get("title") or "")
        ct_key = (cover, nt_primary) if (cover and nt_primary) else None

        existing = None
        if isrc and isrc in seen_isrcs:
            existing = seen_isrcs[isrc]
        elif ct_key and ct_key in seen_cover_title:
            existing = seen_cover_title[ct_key]
        else:
            for tk in t_keys:
                if tk in seen_artist_title_keys:
                    existing = seen_artist_title_keys[tk]
                    break

        if existing is not None:
            dup_removed += 1
            if has_hangul(s["title_ko"]) and not has_hangul(existing.get("title_ko", "")):
                existing["title_ko"] = s["title_ko"]
                existing["title"] = s["title_ko"]
            if not has_hangul(s["title_en"]) and has_hangul(existing.get("title_en", "")):
                existing["title_en"] = s["title_en"]
            continue

        deduped_songs.append(s)
        if isrc:
            seen_isrcs[isrc] = s
        if ct_key:
            seen_cover_title[ct_key] = s
        for tk in t_keys:
            seen_artist_title_keys[tk] = s

    print(f"Deduplication complete: removed {dup_removed} duplicate songs -> {len(deduped_songs)} unique songs remain.")

    g_counts = Counter(s["genre_tag"] for s in deduped_songs)
    in_130_180 = sum(1 for s in deduped_songs if 130 <= (s.get("running_bpm") or 0) <= 180)
    unique_artists = len({s["artist"] for s in deduped_songs})
    print(f"Final dataset: {len(deduped_songs)} songs | {unique_artists} canonical artists | 130..180 BPM: {in_130_180}")
    print(f"Genre distribution: {dict(g_counts)}")

    with open(SONGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(deduped_songs, f, ensure_ascii=False, indent=2)
    with open(WEB_SONGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(deduped_songs, f, ensure_ascii=False, indent=2)
    print(f"Saved canonicalized & deduplicated dataset to {SONGS_JSON_PATH} and {WEB_SONGS_JSON_PATH}")

    # Sync to Supabase public.songs
    sync_to_supabase(deduped_songs)


if __name__ == "__main__":
    main()
