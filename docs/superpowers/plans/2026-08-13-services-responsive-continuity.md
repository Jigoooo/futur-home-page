# Services Responsive Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Services 인트로와 데스크톱 스티키 면을 연속시키고, 태블릿·모바일의 1~4 인덱스를 가벼운 반응형 로컬 내비게이션으로 바꾼다.

**Architecture:** `ServicesSection`은 기존 데이터와 앵커 구조를 유지하되 인트로에 배경 분할용 래퍼를 둔다. 반응형 표현은 `services.module.css`가 전담하며 기존 Playwright H1 회귀 테스트로 사용자에게 보이는 레이아웃 계약을 검증한다.

**Tech Stack:** React 19, CSS Modules, Playwright

## Global Constraints

- 데스크톱 기준은 1181px 이상이며 기존 40:60 스티키 구조를 유지한다.
- 태블릿은 561~1180px에서 밝은 한 줄 로컬 내비게이션을 사용한다.
- 모바일은 560px 이하에서 2열 2행 로컬 내비게이션을 사용한다.
- 새 의존성, SVG, 이미지, 카드, 외곽선과 가로 페이지 스크롤을 추가하지 않는다.
- 현재 미커밋 작업을 보존하며 사용자가 요청하지 않은 커밋은 만들지 않는다.

---

### Task 1: 반응형 회귀 테스트

**Files:**

- Modify: `e2e/landing-h1-capabilities.chrome.spec.ts`

**Interfaces:**

- Consumes: `[data-service-intro]`, `[data-service-sticky-index]`, `[data-service-index-link]`
- Produces: 1280px 배경 축, 900px 한 줄 인덱스, 390px 2열 인덱스를 검증하는 회귀 계약

- [ ] **Step 1: 실패하는 테스트 작성**
  - 1280px에서 인트로 배경 분할점과 인덱스 오른쪽 경계가 같은지 검증한다.
  - 900px에서 네 링크가 같은 행에 있고 인덱스 배경이 밝은색인지 검증한다.
  - 390px에서 링크가 2열 2행이며 헤더와 겹치지 않고 페이지 overflow가 없는지 검증한다.

- [ ] **Step 2: RED 확인**
  - Run: `pnpm exec playwright test e2e/landing-h1-capabilities.chrome.spec.ts --project=chrome --workers=1`
  - Expected: 기존 검은 태블릿 패널과 인트로 분할 부재 때문에 새 테스트가 실패한다.

### Task 2: 인트로와 인덱스 반응형 구현

**Files:**

- Modify: `src/pages/landing/ui/services-section.tsx`
- Modify: `src/pages/landing/ui/styles/services.module.css`

**Interfaces:**

- Consumes: 기존 `serviceCapabilities`, `useActiveServiceCapability()`와 서비스 앵커 ID
- Produces: `[data-service-intro]` 배경 분할과 뷰포트별 인덱스 배치

- [ ] **Step 1: 최소 마크업 변경**
  - 인트로의 텍스트 컨테이너를 배경 분할 래퍼 안에 두고 `data-service-intro`를 제공한다.
  - 서비스 데이터, 인덱스 링크와 챕터 마크업은 유지한다.

- [ ] **Step 2: 최소 CSS 변경**
  - 1181px 이상에서 인트로 배경과 텍스트 시작점을 기존 40:60 축에 맞춘다.
  - 561~1180px에서 인덱스를 밝은 배경의 4열 한 줄로 만든다.
  - 560px 이하에서 인덱스를 2열 2행으로 전환한다.
  - 기존 데스크톱 스티키, 챕터 높이와 모션을 보존한다.

- [ ] **Step 3: GREEN 확인**
  - Run: `pnpm exec playwright test e2e/landing-h1-capabilities.chrome.spec.ts --project=chrome --workers=1`
  - Expected: PASS

### Task 3: 회귀·실화면 검증

**Files:**

- Modify only if an actual regression is found: `src/pages/landing/ui/styles/services.module.css`

**Interfaces:**

- Consumes: 완료된 Services 반응형 레이아웃
- Produces: 자동화와 내부 브라우저 검증 증거

- [ ] **Step 1: 관련 회귀 실행**
  - Run: `pnpm exec playwright test e2e/landing-h1-capabilities.chrome.spec.ts e2e/landing-adaptive-island.chrome.spec.ts --project=chrome --workers=1`
  - Run: `pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts --project=a11y --workers=1`
  - Expected: PASS

- [ ] **Step 2: 정적 검증 실행**
  - Run: `pnpm lint`
  - Run: `pnpm build`
  - Expected: 두 명령 모두 exit code 0

- [ ] **Step 3: 내부 브라우저 확인**
  - 1280px에서 검은 배경 축과 스티키 동작을 확인한다.
  - 900px에서 한 줄 인덱스를 확인한다.
  - 390px에서 2열 2행, 헤더 비겹침과 가로 overflow 부재를 확인한다.

- [ ] **Step 4: 그래프 갱신**
  - Run: `graphify update .`
  - Expected: 그래프 갱신 완료
