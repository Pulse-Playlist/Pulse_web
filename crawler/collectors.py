"""
Track Collectors for PULSE:
1. Melon TOP 100 Scraper
2. Bugs TOP 100 Scraper
3. Bugs Mobile JSON API & HTML Artist Track Collector
4. iTunes Artist Catalog Batch Collector with strict Korean/English alias verification
"""

import re
import time
from typing import Any, Dict, List, Optional, Set
import requests
from bs4 import BeautifulSoup

from config import (
    ARTIST_ALIASES,
    CATEGORY_SEED_ARTISTS,
    EXCLUDE_TITLE_KEYWORDS,
    HEADERS_BUGS,
    HEADERS_MELON,
)


def clean_parentheses(text: str) -> str:
    """Removes parenthetical or bracketed suffixes like (Feat. ...), (Inst.), [OST ...]."""
    cleaned = re.sub(r"\s*[\(\[\{].*?[\)\]\}]", "", text)
    return cleaned.strip() or text.strip()


def normalize_token(text: str) -> str:
    """Normalizes artist or title string for reliable deduplication and matching."""
    base = clean_parentheses(text).lower()
    base = re.sub(r"[^0-9a-zA-Z가-힣]+", "", base)
    return base


def make_normalized_key(artist: str, title: str) -> str:
    """Creates a canonical deduplication key 'artist::title'."""
    norm_artist = normalize_token(artist.split(",")[0])
    norm_title = normalize_token(title)
    return f"{norm_artist}::{norm_title}"


def is_artist_match(seed_artist: str, candidate_artist: str) -> bool:
    """
    Strictly verifies that `candidate_artist` returned by iTunes/Bugs is genuinely `seed_artist`.
    Prevents substring false positives like 'YB' matching 'YoungBoy Never Broke Again'
    or 'IVE' matching 'Revive'.
    """
    if not candidate_artist:
        return False

    # Reject explicit known false-positive artists
    lower_cand = candidate_artist.lower()
    if "youngboy" in lower_cand or "migos" in lower_cand or "bailey zimmerman" in lower_cand:
        return False

    allowed_norms = set(ARTIST_ALIASES.get(seed_artist, []))
    allowed_norms.add(normalize_token(seed_artist))

    # Split candidate artist on collaboration separators (&, ,, feat, x)
    parts = re.split(r"[,&/]|(?:\bfeat\.?\b)|(?:\bwith\b)", candidate_artist, flags=re.IGNORECASE)
    cand_norms = {normalize_token(p) for p in parts if normalize_token(p)}
    cand_full_norm = normalize_token(candidate_artist)

    for allowed in allowed_norms:
        if not allowed:
            continue
        if allowed in cand_norms or allowed == cand_full_norm:
            return True
        # Only allow substring match if the alias is at least 5 chars long (e.g. 'silicagel', 'newjeans')
        if len(allowed) >= 5 and allowed in cand_full_norm:
            return True

    return False


def is_valid_track_title(title: str) -> bool:
    """Returns False if the title indicates an instrumental, remix, live, or intro/outro track."""
    if not title or len(title.strip()) < 1:
        return False
    lower_title = title.lower()
    for kw in EXCLUDE_TITLE_KEYWORDS:
        if kw in lower_title:
            return False
    if re.search(r"\b(remix|inst|instrumental|karaoke|ver\.|version)\b", lower_title):
        return False
    return True


def fetch_melon_top100() -> List[Dict[str, Any]]:
    """Scrapes the current Melon TOP 100 chart."""
    url = "https://www.melon.com/chart/index.htm"
    try:
        res = requests.get(url, headers=HEADERS_MELON, timeout=12)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        rows = soup.select("tr.lst50, tr.lst100")

        tracks: List[Dict[str, Any]] = []
        for row in rows:
            song_id = row.get("data-song-no")
            title_el = row.select_one("div.ellipsis.rank01 a")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            if not is_valid_track_title(title):
                continue

            artists = [a.get_text(strip=True) for a in row.select("div.ellipsis.rank02 a")]
            seen_a: List[str] = []
            for a in artists:
                if a and a not in seen_a:
                    seen_a.append(a)
            artist_name = ", ".join(seen_a) if seen_a else ""

            album_el = row.select_one("div.ellipsis.rank03 a")
            album = album_el.get_text(strip=True) if album_el else ""

            img_el = row.select_one("a.image_typeAll img")
            cover_url = img_el.get("src") if img_el else None
            if cover_url and "_120.jpg" in cover_url.lower():
                cover_url = re.sub(r"_120\.jpg", "_500.jpg", cover_url, flags=re.IGNORECASE)

            tracks.append(
                {
                    "title": title,
                    "artist": artist_name,
                    "album": album,
                    "cover_url": cover_url,
                    "melon_song_id": str(song_id) if song_id else None,
                    "source": "melon_top100",
                }
            )
        return tracks
    except Exception as exc:
        print(f"[WARN] Melon TOP 100 fetch failed: {exc}")
        return []


def fetch_bugs_top100() -> List[Dict[str, Any]]:
    """Scrapes the current Bugs TOP 100 chart."""
    url = "https://music.bugs.co.kr/chart"
    try:
        res = requests.get(url, headers=HEADERS_BUGS, timeout=12)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        rows = soup.select("table.list.trackList > tbody > tr")

        tracks: List[Dict[str, Any]] = []
        for row in rows:
            track_id = row.get("trackid")
            if not track_id:
                continue
            title_el = row.select_one("p.title > a")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            if not is_valid_track_title(title):
                continue

            artists = []
            for a in row.select("p.artist > a"):
                name = a.get_text(strip=True)
                if name and name not in artists:
                    artists.append(name)
            artist_name = ", ".join(artists)

            album_el = row.select_one("a.album")
            album = album_el.get_text(strip=True) if album_el else ""

            img_el = row.select_one("a.thumbnail img")
            cover_url = img_el.get("src") if img_el else None
            if cover_url and "/images/50/" in cover_url:
                cover_url = cover_url.replace("/images/50/", "/images/500/")

            tracks.append(
                {
                    "title": title,
                    "artist": artist_name,
                    "album": album,
                    "cover_url": cover_url,
                    "bugs_track_id": str(track_id),
                    "source": "bugs_top100",
                }
            )
        return tracks
    except Exception as exc:
        print(f"[WARN] Bugs TOP 100 fetch failed: {exc}")
        return []


def fetch_itunes_artist_catalog(artist_query: str, limit: int = 35, sleep_sec: float = 0.8) -> List[Dict[str, Any]]:
    """
    Fetches up to `limit` songs for an artist from iTunes Store (KR first, then US fallback)
    with strict artist alias validation.
    """
    url = "https://itunes.apple.com/search"
    catalog: List[Dict[str, Any]] = []
    seen_keys: Set[str] = set()

    for country in ("kr", "us"):
        params = {
            "term": artist_query,
            "country": country,
            "entity": "song",
            "media": "music",
            "limit": limit,
        }
        for attempt in range(2):
            try:
                res = requests.get(url, params=params, timeout=12)
                if res.status_code in (403, 429):
                    time.sleep(3.5 * (attempt + 1))
                    continue
                if res.status_code != 200:
                    break
                results = res.json().get("results", [])
                for item in results:
                    preview_url = item.get("previewUrl")
                    title = item.get("trackName") or ""
                    artist_name = item.get("artistName") or ""
                    if not preview_url or not is_valid_track_title(title):
                        continue

                    if not is_artist_match(artist_query, artist_name):
                        continue

                    album_name = item.get("collectionName") or ""
                    lower_album = album_name.lower()
                    if any(
                        ba.lower() in lower_album
                        for ba in (
                            "REVIVE+", "IVE SECRET", "IVE EMPATHY", "PUREFLOW", "ODYSSEY",
                            "The Action", "HOME: DELUXE", "No Genre", "play hard",
                            "NO TRAGEDY", "TRY WITH US", "LEMONADE", "WDA", "KISS N TELL", "Rich Man"
                        )
                    ):
                        continue

                    key = make_normalized_key(artist_query, title)
                    if key in seen_keys:
                        continue
                    seen_keys.add(key)

                    artwork = item.get("artworkUrl100") or ""
                    if "100x100bb" in artwork:
                        artwork = artwork.replace("100x100bb", "600x600bb")

                    duration_ms = item.get("trackTimeMillis")
                    catalog.append(
                        {
                            "title": clean_parentheses(title),
                            "artist": artist_query,
                            "album": item.get("collectionName") or "",
                            "cover_url": artwork,
                            "duration_sec": int(round(duration_ms / 1000.0)) if duration_ms else None,
                            "preview_url": preview_url,
                            "itunes_track_id": item.get("trackId"),
                            "source": f"itunes_{country}",
                        }
                    )
                time.sleep(sleep_sec)
                break
            except Exception:
                time.sleep(1.5)

        if len(catalog) >= 8:
            break

    return catalog


def collect_category_candidates(
    category: str,
    target_candidates: int = 135,
    existing_keys: Optional[Set[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Collects at least `target_candidates` unique tracks for a given category ('band', 'kpop', 'rock', 'hiphop').
    """
    if existing_keys is None:
        existing_keys = set()

    seed_artists = CATEGORY_SEED_ARTISTS.get(category, [])
    collected: List[Dict[str, Any]] = []
    seen_keys: Set[str] = set(existing_keys)

    per_artist_quota = max(8, (target_candidates // max(1, len(seed_artists))) + 3)
    for artist in seed_artists:
        if len(collected) >= target_candidates:
            break
        catalog = fetch_itunes_artist_catalog(artist, limit=35, sleep_sec=0.6)
        added_for_artist = 0
        for item in catalog:
            key = make_normalized_key(item["artist"], item["title"])
            if key in seen_keys:
                continue
            seen_keys.add(key)
            item["genre_tag"] = category
            item["normalized_key"] = key
            collected.append(item)
            added_for_artist += 1
            if added_for_artist >= per_artist_quota or len(collected) >= target_candidates:
                break

    return collected
