# Smoke Test Results — stargazing-planner

> 선택 Q1=A(미게시). 공개 URL이 아직 없어 "공개 환경 스모크"는 **게시 후 수행 예정**.
> 대신 로컬 빌드 산출물에 대한 사전 스모크를 기록한다. 근거: deployment-strategy.md
> 스모크 체크리스트.

## 로컬 사전 스모크(빌드 산출물)

| 항목 | 방법 | 결과 |
|------|------|------|
| 번들 산출 | `npx vite build` | PASS(`dist-web/index.html` + assets) |
| 진입점 존재 | `dist-web/index.html` | PASS |
| 번들 자산 | `dist-web/assets/` JS·CSS·이미지 | PASS |
| 로컬 미리보기 | `npx vite preview`(사용자 브라우저 확인 권장) | 사용자 수동 확인 |

## 공개 환경 스모크 체크리스트(게시 후 사용자 수행)

게시한 공개 URL에서 1회 확인(deployment-strategy.md 기준):
- [ ] 공개 URL이 200으로 응답, `index.html`·메인 번들(JS/CSS) 로드.
- [ ] 메인 목록이 카드 형태로 렌더(맨 텍스트 아님), 추천 카드 강조(노란 테두리+별+"추천").
- [ ] 상세 화면 차트 표시: 달 체감 밝기 시간별 곡선 + 구름량 곡선 + 박명 음영 밴드(시민/항해/천문/완전한 밤 구분) + 월출·월몰·일몰·일출 세로선 + KST "HH:MM" x축.
- [ ] 월출/월몰/완전한 밤 null일 때 요약이 "-"로 표시(중복 없음).
- [ ] 날씨 API 호출이 브라우저에서 정상 동작(가까운 날짜 구름량 표시, 먼 날짜 "곧 표시" 안내).
- [ ] 다크모드·모바일 세로 레이아웃·한글 글리프 정상, 뒤로가기/재시도 버튼 식별.

## 판정

- 로컬 사전 스모크: PASS. 공개 환경 스모크: 게시 후 수행(현재 미게시로 N/A).

## Sources

- deployment-strategy.md(스모크 체크리스트), deployment-log.md, build-and-test/test-results.md.

## Assumptions & Open Questions

- 공개 환경 스모크는 사용자가 게시 후 수행한다. [assumption]
