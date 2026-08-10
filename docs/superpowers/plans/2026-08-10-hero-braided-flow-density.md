# Hero Braided Flow Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 첫 화면의 `Braided Flow` 입자를 화면 크기와 성능 예산을 유지하면서 리본 중심선 주변에 더 촘촘하게 배치한다.

**Architecture:** 기존 `braidedFlow()`의 `across` 좌표만 비선형 곡선으로 재매핑한다. 첫 조형 전용 데이터 속성과 셰이더 계약을 Playwright에 추가하며 다른 조형과 엔진 티어는 변경하지 않는다.

**Tech Stack:** React 19, TypeScript, WebGL2 GLSL, Playwright

## Global Constraints

- 메인 입자 수 70,000개와 반응형 티어를 변경하지 않는다.
- 다른 세 조형, 깊이 밝기, 포인터 피드백과 이탈 입자를 변경하지 않는다.
- 외곽 경계와 화면 점유율을 유지한다.
- 기존 사용자 변경 파일은 스테이징하지 않는다.

---

### Task 1: 첫 브레이드 중심 집중 분포

**Files:**

- Modify: `e2e/landing-hero-cinematic.chrome.spec.ts`
- Modify: `src/pages/landing/ui/hero-particle-shaders.ts`
- Modify: `src/pages/landing/ui/hero-particle-engine.ts`

**Interfaces:**

- Consumes: `braidedFlow(vec2 uv, float time)`과 `canvas.dataset.particleInitialShape`
- Produces: `compactAcross` 중심 집중 좌표와 `data-particle-initial-density="clustered"`

- [ ] **Step 1: 실패하는 회귀 테스트 작성**

```ts
expect(MAIN_VERTEX_SHADER).toContain(
  'float compactAcross = sign(across) * pow(abs(across), 1.45);',
);
await expect(canvas).toHaveAttribute('data-particle-initial-density', 'clustered');
```

- [ ] **Step 2: RED 확인**

Run: `pnpm exec playwright test e2e/landing-hero-cinematic.chrome.spec.ts --project=chrome --grep "clusters the initial braided flow" --workers=1`

Expected: `compactAcross`와 `data-particle-initial-density` 부재로 실패한다.

- [ ] **Step 3: 최소 구현**

```glsl
float compactAcross = sign(across) * pow(abs(across), 1.45);
float crossing = laneOffset * cos(uv.x * PI) * 0.74;
float y = crossing + sin(uv.x * TAU + phase) * 0.1 + compactAcross * 0.28;
```

```ts
canvas.dataset.particleInitialDensity = 'clustered';
```

- [ ] **Step 4: GREEN과 브라우저 검증**

Run: `pnpm exec playwright test e2e/landing-hero-cinematic.chrome.spec.ts --project=chrome --workers=1`

내부 브라우저 `http://localhost:3000/`에서 첫 조형의 리본 중심 밀도, 다음 조형 불변, 오버플로 0과 콘솔 오류 0을 확인한다.

- [ ] **Step 5: 정적 검증과 커밋**

Run: `pnpm exec eslint e2e/landing-hero-cinematic.chrome.spec.ts src/pages/landing/ui/hero-particle-engine.ts src/pages/landing/ui/hero-particle-shaders.ts`

Run: `pnpm exec tsc -b`

Run: `pnpm build`

Run: `graphify update .`

Commit: `feat(hero): 첫 브레이드 입자 밀도 집중`
