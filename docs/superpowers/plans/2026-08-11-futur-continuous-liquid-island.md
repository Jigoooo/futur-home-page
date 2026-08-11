# FUTUR Continuous Liquid Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** 데스크톱 상단 메뉴를 항상 노출한 채 스크롤 진행률에 따라 소폭 연속 축소하고,
모바일 메뉴의 멈춤 뒤 점프를 제거하며, 배경이 식별되는 Clear Crystal Glass로 교체한다.

**Architecture:** Header의 접근성 상태는 React가 관리하되 데스크톱 스크롤 값은 React state를
거치지 않고 단일 `requestAnimationFrame`에서 CSS custom property로 기록한다. 모바일은 기존
paused `Flip` 경로를 제거하고 현재 geometry에서 시작하는 단일 GSAP timeline을 사용한다. outer
fixed positioner와 inner glass surface의 책임을 유지하며, 모든 전환은 중간 프레임 E2E로 검증한다.

**Tech Stack:** React 19, TypeScript 6, CSS Modules, GSAP 3.15, Playwright 1.60, axe-core

## Global Constraints

- 데스크톱 901px 이상에서는 로고와 `서비스 · 기술 · 팀 · 프로세스 · FAQ`를 항상 노출한다.
- 데스크톱 progress는 `clamp(scrollY / 160, 0, 1)`이며 width는 최대 8%, height는 `76px → 약
68px`, padding과 gap은 약 10%, radius는 `28px → 24px`만 축소한다.
- 모바일은 `220×56px` Compact와 최대 `370×158px`의 3+2 Expanded 구조를 유지한다.
- 모바일 열기 `320ms`, 닫기 `280ms`, item stagger `28ms`, easing은 bounded
  `power3.inOut`이며 overshoot와 bounce를 사용하지 않는다.
- dark tint는 흰색 alpha 약 `0.18`, light tint는 약 `0.26`, blur는 `18~22px`, saturate는 약
  `135%`, contrast는 약 `1.03`을 기준으로 한다.
- backdrop-filter 미지원 및 `prefers-contrast: more`에서만 alpha 약 `0.92` fallback을 쓴다.
- Hero particle, custom cursor, 본문 section, FAQ, Footer, 문의 server/model/config/mail/legal
  경계를 변경하지 않는다.
- 공개 문의 UI와 `#contact`를 복원하지 않는다.
- 새 dependency를 추가하지 않는다.
- 모든 구현은 테스트를 먼저 RED로 만들고 GREEN 후 독립 커밋한다.

---

## File Structure

- Create: `src/pages/landing/ui/header-motion.ts`
  - desktop progress 계산, CSS custom property 기록, mobile geometry와 GSAP timeline을 소유한다.
- Modify: `src/pages/landing/ui/use-adaptive-header.ts`
  - viewport별 semantic layout, section tracking, dismissal, focus ownership, motion lifecycle을
    조정한다.
- Modify: `src/pages/landing/ui/header-section.tsx`
  - desktop/mobile 접근성 노출과 motion phase marker를 렌더링한다.
- Modify: `src/pages/landing/ui/styles/header.module.css`
  - desktop fluid geometry, mobile visual phase, Clear Crystal Glass와 fallback을 정의한다.
- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
  - 기존 Adaptive Island 계약을 Continuous Liquid Island의 frame·focus·fallback 계약으로
    교체한다.
- Modify: `e2e/landing-hero-cinematic.chrome.spec.ts`
  - 48px 이후 Compact 전환 기대를 desktop fluid surface/tone 기대와 맞춘다.
- Modify: `e2e/landing-runtime-errors.chrome.spec.ts`
  - 데스크톱 Compact toggle 의존 없이 desktop nav와 mobile menu를 각각 smoke test한다.
- Modify: `DESIGN.md`
  - Header 권위 문서를 새 상태, geometry, glass, motion 계약으로 갱신한다.

---

### Task 1: 데스크톱 메뉴 상시 노출과 scroll-linked geometry

**Files:**

- Create: `src/pages/landing/ui/header-motion.ts`
- Modify: `src/pages/landing/ui/use-adaptive-header.ts`
- Modify: `src/pages/landing/ui/header-section.tsx`
- Modify: `src/pages/landing/ui/styles/header.module.css`
- Test: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Produces: `HeaderLayout = 'desktop-fluid' | 'mobile-compact' | 'mobile-expanded'`
- Produces: `getDesktopHeaderProgress(scrollY: number): number`
- Produces: `writeDesktopHeaderFrame(header: HTMLElement, viewportWidth: number, progress: number): void`
- Produces: `clearDesktopHeaderFrame(header: HTMLElement): void`
- Consumes: existing `getVisibleSectionId()`, navigation anchors, glass tone mapping, focus ownership

- [ ] **Step 1: Replace the desktop Compact regression with failing continuous geometry tests**

  In `e2e/landing-adaptive-island.chrome.spec.ts`, add a sampler that records one frame at a time:

  ```ts
  async function sampleHeaderFrames(page: Page, durationMs: number) {
    return header(page).evaluate(async (element, duration) => {
      const samples: Array<{ height: number; radius: number; width: number }> = [];
      const startedAt = performance.now();

      do {
        const rect = element.getBoundingClientRect();
        const glass = element.querySelector<HTMLElement>('[data-header-glass]');
        samples.push({
          height: Math.round(rect.height * 100) / 100,
          radius: Number.parseFloat(getComputedStyle(glass!).borderRadius),
          width: Math.round(rect.width * 100) / 100,
        });
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      } while (performance.now() - startedAt < duration);

      return samples;
    }, durationMs);
  }
  ```

  Assert at scrollY `0, 40, 80, 120, 160` that all five links and the logo remain visible,
  `data-header-layout='desktop-fluid'`, and the Compact toggle remains `aria-hidden='true'` with
  `tabindex='-1'`. Scroll from 0 to 160 while sampling for 360ms and assert:

  ```ts
  expect(new Set(samples.map(({ width }) => width)).size).toBeGreaterThanOrEqual(5);
  expect(samples.at(-1)!.width).toBeCloseTo(1133.44, 0); // 1280 viewport: 1232 * 0.92
  expect(samples.at(-1)!.height).toBeCloseTo(68, 0);
  expect(samples.at(-1)!.radius).toBeCloseTo(24, 0);
  ```

  Check monotonic decrease and repeat in reverse for monotonic restoration. Verify the nav links
  retain unchanged computed font-size during the motion.

- [ ] **Step 2: Run the new desktop contract and verify RED**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 --grep "desktop fluid"
  ```

  Expected: FAIL because the current Header becomes `compact`, hides its menu, and jumps directly to
  `220×58px`.

- [ ] **Step 3: Add pure desktop motion primitives**

  Create `src/pages/landing/ui/header-motion.ts` with these exact exports:

  ```ts
  import gsap from 'gsap';

  export const DESKTOP_HEADER_SCROLL_RANGE = 160;

  export function getDesktopHeaderProgress(scrollY: number) {
    return Math.min(1, Math.max(0, scrollY / DESKTOP_HEADER_SCROLL_RANGE));
  }

  const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

  export function writeDesktopHeaderFrame(
    header: HTMLElement,
    viewportWidth: number,
    progress: number,
  ) {
    const baseWidth = Math.min(1680, viewportWidth - 48);
    header.style.setProperty(
      '--header-fluid-width',
      `${lerp(baseWidth, baseWidth * 0.92, progress)}px`,
    );
    header.style.setProperty('--header-fluid-height', `${lerp(76, 68, progress)}px`);
    header.style.setProperty('--header-fluid-radius', `${lerp(28, 24, progress)}px`);
    header.style.setProperty('--header-fluid-shell-start', `${lerp(22, 20, progress)}px`);
    header.style.setProperty('--header-fluid-shell-end', `${lerp(18, 16.2, progress)}px`);
    header.style.setProperty('--header-fluid-menu-gap', `${lerp(12, 10.8, progress)}px`);
    header.style.setProperty('--header-fluid-shadow-y', `${lerp(18, 12, progress)}px`);
    header.style.setProperty('--header-fluid-shadow-blur', `${lerp(48, 34, progress)}px`);
    header.style.setProperty('--header-fluid-shadow-alpha', `${lerp(0.12, 0.16, progress)}`);
  }

  export function clearDesktopHeaderFrame(header: HTMLElement) {
    gsap.killTweensOf(header);
    for (const name of [
      '--header-fluid-width',
      '--header-fluid-height',
      '--header-fluid-radius',
      '--header-fluid-shell-start',
      '--header-fluid-shell-end',
      '--header-fluid-menu-gap',
      '--header-fluid-shadow-y',
      '--header-fluid-shadow-blur',
      '--header-fluid-shadow-alpha',
    ]) {
      header.style.removeProperty(name);
    }
  }
  ```

  Keep these helpers free of DOM queries and React state.

- [ ] **Step 4: Replace desktop structural switching with one rAF progress owner**

  In `use-adaptive-header.ts`:
  - change `HeaderLayout` to the three values defined above;
  - initialize desktop as `desktop-fluid`, mobile as `mobile-compact` after hydration;
  - remove desktop Hero sentinel → Compact state changes and the desktop focus-transfer branches that
    exist only because visible links were hidden;
  - retain mobile focus return, dismissal, section tracking, `glassTone`, and hash navigation;
  - add a passive `scroll` and `resize` effect that stores the latest values and schedules at most one
    frame;
  - in no-preference motion, create one mutable `{ value: number }` proxy and one
    `gsap.quickTo(proxy, 'value', { duration: 0.2, ease: 'power2.out', onUpdate })`; its `onUpdate`
    calls `writeDesktopHeaderFrame(header, window.innerWidth, proxy.value)`; invoke the same quick
    setter from every scheduled scroll frame instead of constructing new tweens;
  - in reduced motion, bypass the proxy tween and call `writeDesktopHeaderFrame` immediately;
  - cancel the rAF and call `clearDesktopHeaderFrame` on unmount or when entering mobile.

  Update the inline initial-layout script to emit `mobile-compact` at 900px 이하 and
  `desktop-fluid` otherwise. Update the matching no-JS CSS selector names in the same task so the
  first paint never uses removed state names.

  `header-section.tsx` must derive accessibility exactly as follows:

  ```ts
  const desktopFluid = layout === 'desktop-fluid';
  const menuExpanded = layout === 'mobile-expanded';
  const menuAccessible = desktopFluid || menuExpanded;
  const logoAccessible = desktopFluid;
  const toggleAccessible = layout === 'mobile-compact';
  ```

- [ ] **Step 5: Make desktop dimensions consume only motion custom properties**

  In `header.module.css`, replace desktop layout selectors with:

  ```css
  .nav {
    width: var(--header-fluid-width, min(1680px, calc(100% - 48px)));
    height: var(--header-fluid-height, 76px);
  }

  .glassShell {
    padding-inline: var(--header-fluid-shell-start, 22px) var(--header-fluid-shell-end, 18px);
    border-radius: var(--header-fluid-radius, 28px);
  }

  .menuLinks {
    gap: var(--header-fluid-menu-gap, 12px);
  }

  .glassShell {
    box-shadow:
      0 var(--header-fluid-shadow-y, 18px) var(--header-fluid-shadow-blur, 48px)
        rgba(9, 22, 52, var(--header-fluid-shadow-alpha, 0.12)),
      inset 0 1px 0 rgba(255, 255, 255, 0.62),
      inset 0 -1px 0 rgba(115, 135, 174, 0.1);
  }
  ```

  Scope all Compact/Expanded geometry and visually-hidden selectors to `@media (max-width: 900px)`.
  Do not scale text and do not set inline `width` or `height` properties from the scroll handler.
  Keep desktop `--landing-compact-header-offset: 92px` and mobile `82px`; the desktop value covers
  top `18px` + final `68px` height + `6px` breathing room.

- [ ] **Step 6: Run focused desktop tests and static checks**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 --grep "desktop fluid"
  pnpm exec eslint src/pages/landing/ui/header-motion.ts \
    src/pages/landing/ui/use-adaptive-header.ts src/pages/landing/ui/header-section.tsx
  pnpm exec tsc -b --pretty false
  git diff --check
  ```

  Expected: desktop tests PASS, no new lint/type errors, clean diff.

- [ ] **Step 7: Commit the desktop unit**

  ```bash
  git add e2e/landing-adaptive-island.chrome.spec.ts \
    src/pages/landing/ui/header-motion.ts \
    src/pages/landing/ui/use-adaptive-header.ts \
    src/pages/landing/ui/header-section.tsx \
    src/pages/landing/ui/styles/header.module.css
  git commit -m "feat(landing): 데스크톱 Header 연속 축소 적용"
  ```

---

### Task 2: 모바일 Compact ↔ Expanded 실제 geometry timeline

**Files:**

- Modify: `src/pages/landing/ui/header-motion.ts`
- Modify: `src/pages/landing/ui/use-adaptive-header.ts`
- Modify: `src/pages/landing/ui/header-section.tsx`
- Modify: `src/pages/landing/ui/styles/header.module.css`
- Test: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Consumes: `HeaderLayout`, existing dismissal/focus ownership, `data-header-toggle`,
  `data-header-close`
- Produces: `HeaderMotionPhase = 'idle' | 'opening' | 'closing'`
- Produces: `getMobileHeaderGeometry(layout, viewportWidth)` returning `{ width: number; height: number }`
- Produces: `startMobileHeaderMotion(options): gsap.core.Timeline | null`

- [ ] **Step 1: Add failing per-frame mobile tests**

  Extend the E2E sampler to collect `{ time, width, height, inlineTransform }` on every animation
  frame. Test open, close, and an opposite input at about 120ms. Use these assertions:

  ```ts
  expect(new Set(samples.map(({ width }) => width)).size).toBeGreaterThanOrEqual(5);
  expect(new Set(samples.map(({ height }) => height)).size).toBeGreaterThanOrEqual(5);
  expect(longestEqualGeometryRun(samples)).toBeLessThan(80);
  expect(Math.abs(last.width - previous.width)).toBeLessThan(16);
  expect(Math.abs(last.height - previous.height)).toBeLessThan(10);
  await expect(header(page)).not.toHaveAttribute('data-header-motion');
  expect(await header(page).getAttribute('style')).not.toMatch(/transform|width|height|opacity/);
  ```

  Also assert menu item opacity/translate changes and exactly five items remain in the 3+2 grid.

- [ ] **Step 2: Run the mobile frame contract and verify RED**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 --grep "mobile geometry|interrupted mobile"
  ```

  Expected: FAIL with a long `220×56px` plateau followed by the final `370×158px` jump.

- [ ] **Step 3: Remove Flip and add the single mobile timeline**

  Remove `Flip`, `pendingFlipRef`, `Flip.getState`, `Flip.from`, and `Flip.killFlipsOf` from
  `use-adaptive-header.ts`. Extend `header-motion.ts`:

  ```ts
  export type MobileHeaderLayout = 'mobile-compact' | 'mobile-expanded';
  export type HeaderMotionPhase = 'idle' | 'opening' | 'closing';

  export type MobileHeaderMotionOptions = {
    header: HTMLElement;
    indicator: HTMLElement | null;
    menuItems: HTMLElement[];
    onComplete: () => void;
    onPhaseChange: (phase: HeaderMotionPhase) => void;
    previousTimeline: gsap.core.Timeline | null;
    reducedMotion: boolean;
    target: MobileHeaderLayout;
    viewportWidth: number;
  };

  export function getMobileHeaderGeometry(layout: MobileHeaderLayout, viewportWidth: number) {
    return layout === 'mobile-expanded'
      ? { width: Math.min(370, viewportWidth - 20), height: 158 }
      : { width: Math.min(220, viewportWidth - 20), height: 56 };
  }

  export function startMobileHeaderMotion(
    options: MobileHeaderMotionOptions,
  ): gsap.core.Timeline | null {
    const {
      header,
      indicator,
      menuItems,
      onComplete,
      onPhaseChange,
      previousTimeline,
      reducedMotion,
      target,
      viewportWidth,
    } = options;
    const current = header.getBoundingClientRect();
    const destination = getMobileHeaderGeometry(target, viewportWidth);
    const opening = target === 'mobile-expanded';
    const interrupted = previousTimeline !== null;
    const clear = () => {
      delete header.dataset.headerMotion;
      header.style.removeProperty('--header-mobile-width');
      header.style.removeProperty('--header-mobile-height');
      gsap.set([...menuItems, indicator].filter(Boolean), {
        clearProps: 'opacity,transform,transformOrigin',
      });
      onPhaseChange('idle');
    };

    previousTimeline?.eventCallback('onInterrupt', null);
    previousTimeline?.kill();
    header.style.setProperty('--header-mobile-width', `${current.width}px`);
    header.style.setProperty('--header-mobile-height', `${current.height}px`);

    if (reducedMotion) {
      clear();
      onComplete();
      return null;
    }

    header.dataset.headerMotion = 'true';
    onPhaseChange(opening ? 'opening' : 'closing');
    const timeline = gsap.timeline({
      onComplete: () => {
        clear();
        onComplete();
      },
      onInterrupt: clear,
    });
    timeline.to(
      header,
      {
        '--header-mobile-height': `${destination.height}px`,
        '--header-mobile-width': `${destination.width}px`,
        duration: opening ? 0.32 : 0.28,
        ease: 'power3.inOut',
      },
      0,
    );

    if (opening) {
      if (!interrupted) gsap.set(menuItems, { opacity: 0, y: 6 });
      timeline.to(
        menuItems,
        { duration: 0.2, ease: 'power2.out', opacity: 1, stagger: 0.028, y: 0 },
        0.07,
      );
      if (indicator) {
        if (!interrupted) gsap.set(indicator, { scaleX: 0.78, transformOrigin: 'left center' });
        timeline.to(indicator, { duration: 0.07, ease: 'power2.out', scaleX: 1 }, 0.21);
      }
    } else {
      timeline.to(menuItems, { duration: 0.12, ease: 'power2.in', opacity: 0, y: -2 }, 0);
    }

    return timeline;
  }
  ```

  `startMobileHeaderMotion` must:
  - kill the previous timeline without clearing the current computed geometry;
  - read the current root rect once;
  - set only `--header-mobile-width` and `--header-mobile-height` to that rect;
  - tween those custom properties to target geometry for `0.32s` open or `0.28s` close;
  - open items from `opacity: 0, y: 6` with `0.028s` stagger;
  - close items to `opacity: 0, y: -2` before the shell finishes;
  - animate the indicator once after readable menu content, with `power2.out` and no overshoot;
  - set `data-header-motion='true'` only during the timeline;
  - on complete/interruption remove the two custom properties and all item/indicator inline
    `opacity` and `transform` values.

- [ ] **Step 4: Expose a visual phase without weakening accessibility**

  In `use-adaptive-header.ts`, keep semantic layout target immediate and return `motionPhase`. On
  closing, set nav `aria-hidden=true` and all links `tabIndex=-1` immediately, but let CSS keep its
  visual layer present while `data-header-motion-phase='closing'`. Restore toggle focus using the
  existing generation/token path. Cancel focus reservations on reopen, outside focus, and outside
  pointer ownership.

  In `header-section.tsx`, render:

  ```tsx
  data-header-motion-phase={motionPhase === 'idle' ? undefined : motionPhase}
  ```

  and preserve `aria-expanded`, `aria-controls`, dynamic names, `aria-current='location'`, and the
  close controller.

- [ ] **Step 5: Bind mobile CSS to custom geometry**

  Under `@media (max-width: 900px)`:

  ```css
  .nav {
    width: var(--header-mobile-width, min(220px, calc(100% - 20px)));
    height: var(--header-mobile-height, 56px);
  }

  .nav[data-header-layout='mobile-expanded'] {
    width: var(--header-mobile-width, calc(100% - 20px));
    height: var(--header-mobile-height, 158px);
  }
  ```

  Keep the closing nav visually rendered only while `data-header-motion-phase='closing'`; pointer
  events and accessibility remain disabled. Do not add CSS transitions that compete with GSAP.

- [ ] **Step 6: Verify mobile motion, interruption, keyboard, and no-JS**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 \
    --grep "mobile geometry|interrupted mobile|keyboard|focus|no-JavaScript|reduced motion"
  pnpm exec eslint src/pages/landing/ui/header-motion.ts \
    src/pages/landing/ui/use-adaptive-header.ts src/pages/landing/ui/header-section.tsx
  pnpm exec tsc -b --pretty false
  git diff --check
  ```

  Expected: all selected tests PASS and the final Header has no leftover motion inline properties.

- [ ] **Step 7: Commit the mobile unit**

  ```bash
  git add e2e/landing-adaptive-island.chrome.spec.ts \
    src/pages/landing/ui/header-motion.ts \
    src/pages/landing/ui/use-adaptive-header.ts \
    src/pages/landing/ui/header-section.tsx \
    src/pages/landing/ui/styles/header.module.css
  git commit -m "fix(landing): 모바일 Island 중간 프레임 복구"
  ```

---

### Task 3: Clear Crystal Glass와 fallback cascade

**Files:**

- Modify: `src/pages/landing/ui/styles/header.module.css`
- Test: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Consumes: `data-header-glass`, `data-header-glass-tone='dark|light'`, spotlight `--mx/--my`
- Produces: one translucent surface with dark `0.18`, light `0.26`, fallback/high contrast `0.92`

- [ ] **Step 1: Tighten the automated glass contract and verify RED**

  Update `readGlassStyle()` to also read `::before` and `::after`. Assert:

  ```ts
  expect(dark.backgroundColor).toBe('rgba(248, 250, 255, 0.18)');
  expect(light.backgroundColor).toBe('rgba(248, 250, 255, 0.26)');
  expect(dark.backdropFilter).toBe('blur(20px) saturate(1.35) contrast(1.03)');
  expect(Number(dark.beforeOpacity)).toBeLessThanOrEqual(0.28);
  expect(dark.afterBackdropFilter).toBe('none');
  ```

  Force the existing `@supports not` rules through CSSOM and assert dark/light both become
  `rgba(248, 250, 255, 0.92)` with standard and WebKit backdrop filters equal to `none`. Repeat with
  `prefers-contrast: more`.

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 --grep "crystal glass|fallback"
  ```

  Expected: FAIL on the current `0.46/0.66`, extra opaque gradients, and `0.94` fallback.

- [ ] **Step 2: Replace the opaque layer stack**

  Change `.glassShell` to:

  ```css
  .glassShell {
    border: 1px solid rgba(255, 255, 255, 0.58);
    background: rgba(248, 250, 255, 0.18);
    -webkit-backdrop-filter: blur(20px) saturate(135%) contrast(1.03);
    backdrop-filter: blur(20px) saturate(135%) contrast(1.03);
    box-shadow:
      0 var(--header-fluid-shadow-y, 18px) var(--header-fluid-shadow-blur, 48px)
        rgba(9, 22, 52, var(--header-fluid-shadow-alpha, 0.12)),
      inset 0 1px 0 rgba(255, 255, 255, 0.62),
      inset 0 -1px 0 rgba(115, 135, 174, 0.1);
  }

  .nav[data-header-glass-tone='light'] .glassShell {
    background: rgba(248, 250, 255, 0.26);
  }
  ```

  Keep `::before` as one low-opacity radial/specular layer and remove the full lower progressive
  blur from `::after`; if `::after` remains for a 1px rim, it must not use `backdrop-filter`.

- [ ] **Step 3: Correct fallback and interaction media queries**

  In both `@supports not (...)` and `@media (prefers-contrast: more)`, use selectors with equal or
  greater specificity than both normal tone selectors and set:

  ```css
  background: rgba(248, 250, 255, 0.92);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  ```

  Keep pointer reflection only under fine pointer + no-preference motion. Coarse and reduced motion
  must leave `--mx/--my` at the static center.

- [ ] **Step 4: Verify glass, cursor boundary, and axe**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    e2e/landing-cursor.chrome.spec.ts \
    e2e/a11y/landing.static.a11y.spec.ts \
    e2e/a11y/landing.interactive.a11y.spec.ts \
    --project=chrome --workers=1
  git diff --check
  ```

- [ ] **Step 5: Commit the glass unit**

  ```bash
  git add e2e/landing-adaptive-island.chrome.spec.ts \
    src/pages/landing/ui/styles/header.module.css
  git commit -m "style(landing): Header 유리 투과감 보정"
  ```

---

### Task 4: 기존 Header 회귀와 권위 문서 정합성

**Files:**

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
- Modify: `e2e/landing-hero-cinematic.chrome.spec.ts`
- Modify: `e2e/landing-runtime-errors.chrome.spec.ts`
- Modify: `DESIGN.md`

**Interfaces:**

- Consumes: final `HeaderLayout`, mobile controls, glass/fallback contracts
- Produces: current runtime smoke and root design authority without stale desktop Compact claims

- [ ] **Step 1: Remove stale desktop Compact expectations without deleting mobile coverage**

  In the Adaptive spec:
  - replace desktop `enterCompactLayout()` callers with direct `desktop-fluid` assertions;
  - retain mobile click/Enter/Space, 3+2, Escape, outside click, 24px scroll, menu selection, rapid
    reverse, outside focus/pointer ownership, reduced-motion, no-JS, active section, cursor, and
    fallback tests;
  - delete only desktop focus-transfer tests whose hidden-control transition no longer exists;
  - add a desktop tab-order test proving logo → five nav links remain reachable at scrollY 160.

  In `landing-hero-cinematic.chrome.spec.ts`, replace the test named “transitions the header from the
  hero surface after the 48px sentinel” with a test that verifies:

  ```ts
  await expect(header).toHaveAttribute('data-header-layout', 'desktop-fluid');
  await page.evaluate(() => window.scrollTo({ top: 160, behavior: 'instant' }));
  await expect(header).toHaveAttribute('data-header-glass-tone', 'light');
  await expect(header.getByRole('link', { name: '서비스' })).toBeVisible();
  ```

  In runtime smoke, exercise a desktop nav link and a separate 390px mobile toggle rather than
  clicking a desktop toggle that is intentionally hidden.

- [ ] **Step 2: Run focused legacy and runtime suites**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    e2e/landing-hero-cinematic.chrome.spec.ts \
    e2e/landing-runtime-errors.chrome.spec.ts \
    --project=chrome --workers=1
  ```

  Expected: all tests PASS with no stale `hero-expanded → compact` desktop assertion.

- [ ] **Step 3: Update root DESIGN authority**

  Replace the Header section in `DESIGN.md` with the approved state names and numeric contracts.
  Explicitly state that
  `docs/superpowers/specs/2026-08-11-futur-continuous-liquid-island-design.md` supersedes only the
  Header state/motion/glass portions of the earlier Adaptive Island spec. Preserve contact UI removal
  and server/model/config/mail/legal boundaries verbatim.

- [ ] **Step 4: Scan for stale contracts and verify docs diff**

  ```bash
  rg -n "desktop.*compact|hero-expanded.*compact|0\.46|0\.66|paused: true|Flip\.from" \
    src/pages/landing/ui e2e DESIGN.md
  rg -n "#contact|문의하기" src/pages/landing/ui src/pages/landing/config/navigation.ts
  git diff --check
  ```

  Expected: first scan has no live stale Header contract; second scan has no public contact UI or
  navigation reintroduction.

- [ ] **Step 5: Commit regression and documentation alignment**

  ```bash
  git add DESIGN.md \
    e2e/landing-adaptive-island.chrome.spec.ts \
    e2e/landing-hero-cinematic.chrome.spec.ts \
    e2e/landing-runtime-errors.chrome.spec.ts
  git commit -m "test(landing): Continuous Island 회귀 계약 정리"
  ```

---

### Task 5: 포트 3000 시각 QA와 전체 게이트

**Files:**

- Verify only: all changed files
- Generate ignored evidence: `.review-screens/continuous-liquid-island/*.png`

**Interfaces:**

- Consumes: completed Tasks 1–4
- Produces: fresh visual and automated completion evidence

- [ ] **Step 1: Start the verified app on port 3000**

  ```bash
  pnpm dev --host 127.0.0.1 --port 3000
  ```

  Confirm the process did not fall back to another port before capturing evidence.

- [ ] **Step 2: Capture the required states**

  At `1280×720` and `390×844`, capture Hero, Services, Operations, and Footer. Capture desktop at
  progress 0 and 1; capture mobile Compact and Expanded. Store exactly under:

  ```text
  .review-screens/continuous-liquid-island/
  ```

  Before each image, assert `scrollWidth === clientWidth`, wait for particle ready on Hero, and wait
  for `data-header-motion` to be absent except when intentionally capturing an intermediate frame.

- [ ] **Step 3: Inspect every capture at original resolution**

  Record pass/fail for:
  - all five desktop menu labels remaining visible at maximum shrink;
  - desktop shrink being noticeable but not capsule-like;
  - mobile 3+2 menu containment and no last-frame jump;
  - particle/section colors remaining identifiable through the glass;
  - rim and reflection not becoming a white card;
  - active underline, text contrast, focus ring, and horizontal overflow.

  If any P0/P1 visual problem is found, add a failing regression before one bounded fix pass and
  recapture only affected states.

- [ ] **Step 4: Run final automated gates sequentially**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    e2e/landing-hero-cinematic.chrome.spec.ts \
    e2e/landing-runtime-errors.chrome.spec.ts \
    e2e/landing-cursor.chrome.spec.ts \
    e2e/a11y/landing.static.a11y.spec.ts \
    e2e/a11y/landing.interactive.a11y.spec.ts \
    --project=chrome --workers=1
  pnpm test:e2e -- --workers=1
  pnpm lint
  pnpm build
  graphify update .
  git diff --check
  ```

  Report exact pass/fail/skip totals. Existing environment-guard skips may remain only when their
  reasons match the preserved server boundary; do not relabel a new failure as flaky.

- [ ] **Step 5: Run final forbidden and dependency scans**

  ```bash
  git diff -- package.json pnpm-lock.yaml
  rg -n "paused: true|Flip\.from|hero-expanded.*compact" src/pages/landing/ui e2e DESIGN.md
  rg -n "href=['\"]#contact|id=['\"]contact|문의하기" src/pages/landing/ui \
    src/pages/landing/config/navigation.ts
  git status --short --branch
  ```

  Expected: no dependency diff, no paused Flip/live desktop Compact contract, no public contact UI,
  and a clean tracked worktree.

- [ ] **Step 6: Commit any verification-only test or doc repair separately**

  Only if Step 3 or 4 required a bounded repair:

  ```bash
  git add <exact-repaired-files>
  git commit -m "fix(landing): Continuous Island 최종 QA 보정"
  ```

  Do not commit `.review-screens`, `.env.local`, or generated local reports.
