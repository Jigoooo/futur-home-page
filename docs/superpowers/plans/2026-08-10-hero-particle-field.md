# Hero Particle Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** FUTUR Hero의 단순 점 구름을 고밀도 3D 매개변수 곡면, 밀도 강화, 포인터 궤적 변위, 보조 방출 입자를 갖춘 raw WebGL2 파티클 필드로 교체한다.

**Architecture:** React 컴포넌트는 환경 조건과 lifecycle만 담당하고, WebGL 자원 생성은 작은 헬퍼 모듈, GLSL은 전용 셰이더 모듈, 프레임 패스 orchestration은 엔진 모듈로 분리한다. 매 프레임 `pointer displacement → density → emitter → main` 순서로 렌더링하며, 두 개의 128×128 float framebuffer를 교대로 사용해 포인터 변위를 감쇠·누적한다.

**Tech Stack:** React 19, TypeScript 6, raw WebGL2/GLSL ES 3.00, CSS Modules, Playwright 1.60, TanStack Start/Vite

## Global Constraints

- Hero 배경은 단색 `#06152b`를 사용한다.
- 데스크톱 메인 입자는 약 55,000개, 태블릿은 약 32,000개, 모바일은 약 16,000개를 사용한다.
- 곡면 유지 시간은 약 5.8초, 전환 시간은 약 520ms다.
- 신규 런타임 의존성, Three.js, React Three Fiber, 영상, bloom, 배경 그라디언트를 추가하지 않는다.
- `prefers-reduced-motion` 또는 Save-Data에서는 WebGL 시뮬레이션을 시작하지 않는다.
- Hero 문구, 버튼, Header 전환, Resend 전송, 문의 폼, 두 동의 영역은 변경하지 않는다.
- 기존 CI, Playwright 설정과 현재 더티 파일의 비관련 변경을 덮어쓰거나 되돌리지 않는다.
- 모든 소스 수정은 `apply_patch`로 수행하고, 완료 후 `graphify update .`을 실행한다.

---

## File Structure

- Create: `src/pages/landing/ui/hero-particle-gl.ts`
  - shader/program, buffer, half-float texture, framebuffer 생성과 정리를 담당한다.
- Create: `src/pages/landing/ui/hero-particle-shaders.ts`
  - 공통 매개변수 곡면 GLSL과 displacement, density, main, emitter shader source만 보관한다.
- Modify: `src/pages/landing/ui/hero-particle-engine.ts`
  - 입자 데이터, viewport tier, pointer trail, 네 개 렌더 패스, RAF lifecycle을 orchestration한다.
- Modify: `src/pages/landing/ui/hero-particle-background.tsx`
  - pointer event의 좌표·시간을 엔진에 전달하고 static/fallback/visibility 상태를 유지한다.
- Modify: `src/pages/landing/ui/styles/hero.module.css`
  - Hero 단색 배경과 캔버스 합성 상태를 확정한다.
- Modify: `src/routes/__root.tsx`
  - 브라우저 theme color를 Hero 배경과 일치시킨다.
- Modify: `e2e/landing-hero-cinematic.chrome.spec.ts`
  - 고밀도 렌더러, 곡면 변형, 포인터 변위, 폴백, 기존 Hero 회귀 계약을 검증한다.

---

### Task 1: 고밀도 Hero 런타임 계약 잠금

**Files:**

- Modify: `e2e/landing-hero-cinematic.chrome.spec.ts:51-120`

**Interfaces:**

- Consumes: 현재 `<canvas data-hero-particles>`와 `data-particle-state` 계약
- Produces: 엔진이 제공해야 할 `data-particle-count`, `data-particle-density`, `data-particle-displacement`, `data-particle-emitter`, `data-particle-surface`, `data-pointer-samples` 계약

- [ ] **Step 1: 고밀도 렌더러 실패 테스트 작성**

```ts
test('runs the dense parametric particle pipeline on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const hero = page.locator('[data-landing-hero]');
  const canvas = page.locator('canvas[data-hero-particles]');
  await expect(canvas).toHaveAttribute('data-particle-state', 'ready');
  await expect(hero).toHaveCSS('background-color', 'rgb(6, 21, 43)');
  await expect(canvas).toHaveCSS('opacity', '1');
  await expect(canvas).toHaveAttribute('data-particle-density', 'active');
  await expect(canvas).toHaveAttribute('data-particle-displacement', 'trail-24');
  await expect(canvas).toHaveAttribute('data-particle-emitter', 'active');

  const particleCount = Number(await canvas.getAttribute('data-particle-count'));
  expect(particleCount).toBeGreaterThanOrEqual(50_000);
});
```

- [ ] **Step 2: 포인터 궤적과 곡면 변형 실패 테스트 작성**

```ts
test('morphs surfaces and accumulates a damped pointer trail', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas[data-hero-particles]');
  await expect(canvas).toHaveAttribute('data-particle-state', 'ready');

  const initialSurface = await canvas.getAttribute('data-particle-surface');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  for (let step = 0; step < 8; step += 1) {
    await page.mouse.move(box.x + 480 + step * 18, box.y + 330 + Math.sin(step) * 32);
  }

  await expect
    .poll(async () => Number(await canvas.getAttribute('data-pointer-samples')))
    .toBeGreaterThan(2);
  await page.waitForTimeout(6_500);
  await expect(canvas).not.toHaveAttribute('data-particle-surface', initialSurface ?? '');
});
```

- [ ] **Step 3: focused RED 실행**

Run:

```bash
pnpm exec playwright test e2e/landing-hero-cinematic.chrome.spec.ts --project=chrome --grep "dense parametric|morphs surfaces" --workers=1
```

Expected: FAIL because the background is `rgb(8, 26, 66)`, desktop particle count is 13,500, and the density/displacement/emitter attributes do not exist.

- [ ] **Step 4: 테스트 파일만 커밋**

```bash
git add e2e/landing-hero-cinematic.chrome.spec.ts
git commit -m "test(hero): 고밀도 파티클 계약 추가"
```

---

### Task 2: WebGL 자원 헬퍼와 매개변수 곡면 셰이더 추가

**Files:**

- Create: `src/pages/landing/ui/hero-particle-gl.ts`
- Create: `src/pages/landing/ui/hero-particle-shaders.ts`
- Modify: `src/pages/landing/ui/hero-particle-engine.ts:1-220`

**Interfaces:**

- Produces:

```ts
export type RenderTarget = {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
};

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null;

export function createFloatRenderTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
): RenderTarget | null;

export function deleteRenderTarget(gl: WebGL2RenderingContext, target: RenderTarget): void;
```

- [ ] **Step 1: `hero-particle-gl.ts` 작성**

`createProgram`은 shader compile/link 실패 시 생성한 shader와 program을 모두 삭제하고 `null`을 반환한다. `createFloatRenderTarget`은 `RGBA16F + RGBA + HALF_FLOAT`, `CLAMP_TO_EDGE`, `LINEAR` texture를 만들고 framebuffer completeness를 확인한다.

```ts
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
  gl.deleteFramebuffer(framebuffer);
  gl.deleteTexture(texture);
  return null;
}
```

- [ ] **Step 2: 공통 곡면 GLSL 작성**

`hero-particle-shaders.ts`에서 `SURFACE_GLSL`을 main/density/emitter vertex shader가 공유한다. 네 곡면은 동일한 `vec2 uv`를 받아 `vec3`를 반환한다.

```glsl
vec3 foldedRibbon(vec2 uv, float time) {
  float u = (uv.x * 2.0 - 1.0) * 3.14159265;
  float v = (uv.y * 2.0 - 1.0) * 0.42;
  float fold = sin(u * 2.0 + time * 0.18) * 0.28;
  return vec3(sin(u) * (0.72 + v), v + fold, cos(u) * (0.48 + v));
}

vec3 asymmetricKnot(vec2 uv, float time) {
  float u = uv.x * 6.2831853;
  float v = (uv.y * 2.0 - 1.0) * 0.16;
  vec3 center = vec3(
    sin(u) + 0.38 * sin(3.0 * u),
    0.56 * sin(2.0 * u),
    cos(u) - 0.26 * cos(3.0 * u)
  );
  return center * 0.58 + vec3(v * cos(u), v * sin(u), v * sin(2.0 * u));
}

vec3 waveSaddle(vec2 uv, float time) {
  vec2 p = (uv * 2.0 - 1.0) * vec2(1.15, 0.72);
  float z = (p.x * p.x - p.y * p.y) * 0.34 + sin(p.x * 4.0 + time * 0.2) * 0.08;
  return vec3(p.x, p.y, z);
}

vec3 doubleLoop(vec2 uv, float time) {
  float u = uv.x * 6.2831853;
  float tube = (uv.y * 2.0 - 1.0) * 0.2;
  vec3 center = vec3(sin(u), 0.5 * sin(2.0 * u), 0.55 * cos(u));
  return center * 0.78 + vec3(tube * cos(u), tube, tube * sin(u));
}
```

- [ ] **Step 3: 곡면 선택과 정규화 함수 작성**

```glsl
vec3 sampleSurface(int index, vec2 uv, float time) {
  if (index == 0) return foldedRibbon(uv, time);
  if (index == 1) return asymmetricKnot(uv, time);
  if (index == 2) return waveSaddle(uv, time);
  return doubleLoop(uv, time);
}

vec3 morphSurface(int fromIndex, int toIndex, vec2 uv, float time, float morph) {
  vec3 fromPoint = sampleSurface(fromIndex, uv, time);
  vec3 toPoint = sampleSurface(toIndex, uv, time);
  return mix(fromPoint, toPoint, morph * morph * (3.0 - 2.0 * morph));
}
```

- [ ] **Step 4: TypeScript 정적 검증**

Run:

```bash
pnpm exec tsc -b --pretty false
pnpm exec eslint src/pages/landing/ui/hero-particle-gl.ts src/pages/landing/ui/hero-particle-shaders.ts
```

Expected: both commands exit 0.

- [ ] **Step 5: 헬퍼와 셰이더 커밋**

```bash
git add src/pages/landing/ui/hero-particle-gl.ts src/pages/landing/ui/hero-particle-shaders.ts
git commit -m "feat(hero): 파티클 곡면 셰이더 기반 추가"
```

---

### Task 3: 밀도·변위·방출 렌더 패스 구현

**Files:**

- Modify: `src/pages/landing/ui/hero-particle-engine.ts`
- Consume: `src/pages/landing/ui/hero-particle-gl.ts`
- Consume: `src/pages/landing/ui/hero-particle-shaders.ts`
- Test: `e2e/landing-hero-cinematic.chrome.spec.ts`

**Interfaces:**

- Produces:

```ts
export type HeroParticlePointer = {
  x: number;
  y: number;
  at: number;
};

export type HeroParticleEngine = {
  clearPointer: () => void;
  destroy: () => void;
  resize: () => void;
  setPointer: (position: HeroParticlePointer) => void;
  start: () => void;
  stop: () => void;
};
```

- [ ] **Step 1: 입자 tier와 저불일치 UV 버퍼 작성**

```ts
function getParticleTier(width: number) {
  if (width < 720) return { main: 16_000, emit: 0, dpr: 1.2 };
  if (width < 1180) return { main: 32_000, emit: 1_500, dpr: 1.35 };
  return { main: 55_000, emit: 3_000, dpr: 1.5 };
}

function halton(index: number, base: number) {
  let fraction = 1;
  let result = 0;
  let current = index;
  while (current > 0) {
    fraction /= base;
    result += fraction * (current % base);
    current = Math.floor(current / base);
  }
  return result;
}
```

각 입자에는 `aUv`, `aSeed`, `aDirection`을 할당한다. `aUv`는 `halton(index + 1, 2/3)`을 사용하고 seed/direction만 고정 seed PRNG로 생성한다.

- [ ] **Step 2: pointer trail ring buffer 작성**

최대 24개 샘플을 최신순으로 유지하고 120ms가 지난 입력은 shader 강도 계산에서 제외한다.

```ts
const POINTER_TRAIL_SIZE = 24;
const pointerTrail = new Float32Array(POINTER_TRAIL_SIZE * 4);

function pushPointerSample(pointer: HeroParticlePointer) {
  const dx = pointer.x - lastPointer.x;
  const dy = pointer.y - lastPointer.y;
  const elapsed = Math.max(pointer.at - lastPointer.at, 8);
  const velocity = Math.min(Math.hypot(dx, dy) / elapsed, 0.012);
  pointerSamples.unshift({ ...pointer, velocity });
  pointerSamples.length = Math.min(pointerSamples.length, POINTER_TRAIL_SIZE);
  canvas.dataset.pointerSamples = String(pointerSamples.length);
}
```

- [ ] **Step 3: 128×128 ping-pong displacement pass 구현**

두 render target을 만들고 fullscreen triangle fragment shader에 이전 texture, damping `0.96`, 최대 24개 pointer sample을 전달한다. 매 프레임 draw 후 read/write target을 교환한다.

```ts
gl.bindFramebuffer(gl.FRAMEBUFFER, displacementWrite.framebuffer);
gl.viewport(0, 0, FIELD_SIZE, FIELD_SIZE);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, displacementRead.texture);
gl.uniform1f(displacementUniforms.damping, 0.96);
gl.uniform4fv(displacementUniforms.pointerTrail, pointerTrail);
gl.drawArrays(gl.TRIANGLES, 0, 3);
[displacementRead, displacementWrite] = [displacementWrite, displacementRead];
```

- [ ] **Step 4: 128×128 density pass 구현**

density target을 투명하게 지운 후 동일한 surface vertex shader로 메인 입자를 렌더링하고 additive blend로 겹침을 누적한다.

```ts
gl.bindFramebuffer(gl.FRAMEBUFFER, densityTarget.framebuffer);
gl.viewport(0, 0, FIELD_SIZE, FIELD_SIZE);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE);
gl.drawArrays(gl.POINTS, 0, tier.main);
```

- [ ] **Step 5: main pass에서 변위와 밀도 합성**

main vertex shader는 투영된 screen UV로 displacement texture를 샘플링해 위치를 이동한다. fragment shader는 density texture를 샘플링해 아래 식으로 밝기를 강화한다.

```glsl
float density = texture(uDensityTexture, vScreenUv).r;
float densityLight = min(log(1.0 + density * 6.0) * 0.18, 0.7);
vec3 baseColor = mix(vec3(0.19, 0.42, 0.62), vec3(0.59, 0.86, 0.88), vDepth);
vec3 color = mix(baseColor, vec3(0.78, 0.95, 0.94), densityLight);
outColor = vec4(color, pointAlpha * (0.34 + densityLight));
```

- [ ] **Step 6: emitter pass 구현**

데스크톱·태블릿에서만 emitter buffer를 그리고, 표면 위치에서 고정 direction과 phase를 이용해 최대 5초 동안 이탈·감쇠시킨다. `tier.emit === 0`이면 program과 buffer는 만들되 draw는 생략하지 말고, 자원 자체를 생성하지 않는다.

- [ ] **Step 7: 렌더 상태와 정리 구현**

엔진 준비 시 아래 dataset을 설정한다.

```ts
canvas.dataset.particleCount = String(tier.main);
canvas.dataset.particleDensity = 'active';
canvas.dataset.particleDisplacement = 'trail-24';
canvas.dataset.particleEmitter = tier.emit > 0 ? 'active' : 'disabled';
canvas.dataset.particleSurface = '0-1';
canvas.dataset.pointerSamples = '0';
```

`destroy()`는 모든 program, buffer, VAO, texture, framebuffer를 삭제하고 RAF를 취소한다. 생성 도중 한 자원이라도 실패하면 이미 생성한 자원을 정리하고 `null`을 반환한다.

- [ ] **Step 8: focused GREEN 실행**

Run:

```bash
pnpm exec playwright test e2e/landing-hero-cinematic.chrome.spec.ts --project=chrome --grep "dense parametric|morphs surfaces" --workers=1
```

Expected: 2 passed.

- [ ] **Step 9: 엔진 구현 커밋**

```bash
git add src/pages/landing/ui/hero-particle-engine.ts e2e/landing-hero-cinematic.chrome.spec.ts
git commit -m "feat(hero): 고밀도 파티클 렌더 파이프라인 구현"
```

---

### Task 4: React lifecycle과 시각 표면 통합

**Files:**

- Modify: `src/pages/landing/ui/hero-particle-background.tsx:20-121`
- Modify: `src/pages/landing/ui/styles/hero.module.css:21-45`
- Modify: `src/routes/__root.tsx`
- Test: `e2e/landing-hero-cinematic.chrome.spec.ts`

**Interfaces:**

- Consumes: `HeroParticleEngine.setPointer({ x, y, at })`
- Preserves: static/fallback/ready, viewport intersection, document visibility, context lost cleanup

- [ ] **Step 1: pointer timestamp와 leave/cancel 처리 연결**

```ts
engine.setPointer({
  x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
  y: 1 - ((event.clientY - bounds.top) / bounds.height) * 2,
  at: event.timeStamp,
});

const handlePointerEnd = () => {
  pointerActive = false;
  canvas.dataset.pointerActive = 'false';
  engine.clearPointer();
};
```

`pointerleave`, `pointercancel`, hero 밖 `pointermove`에서 동일한 `handlePointerEnd`를 사용하고 cleanup에서 모든 listener를 제거한다.

- [ ] **Step 2: Hero 배경과 theme color 변경**

```css
.hero {
  background: #06152b;
}

.particleCanvas {
  width: 100%;
  height: 100%;
  max-width: none;
  opacity: 1;
}
```

`src/routes/__root.tsx`의 `theme-color`도 `#06152b`로 맞춘다.

- [ ] **Step 3: 전체 Hero 회귀 실행**

Run:

```bash
pnpm exec playwright test e2e/landing-hero-cinematic.chrome.spec.ts --project=chrome --workers=1
```

Expected: all Hero tests pass, including SSR, no-video, changing frames, pointer reaction, reduced-motion/Save-Data, title timing, and Header surface transition.

- [ ] **Step 4: 통합 변경 커밋**

```bash
git add src/pages/landing/ui/hero-particle-background.tsx src/pages/landing/ui/styles/hero.module.css src/routes/__root.tsx
git commit -m "feat(hero): 파티클 필드 lifecycle 통합"
```

---

### Task 5: 성능·브라우저·전체 회귀 검증

**Files:**

- Modify only if a verified regression requires a scoped correction
- Verify: `src/pages/landing/ui/hero-particle-*.ts`, `hero-particle-background.tsx`, `hero.module.css`, `__root.tsx`, Hero E2E

**Interfaces:**

- Consumes: completed Hero particle pipeline
- Produces: fresh completion evidence and an open `http://localhost:3000/` in the Codex in-app browser

- [ ] **Step 1: 정적 검증 실행**

```bash
pnpm exec eslint \
  src/pages/landing/ui/hero-particle-gl.ts \
  src/pages/landing/ui/hero-particle-shaders.ts \
  src/pages/landing/ui/hero-particle-engine.ts \
  src/pages/landing/ui/hero-particle-background.tsx
pnpm exec tsc -b --pretty false
pnpm build
git diff --check
```

Expected: all commands exit 0. 기존 비관련 lint warning이 있으면 파일과 메시지를 분리해 보고하되 새 warning은 0이어야 한다.

- [ ] **Step 2: 관련 Playwright 회귀 실행**

```bash
pnpm exec playwright test \
  e2e/landing-hero-cinematic.chrome.spec.ts \
  e2e/contact-delivery.chrome.spec.ts \
  --project=chrome --workers=1
```

Expected: Hero와 Contact/Resend 관련 테스트가 모두 통과한다.

- [ ] **Step 3: 내부 브라우저 데스크톱 시각 검증**

`http://localhost:3000/`을 Codex in-app browser에서 열고 다음을 확인한다.

- Hero 배경이 `rgb(6, 21, 43)`이다.
- 캔버스가 `ready`, density `active`, displacement `trail-24`, particle count `55000` 상태다.
- 포인터를 빠르게 움직이면 표면이 궤적을 따라 열리고 약하게 복원된다.
- 입자 표면이 제목을 가리지 않으며 가로 overflow가 0이다.
- 콘솔 `error`와 page error가 0건이다.

- [ ] **Step 4: 1024px와 390px responsive 검증**

1024×768에서는 particle count `32000`, 390×844에서는 `16000`과 emitter `disabled`를 확인한다. 모바일에서 제목·CTA가 잘리지 않고 포인터 기능이 없어도 일반 문서 흐름이 유지되어야 한다.

- [ ] **Step 5: graphify와 최종 diff 검증**

```bash
graphify update .
git diff --check
git status --short
```

그래프 축소 보호 경고가 발생하면 강제 덮어쓰지 않는다. 커밋 대상은 이 계획에서 소유한 Hero 파일과 테스트로 제한하고 비관련 더티 파일은 그대로 둔다.

- [ ] **Step 6: 최종 검증 커밋**

검증 중 실제 코드 보정이 있었을 때만 해당 파일을 개별 지정해 커밋한다.

```bash
git add \
  src/pages/landing/ui/hero-particle-gl.ts \
  src/pages/landing/ui/hero-particle-shaders.ts \
  src/pages/landing/ui/hero-particle-engine.ts \
  src/pages/landing/ui/hero-particle-background.tsx \
  src/pages/landing/ui/styles/hero.module.css \
  src/routes/__root.tsx \
  e2e/landing-hero-cinematic.chrome.spec.ts
git commit -m "fix(hero): 파티클 시각 회귀 보정"
```

수정이 없으면 새 커밋을 만들지 않는다.
