---
inclusion: always
---

# AI-DLC Active Memory

<!-- AI-DLC writes this file from aidlc/spaces/default/memory/ for every chat. Do not edit it: edit those files instead. -->

The text of each file below is the active AI-DLC method and policy layers. They apply to the
conductor and delegated agents.

<memory-file path="aidlc/spaces/default/memory/org.md">
# Org-Level Rules

> Framework defaults. Read with `team.md` and `project.md` from the active
> space. The resolver loads every applicable layer; narrower layers add
> specialisation and must not contradict broader policy.

## Way of Working

AI-DLC's own defaults for the branches and merges it makes. They are not a
description of how this project works: your team's practices go in `team.md`
and this project's in `project.md`, which are read first and replace anything
written here.

A commit you ask for goes where you already are, on the branch you are on.
AI-DLC makes a branch for it only when you ask for one, or when `team.md` or
`project.md` says the project works that way.

For the Construction worktrees AI-DLC creates, the default is
**trunk-based development**. The worktree base branch is `main` and the
merge target is `main`. Each Bolt branch is **squash-merged** into `main` as
one commit named by the Bolt slug, with the Bolt's own commits left on the
source branch until the worktree is discarded. Squash keeps a linear `main`
history that maps 1:1 to delivery-planning's Bolt sequence, and the audit log
holds the full event sequence either way.

Where a project runs several environments (staging, production), the default
keeps one trunk and gates releases with tags or environment-specific deployment
configs rather than long-lived release branches.

## Walking Skeleton

When practices are scope-dependent, select the walking skeleton only when the
active scope declares `skeleton: on`. In checkpoint-enabled solo work with a
non-empty Unit DAG, the first Unit is the smallest working integrated slice.
Run it through all applicable per-unit stages, including Code Generation, before
later Units even if stage-major was selected. Verify it with the intent's recorded,
human-authorized Construction Verification Command, which must demonstrate the
project's real end-to-end result, then require the human's skeleton checkpoint
approval. A first design-stage review does not demonstrate a working skeleton.

For `skeleton: off`, skip the skeleton ceremony: no bootstrap checkpoint; offer
the explicit Construction choice at entry. For skeleton-on, offer it after the verified,
human-approved skeleton. Follow `construction_policy.offer_autonomy`; never
repeat a recorded choice. **Continue automatically** records `autonomous`;
**Review each checkpoint** records `gated`. On-demand requests can grant or
revoke autonomy during Construction. Ordinary completion approvals follow that
choice; Plan Approval, summary confirmation, verification command selection,
and failures remain human stops.

Existing workflows without `Construction Checkpoints` retain their legacy
first-stage and late stage approvals. Team-owned Unit gates retain their own
policy; no Unit DAG means no skeleton checkpoint ceremony.

## Testing Posture

We treat tests as a first-class deliverable in every Bolt. The specific
methodology (TDD, BDD, ATDD, or classic test-after) is affirmed at
practices-discovery and recorded in `team.md` under this heading with explicit
`Methodology` and `Ordering` fields; Code Generation resolves those fields
independently from coverage, tooling, and scope notes.

When no posture has been affirmed, our default per scope is:
- **Methodology**: test-after
- **Ordering**: implement each applicable testable layer, then write and run
  that layer's tests.
- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage
  floor and CI execution before merge.
- `bugfix`, `security-patch` add a targeted regression for the specific
  bug/vulnerability and require the existing suite to remain green.
- `express` uses the Minimal strategy: requirement-driven unit tests (one per
  requirement, with a happy-path floor per component); existing tests remain
  green.
- `poc`, `refactor`, `workshop` add no extra new-test floor and require the
  existing suite to remain green.

The active `Test Strategy` still applies in every scope and determines test
volume/types. Scope floors are additive; they never reduce or replace the
selected strategy.

Build and Test verifies defined coverage floors and affirmed quality targets;
they may not be weakened to make a step pass.

Affirm a stricter posture in `team.md` if the team commits to one.

## Guard Policy

<!-- Mode: strict, relaxed, or off. Strict here holds for every intent in this space, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless a narrower layer or the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

We **deploy on merge** to staging environments. Production deploys gate
on a separate manual approval — typically tech lead + product owner
sign-off in CodePipeline or a CD platform's environment protection.

Teams that have invested in test coverage and observability sometimes
graduate to continuous deployment to production (every commit
auto-deploys); that's a team decision, not a framework default.

## Code Style

We defer to project-level configurations:
- Formatter: Prettier (JS/TS), Black (Python), `gofmt` (Go), or
  language-default. Configured in repo root (`.prettierrc`,
  `pyproject.toml`, etc.).
- Linter: ESLint, Ruff, golangci-lint, etc. Run in CI before merge;
  failure blocks the PR.
- Naming conventions: language idiomatic (camelCase for JS/TS,
  snake_case for Python, etc.). No project-wide rename rules unless
  team affirms one.

When the framework makes a code-style suggestion, agents read the
project's linter config first; the agent's suggestion only fires if the
linter doesn't already cover it.

## Forbidden

<!-- Things agents must never do -->
<!-- Example: Do not ask questions about topics already decided in previous stages -->

## Mandated

- **Conversation language — resolution**: Every artifact a person reads or reviews is written in the workflow's established conversation language. The orchestrator resolves that language from the human's substantive prose and MUST state it as a `Conversation language: <language>` line in every delegated brief, because a delegated agent or reviewer never sees the conversation and some stages hand it nothing else (a greenfield run of a stage whose `consumes` are all `conditional_on: brownfield` reaches its lead with no upstream artifact at all). Delegated agents and reviewers resolve the language in this order and stop at the first source that answers: (1) the `Conversation language:` line in your brief — AUTHORITATIVE for delegated work, because the orchestrator regenerates it on every dispatch from the live conversation and it is therefore never staler than a persisted rule; (2) an explicit conversation-language rule in `aidlc/spaces/<active-space>/memory/project.md` — the FALLBACK for a brief that states no language, and the ONLY file a language switch is ever persisted to, so `project.md` ALWAYS outranks a conversation-language rule in `team.md`, which can only ever be a team default and NEVER the record of a switch (cross-file position is NOT recency: the runtime rule chain concatenates `org → team → project → phase`, so `team.md` reaches you before `project.md` in every bundle no matter which was written last, and the winner is this stated precedence rather than the later position); within `project.md`, when it carries more than one conversation-language rule the LAST one under `## Corrections` is the current one (this tie-break governs conversation-language rules ONLY and leaves the additive rule model untouched; the learnings write path appends and never replaces, so a superseded language rule can still be on disk); (3) the verbatim initial description decoded from `<record>/project-description.json`, falling back to `## Project Information` → `**Project**` in legacy records, when it carries a real language signal (not the `[Project description]` placeholder, not a bare identifier or path); (4) any artifact or draft you were handed — the directive's `consumes[]` contracts, the artifact you were dispatched to review, or the lead draft you were dispatched against. Every source is readable on every harness: the rule bundle carries (2) through the dispatch-rules hook on Claude, Codex, and opencode and through always-included agent resources or workspace steering on Kiro, and neither `aidlc-state.md` nor the handed artifacts fall inside the per-unit reviewer read-scope bound.
- **Conversation language — stability**: The established conversation language holds for the whole session, and inside that session for every stage, dispatch, reviewer pass and approval gate of the workflow — nothing but a session boundary ends it. A turn that carries no language signal never changes it — `Approve`, `Looks correct`, an option letter or number, pasted code, a quoted error or stack trace, a bare file path or identifier. Only an explicit human request to switch languages changes it, and that switch takes effect IMMEDIATELY: everything written from that point follows the new language, and the orchestrator states the new language in the `Conversation language:` line of every subsequent delegated brief. Persistence is a separate, later step and never the activation step: the §13 learnings ritual is the ONLY sanctioned write path for persisting a conversation-language switch into `aidlc/spaces/<active-space>/memory/` and it is human-gated, so NEVER edit a memory file directly to record a switch — a direct write skips the tool's audit event, its duplicate key, and its admission conflict-check, and "do not wait for persistence" is never licence to bypass that gate (this bounds the persistence of a language switch and forbids a direct agent edit; it does not govern the deterministic memory writers a stage invokes by contract, such as `aidlc-state.ts practices-promote`, which own the stamped `## Mandated` / `## Forbidden` rules and the five replaced `team.md` sections rather than the `## Corrections` language record). When `directive.ceremony.learnings` is `off`, no language-switch persistence happens and no direct memory edits replace the ritual; the current session still uses the new language. When the enabled `learnings` protocol module offers it, the switch is recorded as a single-line rule under `## Corrections` in `project.md` and NEVER in `team.md`, so the cross-file precedence in (2) never has to arbitrate one switch against another; when the human declines, it is simply not persisted, and the `Conversation language:` line the orchestrator states in every brief carries it for the rest of the session. A session boundary is where that carrier ends, and a workflow outlives it: the resume context the engine injects at session start carries scope, phase, stage, status, agent and next action but NO language, so on the FIRST turn of a new session the orchestrator MUST re-resolve the language before it dispatches anything — the persisted rule from (2), else the human-readable artifacts this workflow has already produced, which record the language the human was last served in, else the verbatim initial description from (3) — and when every one of those is silent it ASKS the human rather than defaulting to English. Re-resolving is not a switch: it is never announced as one and never persisted as one. An unpersisted switch therefore does not outlive its session, which is exactly what persistence buys — a human who wants a switch to survive a resume accepts the ritual, and a human who declines is served correctly for the rest of the session and re-resolved from disk in the next one. A persisted rule NEVER outranks the brief, and never outranks a later explicit human request to switch: it is the fallback for a brief that states no language, and because the learnings write path appends rather than replaces, a superseded language rule can outlive the switch — the LAST conversation-language rule under `## Corrections` is the current one.
- **Conversation language — what to localize**: Write in the resolved conversation language every artifact a person reads or reviews — requirements, user stories, plans, specs, reviews, questions, discovered practices, affirmed team and project rules, evidence, decision rationale, and any other explanatory prose — and the agent's own human-facing conversational output in every turn, for the orchestrator and delegated agents alike: conversational chat messages, status updates, progress reports, and transitional narration between tool calls. Structured-question `prompt`, `header`, `options[].description`, and free-text follow-ups are human-facing prose and follow the same rule; only `options[].label` literals the protocol spells verbatim are preserved tokens. This includes the descriptive text of a rule shaped as `ALWAYS …` / `NEVER …`, where the leading marker is a fixed token but the sentence it introduces is not. A Markdown artifact is not English merely because a tool parses part of it: localize the prose that surrounds a preserved token. Verbatim human input echoed into an artifact is always kept exactly as the human wrote it.
- **Conversation language — preserved tokens**: Any literal a stage file or the stage protocol spells in backticks and tells you to write exactly is a fixed token — keep it English, character for character, and localize only the prose around it. This covers option labels and sentinel VALUES, not just syntax: `[Answer]:` tags with their option letters, the mandatory final option `X. Other (please specify)`, the assumption-confirmation options `A. Accept assumptions` / `B. Convert to follow-up questions` (the engine compares the filled answer against the literal), the `None.` / `None` sentinels under `## Assumptions & Open Questions` and `## Positions`, the `AGREE:` / `OBJECT:` position prefixes, and the `**Collaborator:** <agent-slug>` first line the engine matches exactly before it accepts a stage. Glossing such a literal when you PRESENT it to the human is fine; what you WRITE into an artifact is the literal itself. Also preserved: the source-register tags `[desc]`, `[scope]`, `[assumption]`, `[Q<n>]`, `[memory:M<n>]` with their literal prefixes (`Initial description:`, `Workflow-selected scope:`); the H2 headings the claim-sources sensor matches verbatim (`## Sources`, `## Assumptions & Open Questions`, `## Assumption Confirmation`, `## Review`) plus any other H2 taken from a stage template, which the `required-sections` sensor matches verbatim whenever a template is supplied (the framework ships none, so a team's `aidlc/spaces/<active-space>/memory/templates/` is what arms that check); the reviewer verdicts `READY` and `NOT-READY`; YAML keys and enum values inside fenced blocks (`units`, `name`, `kind`, `depends_on`, `service | spec | ui | packaging | library`); the field labels, status values, and checkbox states of `aidlc-state.md` and the audit shards; the verbatim initial description decoded from `<record>/project-description.json` (the `**Project**` state field is only its safe single-line preview); stable IDs (`FR-1`, `ENT-001`, `BR1.1`); enum and classification values; code and identifiers; file paths; mermaid keywords; and cross-references.

## Corrections

<!-- Self-learning loop appends here. -->
<!-- Use team.md to record team-wide additions and project.md for
     project-specific specialisation. The loader resolves org → team →
     project at session start and retains every applicable rule. -->
</memory-file>

<memory-file path="aidlc/spaces/default/memory/team.md">
# Team-Level Rules

> This team's affirmed practices and corrections. Loaded after `org.md` as
> strict-additive guidance; contradictions with broader policy are rejected.
> Populated by the practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working

- 단일 개발자가 `main` 트렁크 하나로 작업하는 **트렁크 기반 개발**을 씁니다.
  베이스와 머지 대상 모두 `main`이며, 장수 브랜치는 두지 않습니다.
- 작업은 `main`에 바로 커밋해 합칩니다(트렁크 기반, 단순). 1인 프로젝트이므로
  기능별 브랜치나 PR 리뷰 같은 무거운 협업 절차는 두지 않고, 변경 근거는
  커밋 메시지로 남깁니다.

## Walking Skeleton

- 워킹 스켈레톤(얇은 엔드투엔드 슬라이스를 먼저 만들어 조각들의 연결을
  증명하는 방식)의 적용 여부에 대해 개발자는 특정 입장을 고정하지 않고,
  활성 스코프(feature)의 기본값에 따르기로 했습니다.
- 따라서 이 스탠스는 활성 스코프의 기본 설정이 결정하며, Construction
  단계에서 그 기본값에 맞춰 적용 여부가 정해집니다. 여기서는 on/off를
  하드하게 단정하지 않습니다.

## Testing Posture

- **Methodology**: test-after
- **Ordering**: 각 테스트 가능한 레이어(천문 계산 함수, 데이터 페치·캐시,
  밤 추천 점수 산출)를 먼저 구현한 뒤 그 레이어의 단위 테스트를 작성하고
  실행한다.
- **Methodology evidence**: 솔로 개발자가 무료 티어 정적 웹 앱을 만드는
  맥락에서 TDD/BDD/ATDD의 사전 시나리오 작성 오버헤드보다, 정답이 분명한
  순수 계산 로직(달 조도·박명·월출몰·추천 점수)에 대한 구현 후 단위 테스트가
  비용 대비 가치가 높다고 인터뷰(Q3)에서 판단했습니다. feature 스코프이며
  org.md 기본과 동일한 test-after를 채택합니다.
- 전체적으로 가벼운 테스트 분량을 지향하되, 핵심 천문 계산 로직(달 조도,
  박명 구간/완전한 밤, 월출·월몰, 밤 추천 점수)에 테스트 노력을 집중합니다.
  UI와 외부 API 연동은 수동 스모크로 보완합니다.
- **커버리지**: 약 80% 라인 커버리지 플로어는 **핵심 계산 모듈에만** 적용하고
  (Q4), UI 등 그 외 코드는 더 느슨하게 둡니다.

## Guard Policy

<!-- Affirmed by the team. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless project.md or the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

- 무료 정적 호스팅(GitHub Pages / Vercel / Netlify 무료 티어)에 배포합니다.
- `main` 머지 시 자동 배포하는 **머지 시 배포**를 기본으로 합니다(Q5). 1인
  개인 앱이고 별도 운영 환경이 없으므로 별도의 수동 프로덕션 승인 게이트는
  두지 않습니다.
- 롤백은 정적 호스팅 제공자의 이전 배포로 되돌리거나 `main`의 직전 커밋으로
  재배포해 수행합니다.

## Code Style

- 리포지토리 루트의 표준 린터/포매터 설정에 위임합니다(JS/TS 기준
  Prettier + ESLint)(Q6). 설정 파일이 프로젝트 기준의 단일 소스입니다.
- 네이밍은 언어 관용을 따릅니다(JS/TS는 camelCase). 프로젝트 전역 리네임
  규칙은 두지 않습니다.
- 다크모드 우선 모바일 웹 UI이므로, 색만으로 정보를 전달하지 않도록
  아이콘/라벨을 병행하는 접근성 관례를 코드 스타일 차원에서 지향합니다.

## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->
</memory-file>

<memory-file path="aidlc/spaces/default/memory/project.md">
# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER 클라이언트 번들에 API 키나 그 밖의 시크릿을 하드코딩한다. (affirmed 2026-10-25)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS 모든 런타임 데이터 소스(무료 날씨 API 티어, 오픈소스 천문 계산)를 (affirmed 2026-10-25)

무료 티어 범위 안에서만 사용한다. (affirmed 2026-10-25)

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- 이 앱의 핵심 가치는 특정 천문 이벤트(은하수·행성·유성우·별자리) 비교가 아니라 "달 위상 + 구름 양 + 박명(완전한 밤 구간) 그래프"로 좋은 관측 밤을 고르는 것이다; 전자는 열린 항목으로만 둔다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:intent-capture:a44f6c577e16e57ba1c9496ce26e9eb13113ea0d82dc7de943cebcbf3653d990 -->
- 관측 위치의 개념 모델은 개별 명소가 아니라 박명 시각이 유의미하게 달라지는 한국 ~5개 지역 구획이다(시골 관측 전제). 단, 첫 버전(MVP)에서는 지역 구획을 쓰지 않고 전국 대표 좌표 하나로 시작하며, 구획 선택/비교는 다음 버전으로 이월한다(아래 scope-definition 학습 참조). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:intent-capture:1c9e88dc886bcf59cdade28471613b74e2a590cac3a85d9fa79980c8bc8e4034 -->
- 데이터 확보의 잠정 기술 방향은 "달 위상·박명은 오픈소스 천문 계산 라이브러리로 직접 계산, 구름량은 무료 티어 날씨 API(Open-Meteo류)"이다(비용 전부 무료 범위 우선). 최종 선택은 Feasibility/설계에서 확정. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:market-research:b92a8e3519236caae9ca2860e1d1085ebdaf0c09f25ced85aeee84f848b7f617 -->
- 날씨 예보 지평이 짧으므로(무료 API 보통 ~2주), 가까운 날짜는 구름량까지 표시하고 먼 날짜(3개월 범위)는 달 위상·박명만 확정으로 보여주며 날씨는 날짜가 가까워지면 채운다. 이것이 "3개월 연휴 비교"를 성립시키는 핵심 설계 전제다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:feasibility:5a0c481bfe7eda1c31b99aff25d50b23438dae57e34e732b1324b21caba3306e -->
- 달 밝기는 조도(illuminated fraction 0~100%)로 표현하고, 데이터 갱신은 앱을 열 때 fetch한 뒤 짧게 캐시해 무료 한도를 보호한다(잠정, 설계에서 확정). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:feasibility:426b8cc22e8d82d6a9191ad73aea70ce9fcd1e2d6d944ffa01580cdcdc862362 -->
- 첫 버전(MVP)은 전국 대표 좌표 하나로 계산하며, 한국 ~5개 지역 구획 선택/비교는 첫 버전에서 제외하고 다음 버전 목표로 이월한다(intent-capture의 5구획 확정을 번복·이월). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:scope-definition:b493aa21db39f88c202e0ab7963aea6f1c607e420f510c847ce0aec7d8972c53 -->
- 월출·월몰 시각은 관측에 중요하므로 상세 그래프의 MVP 필수 요소다(달 밝기 곡선 + 구름량 곡선 + 박명 음영/완전한 밤 + 월출·월몰). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:scope-definition:6bf4a208c5ff0f827706eac21db1123ec9275992f46ef15f858c869cabe85edd -->
- 기본 테마는 다크모드다(밤 관측 준비 맥락). 메인 카드의 "관측 좋은 날"(달 어두운 밤) 강조는 노란색 테두리로 하되, 색만으로 전달하지 않도록 아이콘/라벨을 병행한다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:rough-mockups:37bbb94c05f6487bbcb3aa8e3f585fb4a0d598d0662e9a49f66021da95124034 -->
- 상세 화면의 이전/다음 연휴 바로 이동 네비게이션은 MVP에서 제외하고 뒤로가기로만 날짜를 바꾼다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:rough-mockups:9a1a72b3b39cd97576bd636493c7e5eb93ce219e690a0c501444af295217146e -->
- 워킹 스켈레톤 스탠스는 활성 스코프 기본값에 맡긴다(하드 on/off 아님). 테스트 커버리지 80% 플로어는 핵심 천문 계산 모듈에만 적용하고 UI 등 나머지는 느슨하게 둔다. 테스트 방법론은 test-after. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:practices-discovery:37da8e6bc63d28027d7c9fdd6eb33a31f44a74b9b4453f3d153fad8305caf93e -->
- 정적 앱이라 API 키를 숨길 서버가 없다. 따라서 키가 필요 없는 공개 API(Open-Meteo 등)를 우선 선택하고, 키가 꼭 필요하면 설계 단계에서 프록시를 둘지 여부를 결정한다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:practices-discovery:22bef133ed0c0265caf830e69758205b50c190b729a59b993d9dc8f4f622cfb0 -->
- "추천(관측 좋은 날)" 판정은 달 위상만이 아니라 달 조도가 낮고(어두운 밤) 구름도 적을 때 성립한다(구름 많으면 추천 제외). 구름 예보 데이터가 없는 날은 달 조도만으로 판정한다. 잠정 임계값은 달 조도 ≤ 20%, 구름량 ≤ 30%이며 설계에서 조정 가능. 이는 앞선 "추천=달 위상만" 노트를 대체한다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:requirements-analysis:edcdc6a783228340278a991bf4507970021a713972a7f6828958bf10ee2eae4a -->
- 단위 분해는 관심사(레이어)별 굵은 4단위로 한다: 천문 계산(library), 날씨+캐시(library), 달력+추천 규칙(library), UI 화면(ui). 1인·무료 정적 앱에서는 화면별 묶기나 컴포넌트 1:1 분해보다 레이어 분리가 변경률 경계와 핵심 계산 모듈 테스트 집중에 더 맞다. (learned 2026-10-26) <!-- cid:261025-stargazing-planner:units-generation:aceaa2fe9f4c8b22946d7bd8ade515121f57e0967336dab3b4a2f013913fa21d -->
- 단위별로 "핵심 체크포인트만 자동 진행"을 요청하면, 엔진 autonomy 스위치(전역)를 켜지 않고 조정자가 그 단위의 설계 리뷰 게이트만 자동으로 넘기되 요약 확인·코드 생성 계획 승인·검증 명령·단위 완료 검증 같은 핵심 체크포인트는 그대로 사람에게 받는다. 리뷰어·센서는 계속 돈다. (learned 2026-10-26) <!-- cid:261025-stargazing-planner:nfr-design:9068c79566f6179265c5ae95c043f6a02c3bc0bac83734ebf3c555438b84337b -->
- 유닛 테스트 커버리지 플로어는 `--coverage.include='src/<unit>/**'`로 경로를 한정해 측정한다(루트 v8 커버리지가 리포지토리 전체, .kiro 툴링 포함을 집계해 핵심 모듈 플로어를 희석하는 문제 회피). 기능·테스트 범위는 동일, 측정 방식만 명시. (learned 2026-10-26) <!-- cid:261025-stargazing-planner:code-generation:d6f1282123d03a233fc283a5548656daf73df42562c62cad330d31fabf002175 -->
- traceability 작성 시 추천 분기의 수용기준(AC)을 실제 규칙 경로에 정확히 매핑한다: known 추천(BR2.1)·known 비추천(BR2.2)과 outOfHorizon 조도만 추천(BR2.3)을 혼동하지 않고, 각 BR의 실제 상류 AC를 빠짐없이 upstream/coverage에 올린다(리뷰 iter1 교훈). (learned 2026-10-26) <!-- cid:261025-stargazing-planner:functional-design:4db813b061c76b2a69b76d94a1df6bd75a0431a16bb5ed0a4ba9791d7767831d -->
- 내장 공휴일 테이블을 유지할 때 공휴일이 토·일과 겹치면 대체공휴일을 두는 규칙을 모든 공휴일에 일관되게 적용한다(2026 추석 대체공휴일 누락을 리뷰에서 잡은 교훈). 테이블 갱신·검수 시 토·일 겹침 대체 규칙 일관성을 확인한다. (learned 2026-10-26) <!-- cid:261025-stargazing-planner:code-generation:7777a6a350ea9db6d1e2fa8c63467f7246366d4fa049a2e7073ad390dac755b3 -->
- BR1.3 불변식 확정 — FORECAST_HORIZON_DAYS=14 ≤ Open-Meteo forecast 범위 16일. types.ts 단일 상수로 분리하고 주석에 근거 기록. 컷오프(14일) 이내는 unknown, 초과는 outOfHorizon으로 두 상태가 겹치지 않음. 컷오프 날짜 비교는 KST epoch-day 인덱스 차로 결정적 수행(시각 세부 비의존). (learned 2026-10-27) <!-- cid:261025-stargazing-planner:code-generation:3e79451bf68348a236ea37731a221c1e7831e4f819d748cd56e474e0ba6b942e -->
- 계획 plan_profile의 테스트 가능 레이어 중 "API/endpoint"·"Frontend behavior"는 순수 규칙 라이브러리 단위에 해당 없어 생략(계획 본문 §방법론 적용에 명시된 매핑대로). index.ts는 재노출 배럴이라 실행 로직이 없어 스코프 커버리지에서 0%로 표기되나(다른 index 배럴과 동일 성격), 단위 전체 라인 커버리지로 핵심 모듈 80% 플로어를 충족. (learned 2026-10-27) <!-- cid:261025-stargazing-planner:code-generation:27ef7787090c9378ea9531f11c695550f1151bcce526bddaa6d07296f4d92844 -->
- 계획 기록 명령 `npx vitest run <unit> --coverage` 는 루트 v8 커버리지가 리포지토리 전체(.kiro 툴링 포함)를 집계해 핵심 모듈 플로어가 희석됨. 유닛 플로어 측정은 `--coverage.include='src/<unit>/**'` 로 경로를 한정해 실행함(vitest.config.ts 주석의 "단위 실행 명령이 경로를 한정" 의도와 일치). 기능·테스트 범위는 동일, 측정 방식만 명시. (learned 2026-10-27) <!-- cid:261025-stargazing-planner:code-generation:9a5f0c75ca34ca65d2ff485dda7b9a312a50830f151abd537ea176c95704de5a -->
- 상류 단계의 사용자 결정은 하류로 내려가며 '열린 질문'이나 '다음 단계 책임'으로 중립화되어 증발할 수 있다(예: u1 Q1의 월출·월몰 null '생략' 결정이 rules.md·entities.md에서 중립화되고 u4엔 미전달). 단계마다 상류 결정이 실제로 전달·반영됐는지 확인하고, 최종적으로 월출·월몰·완전한 밤 경계가 null이면 UI에서 '없음'(월출 없음/월몰 없음/완전한 밤 없음)으로 명시 표시한다(생략 아님, AC3.2.3 확정; 달 없는 밤은 관측 최고 조건이라 명시가 유용·생략은 데이터 오류와 혼동). (learned 2026-10-27) <!-- cid:261025-stargazing-planner:code-generation:438befa3e6445798f3317bc072df367aeea714a7ceeec25fd820ed04ea53999c -->
- 단위 산출물은 kind와 produces_kinds를 따른다: ui 단위는 NFR Requirements·NFR Design의 scalability/reliability/observability 산출물을 생성하지 않고(service 전용), library 단위는 performance/security/logical-components 등 해당 kind에 매핑된 것만 생성한다. 미적용 산출물의 부재는 결함이 아니며, 미적용 상류 NFR은 traceability에서 사유와 함께 N/A로 둔다. (learned 2026-10-27) <!-- cid:261025-stargazing-planner:code-generation:bd345453f736e4649851013faa3095ecd4185fb11b200879bfc9e70fdce754a2 -->
- 달 체감 밝기 시간별 곡선(C1 moonHourly)은 '그날 밤 실제 천문 남중 고도=100%'로 정규화한다(위상 조도는 밤 전 샘플에 공통이라 남중 정규화에서 상쇄되어 위상값과 독립적·결정적; 남중은 SearchHourAngle로 밤 범위 밖이어도 참조). 소광은 Kasten-Young airmass × k=0.23 mag/airmass 투과율, 입사각은 sin(고도), 고도 ≤ 0은 0%. 결함 6(월출만 있고 월몰 null 비대칭)은 월몰을 월출 이후 구간에서 탐색하도록 바꿔 제거하되 둘 다 null 가능성은 유지한다. 상세 그래프 좌y축은 수평 기준선이 아니라 이 시계열 꺾은선이다. (learned 2026-10-27) <!-- cid:261025-stargazing-planner:code-generation:18621e27239854d7098997daf3ef2c6fa339ce43c8bd01ea9d791106c7d82317 -->
- 계산 로직 변경으로 기능이 바뀐 지점의 기존 테스트는 '기능 축소'가 아니라 '정합 조정'으로 갱신한다: 월출·월몰 탐색 대칭화 후에는 구(舊) 전방탐색 전제를 담은 테스트를 새 탐색 순서 기준으로 재계산하고, 수평 기준선 폐기 후에는 baseline 테스트를 시계열 곡선·KST HH:MM 포맷·음영 농도 차등 테스트로 교체한다. C1 계약 확장 시 모든 픽스처(fixtures·타 단위 astroWith 등)에 새 필드를 더해 tsc 정합을 맞춘다. 커버리지 플로어·테스트 설정은 어떤 경우에도 낮추지 않는다. 동어반복적 대칭 테스트는 가능하면 실제 날짜의 알려진 값을 오라클로 보강한다. (learned 2026-10-27) <!-- cid:261025-stargazing-planner:code-generation:16da7ed2de2f50009bc63e1565d91eb36ae54e7eb8003fb71ec4dcac6c1e0915 -->
- 교차 단위 추적 산출물(`traceability.json`)은 표준 스키마로 통일한다: 최상위 `upstream_ids` 배열(비어있지 않은 문자열) + `coverage[].target`을 순수 파일 경로로. 단위마다 서로 다른 스키마(`entries`/`targets` vs `upstream_ids`/`coverage`)를 쓰거나 `target`에 괄호 설명을 섞으면 Build and Test의 교차 단위 커버리지 센서가 'target file does not exist'·'upstream_ids must be an array'로 오탐해 Step 10 게이트가 실패한다. 수정 설명은 `target`이 아니라 별도 섹션(`fixes` 등)에 적고, 미적용 상류 NFR은 소유 단위에서 사유와 함께 N/A로 둔다(순수 규칙 라이브러리는 체감 로딩·가용성·무료 한도·외부 사유 비노출 NFR의 소관이 아니다). (learned 2026-10-27) <!-- cid:261025-stargazing-planner:build-and-test:c9054e16ae21f5393e6894a07f9345501445d04f29cc4a394be4141399959355 -->
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/ideation.md">
# Ideation Phase Guardrails

These rules apply to every stage whose `phase: ideation` declaration
imports them as the matching phase rule.

## Focus

- Prioritize user needs and problem definition before proposing solutions
- Keep ideation artifacts at the problem/opportunity level — no implementation details
- Explore the problem space broadly before narrowing to solutions

## Evidence Standards

- Market research claims require citations or explicit source attribution
- Feasibility estimates must be conservative — flag assumptions clearly
- Do not present speculation as fact; label uncertain claims as "hypothesis" or "assumption"

## Scope Discipline

- No implementation details (architecture, tech stack, code) in ideation artifacts
- Do not carry forward scope decisions that have not been explicitly approved
- If a feasibility concern would block progress, surface it early rather than glossing over it

## Output Quality

- All ideation artifacts must be readable by non-technical stakeholders
- Avoid jargon unless defined in a glossary
- Success metrics must be measurable — avoid vague outcomes like "improved performance"

## Corrections
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/inception.md">
# Inception Phase Guardrails

These rules apply to every stage whose `phase: inception` declaration
imports them as the matching phase rule.

## Requirements Quality

- Requirements must be testable and verifiable — each requirement must have a clear pass/fail criterion
- Avoid ambiguous language ("fast", "easy", "user-friendly") unless paired with a measurable threshold
- Never carry forward unresolved contradictions between requirements; surface and resolve them explicitly

## Architecture Standards

- Architecture decisions require trade-off analysis — document at least two alternatives considered
- All ADRs must include: Context, Decision, Consequences, and Alternatives Rejected
- Security and compliance implications must be addressed for every major architectural decision

## User Stories

- User stories follow Given/When/Then (BDD) format for acceptance criteria
- Each story must identify the actor, the action, and the business value
- Stories must be independently testable — avoid stories that only make sense in sequence

## Traceability

- Every requirement must trace back to an ideation artifact (intent, feasibility, or scope)
- Do not introduce new requirements in inception without documenting their origin

## Corrections
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/construction.md">
# Construction Phase Guardrails

These rules apply to every stage whose `phase: construction` declaration
imports them as the matching phase rule.

## Code Completeness

- Generate complete, runnable files — no partial implementations, no placeholder stubs unless explicitly marked TODO with a rationale
- Every generated module must be independently executable or clearly document its dependencies
- Do not leave unresolved import errors, missing type definitions, or broken references

## Error Handling

- Always include error handling at integration boundaries (API calls, database operations, file I/O, external services)
- Errors must be surfaced to the caller or logged — silent failures are not acceptable
- Distinguish between recoverable errors (retry/fallback) and fatal errors (fail fast)

## Testing Standards

- Test files must cover the happy path and at least two error/edge cases
- Tests must be runnable without manual setup beyond documented prerequisites
- Do not generate tests that always pass regardless of implementation (e.g., `assert True`)

## Security

- Never hardcode credentials, API keys, or secrets — use environment variables or a secrets manager
- Validate and sanitize all inputs at system boundaries
- Flag any code that bypasses authentication or authorization checks

## Corrections
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/operation.md">
# Operation Phase Guardrails

These rules apply to every stage whose `phase: operation` declaration
imports them as the matching phase rule.

## Infrastructure Safety

- Infrastructure changes require security review — document the security implications of every change
- Never remove or bypass existing security controls without explicit approval and documented rationale
- Changes to IAM roles, network policies, or encryption settings must include a risk assessment

## Deployment Procedures

- All deployment procedures must include rollback steps — document how to reverse every change
- Deployments to production must have a defined smoke test or health check to verify success
- Blue/green or canary strategies must document traffic-shifting criteria and abort conditions

## Observability

- SLOs must be quantified with specific percentages and time windows (e.g., "99.9% availability over a 30-day rolling window")
- Alerting thresholds must be set below SLO breach to allow time for remediation
- Every new service or component must have at least one health metric and one error rate metric

## Incident Response

- Runbooks must include escalation paths and contact information
- Post-incident reviews are required for any P1/P2 incident — document timeline, root cause, and prevention

## Corrections
</memory-file>
