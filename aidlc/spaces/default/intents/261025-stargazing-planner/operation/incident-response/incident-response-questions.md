# Incident Response — 질문

> 1인 개인 무료 정적 웹 앱. "팀"·"온콜"은 개발자 본인 하나. 인시던트는 사실상
> (1) 사이트 다운, (2) 날씨 API 장애/한도, (3) 배포 후 회귀 뿐. 근거: team.md,
> rollback-runbook.md, alarms.md, phases/operation.md(Incident Response).

## Q1. 인시던트 심각도 등급·대응 시간

A. **가벼운 2등급** — P1(사이트 완전 다운/앱 안 뜸): 발견 즉시 롤백. P2(부분 저하:
   날씨만 안 나옴/특정 화면 오류): 편할 때 수정. 엄격한 SLA 없음(1인 개인 앱). (권장)
X. Other (please specify)

[Answer]: A

## Q2. 에스컬레이션 경로·연락 체계

A. **개발자 본인 단일 담당** — 별도 에스컬레이션 체인·온콜 로테이션 없음. 통지는
   제공자 기본 알림(배포 실패)·선택적 업타임 체크 이메일로 본인에게. (권장)
X. Other (please specify)

[Answer]: A

## Q3. 어떤 런북이 필요한가

A. **3개 런북** — (1) 사이트 다운 복구(롤백), (2) 날씨 API 장애/한도 대응(앱이
   `unknown`으로 우아하게 저하되므로 대기·확인 위주), (3) 배포 후 회귀 롤백
   (rollback-runbook 참조). 서버 재시작·페일오버·스케일링 런북은 해당 없음(서버 없음). (권장)
X. Other (please specify)

[Answer]: A

## Q4. 사후 검토(포스트모템)

A. **가벼운 자기 검토** — P1 발생 시 커밋 메시지 또는 짧은 메모로 타임라인·원인·재발
   방지(테스트 추가 여부)를 1회 기록. 정식 블레임리스 포스트모템 프로세스는 과함(1인). (권장)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
