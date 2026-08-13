# Services A/B Anti-Slop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** C 시안을 제거하고 A/B 서비스 시안을 절제된 테크 에디토리얼 디자인과 정보 중심 모션으로 정리한다.

**Architecture:** `ServicesSection`은 개발용 `a | b` 미리보기 경계만 담당하고, A와 B는 각 컴포넌트와 CSS Module이 독립적으로 표현을 소유한다. 기존 landing one-shot reveal과 CSS transition을 재사용하며 새 의존성은 추가하지 않는다.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vite, Playwright

## Global Constraints

- FUTUR navy, blue, off-white palette를 유지한다.
- 30px 이상의 서비스 카드 라운드는 10~16px 범위로 축소한다.
- 장식용 그라디언트, 확산 그림자, 추상 도형, 반복 pill chip을 제거한다.
- 모션 이동 거리는 최대 12px, 지속시간은 약 420~560ms로 제한한다.
- 카드 전체 상승, 그림자 확대, 회전 및 hover 이동 효과를 사용하지 않는다.
- B 카드 내부의 SVG 아이콘과 장식 전용 도형을 모두 제거한다.
- `prefers-reduced-motion: reduce`와 터치 환경에서는 불필요한 모션을 제거한다.
- 새 UI 또는 애니메이션 의존성을 추가하지 않는다.
- 기존 Hero 및 Team, Operations, FAQ 구현은 수정하지 않는다.

---

### Task 1: Remove C and lock the A/B preview boundary

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `src/pages/landing/ui/services-section.tsx`
- Modify: `src/pages/landing/ui/use-services-preview-variant.ts`
- Delete: `src/pages/landing/ui/services-capability-index.tsx`
- Delete: `src/pages/landing/ui/styles/services-capability-index.module.css`

**Interfaces:**

- Produces: `ServicesPreviewVariant = 'a' | 'b'`
- Produces: default and unsupported query values resolve to A, `?services=b` resolves to B

- [ ] **Step 1: Replace the C interaction test with a failing unsupported-query regression**

```ts
test('keeps A as the fallback when the removed C preview is requested', async ({ page }) => {
  await page.goto('/?services=c');
  await expect(page.locator('[data-services-variant]')).toHaveAttribute(
    'data-services-variant',
    'a',
  );
  await expect(page.locator('[data-services-index]')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the regression and confirm it fails because C still renders**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "removed C preview"`

Expected: FAIL with `data-services-variant="c"`.

- [ ] **Step 3: Narrow preview selection to A/B and delete C implementation**

```ts
export type ServicesPreviewVariant = 'a' | 'b';

function getClientSnapshot(): ServicesPreviewVariant {
  if (!import.meta.env.DEV) return 'a';
  return new URLSearchParams(window.location.search).get('services') === 'b' ? 'b' : 'a';
}
```

Remove the `ServicesCapabilityIndex` import and branch from `ServicesSection`, then delete its TSX and CSS files.

- [ ] **Step 4: Run the focused preview tests**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "default|removed C preview|asymmetric five-card"`

Expected: PASS.

---

### Task 2: Deslop A into a capability ledger

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `src/pages/landing/ui/services-capability-map.tsx`
- Modify: `src/pages/landing/ui/styles/services.module.css`

**Interfaces:**

- Consumes: `servicePhases`
- Produces: three `.phase` rows, five service items, one semantic vertical connector

- [ ] **Step 1: Add a failing visual-contract test for flat geometry**

```ts
test('renders A as a flat capability ledger with restrained motion', async ({ page }) => {
  await page.goto('/');
  const map = page.locator('[data-capability-map]');
  const styles = await map.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      backgroundImage: computed.backgroundImage,
      borderRadius: Number.parseFloat(computed.borderRadius),
      boxShadow: computed.boxShadow,
    };
  });
  expect(styles.backgroundImage).toBe('none');
  expect(styles.borderRadius).toBeLessThanOrEqual(16);
  expect(styles.boxShadow).toBe('none');
  await expect(map.locator('[data-capability-phase]')).toHaveCount(3);
});
```

- [ ] **Step 2: Run the A contract and confirm current glass styling fails**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "flat capability ledger"`

Expected: FAIL because the current radius is 36px and the map has a gradient and shadow.

- [ ] **Step 3: Expose stable phase hooks and flatten the A surface**

Add `data-capability-map` to the ordered list and `data-capability-phase` to each phase. In `services.module.css`:

- set the outer radius to `16px`, `background-image: none`, and `box-shadow: none`;
- keep a single solid off-white/white background and 1px border;
- remove marker and icon shadows;
- reduce icon containers to quiet 36–40px supports;
- use row separators and typography for hierarchy;
- keep body copy at 14px or larger.

- [ ] **Step 4: Implement A motion without card lift**

Use the existing `data-landing-visible` state:

```css
.capabilityMap::after {
  transform: scaleY(0);
  transform-origin: top;
}

.capabilityFlow[data-landing-visible='true'] .capabilityMap::after {
  transform: scaleY(1);
}

:global(body[data-landing-ready='true']) .capabilityFlow:not([data-landing-visible='true']) .phase {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
}
```

Set 60–80ms row delays, then ensure hover changes only background, connector/marker color, and icon color. No row or icon translation.

- [ ] **Step 5: Verify A desktop, mobile, hover, touch, and reduced motion contracts**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "capability phase|flat capability ledger|shortened classic sections|reduced motion"`

Expected: PASS.

---

### Task 3: Deslop B into an asymmetric editorial grid

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `src/pages/landing/ui/services-bento-grid.tsx`
- Modify: `src/pages/landing/ui/styles/services-bento-grid.module.css`

**Interfaces:**

- Consumes: flattened service list derived from `servicePhases`
- Produces: five `[data-bento-card]` editorial modules and 15 plain-text scope items

- [ ] **Step 1: Add a failing no-decoration/no-lift regression**

```ts
test('renders B without SVG decorations, pill chips, or card lift', async ({ page }) => {
  await page.goto('/?services=b');
  await expect(page.locator('[data-service-visual]')).toHaveCount(0);
  await expect(page.locator('[data-services-bento] svg')).toHaveCount(0);
  const card = page.locator('[data-bento-card]').first();
  const before = await card.evaluate((element) => getComputedStyle(element).transform);
  await card.hover();
  expect(await card.evaluate((element) => getComputedStyle(element).transform)).toBe(before);
  expect(
    await card.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderRadius)),
  ).toBeLessThanOrEqual(16);
});
```

- [ ] **Step 2: Run the B contract and confirm it fails on decorations and lift**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "without decorative visuals"`

Expected: FAIL because decorative visual nodes exist and hover translates the card.

- [ ] **Step 3: Delete decorative markup and simplify scope semantics**

Delete `ServiceVisual`, the `Icon` import, and every card SVG icon. Keep the semantic `<ul>` but style it as plain inline text with separators rather than pills. Preserve all 15 labels and their accessible list semantics.

- [ ] **Step 4: Flatten card styling and add hairline motion**

In `services-bento-grid.module.css`:

- preserve `7/5`, `5/7`, `12` spans;
- use consistent `14px` radius and no large shadows or radial gradients;
- keep only the first card navy;
- turn `::before` into a top hairline whose `scaleX` reveals from the left;
- stagger the five modules by 50–70ms using `nth-child` delays;
- keep hover geometry static; entrance motion is the only card animation;
- remove all `[data-service-visual]` styles.

- [ ] **Step 5: Verify B desktop, mobile, touch, and reduced motion contracts**

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --grep "asymmetric five-card|without decorative visuals|shortened classic sections|reduced motion"`

Expected: PASS.

---

### Task 4: Run integrated quality gates and update the code graph

**Files:**

- Modify: `graphify-out/graph.json`
- Modify: other generated `graphify-out` artifacts as produced by `graphify update .`

**Interfaces:**

- Consumes: final A/B implementation
- Produces: verified landing behavior and refreshed repository graph

- [ ] **Step 1: Format and lint the changed source and tests**

Run: `pnpm exec prettier --check src/pages/landing/ui/services-section.tsx src/pages/landing/ui/services-capability-map.tsx src/pages/landing/ui/services-bento-grid.tsx src/pages/landing/ui/use-services-preview-variant.ts src/pages/landing/ui/styles/services.module.css src/pages/landing/ui/styles/services-bento-grid.module.css e2e/landing-cinematic-editorial.chrome.spec.ts`

Run: `pnpm run lint`

Expected: no new errors; the pre-existing FAQ `prefer-tag-over-role` warning may remain.

- [ ] **Step 2: Run build and focused landing regression suites**

Run: `pnpm run build`

Run: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-classic-restoration.chrome.spec.ts e2e/landing-anti-slop.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts --workers=2`

Expected: PASS.

- [ ] **Step 3: Verify in the Codex in-app browser**

Open and keep only:

- A: `http://127.0.0.1:3000/#services`
- B: `http://127.0.0.1:3000/?services=b#services`

Check desktop and 390x844 mobile screenshots, A hover, B hover, reduced-motion static state, horizontal overflow, and console errors.

- [ ] **Step 4: Refresh graphify artifacts**

Run: `graphify update .`

Expected: repository code graph no longer contains the removed C component relationship and includes the updated A/B relationships.
