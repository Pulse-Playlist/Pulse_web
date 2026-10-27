"""
Merges newly collected `edm`, `pop`, and `jpop` tracks (`new_edm_songs.json`, `new_pop_songs.json`, `new_jpop_songs.json`),
reclassifies existing EDM/Pop/J-Pop artists in `songs.json` into their proper genres,
canonicalizes bilingual artist & track names, deduplicates across all 7 genres,
and syncs the final dataset to `web/public/data/songs.json` and Supabase `public.songs`.
"""

from collections import Counter
import json
from pathlib import Path
from typing import Any, Dict, List, Set

from unify_artists_and_dedup import (
    BASE_DIR,
    SONGS_JSON_PATH,
    WEB_SONGS_JSON_PATH,
    build_master_artist_canon,
    clean_display_title,
    fetch_apple_bilingual_batch,
    generate_apple_token,
    has_hangul,
    norm_token,
    sync_to_supabase,
)

JPOP_ARTISTS_SET: Set[str] = {
    "YOASOBI", "Mrs. GREEN APPLE", "Official HIGE DANdism", "Vaundy", "King Gnu",
    "Kenshi Yonezu", "요네즈 켄시", "Ado", "아도", "ZUTOMAYO", "계속 한밤중이면 좋을 텐데",
    "Yorushika", "요루시카", "Aimyon", "아이묭", "Fujii Kaze", "후지이 카제",
    "back number", "백넘버", "백 넘버", "SEKAI NO OWARI", "세카이노 오와리",
    "Yuuri", "유우리", "imase", "이마세", "tuki.", "츠키", "Creepy Nuts", "크리피 넛츠",
    "LiSA", "리사", "Aimer", "에메", "milet", "미레이", "Tatsuya Kitani", "키타니 타츠야",
    "natori", "나토리", "RADWIMPS", "ONE OK ROCK", "BUMP OF CHICKEN", "SPYAIR",
    "ELLEGARDEN", "KANA-BOON", "ASIAN KUNG-FU GENERATION", "UVERworld",
    "UNISON SQUARE GARDEN", "Ryokuoushoku Shakai", "녹황색사회", "Saucy Dog",
    "Macaroni Empitsu", "마카로니 연필", "Novelbright", "노벨브라이트", "sumika", "스미카",
    "SUPER BEAVER", "WANIMA", "04 Limited Sazabys", "BLUE ENCOUNT", "THE ORAL CIGARETTES",
    "Frederic", "KEYTALK", "SHISHAMO", "Hitsuji Bungaku", "히츠지분가쿠",
    "Kessoku Band", "결속밴드", "Perfume", "퍼퓸", "Sakanaction", "사카낙션",
    "Gen Hoshino", "호시노 겐", "Hikaru Utada", "우타다 히카루", "Sheena Ringo", "시이나 링고",
    "Tokyo Jihen", "도쿄지헨", "Spitz", "스피츠", "Mr.Children", "GRe4N BOYZ", "GReeeeN",
    "FLOW", "ClariS", "fripSide", "ikimono-gakari", "이키모노가카리", "Omoinotake",
    "Da-iCE", "BE:FIRST", "XG", "BABYMETAL", "BAND-MAID", "SCANDAL", "MY FIRST STORY",
    "MAN WITH A MISSION", "amazarashi", "coldrain", "Crossfaith", "10-FEET", "Aqua Timez",
    "Fear, and Loathing in Las Vegas", "Hitorie", "L'Arc-en-Ciel", "Maximum the Hormone",
    "Nothing's Carved In Stone", "ORANGE RANGE", "Polkadot Stingray", "Sambomaster",
    "X JAPAN", "[Alexandros]",
}

POP_ARTISTS_SET: Set[str] = {
    "Dua Lipa", "The Weeknd", "Bruno Mars", "Charlie Puth", "Sabrina Carpenter",
    "Olivia Rodrigo", "Taylor Swift", "Lady Gaga", "Ariana Grande", "Justin Bieber",
    "Ed Sheeran", "Shawn Mendes", "Camila Cabello", "Doja Cat", "Sia", "Katy Perry",
    "Rihanna", "Beyoncé", "Michael Jackson", "Madonna", "Britney Spears",
    "Justin Timberlake", "Maroon 5", "OneRepublic", "5 Seconds of Summer",
    "One Direction", "Harry Styles", "Troye Sivan", "Carly Rae Jepsen", "Chappell Roan",
    "Billie Eilish", "Lorde", "Charli xcx", "Zara Larsson", "Ava Max", "Anne-Marie",
    "Ellie Goulding", "Jess Glynne", "Rita Ora", "RAYE", "Benson Boone", "Tate McRae",
    "Meghan Trainor", "DNCE", "Jonas Brothers", "Demi Lovato", "Miley Cyrus",
    "Selena Gomez", "Halsey", "Khalid", "Lauv", "LANY", "The 1975", "Bleachers",
    "Walk the Moon", "Foster the People", "Passion Pit", "CHVRCHES", "Kylie Minogue",
    "ABBA", "Earth, Wind & Fire", "Stevie Wonder", "Elton John", "Billy Joel",
    "Whitney Houston", "Kelly Clarkson", "P!nk", "Kesha", "Usher", "Chris Brown",
    "Ne-Yo", "Jason Derulo", "Conan Gray", "Gracie Abrams", "Madison Beer",
    "Pitbull", "Flo Rida", "Black Eyed Peas", "Pharrell Williams", "Fergie",
}

EDM_ARTISTS_SET: Set[str] = {
    "Calvin Harris", "Avicii", "Zedd", "David Guetta", "Martin Garrix",
    "Swedish House Mafia", "Daft Punk", "Peggy Gou", "페기 구", "Fred again..",
    "Disclosure", "Tiësto", "Alan Walker", "Marshmello", "The Chainsmokers",
    "Kygo", "Galantis", "Clean Bandit", "Major Lazer", "DJ Snake", "Skrillex",
    "Diplo", "Porter Robinson", "Madeon", "Illenium", "Gryffin", "Lost Frequencies",
    "Robin Schulz", "Jonas Blue", "Sigala", "Joel Corry", "Jax Jones", "MEDUZA",
    "Fisher", "Chris Lake", "Dom Dolla", "John Summit", "250", "이오공", "Deadmau5",
    "Eric Prydz", "Above & Beyond", "Armin van Buuren", "Hardwell", "Nicky Romero",
    "Afrojack", "Steve Aoki", "Dimitri Vegas & Like Mike", "Don Diablo",
    "Oliver Heldens", "Tchami", "Dillon Francis", "RL Grime", "Flume", "ODESZA",
    "Justice", "Gesaffelstein", "The Chemical Brothers", "Fatboy Slim", "The Prodigy",
    "Darude", "Cascada", "Scooter", "R3HAB", "Alok", "Timmy Trumpet", "W&W", "KSHMR",
    "Charlotte de Witte", "Amelie Lens", "Bicep", "Pendulum", "Sub Focus", "Wilkinson",
    "Chase & Status", "Rudimental", "Netsky", "Dimension", "Culture Shock",
    "Fox Stevenson", "Andy C", "High Contrast", "Hybrid Minds", "Kanine", "Metrik",
    "Grafix", "Koven", "Nia Archives", "Sigma", "DJ Fresh", "Delta Heavy", "Maduk",
    "Luude", "Bru-C", "Hedex", "Bou", "LMFAO", "Kaytranada", "PinkPantheress",
}

EXTRA_BILINGUAL_MAP: Dict[str, tuple[str, str, str]] = {
    "Kenshi Yonezu": ("Kenshi Yonezu", "요네즈 켄시", "Kenshi Yonezu"),
    "요네즈 켄시": ("Kenshi Yonezu", "요네즈 켄시", "Kenshi Yonezu"),
    "Ado": ("Ado", "아도", "Ado"),
    "아도": ("Ado", "아도", "Ado"),
    "ZUTOMAYO": ("ZUTOMAYO", "계속 한밤중이면 좋을 텐데", "ZUTOMAYO"),
    "계속 한밤중이면 좋을 텐데": ("ZUTOMAYO", "계속 한밤중이면 좋을 텐데", "ZUTOMAYO"),
    "Yorushika": ("Yorushika", "요루시카", "Yorushika"),
    "요루시카": ("Yorushika", "요루시카", "Yorushika"),
    "Aimyon": ("Aimyon", "아이묭", "Aimyon"),
    "아이묭": ("Aimyon", "아이묭", "Aimyon"),
    "Fujii Kaze": ("Fujii Kaze", "후지이 카제", "Fujii Kaze"),
    "후지이 카제": ("Fujii Kaze", "후지이 카제", "Fujii Kaze"),
    "back number": ("back number", "백 넘버", "back number"),
    "백넘버": ("back number", "백 넘버", "back number"),
    "백 넘버": ("back number", "백 넘버", "back number"),
    "SEKAI NO OWARI": ("SEKAI NO OWARI", "세카이노 오와리", "SEKAI NO OWARI"),
    "세카이노 오와리": ("SEKAI NO OWARI", "세카이노 오와리", "SEKAI NO OWARI"),
    "Yuuri": ("Yuuri", "유우리", "Yuuri"),
    "유우리": ("Yuuri", "유우리", "Yuuri"),
    "imase": ("imase", "이마세", "imase"),
    "이마세": ("imase", "이마세", "imase"),
    "tuki.": ("tuki.", "츠키", "tuki."),
    "츠키": ("tuki.", "츠키", "tuki."),
    "Creepy Nuts": ("Creepy Nuts", "크리피 넛츠", "Creepy Nuts"),
    "크리피 넛츠": ("Creepy Nuts", "크리피 넛츠", "Creepy Nuts"),
    "LiSA": ("LiSA", "리사 (LiSA)", "LiSA"),
    "Aimer": ("Aimer", "에메", "Aimer"),
    "에메": ("Aimer", "에메", "Aimer"),
    "milet": ("milet", "미레이", "milet"),
    "미레이": ("milet", "미레이", "milet"),
    "Tatsuya Kitani": ("Tatsuya Kitani", "키타니 타츠야", "Tatsuya Kitani"),
    "키타니 타츠야": ("Tatsuya Kitani", "키타니 타츠야", "Tatsuya Kitani"),
    "natori": ("natori", "나토리", "natori"),
    "나토리": ("natori", "나토리", "natori"),
    "Ryokuoushoku Shakai": ("Ryokuoushoku Shakai", "녹황색사회", "Ryokuoushoku Shakai"),
    "녹황색사회": ("Ryokuoushoku Shakai", "녹황색사회", "Ryokuoushoku Shakai"),
    "Macaroni Empitsu": ("Macaroni Empitsu", "마카로니 연필", "Macaroni Empitsu"),
    "마카로니 연필": ("Macaroni Empitsu", "마카로니 연필", "Macaroni Empitsu"),
    "Novelbright": ("Novelbright", "노벨브라이트", "Novelbright"),
    "노벨브라이트": ("Novelbright", "노벨브라이트", "Novelbright"),
    "sumika": ("sumika", "스미카", "sumika"),
    "스미카": ("sumika", "스미카", "sumika"),
    "Hitsuji Bungaku": ("Hitsuji Bungaku", "히츠지분가쿠", "Hitsuji Bungaku"),
    "히츠지분가쿠": ("Hitsuji Bungaku", "히츠지분가쿠", "Hitsuji Bungaku"),
    "Kessoku Band": ("Kessoku Band", "결속밴드", "Kessoku Band"),
    "결속밴드": ("Kessoku Band", "결속밴드", "Kessoku Band"),
    "Perfume": ("Perfume", "퍼퓸", "Perfume"),
    "퍼퓸": ("Perfume", "퍼퓸", "Perfume"),
    "Sakanaction": ("Sakanaction", "사카낙션", "Sakanaction"),
    "사카낙션": ("Sakanaction", "사카낙션", "Sakanaction"),
    "Gen Hoshino": ("Gen Hoshino", "호시노 겐", "Gen Hoshino"),
    "호시노 겐": ("Gen Hoshino", "호시노 겐", "Gen Hoshino"),
    "Hikaru Utada": ("Hikaru Utada", "우타다 히카루", "Hikaru Utada"),
    "우타다 히카루": ("Hikaru Utada", "우타다 히카루", "Hikaru Utada"),
    "Spitz": ("Spitz", "스피츠", "Spitz"),
    "스피츠": ("Spitz", "스피츠", "Spitz"),
    "Peggy Gou": ("Peggy Gou", "페기 구", "Peggy Gou"),
    "페기 구": ("Peggy Gou", "페기 구", "Peggy Gou"),
    "250": ("250", "이오공", "250"),
    "이오공": ("250", "이오공", "250"),
    "Calvin Harris": ("Calvin Harris", "캘빈 해리스", "Calvin Harris"),
    "Avicii": ("Avicii", "아비치", "Avicii"),
    "Zedd": ("Zedd", "제드", "Zedd"),
    "David Guetta": ("David Guetta", "데이비드 게타", "David Guetta"),
    "Martin Garrix": ("Martin Garrix", "마틴 개릭스", "Martin Garrix"),
    "Daft Punk": ("Daft Punk", "다프트 펑크", "Daft Punk"),
    "The Weeknd": ("The Weeknd", "위켄드", "The Weeknd"),
    "Dua Lipa": ("Dua Lipa", "두아 리파", "Dua Lipa"),
    "Bruno Mars": ("Bruno Mars", "브루노 마스", "Bruno Mars"),
    "Charlie Puth": ("Charlie Puth", "찰리 푸스", "Charlie Puth"),
    "Sabrina Carpenter": ("Sabrina Carpenter", "사브리나 카펜터", "Sabrina Carpenter"),
    "Olivia Rodrigo": ("Olivia Rodrigo", "올리비아 로드리고", "Olivia Rodrigo"),
    "Taylor Swift": ("Taylor Swift", "테일러 스위프트", "Taylor Swift"),
    "Ariana Grande": ("Ariana Grande", "아리아나 그란데", "Ariana Grande"),
    "Lady Gaga": ("Lady Gaga", "레이디 가가", "Lady Gaga"),
    "Justin Bieber": ("Justin Bieber", "저스틴 비버", "Justin Bieber"),
    "Maroon 5": ("Maroon 5", "마룬 5", "Maroon 5"),
    "Doja Cat": ("Doja Cat", "도자 캣", "Doja Cat"),
    "Ed Sheeran": ("Ed Sheeran", "에드 시런", "Ed Sheeran"),
    "Coldplay": ("Coldplay", "콜드플레이", "Coldplay"),
    "Imagine Dragons": ("Imagine Dragons", "이매진 드래곤스", "Imagine Dragons"),
    "OneRepublic": ("OneRepublic", "원리퍼블릭", "OneRepublic"),
}


def main() -> None:
    with open(SONGS_JSON_PATH, "r", encoding="utf-8") as f:
        base_songs: List[Dict[str, Any]] = json.load(f)

    print(f"Loaded {len(base_songs)} existing songs from {SONGS_JSON_PATH}")

    new_files = [
        ("edm", BASE_DIR / "data" / "new_edm_songs.json"),
        ("pop", BASE_DIR / "data" / "new_pop_songs.json"),
        ("jpop", BASE_DIR / "data" / "new_jpop_songs.json"),
    ]

    added_songs: List[Dict[str, Any]] = []
    for g_tag, fpath in new_files:
        if fpath.exists():
            with open(fpath, "r", encoding="utf-8") as f:
                items = json.load(f)
                for it in items:
                    it["genre_tag"] = g_tag
                added_songs.extend(items)
                print(f"  + Loaded {len(items)} new `{g_tag}` tracks from {fpath.name}")
        else:
            print(f"  [WARN] {fpath} not found!")

    alias_to_canon, canon_to_bilingual = build_master_artist_canon()
    for raw_k, (c_name, ko_name, en_name) in EXTRA_BILINGUAL_MAP.items():
        alias_to_canon[raw_k] = c_name
        canon_to_bilingual[c_name] = (ko_name, en_name)

    # Fetch Apple Music ko-KR and en-US track metadata only for any NEW track IDs missing title_en/title_ko
    new_tids = sorted({
        str(s["itunes_track_id"])
        for s in added_songs
        if s.get("itunes_track_id") and (not s.get("title_en") or not s.get("title_ko"))
    })
    meta_ko: Dict[str, Dict[str, Any]] = {}
    meta_en: Dict[str, Dict[str, Any]] = {}
    if new_tids:
        token = generate_apple_token()
        meta_ko, meta_en = fetch_apple_bilingual_batch(new_tids, token, batch_size=250)

    all_raw = base_songs + added_songs
    reclassified_counts = Counter()

    processed_songs: List[Dict[str, Any]] = []
    for s in all_raw:
        raw_artist = clean_display_title(s.get("artist") or "")
        # Strip parenthetical alias on raw artist if not (여자)아이들 or f(x)
        if not raw_artist.startswith("(여자)아이들") and not raw_artist.lower().startswith("f(x)"):
            import re
            raw_artist_clean = re.sub(r"\s*\(.*?\)\s*", "", raw_artist).strip()
        else:
            raw_artist_clean = raw_artist

        canon_artist = alias_to_canon.get(raw_artist, alias_to_canon.get(raw_artist_clean, raw_artist_clean))

        tid_str = str(s.get("itunes_track_id") or "")
        m_ko = meta_ko.get(tid_str, {})
        m_en = meta_en.get(tid_str, {})
        isrc = m_ko.get("isrc") or m_en.get("isrc") or ""

        # Reclassify existing J-Pop, Pop, and EDM artists into their proper genres
        old_g = s.get("genre_tag")
        if canon_artist in JPOP_ARTISTS_SET or raw_artist_clean in JPOP_ARTISTS_SET:
            if old_g != "jpop":
                s["genre_tag"] = "jpop"
                reclassified_counts["jpop"] += 1
        elif canon_artist in EDM_ARTISTS_SET or raw_artist_clean in EDM_ARTISTS_SET:
            if old_g != "edm":
                s["genre_tag"] = "edm"
                reclassified_counts["edm"] += 1
        elif canon_artist in POP_ARTISTS_SET or raw_artist_clean in POP_ARTISTS_SET:
            if old_g != "pop":
                s["genre_tag"] = "pop"
                reclassified_counts["pop"] += 1

        if canon_artist in canon_to_bilingual:
            artist_ko, artist_en = canon_to_bilingual[canon_artist]
        else:
            ako_cand = m_ko.get("artistName") or s.get("artist_ko") or canon_artist
            aen_cand = m_en.get("artistName") or s.get("artist_en") or canon_artist
            artist_ko = ako_cand
            artist_en = aen_cand

        raw_t = clean_display_title(s.get("title") or "")
        t_ko_apple = clean_display_title(m_ko.get("name") or "")
        t_en_apple = clean_display_title(m_en.get("name") or "")

        title_ko = t_ko_apple or clean_display_title(s.get("title_ko") or "") or raw_t
        title_en = t_en_apple or clean_display_title(s.get("title_en") or "") or raw_t
        primary_title = title_ko if has_hangul(title_ko) else (raw_t or title_en)

        s["artist"] = canon_artist
        s["artist_ko"] = artist_ko
        s["artist_en"] = artist_en
        s["title"] = primary_title
        s["title_ko"] = title_ko
        s["title_en"] = title_en
        s["_isrc"] = isrc

        processed_songs.append(s)

    print(f"Reclassified existing tracks into new genres: {dict(reclassified_counts)}")

    # Deduplicate across all 7 genres
    deduped_songs: List[Dict[str, Any]] = []
    seen_artist_title_keys: Dict[tuple[str, str], Dict[str, Any]] = {}
    seen_isrcs: Dict[str, Dict[str, Any]] = {}
    seen_tids: Set[int] = set()
    seen_nks: Set[str] = set()
    dup_removed = 0

    for s in processed_songs:
        tid = s.get("itunes_track_id")
        nk = s.get("normalized_key") or f"{norm_token(s['artist'])}::{norm_token(s['title'])}"
        s["normalized_key"] = nk

        ca = norm_token(s["artist"])
        t_keys = set()
        for f_name in ("title", "title_ko", "title_en"):
            nt = norm_token(s.get(f_name) or "")
            if nt:
                t_keys.add((ca, nt))

        isrc = s.pop("_isrc", "")

        if (tid and tid in seen_tids) or (nk in seen_nks) or (isrc and isrc in seen_isrcs):
            dup_removed += 1
            continue

        is_dup = False
        for tk in t_keys:
            if tk in seen_artist_title_keys:
                is_dup = True
                break
        if is_dup:
            dup_removed += 1
            continue

        deduped_songs.append(s)
        if tid:
            seen_tids.add(tid)
        seen_nks.add(nk)
        if isrc:
            seen_isrcs[isrc] = s
        for tk in t_keys:
            seen_artist_title_keys[tk] = s

    g_counts = Counter(s["genre_tag"] for s in deduped_songs)
    in_130_180 = sum(1 for s in deduped_songs if 130 <= (s.get("running_bpm") or 0) <= 180)
    unique_artists = len({s["artist"] for s in deduped_songs})

    print(f"Deduplication complete: removed {dup_removed} duplicates -> {len(deduped_songs)} unique songs.")
    print(f"Total songs: {len(deduped_songs)} | Unique artists: {unique_artists} | 130..180 BPM: {in_130_180}")
    print(f"Genre distribution across 7 genres: {dict(g_counts)}")

    with open(SONGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(deduped_songs, f, ensure_ascii=False, indent=2)
    with open(WEB_SONGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(deduped_songs, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(deduped_songs)} songs to {SONGS_JSON_PATH} and {WEB_SONGS_JSON_PATH}")
    sync_to_supabase(deduped_songs)


if __name__ == "__main__":
    main()
