# FUTUR Header Transition Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero→Services 스크롤 경계의 불필요한 Header 재도색을 제거하고, dark surface 대비와
승인된 desktop Shared Glide indicator를 완성한다.

**Architecture:** 기존 `useAdaptiveHeader`의 desktop scroll rAF owner에 target dedupe를 추가해
geometry progress가 실제로 바뀔 때만 GSAP와 CSS custom property를 갱신한다. Header CSS는
`data-header-glass-tone`을 ink/border semantic authority로 사용한다. Shared indicator motion은 새
`header-active-indicator.ts`가 소유하며 active href가 바뀔 때만 link geometry를 측정한다.

**Tech Stack:** React 19, TypeScript 6, CSS Modules, GSAP 3.15, Playwright 1.60, axe-core

## Global Constraints

- desktop geometry progress와 160px range는 변경하지 않는다.
- Hero particle engine과 particle tier는 변경하지 않는다.
- mobile Compact/Expanded geometry와 timeline은 변경하지 않는다.
- 새 dependency를 추가하지 않는다.
- `aria-current='location'`이 semantic active source of truth다.
- public contact UI는 복원하지 않고 server/model/config/mail/legal 경계를 유지한다.
- 구현 전에 회귀 테스트를 RED로 확인하고 GREEN 뒤 각 Task를 독립 커밋한다.

---

### Task 1: 종료된 desktop geometry write 제거와 dark surface 대비 복구

**Files:**

- Modify: `src/pages/landing/ui/use-adaptive-header.ts`
- Modify: `src/pages/landing/ui/styles/header.module.css`
- Test: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Consumes: `getDesktopHeaderProgress(scrollY)`, `writeDesktopHeaderFrame(...)`
- Preserves: `HeaderLayout`, mobile motion lifecycle, active section mapping
- Produces: target progress/viewport dedupe inside the desktop scroll effect

- [ ] **Step 1: Add failing geometry-write and dark-tone tests**

  In `landing-adaptive-island.chrome.spec.ts`, instrument the Header element's style writes during
  a controlled scroll from 620px to 1240px. Count only these nine properties:

  ```ts
  const fluidProperties = new Set([
    '--header-fluid-width',
    '--header-fluid-height',
    '--header-fluid-radius',
    '--header-fluid-shell-start',
    '--header-fluid-shell-end',
    '--header-fluid-menu-gap',
    '--header-fluid-shadow-y',
    '--header-fluid-shadow-blur',
    '--header-fluid-shadow-alpha',
  ]);
  ```

  After the Header has settled at progress 1, dispatch 30 scroll steps across Hero→Services and
  assert the count is `0`. Resize 1280→1180 and assert the final Header width changes once to the
  correct `1132 * 0.92` target.

  Add computed-style assertions at Hero and Services:

  ```ts
  expect(heroInk).toBe('rgb(247, 250, 255)');
  expect(heroBorder).not.toBe('rgba(255, 255, 255, 0.58)');
  expect(servicesInk).toBe('rgb(7, 24, 63)');
  ```

- [ ] **Step 2: Run the focused tests and verify RED**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 --grep "settled desktop geometry|dark surface ink"
  ```

  Expected: geometry test reports repeated writes and Hero text remains navy with a strong white
  border.

- [ ] **Step 3: Deduplicate desktop motion targets**

  In the desktop scroll effect of `use-adaptive-header.ts`, keep:

  ```ts
  let targetProgress = proxy.value;
  let targetViewportWidth = viewportWidth;
  ```

  In `writeFrame`, return before calling `quickSetProgress` when both target values equal the next
  values. Update the stored targets immediately before the reduced-motion write or quick setter
  call. On resize, width inequality must still trigger one update even when progress is unchanged.

  In `updateActiveSection`, compare `nextSectionId` with `activeSectionIdRef.current` and return
  before `setActiveSectionId` when unchanged.

- [ ] **Step 4: Add semantic ink and optical-border variables**

  In `header.module.css`, define defaults on `.nav`:

  ```css
  --header-ink: #f7faff;
  --header-active-ink: var(--blue-2);
  --header-rim: rgba(151, 184, 235, 0.28);
  --header-inset-highlight: rgba(255, 255, 255, 0.22);
  ```

  Override them for light tone:

  ```css
  .nav[data-header-glass-tone='light'] {
    --header-ink: var(--navy);
    --header-active-ink: var(--blue);
    --header-rim: rgba(255, 255, 255, 0.58);
    --header-inset-highlight: rgba(255, 255, 255, 0.62);
  }
  ```

  Route `.logo`, `.navMenu`, hover/focus/active color and `.glassShell` border/inset highlight
  through these variables. Add only color/border-color transitions using `0.16s var(--ease-out)`.
  Preserve the existing glass background/filter and fallback selectors.

- [ ] **Step 5: Run focused and boundary verification**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 --grep "settled desktop geometry|dark surface ink|desktop fluid|glass"
  pnpm exec playwright test e2e/landing-hero-cinematic.chrome.spec.ts \
    e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --workers=1
  pnpm exec eslint src/pages/landing/ui/use-adaptive-header.ts \
    e2e/landing-adaptive-island.chrome.spec.ts
  pnpm exec tsc -b --pretty false
  git diff --check
  ```

- [ ] **Step 6: Commit Task 1**

  ```bash
  git add src/pages/landing/ui/use-adaptive-header.ts \
    src/pages/landing/ui/styles/header.module.css \
    e2e/landing-adaptive-island.chrome.spec.ts
  git commit -m "perf(landing): Header 스크롤 재도색과 dark 대비 보정"
  ```

---

### Task 2: Desktop Shared Glide active indicator

**Files:**

- Create: `src/pages/landing/ui/header-active-indicator.ts`
- Modify: `src/pages/landing/ui/use-adaptive-header.ts`
- Modify: `src/pages/landing/ui/header-section.tsx`
- Modify: `src/pages/landing/ui/styles/header.module.css`
- Test: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Produces: `startDesktopActiveIndicatorMotion(options): gsap.core.Timeline | null`
- Produces: `clearDesktopActiveIndicator(indicator: HTMLElement): void`
- Consumes: `activeHref`, `menuRef`, reduced-motion media query

- [ ] **Step 1: Add failing semantic and frame tests**

  Assert desktop `.menuLinks` contains exactly one `[data-header-active-indicator]`, while each link
  contains none. Scroll Services→Stack over 220ms and collect each rAF:

  ```ts
  type IndicatorFrame = { opacity: number; width: number; x: number };
  ```

  Require at least four distinct x frames, final x/width within 1px of the Stack link, and no final
  delta above 16px. Retarget to Team around 80ms and assert the next frame starts within 16px of the
  current frame. Hero/Footer must have opacity 0 and no `aria-current`.

- [ ] **Step 2: Run the focused indicator test and verify RED**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1 --grep "shared active indicator"
  ```

  Expected: FAIL because the current DOM mounts one link-local indicator and replaces it instantly.

- [ ] **Step 3: Add the isolated GSAP motion owner**

  Create `header-active-indicator.ts` with options containing `indicator`, `container`, `target`,
  `previousTimeline`, and `reducedMotion`. Measure target rect relative to container rect. Kill the
  prior timeline without clearing current transform, then tween x/width for `0.2s power3.out` and
  opacity for `0.12s power2.out`. Hide with `0.1s power2.out`. Add a child/pseudo specular whose
  opacity settles from `0.35` to `0.18` during the final `0.06s`. Reduced motion writes the final
  x/width/opacity immediately. Cleanup kills the timeline and clears `transform,width,opacity`.

- [ ] **Step 4: Render one shared desktop indicator and preserve mobile**

  In `header-section.tsx`, remove the conditional indicator inside each link. After the five links,
  render one span with `data-header-active-indicator` and `aria-hidden='true'`.

  In `use-adaptive-header.ts`, start/re-target the desktop indicator only when `activeHref`, desktop
  layout, or viewport width changes. Query the active anchor by its exact `href` inside `menuRef`.
  When entering mobile, kill and clear desktop motion; mobile menu opening must receive `null` for
  its old link-local indicator so existing geometry remains unchanged.

- [ ] **Step 5: Style the shared indicator**

  Make `.menuLinks` position relative. Set `.activeIndicator` to `left: 0`, `bottom: 7px`, `width: 0`,
  `height: 2px`, `opacity: 0`, `pointer-events: none`, and `background: var(--header-active-ink)`.
  Add a narrow inset specular pseudo-element. Do not add glow, bounce, capsule fill, or y motion.

- [ ] **Step 6: Run indicator and full Header verification**

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
    --project=chrome --workers=1
  pnpm exec playwright test e2e/landing-hero-cinematic.chrome.spec.ts \
    e2e/landing-runtime-errors.chrome.spec.ts \
    e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --workers=1
  pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts \
    e2e/a11y/landing.interactive.a11y.spec.ts --project=a11y --workers=1
  pnpm lint
  pnpm build
  graphify update .
  git diff --check
  ```

- [ ] **Step 7: Commit Task 2**

  ```bash
  git add src/pages/landing/ui/header-active-indicator.ts \
    src/pages/landing/ui/use-adaptive-header.ts \
    src/pages/landing/ui/header-section.tsx \
    src/pages/landing/ui/styles/header.module.css \
    e2e/landing-adaptive-island.chrome.spec.ts
  git commit -m "feat(landing): 활성 메뉴 Shared Glide 적용"
  ```
