"""
J-POP Genre Dataset Collector for PULSE
Collects at least 1,000 to 1,200 authentic, deduplicated J-Pop tracks
(Japanese Pop, J-Rock/Band, Anime OP/ED, Vocaloid/Utaite across 115~185 BPM)
and saves them strictly to crawler/data/new_jpop_songs.json.
"""

from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import re
import time
from typing import Any, Dict, List, Optional, Set, Tuple

import librosa
import numpy as np
import requests

from collectors import clean_parentheses, is_valid_track_title, make_normalized_key, normalize_token
from mass_collector_lib import (
    CACHE_DIR,
    _load_audio_mono,
    download_preview_to_cache,
    generate_apple_music_token,
)
from unify_artists_and_dedup import clean_display_title

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
SONGS_JSON_PATH = BASE_DIR / "data" / "songs.json"
OUTPUT_PATH = BASE_DIR / "data" / "new_jpop_songs.json"

# Explicit slow ballads that must NOT be doubled into >= 115 BPM running tempo
EXPLICIT_SLOW_BALLADS = {
    "lemon",
    "pretender",
    "wherever you are",
    "ドライフラワー",
    "dry flower",
    "水平線",
    "suiheisen",
    "炎",
    "homura",
    "first love",
    "奏",
    "kanade",
    "366日",
    "366 days",
    "猫",
    "neko",
    "ハナミズキ",
    "hanamizuki",
    "subtitle",
    "i love...",
}

# 100 Authentic Seed J-Pop, J-Rock, Anime & Vocaloid Artists
JPOP_SEED_ARTISTS = [
    # 1-20: Modern J-Pop Titans
    {"canon": "YOASOBI", "ko": "요아소비", "en": "YOASOBI", "queries": ["YOASOBI", "ヨアソビ"]},
    {"canon": "Mrs. GREEN APPLE", "ko": "미세스 그린 애플", "en": "Mrs. GREEN APPLE", "queries": ["Mrs. GREEN APPLE", "미세스 그린 애플"]},
    {"canon": "Official HIGE DANdism", "ko": "오피셜히게단디즘", "en": "Official HIGE DANdism", "queries": ["Official HIGE DANdism", "Official髭男dism"]},
    {"canon": "Vaundy", "ko": "바운디", "en": "Vaundy", "queries": ["Vaundy", "バウンディ"]},
    {"canon": "King Gnu", "ko": "킹누", "en": "King Gnu", "queries": ["King Gnu", "キングヌー"]},
    {"canon": "Kenshi Yonezu", "ko": "요네즈 켄시", "en": "Kenshi Yonezu", "queries": ["Kenshi Yonezu", "米津玄師"]},
    {"canon": "Ado", "ko": "아도", "en": "Ado", "queries": ["Ado", "アド"]},
    {"canon": "ZUTOMAYO", "ko": "계속 한밤중이면 좋을 텐데", "en": "ZUTOMAYO", "queries": ["ZUTOMAYO", "ずっと真夜中でいいのに。"]},
    {"canon": "Yorushika", "ko": "요루시카", "en": "Yorushika", "queries": ["Yorushika", "ヨルシカ"]},
    {"canon": "Aimyon", "ko": "아이묭", "en": "Aimyon", "queries": ["Aimyon", "あいみょん"]},
    {"canon": "Fujii Kaze", "ko": "후지이 카제", "en": "Fujii Kaze", "queries": ["Fujii Kaze", "藤井 風"]},
    {"canon": "back number", "ko": "백 넘버", "en": "back number", "queries": ["back number", "バックナンバー"]},
    {"canon": "SEKAI NO OWARI", "ko": "세카이노 오와리", "en": "SEKAI NO OWARI", "queries": ["SEKAI NO OWARI", "世界の終わり"]},
    {"canon": "Yuuri", "ko": "유우리", "en": "Yuuri", "queries": ["優里", "Yuuri"]},
    {"canon": "imase", "ko": "이마세", "en": "imase", "queries": ["imase", "イマセ"]},
    {"canon": "tuki.", "ko": "츠키", "en": "tuki.", "queries": ["tuki."]},
    {"canon": "Creepy Nuts", "ko": "크리피 넛츠", "en": "Creepy Nuts", "queries": ["Creepy Nuts"]},
    {"canon": "LiSA", "ko": "리사", "en": "LiSA", "queries": ["LiSA", "リサ"]},
    {"canon": "Aimer", "ko": "에메", "en": "Aimer", "queries": ["Aimer", "エメ"]},
    {"canon": "milet", "ko": "미레이", "en": "milet", "queries": ["milet", "ミレイ"]},

    # 21-40: Modern J-Rock, Bands & Anime Hits
    {"canon": "Tatsuya Kitani", "ko": "키타니 타츠야", "en": "Tatsuya Kitani", "queries": ["キタニタツヤ", "Tatsuya Kitani"]},
    {"canon": "natori", "ko": "나토리", "en": "natori", "queries": ["な토리", "natori"]},
    {"canon": "RADWIMPS", "ko": "래드윔프스", "en": "RADWIMPS", "queries": ["RADWIMPS", "ラッドウィンプス"]},
    {"canon": "ONE OK ROCK", "ko": "원 오크 록", "en": "ONE OK ROCK", "queries": ["ONE OK ROCK", "ワンオクロック"]},
    {"canon": "BUMP OF CHICKEN", "ko": "범프 오브 치킨", "en": "BUMP OF CHICKEN", "queries": ["BUMP OF CHICKEN", "バンプオブチキン"]},
    {"canon": "SPYAIR", "ko": "스파이에어", "en": "SPYAIR", "queries": ["SPYAIR", "スパイエアー"]},
    {"canon": "ELLEGARDEN", "ko": "엘르가든", "en": "ELLEGARDEN", "queries": ["ELLEGARDEN", "エルレガーデン"]},
    {"canon": "KANA-BOON", "ko": "카나분", "en": "KANA-BOON", "queries": ["KANA-BOON", "カナブーン"]},
    {"canon": "ASIAN KUNG-FU GENERATION", "ko": "아시안 쿵푸 제너레이션", "en": "ASIAN KUNG-FU GENERATION", "queries": ["ASIAN KUNG-FU GENERATION", "アジアン・カンフー・ジェネレーション"]},
    {"canon": "UVERworld", "ko": "우버월드", "en": "UVERworld", "queries": ["UVERworld", "ウーバーワールド"]},
    {"canon": "UNISON SQUARE GARDEN", "ko": "유니즌 스퀘어 가든", "en": "UNISON SQUARE GARDEN", "queries": ["UNISON SQUARE GARDEN"]},
    {"canon": "Ryokuoushoku Shakai", "ko": "녹황색사회", "en": "Ryokuoushoku Shakai", "queries": ["緑黄色社会", "Ryokuoushoku Shakai"]},
    {"canon": "Saucy Dog", "ko": "소시 독", "en": "Saucy Dog", "queries": ["Saucy Dog", "サウシードッグ"]},
    {"canon": "Macaroni Empitsu", "ko": "마카로니 연필", "en": "Macaroni Empitsu", "queries": ["マカロニえんぴつ", "Macaroni Empitsu"]},
    {"canon": "Novelbright", "ko": "노벨브라이트", "en": "Novelbright", "queries": ["Novelbright", "ノーベルブライト"]},
    {"canon": "sumika", "ko": "스미카", "en": "sumika", "queries": ["sumika", "スミカ"]},
    {"canon": "SUPER BEAVER", "ko": "슈퍼 비버", "en": "SUPER BEAVER", "queries": ["SUPER BEAVER", "スーパービーバー"]},
    {"canon": "WANIMA", "ko": "와니마", "en": "WANIMA", "queries": ["WANIMA"]},
    {"canon": "04 Limited Sazabys", "ko": "04 리미티드 사자비스", "en": "04 Limited Sazabys", "queries": ["04 Limited Sazabys"]},
    {"canon": "BLUE ENCOUNT", "ko": "블루 인카운트", "en": "BLUE ENCOUNT", "queries": ["BLUE ENCOUNT", "ブルーエンカウント"]},

    # 41-60: High Energy J-Rock & Anime Rock
    {"canon": "THE ORAL CIGARETTES", "ko": "디 오럴 시가렛츠", "en": "THE ORAL CIGARETTES", "queries": ["THE ORAL CIGARETTES"]},
    {"canon": "Frederic", "ko": "프레데릭", "en": "Frederic", "queries": ["フレデリック", "Frederic"]},
    {"canon": "KEYTALK", "ko": "키토크", "en": "KEYTALK", "queries": ["KEYTALK", "キートーク"]},
    {"canon": "SHISHAMO", "ko": "시샤모", "en": "SHISHAMO", "queries": ["SHISHAMO", "シシャモ"]},
    {"canon": "Hitsuji Bungaku", "ko": "히츠지분가쿠", "en": "Hitsuji Bungaku", "queries": ["羊文学", "Hitsuji Bungaku"]},
    {"canon": "Kessoku Band", "ko": "결속밴드", "en": "Kessoku Band", "queries": ["結束バンド", "Kessoku Band"]},
    {"canon": "Perfume", "ko": "퍼퓸", "en": "Perfume", "queries": ["Perfume", "パフューム"]},
    {"canon": "Sakanaction", "ko": "사카낙션", "en": "Sakanaction", "queries": ["サカナクション", "Sakanaction"]},
    {"canon": "Gen Hoshino", "ko": "호시노 겐", "en": "Gen Hoshino", "queries": ["星野源", "Gen Hoshino"]},
    {"canon": "Hikaru Utada", "ko": "우타다 히카루", "en": "Hikaru Utada", "queries": ["宇多田ヒカル", "Hikaru Utada"]},
    {"canon": "Sheena Ringo", "ko": "시이나 링고", "en": "Sheena Ringo", "queries": ["椎名林檎", "Sheena Ringo"]},
    {"canon": "Tokyo Jihen", "ko": "도쿄지헨", "en": "Tokyo Jihen", "queries": ["東京事変", "Tokyo Jihen"]},
    {"canon": "Spitz", "ko": "스피츠", "en": "Spitz", "queries": ["スピッツ", "Spitz"]},
    {"canon": "Mr.Children", "ko": "미스터 칠드런", "en": "Mr.Children", "queries": ["Mr.Children", "ミスターチルドレン"]},
    {"canon": "GRe4N BOYZ", "ko": "그린 보이즈", "en": "GRe4N BOYZ", "queries": ["GRe4N BOYZ", "GReeeeN"]},
    {"canon": "FLOW", "ko": "플로우", "en": "FLOW", "queries": ["FLOW", "フロウ"]},
    {"canon": "ClariS", "ko": "클라리스", "en": "ClariS", "queries": ["ClariS", "クラリス"]},
    {"canon": "fripSide", "ko": "프립사이드", "en": "fripSide", "queries": ["fripSide", "フリップサイド"]},
    {"canon": "ikimono-gakari", "ko": "이키모노가카리", "en": "ikimono-gakari", "queries": ["いきものがかり", "ikimono-gakari"]},
    {"canon": "Omoinotake", "ko": "오모이노타케", "en": "Omoinotake", "queries": ["Omoinotake", "オモイノタケ"]},

    # 61-80: Dance/Pop, Metal & Heavy Anime Rock
    {"canon": "Da-iCE", "ko": "다이스", "en": "Da-iCE", "queries": ["Da-iCE"]},
    {"canon": "BE:FIRST", "ko": "비퍼스트", "en": "BE:FIRST", "queries": ["BE:FIRST"]},
    {"canon": "XG", "ko": "엑스지", "en": "XG", "queries": ["XG"]},
    {"canon": "BABYMETAL", "ko": "베이비메탈", "en": "BABYMETAL", "queries": ["BABYMETAL", "ベビーメタル"]},
    {"canon": "BAND-MAID", "ko": "밴드메이드", "en": "BAND-MAID", "queries": ["BAND-MAID"]},
    {"canon": "SCANDAL", "ko": "스캔들", "en": "SCANDAL", "queries": ["SCANDAL", "스キャンダル"]},
    {"canon": "MY FIRST STORY", "ko": "마이 퍼스트 스토리", "en": "MY FIRST STORY", "queries": ["MY FIRST STORY"]},
    {"canon": "MAN WITH A MISSION", "ko": "맨 위드 어 미션", "en": "MAN WITH A MISSION", "queries": ["MAN WITH A MISSION"]},
    {"canon": "amazarashi", "ko": "아마자라시", "en": "amazarashi", "queries": ["amazarashi", "アマザラシ"]},
    {"canon": "Eve", "ko": "이브", "en": "Eve", "queries": ["Eve", "イブ"]},
    {"canon": "yama", "ko": "야마", "en": "yama", "queries": ["yama", "ヤマ"]},
    {"canon": "Polkadot Stingray", "ko": "폴카닷 스팅레이", "en": "Polkadot Stingray", "queries": ["ポルカドットスティングレイ", "Polkadot Stingray"]},
    {"canon": "Kana Nishino", "ko": "니시노 카나", "en": "Kana Nishino", "queries": ["西野カナ", "Kana Nishino"]},
    {"canon": "Kyary Pamyu Pamyu", "ko": "캬리 파뮤파뮤", "en": "Kyary Pamyu Pamyu", "queries": ["きゃりーぱみゅぱみゅ", "Kyary Pamyu Pamyu"]},
    {"canon": "DECO*27", "ko": "데코니나", "en": "DECO*27", "queries": ["DECO*27", "デコニーナ"]},
    {"canon": "SawanoHiroyuki[nZk]", "ko": "사와노 히로유키", "en": "SawanoHiroyuki[nZk]", "queries": ["SawanoHiroyuki[nZk]", "澤野弘之"]},
    {"canon": "GARNiDELiA", "ko": "가르니델리아", "en": "GARNiDELiA", "queries": ["GARNiDELiA", "ガルニデリア"]},
    {"canon": "ReoNa", "ko": "레오나", "en": "ReoNa", "queries": ["ReoNa", "レオナ"]},
    {"canon": "MYTH & ROID", "ko": "미스 앤드 로이드", "en": "MYTH & ROID", "queries": ["MYTH & ROID"]},
    {"canon": "coldrain", "ko": "콜드레인", "en": "coldrain", "queries": ["coldrain"]},

    # 81-100: Alternative, Anime Legends & Vocaloid
    {"canon": "SiM", "ko": "심", "en": "SiM", "queries": ["SiM"]},
    {"canon": "Fear, and Loathing in Las Vegas", "ko": "피어 앤드 로딩 인 라스베이거스", "en": "Fear, and Loathing in Las Vegas", "queries": ["Fear, and Loathing in Las Vegas"]},
    {"canon": "Survive Said The Prophet", "ko": "서바이브 세드 더 프로핏", "en": "Survive Said The Prophet", "queries": ["Survive Said The Prophet"]},
    {"canon": "Kanaria", "ko": "카나리아", "en": "Kanaria", "queries": ["Kanaria", "カナリア"]},
    {"canon": "Kano", "ko": "카노", "en": "Kano", "queries": ["鹿乃", "Kano"]},
    {"canon": "Chinozo", "ko": "치노조", "en": "Chinozo", "queries": ["Chinozo", "チノゾ"]},
    {"canon": "syudou", "ko": "슈도", "en": "syudou", "queries": ["syudou", "シュドウ"]},
    {"canon": "WurtS", "ko": "포츠", "en": "WurtS", "queries": ["WurtS", "ワーツ"]},
    {"canon": "ATARASHII GAKKO!", "ko": "새로운 학교의 리더즈", "en": "ATARASHII GAKKO!", "queries": ["新しい学校のリーダーズ", "ATARASHII GAKKO!"]},
    {"canon": "QUEEN BEE", "ko": "여왕벌", "en": "QUEEN BEE", "queries": ["女王蜂", "QUEEN BEE"]},
    {"canon": "ano", "ko": "아노", "en": "ano", "queries": ["あの", "ano"]},
    {"canon": "Reol", "ko": "레올", "en": "Reol", "queries": ["Reol", "れをる"]},
    {"canon": "Centimillimental", "ko": "센치밀리멘탈", "en": "Centimillimental", "queries": ["センチミリメンタル", "Centimillimental"]},
    {"canon": "Sukima Switch", "ko": "스키마 스위치", "en": "Sukima Switch", "queries": ["スキマスイッチ", "Sukima Switch"]},
    {"canon": "Aqua Timez", "ko": "아쿠아 타임즈", "en": "Aqua Timez", "queries": ["Aqua Timez", "アクアタイムズ"]},
    {"canon": "L'Arc-en-Ciel", "ko": "라르크 앙 시엘", "en": "L'Arc-en-Ciel", "queries": ["L'Arc-en-Ciel", "ラルク アン シエル"]},
    {"canon": "GLAY", "ko": "글레이", "en": "GLAY", "queries": ["GLAY", "グレイ"]},
    {"canon": "X JAPAN", "ko": "엑스 재팬", "en": "X JAPAN", "queries": ["X JAPAN", "エックスジャパン"]},
    {"canon": "Stereopony", "ko": "스테레오포니", "en": "Stereopony", "queries": ["ステレオポニー", "Stereopony"]},
    {"canon": "SID", "ko": "시드", "en": "SID", "queries": ["シド", "SID"]},
]


def fetch_artist_jpop_candidates(
    artist_dict: Dict[str, Any],
    token: str,
    existing_ids: Set[int],
    existing_keys: Set[str],
    max_tracks_per_artist: int = 45,
) -> List[Dict[str, Any]]:
    """Fetches candidate songs for a J-Pop artist from Apple Music Catalog (JP first, then KR)."""
    headers = {"Authorization": f"Bearer {token}"}
    canon = artist_dict["canon"]
    artist_ko = artist_dict["ko"]
    artist_en = artist_dict["en"]
    queries = artist_dict["queries"]

    candidates: List[Dict[str, Any]] = []
    seen_tids: Set[int] = set()
    seen_norm_titles: Set[str] = set()

    def _process_items(items: List[Dict[str, Any]], storefront: str):
        for item in items:
            if len(candidates) >= max_tracks_per_artist:
                break
            raw_id = str(item.get("id") or "")
            if not raw_id or not raw_id.isdigit():
                continue
            tid = int(raw_id)
            if tid in seen_tids or tid in existing_ids:
                continue

            attr = item.get("attributes") or {}
            previews = attr.get("previews") or []
            if not previews or not previews[0].get("url"):
                continue
            preview_url = previews[0]["url"]

            raw_title = attr.get("name") or ""
            if not is_valid_track_title(raw_title):
                continue
            clean_t = clean_display_title(raw_title)
            norm_t = normalize_token(clean_t)
            if not norm_t or norm_t in seen_norm_titles:
                continue

            nk = make_normalized_key(canon, clean_t)
            if nk in existing_keys:
                continue

            art_url = (attr.get("artwork") or {}).get("url") or ""
            if "{w}x{h}" in art_url:
                art_url = art_url.replace("{w}x{h}", "600x600")

            dur_ms = attr.get("durationInMillis")
            seen_tids.add(tid)
            seen_norm_titles.add(norm_t)

            candidates.append(
                {
                    "title": clean_t,
                    "title_ko": clean_t,
                    "title_en": "",
                    "artist": canon,
                    "artist_ko": artist_ko,
                    "artist_en": artist_en,
                    "normalized_key": nk,
                    "album": attr.get("albumName") or "",
                    "cover_url": art_url,
                    "duration_sec": int(round(dur_ms / 1000.0)) if dur_ms else None,
                    "genre_tag": "jpop",
                    "preview_url": preview_url,
                    "itunes_track_id": tid,
                    "source": f"apple_music_{storefront}",
                }
            )

    for sf in ("jp", "kr"):
        for q in queries:
            if len(candidates) >= max_tracks_per_artist:
                break
            try:
                # 1. Search artist ID
                r = requests.get(
                    f"https://api.music.apple.com/v1/catalog/{sf}/search",
                    params={"term": q, "types": "artists", "limit": 2, "l": "ko-KR"},
                    headers=headers,
                    timeout=10,
                )
                if r.status_code == 200:
                    adata = r.json().get("results", {}).get("artists", {}).get("data", [])
                    if adata:
                        aid = adata[0]["id"]
                        # Fetch top songs
                        r_top = requests.get(
                            f"https://api.music.apple.com/v1/catalog/{sf}/artists/{aid}/view/top-songs",
                            params={"limit": 50, "l": "ko-KR"},
                            headers=headers,
                            timeout=10,
                        )
                        if r_top.status_code == 200:
                            top_songs = r_top.json().get("data", [])
                            _process_items(top_songs, sf)

                # 2. Paginate search for songs
                for offset in (0, 25, 50):
                    if len(candidates) >= max_tracks_per_artist:
                        break
                    r_s = requests.get(
                        f"https://api.music.apple.com/v1/catalog/{sf}/search",
                        params={"term": q, "types": "songs", "limit": 25, "offset": offset, "l": "ko-KR"},
                        headers=headers,
                        timeout=10,
                    )
                    if r_s.status_code == 200:
                        s_items = r_s.json().get("results", {}).get("songs", {}).get("data", [])
                        if not s_items:
                            break
                        _process_items(s_items, sf)
            except Exception:
                pass
            if len(candidates) >= 30:
                break
        if len(candidates) >= 30:
            break

    return candidates


def analyze_jpop_dsp_worker(track: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Multiprocessing DSP worker for authentic J-Pop / J-Rock running tempo analysis (115 <= BPM <= 185).
    - Unbiased Harmonic Pair detection
    - Half-tempo trap rescue for driving 130~185 BPM fast anime rock / J-Pop
    - Halves slow ballads mistakenly doubled into >= 135 BPM
    - Enforces strict 115 <= running_bpm <= 185
    """
    tid = track.get("itunes_track_id")
    audio_path = CACHE_DIR / f"{tid}.m4a"
    if not audio_path.exists():
        return None

    try:
        y, sr = _load_audio_mono(str(audio_path), sr=22050)
        if len(y) < sr * 5:
            return None
        dur_sec = max(1.0, len(y) / sr)

        hop = 512
        hop_fine = 128
        hop_stft = 256

        S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop_stft))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
        rms_arr = librosa.feature.rms(S=S)
        energy_rms = float(np.mean(rms_arr))
        centroid = float(np.mean(librosa.feature.spectral_centroid(S=S, sr=sr)))
        flatness = float(np.mean(librosa.feature.spectral_flatness(S=S)))

        # Immediate rejection of quiet acoustic ballads / spoken audio
        if energy_rms < 0.115 or (flatness < 0.009 and centroid < 1900):
            return None

        onset_512 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
        onset_128 = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_fine)

        # Percussive onsets
        ks_onset = librosa.onset.onset_strength(
            S=librosa.amplitude_to_db(S[(freqs >= 40) & (freqs <= 1500), :]),
            sr=sr,
            hop_length=hop_stft,
        )
        ks_peaks = librosa.onset.onset_detect(
            onset_envelope=ks_onset, sr=sr, hop_length=hop_stft, delta=0.15, wait=8
        )
        ks_rate = len(ks_peaks) / dur_sec

        full_peaks = librosa.onset.onset_detect(
            onset_envelope=onset_512, sr=sr, hop_length=hop, delta=0.10, wait=5
        )
        onset_rate = len(full_peaks) / dur_sec

        # Beat tracking with neutral anchor start_bpm=135
        tempo_arr, beat_frames = librosa.beat.beat_track(
            onset_envelope=onset_512, sr=sr, hop_length=hop, start_bpm=135.0
        )
        coarse_bpm = float(np.atleast_1d(tempo_arr)[0])

        max_size = int(sr / hop_fine * 3.5)
        ac = librosa.autocorrelate(onset_128, max_size=max_size)
        ac_norm = ac / (ac[0] + 1e-6)

        L_exp = (60.0 * sr) / (hop_fine * coarse_bpm)
        l_min = max(1, int(np.floor(L_exp * 0.92)))
        l_max = min(len(ac) - 2, int(np.ceil(L_exp * 1.08)))
        if l_min <= l_max and l_max < len(ac) - 1:
            k = l_min + int(np.argmax(ac[l_min : l_max + 1]))
            denom = ac[k - 1] - 2.0 * ac[k] + ac[k + 1] + 1e-12
            delta = float(np.clip(0.5 * (ac[k - 1] - ac[k + 1]) / denom, -0.5, 0.5))
            base_bpm = float((60.0 * sr) / (hop_fine * (k + delta)))
        else:
            base_bpm = coarse_bpm

        # Autocorrelation peaks in [60, 192] BPM
        lag_lo = int(60 * sr / (hop_fine * 192))
        lag_hi = int(60 * sr / (hop_fine * 62))
        peaks = []
        for lag in range(lag_lo, min(lag_hi, len(ac_norm) - 2)):
            if ac_norm[lag] > ac_norm[lag - 1] and ac_norm[lag] > ac_norm[lag + 1]:
                denom = ac_norm[lag - 1] - 2.0 * ac_norm[lag] + ac_norm[lag + 1] + 1e-12
                delta = float(np.clip(0.5 * (ac_norm[lag - 1] - ac_norm[lag + 1]) / denom, -0.5, 0.5))
                bpm_v = round(60.0 * sr / (hop_fine * (lag + delta)), 1)
                peaks.append((round(float(ac_norm[lag]), 3), bpm_v))
        peaks.sort(reverse=True)

        pair_candidates = []
        for v1, b1 in peaks:
            if 62.0 <= b1 <= 94.0:
                for v2, b2 in peaks:
                    if 125.0 <= b2 <= 188.0 and abs(b2 - 2.0 * b1) / (2.0 * b1) <= 0.045:
                        pair_candidates.append((round(v1 + v2, 3), b1, b2, v1, v2))
        pair_candidates.sort(reverse=True)

        valid_b = beat_frames[beat_frames < len(onset_512) - 2]
        if len(valid_b) >= 8:
            b_vals = np.array([np.max(onset_512[max(0, b - 1) : b + 2]) for b in valid_b])
            even_m = float(np.mean(b_vals[0::2]))
            odd_m = float(np.mean(b_vals[1::2]))
            alt_ratio = max(even_m, odd_m) / (min(even_m, odd_m) + 1e-6)
        else:
            alt_ratio = 1.0

        raw_bpm = base_bpm

        # Title-based exact match for known slow ballads
        title_lower = clean_display_title(track.get("title") or "").strip().lower()
        is_known_ballad = title_lower in EXPLICIT_SLOW_BALLADS

        if is_known_ballad:
            if raw_bpm >= 120.0:
                raw_bpm = raw_bpm / 2.0
        else:
            # 1. Trapped upbeat rescue (65 <= base_bpm <= 128.5)
            if 65.0 <= base_bpm <= 128.5 and pair_candidates:
                _, b1, b2, v1, v2 = pair_candidates[0]
                is_half_or_triplet = abs(base_bpm - b1) <= 5.5 or abs(base_bpm - (b2 * 2.0 / 3.0)) <= 5.5
                if is_half_or_triplet:
                    if (
                        v2 >= 0.58
                        and v2 >= v1 - 0.045
                        and energy_rms >= 0.150
                        and (ks_rate >= 2.0 or onset_rate >= 2.0)
                        and (centroid >= 2350 or flatness >= 0.022)
                    ):
                        raw_bpm = b2

            # 2. Doubled ballad check (raw_bpm >= 135.0)
            if raw_bpm >= 135.0:
                is_ballad = False
                if energy_rms < 0.125 or (ks_rate < 1.5 and onset_rate < 1.3):
                    is_ballad = True
                elif flatness < 0.015 and centroid < 2200:
                    is_ballad = True
                elif pair_candidates:
                    _, b1, b2, v1, v2 = pair_candidates[0]
                    if abs(raw_bpm - b2) <= 5.0 and (v1 - v2 > 0.045 and (alt_ratio >= 1.45 or flatness < 0.024 or energy_rms < 0.19)):
                        is_ballad = True
                if is_ballad:
                    raw_bpm = raw_bpm / 2.0

        # Snap 128.8..129.9 to 130.0
        if 128.8 <= raw_bpm < 130.0:
            raw_bpm = 130.0

        raw_bpm = round(float(raw_bpm), 1)
        running_bpm = int(round(raw_bpm))

        # Enforce running BPM range [115, 185]
        if not (115 <= running_bpm <= 185):
            return None

        # Rhythm quality metrics
        tempogram = librosa.feature.tempogram(onset_envelope=onset_512, sr=sr, hop_length=hop)
        frame_peak_ratio = np.max(tempogram, axis=0) / (np.mean(tempogram, axis=0) + 1e-6)
        beat_clarity = float(np.clip((np.mean(frame_peak_ratio) - 1.5) / 4.5, 0.0, 1.0))

        if len(valid_b) > 0:
            beat_salience = float(np.mean(onset_512[valid_b]) / (np.mean(onset_512) + 1e-6))
        else:
            beat_salience = 1.0

        if len(beat_frames) > 3:
            frame_dur_ms = (hop / float(sr)) * 1000.0
            beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop)
            ibis_ms = np.diff(beat_times) * 1000.0
            raw_std_ms = float(np.std(ibis_ms))
            quant_floor_ms = frame_dur_ms / np.sqrt(6.0)
            true_jitter_ms = float(np.sqrt(max(0.0, (raw_std_ms ** 2) - (quant_floor_ms ** 2))))
            timing_stability = float(np.clip(1.0 - (true_jitter_ms / 45.0), 0.0, 1.0))
        else:
            timing_stability = 0.5

        salience_norm = float(np.clip((beat_salience - 1.0) / 1.4, 0.0, 1.0))
        energy_norm = float(np.clip(energy_rms / 0.22, 0.0, 1.0))
        running_score = (
            (salience_norm * 0.30)
            + (timing_stability * 0.30)
            + (beat_clarity * 0.20)
            + (energy_norm * 0.20)
        ) * 100.0

        out = dict(track)
        out.update(
            {
                "raw_bpm": raw_bpm,
                "running_bpm": running_bpm,
                "cadence_mode": "native",
                "deezer_bpm": None,
                "deezer_track_id": None,
                "melon_song_id": None,
                "bugs_track_id": None,
                "beat_clarity": round(beat_clarity, 3),
                "beat_salience": round(beat_salience, 2),
                "timing_stability": round(timing_stability, 3),
                "energy_rms": round(energy_rms, 4),
                "running_score": round(float(np.clip(running_score, 10.0, 99.9)), 1),
            }
        )
        return out
    except Exception:
        return None


def enrich_bilingual_metadata(tracks: List[Dict[str, Any]], token: str) -> None:
    """Enriches accepted tracks with official l=en-US title_en and artist_en in batches of 250 IDs."""
    headers = {"Authorization": f"Bearer {token}"}
    batch_size = 250
    for i in range(0, len(tracks), batch_size):
        batch = tracks[i : i + batch_size]
        id_map = {str(t["itunes_track_id"]): t for t in batch}
        ids_str = ",".join(id_map.keys())

        en_attrs: Dict[str, Dict[str, Any]] = {}
        for sf in ("jp", "kr", "us"):
            missing = [tid for tid in id_map if tid not in en_attrs]
            if not missing:
                break
            try:
                r = requests.get(
                    f"https://api.music.apple.com/v1/catalog/{sf}/songs",
                    params={"ids": ",".join(missing), "l": "en-US"},
                    headers=headers,
                    timeout=15,
                )
                if r.status_code == 200:
                    for item in r.json().get("data", []):
                        en_attrs[str(item.get("id"))] = item.get("attributes") or {}
            except Exception:
                pass

        for tid, t in id_map.items():
            attr = en_attrs.get(tid)
            if attr:
                en_name = attr.get("name") or t["title"]
                t["title_en"] = clean_display_title(en_name)
            else:
                t["title_en"] = t["title"]


def main():
    print("=" * 70)
    print("PULSE J-Pop Genre Dataset Collector")
    print("Goal: Collect >= 1,000 authentic, deduplicated J-Pop tracks (115~185 BPM)")
    print(f"Destination: {OUTPUT_PATH}")
    print("=" * 70)

    # 1. Read existing IDs and keys from songs.json (READ ONLY!)
    existing_ids: Set[int] = set()
    existing_keys: Set[str] = set()
    if SONGS_JSON_PATH.exists():
        with open(SONGS_JSON_PATH, "r", encoding="utf-8") as f:
            songs_data = json.load(f)
        for s in songs_data:
            tid = s.get("itunes_track_id")
            if tid:
                existing_ids.add(int(tid))
            nk = s.get("normalized_key")
            if nk:
                existing_keys.add(nk)
    print(f"Loaded {len(existing_ids)} existing track IDs and {len(existing_keys)} keys from songs.json (Read-Only).")

    token = generate_apple_music_token()

    # 2. Gather candidates across all 100 J-Pop seed artists
    print(f"\n[Step 1/5] Gathering candidate tracks across {len(JPOP_SEED_ARTISTS)} J-Pop artists...")
    t0 = time.time()
    candidates: List[Dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=16) as pool:
        futures = {
            pool.submit(fetch_artist_jpop_candidates, a, token, existing_ids, existing_keys, 45): a["canon"]
            for a in JPOP_SEED_ARTISTS
        }
        for fut in as_completed(futures):
            c_name = futures[fut]
            try:
                artist_cand = fut.result()
                candidates.extend(artist_cand)
                print(f"  [{c_name:25}] found {len(artist_cand):2d} candidates (total: {len(candidates)})")
            except Exception as e:
                print(f"  [{c_name:25}] error: {e}")

    # Deduplicate candidate tracks by itunes_track_id and normalized_key
    unique_candidates: List[Dict[str, Any]] = []
    seen_cand_ids: Set[int] = set()
    seen_cand_keys: Set[str] = set()
    for c in candidates:
        tid = c["itunes_track_id"]
        nk = c["normalized_key"]
        if tid in seen_cand_ids or nk in seen_cand_keys:
            continue
        seen_cand_ids.add(tid)
        seen_cand_keys.add(nk)
        unique_candidates.append(c)

    print(f"Gathered {len(unique_candidates)} unique candidate tracks in {time.time() - t0:.1f}s.")

    # 3. Download preview audio files to cache
    print(f"\n[Step 2/5] Downloading audio previews using 24 threads...")
    t_dl = time.time()
    dl_success = 0
    with ThreadPoolExecutor(max_workers=24) as pool:
        futures = [pool.submit(download_preview_to_cache, t) for t in unique_candidates]
        for fut in as_completed(futures):
            res = fut.result()
            if res:
                dl_success += 1
    print(f"Downloaded/verified {dl_success}/{len(unique_candidates)} previews in {time.time() - t_dl:.1f}s.")

    # 4. Multiprocessing Librosa Audio DSP Analysis
    print(f"\n[Step 3/5] Running Librosa DSP tempo & rhythm analysis (ProcessPoolExecutor max_workers=8)...")
    t_dsp = time.time()
    analyzed_tracks: List[Dict[str, Any]] = []

    with ProcessPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(analyze_jpop_dsp_worker, t) for t in unique_candidates]
        for fut in as_completed(futures):
            res = fut.result()
            if res:
                analyzed_tracks.append(res)
                if len(analyzed_tracks) % 100 == 0:
                    print(f"  ... analyzed {len(analyzed_tracks)} accepted tracks in 115..185 BPM")

    print(f"Analysis complete: {len(analyzed_tracks)} tracks accepted in 115..185 BPM in {time.time() - t_dsp:.1f}s.")

    # 5. Enrich Bilingual Metadata (en-US title_en and artist_en)
    print(f"\n[Step 4/5] Enriching bilingual metadata for {len(analyzed_tracks)} accepted tracks...")
    t_en = time.time()
    enrich_bilingual_metadata(analyzed_tracks, token)
    print(f"Bilingual enrichment finished in {time.time() - t_en:.1f}s.")

    # 6. Final Deduplication and Validation
    final_tracks: List[Dict[str, Any]] = []
    final_seen_ids: Set[int] = set()
    final_seen_keys: Set[str] = set()
    for t in analyzed_tracks:
        tid = t["itunes_track_id"]
        nk = t["normalized_key"]
        if tid in final_seen_ids or nk in final_seen_keys or tid in existing_ids:
            continue
        final_seen_ids.add(tid)
        final_seen_keys.add(nk)
        final_tracks.append(t)

    # Sort deterministically by running_score descending
    final_tracks.sort(key=lambda x: x.get("running_score", 0), reverse=True)

    print(f"\n[Step 5/5] Writing {len(final_tracks)} deduplicated J-Pop tracks to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(final_tracks, f, ensure_ascii=False, indent=2)

    print(f"Successfully saved {len(final_tracks)} tracks to {OUTPUT_PATH}!")

    # Summary Statistics
    bpms = [t["running_bpm"] for t in final_tracks]
    fast_count = sum(1 for b in bpms if 130 <= b <= 180)
    print("\n" + "=" * 70)
    print("COLLECTION SUMMARY:")
    print(f"  Total J-Pop Tracks: {len(final_tracks)}")
    if bpms:
        print(f"  BPM Range: {min(bpms)} - {max(bpms)} BPM (mean: {np.mean(bpms):.1f} BPM)")
        print(f"  Tracks in 130..180 BPM: {fast_count} ({fast_count / len(final_tracks) * 100:.1f}%)")
    print(f"  Unique Artists: {len(set(t['artist'] for t in final_tracks))}")
    print(f"  Total Duration: {time.time() - t0:.1f}s")
    print("=" * 70)


if __name__ == "__main__":
    main()
