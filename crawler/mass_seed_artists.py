"""
Master seed artist definitions and merger/sync utilities for the 10,000-song PULSE database.
"""

from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
import requests

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / "web" / ".env.local")

KPOP_ARTISTS_100 = [
    # 5th Gen & Rising Trend Idol Groups
    "아일릿 (ILLIT)",
    "리센느 (RESCENE)",
    "투어스 (TWS)",
    "보이넥스트도어 (BOYNEXTDOOR)",
    "라이즈 (RIIZE)",
    "제로베이스원 (ZEROBASEONE)",
    "키스오브라이프 (KISS OF LIFE)",
    "베이비몬스터 (BABYMONSTER)",
    "트리플에스 (tripleS)",
    "플레이브 (PLAVE)",
    "피프티피프티 (FIFTY FIFTY)",
    "엔믹스 (NMIXX)",
    "케플러 (Kep1er)",
    "하이키 (H1-KEY)",
    "우아 (WOOAH)",
    # 4th Gen Top Groups
    "NewJeans (뉴진스)",
    "aespa (에스파)",
    "IVE (아이브)",
    "LE SSERAFIM (르세라핌)",
    "(여자)아이들",
    "STAYC (스테이씨)",
    "ITZY (있지)",
    "Stray Kids (스트레이 키즈)",
    "투모로우바이투게더 (TOMORROW X TOGETHER)",
    "ENHYPEN (엔하이픈)",
    "ATEEZ (에이티즈)",
    "더보이즈 (THE BOYZ)",
    "TREASURE (트레저)",
    "프로미스나인 (fromis_9)",
    "아이즈원 (IZ*ONE)",
    "오마이걸 (OH MY GIRL)",
    "우주소녀 (WJSN)",
    "이달의 소녀 (LOONA)",
    "비비지 (VIVIZ)",
    # 3rd Gen Legends
    "방탄소년단 (BTS)",
    "세븐틴 (SEVENTEEN)",
    "BLACKPINK (블랙핑크)",
    "TWICE (트와이스)",
    "레드벨벳 (Red Velvet)",
    "EXO (엑소)",
    "NCT 127",
    "NCT DREAM",
    "NCT U",
    "마마무 (MAMAMOO)",
    "여자친구 (GFRIEND)",
    "몬스타엑스 (MONSTA X)",
    "GOT7 (갓세븐)",
    "위너 (WINNER)",
    "아이콘 (iKON)",
    "비투비 (BTOB)",
    "워너원 (Wanna One)",
    "러블리즈 (Lovelyz)",
    "드림캐쳐 (Dreamcatcher)",
    "펜타곤 (PENTAGON)",
    "아스트로 (ASTRO)",
    "SF9",
    "구구단 (gugudan)",
    "모모랜드 (MOMOLAND)",
    # 2nd Gen Legends & Nostalgic Hits
    "소녀시대 (Girls' Generation)",
    "카라 (KARA)",
    "원더걸스 (Wonder Girls)",
    "2NE1",
    "티아라 (T-ARA)",
    "f(x) (에프엑스)",
    "미쓰에이 (miss A)",
    "씨스타 (SISTAR)",
    "걸스데이 (Girl's Day)",
    "에이핑크 (Apink)",
    "브라운아이드걸스 (Brown Eyed Girls)",
    "애프터스쿨 (After School)",
    "오렌지캬라멜 (Orange Caramel)",
    "포미닛 (4minute)",
    "시크릿 (Secret)",
    "레인보우 (Rainbow)",
    "EXID",
    "AOA",
    "빅뱅 (BIGBANG)",
    "샤이니 (SHINee)",
    "슈퍼주니어 (SUPER JUNIOR)",
    "동방신기 (TVXQ!)",
    "2PM",
    "인피니트 (INFINITE)",
    "비스트 (BEAST)",
    "하이라이트 (HIGHLIGHT)",
    "블락비 (Block B)",
    "B1A4 (비원에이포)",
    "틴탑 (TEEN TOP)",
    "제국의아이들 (ZE:A)",
    "엠블랙 (MBLAQ)",
    "SS501",
    # Soloists & Vocal Icons
    "아이유 (IU)",
    "태연 (TAEYEON)",
    "선미 (SUNMI)",
    "청하 (CHUNG HA)",
    "권은비 (KWON EUNBI)",
    "최예나 (YENA)",
    "전소미 (JEON SOMI)",
    "현아 (HyunA)",
    "제니 (JENNIE)",
    "로제 (ROSÉ)",
    "지드래곤 (G-DRAGON)",
    "태양 (TAEYANG)",
    "싸이 (PSY)",
    "보아 (BoA)",
    "이효리 (Lee Hyori)",
    "비 (Rain)",
    "백현 (BAEKHYUN)",
    "정국 (Jung Kook)",
    "화사 (HWASA)",
]

BAND_ARTISTS_100 = [
    # Mainstream & Rising Band Boom
    "DAY6 (데이식스)",
    "DAY6 (Even of Day)",
    "QWER",
    "루시 (LUCY)",
    "실리카겔 (Silica Gel)",
    "잔나비 (JANNABI)",
    "엔플라잉 (N.Flying)",
    "터치드 (TOUCHED)",
    "유다빈밴드 (YdBB)",
    "페퍼톤스 (PEPPERTONES)",
    "소란 (SORAN)",
    "너드커넥션 (Nerd Connection)",
    "데이브레이크 (Daybreak)",
    "원위 (ONEWE)",
    "더 로즈 (The Rose)",
    "드래곤포니 (Dragon Pony)",
    "엑스디너리 히어로즈 (Xdinary Heroes)",
    "기프트 (GIFT)",
    "호피폴라 (Hoppipolla)",
    # Korean Indie Icons & Festival Headliners
    "한로로 (HANRORO)",
    "wave to earth (웨이브투어스)",
    "혁오 (HYUKOH)",
    "검정치마 (The Black Skirts)",
    "새소년 (SE SO NEON)",
    "카더가든 (Car, the garden)",
    "SURL (설)",
    "라쿠나 (Lacuna)",
    "나상현씨밴드 (Band Nah)",
    "브로콜리너마저 (Broccoli, you too?)",
    "장기하와 얼굴들",
    "장기하",
    "언니네 이발관 (Sister's Barbershop)",
    "델리스파이스 (Deli Spice)",
    "몽니 (Monni)",
    "딕펑스 (DICKPUNKS)",
    "글렌체크 (Glen Check)",
    "솔루션스 (THE SOLUTIONS)",
    "오월오일 (May 5th)",
    "크르르 (Krr)",
    "위아더나잇 (We Are The Night)",
    "안녕바다 (Bye Bye Badman)",
    "아도이 (ADOY)",
    "더 발룬티어스 (The Volunteers)",
    "백예린 (Yerin Baek)",
    "전기뱀장어 (THE ELECTRICEELS)",
    "세이수미 (Say Sue Me)",
    "보수동쿨러 (Bosudongcooler)",
    "극동아시아타이거즈",
    "해서웨이 (Hathaw9y)",
    "다섯 (DASUTT)",
    "모트 (Motte)",
    "우효 (OOHYO)",
    # Acoustic / Folk / Pop-Band / Singer-Songwriters
    "10CM (십센치)",
    "AKMU (악뮤)",
    "볼빨간사춘기 (BOL4)",
    "멜로망스 (MeloMance)",
    "어반자카파 (Urban Zakapa)",
    "스탠딩 에그 (Standing Egg)",
    "치즈 (CHEEZE)",
    "스텔라장 (Stella Jang)",
    "선우정아 (sunwoojunga)",
    "옥상달빛 (OKDAL)",
    "제이레빗 (J Rabbit)",
    "가을방학 (Autumn Vacation)",
    "스웨덴세탁소 (Sweden Laundry)",
    "바닐라 어쿠스틱 (Vanilla Acoustic)",
    "커피소년 (Coffee Boy)",
    "하현상 (Ha Hyunsang)",
    "이승윤 (Lee Seung Yoon)",
    "로이킴 (Roy Kim)",
    "김필 (Kim Feel)",
    "정준일 (Jung Joonil)",
    "짙은 (Zitten)",
    "루시드폴 (Lucid Fall)",
    "곽진언 (Kwak Jin Eon)",
    "권진아 (Kwon Jin Ah)",
    "샘김 (Sam Kim)",
    "적재 (Jukjae)",
    "폴킴 (Paul Kim)",
    # Classic & 2000s/2010s Korean Bands
    "FT아일랜드 (FTISLAND)",
    "씨엔블루 (CNBLUE)",
    "버스커 버스커 (Busker Busker)",
    "자전거 탄 풍경",
    "러브홀릭 (Loveholic)",
    "롤러코스터 (Roller Coaster)",
    "클래지콰이 (Clazziquai)",
    "토이 (Toy)",
    "윤종신 (Yoon Jong Shin)",
    "김동률 (Kim Dong Ryul)",
    "이적 (Lee Juck)",
    "패닉 (Panic)",
    "전람회 (Exhibition)",
    "산울림 (Sanullim)",
    "송골매 (Songgolmae)",
    "들국화 (Deulgukhwa)",
    "봄여름가을겨울 (SSAW)",
    "동물원 (Zoo)",
    "유재하 (Yoo Jae Ha)",
    "김광석 (Kim Kwang Seok)",
]

ROCK_ARTISTS_100 = [
    # Korean Rock / Punk / Alternative / Metal Legends
    "국카스텐 (Guckkasten)",
    "윤도현밴드 (YB)",
    "쏜애플 (THORNAPPLE)",
    "넬 (NELL)",
    "크라잉넛 (Crying Nut)",
    "노브레인 (No Brain)",
    "자우림 (Jaurim)",
    "체리필터 (Cherry Filter)",
    "로맨틱펀치 (Romantic Punch)",
    "갤럭시 익스프레스 (Galaxy Express)",
    "브로큰 발렌타인 (Broken Valentine)",
    "부활 (Boohwal)",
    "시나위 (Sinawe)",
    "백두산",
    "김경호 (Kim Kyung Ho)",
    "박완규 (Park Wan Kyu)",
    "김종서 (Kim Jong Seo)",
    "임재범 (Yim Jae Beum)",
    "서태지와 아이들",
    "서태지 (Seo Taiji)",
    "넥스트 (N.EX.T)",
    "신해철 (Shin Hae Chul)",
    "버즈 (Buzz)",
    "플라워 (Flower)",
    "야다 (Yada)",
    "김사랑 (Kim Sarang)",
    "이브 (Eve)",
    "트랜스픽션 (TransFixion)",
    "네미시스 (Nemesis)",
    "내귀에 도청장치 (Wiretap In My Ear)",
    "노바소닉 (Novasonic)",
    "피아 (PIA)",
    "크래쉬 (Crash)",
    "이승열 (Yi Sung Yol)",
    "타카피 (T.A.Copy)",
    "레이지본 (Lazybone)",
    "슈가도넛 (Sugar Donut)",
    "칵스 (THE KOXX)",
    "라이프 앤 타임 (Life and Time)",
    "로로스 (Loro's)",
    "못 (Mot)",
    "허클베리핀 (Huckleberry Finn)",
    # Global Rock / Pop-Punk / Alternative / Stadium Rock
    "Linkin Park",
    "Green Day",
    "Muse",
    "Imagine Dragons",
    "Fall Out Boy",
    "My Chemical Romance",
    "OneRepublic",
    "Coldplay",
    "Oasis",
    "Blur",
    "Queen",
    "Bon Jovi",
    "Nirvana",
    "Foo Fighters",
    "Red Hot Chili Peppers",
    "Arctic Monkeys",
    "The Killers",
    "Paramore",
    "Blink-182",
    "Sum 41",
    "The Offspring",
    "Avril Lavigne",
    "U2",
    "Maroon 5",
    "Panic! At The Disco",
    "The Strokes",
    "Radiohead",
    "AC/DC",
    "Guns N' Roses",
    "Metallica",
    "Simple Plan",
    "Boys Like Girls",
    "All Time Low",
    "5 Seconds of Summer",
    "Måneskin",
    "Twenty One Pilots",
    "The White Stripes",
    "The Black Keys",
    "Kings of Leon",
    "Franz Ferdinand",
    "Kasabian",
    "The Cranberries",
    "Evanescence",
    "Three Days Grace",
    "Skillet",
    "Nickelback",
    "Papa Roach",
    "Weezer",
    "The Smashing Pumpkins",
    "Pearl Jam",
    "Aerosmith",
    "Journey",
    "Scorpions",
    # J-Rock & Anime/Running Rock Icons
    "ONE OK ROCK",
    "Mrs. GREEN APPLE",
    "Official HIGE DANdism",
    "King Gnu",
    "RADWIMPS",
    "SPYAIR",
    "BUMP OF CHICKEN",
    "ELLEGARDEN",
    "ASIAN KUNG-FU GENERATION",
    "Vaundy",
    "YOASOBI",
    "Kenshi Yonezu",
]

HIPHOP_ARTISTS_100 = [
    # Old-School / 2000s / 2010s Classic Korean Hip-Hop
    "리쌍 (Leessang)",
    "다이나믹 듀오 (Dynamicduo)",
    "에픽하이 (Epik High)",
    "드렁큰 타이거 (Drunken Tiger)",
    "윤미래 (Yoon Mirae)",
    "타이거 JK (Tiger JK)",
    "버벌진트 (Verbal Jint)",
    "프라이머리 (Primary)",
    "슈프림팀 (Supreme Team)",
    "산이 (San E)",
    "개리 (GARY)",
    "개코 (Gaeko)",
    "피타입 (P-Type)",
    "가리온 (Garion)",
    "배치기 (Baechigi)",
    "마이티 마우스 (Mighty Mouth)",
    "프리스타일 (Free Style)",
    "MC몽 (MC Mong)",
    "아웃사이더 (Outsider)",
    "원타임 (1TYM)",
    "지누션 (Jinusean)",
    "듀스 (DEUX)",
    "솔리드 (Solid)",
    "데프콘 (Defconn)",
    "매드클라운 (Mad Clown)",
    "DJ DOC",
    "바비킴 (Bobby Kim)",
    "부가킹즈 (Buga Kingz)",
    "주석 (Joosuc)",
    "MC 스나이퍼 (MC Sniper)",
    "배치기",
    "키네틱플로우 (Kinetic Flow)",
    "더 콰이엇 (The Quiett)",
    "도끼 (Dok2)",
    "빈지노 (Beenzino)",
    "사이먼 도미닉 (Simon Dominic)",
    "팔로알토 (Paloalto)",
    "허클베리피 (Huckleberry P)",
    "딥플로우 (Deepflow)",
    "넉살 (Nucksal)",
    "던밀스 (Don Mills)",
    # Modern Korean Hip-Hop & Trendy R&B
    "박재범 (Jay Park)",
    "창모 (CHANGMO)",
    "지코 (ZICO)",
    "이영지 (Lee Young Ji)",
    "비와이 (BewhY)",
    "기리보이 (Giriboy)",
    "pH-1",
    "ASH ISLAND (애쉬 아일랜드)",
    "릴러말즈 (Leellamarz)",
    "로꼬 (Loco)",
    "코드 쿤스트 (CODE KUNST)",
    "식케이 (Sik-K)",
    "그레이 (GRAY)",
    "저스디스 (JUSTHIS)",
    "우원재 (Woo)",
    "쿠기 (Coogie)",
    "슈퍼비 (SUPERBEE)",
    "호미들 (Homies)",
    "폴블랑코 (Paul Blanco)",
    "비오 (BE'O)",
    "릴보이 (lIlBOI)",
    "원슈타인 (Wonstein)",
    "자이언티 (Zion.T)",
    "크러쉬 (Crush)",
    "딘 (DEAN)",
    "헤이즈 (Heize)",
    "페노메코 (PENOMECO)",
    "펀치넬로 (punchnello)",
    "키드밀리 (Kid Milli)",
    "스윙스 (Swings)",
    "양홍원 (Young B)",
    "한요한 (Han Yo Han)",
    "하온 (HAON)",
    "빅나티 (BIG Naughty)",
    "그루비룸 (GroovyRoom)",
    "염따 (YUMDDA)",
    "토일 (TOIL)",
    "스키니 브라운 (Skinny Brown)",
    "머쉬베놈 (MUSHVENOM)",
    "미란이 (Mirani)",
    "래원 (Layone)",
    "언에듀케이티드 키드 (UNEDUCATED KID)",
    "루피 (Loopy)",
    "나플라 (nafla)",
    "블루 (BLOO)",
    "DPR LIVE",
    "DPR IAN",
    "이하이 (LeeHi)",
    "죠지 (george)",
    "범키 (Bumkey)",
    # Global Hip-Hop / Rap / R&B Icons
    "Eminem",
    "Kanye West",
    "Kendrick Lamar",
    "Travis Scott",
    "Post Malone",
    "Drake",
    "21 Savage",
    "Future",
    "Metro Boomin",
    "J. Cole",
    "Tyler, The Creator",
    "A$AP Rocky",
    "Doja Cat",
    "SZA",
    "Central Cee",
    "Jack Harlow",
    "Juice WRLD",
    "XXXTENTACION",
    "Lil Uzi Vert",
    "Bruno Mars",
    "The Weeknd",
    "50 Cent",
    "Snoop Dogg",
    "Dr. Dre",
    "Jay-Z",
    "Nas",
    "Outkast",
    "Black Eyed Peas",
    "Flo Rida",
    "Pitbull",
    "Macklemore & Ryan Lewis",
]


def merge_and_sync_all() -> None:
    """
    Merges `/tmp/mass_{kpop,band,rock,hiphop}.json` into `crawler/data/songs.json`
    and `web/public/data/songs.json`, then bulk-upserts all tracks to Supabase `public.songs`.
    """
    cat_files = {
        "band": Path("/tmp/mass_band.json"),
        "kpop": Path("/tmp/mass_kpop.json"),
        "rock": Path("/tmp/mass_rock.json"),
        "hiphop": Path("/tmp/mass_hiphop.json"),
    }

    existing_path = BASE_DIR / "data" / "songs.json"
    existing_by_cat: Dict[str, List[Dict[str, Any]]] = {"band": [], "kpop": [], "rock": [], "hiphop": []}
    if existing_path.exists():
        with open(existing_path, "r", encoding="utf-8") as f:
            for s in json.load(f):
                g = s.get("genre_tag")
                if g in existing_by_cat:
                    existing_by_cat[g].append(s)

    merged: List[Dict[str, Any]] = []
    seen_keys = set()
    seen_tids = set()

    for cat in ("band", "kpop", "rock", "hiphop"):
        fp = cat_files[cat]
        items = existing_by_cat[cat]
        if fp.exists():
            try:
                with open(fp, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                if len(loaded) > len(items):
                    items = loaded
            except Exception as e:
                print(f"[WARN] Could not read {fp}: {e}")

        cat_added = 0
        for s in items:
            nk = s.get("normalized_key")
            tid = s.get("itunes_track_id")
            if not nk or nk in seen_keys:
                continue
            if tid and tid in seen_tids:
                continue
            seen_keys.add(nk)
            if tid:
                seen_tids.add(tid)
            merged.append(s)
            cat_added += 1
        print(f"Merged category [{cat}]: {cat_added} unique tracks")

    out1 = BASE_DIR / "data" / "songs.json"
    out2 = BASE_DIR.parent / "web" / "public" / "data" / "songs.json"
    out1.parent.mkdir(parents=True, exist_ok=True)
    out2.parent.mkdir(parents=True, exist_ok=True)

    with open(out1, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    with open(out2, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(merged)} total songs to {out1} and {out2}")

    # Upsert to Supabase
    sb_url = (os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
    sb_key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_KEY") or ""
    if not sb_url or not sb_key:
        print("[WARN] Missing SUPABASE_URL or SUPABASE_SECRET_KEY; skipping DB upsert.")
        return

    db_cols = {
        "title", "artist", "normalized_key", "album", "cover_url", "duration_sec",
        "genre_tag", "raw_bpm", "running_bpm", "cadence_mode", "deezer_bpm",
        "beat_clarity", "beat_salience", "timing_stability", "energy_rms",
        "running_score", "preview_url", "itunes_track_id", "deezer_track_id",
        "melon_song_id", "bugs_track_id", "source"
    }

    headers = {
        "apikey": sb_key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    if not sb_key.startswith("sb_"):
        headers["Authorization"] = f"Bearer {sb_key}"

    endpoint = f"{sb_url}/rest/v1/songs?on_conflict=normalized_key"
    batch_size = 250
    batches = []
    for i in range(0, len(merged), batch_size):
        chunk = merged[i : i + batch_size]
        payload = [{k: v for k, v in s.items() if k in db_cols} for s in chunk]
        batches.append((i, payload))

    def _upsert_batch(b_tuple):
        idx, payload = b_tuple
        r = requests.post(endpoint, headers=headers, json=payload, timeout=30)
        return idx, len(payload), r.status_code, r.text[:120]

    upserted = 0
    with ThreadPoolExecutor(max_workers=6) as pool:
        for idx, count, code, txt in pool.map(_upsert_batch, batches):
            if code in (200, 201, 204):
                upserted += count
            else:
                print(f"[ERR] Batch {idx} status={code}: {txt}")
    print(f"Supabase public.songs upsert complete: {upserted}/{len(merged)} rows synced.")


if __name__ == "__main__":
    merge_and_sync_all()
