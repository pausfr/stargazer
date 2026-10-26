# Unit Test Instructions — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). test-after·standard 전략. 핵심 계산 모듈 ~80% 라인 커버리지 플로어(team.md). Vitest.

## 테스트 프레임워크 설정

- 러너: Vitest(`vitest.config.ts`), 커버리지 리포터 활성(`@vitest/coverage-v8`).
- 첫 테스트 작성 전에 러너가 실행 가능해야 한다(Step 2에서 부트스트랩).
- 천문 라이브러리는 실제 의존성으로 두고 모킹하지 않는다(결정론적 계산이라 실제 값으로 검증).

## 이 단위 테스트 실행 명령 (u1 전용, 스코프됨)

```
npx vitest run src/astronomy/__tests__ --coverage.enabled --coverage.include='src/astronomy/**'
```

- 이 명령은 u1(`src/astronomy/`)의 테스트만 실행하고 커버리지도 그 경로로 한정한다. 전체 스위트(`npm test`, 무필터 `vitest`)를 돌리지 않는다.
- Build and Test 단계가 각 단위의 이 명령을 실행하므로, 반드시 u1 경로로 스코프를 유지한다.

## 기대 커버리지

- 핵심 계산 모듈(`src/astronomy/astronomy.ts`, `validation.ts`, `night-range.ts`): ~80% 라인 커버리지 플로어.
- 타입 전용 파일(`types.ts`)은 커버리지 대상에서 제외 가능.

## 모킹/스터빙 가이드

- 천문 라이브러리: 모킹하지 않음(실제 결정론적 계산 검증).
- 날짜/시간: 입력 dateKstId·좌표가 결정론적 입력이므로 시스템 시계 모킹 불필요.

## 테스트 데이터 관리

- 알려진 기준 날짜를 고정 입력으로 사용(예: 특정 신월/보름 날짜의 조도, 박명 시각, 월출/월몰 유무 케이스).
- 기준값은 천문 라이브러리 출력 또는 공개 천문 데이터로 교차 확인.

## 최소 테스트 케이스(약 12~16개)

- 달 조도: 신월(≈0%)·보름(≈100%)·중간 위상(BR1.1)
- 박명 3종: 경계 시각 존재·미존재(null) (BR2.1)
- 완전한 밤: 성립(시각 쌍)·미성립(null 쌍) (BR2.2)
- 월출/월몰: "그날 밤" 범위 안(시각)·범위 밖(null)·한쪽만 null (BR3.1)
- 기본 밤 범위: night 입력 없을 때 18:00~익일 06:00 적용 (BR3.2)
- KST 변환·반올림: UTC→KST, 분 단위·조도 반올림 (BR4.1, BR4.2)
- 입력 검증: 잘못된 dateKstId·범위 밖 lat/lon·반쪽 night 경계 → AstronomyComputationError (BR5.1)
