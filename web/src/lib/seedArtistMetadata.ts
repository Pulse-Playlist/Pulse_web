import { GenreTag } from '@/types/song';

export interface SeedArtistMeta {
  name: string;
  nameKo: string;
  nameEn: string;
  genre: GenreTag;
  coverUrl: string;
  trackCount: number;
  bpm130_180Count: number;
}

export const SEED_ARTIST_METADATA: Record<string, SeedArtistMeta> = {
  "넥스트": {
    "name": "넥스트",
    "nameKo": "넥스트",
    "nameEn": "N.EX.T",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/v4/76/cf/7e/76cf7ee0-458a-3a52-7549-65b010402b1b/image.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 5
  },
  "Daft Punk": {
    "name": "Daft Punk",
    "nameKo": "다프트 펑크",
    "nameEn": "Daft Punk",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5d/7c/8e/5d7c8e84-9e75-0e06-8876-f98c13df1694/dj.mpyxowas.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 2
  },
  "BLACKPINK": {
    "name": "BLACKPINK",
    "nameKo": "블랙핑크",
    "nameEn": "BLACKPINK",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/0b/d6/6e/0bd66efc-caba-41e0-7d84-c92e925b1d94/as_if_its_your_last.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 8
  },
  "Coldplay": {
    "name": "Coldplay",
    "nameKo": "콜드플레이",
    "nameEn": "Coldplay",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8d/27/16/8d2716ea-4e3a-466f-5aa7-cf750e762bb6/5099941647356_1500x1500_300dpi.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 10
  },
  "ASH ISLAND": {
    "name": "ASH ISLAND",
    "nameKo": "애쉬 아일랜드",
    "nameEn": "ASH ISLAND",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f8/c8/bc/f8c8bcc5-1d94-e46a-bbfb-fd233ce452bf/888272116885_Cover.jpg/600x600bb.jpg",
    "trackCount": 17,
    "bpm130_180Count": 7
  },
  "Marshmello": {
    "name": "Marshmello",
    "nameKo": "마시멜로",
    "nameEn": "Selena Gomez & Marshmello",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/45/4a/86/454a86a1-863b-6f23-66d0-9ea61840cbd5/18UMGIM23133.rgb.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 11
  },
  "에이핑크": {
    "name": "에이핑크",
    "nameKo": "에이핑크",
    "nameEn": "Apink",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music7/v4/04/a9/08/04a90808-cdaa-9a61-5beb-14dc6e065da0/cover-.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 8
  },
  "권은비": {
    "name": "권은비",
    "nameKo": "권은비",
    "nameEn": "KWON EUNBI",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f4/35/c5/f435c51d-174f-29c3-caf8-426c3e713722/cover_KM0017986_1.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 7
  },
  "The Killers": {
    "name": "The Killers",
    "nameKo": "The Killers",
    "nameEn": "The Killers",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/c9/7d/d7/c97dd7e9-fb41-a8a7-8841-fc95e2ba3091/06UMGIM57329.rgb.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 19
  },
  "엑스디너리 히어로즈": {
    "name": "엑스디너리 히어로즈",
    "nameKo": "엑스디너리 히어로즈",
    "nameEn": "Xdinary Heroes",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fe/c6/8c/fec68cc8-c747-2932-1e7c-079f7c741add/8809928956381.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 14
  },
  "FT아일랜드": {
    "name": "FT아일랜드",
    "nameKo": "FT아일랜드",
    "nameEn": "FTISLAND",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c7/b6/7b/c7b67bf4-3024-5eb9-ef4a-3e761a7ed7e1/8804775081422_cover.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 18
  },
  "신해철": {
    "name": "신해철",
    "nameKo": "신해철",
    "nameEn": "Shin Hae Chul",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/a0/49/4f/a0494f19-c078-5d30-02ba-2e82e7997b78/3000.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 5
  },
  "Stray Kids": {
    "name": "Stray Kids",
    "nameKo": "스트레이 키즈",
    "nameEn": "Stray Kids",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/54/5f/6d/545f6deb-89de-9f08-4ad0-b8d4136a0911/192641947902_Cover.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 9
  },
  "보이넥스트도어": {
    "name": "보이넥스트도어",
    "nameKo": "보이넥스트도어",
    "nameEn": "BOYNEXTDOOR",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/18/e9/7c/18e97c93-27e9-59f0-7ed5-b2834fc435f4/823375401643_Cover.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 18
  },
  "Dom Dolla": {
    "name": "Dom Dolla",
    "nameKo": "Dom Dolla",
    "nameEn": "Dom Dolla",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/84/5e/33/845e3390-0d0c-ce76-b1b1-76f17126df60/196871470261.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 8
  },
  "정국": {
    "name": "정국",
    "nameKo": "정국",
    "nameEn": "Jung Kook",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/5d/16/7f/5d167f01-cb35-c147-ae34-a3e32144cd0b/196922549434_Cover.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 3
  },
  "Official HIGE DANdism": {
    "name": "Official HIGE DANdism",
    "nameKo": "오피셜히게단디즘",
    "nameEn": "Official HIGE DANdism",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/9b/da/69/9bda6999-3a29-3634-c1db-d35cd95ab5c2/PCCA_06057_A.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 14
  },
  "브로큰 발렌타인": {
    "name": "브로큰 발렌타인",
    "nameKo": "브로큰 발렌타인",
    "nameEn": "Broken Valentine",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/fc/88/d6/fc88d669-5b15-7fc2-31df-fa09e74067fc/8809629045681.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 13
  },
  "wave to earth": {
    "name": "wave to earth",
    "nameKo": "웨이브투어스",
    "nameEn": "wave to earth",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/71/b6/82/71b6820b-97a2-9968-c5a8-b659103030b1/5054197659843.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 6
  },
  "이영지": {
    "name": "이영지",
    "nameKo": "이영지",
    "nameEn": "Lee Young Ji",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5a/89/e5/5a89e53e-ed04-7287-028a-dac871fc7009/8804775305474.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 6
  },
  "pH-1": {
    "name": "pH-1",
    "nameKo": "피에이치원",
    "nameEn": "pH-1",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/de/b8/ea/deb8eaf6-0e44-8286-37a4-a7ffe60e6d7e/8809704411707_Cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 10
  },
  "바비킴": {
    "name": "바비킴",
    "nameKo": "바비킴",
    "nameEn": "Bobby Kim",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/53/99/0f/53990fa2-b136-1a22-d029-6050f10dac5f/888618218631_cover.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 7
  },
  "티아라": {
    "name": "티아라",
    "nameKo": "티아라",
    "nameEn": "T-ARA",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/dd/97/42/dd974210-751f-7d3c-8db2-324ff16c9e55/cover_KM0000400_1.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 11
  },
  "오마이걸": {
    "name": "오마이걸",
    "nameKo": "오마이걸",
    "nameEn": "OH MY GIRL",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3f/ba/04/3fba04f9-8286-d9c9-5f3d-43c6fe9afad4/cover_KM0008813_1.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 11
  },
  "Yorushika": {
    "name": "Yorushika",
    "nameKo": "요루시카",
    "nameEn": "Yorushika",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4b/1b/25/4b1b2572-0dc9-7c83-1e56-ce3354ead351/26UM1IM20044.rgb.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 5
  },
  "ASIAN KUNG-FU GENERATION": {
    "name": "ASIAN KUNG-FU GENERATION",
    "nameKo": "아시안 쿵푸 제너레이션",
    "nameEn": "ASIAN KUNG-FU GENERATION",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/9b/90/54/9b90547e-6743-bd7b-4d17-c6a485c0124e/4560427295664.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 11
  },
  "Shawn Mendes": {
    "name": "Shawn Mendes",
    "nameKo": "Shawn Mendes",
    "nameEn": "Shawn Mendes",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/4e/a4/4e/4ea44e9f-083a-becc-bca3-c03e1e8483b2/21UM1IM01044.rgb.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 6
  },
  "김사랑": {
    "name": "김사랑",
    "nameKo": "김사랑",
    "nameEn": "Kim Sarang",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/97/ea/20/97ea20ff-43b8-0060-d5f5-da764e9f6c44/8809394380017.jpg/600x600bb.jpg",
    "trackCount": 52,
    "bpm130_180Count": 33
  },
  "Dimension": {
    "name": "Dimension",
    "nameKo": "DIMENSION",
    "nameEn": "DIMENSION",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/f2/ed/80/f2ed80f1-940a-4f27-2b68-512a32bcf8d6/ZACL-9028.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 10
  },
  "자우림": {
    "name": "자우림",
    "nameKo": "자우림",
    "nameEn": "Jaurim",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/52/f1/2d/52f12d80-8e05-b44d-9d2d-058441c1f9e4/The_Wonder_Land.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 11
  },
  "개코": {
    "name": "개코",
    "nameKo": "개코",
    "nameEn": "Gaeko",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f5/92/a3f59251-5a4b-74c5-1740-a39b5e206e27/888272088182_Cover.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 5
  },
  "The Weeknd": {
    "name": "The Weeknd",
    "nameKo": "위켄드",
    "nameEn": "The Weeknd",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2f/22/a9/2f22a9a6-5af1-5846-a44e-ba016724ed69/21UM1IM58860.rgb.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 7
  },
  "Nas": {
    "name": "Nas",
    "nameKo": "Nas",
    "nameEn": "Nas",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b9/eb/cc/b9ebccbc-5ba4-2cdb-5332-b065739abd9a/886444567619.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 2
  },
  "Oasis": {
    "name": "Oasis",
    "nameKo": "Oasis",
    "nameEn": "Oasis",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ef/26/d8/ef26d846-247b-7062-61db-2c2b16e5d6dc/886445701685.jpg/600x600bb.jpg",
    "trackCount": 17,
    "bpm130_180Count": 4
  },
  "Three Days Grace": {
    "name": "Three Days Grace",
    "nameKo": "Three Days Grace",
    "nameEn": "Three Days Grace",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/27/e8/24/27e82486-af65-4634-1b8b-d5f5a21b1844/886445329049.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 6
  },
  "하이키": {
    "name": "하이키",
    "nameKo": "하이키",
    "nameEn": "H1-KEY",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f4/66/81/f46681ab-3f2c-9af0-8496-0409631933cf/888272177657_Cover.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 3
  },
  "Anderson .Paak": {
    "name": "Anderson .Paak",
    "nameKo": "Anderson .Paak",
    "nameEn": "Anderson .Paak",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2b/81/23/2b8123af-f191-32ea-e856-fc4ad33599b6/199316732108_cover.jpg/600x600bb.jpg",
    "trackCount": 4,
    "bpm130_180Count": 0
  },
  "아이즈원": {
    "name": "아이즈원",
    "nameKo": "아이즈원",
    "nameEn": "IZ*ONE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ac/7a/50/ac7a5028-425b-af8e-535b-f59dd4bedba0/8809603546906_Cover.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 11
  },
  "시나위": {
    "name": "시나위",
    "nameKo": "시나위",
    "nameEn": "Sinawe",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/34/6d/d1/346dd1b1-36cf-00d1-b59a-f862da279280/191953030562.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 11
  },
  "Ed Sheeran": {
    "name": "Ed Sheeran",
    "nameKo": "에드 시런",
    "nameEn": "Ed Sheeran",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/53/4a/01/534a01d1-d7c6-db04-7e00-b78cd4e50bfc/5054197180880.jpg/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 3
  },
  "OneRepublic": {
    "name": "OneRepublic",
    "nameKo": "원리퍼블릭",
    "nameEn": "OneRepublic",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/db/90/cd/db90cde8-1ebb-9439-9c36-10c6f0632cf4/18UMGIM18983.rgb.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 16
  },
  "Sub Focus": {
    "name": "Sub Focus",
    "nameKo": "서브 포커스",
    "nameEn": "Sub Focus & bbyclose",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/db/65/e2db6512-6fdd-99be-39bd-6bc9552c4110/25UMGIM02295.rgb.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 31
  },
  "Bon Jovi": {
    "name": "Bon Jovi",
    "nameKo": "Bon Jovi",
    "nameEn": "Bon Jovi",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5f/a8/1e/5fa81eae-6514-1d56-b352-8e3b243c65ec/24UMGIM99102.rgb.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 8
  },
  "50 Cent": {
    "name": "50 Cent",
    "nameKo": "50 Cent",
    "nameEn": "50 Cent",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8d/f8/9e/8df89e37-d1b7-9395-ca42-f83d18af8791/06UMGIM13448.rgb.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 3
  },
  "라이즈": {
    "name": "라이즈",
    "nameKo": "라이즈",
    "nameEn": "RIIZE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/dd/35/26dd3596-341b-c40c-8a3d-7a2ab9e166aa/888735947346.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 11
  },
  "인피니트": {
    "name": "인피니트",
    "nameKo": "인피니트",
    "nameEn": "INFINITE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/6a/39/12/6a3912ef-e65c-10fe-0ba9-1c871c68bf32/7._1_Paradise_cover_3000x3000.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 7
  },
  "빅뱅": {
    "name": "빅뱅",
    "nameKo": "빅뱅",
    "nameEn": "BIGBANG",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/50/41/b3/5041b3da-d6b7-3fe4-fa4b-433a00702477/D_digital_single_cover_final.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 11
  },
  "더 로즈": {
    "name": "더 로즈",
    "nameKo": "더 로즈",
    "nameEn": "The Rose",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ae/9d/9a/ae9d9a12-5ef4-107e-a53c-450f61eb3d4a/196922318313.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 9
  },
  "프리스타일": {
    "name": "프리스타일",
    "nameKo": "프리스타일",
    "nameEn": "Free Style",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f8/95/94/f8959497-5c80-ca81-10b3-c3fce3fb8d73/191953106649.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 0
  },
  "하이라이트": {
    "name": "하이라이트",
    "nameKo": "하이라이트",
    "nameEn": "HIGHLIGHT",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cb/2d/df/cb2ddf3b-afc7-b588-53ca-f7763bc3f5ea/8804775161605_Cover.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 7
  },
  "롤러코스터": {
    "name": "롤러코스터",
    "nameKo": "롤러코스터",
    "nameEn": "Roller Coaster",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/75/2a/93/752a9379-e4c3-7fdc-66ff-49a43c983953/Roller_Coaster.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 7
  },
  "Papa Roach": {
    "name": "Papa Roach",
    "nameKo": "Papa Roach",
    "nameEn": "Papa Roach",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c3/17/70/c3177037-18e6-10c4-6fe3-6575352e8a03/21UM1IM58469.rgb.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 5
  },
  "도끼": {
    "name": "도끼",
    "nameKo": "도끼",
    "nameEn": "Dok2",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/73/c5/5e/73c55e01-609d-acce-1eee-5e8e5080003f/8809534465161_Cover.jpg/600x600bb.jpg",
    "trackCount": 5,
    "bpm130_180Count": 3
  },
  "선미": {
    "name": "선미",
    "nameKo": "선미",
    "nameEn": "SUNMI",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ec/b8/28/ecb82854-ca50-5b3f-977a-7667afbd94e0/799975599892_Cover.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 13
  },
  "Wilkinson": {
    "name": "Wilkinson",
    "nameKo": "윌킨슨",
    "nameEn": "Wilkinson",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/80/0e/7f/800e7f02-c663-80e8-7745-67da1bdd5067/00602537521302.rgb.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 23
  },
  "Chappell Roan": {
    "name": "Chappell Roan",
    "nameKo": "Chappell Roan",
    "nameEn": "Chappell Roan",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/29/a7/c4/29a7c478-351d-25eb-a116-3e68118cdab8/24UMGIM31246.rgb.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 4
  },
  "리센느": {
    "name": "리센느",
    "nameKo": "리센느",
    "nameEn": "RESCENE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e3/4e/e4/e34ee4d9-47a3-8b51-b6cc-4d991508f0b5/cover_KM0023041_1.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 5
  },
  "새소년": {
    "name": "새소년",
    "nameKo": "새소년",
    "nameEn": "SE SO NEON",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f1/a9/41/f1a941bb-130d-9f75-be43-5f73389feb6a/8809380636494.jpg/600x600bb.jpg",
    "trackCount": 21,
    "bpm130_180Count": 3
  },
  "MAN WITH A MISSION": {
    "name": "MAN WITH A MISSION",
    "nameKo": "MAN WITH A MISSION",
    "nameEn": "MAN WITH A MISSION",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/22/79/c6/2279c6ea-54f0-a966-d956-c7b545dbaa63/jacket_SRXX03497B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 22
  },
  "Blur": {
    "name": "Blur",
    "nameKo": "Blur",
    "nameEn": "Blur",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/71/66/8a71664b-3baa-537b-e008-b32d86da27bc/5099997227755.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 4
  },
  "김경호": {
    "name": "김경호",
    "nameKo": "김경호",
    "nameEn": "Kim Kyung Ho",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/09/95/b5/0995b513-562e-0eba-4004-bb6ae7a04de0/888618219324_cover.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 7
  },
  "부활": {
    "name": "부활",
    "nameKo": "부활",
    "nameEn": "Boohwal",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/71/68/eb/7168eb25-97d1-252b-98ac-573767678f1d/8809114101380_Cover.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 3
  },
  "보수동쿨러": {
    "name": "보수동쿨러",
    "nameKo": "보수동쿨러",
    "nameEn": "Bosudongcooler",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/2e/1a/af/2e1aaf8a-b681-9d33-87b4-755ffee428d0/yeah_I_don_t_want_it_cover.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 2
  },
  "Gracie Abrams": {
    "name": "Gracie Abrams",
    "nameKo": "Gracie Abrams",
    "nameEn": "Gracie Abrams",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/52/9a/a7/529aa76f-5d60-cd81-9eb0-0eb521de861d/24UMGIM43968.rgb.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 7
  },
  "Doja Cat": {
    "name": "Doja Cat",
    "nameKo": "도자 캣",
    "nameEn": "Doja Cat",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a6/91/da/a691dac7-4cb7-82f5-0eda-e37b96f63f55/075679610720.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 5
  },
  "Dua Lipa": {
    "name": "Dua Lipa",
    "nameKo": "두아 리파",
    "nameEn": "Dua Lipa",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/6b/68/e3/6b68e3bc-5c56-d555-e8f4-a4ca32e76d95/5059460345065.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 2
  },
  "지드래곤": {
    "name": "지드래곤",
    "nameKo": "지드래곤",
    "nameEn": "G-DRAGON",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/6f/ea/f0/6feaf05d-1c45-a7ac-479e-f294d0ca4b70/8806197910472.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 13
  },
  "브로콜리너마저": {
    "name": "브로콜리너마저",
    "nameKo": "브로콜리너마저",
    "nameEn": "Broccoli, you too?",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cd/31/a3/cd31a3b7-b4a3-40ae-bc55-7db2aa3ac496/5056005044131.jpg/600x600bb.jpg",
    "trackCount": 38,
    "bpm130_180Count": 10
  },
  "Olivia Rodrigo": {
    "name": "Olivia Rodrigo",
    "nameKo": "올리비아 로드리고",
    "nameEn": "Olivia Rodrigo",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/76/46/48/76464884-0e9c-1951-a3f6-ce02f74c2b19/21UMGIM26093.rgb.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 9
  },
  "배치기": {
    "name": "배치기",
    "nameKo": "배치기",
    "nameEn": "Baechigi",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/7b/03/ed/7b03ed7e-0fe4-6fb3-136c-7301a242171f/192994002464.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 1
  },
  "SPYAIR": {
    "name": "SPYAIR",
    "nameKo": "스파이웨어",
    "nameEn": "SPYAIR",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/a9/51/e0/a951e0c2-c80c-4980-27d1-29f9650c4c4e/jacket_AICL02289B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 52,
    "bpm130_180Count": 23
  },
  "Katy Perry": {
    "name": "Katy Perry",
    "nameKo": "Katy Perry",
    "nameEn": "Katy Perry",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/9c/4f/b7/9c4fb70a-edd4-41a2-ef97-cebb6900b0ef/13UABIM57846.rgb.jpg/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 3
  },
  "호미들": {
    "name": "호미들",
    "nameKo": "호미들",
    "nameEn": "Homies",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/40/3d/b0/403db000-aa26-b055-c154-84ed0d365ddc/cover_KM0015311_1.jpg/600x600bb.jpg",
    "trackCount": 6,
    "bpm130_180Count": 6
  },
  "백예린": {
    "name": "백예린",
    "nameKo": "백예린",
    "nameEn": "Yerin Baek",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4b/98/c2/4b98c269-4ca3-9fe6-e510-3dc70fca0968/8809634389206.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 0
  },
  "Michael Jackson": {
    "name": "Michael Jackson",
    "nameKo": "Michael Jackson",
    "nameEn": "Michael Jackson",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/73/8c/e1/738ce1db-60bd-eb25-0059-18778c1ca9b3/196589412409.jpg/600x600bb.jpg",
    "trackCount": 10,
    "bpm130_180Count": 1
  },
  "윤미래": {
    "name": "윤미래",
    "nameKo": "윤미래",
    "nameEn": "Yoon Mirae",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/01/00/05/01000595-d059-9656-64f9-e7fd8892f649/cover-_with_JK_DS.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 6
  },
  "체리필터": {
    "name": "체리필터",
    "nameKo": "체리필터",
    "nameEn": "Cherry Filter",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music1/v4/11/54/42/11544279-253d-b943-3eb9-99ab690625fa/4.jpg/600x600bb.jpg",
    "trackCount": 47,
    "bpm130_180Count": 27
  },
  "에픽하이": {
    "name": "에픽하이",
    "nameKo": "에픽하이",
    "nameEn": "Epik High",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d3/70/0d/d3700dea-ad51-4863-afaf-9fe8bc016010/08809231381580_Cover.jpg/600x600bb.jpg",
    "trackCount": 44,
    "bpm130_180Count": 11
  },
  "Tate McRae": {
    "name": "Tate McRae",
    "nameKo": "Tate McRae",
    "nameEn": "Tate McRae",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2b/96/2b/2b962b77-3a04-5650-aefd-37ecfce04b03/196874840146.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 6
  },
  "Imagine Dragons": {
    "name": "Imagine Dragons",
    "nameKo": "이매진 드래곤스",
    "nameEn": "Imagine Dragons",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 3
  },
  "럼블피쉬": {
    "name": "럼블피쉬",
    "nameKo": "럼블피쉬",
    "nameEn": "Rumble Fish",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a2/94/e9/a294e975-d923-6059-d9d9-eb0d01352169/dj.ufcoujut.jpg/600x600bb.jpg",
    "trackCount": 8,
    "bpm130_180Count": 6
  },
  "Queen": {
    "name": "Queen",
    "nameKo": "Queen",
    "nameEn": "Queen",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a6/88/83/a6888328-4836-cdf1-0f10-05fb35207ccf/602547040954.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 4
  },
  "프로미스나인": {
    "name": "프로미스나인",
    "nameKo": "프로미스나인",
    "nameEn": "fromis_9",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c9/05/b0/c905b007-01a2-3f53-32e3-f30e5593ff24/198704060052_Cover.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 13
  },
  "Madeon": {
    "name": "Madeon",
    "nameKo": "마데온",
    "nameEn": "ISOxo & Madeon",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/d3/86/9d/d3869da2-558f-fa0f-3efe-eb58548867d0/612891280661.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 10
  },
  "갤럭시 익스프레스": {
    "name": "갤럭시 익스프레스",
    "nameKo": "갤럭시 익스프레스",
    "nameEn": "Galaxy Express",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/fb/88/1f/fb881f14-c120-497c-0784-2604467c9a45/wild.jpg/600x600bb.jpg",
    "trackCount": 60,
    "bpm130_180Count": 41
  },
  "엔믹스": {
    "name": "엔믹스",
    "nameKo": "엔믹스",
    "nameEn": "NMIXX",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d9/65/fc/d965fc59-8a4c-60f8-aada-227e5d627be4/8809928956848.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 10
  },
  "Kylie Minogue": {
    "name": "Kylie Minogue",
    "nameKo": "Kylie Minogue",
    "nameEn": "Kylie Minogue",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/59/be/23/59be23bc-0c30-bda9-55d2-a72bb0d199b6/4050538635416.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 0
  },
  "몬스타엑스": {
    "name": "몬스타엑스",
    "nameKo": "몬스타엑스",
    "nameEn": "MONSTA X",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/08/72/33/087233a6-84df-8c24-564b-198240a8dc01/cover_KM0025069_1.jpg/600x600bb.jpg",
    "trackCount": 44,
    "bpm130_180Count": 9
  },
  "검정치마": {
    "name": "검정치마",
    "nameKo": "검정치마",
    "nameEn": "The Black Skirts",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/ce/5c/bece5cff-2caf-6d8a-9c21-3035537d2a4d/Album_cover_1400X1400.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 1
  },
  "드림캐쳐": {
    "name": "드림캐쳐",
    "nameKo": "드림캐쳐",
    "nameEn": "Dreamcatcher",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ca/e6/73/cae6736b-4ae8-e318-73ca-9d7c3e441952/8804775281440.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 9
  },
  "Rudimental": {
    "name": "Rudimental",
    "nameKo": "Rudimental",
    "nameEn": "Rudimental",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b8/64/c0/b864c06f-e1e9-640d-f040-3e3a892de5ac/825646962679.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 19
  },
  "AC/DC": {
    "name": "AC/DC",
    "nameKo": "AC/DC",
    "nameEn": "AC/DC",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b9/c8/ef/b9c8ef42-bbc9-64df-11f8-717571f6730f/886443673458.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 9
  },
  "루시": {
    "name": "루시",
    "nameKo": "루시",
    "nameEn": "LUCY",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f4/8d/2f/f48d2f50-2079-8260-2953-2a3b66bc4d87/8804775157707.jpg/600x600bb.jpg",
    "trackCount": 53,
    "bpm130_180Count": 25
  },
  "더보이즈": {
    "name": "더보이즈",
    "nameKo": "더보이즈",
    "nameEn": "THE BOYZ",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/91/7c/b3/917cb3ec-64d3-f14b-4af0-d6ecf249104b/8809784748748.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 12
  },
  "엔시티 위시": {
    "name": "엔시티 위시",
    "nameKo": "엔시티 위시",
    "nameEn": "NCT WISH",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/51/d4/68/51d46878-3a30-2e45-894d-99a9f6418464/iScreaM_Vol.34_-_Steady_Remix.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 8
  },
  "U2": {
    "name": "U2",
    "nameKo": "U2",
    "nameEn": "U2",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/05/78/89/0578893b-9dac-d88a-ee9b-3c42ac40b6a0/17UMGIM95495.rgb.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 8
  },
  "A$AP Rocky": {
    "name": "A$AP Rocky",
    "nameKo": "A$AP Rocky",
    "nameEn": "A$AP Rocky",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/58/99/f1/5899f1b4-674b-3033-9e12-14348a9de396/196873986029.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 13
  },
  "SURL": {
    "name": "SURL",
    "nameKo": "설",
    "nameEn": "SURL",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f6/97/31/f6973105-9d7c-b353-a40e-200307af2113/887928017996.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 11
  },
  "원위": {
    "name": "원위",
    "nameKo": "원위",
    "nameEn": "ONEWE",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/ff/4d/45/ff4d4516-86eb-a0b0-14ad-a9dbfbe9a026/cover_-_DS.jpg/600x600bb.jpg",
    "trackCount": 59,
    "bpm130_180Count": 25
  },
  "ELLEGARDEN": {
    "name": "ELLEGARDEN",
    "nameKo": "엘르가든",
    "nameEn": "ELLEGARDEN",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ad/79/4c/ad794c1f-3b0e-4afc-7c8d-d12b79addbf3/mzm.mvmlfdmr.jpg/600x600bb.jpg",
    "trackCount": 70,
    "bpm130_180Count": 33
  },
  "DAY6": {
    "name": "DAY6",
    "nameKo": "데이식스",
    "nameEn": "DAY6",
    "genre": "band",
    "coverUrl": "https://cdnimg.melon.co.kr/cm2/album/images/114/44/397/11444397_20240318115810_500.jpg/melon/resize/120/quality/80/optimize",
    "trackCount": 87,
    "bpm130_180Count": 33
  },
  "DNCE": {
    "name": "DNCE",
    "nameKo": "DNCE",
    "nameEn": "DNCE",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/19/23/33/1923334d-21e1-74b7-a7e6-42cbfd61e8f9/19UMGIM42484.rgb.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 1
  },
  "아이콘": {
    "name": "아이콘",
    "nameKo": "아이콘",
    "nameEn": "iKON",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/c4/7d/c6/c47dc6f6-3b5d-13b5-b187-af43f2293fcc/iKON.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 7
  },
  "서태지와 아이들": {
    "name": "서태지와 아이들",
    "nameKo": "서태지와 아이들",
    "nameEn": "서태지와 아이들",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/e0/e7/03/e0e703de-f6a2-ab81-2613-b1eb37d4c4bf/8809704420655_Cover.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 1
  },
  "Kendrick Lamar": {
    "name": "Kendrick Lamar",
    "nameKo": "Kendrick Lamar",
    "nameEn": "Kendrick Lamar",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/77/33/13/773313da-f23e-b15e-e110-886f1d8ec0ec/17UM1IM55473.rgb.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 8
  },
  "Bring Me The Horizon": {
    "name": "Bring Me The Horizon",
    "nameKo": "Bring Me The Horizon",
    "nameEn": "Bring Me The Horizon",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/af/60/53/af605380-6bba-b811-6bb2-26ea2606a86c/196874082003.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 11
  },
  "태양": {
    "name": "태양",
    "nameKo": "태양",
    "nameEn": "TAEYANG",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3d/b9/56/3db95640-a9ba-e0df-0bf1-7379597414c8/edit_Taeyang_-_Solar_International.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 5
  },
  "Kanine": {
    "name": "Kanine",
    "nameKo": "Kanine",
    "nameEn": "Kanine",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5e/ca/74/5eca74a4-b7b8-11d4-7867-19cfb0565512/5055199577425.png/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 35
  },
  "전기뱀장어": {
    "name": "전기뱀장어",
    "nameKo": "전기뱀장어",
    "nameEn": "THE ELECTRICEELS",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/c3/5b/0d/c35b0d51-c56f-1a47-6d14-60ddaa719b18/8809764960931.jpg/600x600bb.jpg",
    "trackCount": 17,
    "bpm130_180Count": 8
  },
  "IVE": {
    "name": "IVE",
    "nameKo": "아이브",
    "nameEn": "IVE",
    "genre": "kpop",
    "coverUrl": "https://image.bugsm.co.kr/album/images/500/40849/4084947.jpg?version=20260825004924",
    "trackCount": 40,
    "bpm130_180Count": 15
  },
  "식케이": {
    "name": "식케이",
    "nameKo": "식케이",
    "nameEn": "Sik-K",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/14/18/42/1418424b-6f42-89e7-d504-82383bff5a4b/cover_KM0021930_1.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 12
  },
  "back number": {
    "name": "back number",
    "nameKo": "백 넘버",
    "nameEn": "back number",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/63/57/01/63570172-7bdb-c12b-188e-d064ed3952ef/23UM1IM63739.rgb.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 25
  },
  "몽니": {
    "name": "몽니",
    "nameKo": "몽니",
    "nameEn": "Monni",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/53/91/12/53911203-59fb-a581-1683-448cd2f20d55/8809887742919.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 7
  },
  "Beyoncé": {
    "name": "Beyoncé",
    "nameKo": "Beyoncé",
    "nameEn": "Beyoncé",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features/66/c0/5e/dj.clrmnzsy.jpg/600x600bb.jpg",
    "trackCount": 6,
    "bpm130_180Count": 0
  },
  "Muse": {
    "name": "Muse",
    "nameKo": "Muse",
    "nameEn": "Muse",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/4a/73/ab/4a73abdf-1d55-b3fe-484d-e023a507428e/5054197904233.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 9
  },
  "Britney Spears": {
    "name": "Britney Spears",
    "nameKo": "Britney Spears",
    "nameEn": "Britney Spears",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b5/a1/e7/b5a1e76d-e645-48a1-5f38-ec189e879c16/886444323338.jpg/600x600bb.jpg",
    "trackCount": 8,
    "bpm130_180Count": 2
  },
  "더 콰이엇": {
    "name": "더 콰이엇",
    "nameKo": "더 콰이엇",
    "nameEn": "The Quiett",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0d/7a/a2/0d7aa233-63f8-ffd9-9471-3a6425aa8323/888272180596_Cover.jpg/600x600bb.jpg",
    "trackCount": 3,
    "bpm130_180Count": 0
  },
  "Netsky": {
    "name": "Netsky",
    "nameKo": "Netsky",
    "nameEn": "Netsky",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/02/5e/9a/025e9a9d-928d-e69b-99dd-e31a7c2a747d/cover.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 24
  },
  "ATEEZ": {
    "name": "ATEEZ",
    "nameKo": "에이티즈",
    "nameEn": "ATEEZ",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c3/c5/84/c3c5844d-602e-e7b7-1efa-2b6bdddc9141/196874851814.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 14
  },
  "Baby Keem": {
    "name": "Baby Keem",
    "nameKo": "Baby Keem",
    "nameEn": "Baby Keem",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/84/5d/04/845d04ed-3f2f-cf03-1821-04666f6a40f6/886449235551.jpg/600x600bb.jpg",
    "trackCount": 5,
    "bpm130_180Count": 2
  },
  "야다": {
    "name": "야다",
    "nameKo": "야다",
    "nameEn": "Yada",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b8/1b/37/b81b37e3-c82a-6f73-c497-57187f50a4e6/8800303145741.jpg/600x600bb.jpg",
    "trackCount": 48,
    "bpm130_180Count": 9
  },
  "잔나비": {
    "name": "잔나비",
    "nameKo": "잔나비",
    "nameEn": "JANNABI",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/30/d9/0b/30d90b00-84b7-4e9b-1452-823049e36d09/COVER-_JANNABI.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 7
  },
  "LE SSERAFIM": {
    "name": "LE SSERAFIM",
    "nameKo": "르세라핌",
    "nameEn": "LE SSERAFIM",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cb/5d/2c/cb5d2c9e-74e1-a562-6c40-04479aa0afdf/198704375187_Cover.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 11
  },
  "솔루션스": {
    "name": "솔루션스",
    "nameKo": "솔루션스",
    "nameEn": "THE SOLUTIONS",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/35/7a/35/357a35dc-988b-0f38-8623-8a7a90717b1a/191953012995.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 7
  },
  "Travis Scott": {
    "name": "Travis Scott",
    "nameKo": "Travis Scott",
    "nameEn": "Travis Scott",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/50/f7/a3/50f7a39d-3bd5-28e9-0264-532f08b5b810/886446074726.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 17
  },
  "클래지콰이": {
    "name": "클래지콰이",
    "nameKo": "클래지콰이",
    "nameEn": "Clazziquai",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fd/35/ab/fd35ab08-8cf2-1243-44c4-ef3acc7c7582/cover_KM0021021_1.jpg/600x600bb.jpg",
    "trackCount": 44,
    "bpm130_180Count": 5
  },
  "최예나": {
    "name": "최예나",
    "nameKo": "최예나",
    "nameEn": "YENA",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/34/6b/dc/346bdc50-b35d-955d-9531-993682c294e9/888272140439_Cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 19
  },
  "기리보이": {
    "name": "기리보이",
    "nameKo": "기리보이",
    "nameEn": "GIRIBOY",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/c1/e8/a6/c1e8a6ac-7089-122d-9632-449ec01e83ed/COVER-_DS.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 6
  },
  "한로로": {
    "name": "한로로",
    "nameKo": "한로로",
    "nameEn": "HANRORO",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c8/a4/c6/c8a4c64f-89b3-9ef2-473f-4ad423a03c5b/887928030421.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 3
  },
  "DJ Snake": {
    "name": "DJ Snake",
    "nameKo": "DJ Snake",
    "nameEn": "DJ Snake",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b9/80/28/b98028a2-1567-1247-6813-d167ef8c99dd/653738277321_Cover.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 3
  },
  "호피폴라": {
    "name": "호피폴라",
    "nameKo": "호피폴라",
    "nameEn": "Hoppipolla",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d3/b6/2d/d3b62daa-b44a-7cd3-0d06-0ba62ef69745/191953076195.jpg/600x600bb.jpg",
    "trackCount": 15,
    "bpm130_180Count": 3
  },
  "나상현씨밴드": {
    "name": "나상현씨밴드",
    "nameKo": "나상현씨밴드",
    "nameEn": "Band Nah",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/14/80/fd/1480fd40-4cd8-69d5-6d73-aea35f4b009d/191231_BandNah_1_3000.jpg/600x600bb.jpg",
    "trackCount": 52,
    "bpm130_180Count": 15
  },
  "카라": {
    "name": "카라",
    "nameKo": "카라",
    "nameEn": "KARA",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ce/f0/4a/cef04aa6-2ead-088a-2ca1-f5c81a503dfb/cover-KARA_Pretty_Girl_2nd_Mini_Album.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 16
  },
  "tuki.": {
    "name": "tuki.",
    "nameKo": "츠키",
    "nameEn": "tuki.",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/0a/44/96/0a4496be-6d65-0152-795b-b75210463315/4582649101585.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 9
  },
  "Lil Uzi Vert": {
    "name": "Lil Uzi Vert",
    "nameKo": "Lil Uzi Vert",
    "nameEn": "Lil Uzi Vert",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/af/12/47/af1247c9-a09e-bdb3-e8a0-7c536ca95606/075679884787.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 26
  },
  "라쿠나": {
    "name": "라쿠나",
    "nameKo": "라쿠나",
    "nameEn": "Lacuna",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/16/b0/5c/16b05c17-e18a-4d8a-2988-f46493da143c/191953210728.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 7
  },
  "Bruno Mars": {
    "name": "Bruno Mars",
    "nameKo": "브루노 마스",
    "nameEn": "Bruno Mars",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/ae/f2/11aef294-f57c-bab9-c9fc-529162984e62/24UMGIM85348.rgb.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 9
  },
  "The Prodigy": {
    "name": "The Prodigy",
    "nameKo": "프로디지",
    "nameEn": "The Prodigy",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/34/32/64/34326479-d3bd-8d30-d5b2-86b59cf15c4b/634904219000.png/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 15
  },
  "10CM": {
    "name": "10CM",
    "nameKo": "십센치",
    "nameEn": "10CM",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/83/df/34/83df34b0-ab7d-7257-668a-7692f68fdc7a/5055946710525.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 3
  },
  "Guns N' Roses": {
    "name": "Guns N' Roses",
    "nameKo": "Guns N' Roses",
    "nameEn": "Guns N' Roses",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b4/4e/9c/b44e9c1c-54c4-0eab-544c-1c5d0933158a/20UMGIM52444.rgb.jpg/600x600bb.jpg",
    "trackCount": 17,
    "bpm130_180Count": 7
  },
  "레이지본": {
    "name": "레이지본",
    "nameKo": "레이지본",
    "nameEn": "Lazybone",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/bf/73/3a/bf733a5a-3c55-3348-3d83-d384d9fad4eb/190560014866.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 16
  },
  "걸스데이": {
    "name": "걸스데이",
    "nameKo": "걸스데이",
    "nameEn": "Girl's Day",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b4/f7/87/b4f78791-d16a-7c9f-c3a5-f978aef49d9e/8804775039331.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 14
  },
  "크러쉬": {
    "name": "크러쉬",
    "nameKo": "크러쉬",
    "nameEn": "Crush",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/88/be/eb/88beebd5-76f0-1845-91ad-6f80764488af/191953587608.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 2
  },
  "Skillet": {
    "name": "Skillet",
    "nameKo": "Skillet",
    "nameEn": "Skillet",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/38/af/10/38af10b4-ff1f-879b-e1cc-072367cab8e2/075679951083.jpg/600x600bb.jpg",
    "trackCount": 38,
    "bpm130_180Count": 18
  },
  "머쉬베놈": {
    "name": "머쉬베놈",
    "nameKo": "머쉬베놈",
    "nameEn": "MUSHVENOM",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6d/54/db/6d54db17-1490-e3ce-4d4d-8f34e5e9cacc/888272071412_Cover.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 13
  },
  "KANA-BOON": {
    "name": "KANA-BOON",
    "nameKo": "카나분",
    "nameEn": "KANA-BOON",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3c/92/a8/3c92a892-db2d-6ae7-7e0e-6aab5cc3682f/kana_j_rgb_ok.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 17
  },
  "Drake": {
    "name": "Drake",
    "nameKo": "Drake",
    "nameEn": "Drake",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/35/b9/06/35b90629-a873-14f8-4789-ffc324960038/26UMGIM63614.rgb.jpg/600x600bb.jpg",
    "trackCount": 38,
    "bpm130_180Count": 6
  },
  "Aimyon": {
    "name": "Aimyon",
    "nameKo": "아이묭",
    "nameEn": "Aimyon",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/77/8e/e9/778ee9af-fcbb-091c-e135-24c4bda18e1b/190295528652.jpg/600x600bb.jpg",
    "trackCount": 15,
    "bpm130_180Count": 4
  },
  "박완규": {
    "name": "박완규",
    "nameKo": "박완규",
    "nameEn": "Park Wan Kyu",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c1/3f/a8/c13fa802-a5a8-a0c6-7e41-8f7bb79b24a5/cover_KM0021169_1.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 2
  },
  "피아": {
    "name": "피아",
    "nameKo": "피아",
    "nameEn": "PIA",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/fd/9b/92/fd9b9253-7b24-3609-4d4a-1838fcdbab66/8809887753601.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 9
  },
  "터치드": {
    "name": "터치드",
    "nameKo": "터치드",
    "nameEn": "TOUCHED",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/36/44/9d/36449d76-8f9a-31f4-d112-e703c1fcc001/887928019303.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 9
  },
  "프라이머리": {
    "name": "프라이머리",
    "nameKo": "프라이머리",
    "nameEn": "Primary",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c0/56/30/c05630b4-f734-58c3-d810-71e8dd9087a8/196922296390_Cover.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 5
  },
  "Radiohead": {
    "name": "Radiohead",
    "nameKo": "Radiohead",
    "nameEn": "Radiohead",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7a/7c/287a7ca9-ed95-1a21-e3bb-4559a1a0ac0e/191404134351.png/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 1
  },
  "Skrillex": {
    "name": "Skrillex",
    "nameKo": "스크릴렉스",
    "nameEn": "Skrillex",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b4/c3/e8/b4c3e867-a787-7662-d8a4-45b3a30deb54/mzi.dsikpckg.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 17
  },
  "imase": {
    "name": "imase",
    "nameKo": "이마세",
    "nameEn": "imase",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9d/8b/05/9d8b051d-51cc-f0f9-8ffc-781e7b58b186/24UMGIM74488.rgb.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 12
  },
  "NCT DREAM": {
    "name": "NCT DREAM",
    "nameKo": "NCT DREAM",
    "nameEn": "NCT DREAM",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/14/97/ec/1497ec04-8807-2477-7be4-2b98797f6875/NCTD_01_Hot_Sauce_DC-F_0429.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 8
  },
  "릴러말즈": {
    "name": "릴러말즈",
    "nameKo": "릴러말즈",
    "nameEn": "Leellamarz",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ee/a7/30/eea730c4-3d0e-a6d0-3481-76997cc3d07a/888272121469_Cover.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 13
  },
  "유다빈밴드": {
    "name": "유다빈밴드",
    "nameKo": "유다빈밴드",
    "nameEn": "YdBB",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bd/de/4c/bdde4ce8-5221-e726-e9b2-f31fcc321c2a/887928021924.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 7
  },
  "Illenium": {
    "name": "Illenium",
    "nameKo": "ILLENIUM",
    "nameEn": "ILLENIUM",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2a/29/bb/2a29bbce-b9bb-6763-f146-07f67e5d44bc/859719569298.png/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 16
  },
  "트랜스픽션": {
    "name": "트랜스픽션",
    "nameKo": "트랜스픽션",
    "nameEn": "TransFixion",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music5/v4/f0/4f/9b/f04f9bbe-3fec-120a-71d8-4224b6fb28d9/trans.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 13
  },
  "sumika": {
    "name": "sumika",
    "nameKo": "스미카",
    "nameEn": "sumika",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3a/bd/24/3abd24b1-e71c-96c8-510e-42e393704997/886447590300.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 9
  },
  "Yeat": {
    "name": "Yeat",
    "nameKo": "Yeat",
    "nameEn": "Yeat",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/76/a8/aa/76a8aa34-3e82-73e5-fdd7-1844f35d31b6/26UM1IM37849.rgb.jpg/600x600bb.jpg",
    "trackCount": 4,
    "bpm130_180Count": 3
  },
  "장기하와 얼굴들": {
    "name": "장기하와 얼굴들",
    "nameKo": "장기하와 얼굴들",
    "nameEn": "장기하와 얼굴들",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/9b/0d/f5/9b0df5f8-048a-b185-d51c-97c950ea120e/8809629045278.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 8
  },
  "노브레인": {
    "name": "노브레인",
    "nameKo": "노브레인",
    "nameEn": "No Brain",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3c/ff/cf/3cffcfc3-9b7a-1382-1ffe-e3ecfae7e136/8809069413446.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 28
  },
  "Lady Gaga": {
    "name": "Lady Gaga",
    "nameKo": "레이디 가가",
    "nameEn": "Lady Gaga",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/9f/ef/b19fef51-79de-a940-e8ab-9e4e07b04d96/18UMGIM53752.rgb.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 4
  },
  "Peggy Gou": {
    "name": "Peggy Gou",
    "nameKo": "페기 구",
    "nameEn": "Peggy Gou",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f9/4d/2d/f94d2de7-1ab9-d154-f980-1ac493216edd/191404167779.png/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 7
  },
  "Conan Gray": {
    "name": "Conan Gray",
    "nameKo": "Conan Gray",
    "nameEn": "Conan Gray",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/95/a8/2c/95a82c4a-6d4d-2bcb-b3ea-be59a5100e0c/25UMGIM46919.rgb.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 4
  },
  "Billie Eilish": {
    "name": "Billie Eilish",
    "nameKo": "Billie Eilish",
    "nameEn": "Billie Eilish",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/1d/30/021d3036-5503-3ed3-df00-882f2833a6ae/17UM1IM17026.rgb.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 2
  },
  "John Summit": {
    "name": "John Summit",
    "nameKo": "John Summit & Absolutely",
    "nameEn": "John Summit & Absolutely",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/3e/2a/b9/3e2ab937-0ea6-c02b-3c57-afe28f9aa2a2/198704984693_Cover.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 13
  },
  "Ado": {
    "name": "Ado",
    "nameKo": "아도",
    "nameEn": "Ado",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/80/e8/82/80e8826c-f877-9a74-0e7b-a142108feda0/23UMGIM92958.rgb.jpg/600x600bb.jpg",
    "trackCount": 45,
    "bpm130_180Count": 32
  },
  "넬": {
    "name": "넬",
    "nameKo": "넬",
    "nameEn": "NELL",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/82/20/8e/82208ea5-ebf1-b282-19be-44f91dea046d/8809231381283_Cover.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 4
  },
  "아이유": {
    "name": "아이유",
    "nameKo": "아이유",
    "nameEn": "IU",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/dc/12/fe/dc12fe03-172b-a843-0d96-12819fa05b6c/cover-.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 6
  },
  "투어스": {
    "name": "투어스",
    "nameKo": "투어스",
    "nameEn": "TWS",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/1a/65/971a6558-1373-bf4d-4281-d984f117ea4c/198704698750_Cover.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 8
  },
  "슈프림팀": {
    "name": "슈프림팀",
    "nameKo": "슈프림팀",
    "nameEn": "Supreme Team",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/45/1a/93/451a9354-79d2-ccac-605c-9bac29f22ecd/8809231388848_Cover.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 1
  },
  "더 발룬티어스": {
    "name": "더 발룬티어스",
    "nameKo": "더 발룬티어스",
    "nameEn": "The Volunteers",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f9/28/8c/f9288c73-c42a-11d1-a4aa-83a7ce6e3c46/TheVolunteers_3000.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 7
  },
  "Green Day": {
    "name": "Green Day",
    "nameKo": "Green Day",
    "nameEn": "Green Day",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b8/36/d6/b836d655-7ef3-5c93-734e-fb77c4981308/mzi.opxridrf.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 12
  },
  "Blink-182": {
    "name": "Blink-182",
    "nameKo": "Blink-182",
    "nameEn": "Blink-182",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/7a/c4/52/7ac452a0-7d32-1d91-4058-489a45ac3d83/20UMGIM78120.rgb.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 18
  },
  "Carly Rae Jepsen": {
    "name": "Carly Rae Jepsen",
    "nameKo": "Carly Rae Jepsen",
    "nameEn": "Carly Rae Jepsen",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/99/f1/65/99f165d3-ac9f-1f82-20a8-d88429eecd0f/22UMGIM50301.rgb.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 0
  },
  "빈지노": {
    "name": "빈지노",
    "nameKo": "빈지노",
    "nameEn": "Beenzino",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/72/92/96/729296cd-7de4-fe41-2ad1-4f7f09696648/888272077988_Cover.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 4
  },
  "Fred again..": {
    "name": "Fred again..",
    "nameKo": "Fred again.. & Baby Keem",
    "nameEn": "Fred again.. & Baby Keem",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f7/da/f7/f7daf71b-52b2-c906-1d68-eec11a75b2f6/5054197912979.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 20
  },
  "볼빨간사춘기": {
    "name": "볼빨간사춘기",
    "nameKo": "볼빨간사춘기",
    "nameEn": "BOL4",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7b/af/8e/7baf8ec9-e0b5-726a-e763-61bcdb3f7371/jacket-585591.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 6
  },
  "플라워": {
    "name": "플라워",
    "nameKo": "플라워",
    "nameEn": "Flower",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/ae/c0/ab/mzi.tgabovbf.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 2
  },
  "방탄소년단": {
    "name": "방탄소년단",
    "nameKo": "방탄소년단",
    "nameEn": "BTS",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/02/c5/18/02c518f5-ac06-3321-622e-08d9429fd968/192562556672_Cover.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 9
  },
  "샤이니": {
    "name": "샤이니",
    "nameKo": "샤이니",
    "nameEn": "SHINee",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/80/62/98/806298ca-b4c7-8061-f21e-998f1641ce0d/asset.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 7
  },
  "Future": {
    "name": "Future",
    "nameKo": "Future",
    "nameEn": "Future",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0a/46/ab/0a46ab3a-2415-0659-2cc2-f3f173144bd5/886445328530.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 8
  },
  "자이언티": {
    "name": "자이언티",
    "nameKo": "자이언티",
    "nameEn": "Zion.T",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/87/62/44/87624400-a654-ede7-1f49-bca337d18b9d/Zion.T_ZZZ_Digital_Cover.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 5
  },
  "Swedish House Mafia": {
    "name": "Swedish House Mafia",
    "nameKo": "스웨디시 하우스 마피아",
    "nameEn": "Swedish House Mafia & Lykke Li",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cf/19/9c/cf199c26-6f59-a4b6-4309-c597ceea14d2/14006.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 7
  },
  "Creepy Nuts": {
    "name": "Creepy Nuts",
    "nameKo": "크리피 넛츠",
    "nameEn": "Creepy Nuts",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e3/f7/82/e3f782dd-efcb-0124-c92d-6ef3821a1fcd/jacket_AIXX01598B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 15
  },
  "개리": {
    "name": "개리",
    "nameKo": "개리",
    "nameEn": "GARY",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/9c/21/6a/9c216a86-1480-4cf1-8292-59a53f8f5957/KM0002752-_DS-0527.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 3
  },
  "Paramore": {
    "name": "Paramore",
    "nameKo": "Paramore",
    "nameEn": "Paramore",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/v4/10/fd/c4/10fdc4df-c932-d7d6-28c2-b2b077c42576/075679954596.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 17
  },
  "Charli xcx": {
    "name": "Charli xcx",
    "nameKo": "Charli xcx",
    "nameEn": "Charli xcx",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/88/4e/63/884e6321-ad41-aab1-f6f0-20efcafcfd55/075679666130.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 4
  },
  "My Chemical Romance": {
    "name": "My Chemical Romance",
    "nameKo": "My Chemical Romance",
    "nameEn": "My Chemical Romance",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/56/99/8a/56998a1c-efe7-fdf0-2b1d-e2da88d8df52/093624917724.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 9
  },
  "크라잉넛": {
    "name": "크라잉넛",
    "nameKo": "크라잉넛",
    "nameEn": "Crying Nut",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features/d1/20/b2/dj.mrnlbltl.jpg/600x600bb.jpg",
    "trackCount": 67,
    "bpm130_180Count": 32
  },
  "Culture Shock": {
    "name": "Culture Shock",
    "nameKo": "Culture Shock & Gracie Van Brunt",
    "nameEn": "Culture Shock & Gracie Van Brunt",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/a3/47/74/a34774be-c442-6a10-56d9-ab8553d20c5a/197187710829.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 21
  },
  "세이수미": {
    "name": "세이수미",
    "nameKo": "세이수미",
    "nameEn": "Say Sue Me",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/db/99/45/db9945e3-b955-32f1-c2bf-b7c1fa977352/0603728489333.png/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 18
  },
  "Tiësto": {
    "name": "Tiësto",
    "nameKo": "티에스토",
    "nameEn": "Tiësto & Sexyy Red",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a6/91/da/a691dac7-4cb7-82f5-0eda-e37b96f63f55/075679610720.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 12
  },
  "스텔라장": {
    "name": "스텔라장",
    "nameKo": "스텔라장",
    "nameEn": "Stella Jang",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/07/07/6b/07076bd1-6764-5ff3-639a-2ef0633664e4/191953287997.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 5
  },
  "Linkin Park": {
    "name": "Linkin Park",
    "nameKo": "Linkin Park",
    "nameEn": "Linkin Park",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/600x600bb.jpg",
    "trackCount": 48,
    "bpm130_180Count": 9
  },
  "Kanye West": {
    "name": "Kanye West",
    "nameKo": "Kanye West",
    "nameEn": "Kanye West",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/37/da/7c/37da7cc5-2b6f-9bb8-30ba-8a8c3be3e16a/00602527584973.rgb.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 5
  },
  "Avicii": {
    "name": "Avicii",
    "nameKo": "아비치",
    "nameEn": "Avicii",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/97/ec/23/97ec23c0-cb32-5da3-b8ec-b04b2c2c3333/17UM1IM17510.rgb.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 3
  },
  "들국화": {
    "name": "들국화",
    "nameKo": "들국화",
    "nameEn": "Deulgukhwa",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/f2/42/2a/f2422a61-fdd9-538a-0c63-7957c1117373/KM0002427-_-1206.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 2
  },
  "RADWIMPS": {
    "name": "RADWIMPS",
    "nameKo": "래드윔프스",
    "nameEn": "RADWIMPS",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/35/33/923533a6-0b8c-8431-ae1a-f60e2abc6123/4988031342541_cover.jpg/600x600bb.jpg",
    "trackCount": 52,
    "bpm130_180Count": 20
  },
  "Kygo": {
    "name": "Kygo",
    "nameKo": "Kygo",
    "nameEn": "Kygo",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e4/f3/23/e4f323a7-29fd-a429-4dc9-dbdd5c5e5b6a/mzm.nzvdusow.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 2
  },
  "오렌지캬라멜": {
    "name": "오렌지캬라멜",
    "nameKo": "오렌지캬라멜",
    "nameEn": "Orange Caramel",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/d9/69/0b/mzi.nxdvgogj.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 7
  },
  "EXO": {
    "name": "EXO",
    "nameKo": "엑소",
    "nameEn": "EXO",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/97/f7/95/97f795bb-178f-53c6-8c4e-f1fa0f559846/EXO_DIGITAL_COVER.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 11
  },
  "Tatsuya Kitani": {
    "name": "Tatsuya Kitani",
    "nameKo": "키타니 타츠야",
    "nameEn": "Tatsuya Kitani",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/b7/c5/1ab7c521-9e4a-d928-2af0-019898c39212/21UMGIM84861.rgb.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 3
  },
  "버즈": {
    "name": "버즈",
    "nameKo": "버즈",
    "nameEn": "Buzz",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2c/ba/3c/2cba3c6f-62c2-249a-60a9-e0aae44c2b19/191953031804.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 5
  },
  "The Strokes": {
    "name": "The Strokes",
    "nameKo": "The Strokes",
    "nameEn": "The Strokes",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/62/a6/ff/62a6ff2a-95c9-5302-31f4-2dcca9e40323/886448281085.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 24
  },
  "Rihanna": {
    "name": "Rihanna",
    "nameKo": "Rihanna",
    "nameEn": "Rihanna",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/24/3e/61/243e6126-9de5-f184-dd63-d083b4480684/09UMGIM01491.rgb.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 0
  },
  "aespa": {
    "name": "aespa",
    "nameKo": "에스파",
    "nameEn": "aespa",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f7/f0/5c/f7f05ce4-e5a4-900d-e087-1dd9668b2b34/888735945939.jpg/600x600bb.jpg",
    "trackCount": 42,
    "bpm130_180Count": 7
  },
  "노바소닉": {
    "name": "노바소닉",
    "nameKo": "노바소닉",
    "nameEn": "Novasonic",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/31/07/ec/3107ecb7-7a75-8252-7c21-890bae4a5bec/0_01_1999-2002_Remastering.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 11
  },
  "키스오브라이프": {
    "name": "키스오브라이프",
    "nameKo": "키스오브라이프",
    "nameEn": "KISS OF LIFE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/70/86/dd70863e-2571-25cd-d1eb-c44a5cdba57f/cover_KM0020274_1.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 4
  },
  "타카피": {
    "name": "타카피",
    "nameKo": "타카피",
    "nameEn": "T.A.Copy",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/1c/b3/69/1cb3691d-7efa-2b5c-4edc-39ea7e52b27f/8806197928460.jpg/600x600bb.jpg",
    "trackCount": 21,
    "bpm130_180Count": 10
  },
  "Calvin Harris": {
    "name": "Calvin Harris",
    "nameKo": "캘빈 해리스",
    "nameEn": "Calvin Harris",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/eb/cb/98/ebcb98aa-e285-8142-bf43-e78323a75f5e/886445624380.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 3
  },
  "글렌체크": {
    "name": "글렌체크",
    "nameKo": "글렌체크",
    "nameEn": "Glen Check",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a2/ea/77/a2ea7709-3c6f-1778-62cd-96b21d065251/cover_KM0021017_1.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 7
  },
  "Afrojack": {
    "name": "Afrojack",
    "nameKo": "아프로잭",
    "nameEn": "AFROJACK",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/dd/d7/19/ddd7198d-2745-af72-813a-73b8efb1fff8/00602537795451.rgb.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 6
  },
  "네미시스": {
    "name": "네미시스",
    "nameKo": "네미시스",
    "nameEn": "Nemesis",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d2/60/16/d260160b-47e6-3124-7920-af1787af3ee6/886443589513.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 9
  },
  "크래쉬": {
    "name": "크래쉬",
    "nameKo": "크래쉬",
    "nameEn": "Crash",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/ef/c8/fb/efc8fb92-92ad-cdff-be08-caec597aa595/8000704_cover.png/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 13
  },
  "AKMU": {
    "name": "AKMU",
    "nameKo": "악뮤",
    "nameEn": "AKMU",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e4/a2/80/e4a28015-490b-255a-ff26-aadd6257cfa1/AKMU_DS.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 2
  },
  "위너": {
    "name": "위너",
    "nameKo": "위너",
    "nameEn": "WINNER",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/27/5f/c7/275fc76e-a477-2cfc-20b1-a41319fe26c4/WINNER_ALBUM_COVER.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 3
  },
  "혁오": {
    "name": "혁오",
    "nameKo": "혁오",
    "nameEn": "HYUKOH",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/00/5f/d2/005fd283-065a-2e34-7836-4657f78d1b48/HYUKOH_24_3000.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 7
  },
  "극동아시아타이거즈": {
    "name": "극동아시아타이거즈",
    "nameKo": "극동아시아타이거즈",
    "nameEn": "극동아시아타이거즈",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/72/8d/97728d81-94a5-b050-cdee-92ede4c35851/8800303125613.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 3
  },
  "Snoop Dogg": {
    "name": "Snoop Dogg",
    "nameKo": "Snoop Dogg",
    "nameEn": "Snoop Dogg",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d1/5f/e6/d15fe67f-70ac-3d03-0936-b4020fc42fa3/808391370319.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 2
  },
  "씨엔블루": {
    "name": "씨엔블루",
    "nameKo": "씨엔블루",
    "nameEn": "CNBLUE",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/a5/99/4fa59907-51b8-3707-b179-957269701ba5/8809231387728_cover.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 10
  },
  "ONE OK ROCK": {
    "name": "ONE OK ROCK",
    "nameKo": "원 오크 록",
    "nameEn": "ONE OK ROCK",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fa/d5/a6/fad5a6d5-60b1-4ba3-3da9-be47bb3b7d68/4550759798070_cover.jpg/600x600bb.jpg",
    "trackCount": 64,
    "bpm130_180Count": 38
  },
  "Bicep": {
    "name": "Bicep",
    "nameKo": "Bicep",
    "nameEn": "Bicep",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ff/3e/3f/ff3e3f9a-0527-e46b-a3f2-d36c807505df/5054429140897.png/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 12
  },
  "NewJeans": {
    "name": "NewJeans",
    "nameKo": "뉴진스",
    "nameEn": "NewJeans",
    "genre": "kpop",
    "coverUrl": "https://image.bugsm.co.kr/album/images/500/40780/4078016.jpg?version=20221014011218",
    "trackCount": 26,
    "bpm130_180Count": 15
  },
  "데이브레이크": {
    "name": "데이브레이크",
    "nameKo": "데이브레이크",
    "nameEn": "Daybreak",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/6d/4d/9f/6d4d9f83-9fe9-e138-18e0-70b1182129b0/edit_568771.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 11
  },
  "UVERworld": {
    "name": "UVERworld",
    "nameKo": "우버월드",
    "nameEn": "UVERworld",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e6/db/fb/e6dbfba4-0902-3d71-18b7-97ef4136128a/jacket_SRCL06240B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 45,
    "bpm130_180Count": 18
  },
  "ZUTOMAYO": {
    "name": "ZUTOMAYO",
    "nameKo": "계속 한밤중이면 좋을 텐데",
    "nameEn": "ZUTOMAYO",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d6/57/e2/d657e297-1bd1-423d-9062-b4cf4e554d2b/21UMGIM47219.rgb.jpg/600x600bb.jpg",
    "trackCount": 45,
    "bpm130_180Count": 24
  },
  "MY FIRST STORY": {
    "name": "MY FIRST STORY",
    "nameKo": "마이 퍼스트 스토리",
    "nameEn": "MY FIRST STORY",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/80/66/c0/8066c0aa-bf56-4e5e-4689-1c5f82a3cfbd/4570063063978.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 11
  },
  "로꼬": {
    "name": "로꼬",
    "nameKo": "로꼬",
    "nameEn": "Loco",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1f/63/40/1f6340b9-9a9f-a277-9d90-924eddaa01b8/8809658313935_Cover.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 9
  },
  "여자친구": {
    "name": "여자친구",
    "nameKo": "여자친구",
    "nameEn": "GFRIEND",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ea/8f/88/ea8f8830-e272-a14f-1936-0dc88ff69e85/888272019186_Cover.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 9
  },
  "태민": {
    "name": "태민",
    "nameKo": "태민",
    "nameEn": "TAEMIN",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9a/15/ce/9a15cee2-7c2e-a6fd-e144-a2ff50d60cae/888735945755.png/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 2
  },
  "Aerosmith": {
    "name": "Aerosmith",
    "nameKo": "Aerosmith",
    "nameEn": "Aerosmith",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ad/c4/6f/adc46ff2-77c1-8a5b-562a-f5bca4ad3d1c/23UMGIM63562.rgb.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 1
  },
  "Alan Walker": {
    "name": "Alan Walker",
    "nameKo": "알렌 워커",
    "nameEn": "Alan Walker",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/10/ad/6f/10ad6f6f-e4df-ed32-4108-ea96f06f6e14/886446723532.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 4
  },
  "토일": {
    "name": "토일",
    "nameKo": "토일",
    "nameEn": "TOIL",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f6/7f/89/f67f8972-7490-45b9-7edd-c39061ac9c33/888272094305_Cover.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 10
  },
  "Dr. Dre": {
    "name": "Dr. Dre",
    "nameKo": "Dr. Dre",
    "nameEn": "Dr. Dre",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/aa/07/db/aa07db20-0b14-d09c-ead7-5b9e3680cb76/00602527051840.rgb.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 6
  },
  "Don Toliver": {
    "name": "Don Toliver",
    "nameKo": "Don Toliver",
    "nameEn": "Don Toliver",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/00/c1/dd/00c1dd09-3f86-7288-01dc-63b9f4262f57/075679599377.jpg/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 7
  },
  "Playboi Carti": {
    "name": "Playboi Carti",
    "nameKo": "Playboi Carti",
    "nameEn": "Playboi Carti",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a2/38/52/a23852d9-21e4-5ac5-6d75-2682fecdda46/18UMGIM26096.rgb.jpg/600x600bb.jpg",
    "trackCount": 10,
    "bpm130_180Count": 7
  },
  "BUMP OF CHICKEN": {
    "name": "BUMP OF CHICKEN",
    "nameKo": "범프 오브 치킨",
    "nameEn": "BUMP OF CHICKEN",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/a0/83/f4/a083f4f3-3853-d374-3870-957a7df3791a/TFCC-86457WW.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 6
  },
  "페퍼톤스": {
    "name": "페퍼톤스",
    "nameKo": "페퍼톤스",
    "nameEn": "PEPPERTONES",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/48/5c/b0/485cb05b-7a51-c0fa-fa6d-6196827a151f/cover_KM0015169_1.jpg/600x600bb.jpg",
    "trackCount": 59,
    "bpm130_180Count": 24
  },
  "실리카겔": {
    "name": "실리카겔",
    "nameKo": "실리카겔",
    "nameEn": "Silica Gel",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e3/ad/bd/e3adbde9-d73c-b362-2fb5-0638c2f94aac/8809851799765.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 12
  },
  "로맨틱펀치": {
    "name": "로맨틱펀치",
    "nameKo": "로맨틱펀치",
    "nameEn": "Romantic Punch",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f9/09/f2/f909f2c4-6024-79e4-377a-400b400f4857/8809795713339.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 29
  },
  "리쌍": {
    "name": "리쌍",
    "nameKo": "리쌍",
    "nameEn": "Leessang",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/76/a4/c9/76a4c9fb-8099-831d-b2f9-9ee2a43e0911/mzi.soiolgnj.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 2
  },
  "Zedd": {
    "name": "Zedd",
    "nameKo": "제드",
    "nameEn": "Zedd",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3b/a4/e7/3ba4e77f-9965-6395-6d5f-2b7a766957fa/23UM1IM58483.rgb.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 6
  },
  "롤링쿼츠": {
    "name": "롤링쿼츠",
    "nameKo": "롤링쿼츠",
    "nameEn": "Rolling Quartz",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d3/17/65/d317656a-2afb-8041-d41c-84c6f0d82149/8800366557154.jpg/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 0
  },
  "Fujii Kaze": {
    "name": "Fujii Kaze",
    "nameKo": "후지이 카제",
    "nameEn": "Fujii Kaze",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/96/4e/5b/964e5b6e-4766-63ba-7e50-9f8a5bd0569e/20UMGIM17280.rgb.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 5
  },
  "다이나믹 듀오": {
    "name": "다이나믹 듀오",
    "nameKo": "다이나믹 듀오",
    "nameEn": "Dynamicduo",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/ff/34/4f/ff344f3d-31b0-6c99-c28e-f3e241bf0a27/8809603545916_Cover.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 2
  },
  "씨스타": {
    "name": "씨스타",
    "nameKo": "씨스타",
    "nameEn": "SISTAR",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music5/v4/02/a4/49/02a44988-e8b5-1e0b-17ae-cba8d631f006/KM0002901-_-0826.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 7
  },
  "TWICE": {
    "name": "TWICE",
    "nameKo": "트와이스",
    "nameEn": "TWICE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/7e/41/69/7e4169e8-8358-27ff-66b4-1564ec800abd/00602508875137_Cover.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 18
  },
  "창모": {
    "name": "창모",
    "nameKo": "창모",
    "nameEn": "CHANGMO",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a9/7d/74/a97d742d-13fa-d765-0d25-c255fb2b7fad/8809492070704_Cover.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 12
  },
  "NCT 127": {
    "name": "NCT 127",
    "nameKo": "NCT 127",
    "nameEn": "NCT 127",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/33/c2/8f/33c28f18-5ecc-8a39-cf52-9756fa1b6efb/888735956515_Cover.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 6
  },
  "태연": {
    "name": "태연",
    "nameKo": "태연",
    "nameEn": "TAEYEON",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/9a/49/b2/9a49b2d2-2501-2fc7-60eb-2b8ff34a1412/TAEYEON-DIGITAL20COVER.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 11
  },
  "Eve": {
    "name": "Eve",
    "nameKo": "Eve",
    "nameEn": "Eve",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2a/84/07/2a8407ff-01ef-b4df-a29b-c63e192aa51a/195497876488.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 16
  },
  "(여자)아이들": {
    "name": "(여자)아이들",
    "nameKo": "(여자)아이들",
    "nameEn": "(G)I-DLE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4c/da/91/4cda91b0-6fa2-805e-fd1a-e89bf87bb969/8804775250422.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 3
  },
  "Taylor Swift": {
    "name": "Taylor Swift",
    "nameKo": "테일러 스위프트",
    "nameEn": "Taylor Swift",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a0/dd/fd/a0ddfd72-ee9e-f046-6466-a5dbefc696fa/26UM1IM21436.rgb.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 6
  },
  "국카스텐": {
    "name": "국카스텐",
    "nameKo": "국카스텐",
    "nameEn": "Guckkasten",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/v4/84/69/32/84693236-6775-4804-0bac-992df7aea9b9/KM0001894-_-1227.jpg/600x600bb.jpg",
    "trackCount": 51,
    "bpm130_180Count": 21
  },
  "Justin Bieber": {
    "name": "Justin Bieber",
    "nameKo": "저스틴 비버",
    "nameEn": "Justin Bieber",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7c/74/e0/7c74e0b8-46fe-2211-e59d-037593a87f05/10UMGIM01134.rgb.jpg/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 4
  },
  "이브": {
    "name": "이브",
    "nameKo": "이브",
    "nameEn": "Eve",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/b1/f2/b0/b1f2b0dd-bb69-78ea-b21d-a25d89e460ee/8806384512755_cover.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 3
  },
  "J. Cole": {
    "name": "J. Cole",
    "nameKo": "J. Cole",
    "nameEn": "J. Cole",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/35/69/81/356981f1-a442-554e-0d6d-d42255bc2a82/00850498007513.rgb.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 11
  },
  "버벌진트": {
    "name": "버벌진트",
    "nameKo": "버벌진트",
    "nameEn": "Verbal Jint",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/11/fb/f9/11fbf9ea-e777-99d3-2e56-988ae7ef1060/297946.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 1
  },
  "Disclosure": {
    "name": "Disclosure",
    "nameKo": "Disclosure",
    "nameEn": "Disclosure",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c1/97/cd/c197cd81-63a8-3237-2b60-a3ce878f52fc/21UMGIM89989.rgb.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 10
  },
  "STAYC": {
    "name": "STAYC",
    "nameKo": "스테이씨",
    "nameEn": "STAYC",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e7/37/29/e73729f2-ec82-295d-40d0-3025b9f251d8/cover_KM0014771_1.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 16
  },
  "Martin Garrix": {
    "name": "Martin Garrix",
    "nameKo": "마틴 개릭스",
    "nameEn": "Martin Garrix",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6e/1e/f0/6e1ef055-195a-bb73-d5a8-5926058366a5/8712944577525.png/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 4
  },
  "MC몽": {
    "name": "MC몽",
    "nameKo": "MC몽",
    "nameEn": "MC Mong",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/91/8b/13918b85-918f-fae6-66f3-f45618c9ec1a/cover_KM0014529_1.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 2
  },
  "David Guetta": {
    "name": "David Guetta",
    "nameKo": "데이비드 게타",
    "nameEn": "David Guetta",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/13/e6/ad/13e6ad01-3b0e-c13e-c7f8-1262a224d9ce/cover_KM0020541_1.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 11
  },
  "Ariana Grande": {
    "name": "Ariana Grande",
    "nameKo": "아리아나 그란데",
    "nameEn": "Ariana Grande",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6e/40/14/6e401443-8c15-2f21-4d2c-effe972c3838/16UMGIM30042.rgb.jpg/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 3
  },
  "트리플에스": {
    "name": "트리플에스",
    "nameKo": "트리플에스",
    "nameEn": "tripleS",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d4/04/15/d404150a-381f-6f04-aa0a-bb948bf581db/cover_KM0016832_1.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 16
  },
  "BLUE ENCOUNT": {
    "name": "BLUE ENCOUNT",
    "nameKo": "BLUE ENCOUNT",
    "nameEn": "BLUE ENCOUNT",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music69/v4/d2/6a/c8/d26ac866-df01-490e-78f6-d5e6cd04ad52/886445283761.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 14
  },
  "유니스": {
    "name": "유니스",
    "nameKo": "유니스",
    "nameEn": "UNIS",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ce/59/b3/ce59b3e1-7766-7cdc-abaf-9531f333d115/cover_KM0022534_1.jpg/600x600bb.jpg",
    "trackCount": 5,
    "bpm130_180Count": 5
  },
  "피프티피프티": {
    "name": "피프티피프티",
    "nameKo": "피프티피프티",
    "nameEn": "FIFTY FIFTY",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/d9/17/a5/d917a51b-fead-dabd-3189-31ba223d2eff/196872382174.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 5
  },
  "비오": {
    "name": "비오",
    "nameKo": "비오",
    "nameEn": "BE'O",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/f1/8d/bf/f18dbf4f-e158-90fd-5d02-3b6773bb3c09/888272091168_Cover.jpg/600x600bb.jpg",
    "trackCount": 6,
    "bpm130_180Count": 3
  },
  "Madonna": {
    "name": "Madonna",
    "nameKo": "Madonna",
    "nameEn": "Madonna",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/13/62/bd/1362bda5-3908-8112-7884-e6d58d2fdfdc/886447728932.jpg/600x600bb.jpg",
    "trackCount": 6,
    "bpm130_180Count": 1
  },
  "아일릿": {
    "name": "아일릿",
    "nameKo": "아일릿",
    "nameEn": "ILLIT",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/b9/40/bf/b940bf84-9f10-15e6-423f-3cdca2bbdd21/823375411949_Cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 19
  },
  "제니": {
    "name": "제니",
    "nameKo": "제니",
    "nameEn": "JENNIE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/42/03/45/420345e1-6e68-915e-fe8a-74c78b120280/cover_KM0025132_1.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 6
  },
  "델리스파이스": {
    "name": "델리스파이스",
    "nameKo": "델리스파이스",
    "nameEn": "Deli Spice",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ea/8d/03/ea8d03a9-6505-fae9-3575-9b2f3bbb70dd/8809691064771.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 7
  },
  "비와이": {
    "name": "비와이",
    "nameKo": "비와이",
    "nameEn": "BewhY",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ef/50/5d/ef505d7f-4028-c76c-76ea-284bd761abce/cover-BewhY.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 10
  },
  "Metro Boomin": {
    "name": "Metro Boomin",
    "nameKo": "Metro Boomin",
    "nameEn": "Metro Boomin",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4e/9f/7b/4e9f7b71-28ad-a8dc-9b34-da532feb82f6/196871937382.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 7
  },
  "Post Malone": {
    "name": "Post Malone",
    "nameKo": "Post Malone",
    "nameEn": "Post Malone",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/600x600bb.jpg",
    "trackCount": 42,
    "bpm130_180Count": 17
  },
  "ENHYPEN": {
    "name": "ENHYPEN",
    "nameKo": "엔하이픈",
    "nameEn": "ENHYPEN",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5f/c8/8c/5fc88cb7-faf5-483a-ea42-ebf112c5f3d7/198704187797_Cover.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 15
  },
  "Vaundy": {
    "name": "Vaundy",
    "nameKo": "바운디",
    "nameEn": "Vaundy",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7e/04/0e/7e040ed4-e66e-3f00-6678-acea145f5f34/197189864599.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 14
  },
  "쏜애플": {
    "name": "쏜애플",
    "nameKo": "쏜애플",
    "nameEn": "THORNAPPLE",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/51/0a/5b/510a5b3c-405a-630d-d3ea-ea520bc86fb8/Strange_Weather.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 10
  },
  "The Chainsmokers": {
    "name": "The Chainsmokers",
    "nameKo": "체인스모커스",
    "nameEn": "The Chainsmokers",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music18/v4/19/62/50/19625022-d397-6de4-7918-c24c7dcc6609/886445922097.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 7
  },
  "2NE1": {
    "name": "2NE1",
    "nameKo": "2NE1",
    "nameEn": "2NE1",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/44/b4/88/44b48832-27a1-939d-923e-e703c89c223a/8806384554595.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 9
  },
  "Hardwell": {
    "name": "Hardwell",
    "nameKo": "하드웰",
    "nameEn": "Hardwell & Tiësto",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/09/a3/01/09a301c9-df77-aa32-20a3-d48f98dababb/8718521028527.png/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 15
  },
  "YOASOBI": {
    "name": "YOASOBI",
    "nameKo": "요아소비",
    "nameEn": "YOASOBI",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a3/8e/41/a38e4173-a495-1c1f-aa2f-c7831c9c01a9/820233543187.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 6
  },
  "지코": {
    "name": "지코",
    "nameKo": "지코",
    "nameEn": "ZICO",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/14/1e/87/141e87bd-a541-e26a-bc74-c586d3e68d75/ZICO_cover_4000px.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 7
  },
  "원더걸스": {
    "name": "원더걸스",
    "nameKo": "원더걸스",
    "nameEn": "Wonder Girls",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ee/17/ca/ee17ca7d-2265-c2e0-1daf-e09246516008/610696268433_Cover.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 12
  },
  "폴블랑코": {
    "name": "폴블랑코",
    "nameKo": "폴블랑코",
    "nameEn": "Paul Blanco",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/47/63/c2/4763c26f-7091-fb59-809b-6c716e6aa479/cover_KM0015018_1.jpg/600x600bb.jpg",
    "trackCount": 6,
    "bpm130_180Count": 6
  },
  "Lorde": {
    "name": "Lorde",
    "nameKo": "Lorde",
    "nameEn": "Lorde",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/96/a5/09/96a50916-169b-724c-b722-b8c474406352/13UAAIM68691.rgb.jpg/600x600bb.jpg",
    "trackCount": 10,
    "bpm130_180Count": 2
  },
  "Porter Robinson": {
    "name": "Porter Robinson",
    "nameKo": "포터 로빈슨",
    "nameEn": "Ninajirachi & Porter Robinson",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/94/79/01/94790156-60e5-ff9b-f844-171f15910d66/820233879705.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 9
  },
  "드렁큰 타이거": {
    "name": "드렁큰 타이거",
    "nameKo": "드렁큰 타이거",
    "nameEn": "Drunken Tiger",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/e3/00/26/e300268f-62a8-3bb3-a367-b4c7813d38d0/asset.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 3
  },
  "베이비몬스터": {
    "name": "베이비몬스터",
    "nameKo": "베이비몬스터",
    "nameEn": "BABYMONSTER",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b9/e1/ef/b9e1ef3a-e3eb-8152-e91b-20aca0fc9ffd/BM_DRIP_Digital-Cover_4000.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 9
  },
  "미란이": {
    "name": "미란이",
    "nameKo": "미란이",
    "nameEn": "Mirani",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/40/bc/33/40bc33b5-f1a9-7058-500e-838f2f45278e/190296713873.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 8
  },
  "Sabrina Carpenter": {
    "name": "Sabrina Carpenter",
    "nameKo": "사브리나 카펜터",
    "nameEn": "Sabrina Carpenter",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cc/bc/ef/ccbcefb5-cf3a-1c55-0173-c37602827c7a/25UMGIM81699.rgb.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 3
  },
  "SEKAI NO OWARI": {
    "name": "SEKAI NO OWARI",
    "nameKo": "세카이노 오와리",
    "nameEn": "SEKAI NO OWARI",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b9/5c/4b/b95c4bc5-723e-5220-9aea-a32600cebad6/22UMGIM36577.rgb.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 12
  },
  "Mrs. GREEN APPLE": {
    "name": "Mrs. GREEN APPLE",
    "nameKo": "미세스 그린 애플",
    "nameEn": "Mrs. GREEN APPLE",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/c8/a1/a2/c8a1a225-cd8c-ce16-94d2-6e07b8bc920a/21UMGIM66297.rgb.jpg/600x600bb.jpg",
    "trackCount": 51,
    "bpm130_180Count": 25
  },
  "Fall Out Boy": {
    "name": "Fall Out Boy",
    "nameKo": "Fall Out Boy",
    "nameEn": "Fall Out Boy",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3c/55/ac/3c55acb6-3c72-b7a8-2b86-d8f028da3756/13UMGIM27299.rgb.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 13
  },
  "Major Lazer": {
    "name": "Major Lazer",
    "nameKo": "Major Lazer",
    "nameEn": "Major Lazer",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/37/ef/00/37ef0052-017f-83ab-88b5-45ea87df3f1c/190295782955.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 5
  },
  "Pendulum": {
    "name": "Pendulum",
    "nameKo": "펜듈럼",
    "nameEn": "Pendulum",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/09/3c/eb/093ceb19-dab2-5987-29d0-0adbdd4b7e78/25SYMIM19426.rgb.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 27
  },
  "소녀시대": {
    "name": "소녀시대",
    "nameKo": "소녀시대",
    "nameEn": "Girls' Generation",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/82/8c/a4828c50-11fa-50f1-f158-7ce923fd2e37/asset.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 8
  },
  "UNISON SQUARE GARDEN": {
    "name": "UNISON SQUARE GARDEN",
    "nameKo": "UNISON SQUARE GARDEN",
    "nameEn": "UNISON SQUARE GARDEN",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/75/63/13/7563130a-f816-4f18-2d8d-02ee9bd8beaa/TFCC-86565WW.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 17
  },
  "엔플라잉": {
    "name": "엔플라잉",
    "nameKo": "엔플라잉",
    "nameEn": "N.Flying",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/19/e8/28/19e8284b-957f-e247-0687-72fd11faff9b/8800388635656_cover.jpg/600x600bb.jpg",
    "trackCount": 55,
    "bpm130_180Count": 19
  },
  "Fatboy Slim": {
    "name": "Fatboy Slim",
    "nameKo": "팻보이 슬림",
    "nameEn": "Fatboy Slim & The Rolling Stones",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d4/f4/56/d4f456b7-5c06-5692-9a8e-69c6491020f7/0018771231622_3000.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 10
  },
  "카더가든": {
    "name": "카더가든",
    "nameKo": "카더가든",
    "nameEn": "Car, the garden",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9d/19/71/9d19711a-48de-9665-1959-06fae3f89122/191953137896.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 2
  },
  "그레이": {
    "name": "그레이",
    "nameKo": "그레이",
    "nameEn": "GRAY",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/7d/87/9f7d877c-d363-1fff-d620-85d01cbf04e9/888272105377_Cover.jpg/600x600bb.jpg",
    "trackCount": 4,
    "bpm130_180Count": 3
  },
  "딕펑스": {
    "name": "딕펑스",
    "nameKo": "딕펑스",
    "nameEn": "DICKPUNKS",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/07/41/9a/07419ab7-4780-8d6b-27df-84b18ec53bf3/8809717459246.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 7
  },
  "Simple Plan": {
    "name": "Simple Plan",
    "nameKo": "Simple Plan",
    "nameEn": "Simple Plan",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/17/42/2b/17422b02-e17a-5346-f184-4973ca24da91/603497859276.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 21
  },
  "The Offspring": {
    "name": "The Offspring",
    "nameKo": "The Offspring",
    "nameEn": "The Offspring",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/14/27/3b/14273bab-4dc2-b4c8-a662-3926668ca2fa/16UMGIM74617.rgb.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 15
  },
  "드래곤포니": {
    "name": "드래곤포니",
    "nameKo": "드래곤포니",
    "nameEn": "Dragon Pony",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b2/17/d9/b217d9a5-986c-80a3-c82c-51a59807a01b/cover_KM0021921_1.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 11
  },
  "아도이": {
    "name": "아도이",
    "nameKo": "아도이",
    "nameEn": "ADOY",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3e/cd/9e/3ecd9e69-40d5-febf-f8b9-2ba3a99b88ee/196006101732.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 12
  },
  "제로베이스원": {
    "name": "제로베이스원",
    "nameKo": "제로베이스원",
    "nameEn": "ZEROBASEONE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/38/9f/33/389f3334-421a-33fa-a73a-5770c8c23721/823375142249_Cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 15
  },
  "우아": {
    "name": "우아",
    "nameKo": "우아",
    "nameEn": "WOOAH",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b5/45/a8/b545a876-97a7-a477-41bb-a8b9333c4e7e/cover_KM0016455_1.jpg/600x600bb.jpg",
    "trackCount": 21,
    "bpm130_180Count": 9
  },
  "서태지": {
    "name": "서태지",
    "nameKo": "서태지",
    "nameEn": "Seo Taiji",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3a/51/a8/3a51a8d1-10bc-b012-f3c8-a9dbac743ac5/8809704420693_Cover.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 6
  },
  "Arctic Monkeys": {
    "name": "Arctic Monkeys",
    "nameKo": "Arctic Monkeys",
    "nameEn": "Arctic Monkeys",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/29/f5/6f/29f56fb2-4735-947b-f63a-2801294719cb/am_am_itunes_bonus_v2.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 14
  },
  "Chase & Status": {
    "name": "Chase & Status",
    "nameKo": "Chase & Status",
    "nameEn": "Chase & Status",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2e/ab/0c/2eab0c4f-68b1-2427-6e23-47ef81bfbbbb/1200214837747.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 30
  },
  "슈퍼주니어": {
    "name": "슈퍼주니어",
    "nameKo": "슈퍼주니어",
    "nameEn": "SUPER JUNIOR",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d4/f5/55/d4f555bb-e12d-807d-2c12-f8817f0fa6e7/asset.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 14
  },
  "Kenshi Yonezu": {
    "name": "Kenshi Yonezu",
    "nameKo": "요네즈 켄시",
    "nameEn": "Kenshi Yonezu",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e0/f9/f1/e0f9f1f3-a088-b28d-6760-a28accabc705/4547366775181.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 7
  },
  "투모로우바이투게더": {
    "name": "투모로우바이투게더",
    "nameKo": "투모로우바이투게더",
    "nameEn": "TOMORROW X TOGETHER",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/67/50/d2/6750d2c1-38a8-0738-8bb8-8780fd166394/823375033257_Cover.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 7
  },
  "King Gnu": {
    "name": "King Gnu",
    "nameKo": "킹누",
    "nameEn": "King Gnu",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9f/8a/0b/9f8a0bc1-e6ee-5873-4fc9-9a75b0d58e2a/4547366794816.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 6
  },
  "Galantis": {
    "name": "Galantis",
    "nameKo": "갈란티스",
    "nameEn": "Galantis",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b5/f7/72/b5f772a2-f75b-3aa1-5590-f50713e31ab2/075679894755.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 4
  },
  "블락비": {
    "name": "블락비",
    "nameKo": "블락비",
    "nameEn": "Block B",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/19/b7/4a/19b74a5d-c791-c508-dc57-fade6d5ae697/8809534462375_Cover.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 4
  },
  "소란": {
    "name": "소란",
    "nameKo": "소란",
    "nameEn": "SORAN",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ae/68/98/ae6898ca-ca37-b972-8a91-085cdd07f907/8809381232831.jpg/600x600bb.jpg",
    "trackCount": 52,
    "bpm130_180Count": 11
  },
  "언니네 이발관": {
    "name": "언니네 이발관",
    "nameKo": "언니네 이발관",
    "nameEn": "Sister's Barbershop",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/5b/34/61/5b346190-7b3a-f4e5-f87b-33b4f620236b/8809259900497.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 17
  },
  "The Chemical Brothers": {
    "name": "The Chemical Brothers",
    "nameKo": "케미컬 브라더스",
    "nameEn": "The Chemical Brothers",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/65/20/7a/65207a0f-88d6-6808-e4d4-bdf814490f4b/00602577080241.rgb.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 9
  },
  "딘": {
    "name": "딘",
    "nameKo": "딘",
    "nameEn": "DEAN",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8e/a2/d0/8ea2d001-0b52-a451-4a7c-de35d3502155/00602547860828.rgb.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 3
  },
  "박재범": {
    "name": "박재범",
    "nameKo": "박재범",
    "nameEn": "Jay Park",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c9/98/8e/c9988e81-4b47-969d-eb3f-7dbf10926875/8809380634810_Cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 7
  },
  "세븐틴": {
    "name": "세븐틴",
    "nameKo": "세븐틴",
    "nameEn": "SEVENTEEN",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/6b/90/22/6b9022f4-e1ae-0eb1-6ecd-b81fa47e5678/COVER-.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 10
  },
  "Eminem": {
    "name": "Eminem",
    "nameKo": "Eminem",
    "nameEn": "Eminem",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f7/76/f4/f776f482-406b-301a-4145-14617d0b8cf5/00606949062927.rgb.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 9
  },
  "Kaytranada": {
    "name": "Kaytranada",
    "nameKo": "Kaytranada",
    "nameEn": "Kaytranada",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/03/bc/17/03bc17d6-c072-b62e-f41f-0d1adc311338/634904076566.png/600x600bb.jpg",
    "trackCount": 2,
    "bpm130_180Count": 1
  },
  "21 Savage": {
    "name": "21 Savage",
    "nameKo": "21 Savage",
    "nameEn": "21 Savage",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/11/36/38/1136384a-eebc-697a-c005-d890e41c0854/21UM1IM07518.rgb.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 15
  },
  "사이먼 도미닉": {
    "name": "사이먼 도미닉",
    "nameKo": "사이먼 도미닉",
    "nameEn": "Simon Dominic",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f8/2b/30/f82b301e-bf2f-6326-ddb4-fde40f1f13b2/cover_cover.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 6
  },
  "f(x)": {
    "name": "f(x)",
    "nameKo": "에프엑스",
    "nameEn": "f(x)",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d4/04/87/d4048786-c120-0be5-69b3-1f0d716833ee/asset.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 3
  },
  "Tyler, The Creator": {
    "name": "Tyler, The Creator",
    "nameKo": "Tyler, The Creator",
    "nameEn": "Tyler, The Creator",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a0/ae/e6/a0aee657-b365-fed2-249c-0f22efa507d0/196873435435.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 9
  },
  "산울림": {
    "name": "산울림",
    "nameKo": "산울림",
    "nameEn": "Sanullim",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/8e/28/c2/8e28c20d-beaf-ffa1-47a9-f922cd73d096/8809259907724.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 14
  },
  "로제": {
    "name": "로제",
    "nameKo": "로제",
    "nameEn": "ROSÉ",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/27/28/6c/27286c0f-ab25-7a89-8b79-fa74a8f4814f/075679559142_cover.jpg/600x600bb.jpg",
    "trackCount": 17,
    "bpm130_180Count": 7
  },
  "Justice": {
    "name": "Justice",
    "nameKo": "저스티스",
    "nameEn": "Simian & Justice",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/d6/23/ca/d623ca0b-a7bf-1837-6b01-484c7e7ca31f/5400863122140_cover.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 1
  },
  "ITZY": {
    "name": "ITZY",
    "nameKo": "있지",
    "nameEn": "ITZY",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/40/b0/1a/40b01aff-1aa6-5dda-4263-00384501ae35/192641939570_Cover.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 9
  },
  "비비": {
    "name": "비비",
    "nameKo": "비비",
    "nameEn": "BIBI",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b1/a6/2c/b1a62cb9-1b70-b6d6-1447-e633e4c5c98d/cover_-_DS.jpg/600x600bb.jpg",
    "trackCount": 3,
    "bpm130_180Count": 2
  },
  "코드 쿤스트": {
    "name": "코드 쿤스트",
    "nameKo": "코드 쿤스트",
    "nameEn": "CODE KUNST",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/81/60/76/816076d1-53f4-8668-ad7d-a4a2e524a066/cover_-.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 3
  },
  "LiSA": {
    "name": "LiSA",
    "nameKo": "리사",
    "nameEn": "LiSA",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ac/c8/12/acc8124b-db53-b4a2-d322-4ea517fc2ecf/196874920299.jpg/600x600bb.jpg",
    "trackCount": 38,
    "bpm130_180Count": 20
  },
  "레드벨벳": {
    "name": "레드벨벳",
    "nameKo": "레드벨벳",
    "nameEn": "Red Velvet",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e1/37/87/e1378701-df90-f521-8afb-206a61def29d/rv_m03_digitalcover_4000x4000.jpg/600x600bb.jpg",
    "trackCount": 45,
    "bpm130_180Count": 22
  },
  "동방신기": {
    "name": "동방신기",
    "nameKo": "동방신기",
    "nameEn": "TVXQ!",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music2/v4/69/68/20/69682031-c238-401d-c58e-90f7bbdf2cb4/TVXQ_COVER_WEB.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 12
  },
  "래원": {
    "name": "래원",
    "nameKo": "래원",
    "nameEn": "Layone",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/2e/db/9b/2edb9bce-24d7-166b-832a-676b6e86c77d/190295303334.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 9
  },
  "QWER": {
    "name": "QWER",
    "nameKo": "QWER",
    "nameEn": "QWER",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/75/54/38/75543853-92c7-064c-fe26-2cbf5eecc6d8/cover_KM0019655_1.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 19
  },
  "레인보우": {
    "name": "레인보우",
    "nameKo": "레인보우",
    "nameEn": "Rainbow",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/bf/1a/5b/bf1a5b20-d51d-3542-855e-3bd39a514426/rs.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 9
  },
  "5 Seconds of Summer": {
    "name": "5 Seconds of Summer",
    "nameKo": "5 Seconds of Summer",
    "nameEn": "5 Seconds of Summer",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/63/d0/7a/63d07a89-bbf8-78af-d886-29e37aed8578/19UMGIM73085.rgb.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 15
  },
  "Sum 41": {
    "name": "Sum 41",
    "nameKo": "Sum 41",
    "nameEn": "Sum 41",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f7/de/77/f7de77ab-506f-0c99-dc80-2fa00ff2d43a/06UMGIM09454.rgb.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 10
  },
  "Fisher": {
    "name": "Fisher",
    "nameKo": "FISHER",
    "nameEn": "FISHER",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/99/f2/f0/99f2f0a4-69e6-468a-8631-8fe86570095d/cover.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 9
  },
  "Charlie Puth": {
    "name": "Charlie Puth",
    "nameKo": "찰리 푸스",
    "nameEn": "Charlie Puth",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/8c/43/3e8c43f6-e02c-09ee-e1ea-56e74590be40/075679583208.jpg/600x600bb.jpg",
    "trackCount": 2,
    "bpm130_180Count": 0
  },
  "Good Charlotte": {
    "name": "Good Charlotte",
    "nameKo": "Good Charlotte",
    "nameEn": "Good Charlotte",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/14/09/55/14095590-b0bd-4d8c-2dc6-866f370e7663/888880383457.jpg/600x600bb.jpg",
    "trackCount": 5,
    "bpm130_180Count": 3
  },
  "Jay-Z": {
    "name": "Jay-Z",
    "nameKo": "Jay-Z",
    "nameEn": "Jay-Z",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/e5/9d/1b/e59d1be3-b4a3-0d16-9d81-f5117cba5925/3700187655181.jpg/600x600bb.jpg",
    "trackCount": 2,
    "bpm130_180Count": 1
  },
  "Mark Ronson": {
    "name": "Mark Ronson",
    "nameKo": "Mark Ronson",
    "nameEn": "Mark Ronson",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/01/de/40/01de40eb-769e-f7f0-2789-3be6d54147af/886446994246.jpg/600x600bb.jpg",
    "trackCount": 1,
    "bpm130_180Count": 0
  },
  "청하": {
    "name": "청하",
    "nameKo": "청하",
    "nameEn": "CHUNG HA",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cd/98/28/cd982868-2402-5a1c-8976-10bb0ccb9eef/8809704415910_Cover.jpg/600x600bb.jpg",
    "trackCount": 42,
    "bpm130_180Count": 13
  },
  "플레이브": {
    "name": "플레이브",
    "nameKo": "플레이브",
    "nameEn": "PLAVE",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/72/6b/4a/726b4a3f-ec07-c604-b570-1b15ee1fe77c/PLAVE_ASTERUM_The_Shape_of_Things_to_Come.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 4
  },
  "윤도현밴드": {
    "name": "윤도현밴드",
    "nameKo": "윤도현밴드",
    "nameEn": "YB",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a4/b8/04/a4b804a0-a2c6-e3ce-ca8c-cd7738208d03/10UMGIM29689.rgb.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 9
  },
  "Maroon 5": {
    "name": "Maroon 5",
    "nameKo": "마룬 5",
    "nameEn": "Maroon 5",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/eb/12/fe/eb12fe62-1e28-ebfd-0daa-f9aa66bbb882/12UMGIM15818.rgb.jpg/600x600bb.jpg",
    "trackCount": 38,
    "bpm130_180Count": 8
  },
  "지누션": {
    "name": "지누션",
    "nameKo": "지누션",
    "nameEn": "Jinusean",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c1/d2/43/c1d24350-f22a-3827-7094-1d7d4de86780/8806197905423.jpg/600x600bb.jpg",
    "trackCount": 7,
    "bpm130_180Count": 3
  },
  "고고스타": {
    "name": "고고스타",
    "nameKo": "고고스타",
    "nameEn": "GoGo Star",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/2d/59/4d/mzi.hahnqmvr.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 31
  },
  "The Wombats": {
    "name": "The Wombats",
    "nameKo": "The Wombats",
    "nameEn": "The Wombats",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/be/3a/7c/be3a7c1c-a50d-4f59-ee71-e6cb1ee787b9/5056167174769_1.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 24
  },
  "Bloc Party": {
    "name": "Bloc Party",
    "nameKo": "Bloc Party",
    "nameEn": "Bloc Party",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1b/0c/e1/1b0ce104-1ad5-01f3-5040-5ed92a5bc4dc/5400863164553_cover.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 23
  },
  "킹스턴 루디스카": {
    "name": "킹스턴 루디스카",
    "nameKo": "킹스턴 루디스카",
    "nameEn": "Kingston Rudieska",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features114/v4/28/69/fc/2869fcc1-06ba-ef4f-8325-5cf9a9de4e14/dj.diidgnia.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 21
  },
  "Cage the Elephant": {
    "name": "Cage the Elephant",
    "nameKo": "Cage the Elephant",
    "nameEn": "Cage the Elephant",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/24/12/c0/2412c0e6-4ba6-5f95-12f6-c932daeb6773/886445478310.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 20
  },
  "Kaiser Chiefs": {
    "name": "Kaiser Chiefs",
    "nameKo": "Kaiser Chiefs",
    "nameEn": "Kaiser Chiefs",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/fe/ec/5e/feec5e74-9d6a-1deb-ae1a-53a94875f446/00602577376931.rgb.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 18
  },
  "Two Door Cinema Club": {
    "name": "Two Door Cinema Club",
    "nameKo": "Two Door Cinema Club",
    "nameEn": "Two Door Cinema Club",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/1a/15/4b/1a154bb0-bece-ce75-a5cf-b4780785dd1a/cover.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 18
  },
  "Foals": {
    "name": "Foals",
    "nameKo": "Foals",
    "nameEn": "Foals",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/51/08/ca/5108ca93-7c84-e999-5750-6bf66e6c94c9/190295005832.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 14
  },
  "버스커 버스커": {
    "name": "버스커 버스커",
    "nameKo": "버스커 버스커",
    "nameEn": "Busker Busker",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/43/d8/6f/43d86fe5-632a-8226-be7c-7b5dee99a461/08809309174588_Cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 13
  },
  "제이레빗": {
    "name": "제이레빗",
    "nameKo": "제이레빗",
    "nameEn": "J Rabbit",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/26/99/d7/2699d781-b047-4161-2ac4-6fd319dbb565/8809704414364_Cover.jpg/600x600bb.jpg",
    "trackCount": 46,
    "bpm130_180Count": 12
  },
  "안녕바다": {
    "name": "안녕바다",
    "nameKo": "안녕바다",
    "nameEn": "Bye Bye Badman",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/c3/13/acc3133e-d666-da9b-5d54-069203348583/cover_KM0021152_1.jpg/600x600bb.jpg",
    "trackCount": 44,
    "bpm130_180Count": 12
  },
  "송골매": {
    "name": "송골매",
    "nameKo": "송골매",
    "nameEn": "Songgolmae",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ea/d4/03/ead403e4-5be6-213e-3839-3822773ecd4e/8806184752979_cover.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 12
  },
  "헤이맨": {
    "name": "헤이맨",
    "nameKo": "헤이맨",
    "nameEn": "HeyMen",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/99/cc/6b/99cc6b16-dcce-1fec-de5f-f888b18af14f/887928019617.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 11
  },
  "러브홀릭스": {
    "name": "러브홀릭스",
    "nameKo": "러브홀릭스",
    "nameEn": "Loveholics",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ed/2e/ea/ed2eea91-8090-0b33-422c-a732dc8c51f5/cover_KM0000311_1.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 10
  },
  "더 픽스": {
    "name": "더 픽스",
    "nameKo": "더 픽스",
    "nameEn": "THE FIX",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ee/7c/27/ee7c27ff-4e02-e768-00e6-27209f8b8aec/191953415260.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 10
  },
  "Bastille": {
    "name": "Bastille",
    "nameKo": "Bastille",
    "nameEn": "Bastille",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/49/b8/d0/49b8d0e4-50b8-69d5-7ffc-b23d4b8151c9/13UABIM58889.rgb.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 10
  },
  "하이파이유니콘": {
    "name": "하이파이유니콘",
    "nameKo": "하이파이유니콘",
    "nameEn": "Hi-Fi Un!corn",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4b/e9/6e/4be96e23-6e07-de5b-a75f-2a427b7ea91c/191953449715.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 9
  },
  "넘버원코리안": {
    "name": "넘버원코리안",
    "nameKo": "넘버원코리안",
    "nameEn": "No.1 Korean",
    "genre": "band",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/27/a0/e3/27a0e30e-4b36-3ac6-5e8f-260601c415cb/4525853028996.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 9
  },
  "코요태": {
    "name": "코요태",
    "nameKo": "코요태",
    "nameEn": "Koyote",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/86/81/c0/8681c0dc-8356-e49f-23d7-56c874f63f37/8806384509236.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 22
  },
  "B1A4": {
    "name": "B1A4",
    "nameKo": "비원에이포",
    "nameEn": "B1A4",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/76/58/9a/76589a99-323b-b2b4-811c-ea4721b59714/cover_KM0004091_1.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 18
  },
  "포미닛": {
    "name": "포미닛",
    "nameKo": "포미닛",
    "nameEn": "4minute",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/00/80/79/0080798c-3ff7-8eb0-d8b5-18d55356b897/KPOP_girl_final_1400.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 18
  },
  "시크릿": {
    "name": "시크릿",
    "nameKo": "시크릿",
    "nameEn": "Secret",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/52/42/33/524233e3-3356-a1ad-bcd1-662957e91621/8804775037009.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 17
  },
  "이정현": {
    "name": "이정현",
    "nameKo": "이정현",
    "nameEn": "이정현",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/32/56/39/32563983-f304-57dd-47e4-111134beff2a/8809856786999.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 17
  },
  "틴탑": {
    "name": "틴탑",
    "nameKo": "틴탑",
    "nameEn": "TEEN TOP",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/a9/da/7f/mzi.frqfasxb.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 16
  },
  "SF9": {
    "name": "SF9",
    "nameKo": "SF9",
    "nameEn": "SF9",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/88/5b/13/885b1318-2c85-fd0c-2d33-3751bc7bd368/8804775128943_cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 15
  },
  "달샤벳": {
    "name": "달샤벳",
    "nameKo": "달샤벳",
    "nameEn": "Dalshabet",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/61/6a/31/616a318b-b819-15f8-2094-1691e2b4e1fd/00602557073799.rgb.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 15
  },
  "터보": {
    "name": "터보",
    "nameKo": "터보",
    "nameEn": "Turbo",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music62/v4/db/eb/55/dbeb5559-721c-2320-dd0c-01e53f54bfcf/asset.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 15
  },
  "클론": {
    "name": "클론",
    "nameKo": "클론",
    "nameEn": "Clon",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e4/dc/5a/e4dc5a1f-fd0b-97e1-ab38-8b886d90ab80/cover_KM0019225_1.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 14
  },
  "싸이": {
    "name": "싸이",
    "nameKo": "싸이",
    "nameEn": "PSY",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/77/a3/98/77a39810-e45e-35de-fe20-dbe809ac789d/8806384535815.jpg/600x600bb.jpg",
    "trackCount": 44,
    "bpm130_180Count": 13
  },
  "현아": {
    "name": "현아",
    "nameKo": "현아",
    "nameEn": "HyunA",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7b/d5/3b/7bd53bd9-426d-356b-212b-ec5d69c6e5da/COVER-.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 13
  },
  "2PM": {
    "name": "2PM",
    "nameKo": "2PM",
    "nameEn": "2PM",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b2/aa/a7/b2aaa707-1913-3d90-96d7-8b9eca8ea96d/2PM_NO5_online_cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 13
  },
  "케플러": {
    "name": "케플러",
    "nameKo": "케플러",
    "nameEn": "Kep1er",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/87/5a/5c/875a5cc5-03f6-6c8b-6f83-375e2ca24660/4547366682786.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 13
  },
  "크레용팝": {
    "name": "크레용팝",
    "nameKo": "크레용팝",
    "nameEn": "Crayon Pop",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b9/15/2d/b9152db0-e1ad-c1cf-e47b-7529f21c4c57/8809596466014.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 12
  },
  "우주소녀": {
    "name": "우주소녀",
    "nameKo": "우주소녀",
    "nameEn": "WJSN",
    "genre": "kpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/4f/3d/a0/4f3da08f-f144-df2c-d77a-4e28ec6a2a36/cover-.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 11
  },
  "Billy Talent": {
    "name": "Billy Talent",
    "nameKo": "Billy Talent",
    "nameEn": "Billy Talent",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0d/38/dc/0d38dc5f-7cb7-4565-4484-3d637fe446a5/mzi.tsbflkqm.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 27
  },
  "Boys Like Girls": {
    "name": "Boys Like Girls",
    "nameKo": "Boys Like Girls",
    "nameEn": "Boys Like Girls",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features/a6/c5/4a/dj.djwihcsv.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 26
  },
  "Foo Fighters": {
    "name": "Foo Fighters",
    "nameKo": "Foo Fighters",
    "nameEn": "Foo Fighters",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/68/f5/86/68f586ca-a375-9965-a864-9e227e77ef5b/884977570328.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 25
  },
  "Taking Back Sunday": {
    "name": "Taking Back Sunday",
    "nameKo": "Taking Back Sunday",
    "nameEn": "Taking Back Sunday",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/42/de/4e/42de4ece-d442-9bbb-7b4b-8a07d1497906/18CRGIM07931.rgb.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 25
  },
  "Panic! At The Disco": {
    "name": "Panic! At The Disco",
    "nameKo": "Panic! At The Disco",
    "nameEn": "Panic! At The Disco",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3b/92/c7/3b92c7e4-92eb-dd0f-68d5-b8b5bd357ec6/075679875136.jpg/600x600bb.jpg",
    "trackCount": 47,
    "bpm130_180Count": 23
  },
  "AFI": {
    "name": "AFI",
    "nameKo": "AFI",
    "nameEn": "AFI",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/cb/54/c7/cb54c78e-f95d-78d5-36fb-4c78b265564a/4050538673746.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 20
  },
  "Pierce the Veil": {
    "name": "Pierce the Veil",
    "nameKo": "Pierce the Veil",
    "nameEn": "Pierce the Veil",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/aa/5c/52/aa5c5296-c051-2c35-5f94-e7b5f3e65e73/00888072397958.rgb.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 20
  },
  "Biffy Clyro": {
    "name": "Biffy Clyro",
    "nameKo": "Biffy Clyro",
    "nameEn": "Biffy Clyro",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2f/9b/1b/2f9b1b0d-1116-5004-8ee4-d506dfd03978/5021732853394.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 20
  },
  "칵스": {
    "name": "칵스",
    "nameKo": "칵스",
    "nameEn": "THE KOXX",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cc/6f/5f/cc6f5fb7-4961-e416-1db0-7ae2d9a857e1/191953012858.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 19
  },
  "Avenged Sevenfold": {
    "name": "Avenged Sevenfold",
    "nameKo": "Avenged Sevenfold",
    "nameEn": "Avenged Sevenfold",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c4/21/00/c42100f9-f329-aad4-7535-9055429efc3f/mzi.tbskuyey.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 19
  },
  "The Used": {
    "name": "The Used",
    "nameKo": "The Used",
    "nameEn": "The Used",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/y2005/m05/d13/h17/s06.iusztotv.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 18
  },
  "New Found Glory": {
    "name": "New Found Glory",
    "nameKo": "New Found Glory",
    "nameEn": "New Found Glory",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/cf/9f/d2/cf9fd2a8-ca67-7f1b-59c3-636448310191/REV199_NewFoundGlory_RGB.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 18
  },
  "Relient K": {
    "name": "Relient K",
    "nameKo": "Relient K",
    "nameEn": "Relient K",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/a3/20/b3/a320b313-878f-692f-c38d-c8b19777f6f6/669447004585.jpg/600x600bb.jpg",
    "trackCount": 22,
    "bpm130_180Count": 18
  },
  "Shinedown": {
    "name": "Shinedown",
    "nameKo": "Shinedown",
    "nameEn": "Shinedown",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/44/d5/3a/44d53a4a-1a8c-d37d-814a-60deb6fa8213/075679762115.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 18
  },
  "락타이거즈": {
    "name": "락타이거즈",
    "nameKo": "락타이거즈",
    "nameEn": "The RockTigers",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features/ef/d3/3a/dj.fiwcgjoo.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 18
  },
  "Kings of Leon": {
    "name": "Kings of Leon",
    "nameKo": "Kings of Leon",
    "nameEn": "Kings of Leon",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/74/25/4c/74254c8b-e03d-44e8-304d-4cde508b8cfb/dj.swemfdrr.jpg/600x600bb.jpg",
    "trackCount": 38,
    "bpm130_180Count": 17
  },
  "Rise Against": {
    "name": "Rise Against",
    "nameKo": "Rise Against",
    "nameEn": "Rise Against",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/87/d3/7e/87d37ee6-ad9c-c676-9239-5f1651780001/00602537898824.rgb.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 17
  },
  "Waterparks": {
    "name": "Waterparks",
    "nameKo": "Waterparks",
    "nameEn": "Waterparks",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/a5/6b/85/a56b8561-6cf4-4db2-37aa-7d24fec8eeb6/075679707239.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 17
  },
  "Mayday Parade": {
    "name": "Mayday Parade",
    "nameKo": "Mayday Parade",
    "nameEn": "Mayday Parade",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/5f/f5/60/mzi.qygavouf.jpg/600x600bb.jpg",
    "trackCount": 21,
    "bpm130_180Count": 17
  },
  "Bowling for Soup": {
    "name": "Bowling for Soup",
    "nameKo": "Bowling for Soup",
    "nameEn": "Bowling for Soup",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/ff/5e/d1/ff5ed122-7748-95af-28ff-ddba80ec5460/mzi.eiaoqtlx.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 17
  },
  "The Hives": {
    "name": "The Hives",
    "nameKo": "The Hives",
    "nameEn": "The Hives",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/37/08/54/37085492-372e-d163-7fbd-17adf4224e1f/5400863186494_cover.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 17
  },
  "Avril Lavigne": {
    "name": "Avril Lavigne",
    "nameKo": "Avril Lavigne",
    "nameEn": "Avril Lavigne",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ef/de/50/efde50f8-4856-1cb4-b869-29a27ed36f79/196871955867.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 16
  },
  "Sleeping With Sirens": {
    "name": "Sleeping With Sirens",
    "nameKo": "Sleeping With Sirens",
    "nameEn": "Sleeping With Sirens",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/28/b3/d6/28b3d6b6-e5a6-cd97-8c6c-0759546d606d/0858721002311.jpg/600x600bb.jpg",
    "trackCount": 23,
    "bpm130_180Count": 16
  },
  "Dropkick Murphys": {
    "name": "Dropkick Murphys",
    "nameKo": "Dropkick Murphys",
    "nameEn": "Dropkick Murphys",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/21/76/c2/2176c2e5-7d74-ee89-648a-2d0443054182/5400863122690_cover.jpg/600x600bb.jpg",
    "trackCount": 19,
    "bpm130_180Count": 16
  },
  "Måneskin": {
    "name": "Måneskin",
    "nameKo": "Måneskin",
    "nameEn": "Måneskin",
    "genre": "rock",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4b/1a/72/4b1a7220-bee2-8664-7153-adffa8d3df1e/886449063819.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 15
  },
  "Central Cee": {
    "name": "Central Cee",
    "nameKo": "Central Cee",
    "nameEn": "Central Cee",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0d/e2/31/0de23199-713c-a145-73f5-be8d30510cb6/196872143188.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 32
  },
  "언에듀케이티드 키드": {
    "name": "언에듀케이티드 키드",
    "nameKo": "언에듀케이티드 키드",
    "nameEn": "UNEDUCATED KID",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/a1/85/49/a18549b4-c5b5-c782-3593-595e1ee8befa/cover_-.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 22
  },
  "Juice WRLD": {
    "name": "Juice WRLD",
    "nameKo": "Juice WRLD",
    "nameEn": "Juice WRLD",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e4/ca/3a/e4ca3a6c-b144-15db-5fdc-62ec22c9b813/18UMGIM30624.rgb.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 19
  },
  "블루": {
    "name": "블루",
    "nameKo": "블루",
    "nameEn": "BLOO",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/49/10/3e/49103e36-ffc3-53c0-976a-1866e16252c5/190295053093.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 16
  },
  "하온": {
    "name": "하온",
    "nameKo": "하온",
    "nameEn": "HAON",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/b9/ca/44/b9ca4462-4197-6ece-c43f-a9a229203e69/5034644289472.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 14
  },
  "염따": {
    "name": "염따",
    "nameKo": "염따",
    "nameEn": "YUMDDA",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7a/c1/1e/7ac11ef5-f53e-d631-b56d-7da4dcf3fe96/888272155013_Cover.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 13
  },
  "XXXTENTACION": {
    "name": "XXXTENTACION",
    "nameKo": "XXXTENTACION",
    "nameEn": "XXXTENTACION",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f0/b0/21/f0b021d2-8bfb-e2ff-93f9-17c64147f971/18UMGIM14845.rgb.jpg/600x600bb.jpg",
    "trackCount": 40,
    "bpm130_180Count": 12
  },
  "키드밀리": {
    "name": "키드밀리",
    "nameKo": "키드밀리",
    "nameEn": "Kid Milli",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/66/a2/ce/66a2ce50-7db7-51bf-3f28-0016480e4a46/cover-Kid_Milli_EP.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 11
  },
  "DJ DOC": {
    "name": "DJ DOC",
    "nameKo": "DJ DOC",
    "nameEn": "DJ DOC",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/82/9d/34/829d342c-021f-8231-f90f-c1bd7be96d18/mzi.gfczhhwq.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 11
  },
  "DPR LIVE": {
    "name": "DPR LIVE",
    "nameKo": "DPR LIVE",
    "nameEn": "DPR LIVE",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c1/82/2c/c1822c0f-d080-dce4-456e-cc2dee5a608b/3b514427-47c5-4f63-85f4-0189d4572e06.png/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 10
  },
  "Ken Carson": {
    "name": "Ken Carson",
    "nameKo": "Ken Carson",
    "nameEn": "Ken Carson",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ca/74/05/ca7405a9-6750-d3fa-310b-589c959542f3/26UMGIM91431.rgb.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 10
  },
  "루피": {
    "name": "루피",
    "nameKo": "루피",
    "nameEn": "Loopy",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/0e/a1/ff/0ea1ffa7-fd9f-813b-624e-1196fe4eb43d/190295053222.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 9
  },
  "SZA": {
    "name": "SZA",
    "nameKo": "SZA",
    "nameEn": "SZA",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/50/fa/17/50fa1760-8a36-5cef-93bf-aab5b5257b18/196871766913.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 8
  },
  "그루비룸": {
    "name": "그루비룸",
    "nameKo": "그루비룸",
    "nameEn": "GroovyRoom",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/17/5d/2e/175d2e28-2874-baf9-6996-a4f20dfb0ac1/cover_KM0019379_1.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 8
  },
  "DPR IAN": {
    "name": "DPR IAN",
    "nameKo": "DPR IAN",
    "nameEn": "DPR IAN",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b0/e4/bf/b0e4bf52-11f9-9e8d-b769-f2624c64caaf/195497394784.jpg/600x600bb.jpg",
    "trackCount": 24,
    "bpm130_180Count": 8
  },
  "Young Thug": {
    "name": "Young Thug",
    "nameKo": "Young Thug",
    "nameEn": "Young Thug",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f5/b6/cb/f5b6cb03-8f8a-0529-16a6-b8cf3ace5555/dj.vftjpvpa.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 8
  },
  "Wiley": {
    "name": "Wiley",
    "nameKo": "Wiley",
    "nameEn": "Wiley",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/34/9c/47/349c4730-e821-c2b4-9ba5-9c5ddb4ef7ff/886447839003.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 8
  },
  "Headie One": {
    "name": "Headie One",
    "nameKo": "Headie One",
    "nameEn": "Headie One",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e9/21/82/e92182fb-b0d0-b39a-7ac7-9ba8fc6533c8/199806381168.jpg/600x600bb.jpg",
    "trackCount": 8,
    "bpm130_180Count": 8
  },
  "양홍원": {
    "name": "양홍원",
    "nameKo": "양홍원",
    "nameEn": "Young B",
    "genre": "hiphop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1d/91/d0/1d91d04e-e509-2d85-72f7-dcffe5359d13/cover-_0601.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 7
  },
  "Macky Gee": {
    "name": "Macky Gee",
    "nameKo": "Macky Gee",
    "nameEn": "Macky Gee",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c2/1f/74/c21f7471-9bd6-a3bf-303d-3e61dea29e0b/cover.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 35
  },
  "Nia Archives": {
    "name": "Nia Archives",
    "nameKo": "Nia Archives",
    "nameEn": "Nia Archives",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c1/6c/d3/c16cd3a3-3ccd-2b26-7438-40abbceb6498/23UM1IM66051.rgb.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 35
  },
  "Scooter": {
    "name": "Scooter",
    "nameKo": "스쿠터",
    "nameEn": "Scooter",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/9b/b7/72/9bb77286-afe8-688f-0255-1072bd255aa1/22UM1IM39581.rgb.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 34
  },
  "Roni Size": {
    "name": "Roni Size",
    "nameKo": "Roni Size",
    "nameEn": "Roni Size",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/1d/5d/83/1d5d8354-aec7-ff0c-3cc1-958650b71900/5060182933416_cover.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 34
  },
  "Grafix": {
    "name": "Grafix",
    "nameKo": "Grafix",
    "nameEn": "Grafix",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/78/92/c7/7892c7c0-58bf-d634-290d-c30dd5ea2d64/5055199569505.png/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 33
  },
  "Delta Heavy": {
    "name": "Delta Heavy",
    "nameKo": "Delta Heavy & Hayley May",
    "nameEn": "Delta Heavy & Hayley May",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/08/a0/95/08a095ad-8f30-49ec-7d33-6b29e71c18d6/5055199566559.png/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 32
  },
  "Andy C": {
    "name": "Andy C",
    "nameKo": "Andy C",
    "nameEn": "Andy C",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/93/a0/71/93a071b4-8af4-7ddc-d565-b8cf9a17b91e/8718522603006.png/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 32
  },
  "Bru-C": {
    "name": "Bru-C",
    "nameKo": "Bru-C & Bou",
    "nameEn": "Bru-C & Bou",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/31/e8/d0/31e8d0a0-67f4-c0da-fa3b-27bfd2a132e6/cover.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 31
  },
  "Tantrum Desire": {
    "name": "Tantrum Desire",
    "nameKo": "Tantrum Desire & Sophie-Grace",
    "nameEn": "Tantrum Desire & Sophie-Grace",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/89/68/43/896843d4-f7e7-3456-2335-6ecb43e4c9b0/3663729426772_cover.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 30
  },
  "K motionz": {
    "name": "K motionz",
    "nameKo": "K Motionz",
    "nameEn": "K Motionz",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/60/09/49/6009496c-c86e-e5b0-9ee5-8bd0fb049652/5055199581392.png/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 30
  },
  "Hedex": {
    "name": "Hedex",
    "nameKo": "Hedex & Eksman",
    "nameEn": "Hedex & Eksman",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4c/fc/c9/4cfcc918-fdf5-0cb4-28b0-20c97638debc/5055199579382.png/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 30
  },
  "Alan Fitzpatrick": {
    "name": "Alan Fitzpatrick",
    "nameKo": "Alan Fitzpatrick & Rebūke",
    "nameEn": "Alan Fitzpatrick & Rebūke",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ef/14/af/ef14afb8-d5cf-dd32-b815-2e8bde5a467c/4062548020496.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 30
  },
  "Amelie Lens": {
    "name": "Amelie Lens",
    "nameKo": "아멜리 렌즈",
    "nameEn": "Charlotte de Witte & Amelie Lens",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/32/d0/f8/32d0f86e-209d-1fcf-d4da-50aad2067a18/199066484890.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 30
  },
  "Sigma": {
    "name": "Sigma",
    "nameKo": "시그마",
    "nameEn": "Sigma",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/6c/10/91/6c109117-a9e1-890c-bb2e-efac81b3f45a/05037128006602.rgb.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 30
  },
  "Bou": {
    "name": "Bou",
    "nameKo": "Bou & DRS",
    "nameEn": "Bou & DRS",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/81/f5/9f/81f59f81-389e-61c9-c9ff-6323666500e0/5056686338161.png/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 30
  },
  "Matrix & Futurebound": {
    "name": "Matrix & Futurebound",
    "nameKo": "Matrix & Futurebound",
    "nameEn": "Matrix & Futurebound",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/6f/8a/e4/6f8ae433-63fa-8220-2949-be1e5f45ebc2/cover.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 29
  },
  "Metrik": {
    "name": "Metrik",
    "nameKo": "Metrik",
    "nameEn": "Metrik",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/0e/ec/1d/0eec1d48-7d97-c4a5-fe65-07eb2be72949/cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 29
  },
  "Charlotte de Witte": {
    "name": "Charlotte de Witte",
    "nameKo": "샬롯 드 비트",
    "nameEn": "Charlotte de Witte",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1c/98/87/1c9887c9-b854-8859-0e95-f318e5b8115d/199538752205.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 29
  },
  "I Hate Models": {
    "name": "I Hate Models",
    "nameKo": "I Hate Models",
    "nameEn": "I Hate Models",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/d7/45/3e/d7453ea0-7d3c-df96-8947-0499f90bda7f/8790001210110.png/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 28
  },
  "Goldie": {
    "name": "Goldie",
    "nameKo": "Goldie",
    "nameEn": "Goldie",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b7/0d/d0/b70dd03f-2762-9a06-c42d-9bccdac9b26d/5060555219925.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 27
  },
  "Sammy Virji": {
    "name": "Sammy Virji",
    "nameKo": "Sammy Virji",
    "nameEn": "Sammy Virji",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1e/3f/24/1e3f24a4-ebc1-4b06-d365-0f0dcf09bcc8/18064.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 27
  },
  "Maduk": {
    "name": "Maduk",
    "nameKo": "Maduk",
    "nameEn": "Maduk",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/35/17/a9/3517a9fb-1406-53e6-a8d6-8b1b7108ea8f/5414165100911.png/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 26
  },
  "Fred V": {
    "name": "Fred V",
    "nameKo": "Fred V",
    "nameEn": "Fred V",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fc/8c/58/fc8c5893-f35a-6a51-170d-90b7cc34cc61/cover.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 26
  },
  "San Holo": {
    "name": "San Holo",
    "nameKo": "San Holo",
    "nameEn": "San Holo",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/da/42/3a/da423a5e-c482-c88b-d27b-0d2d41e3afc2/886446359960.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 26
  },
  "RL Grime": {
    "name": "RL Grime",
    "nameKo": "ISOxo, Knock2, RL Grime & ISOKNOCK",
    "nameEn": "ISOxo, Knock2, RL Grime & ISOKNOCK",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c3/9c/92/c39c924c-bf46-81fc-909f-88d2d170edc5/198588286210.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 26
  },
  "Hybrid Minds": {
    "name": "Hybrid Minds",
    "nameKo": "Hybrid Minds & venbee",
    "nameEn": "Hybrid Minds & venbee",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2b/3f/ab/2b3fab9d-09d9-b9f8-6d2c-2272c3fa0cbb/196871312974.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 25
  },
  "1991": {
    "name": "1991",
    "nameKo": "1991, Mugatu & Mali-Koa",
    "nameEn": "1991, Mugatu & Mali-Koa",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7e/14/ea/7e14eab1-5f32-fd38-ca44-435aac5920e4/5055199578521.png/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 25
  },
  "Goddard.": {
    "name": "Goddard.",
    "nameKo": "venbee & goddard.",
    "nameEn": "venbee & goddard.",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/63/de/f2/63def2c1-3ea9-8f93-0618-1064ab1b8917/196589414793.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 24
  },
  "Reinier Zonneveld": {
    "name": "Reinier Zonneveld",
    "nameKo": "Angerfist & Reinier Zonneveld",
    "nameEn": "Angerfist & Reinier Zonneveld",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/00/e2/87/00e2872b-c974-ac55-1b65-112c17d8623f/cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 24
  },
  "Fox Stevenson": {
    "name": "Fox Stevenson",
    "nameKo": "Fox Stevenson",
    "nameEn": "Fox Stevenson",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/85/6f/f4/856ff49a-1ccb-60e1-a04d-409e822d9daa/cover.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 24
  },
  "Shy FX": {
    "name": "Shy FX",
    "nameKo": "Shy FX & KINGH",
    "nameEn": "Shy FX & KINGH",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ea/4c/c6/ea4cc607-dfed-200f-2509-8bb9b9c33544/8567.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 24
  },
  "Adam Beyer": {
    "name": "Adam Beyer",
    "nameKo": "Adam Beyer",
    "nameEn": "Adam Beyer",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/38/2c/49/382c493a-e316-fade-0562-d130838a0af5/5060191685276.jpg/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 24
  },
  "Salute": {
    "name": "Salute",
    "nameKo": "salute & Sam Gellaitry",
    "nameEn": "salute & Sam Gellaitry",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/43/34/df4334f4-b599-a2aa-0af3-779288222e13/5054429192650.png/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 24
  },
  "High Contrast": {
    "name": "High Contrast",
    "nameKo": "Overmono & High Contrast",
    "nameEn": "Overmono & High Contrast",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/40/51/14/40511408-2b64-8e4c-065f-0158e118d0d0/191404158777.png/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 23
  },
  "Overmono": {
    "name": "Overmono",
    "nameKo": "Overmono",
    "nameEn": "Overmono",
    "genre": "edm",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/86/3d/70/863d70d2-d67f-ddf6-7e11-0e349de51cb5/191404125755.png/600x600bb.jpg",
    "trackCount": 32,
    "bpm130_180Count": 23
  },
  "Walk the Moon": {
    "name": "Walk the Moon",
    "nameKo": "Walk the Moon",
    "nameEn": "Walk the Moon",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/bf/b6/76/bfb67621-b78d-3924-6d29-4f367697a674/886445045758.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 10
  },
  "Pitbull": {
    "name": "Pitbull",
    "nameKo": "Pitbull",
    "nameEn": "Pitbull",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/fc/57/da/fc57da34-d446-924b-f67e-478dced0471f/11UMGIM10443.rgb.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 8
  },
  "Billy Joel": {
    "name": "Billy Joel",
    "nameKo": "Billy Joel",
    "nameEn": "Billy Joel",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f0/7a/54/f07a54ab-3ebc-6813-e515-86200b8138fc/dj.uthntyfe.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 8
  },
  "Ava Max": {
    "name": "Ava Max",
    "nameKo": "Ava Max",
    "nameEn": "Ava Max",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/94/74/1e/94741ee9-bb3c-4c9f-da27-e04d9878faae/075679797032.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 7
  },
  "Foster the People": {
    "name": "Foster the People",
    "nameKo": "Foster the People",
    "nameEn": "Foster the People",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/43/20/e1/4320e1a5-9bfc-7071-5d13-e481b0fe4d73/886449765355.jpg/600x600bb.jpg",
    "trackCount": 21,
    "bpm130_180Count": 6
  },
  "Sigrid": {
    "name": "Sigrid",
    "nameKo": "Sigrid",
    "nameEn": "Sigrid",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ce/11/73/ce117363-e49a-cf80-ae1d-3370220eaa2e/00602567796565.rgb.jpg/600x600bb.jpg",
    "trackCount": 15,
    "bpm130_180Count": 6
  },
  "Jessie J": {
    "name": "Jessie J",
    "nameKo": "Jessie J",
    "nameEn": "Jessie J",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/72/ac/d4/72acd44a-f267-0fcb-111c-9f15ff04eaf2/11UMGIM04475.rgb.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 6
  },
  "Ellie Goulding": {
    "name": "Ellie Goulding",
    "nameKo": "Ellie Goulding",
    "nameEn": "Ellie Goulding",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/99/48/f6/9948f600-7cfb-1c09-b8f7-b390557f0e30/13UAAIM44623.rgb.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 6
  },
  "Flo Rida": {
    "name": "Flo Rida",
    "nameKo": "Flo Rida",
    "nameEn": "Flo Rida",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/02/f9/d3/02f9d3c2-fac8-73ba-82a2-bdd89160f8d1/mzi.rhxlrorf.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 5
  },
  "The 1975": {
    "name": "The 1975",
    "nameKo": "The 1975",
    "nameEn": "The 1975",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8c/7f/98/8c7f9860-fea6-e34b-3b4b-ccf3f9408d60/15UMGIM75912.rgb.jpg/600x600bb.jpg",
    "trackCount": 18,
    "bpm130_180Count": 5
  },
  "Kim Petras": {
    "name": "Kim Petras",
    "nameKo": "Kim Petras",
    "nameEn": "Kim Petras",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d3/0c/8f/d30c8f09-66db-8c4e-2583-32c4eb0de432/820233450478.jpg/600x600bb.jpg",
    "trackCount": 16,
    "bpm130_180Count": 5
  },
  "One Direction": {
    "name": "One Direction",
    "nameKo": "One Direction",
    "nameEn": "One Direction",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/38/c9/fe/mzi.fqhrvkfe.jpg/600x600bb.jpg",
    "trackCount": 14,
    "bpm130_180Count": 5
  },
  "Madison Beer": {
    "name": "Madison Beer",
    "nameKo": "Madison Beer",
    "nameEn": "Madison Beer",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ba/89/88/ba898843-6983-e917-5652-4eb42e453730/810520030353_1.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 5
  },
  "Harry Styles": {
    "name": "Harry Styles",
    "nameKo": "Harry Styles",
    "nameEn": "Harry Styles",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 5
  },
  "Passion Pit": {
    "name": "Passion Pit",
    "nameKo": "Passion Pit",
    "nameEn": "Passion Pit",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music5/v4/de/d7/5b/ded75b5d-109b-f4f6-d115-c88f6dc1c9d1/dj.uxvrmwct.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 5
  },
  "Christina Aguilera": {
    "name": "Christina Aguilera",
    "nameKo": "Christina Aguilera",
    "nameEn": "Christina Aguilera",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/48/54/c8/4854c8db-36ed-4c5b-3c09-9739b570d93e/dj.gctnwros.jpg/600x600bb.jpg",
    "trackCount": 9,
    "bpm130_180Count": 5
  },
  "Elton John": {
    "name": "Elton John",
    "nameKo": "Elton John",
    "nameEn": "Elton John",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/f1/2a/0a/f12a0a94-5c3f-82d7-4faf-38873cbf77fe/06UMGIM01420.rgb.jpg/600x600bb.jpg",
    "trackCount": 8,
    "bpm130_180Count": 5
  },
  "Black Eyed Peas": {
    "name": "Black Eyed Peas",
    "nameKo": "Black Eyed Peas",
    "nameEn": "Black Eyed Peas",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/17/45/fb/1745fb6d-43a4-67ab-e3fd-44c51dad40af/24UM1IM21431.rgb.jpg/600x600bb.jpg",
    "trackCount": 41,
    "bpm130_180Count": 4
  },
  "Benson Boone": {
    "name": "Benson Boone",
    "nameKo": "Benson Boone",
    "nameEn": "Benson Boone",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/da/ff/1d/daff1d17-e855-5f95-c665-8d196811b26a/5059460402768.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 4
  },
  "Jonas Brothers": {
    "name": "Jonas Brothers",
    "nameKo": "Jonas Brothers",
    "nameEn": "Jonas Brothers",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f5/2c/95/f52c956b-564b-2f74-0940-93bda90637ff/20UMGIM01182.rgb.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 4
  },
  "Demi Lovato": {
    "name": "Demi Lovato",
    "nameKo": "Demi Lovato",
    "nameEn": "Demi Lovato",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/5a/47/e0/5a47e034-5b53-49dc-642f-7a6d8bc88c99/17UM1IM22208.rgb.jpg/600x600bb.jpg",
    "trackCount": 13,
    "bpm130_180Count": 4
  },
  "MARINA": {
    "name": "MARINA",
    "nameKo": "MARINA",
    "nameEn": "MARINA",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a5/c6/67/a5c667cc-c8ac-cec4-ef32-146488dbcede/4099964156188.jpg/600x600bb.jpg",
    "trackCount": 12,
    "bpm130_180Count": 4
  },
  "MØ": {
    "name": "MØ",
    "nameKo": "MØ",
    "nameEn": "MØ",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/69/ce/59/69ce59c0-8496-6b75-91fb-097e9c0852cf/dj.uyycdgnb.jpg/600x600bb.jpg",
    "trackCount": 11,
    "bpm130_180Count": 4
  },
  "LAUV": {
    "name": "LAUV",
    "nameKo": "LAUV",
    "nameEn": "LAUV",
    "genre": "pop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c4/4f/4f/c44f4f01-e9be-ce4e-5519-f337c3322e48/5056167100188_Cover.jpg/600x600bb.jpg",
    "trackCount": 8,
    "bpm130_180Count": 4
  },
  "KEYTALK": {
    "name": "KEYTALK",
    "nameKo": "KEYTALK",
    "nameEn": "KEYTALK",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/44/18/99/4418992a-955a-fb0f-0acd-2e67f760cd47/VEATP-33828.jpg/600x600bb.jpg",
    "trackCount": 43,
    "bpm130_180Count": 35
  },
  "Frederic": {
    "name": "Frederic",
    "nameKo": "Frederic",
    "nameEn": "Frederic",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b9/ba/09/b9ba092b-03b4-d3c0-a818-13f1ff8c714d/25UMGIM92926.rgb.jpg/600x600bb.jpg",
    "trackCount": 45,
    "bpm130_180Count": 29
  },
  "SHISHAMO": {
    "name": "SHISHAMO",
    "nameKo": "SHISHAMO",
    "nameEn": "SHISHAMO",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/9f/ca/2c9fca90-fa8a-abfb-9397-284e80610ac5/18UMGIM02603.rgb.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 26
  },
  "coldrain": {
    "name": "coldrain",
    "nameKo": "coldrain",
    "nameEn": "coldrain",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/b9/01/e8/b901e893-2c3d-7826-89dc-15fe156a38fb/190295753337.jpg/600x600bb.jpg",
    "trackCount": 39,
    "bpm130_180Count": 26
  },
  "DECO*27": {
    "name": "DECO*27",
    "nameKo": "데코니나",
    "nameEn": "DECO*27",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/39/76/6c/39766c80-c1b8-6e9a-edea-3ee7423448d6/4511820-60460.jpg/600x600bb.jpg",
    "trackCount": 37,
    "bpm130_180Count": 25
  },
  "Polkadot Stingray": {
    "name": "Polkadot Stingray",
    "nameKo": "Polkadot Stingray",
    "nameEn": "Polkadot Stingray",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/e0/3f/f5/e03ff5fb-d927-cbe8-9693-8c8815886206/00602567056188.rgb.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 24
  },
  "BAND-MAID": {
    "name": "BAND-MAID",
    "nameKo": "밴드메이드",
    "nameEn": "BAND-MAID",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/bf/a6/8c/bfa68c6e-9a25-4e61-3379-9a56e04dd481/CRCP-40547.jpg/600x600bb.jpg",
    "trackCount": 35,
    "bpm130_180Count": 23
  },
  "Kyary Pamyu Pamyu": {
    "name": "Kyary Pamyu Pamyu",
    "nameKo": "캬리 파뮤파뮤",
    "nameEn": "Kyary Pamyu Pamyu",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/c3/c2/74/c3c27415-53f1-3957-beb9-c93b2d881cd3/825646432158.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 23
  },
  "XG": {
    "name": "XG",
    "nameKo": "엑스지",
    "nameEn": "XG",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ae/69/ce/ae69ce7b-6007-c83a-f692-93ebfca55449/ANTCD-A0000014930.jpg/600x600bb.jpg",
    "trackCount": 33,
    "bpm130_180Count": 21
  },
  "L'Arc-en-Ciel": {
    "name": "L'Arc-en-Ciel",
    "nameKo": "L'Arc-en-Ciel",
    "nameEn": "L'Arc-en-Ciel",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/61/83/7e/61837ede-1a43-5b35-70c2-b166713488da/jacket_KSCL00641B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 21
  },
  "syudou": {
    "name": "syudou",
    "nameKo": "슈도",
    "nameEn": "syudou",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/19/9b/03/199b0378-0cc2-12b6-68d0-745c2503ca53/25UMGIM91994.rgb.jpg/600x600bb.jpg",
    "trackCount": 31,
    "bpm130_180Count": 20
  },
  "FLOW": {
    "name": "FLOW",
    "nameKo": "FLOW",
    "nameEn": "FLOW",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7b/4e/c8/7b4ec8e2-f94a-d3b5-b760-b9652635fa54/jacket_KSXX01423B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 20
  },
  "ClariS": {
    "name": "ClariS",
    "nameKo": "클라리스",
    "nameEn": "ClariS",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/cc/33/c3/cc33c3bd-c35d-96dd-d767-30d6f749a892/jacket_SEXX00771B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 25,
    "bpm130_180Count": 20
  },
  "ano": {
    "name": "ano",
    "nameKo": "아노",
    "nameEn": "ano",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/40/32/a7/4032a717-1c72-61cf-1579-ab7922937c8c/TFDS-00914WW.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 19
  },
  "Stereopony": {
    "name": "Stereopony",
    "nameKo": "스테레오포니",
    "nameEn": "Stereopony",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/28/c8/9a/28c89af7-f735-d4d4-4d0e-e8ac9fb92b6c/jacket_SRCL07992B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 20,
    "bpm130_180Count": 19
  },
  "THE ORAL CIGARETTES": {
    "name": "THE ORAL CIGARETTES",
    "nameKo": "THE ORAL CIGARETTES",
    "nameEn": "THE ORAL CIGARETTES",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c9/7c/4a/c97c4a3a-ad72-8ff8-7f3e-74deee036fcb/25UMGIM94038.rgb.jpg/600x600bb.jpg",
    "trackCount": 34,
    "bpm130_180Count": 18
  },
  "Sakanaction": {
    "name": "Sakanaction",
    "nameKo": "사카낙션",
    "nameEn": "Sakanaction",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/05/c2/69/05c269d6-377b-7a00-965a-215a8e51b831/VEATP-32901.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 18
  },
  "Aimer": {
    "name": "Aimer",
    "nameKo": "에메",
    "nameEn": "Aimer",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2e/ad/17/2ead1736-2f1b-bd98-5507-030eff37eb99/4560429725930.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 17
  },
  "SiM": {
    "name": "SiM",
    "nameKo": "SiM",
    "nameEn": "SiM",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/63/9d/b0/639db01d-bd15-12d7-92e5-f122ff4bf271/PCSP_03885_A.jpg/600x600bb.jpg",
    "trackCount": 36,
    "bpm130_180Count": 16
  },
  "Tokyo Jihen": {
    "name": "Tokyo Jihen",
    "nameKo": "도쿄지헨",
    "nameEn": "Tokyo Jihen",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/c5/b9/57/c5b95716-0344-d729-6bc8-e93e3079fce0/00600406797841.rgb.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 16
  },
  "GRe4N BOYZ": {
    "name": "GRe4N BOYZ",
    "nameKo": "그린 보이즈",
    "nameEn": "GRe4N BOYZ",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a7/9b/88/a79b8830-7054-2100-8092-475e1ec8de5a/26UMGIM29921.rgb.jpg/600x600bb.jpg",
    "trackCount": 27,
    "bpm130_180Count": 16
  },
  "ATARASHII GAKKO!": {
    "name": "ATARASHII GAKKO!",
    "nameKo": "새로운 학교의 리더즈",
    "nameEn": "ATARASHII GAKKO!",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fb/d3/77/fbd3772b-701a-53e2-3af8-fea7d3ab65e8/4580555285481_cover.jpg/600x600bb.jpg",
    "trackCount": 26,
    "bpm130_180Count": 16
  },
  "04 Limited Sazabys": {
    "name": "04 Limited Sazabys",
    "nameKo": "04 Limited Sazabys",
    "nameEn": "04 Limited Sazabys",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/83/33/bc/8333bc93-876d-f6c4-d0bd-ce131f257bce/COKM-32348.jpg/600x600bb.jpg",
    "trackCount": 61,
    "bpm130_180Count": 15
  },
  "Sheena Ringo": {
    "name": "Sheena Ringo",
    "nameKo": "시이나 링고",
    "nameEn": "Sheena Ringo",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e3/f9/ca/e3f9caba-aa62-c6ee-4552-60246d2bf442/00602567661559.rgb.jpg/600x600bb.jpg",
    "trackCount": 30,
    "bpm130_180Count": 15
  },
  "GARNiDELiA": {
    "name": "GARNiDELiA",
    "nameKo": "가르니델리아",
    "nameEn": "GARNiDELiA",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/60/de/3a/60de3a1c-58fc-c7c9-b7dd-1e6d03339cc7/jacket_VVCL01298B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 29,
    "bpm130_180Count": 15
  },
  "Survive Said The Prophet": {
    "name": "Survive Said The Prophet",
    "nameKo": "서바이브 세드 더 프로핏",
    "nameEn": "Survive Said The Prophet",
    "genre": "jpop",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ed/7a/86/ed7a864c-4074-d971-e494-bb914abd5641/jacket_SRXX02875B00Z_550.jpg/600x600bb.jpg",
    "trackCount": 28,
    "bpm130_180Count": 15
  }
};
