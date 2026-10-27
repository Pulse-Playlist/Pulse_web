"""
Expanded Upbeat Artist Seeds (~600 artists total across Rock, Band, K-Pop, Hip-Hop)
for adding 5,000 genuine 130..180 BPM running songs and merging/syncing ~15,000 total tracks.
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

ROCK_FAST_ARTISTS_160 = [
    # Korean Punk / Rock / Indie Rock / Hard Rock
    "국카스텐 (Guckkasten)", "윤도현밴드 (YB)", "쏜애플 (THORNAPPLE)", "크라잉넛 (Crying Nut)",
    "노브레인 (No Brain)", "자우림 (Jaurim)", "체리필터 (Cherry Filter)", "로맨틱펀치 (Romantic Punch)",
    "갤럭시 익스프레스 (Galaxy Express)", "브로큰 발렌타인 (Broken Valentine)", "트랜스픽션 (TransFixion)",
    "네미시스 (Nemesis)", "내귀에 도청장치 (Wiretap In My Ear)", "노바소닉 (Novasonic)", "피아 (PIA)",
    "크래쉬 (Crash)", "타카피 (T.A.Copy)", "레이지본 (Lazybone)", "슈가도넛 (Sugar Donut)",
    "칵스 (THE KOXX)", "라이프 앤 타임 (Life and Time)", "서태지와 아이들", "서태지 (Seo Taiji)",
    "넥스트 (N.EX.T)", "신해철 (Shin Hae Chul)", "버즈 (Buzz)", "김경호 (Kim Kyung Ho)",
    "이브 (Eve)", "김사랑 (Kim Sarang)", "시나위 (Sinawe)", "부활 (Boohwal)", "검엑스 (GumX)",
    "럼블피쉬 (Rumble Fish)", "익스 (EX)", "러브홀릭스 (Loveholics)", "불독맨션 (Bulldog Mansion)",
    "보드카레인 (Vodka Rain)", "고고스타 (GoGo Star)", "구남과여라이딩스텔라", "아시안체어샷 (Asian Chairshot)",
    "단편선과 선원들", "술탄 오브 더 디스코 (Sultan of the Disco)", "킹스턴 루디스카 (Kingston Rudieska)",
    "넘버원코리안 (No.1 Korean)", "카피머신 (Copy Machine)", "와이낫 (Ynot?)", "문샤이너스 (The Moonshiners)",
    "락타이거즈 (The RockTigers)", "스트라이커스 (The Strikers)", "바세린 (Vassline)", "할로우잰 (Hollow Jan)",
    "매써드 (Method)", "디아블로 (Diablo)", "나티 (Naty)", "해리빅버튼 (HarryBigButton)",
    # J-Rock & Anime Running Rock Icons
    "ONE OK ROCK", "Mrs. GREEN APPLE", "Official HIGE DANdism", "King Gnu", "RADWIMPS",
    "SPYAIR", "BUMP OF CHICKEN", "ELLEGARDEN", "ASIAN KUNG-FU GENERATION", "Vaundy",
    "YOASOBI", "Kenshi Yonezu", "KANA-BOON", "UVERworld", "MAN WITH A MISSION",
    "UNISON SQUARE GARDEN", "[Alexandros]", "WANIMA", "BLUE ENCOUNT", "My Hair is Bad",
    "04 Limited Sazabys", "Sambomaster", "FLOW", "SCANDAL", "LiSA", "Aimer",
    "Creepy Nuts", "Eve", "ZUTOMAYO", "Yorushika", "Ado", " Tatsuya Kitani",
    "natori", "imase", "Saucy Dog", "Macaroni Empitsu", "SUPER BEAVER",
    "10-FEET", "SiM", "coldrain", "Crossfaith", "Maximum the Hormone", " Fear, and Loathing in Las Vegas",
    "Nothing's Carved In Stone", "THE ORAL CIGARETTES", "KEYTALK", "フレデリック (Frederic)",
    "Polkadot Stingray", "SHISHAMO", "Ryokuoushoku Shakai", "Hitorie", " Ling tosite sigure",
    "amazarashi", "DOES", "Aqua Timez", "ORANGE RANGE", "L'Arc-en-Ciel", "GLAY", "X JAPAN",
    # Global Pop-Punk / Alternative / Garage / Stadium Rock
    "Linkin Park", "Green Day", "Muse", "Imagine Dragons", "Fall Out Boy",
    "My Chemical Romance", "OneRepublic", "Coldplay", "Oasis", "Blur",
    "Queen", "Bon Jovi", "Nirvana", "Foo Fighters", "Red Hot Chili Peppers",
    "Arctic Monkeys", "The Killers", "Paramore", "Blink-182", "Sum 41",
    "The Offspring", "Avril Lavigne", "U2", "Maroon 5", "Panic! At The Disco",
    "The Strokes", "AC/DC", "Guns N' Roses", "Metallica", "Simple Plan",
    "Boys Like Girls", "All Time Low", "5 Seconds of Summer", "Måneskin", "Twenty One Pilots",
    "The White Stripes", "The Black Keys", "Kings of Leon", "Franz Ferdinand", "Kasabian",
    "Three Days Grace", "Skillet", "Nickelback", "Papa Roach", "Weezer",
    "The Smashing Pumpkins", "Pearl Jam", "Good Charlotte", "Yellowcard", "New Found Glory",
    "Rise Against", "Jimmy Eat World", "Neck Deep", "State Champs", "Waterparks",
    "Royal Blood", "Nothing But Thieves", "Two Door Cinema Club", "Phoenix", "The Wombats",
    "Foals", "Biffy Clyro", "The Fratellis", "Jet", "The Hives", "The Vines",
    "Wolfmother", "Kaiser Chiefs", "The Libertines", "Bloc Party", "Interpol",
    "Yeah Yeah Yeahs", "Cage the Elephant", "Walk the Moon", "Foster the People",
    "Bastille", "The 1975", "YUNGBLUD", "Machine Gun Kelly", "Bring Me The Horizon",
    "Breaking Benjamin", "Shinedown", "Seether", "Disturbed", "Avenged Sevenfold",
    "Bullet for My Valentine", "Trivium", "Halestorm", "The Pretty Reckless",
    "Billy Talent", "Bowling for Soup", "Relient K", "Mayday Parade", "Pierce the Veil",
    "Sleeping With Sirens", "Taking Back Sunday", "The Used", "AFI", "Bad Religion",
    "NOFX", "Rancid", "Pennywise", "Social Distortion", "Dropkick Murphys",
]

BAND_FAST_ARTISTS_130 = [
    # Mainstream & Rising Band Boom
    "DAY6 (데이식스)", "DAY6 (Even of Day)", "QWER", "루시 (LUCY)", "실리카겔 (Silica Gel)",
    "잔나비 (JANNABI)", "엔플라잉 (N.Flying)", "터치드 (TOUCHED)", "유다빈밴드 (YdBB)",
    "페퍼톤스 (PEPPERTONES)", "소란 (SORAN)", "너드커넥션 (Nerd Connection)", "데이브레이크 (Daybreak)",
    "원위 (ONEWE)", "더 로즈 (The Rose)", "드래곤포니 (Dragon Pony)", "엑스디너리 히어로즈 (Xdinary Heroes)",
    "기프트 (GIFT)", "호피폴라 (Hoppipolla)", "한로로 (HANRORO)", "혁오 (HYUKOH)",
    "새소년 (SE SO NEON)", "SURL (설)", "라쿠나 (Lacuna)", "나상현씨밴드 (Band Nah)",
    "브로콜리너마저 (Broccoli, you too?)", "장기하와 얼굴들", "장기하", "언니네 이발관 (Sister's Barbershop)",
    "델리스파이스 (Deli Spice)", "몽니 (Monni)", "딕펑스 (DICKPUNKS)", "글렌체크 (Glen Check)",
    "솔루션스 (THE SOLUTIONS)", "오월오일 (May 5th)", "위아더나잇 (We Are The Night)",
    "안녕바다 (Bye Bye Badman)", "아도이 (ADOY)", "더 발룬티어스 (The Volunteers)",
    "전기뱀장어 (THE ELECTRICEELS)", "세이수미 (Say Sue Me)", "보수동쿨러 (Bosudongcooler)",
    "극동아시아타이거즈", "FT아일랜드 (FTISLAND)", "씨엔블루 (CNBLUE)", "버스커 버스커 (Busker Busker)",
    "러브홀릭 (Loveholic)", "롤러코스터 (Roller Coaster)", "클래지콰이 (Clazziquai)",
    "송골매 (Songgolmae)", "봄여름가을겨울 (SSAW)", "AKMU (악뮤)", "볼빨간사춘기 (BOL4)",
    "스텔라장 (Stella Jang)", "이승윤 (Lee Seung Yoon)",
    # Additional Upbeat Korean Indie & Pop/Rock Bands
    "쏜애플", "체리필터", "로맨틱펀치", "크라잉넛", "노브레인", "자우림",
    "갤럭시 익스프레스", "칵스", "라이프 앤 타임", "데이식스", "루시",
    "아이즈 (IZ)", "하이파이유니콘 (Hi-Fi Un!corn)", "캐치더영 (Catch The Young)",
    "더 픽스 (THE FIX)", "롤링쿼츠 (Rolling Quartz)", "코토바 (cotoba)", "다브다 (Dabda)",
    "터틀스 (Turtles)", "체리콕", "아디오스 오디오 (Adios Audio)", "헤이맨 (HeyMen)",
    "크랙샷 (Crack Shot)", "동구", "구만 (9.10000)", "이츠", "프롬올투휴먼",
    "트렌디 (TRENDZ)", "위아영 (We Are Young)", "마틴스미스 (Martin Smith)",
    "소수빈", "설 (SURL)", "도란", "오이스터", "로바이페퍼스",
    "피터팬 컴플렉스 (Peterpan Complex)", "스윗소로우 (Sweet Sorrow)", "원모어찬스 (One More Chance)",
    "제이슨 므라즈 (Jason Mraz)", "올 아메리칸 리젝트 (The All-American Rejects)",
    "더 스크립트 (The Script)", "코다라인 (Kodaline)", "래드윔프스", " 미세스 그린 애플",
    "오피셜히게단디즘", "스파이웨어 (SPYAIR)", "엘르가든 (ELLEGARDEN)", "범프 오브 치킨",
    "요아소비", "바운디", "킹누", "아이묭 (Aimyon)", "유우리 (Yuuri)",
    "백넘버 (back number)", "세카이노 오와리 (SEKAI NO OWARI)", "도쿄 스카 파라다이스 오케스트라",
    "서치모스 (Suchmos)", "후지이 카제 (Fujii Kaze)", "호시노 겐 (Gen Hoshino)",
    "원 오크 록", "아시안 쿵푸 제너레이션", "우버월드", "카나분",
    "불독맨션", "보드카레인", "고고스타", "술탄 오브 더 디스코", "킹스턴 루디스카",
    "넘버원코리안", "익스", "럼블피쉬", "러브홀릭스", "버즈", "플라워", "야다",
    "이브", "브로큰 발렌타인", "피아", "Two Door Cinema Club", "Phoenix",
    "The Wombats", "Foals", "Foster the People", "Walk the Moon", "Bastille",
    "The 1975", "Cage the Elephant", "The Fratellis", "Kaiser Chiefs", "Bloc Party",
    "Franz Ferdinand", "Kasabian", "The Killers", "Paramore", "Weezer",
    "5 Seconds of Summer", "All Time Low", "Boys Like Girls", "Simple Plan",
    "Panic! At The Disco", "OneRepublic", "Imagine Dragons", "Maroon 5",
    "KANA-BOON", "UNISON SQUARE GARDEN", "[Alexandros]", "WANIMA", "BLUE ENCOUNT",
    "04 Limited Sazabys", "Sambomaster", "KEYTALK", "Frederic", "SHISHAMO",
    "Ryokuoushoku Shakai", "SUPER BEAVER", "Macaroni Empitsu", "Saucy Dog",
    "Mrs. GREEN APPLE", "Official HIGE DANdism", "King Gnu", "RADWIMPS", "SPYAIR",
    "BUMP OF CHICKEN", "ELLEGARDEN", "ASIAN KUNG-FU GENERATION", "Vaundy", "YOASOBI",
    "Kenshi Yonezu", "Coldplay", "Oasis", "Blur", "U2", "The Strokes", "Arctic Monkeys",
]

KPOP_FAST_ARTISTS_140 = [
    # 5th Gen & Rising Trend Idol Groups
    "아일릿 (ILLIT)", "리센느 (RESCENE)", "투어스 (TWS)", "보이넥스트도어 (BOYNEXTDOOR)",
    "라이즈 (RIIZE)", "제로베이스원 (ZEROBASEONE)", "키스오브라이프 (KISS OF LIFE)",
    "베이비몬스터 (BABYMONSTER)", "트리플에스 (tripleS)", "플레이브 (PLAVE)",
    "피프티피프티 (FIFTY FIFTY)", "엔믹스 (NMIXX)", "케플러 (Kep1er)", "하이키 (H1-KEY)",
    "우아 (WOOAH)", "이즈나 (izna)", "미야오 (MEOVV)", "유니스 (UNIS)", "영파씨 (YOUNG POSSE)",
    "배드빌런 (BADVILLAIN)", "세이마이네임 (SAY MY NAME)", "앰퍼샌드원 (AMPERS&ONE)",
    "이븐 (EVNNE)", "싸이커스 (xikers)", "피원하모니 (P1Harmony)", "앤팀 (&TEAM)",
    "넥스지 (NEXZ)", "엔시티 위시 (NCT WISH)", "더윈드 (The Wind)", "판타지 보이즈 (FANTASY BOYS)",
    "원팩트 (ONE PACT)", "에잇턴 (8TURN)", "템페스트 (TEMPEST)", "이펙스 (EPEX)",
    # 4th Gen Top Groups
    "NewJeans (뉴진스)", "aespa (에스파)", "IVE (아이브)", "LE SSERAFIM (르세라핌)",
    "(여자)아이들", "STAYC (스테이씨)", "ITZY (있지)", "Stray Kids (스트레이 키즈)",
    "투모로우바이투게더 (TOMORROW X TOGETHER)", "ENHYPEN (엔하이픈)", "ATEEZ (에이티즈)",
    "더보이즈 (THE BOYZ)", "TREASURE (트레저)", "프로미스나인 (fromis_9)", "아이즈원 (IZ*ONE)",
    "오마이걸 (OH MY GIRL)", "우주소녀 (WJSN)", "이달의 소녀 (LOONA)", "비비지 (VIVIZ)",
    "크래비티 (CRAVITY)", "원어스 (ONEUS)", "베리베리 (VERIVERY)", "시크릿넘버 (SECRET NUMBER)",
    "퍼플키스 (PURPLE KISS)", "라잇썸 (LIGHTSUM)", "빌리 (Billlie)", "클라씨 (CLASS:y)",
    "체리블렛 (Cherry Bullet)", "로켓펀치 (Rocket Punch)", "위클리 (Weeekly)", "트라이비 (TRI.BE)",
    "에버글로우 (EVERGLOW)", "시그니처 (cignature)", "드림노트 (DreamNote)", "아르테미스 (ARTMS)",
    "루셈블 (Loossemble)", "츄 (CHUU)", "권은비 (KWON EUNBI)", "최예나 (YENA)",
    "조유리 (JO YURI)", "강혜원", "이채연 (LEE CHAEYEON)", "김세정",
    # 3rd Gen Legends
    "방탄소년단 (BTS)", "세븐틴 (SEVENTEEN)", "BLACKPINK (블랙핑크)", "TWICE (트와이스)",
    "레드벨벳 (Red Velvet)", "EXO (엑소)", "NCT 127", "NCT DREAM", "NCT U", "WayV",
    "마마무 (MAMAMOO)", "여자친구 (GFRIEND)", "몬스타엑스 (MONSTA X)", "GOT7 (갓세븐)",
    "위너 (WINNER)", "아이콘 (iKON)", "비투비 (BTOB)", "워너원 (Wanna One)",
    "러블리즈 (Lovelyz)", "드림캐쳐 (Dreamcatcher)", "펜타곤 (PENTAGON)", "아스트로 (ASTRO)",
    "SF9", "구구단 (gugudan)", "모모랜드 (MOMOLAND)", "골든차일드 (Golden Child)",
    "온앤오프 (ONF)", "에이스 (A.C.E)", "빅톤 (VICTON)", "업텐션 (UP10TION)",
    "다이아 (DIA)", "위키미키 (Weki Meki)", "프리스틴 (PRISTIN)", "아이오아이 (I.O.I)",
    "청하 (CHUNG HA)", "전소미 (JEON SOMI)", "선미 (SUNMI)", "현아 (HyunA)",
    # 2nd Gen & Solo Dance/Pop Icons
    "소녀시대 (Girls' Generation)", "카라 (KARA)", "원더걸스 (Wonder Girls)", "2NE1",
    "티아라 (T-ARA)", "f(x) (에프엑스)", "미쓰에이 (miss A)", "씨스타 (SISTAR)",
    "걸스데이 (Girl's Day)", "에이핑크 (Apink)", "브라운아이드걸스 (Brown Eyed Girls)",
    "애프터스쿨 (After School)", "오렌지캬라멜 (Orange Caramel)", "포미닛 (4minute)",
    "시크릿 (Secret)", "레인보우 (Rainbow)", "EXID", "AOA", "나인뮤지스 (9MUSES)",
    "달샤벳 (Dalshabet)", "스피카 (SPICA)", "헬로비너스 (HELLOVENUS)", "피에스타 (FIESTAR)",
    "크레용팝 (Crayon Pop)", "라붐 (LABOUM)", "소나무 (SONAMOO)",
    "빅뱅 (BIGBANG)", "샤이니 (SHINee)", "슈퍼주니어 (SUPER JUNIOR)", "동방신기 (TVXQ!)",
    "2PM", "인피니트 (INFINITE)", "비스트 (BEAST)", "하이라이트 (HIGHLIGHT)",
    "블락비 (Block B)", "B1A4 (비원에이포)", "틴탑 (TEEN TOP)", "제국의아이들 (ZE:A)",
    "엠블랙 (MBLAQ)", "SS501", "유키스 (U-KISS)", "보이프렌드 (BOYFRIEND)", "비에이피 (B.A.P)",
    "아이유 (IU)", "태연 (TAEYEON)", "제니 (JENNIE)", "로제 (ROSÉ)", "리사 (LISA)",
    "지드래곤 (G-DRAGON)", "태양 (TAEYANG)", "싸이 (PSY)", "보아 (BoA)", "이효리 (Lee Hyori)",
    "비 (Rain)", "백현 (BAEKHYUN)", "정국 (Jung Kook)", "화사 (HWASA)", "태민 (TAEMIN)",
    "카이 (KAI)", "키 (KEY)", "효연 (HYO)", "제시 (Jessi)", "코요태 (Koyote)",
    "터보 (Turbo)", "클론 (Clon)", "쿨 (COOL)", "룰라 (Roo'Ra)", "김건모", "박진영 (J.Y. Park)",
    "엄정화", "손담비", "가인", "아이비", "서인영", "이정현", "체리필터",
]

HIPHOP_FAST_ARTISTS_160 = [
    # Upbeat Korean Hip-Hop / Dance-Rap / Rage / Pluggnb / Club Hip-Hop
    "에픽하이 (Epik High)", "다이나믹 듀오 (Dynamicduo)", "리쌍 (Leessang)", "드렁큰 타이거 (Drunken Tiger)",
    "윤미래 (Yoon Mirae)", "타이거 JK (Tiger JK)", "프라이머리 (Primary)", "슈프림팀 (Supreme Team)",
    "산이 (San E)", "개리 (GARY)", "개코 (Gaeko)", "배치기 (Baechigi)", "마이티 마우스 (Mighty Mouth)",
    "MC몽 (MC Mong)", "아웃사이더 (Outsider)", "원타임 (1TYM)", "지누션 (Jinusean)",
    "듀스 (DEUX)", "솔리드 (Solid)", "데프콘 (Defconn)", "매드클라운 (Mad Clown)",
    "DJ DOC", "부가킹즈 (Buga Kingz)", "주석 (Joosuc)", "MC 스나이퍼 (MC Sniper)",
    "더 콰이엇 (The Quiett)", "도끼 (Dok2)", "빈지노 (Beenzino)", "사이먼 도미닉 (Simon Dominic)",
    "팔로알토 (Paloalto)", "허클베리피 (Huckleberry P)", "딥플로우 (Deepflow)", "넉살 (Nucksal)",
    "던밀스 (Don Mills)", "박재범 (Jay Park)", "창모 (CHANGMO)", "지코 (ZICO)",
    "이영지 (Lee Young Ji)", "비와이 (BewhY)", "기리보이 (Giriboy)", "pH-1",
    "ASH ISLAND (애쉬 아일랜드)", "릴러말즈 (Leellamarz)", "로꼬 (Loco)", "코드 쿤스트 (CODE KUNST)",
    "식케이 (Sik-K)", "그레이 (GRAY)", "저스디스 (JUSTHIS)", "우원재 (Woo)",
    "쿠기 (Coogie)", "슈퍼비 (SUPERBEE)", "호미들 (Homies)", "폴블랑코 (Paul Blanco)",
    "비오 (BE'O)", "릴보이 (lIlBOI)", "원슈타인 (Wonstein)", "페노메코 (PENOMECO)",
    "펀치넬로 (punchnello)", "키드밀리 (Kid Milli)", "스윙스 (Swings)", "양홍원 (Young B)",
    "한요한 (Han Yo Han)", "하온 (HAON)", "빅나티 (BIG Naughty)", "그루비룸 (GroovyRoom)",
    "염따 (YUMDDA)", "토일 (TOIL)", "스키니 브라운 (Skinny Brown)", "머쉬베놈 (MUSHVENOM)",
    "미란이 (Mirani)", "래원 (Layone)", "언에듀케이티드 키드 (UNEDUCATED KID)",
    "루피 (Loopy)", "나플라 (nafla)", "블루 (BLOO)", "DPR LIVE", "DPR IAN",
    "제시 (Jessi)", "소코도모 (sokodomo)", "조광일 (Jo Gwangil)", "비비 (BIBI)",
    "던말릭 (DON MALIK)", "칸 (KHAN)", "노윤하", "칠린호미 (Chillin Homie)",
    "릴타치 (Lil Tachi)", "오르내림 (OLNL)", "우디고차일드 (Woodie Gochild)",
    "제네 더 질라 (ZENE THE ZILLA)", "디보 (Dbo)", "레디 (Reddy)", "지투 (G2)",
    "해쉬스완 (Hash Swan)", "김효은 (Keem Hyo-Eun)", "차메인 (Chamane)",
    "노엘 (NO:EL)", "재키와이 (Jvcki Wai)", "윤훼이 (YUNHWAY)", "스카이민혁 (Skyminhyuk)",
    "베이식 (Basick)", "한해 (Hanhae)", "칸토 (Kanto)", "케이윌", "산체스", "마이크로닷",
    # Global Upbeat Hip-Hop / Rage / Club Rap / UK Garage / Grime / Dance-Rap / Electro-Hop
    "Eminem", "Kanye West", "Kendrick Lamar", "Travis Scott", "Post Malone",
    "Drake", "21 Savage", "Future", "Metro Boomin", "J. Cole", "Tyler, The Creator",
    "A$AP Rocky", "Doja Cat", "Central Cee", "Jack Harlow", "Juice WRLD",
    "XXXTENTACION", "Lil Uzi Vert", "Playboi Carti", "Yeat", "Ken Carson",
    "Destroy Lonely", "Trippie Redd", "Ski Mask the Slump God", "Denzel Curry",
    "JPEGMAFIA", "Baby Keem", "Don Toliver", "Gunna", "Young Thug", "Lil Baby",
    "DaBaby", "Megan Thee Stallion", "Cardi B", "Nicki Minaj", "Ice Spice",
    "PinkPantheress", "Skepta", "Stormzy", "Dave", "AJ Tracey", "Headie One",
    "Dizzee Rascal", "Wiley", "Kano", "Jme", "Slowthai", "Little Simz",
    "Anderson .Paak", "Kaytranada", "GoldLink", "Aminé", "Brockhampton",
    "Logic", "NF", "G-Eazy", "Big Sean", "Wiz Khalifa", "Mac Miller",
    "Kid Cudi", "Childish Gambino", "Chance the Rapper", "Lupe Fiasco", "B.o.B",
    "Pitbull", "Flo Rida", "Black Eyed Peas", "LMFAO", "Macklemore & Ryan Lewis",
    "Outkast", "Missy Elliott", "Busta Rhymes", "Timbaland", "Pharrell Williams",
    "N.E.R.D", "will.i.am", "Fergie", "Sean Paul", "Major Lazer", "DJ Snake",
    "Calvin Harris", "David Guetta", "Disclosure", "Rudimental", "Chase & Status",
    "50 Cent", "Snoop Dogg", "Dr. Dre", "Jay-Z", "Nas", "Lil Wayne", "T.I.",
    "Ludacris", "Nelly", "Usher", "Chris Brown", "Jason Derulo", "Bruno Mars", "The Weeknd",
]


def merge_and_sync_15000() -> None:
    """
    Merges existing 9,975 songs (`crawler/data/songs.json`) with the 4 new
    130..180 BPM files (`/tmp/fast130_180_{band,kpop,rock,hiphop}.json`),
    saves to `crawler/data/songs.json` and `web/public/data/songs.json`,
    and bulk-upserts all rows to Supabase `public.songs`.
    """
    existing_path = BASE_DIR / "data" / "songs.json"
    merged: List[Dict[str, Any]] = []
    seen_keys = set()
    seen_tids = set()

    if existing_path.exists():
        with open(existing_path, "r", encoding="utf-8") as f:
            for s in json.load(f):
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

    print(f"Loaded {len(merged)} existing verified tracks.")

    new_files = {
        "band": Path("/tmp/fast130_180_band.json"),
        "kpop": Path("/tmp/fast130_180_kpop.json"),
        "rock": Path("/tmp/fast130_180_rock.json"),
        "hiphop": Path("/tmp/fast130_180_hiphop.json"),
    }

    for cat, fp in new_files.items():
        if not fp.exists():
            print(f"[WARN] {fp} does not exist yet.")
            continue
        try:
            with open(fp, "r", encoding="utf-8") as f:
                items = json.load(f)
            added = 0
            for s in items:
                nk = s.get("normalized_key")
                tid = s.get("itunes_track_id")
                rb = s.get("running_bpm") or 0
                if not (130 <= rb <= 180):
                    continue
                if not nk or nk in seen_keys:
                    continue
                if tid and tid in seen_tids:
                    continue
                seen_keys.add(nk)
                if tid:
                    seen_tids.add(tid)
                merged.append(s)
                added += 1
            print(f"Merged +{added} new 130..180 BPM tracks for [{cat}]")
        except Exception as e:
            print(f"[WARN] Error reading {fp}: {e}")

    out1 = BASE_DIR / "data" / "songs.json"
    out2 = BASE_DIR.parent / "web" / "public" / "data" / "songs.json"
    with open(out1, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    with open(out2, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    in_range = sum(1 for s in merged if 130 <= (s.get("running_bpm") or 0) <= 180)
    print(f"Saved {len(merged)} total songs ({in_range} in 130..180 BPM) to {out1} and {out2}")

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
    merge_and_sync_15000()
