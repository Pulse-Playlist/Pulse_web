# tempo_ml: 딥러닝 템포 앙상블 + 옥타브 판정기

30초 미리듣기에서 **곡당 하나의 박자 템포(raw_bpm)** 를 뽑는 파이프라인입니다. 기존 `audio_analyzer.py`의 DSP 방식을 대체합니다.

BPM의 정의: **사람이 박수 치는 체감 템포(악보의 q= 표기)**. 정답셋도 이 기준입니다.

## 구성

| 파일 | 역할 |
|---|---|
| `setup_envs.sh` | Python 3.11 가상환경 4개 생성 (`.venv/bt`, `.venv/mm`, `.venv/ess`, `.venv/res`). git이 추적하지 않음 |
| `extract_beatthis.py` | Beat This! (MPS) 비트·다운비트 → 템포(이상치 제거 평균 IBI), 박자표 |
| `extract_tempocnn.py` | Essentia TempoCNN 2종 (전역 템포 + 패치별 로컬 템포) |
| `extract_madmom.py` | madmom DBN 비트 + comb 템포. **기본 파이프라인에서는 쓰지 않음** (교차검증에서 정확도 이득이 없었고 곡당 3초 이상) |
| `extract_feats.py` | onset 밀도, RMS, 대역 비율, onset 자기상관 격자 |
| `run_extraction.sh` | 위 워커를 백그라운드로 실행 (재실행하면 이어서 진행) |
| `octave_resolver.py` | 후보 {T, 2T, T/2} 중 하나를 고르는 로지스틱 판정기. `cv` / `train` / `predict` |
| `octave_model.json` | 학습된 판정기 계수 (코드와 함께 커밋) |
| `apply_bpm.py` | 결과를 로컬 데이터와 Supabase에 반영 (dry-run 기본, 백업, 롤백) |
| `common.py` | 공통 입출력, 디코딩 |

곡명·아티스트·장르 기반 하드코딩 규칙은 없습니다. 판정기가 보는 것은 모델 간 합의, 자기상관 지지도, 템포 prior 등 곡에 무관한 특징입니다.

## 실행 순서

```bash
cd crawler/tempo_ml
./setup_envs.sh                  # 최초 1회 (uv 필요)
./run_extraction.sh              # 전곡 추출 (수 시간, 중단돼도 재실행하면 이어서)
.venv/res/bin/python octave_resolver.py cv            # 정답셋 교차검증
.venv/res/bin/python octave_resolver.py train         # octave_model.json 생성
.venv/res/bin/python octave_resolver.py predict       # data/tempo_resolved.jsonl
.venv/res/bin/python apply_bpm.py                     # dry-run: 변경 리포트만 출력
.venv/res/bin/python apply_bpm.py --write             # 백업 후 반영
.venv/res/bin/python apply_bpm.py --rollback ../data/backups/<timestamp>
```

데이터 파일(`crawler/data/`, `web/public/data/songs.json`, `playlists.json`)은 모두 `.gitignore` 대상입니다.

## Supabase 새 컬럼 (선택)

`bpm_alt`(반/배 대체 템포), `bpm_confidence`, `bpm_source`는 아래 SQL을 대시보드 SQL Editor에서 한 번 실행하면 저장됩니다.
컬럼이 없으면 `apply_bpm.py`는 `raw_bpm`, `running_bpm`, `cadence_mode`만 PATCH하고 경고를 출력합니다.

```sql
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS bpm_alt real,
  ADD COLUMN IF NOT EXISTS bpm_confidence real,
  ADD COLUMN IF NOT EXISTS bpm_source text;
```

## 주의

- `unify_artists_and_dedup.sync_to_supabase`는 **테이블 전체를 지우고 다시 넣습니다.** BPM만 바꿀 때는 `apply_bpm.py`를 쓰세요.
- `upsert_all_songs.py`는 같은 이유로 `--i-know-this-wipes-the-table` 없이는 실행되지 않습니다.
- 정답셋(`crawler/data/bpm_gt/`)은 git에 올라가지 않으므로 별도로 보관하세요.
