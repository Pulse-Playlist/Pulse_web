import { GenreTag, Song } from '@/types/song';

export interface ArtistNode {
  name: string;
  nameKo: string;
  nameEn: string;
  genre: GenreTag;
  coverUrl: string;
  trackCount: number;
  bpm130_180Count: number;
  related: string[];
}

/**
 * Curated Spotify-style artist similarity graph across all 4 genres (`band`, `kpop`, `rock`, `hiphop`).
 * Selecting any artist reveals its connected cluster of stylistically similar artists.
 */
export const ARTIST_SIMILARITY_CLUSTERS: Record<string, string[]> = {
  // === BAND ===
  'DAY6': ['루시', 'QWER', '엔플라잉', '엑스디너리 히어로즈', '원위', 'FT아일랜드', '씨엔블루', '더 로즈'],
  'QWER': ['DAY6', '루시', '터치드', '유다빈밴드', '드래곤포니', '페퍼톤스', '엔플라잉', '롤링쿼츠'],
  '루시': ['DAY6', 'QWER', '페퍼톤스', '터치드', '유다빈밴드', '소란', '원위', '호피폴라'],
  '실리카겔': ['잔나비', '새소년', '혁오', '한로로', 'SURL', '나상현씨밴드', '라쿠나', '글렌체크'],
  '잔나비': ['실리카겔', '혁오', '검정치마', '산울림', '들국화', '브로콜리너마저', '언니네 이발관', '델리스파이스'],
  '엔플라잉': ['DAY6', 'FT아일랜드', '씨엔블루', 'QWER', '루시', '엑스디너리 히어로즈', '원위', '딕펑스'],
  '터치드': ['유다빈밴드', '루시', 'QWER', '드래곤포니', '데이브레이크', '몽니', '국카스텐', '자우림'],
  '유다빈밴드': ['터치드', '루시', 'QWER', '페퍼톤스', '소란', '드래곤포니', '나상현씨밴드', '극동아시아타이거즈'],
  '페퍼톤스': ['루시', '소란', '유다빈밴드', '데이브레이크', '솔루션스', '글렌체크', '스텔라장', '브로콜리너마저'],
  '소란': ['페퍼톤스', '데이브레이크', '10CM', '딕펑스', '루시', '나상현씨밴드', '유다빈밴드'],
  '한로로': ['실리카겔', '새소년', '유다빈밴드', '터치드', '보수동쿨러', '세이수미', '검정치마', '더 발룬티어스'],
  '혁오': ['검정치마', '잔나비', '실리카겔', '새소년', '카더가든', '장기하와 얼굴들', 'wave to earth', 'SURL'],
  '새소년': ['실리카겔', '혁오', '한로로', '더 발룬티어스', '백예린', 'SURL', '보수동쿨러'],
  '드래곤포니': ['터치드', '유다빈밴드', '루시', 'QWER', '실리카겔', 'SURL', '나상현씨밴드'],
  '엑스디너리 히어로즈': ['DAY6', '엔플라잉', '원위', '드림캐쳐', 'QWER', '루시'],
  '극동아시아타이거즈': ['크라잉넛', '노브레인', '유다빈밴드', '나상현씨밴드', '보수동쿨러', '전기뱀장어', '세이수미'],
  '언니네 이발관': ['델리스파이스', '브로콜리너마저', '검정치마', '잔나비', '산울림', '실리카겔'],
  '델리스파이스': ['언니네 이발관', '브로콜리너마저', '크라잉넛', '산울림', '페퍼톤스', '장기하와 얼굴들'],
  '글렌체크': ['솔루션스', '실리카겔', '아도이', '페퍼톤스', '클래지콰이', '롤러코스터'],

  // === K-POP ===
  'NewJeans': ['아일릿', 'LE SSERAFIM', 'IVE', 'aespa', '리센느', '키스오브라이프', '투어스', '보이넥스트도어'],
  '아일릿': ['NewJeans', '리센느', '투어스', '피프티피프티', 'IVE', 'LE SSERAFIM', 'STAYC', '프로미스나인'],
  '리센느': ['아일릿', '피프티피프티', '트리플에스', '키스오브라이프', 'STAYC', 'NewJeans', '우아', '하이키'],
  'aespa': ['IVE', 'LE SSERAFIM', '(여자)아이들', 'ITZY', '엔믹스', '베이비몬스터', 'BLACKPINK', '키스오브라이프'],
  'IVE': ['aespa', 'LE SSERAFIM', 'NewJeans', 'STAYC', '아일릿', '프로미스나인', '아이즈원', '권은비'],
  'LE SSERAFIM': ['NewJeans', 'IVE', 'aespa', '아일릿', '키스오브라이프', '(여자)아이들', '아이즈원', '최예나'],
  '투어스': ['보이넥스트도어', '라이즈', '제로베이스원', '세븐틴', '아일릿', '플레이브', '엔시티 위시'],
  '보이넥스트도어': ['투어스', '라이즈', '제로베이스원', '지코', '세븐틴', '플레이브', '엔하이픈'],
  '라이즈': ['보이넥스트도어', '투어스', '제로베이스원', 'NCT 127', 'NCT DREAM', '샤이니', 'EXO'],
  '세븐틴': ['투어스', '보이넥스트도어', '방탄소년단', 'Stray Kids', '투모로우바이투게더', 'ENHYPEN', 'NCT DREAM'],
  '방탄소년단': ['세븐틴', 'Stray Kids', '투모로우바이투게더', 'ENHYPEN', 'ATEEZ', '정국', '빅뱅'],
  'Stray Kids': ['ATEEZ', 'ENHYPEN', '투모로우바이투게더', '세븐틴', '방탄소년단', '더보이즈', '몬스타엑스'],
  '투모로우바이투게더': ['ENHYPEN', '보이넥스트도어', '투어스', '세븐틴', 'Stray Kids', '방탄소년단', '플레이브'],
  'TWICE': ['레드벨벳', 'BLACKPINK', '여자친구', '오마이걸', 'ITZY', 'STAYC', '소녀시대', '카라'],
  'BLACKPINK': ['2NE1', 'aespa', '제니', '로제', '베이비몬스터', '(여자)아이들', 'LE SSERAFIM', '빅뱅'],
  '소녀시대': ['카라', '원더걸스', '티아라', 'f(x)', '에이핑크', '걸스데이', '태연', 'TWICE'],
  '카라': ['소녀시대', '티아라', '레인보우', '걸스데이', '씨스타', '원더걸스', '오렌지캬라멜', '인피니트'],
  '빅뱅': ['2NE1', '지드래곤', '태양', '블락비', '위너', '아이콘', '샤이니', '방탄소년단'],
  '샤이니': ['EXO', '인피니트', '하이라이트', '슈퍼주니어', '동방신기', '라이즈', 'f(x)', '태민'],
  '아이유': ['태연', '볼빨간사춘기', 'AKMU', '백예린', '청하', '선미', '로제', '정은지'],
  '플레이브': ['투어스', '보이넥스트도어', '제로베이스원', '세븐틴', '투모로우바이투게더', 'QWER', 'DAY6'],
  '드림캐쳐': ['엔믹스', '최예나', 'ATEEZ', '엑스디너리 히어로즈', 'QWER', '유니스'],

  // === ROCK ===
  '국카스텐': ['쏜애플', '넬', '윤도현밴드', '자우림', '체리필터', '로맨틱펀치', '피아', '시나위'],
  '쏜애플': ['국카스텐', '넬', '실리카겔', '터치드', '로맨틱펀치', '브로큰 발렌타인', '자우림'],
  '크라잉넛': ['노브레인', '극동아시아타이거즈', '갤럭시 익스프레스', '레이지본', '타카피', '로맨틱펀치', '자우림'],
  '노브레인': ['크라잉넛', '극동아시아타이거즈', '갤럭시 익스프레스', '체리필터', '타카피', '레이지본', '윤도현밴드'],
  '자우림': ['체리필터', '국카스텐', '윤도현밴드', '넬', '크라잉넛', '노브레인', '터치드'],
  '체리필터': ['자우림', '로맨틱펀치', '노브레인', '크라잉넛', '트랜스픽션', '익스', '럼블피쉬'],
  '버즈': ['플라워', '야다', '네미시스', '부활', '김경호', '박완규', 'FT아일랜드', '이브'],
  '서태지와 아이들': ['서태지', '넥스트', '신해철', '피아', '크래쉬', '노바소닉', '김사랑'],
  'ONE OK ROCK': ['MY FIRST STORY', 'UVERworld', 'MAN WITH A MISSION', 'ELLEGARDEN', 'SPYAIR', 'Linkin Park', 'Fall Out Boy', 'Sum 41'],
  'Mrs. GREEN APPLE': ['Official HIGE DANdism', 'Vaundy', 'YOASOBI', 'King Gnu', 'RADWIMPS', 'back number', 'BUMP OF CHICKEN'],
  'YOASOBI': ['Mrs. GREEN APPLE', 'Vaundy', 'Ado', 'ZUTOMAYO', 'Yorushika', 'Kenshi Yonezu', 'Official HIGE DANdism'],
  'Green Day': ['Blink-182', 'Sum 41', 'The Offspring', 'My Chemical Romance', 'Simple Plan', 'Fall Out Boy', 'Good Charlotte'],
  'Linkin Park': ['Bring Me The Horizon', 'Muse', 'My Chemical Romance', 'Fall Out Boy', 'Three Days Grace', 'Skillet', 'Papa Roach', 'ONE OK ROCK'],
  'Oasis': ['Blur', 'Coldplay', 'Arctic Monkeys', 'The Strokes', 'The Killers', 'Radiohead', 'Queen', 'U2'],
  'Queen': ['Bon Jovi', 'AC/DC', "Guns N' Roses", 'Oasis', 'Coldplay', 'Muse', 'Aerosmith'],

  // === HIP-HOP ===
  '에픽하이': ['다이나믹 듀오', '리쌍', '프라이머리', '버벌진트', '드렁큰 타이거', '사이먼 도미닉', '지코', '빈지노'],
  '다이나믹 듀오': ['에픽하이', '리쌍', '슈프림팀', '프라이머리', '개코', '최자', '배치기', '지누션'],
  '리쌍': ['다이나믹 듀오', '에픽하이', '드렁큰 타이거', '윤미래', '개리', '프리스타일', 'MC몽', '바비킴'],
  '빈지노': ['더 콰이엇', '도끼', '사이먼 도미닉', '프라이머리', '창모', '코드 쿤스트', '지코', '자이언티'],
  '박재범': ['식케이', 'pH-1', '로꼬', '그레이', '사이먼 도미닉', '코드 쿤스트', '지코', '창모'],
  '창모': ['ASH ISLAND', '릴러말즈', '토일', '호미들', '폴블랑코', '빈지노', '더 콰이엇', '지코'],
  '지코': ['박재범', '크러쉬', '딘', '비오', '이영지', '에픽하이', '다이나믹 듀오', '보이넥스트도어'],
  '이영지': ['지코', '비오', '래원', '미란이', '머쉬베놈', '박재범', '코드 쿤스트', '비비'],
  'Eminem': ['Dr. Dre', '50 Cent', 'Snoop Dogg', 'Kendrick Lamar', 'Kanye West', 'Jay-Z', 'Nas', 'J. Cole'],
  'Kendrick Lamar': ['J. Cole', 'Kanye West', 'Travis Scott', 'Drake', 'Eminem', 'Tyler, The Creator', 'A$AP Rocky', 'Baby Keem'],
  'Travis Scott': ['Playboi Carti', 'Lil Uzi Vert', 'Future', 'Metro Boomin', '21 Savage', 'Don Toliver', 'Yeat', 'Kanye West'],
};

/**
 * Featured seed artists shown initially before the user taps any bubble.
 */
export const INITIAL_SEED_ARTISTS: Record<GenreTag, string[]> = {
  band: ['DAY6', 'QWER', '루시', '실리카겔', '잔나비', '터치드', '유다빈밴드', '엔플라잉', '페퍼톤스', '한로로', '혁오', '새소년', '드래곤포니', '극동아시아타이거즈'],
  kpop: ['NewJeans', '아일릿', 'aespa', 'IVE', 'LE SSERAFIM', '리센느', '투어스', '보이넥스트도어', '세븐틴', '방탄소년단', 'Stray Kids', 'TWICE', 'BLACKPINK', '소녀시대', '카라', '빅뱅', '샤이니', '플레이브'],
  rock: ['국카스텐', '쏜애플', '크라잉넛', '노브레인', '자우림', '체리필터', '버즈', '서태지와 아이들', 'ONE OK ROCK', 'Mrs. GREEN APPLE', 'YOASOBI', 'Green Day', 'Linkin Park', 'Oasis', 'Queen'],
  hiphop: ['에픽하이', '다이나믹 듀오', '리쌍', '빈지노', '박재범', '창모', '지코', '이영지', '비와이', '기리보이', 'Eminem', 'Kendrick Lamar', 'Travis Scott', 'Post Malone'],
};

const ARTIST_ALIAS_TO_CANON: Record<string, string> = {
  '데이식스': 'DAY6',
  'day6': 'DAY6',
  '아이브': 'IVE',
  'ive': 'IVE',
  '(여자)아이들': '(여자)아이들',
  '(g)i-dle': '(여자)아이들',
  'i-dle': '(여자)아이들',
  '아이들': '(여자)아이들',
  '투어스': '투어스',
  'tws': '투어스',
  '보이넥스트도어': '보이넥스트도어',
  'boynextdoor': '보이넥스트도어',
  '제로베이스원': '제로베이스원',
  'zerobaseone': '제로베이스원',
  '라이즈': '라이즈',
  'riize': '라이즈',
  '더 로즈': '더 로즈',
  'the rose': '더 로즈',
  '설': 'SURL',
  'surl': 'SURL',
  '엘르가든': 'ELLEGARDEN',
  'ellegarden': 'ELLEGARDEN',
  '스파이웨어': 'SPYAIR',
  'spyair': 'SPYAIR',
  '비와이': '비와이',
  'bewhy': '비와이',
  '그루비룸': '그루비룸',
  'groovyroom': '그루비룸',
  '기리보이': '기리보이',
  'giriboy': '기리보이',
  '염따': '염따',
  'yumdda': '염따',
  '프라이머리': '프라이머리',
  'primary': '프라이머리',
  '어반자카파': '어반자카파',
  'urban zakapa': '어반자카파',
  'f(x)': 'f(x)',
  '에프엑스': 'f(x)',
  '러브홀릭': '러브홀릭스',
  '러브홀릭스': '러브홀릭스',
  'loveholics': '러브홀릭스',
  '뉴진스': 'NewJeans',
  'newjeans': 'NewJeans',
  '에스파': 'aespa',
  '르세라핌': 'LE SSERAFIM',
  'le sserafim': 'LE SSERAFIM',
  '스테이씨': 'STAYC',
  'stayc': 'STAYC',
  '있지': 'ITZY',
  'itzy': 'ITZY',
  '스트레이 키즈': 'Stray Kids',
  'stray kids': 'Stray Kids',
  '엔하이픈': 'ENHYPEN',
  'enhypen': 'ENHYPEN',
  '에이티즈': 'ATEEZ',
  'ateez': 'ATEEZ',
  '트레저': 'TREASURE',
  'treasure': 'TREASURE',
  '블랙핑크': 'BLACKPINK',
  'blackpink': 'BLACKPINK',
  '트와이스': 'TWICE',
  'twice': 'TWICE',
  '엑소': 'EXO',
  'exo': 'EXO',
  '갓세븐': 'GOT7',
  'got7': 'GOT7',
  '악뮤': 'AKMU',
  'akmu': 'AKMU',
  '십센치': '10CM',
  '10cm': '10CM',
  '웨이브투어스': 'wave to earth',
  'wave to earth': 'wave to earth',
  '래드윔프스': 'RADWIMPS',
  'radwimps': 'RADWIMPS',
  '미세스 그린 애플': 'Mrs. GREEN APPLE',
  'mrs. green apple': 'Mrs. GREEN APPLE',
  '오피셜히게단디즘': 'Official HIGE DANdism',
  'official hige dandism': 'Official HIGE DANdism',
  '범프 오브 치킨': 'BUMP OF CHICKEN',
  'bump of chicken': 'BUMP OF CHICKEN',
  '요아소비': 'YOASOBI',
  'yoasobi': 'YOASOBI',
  '바운디': 'Vaundy',
  'vaundy': 'Vaundy',
  '킹누': 'King Gnu',
  'king gnu': 'King Gnu',
  '원 오크 록': 'ONE OK ROCK',
  'one ok rock': 'ONE OK ROCK',
  '아시안 쿵푸 제너레이션': 'ASIAN KUNG-FU GENERATION',
  'asian kung-fu generation': 'ASIAN KUNG-FU GENERATION',
  '우버월드': 'UVERworld',
  'uverworld': 'UVERworld',
  '카나분': 'KANA-BOON',
  'kana-boon': 'KANA-BOON',
};

export function normalizeArtistKey(raw: string): string {
  const s = (raw || '').replace(/\u00a0/g, ' ').trim();
  if (!s) return '';
  const lower = s.toLowerCase();
  if (ARTIST_ALIAS_TO_CANON[lower]) return ARTIST_ALIAS_TO_CANON[lower];
  if (ARTIST_ALIAS_TO_CANON[s]) return ARTIST_ALIAS_TO_CANON[s];
  if (s.startsWith('(여자)아이들') || lower.startsWith('(g)i-dle')) return '(여자)아이들';
  if (lower.startsWith('f(x)')) return 'f(x)';
  const stripped = s.replace(/\s*\(.*?\)\s*/g, '').trim();
  const strippedLower = stripped.toLowerCase();
  return ARTIST_ALIAS_TO_CANON[strippedLower] || ARTIST_ALIAS_TO_CANON[stripped] || stripped;
}

function cleanDisplayArtistName(raw: string): string {
  const s = (raw || '').replace(/\u00a0/g, ' ').trim();
  if (!s) return '';
  if (s.startsWith('(여자)아이들')) return '(여자)아이들';
  if (s.toLowerCase().startsWith('(g)i-dle')) return '(G)I-DLE';
  if (s.toLowerCase().startsWith('f(x)')) return 'f(x)';
  return s.replace(/\s*\(.*?\)\s*/g, '').trim();
}

/**
 * Builds rich ArtistNode metadata from the loaded `allSongs` dataset.
 * Also builds bidirectional similarity links so any artist in the DB can expand related artists.
 */
export function buildArtistCatalog(allSongs: Song[], targetBpm?: number): Map<string, ArtistNode> {
  const map = new Map<string, ArtistNode>();

  // Reverse index of similarity clusters
  const reverseCluster = new Map<string, Set<string>>();
  for (const [seed, relList] of Object.entries(ARTIST_SIMILARITY_CLUSTERS)) {
    if (!reverseCluster.has(seed)) reverseCluster.set(seed, new Set());
    for (const r of relList) {
      reverseCluster.get(seed)!.add(r);
      if (!reverseCluster.has(r)) reverseCluster.set(r, new Set());
      reverseCluster.get(r)!.add(seed);
    }
  }

  for (const s of allSongs) {
    const rawArtist = normalizeArtistKey(s.artist);
    if (!rawArtist) continue;

    let node = map.get(rawArtist);
    if (!node) {
      const explicitRelated = ARTIST_SIMILARITY_CLUSTERS[rawArtist] || [];
      const revRelated = Array.from(reverseCluster.get(rawArtist) || []);
      const combinedRelated = Array.from(new Set([...explicitRelated, ...revRelated]));

      node = {
        name: rawArtist,
        nameKo: cleanDisplayArtistName(s.artist_ko || rawArtist),
        nameEn: cleanDisplayArtistName(s.artist_en || rawArtist),
        genre: s.genre_tag,
        coverUrl: s.cover_url || '/logos/logo-green.png',
        trackCount: 0,
        bpm130_180Count: 0,
        related: combinedRelated,
      };
      map.set(rawArtist, node);
    }

    node.trackCount += 1;
    const bpm = s.running_bpm || s.raw_bpm || 0;
    if (targetBpm) {
      if (Math.abs(bpm - targetBpm) <= 2) {
        node.bpm130_180Count += 1;
      }
    } else if (bpm >= 130 && bpm <= 180) {
      node.bpm130_180Count += 1;
    }
    if (node.coverUrl === '/logos/logo-green.png' && s.cover_url) {
      node.coverUrl = s.cover_url;
    }
  }

  // Fallback related artists by genre for artists not in the curated graph
  for (const node of map.values()) {
    if (node.related.length < 4) {
      const genreSeeds = INITIAL_SEED_ARTISTS[node.genre] || [];
      for (const gs of genreSeeds) {
        if (gs !== node.name && !node.related.includes(gs) && map.has(gs)) {
          node.related.push(gs);
          if (node.related.length >= 6) break;
        }
      }
    }
  }

  return map;
}

/**
 * Given a user's selected artists, returns `{ selectedSet, relatedSet }` (normalized artist names).
 */
export function getExpandedArtistSets(preferredArtists: string[]): {
  selectedSet: Set<string>;
  relatedSet: Set<string>;
} {
  const selectedSet = new Set<string>(preferredArtists.map(normalizeArtistKey).filter(Boolean));
  const relatedSet = new Set<string>();

  for (const artist of selectedSet) {
    const direct = ARTIST_SIMILARITY_CLUSTERS[artist] || [];
    for (const rel of direct) {
      const normRel = normalizeArtistKey(rel);
      if (normRel && !selectedSet.has(normRel)) {
        relatedSet.add(normRel);
      }
    }
    // Check reverse cluster links too
    for (const [k, list] of Object.entries(ARTIST_SIMILARITY_CLUSTERS)) {
      if (list.includes(artist)) {
        const normK = normalizeArtistKey(k);
        if (normK && !selectedSet.has(normK)) {
          relatedSet.add(normK);
        }
      }
    }
  }

  return { selectedSet, relatedSet };
}

/**
 * Checks if a song belongs to one of the user's selected artists ('selected')
 * or a related artist in the similarity cluster ('related').
 */
export function getSongArtistMatchTier(
  song: Song,
  preferredArtists: string[]
): 'selected' | 'related' | null {
  if (!preferredArtists || preferredArtists.length === 0) return null;
  const { selectedSet, relatedSet } = getExpandedArtistSets(preferredArtists);

  const candidates = [
    normalizeArtistKey(song.artist),
    normalizeArtistKey(song.artist_ko || ''),
    normalizeArtistKey(song.artist_en || ''),
  ].filter(Boolean);

  for (const c of candidates) {
    if (selectedSet.has(c)) return 'selected';
  }
  for (const c of candidates) {
    if (relatedSet.has(c)) return 'related';
  }
  return null;
}
