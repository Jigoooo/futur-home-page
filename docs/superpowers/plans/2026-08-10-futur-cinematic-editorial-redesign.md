# FUTUR Cinematic Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected Calibration Rail landing with the approved full-screen particle Hero and rounded-solid Cinematic Editorial page, including meaning-specific GSAP motion for every major section without slide-deck behavior.

**Architecture:** Preserve the SSR-first landing structure, Hero WebGL engine, contact server boundary, custom cursor, and pill button contract. Build each section as semantic static markup first, expose stable `data-*` motion targets, then add one lazy GSAP scene-motion hook beside the existing interaction hook. Reduced-motion renders every scene in its final readable state and never loads scroll motion.

**Tech Stack:** React 19, TypeScript, CSS Modules, GSAP 3.15, `@gsap/react`, GSAP ScrollTrigger, Playwright, axe-core, Vite/TanStack Start

## Global Constraints

- Hero particle surface is `100vw × 100svh`; it is not a right-side panel.
- Hero headline is exactly `BUILT FOR WHAT’S NEXT.` with explicit `BUILT FOR` and `WHAT’S NEXT.` rows.
- Remove League Gothic; use Wanted Sans heavy for English display and Wanted Sans for Korean/body.
- Desktop Hero headline is at most about `80px`; major section titles at most about `55px`; contact title about `44–48px`.
- Final order is `Hero → 품질 기준 → 제공 영역 → 검토 방식 → 진행 방식 → FAQ → 문의 → Footer`.
- Remove `ResponsibilitySection`, its navigation anchor, config, types, styles, copy, and tests.
- Keep the existing Hero particle engine, pill button shape/motion, cursor lifecycle, contact validation/delivery/security, SSR visibility, WebGL fallback, Save-Data, and reduced-motion behavior.
- Use existing `gsap` and `@gsap/react` only; do not add Anime.js or Motion.
- Do not install Skiper UI wholesale. A borrowed effect must be ported to CSS Modules and existing GSAP only after source/license review.
- Do not use section pinning, scroll snap, full-screen slide replacement, or the same fade-up on every section.
- Do not introduce customers, reviews, cases, metrics, SLA, schedules, experience years, or automatic NDA claims.
- Preserve `.env.local` secrecy; never stage or print its values.

---

## File Responsibility Map

- `src/pages/landing/ui/landing-page.tsx`: final section order, Impeccable direction contract, enhancement boundary.
- `src/pages/landing/ui/hero-section.tsx` and `ui/styles/hero.module.css`: full-screen Hero composition only; particle runtime files remain unchanged.
- `src/pages/landing/ui/quality-standard-section.tsx` and matching CSS: rounded slate material stage and quality copy.
- `src/pages/landing/ui/services-section.tsx` and matching CSS: service copy plus Layered Merge static visual.
- `src/pages/landing/ui/review-method-section.tsx` and matching CSS: Taupe curved review scene.
- `src/pages/landing/ui/process-section.tsx` and matching CSS: semantic steps plus curved SVG path.
- `src/pages/landing/ui/use-landing-scene-motion.ts`: all scroll-triggered section scene timelines and reduced-motion final-state setup.
- `src/pages/landing/ui/landing-enhancements.tsx`: calls both interaction and scene-motion hooks.
- `src/pages/landing/ui/faq-section.tsx`, `contact-section.tsx`, `footer-section.tsx` and CSS: quiet FAQ, rounded-solid contact surface, factual footer.
- `src/pages/landing/config/*` and `model/types.ts`: only content/types still rendered by the final page.
- `e2e/landing-cinematic-editorial.chrome.spec.ts`: new design/order/motion/reduced-motion regression contract.
- Existing Hero, contact boundary, runtime error, and accessibility specs: preserved and updated only where visible copy/anchors changed.

---

### Task 1: Lock the final information architecture and remove Responsibility

**Files:**

- Create: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `src/pages/landing/ui/landing-page.tsx`
- Modify: `src/pages/landing/config/navigation.ts`
- Modify: `src/pages/landing/config/index.ts`
- Modify: `src/pages/landing/model/types.ts`
- Delete: `src/pages/landing/config/responsibility.ts`
- Delete: `src/pages/landing/ui/responsibility-section.tsx`
- Delete: `src/pages/landing/ui/styles/responsibility.module.css`
- Modify: `e2e/a11y/landing.static.a11y.spec.ts`

**Interfaces:**

- Consumes: existing `LandingPage` section components and `navigationItems: NavItem[]`.
- Produces: ordered DOM anchors `hero, quality, services, review, process, faq, contact, footer` and nav anchors `#quality, #services, #review, #process, #faq, #contact`.

- [ ] **Step 1: Write the failing order/removal test**

```ts
import { expect, test } from '@playwright/test';

test('uses the approved cinematic editorial information architecture', async ({ page }) => {
  await page.goto('/');

  const sectionIds = await page
    .locator('[data-landing-section]')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds).toEqual([
    'hero',
    'quality',
    'services',
    'review',
    'process',
    'faq',
    'contact',
  ]);

  const navHrefs = await page
    .getByRole('navigation', { name: '주요 메뉴' })
    .locator('a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(navHrefs).toEqual(['#quality', '#services', '#review', '#process', '#faq', '#contact']);

  await expect(page.locator('#responsibility')).toHaveCount(0);
  await expect(page.getByText('책임은 역할과 이름으로 확인할 수 있어야 합니다.')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the new test and confirm it fails**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line`

Expected: FAIL because `#responsibility` and its navigation link still exist.

- [ ] **Step 3: Remove Responsibility from UI, config, types, barrel exports, and a11y section lists**

```tsx
<HeroSection />
<QualityStandardSection />
<ServicesSection />
<ReviewMethodSection />
<ProcessSection />
<FaqSection />
<ContactSection />
<FooterSection />
```

```ts
export const navigationItems: NavItem[] = [
  { label: '품질 기준', href: '#quality' },
  { label: '제공 영역', href: '#services' },
  { label: '검토 방식', href: '#review' },
  { label: '진행 방식', href: '#process' },
  { label: 'FAQ', href: '#faq' },
  { label: '문의', href: '#contact' },
];
```

- [ ] **Step 4: Run focused order and accessibility tests**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts --reporter=line`

Expected: PASS with no `#responsibility` references.

- [ ] **Step 5: Commit**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts src/pages/landing/ui/landing-page.tsx src/pages/landing/config/navigation.ts src/pages/landing/config/index.ts src/pages/landing/model/types.ts
git commit -m "refactor(landing): 책임 주체 섹션과 탐색 경로 제거"
```

### Task 2: Rebuild the Hero as a full-screen particle surface

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `e2e/landing-hero-cinematic.chrome.spec.ts`
- Modify: `src/pages/landing/ui/hero-section.tsx`
- Modify: `src/pages/landing/ui/styles/hero.module.css`
- Modify: `src/pages/landing/ui/header-section.tsx`
- Modify: `src/pages/landing/ui/styles/header.module.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/routes/__root.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: unchanged `HeroParticleBackground`, `Button`, and `EditorialTextReveal` public contracts.
- Produces: `[data-landing-hero]`, `[data-hero-particle-layer]`, `[data-hero-headline-row]`, one Hero CTA, and a semantic cursor tone spanning the full Hero.

- [ ] **Step 1: Add failing full-screen, copy, type, and single-CTA assertions**

```ts
test('renders the approved full-screen particle hero with restrained typography', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const hero = page.locator('[data-landing-hero]');
  const particle = page.locator('[data-hero-particle-layer]');
  const title = page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' });

  await expect(hero).toHaveCSS('min-height', '720px');
  expect((await particle.boundingBox())?.width).toBeGreaterThanOrEqual(1279);
  await expect(page.locator('[data-hero-headline-row]')).toHaveText(['BUILT FOR', 'WHAT’S NEXT.']);
  expect(
    Number.parseFloat(await title.evaluate((node) => getComputedStyle(node).fontSize)),
  ).toBeLessThanOrEqual(80);
  expect(await title.evaluate((node) => getComputedStyle(node).fontFamily)).not.toContain(
    'League Gothic',
  );
  await expect(hero.getByRole('link', { name: '프로젝트 문의하기' })).toHaveCount(1);
});
```

- [ ] **Step 2: Run the Hero tests and confirm the rejected split layout fails**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts --project=chrome --reporter=line`

Expected: FAIL on the old copy, right-side particle width, and League Gothic family.

- [ ] **Step 3: Implement explicit headline rows and preserve the particle component**

```tsx
<EditorialTextReveal
  as='h1'
  className={styles.title}
  lines={['BUILT FOR', 'WHAT’S NEXT.']}
  split='lines'
  trigger='load'
  accessibleLabel='BUILT FOR WHAT’S NEXT.'
  lineAttribute='data-hero-headline-row'
/>
```

If `EditorialTextReveal` does not support `lineAttribute`, add the exact optional prop:

```ts
type EditorialTextRevealProps = {
  lineAttribute?: 'data-hero-headline-row';
};
```

Apply it only to each rendered line span when present.

- [ ] **Step 4: Replace the split Hero geometry with full-bleed particle and restrained text**

```css
.hero {
  position: relative;
  min-height: 100svh;
  overflow: clip;
  background: var(--charcoal);
  color: var(--paper);
}

.particleLayer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.title {
  max-width: 13ch;
  font-family: var(--font-body);
  font-size: clamp(56px, 5.6vw, 80px);
  font-weight: 900;
  letter-spacing: -0.028em;
  line-height: 0.96;
}
```

Use a full-surface dark overlay for copy contrast; do not alter particle engine or shader source.

- [ ] **Step 5: Remove League Gothic import/dependency and make Header a single translucent capsule**

Remove `@fontsource/league-gothic` from `package.json`, `pnpm-lock.yaml`, and `src/routes/__root.tsx`. Delete `--font-display` or alias it to `--font-body`. Keep the existing pill CTA component unchanged.

- [ ] **Step 6: Run Hero, runtime, mobile, reduced-motion, and build checks**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --reporter=line`

Run: `pnpm build`

Expected: all pass; particle runtime assertions remain unchanged.

- [ ] **Step 7: Commit**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts src/pages/landing/ui/hero-section.tsx src/pages/landing/ui/editorial-text-reveal.tsx src/pages/landing/ui/styles/hero.module.css src/pages/landing/ui/header-section.tsx src/pages/landing/ui/styles/header.module.css src/styles/tokens.css src/routes/__root.tsx package.json pnpm-lock.yaml
git commit -m "feat(hero): 전체 화면 파티클 시네마틱 Hero 적용"
```

### Task 3: Add the shared GSAP scene-motion enhancement boundary

**Files:**

- Create: `src/pages/landing/ui/use-landing-scene-motion.ts`
- Modify: `src/pages/landing/ui/landing-enhancements.tsx`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- Consumes: `pageRef: RefObject<HTMLElement | null>` and section target attributes.
- Produces: `useLandingSceneMotion(pageRef): void` and root dataset `data-landing-scene-motion='ready'` when the no-preference enhancement is active.

- [ ] **Step 1: Add failing enhancement and reduced-motion state tests**

```ts
test('loads scene motion lazily and exposes a reduced final state', async ({ browser, page }) => {
  await page.goto('/');
  await expect(page.locator('[data-landing-page]')).toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );

  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.goto('/');
  await expect(reducedPage.locator('[data-landing-page]')).not.toHaveAttribute(
    'data-landing-scene-motion',
    'ready',
  );
  await expect(
    reducedPage.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' }),
  ).toBeVisible();
  await reducedPage.close();
});
```

- [ ] **Step 2: Run the focused test and confirm the scene-motion attribute is absent**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line`

Expected: FAIL on missing `data-landing-scene-motion`.

- [ ] **Step 3: Create the scoped scene-motion hook and register ScrollTrigger once**

```ts
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PageRef = RefObject<HTMLElement | null>;

export function useLandingSceneMotion(pageRef: PageRef) {
  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return undefined;

      page.dataset.landingSceneMotion = 'ready';
      createQualityTimeline(page);
      createServiceTimeline(page);
      createReviewTimeline(page);
      createProcessTimeline(page);
      createContactTimeline(page);

      return () => {
        delete page.dataset.landingSceneMotion;
      };
    },
    { scope: pageRef },
  );
}
```

Define no-op helpers with the exact names `createQualityTimeline`, `createServiceTimeline`, `createReviewTimeline`, `createProcessTimeline`, and `createContactTimeline` before the hook, then fill them in Tasks 4–7. The existing `DeferredLandingEnhancements` reduced-motion gate remains unchanged, so scroll motion is never loaded for reduced-motion users; CSS supplies the final state.

- [ ] **Step 4: Call both hooks from LandingEnhancements**

```tsx
export function LandingEnhancements({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  useLandingGsapInteractions(pageRef);
  useLandingSceneMotion(pageRef);
  return <CustomCursor />;
}
```

- [ ] **Step 5: Run focused tests and lint**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line`

Run: `pnpm eslint src/pages/landing/ui/use-landing-scene-motion.ts src/pages/landing/ui/landing-enhancements.tsx`

Expected: PASS and no orphaned ScrollTrigger after navigation/reload.

- [ ] **Step 6: Commit**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts src/pages/landing/ui/use-landing-scene-motion.ts src/pages/landing/ui/landing-enhancements.tsx
git commit -m "feat(landing): 섹션 장면 모션 경계 추가"
```

### Task 4: Build the rounded quality material stage

**Files:**

- Modify: `src/pages/landing/ui/quality-standard-section.tsx`
- Modify: `src/pages/landing/ui/styles/quality-standard.module.css`
- Modify: `src/pages/landing/ui/use-landing-scene-motion.ts`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- Produces: `[data-quality-stage]`, `[data-quality-orb='charcoal']`, `[data-quality-orb='blue']`, and `[data-quality-copy]` targets.
- Consumes: `createQualityTimeline(page)` in the scene-motion hook.

- [ ] **Step 1: Add failing semantic material-stage assertions**

```ts
test('uses one rounded solid quality stage instead of ledger rows', async ({ page }) => {
  await page.goto('/');
  const quality = page.locator('#quality');
  await expect(quality.locator('[data-quality-stage]')).toHaveCount(1);
  await expect(quality.locator('[data-quality-orb]')).toHaveCount(2);
  await expect(quality.locator('article')).toHaveCount(0);
  expect(
    Number.parseFloat(
      await quality
        .locator('[data-quality-stage]')
        .evaluate((node) => getComputedStyle(node).borderRadius),
    ),
  ).toBeGreaterThanOrEqual(32);
});
```

- [ ] **Step 2: Run and confirm the existing record ledger fails**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line`

Expected: FAIL because multiple record articles exist and no stage/orbs exist.

- [ ] **Step 3: Replace record rows with one semantic copy block and decorative material stage**

```tsx
<section id='quality' data-landing-section data-cursor-contrast='dark'>
  <div className={styles.copy} data-quality-copy data-scene-target>
    <h2 id='quality-title'>화면에서 시작해 제품의 구조까지 이어집니다.</h2>
    <p>사용자가 만나는 흐름과 팀이 운영할 구조를 분리하지 않습니다.</p>
  </div>
  <div className={styles.stage} data-quality-stage data-scene-target aria-hidden='true'>
    <i data-quality-orb='charcoal' />
    <i data-quality-orb='blue' />
  </div>
</section>
```

- [ ] **Step 4: Implement the stage material and bounded quality timeline**

Use a single `42–48px` desktop radius, `28–32px` mobile radius, matte Slate base, radial charcoal/blue orbs, inset highlight, and broad shadow. `createQualityTimeline` must use a circular `clipPath` reveal and at most `32px` orb parallax; no pin.

```ts
function createQualityTimeline(page: HTMLElement) {
  const stage = page.querySelector<HTMLElement>('[data-quality-stage]');
  const orbs = page.querySelectorAll<HTMLElement>('[data-quality-orb]');
  if (!stage) return;

  gsap.fromTo(
    stage,
    { clipPath: 'circle(18% at 72% 52%)' },
    {
      clipPath: 'circle(78% at 58% 50%)',
      ease: 'power3.out',
      scrollTrigger: { trigger: stage, start: 'top 82%', end: 'top 38%', scrub: 0.55 },
    },
  );
  gsap.to(orbs, {
    yPercent: (index) => (index === 0 ? -4 : 5),
    scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
  });
}
```

- [ ] **Step 5: Run focused, reduced-motion, and a11y tests**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts --reporter=line`

Expected: PASS; decorative stage remains `aria-hidden` and copy stays semantic.

- [ ] **Step 6: Commit**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts src/pages/landing/ui/quality-standard-section.tsx src/pages/landing/ui/styles/quality-standard.module.css src/pages/landing/ui/use-landing-scene-motion.ts
git commit -m "feat(landing): 품질 기준 곡면 재질 장면 구현"
```

### Task 5: Replace the service orbit with Layered Merge

**Files:**

- Modify: `src/pages/landing/ui/services-section.tsx`
- Modify: `src/pages/landing/ui/styles/services.module.css`
- Modify: `src/pages/landing/ui/use-landing-scene-motion.ts`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- Produces: `[data-service-merge]`, four `[data-service-layer]`, one `[data-service-core]`, and four `[data-service-row]` elements.
- Consumes: `createServiceTimeline(page)`.

- [ ] **Step 1: Add the failing Layered Merge contract**

```ts
test('merges four service layers into one product core without an orbit', async ({ page }) => {
  await page.goto('/');
  const services = page.locator('#services');
  await expect(
    services.getByRole('heading', { name: '필요한 영역을 연결해 하나의 제품으로 만듭니다.' }),
  ).toBeVisible();
  await expect(services.locator('[data-service-merge]')).toHaveCount(1);
  await expect(services.locator('[data-service-layer]')).toHaveCount(4);
  await expect(services.locator('[data-service-core]')).toHaveCount(1);
  await expect(services.locator('[data-service-orbit]')).toHaveCount(0);
});
```

- [ ] **Step 2: Run and confirm the old flat service list fails**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line`

Expected: FAIL because the merge visual and approved copy do not exist.

- [ ] **Step 3: Add the decorative Layered Merge visual beside the semantic service list**

```tsx
<div className={styles.merge} data-service-merge data-scene-target aria-hidden='true'>
  {['blue', 'slate', 'taupe', 'olive'].map((tone) => (
    <i key={tone} data-service-layer={tone} />
  ))}
  <i data-service-core />
</div>
```

Keep the four service titles and descriptions as normal HTML. Change `하나의 서비스` to `하나의 제품` in visible and accessible copy.

- [ ] **Step 4: Implement one-shot merge motion and row reveal**

```ts
function createServiceTimeline(page: HTMLElement) {
  const scene = page.querySelector<HTMLElement>('[data-service-merge]');
  const layers = page.querySelectorAll<HTMLElement>('[data-service-layer]');
  const core = page.querySelector<HTMLElement>('[data-service-core]');
  const rows = page.querySelectorAll<HTMLElement>('#services [data-service-row]');
  if (!scene || !core || layers.length !== 4) return;

  const timeline = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 78%', once: true },
  });
  timeline
    .from(layers, {
      x: (index) => [-92, 86, -74, 82][index],
      y: (index) => [-68, -52, 78, 70][index],
      rotate: (index) => [-12, 10, 8, -9][index],
      opacity: 0.55,
      duration: 0.86,
      stagger: 0.08,
      ease: 'power3.out',
    })
    .from(core, { scale: 0.72, opacity: 0, duration: 0.52, ease: 'power3.out' }, '-=0.35')
    .from(rows, { y: 24, opacity: 0, duration: 0.46, stagger: 0.07, ease: 'power3.out' }, '-=0.32');
}
```

Do not use `back.out`, continuous orbit, or slide pinning.

- [ ] **Step 5: Run focused, runtime, reduced-motion, and mobile tests**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --reporter=line`

Expected: PASS; reduced-motion shows the final merged shape immediately.

- [ ] **Step 6: Commit**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts src/pages/landing/ui/services-section.tsx src/pages/landing/ui/styles/services.module.css src/pages/landing/ui/use-landing-scene-motion.ts
git commit -m "feat(landing): 제공 영역 Layered Merge 적용"
```

### Task 6: Build curved Review and Process scenes without slide transitions

**Files:**

- Modify: `src/pages/landing/ui/review-method-section.tsx`
- Modify: `src/pages/landing/ui/styles/review-method.module.css`
- Modify: `src/pages/landing/ui/process-section.tsx`
- Modify: `src/pages/landing/ui/styles/process.module.css`
- Modify: `src/pages/landing/ui/use-landing-scene-motion.ts`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`

**Interfaces:**

- Produces: `[data-review-stage]`, `[data-review-mask]`, `[data-review-group]`, `[data-process-path]`, `[data-process-marker]`, and `[data-process-step]`.
- Consumes: `createReviewTimeline(page)` and `createProcessTimeline(page)`.

- [ ] **Step 1: Add failing curved-scene assertions**

```ts
test('uses a curved review mask and a semantic process path', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-review-stage]')).toHaveCount(1);
  await expect(page.locator('[data-review-mask]')).toHaveCount(1);
  await expect(page.locator('[data-review-group]')).toHaveCount(4);

  const path = page.locator('svg [data-process-path]');
  await expect(path).toHaveCount(1);
  await expect(page.locator('[data-process-marker]')).toHaveCount(1);
  await expect(page.locator('ol [data-process-step]')).toHaveCount(5);
  await expect(page.locator('#review, #process')).not.toHaveCSS('scroll-snap-align', 'start');
});
```

- [ ] **Step 2: Run and confirm the ledger/straight-list implementation fails**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line`

Expected: FAIL on missing curved masks and path targets.

- [ ] **Step 3: Replace Review ledger rows with one Taupe scene and four semantic groups**

The decorative mask is `aria-hidden`; review group headings and fields stay in HTML. Use one large `border-radius: 50%` cutout and no per-group card shell.

- [ ] **Step 4: Add a curved SVG path while preserving the semantic `<ol>`**

```tsx
<svg className={styles.pathVisual} viewBox='0 0 900 520' aria-hidden='true'>
  <path
    data-process-path
    pathLength='1'
    d='M20 480C190 340 260 420 370 285C500 125 630 285 880 34'
  />
  <circle data-process-marker cx='20' cy='480' r='12' />
</svg>
<ol className={styles.processList}>
  {processSteps.map((step) => (
    <li key={step.index} data-process-step>
      <span aria-hidden='true'>{step.index}</span>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </li>
  ))}
</ol>
```

- [ ] **Step 5: Implement distinct Review mask and Process path timelines**

Review uses a circular mask reveal plus short group stagger. Process uses `strokeDasharray: 1`, `strokeDashoffset: 1` and ScrollTrigger scrub. Move the marker with `MotionPathPlugin` only if the existing GSAP package import builds cleanly; otherwise sample the SVG path with `getPointAtLength()` inside an `onUpdate` callback. Do not add a dependency.

```ts
gsap.fromTo(
  path,
  { strokeDashoffset: 1 },
  {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: '#process', start: 'top 72%', end: 'bottom 62%', scrub: 0.6 },
  },
);
```

- [ ] **Step 6: Run focused, a11y, runtime, and reduced-motion tests**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --reporter=line`

Expected: PASS; ordered steps remain readable without the SVG and without JavaScript.

- [ ] **Step 7: Commit**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts src/pages/landing/ui/review-method-section.tsx src/pages/landing/ui/styles/review-method.module.css src/pages/landing/ui/process-section.tsx src/pages/landing/ui/styles/process.module.css src/pages/landing/ui/use-landing-scene-motion.ts
git commit -m "feat(landing): 검토와 진행 장면에 곡선 모션 적용"
```

### Task 7: Finish FAQ, Contact, Footer, cursor contrast, and factual copy

**Files:**

- Modify: `src/pages/landing/ui/faq-section.tsx`
- Modify: `src/pages/landing/ui/styles/faq.module.css`
- Modify: `src/pages/landing/ui/contact-section.tsx`
- Modify: `src/pages/landing/ui/contact-brief-fields.tsx`
- Modify: `src/pages/landing/ui/styles/contact.module.css`
- Modify: `src/pages/landing/ui/styles/form-controls.module.css`
- Modify: `src/pages/landing/ui/footer-section.tsx`
- Modify: `src/pages/landing/ui/styles/footer.module.css`
- Modify: `src/pages/landing/ui/use-landing-scene-motion.ts`
- Modify: `src/pages/landing/ui/use-custom-cursor.ts`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `e2e/a11y/landing.interactive.a11y.spec.ts`

**Interfaces:**

- Produces: `[data-contact-surface]`, `[data-contact-group]`, semantic cursor contrast per surface, and factual contact copy.
- Consumes: all existing form field names, validation, consent, pending/success/failure, and direct-email fallback APIs unchanged.

- [ ] **Step 1: Add failing copy, shape, and interaction assertions**

```ts
test('uses factual contact copy and one rounded solid form surface', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('#contact');
  await expect(contact.getByText('START A PROJECT')).toHaveCount(0);
  await expect(
    contact.getByRole('heading', { name: '만들거나 개선하려는 제품을 알려주세요.' }),
  ).toBeVisible();
  await expect(
    contact.getByText('현재 상황과 필요한 범위를 적어주시면 확인 후 연락드리겠습니다.'),
  ).toBeVisible();
  await expect(contact.locator('[data-contact-surface]')).toHaveCount(1);
  expect(await contact.locator('[data-contact-group]').count()).toBeGreaterThan(3);
  await expect(contact.locator('[data-contact-surface]')).toHaveAttribute(
    'data-cursor-contrast',
    'light',
  );
});
```

- [ ] **Step 2: Run and confirm the old contact copy/surface fails**

Run: `pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts --project=chrome --reporter=line`

Expected: FAIL on old contact copy and missing surface/group targets.

- [ ] **Step 3: Apply the approved contact copy and one large rounded form surface**

Use `42px` desktop and `30px` mobile surface radius. Keep individual text inputs flat with bottom rules. Stage choices may use restrained `18px` radius and solid Blue selected state; do not create white floating cards.

- [ ] **Step 4: Add a bounded Contact reveal and quiet FAQ transitions**

`createContactTimeline` reveals the contact surface by a curved clip mask and brings groups in with `40–60ms` stagger. FAQ disclosure uses existing semantic buttons and a short height/opacity transition only. No bounce, pin, or repeating animation.

- [ ] **Step 5: Verify cursor tones on Hero, paper, Slate/Taupe, charcoal, CTA, and form surfaces**

Extend the cursor E2E assertions to move through at least one light and one dark curved surface. Keep coarse-pointer and reduced-motion custom-cursor disablement.

- [ ] **Step 6: Run contact delivery/security, interactive a11y, and runtime tests**

Run: `pnpm exec playwright test e2e/contact-delivery.chrome.spec.ts e2e/contact-mail-safety.chrome.spec.ts e2e/contact-server-boundaries.chrome.spec.ts e2e/a11y/landing.interactive.a11y.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --reporter=line`

Expected: PASS with no network delivery to reserved test addresses.

- [ ] **Step 7: Commit**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts e2e/a11y/landing.interactive.a11y.spec.ts src/pages/landing/ui/faq-section.tsx src/pages/landing/ui/styles/faq.module.css src/pages/landing/ui/contact-section.tsx src/pages/landing/ui/contact-brief-fields.tsx src/pages/landing/ui/styles/contact.module.css src/pages/landing/ui/styles/form-controls.module.css src/pages/landing/ui/footer-section.tsx src/pages/landing/ui/styles/footer.module.css src/pages/landing/ui/use-landing-scene-motion.ts src/pages/landing/ui/use-custom-cursor.ts
git commit -m "feat(landing): 문의와 하단 장면을 시네마틱 세계로 통합"
```

### Task 8: Humanize final copy and update design authority

**Files:**

- Modify: rendered Korean copy under `src/pages/landing/config/*.ts` and `src/pages/landing/ui/*.tsx`
- Modify: `PRODUCT.md`
- Replace: `DESIGN.md`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: approved visible copy after functional implementation.
- Produces: final Korean copy with humanize evidence and a root `DESIGN.md` matching the shipped world.

- [ ] **Step 1: Extract only rendered Korean copy into `_workspace/2026-08-10-002/input.md`**

Include Hero support copy, quality, services, review, process, FAQ, contact, and Footer. Exclude legal text, code identifiers, aria labels that must exactly match visible copy, and unrendered historical docs.

- [ ] **Step 2: Run `humanize-korean` in chunks under 5,000 characters**

Use `장르: 공적`, `강도: 기본`. Preserve product names, company names, anchors, email, and confirmed numbers. Require change rate at most `30%`, S1 remaining `0`, and self-check `6/6`.

- [ ] **Step 3: Apply only verified copy and add matching E2E assertions**

The contact copy must remain exactly:

```text
프로젝트 문의
만들거나 개선하려는 제품을 알려주세요.
현재 상황과 필요한 범위를 적어주시면 확인 후 연락드리겠습니다.
```

Hero English remains outside the Korean humanize pass.

- [ ] **Step 4: Replace root DESIGN.md from the actual implemented world**

Document full-screen particle Hero, Wanted Sans type scale, rounded solid material, Layered Merge, section-specific GSAP motion, button-only `back.out`, cursor tone semantics, reduced-motion, contact state design, and evidence boundary. Mark `docs/futur_react_docs_package/DESIGN.md` as historical only.

- [ ] **Step 5: Ignore humanize and visual-review artifacts**

Ensure `_workspace/`, `.review-screens/`, and `.superpowers/` are ignored. Do not stage `.env.local` or generated review images.

- [ ] **Step 6: Run copy scans and diff checks**

Run:

```bash
rg -n "24/7|4시간|30\+|95%\+|자동 NDA|START A PROJECT|책임 주체|SOUND STRUCTURE" src e2e DESIGN.md PRODUCT.md
git diff --check
```

Expected: no forbidden rendered claims or rejected copy; intentional historical references must not be in runtime files.

- [ ] **Step 7: Commit**

```bash
git add .gitignore PRODUCT.md DESIGN.md src/pages/landing/config src/pages/landing/ui e2e/landing-cinematic-editorial.chrome.spec.ts
git commit -m "docs(landing): 시네마틱 디자인과 최종 카피 기록"
```

### Task 9: Visual QA, full verification, branch integration, and push

**Files:**

- Modify only files required by bounded QA findings.
- Do not commit: `.review-screens/*`, `_workspace/*`, `.superpowers/*`.

**Interfaces:**

- Consumes: all completed tasks.
- Produces: verified redesign branch, final review verdict, updated graph, fast-forwarded `master`, and pushed `origin/master`.

- [ ] **Step 1: Run targeted design and accessibility gates**

```bash
node /Users/kimjigoooo/.agents/skills/impeccable/scripts/detect.mjs --json
pnpm exec playwright test e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --project=chrome --reporter=line
pnpm exec playwright test --project=a11y --reporter=line
```

Expected: detector `[]`; all focused and a11y tests pass.

- [ ] **Step 2: Run lint and production build**

```bash
pnpm lint
pnpm build
```

Expected: zero lint errors; only documented pre-existing warnings; build and prerender pass.

- [ ] **Step 3: Capture one bounded desktop/mobile visual pass on port 3000**

Capture 1280×720 and 390×844 first viewports plus full pages. Inspect Hero scale, apostrophe spacing, horizontal overflow, curved stage crops, Layered Merge meaning, contact readability, and cursor contrast. Fix all material findings in one batch, then capture one confirmation round only.

- [ ] **Step 4: Run Impeccable finish review and resolve P0/P1 findings**

Pass the approved companion mockups, desktop/mobile screenshots, spec path, direction contract, and detector output to a fresh `impeccable_finish_reviewer`. Apply one bounded fix batch and obtain a final verdict. Do not call the implementation complete with open P0/P1 findings.

- [ ] **Step 5: Run the full E2E suite serially and capture the real exit code**

```bash
pnpm exec playwright test --workers=1 --reporter=line
```

Expected: all tests pass and Playwright exits `0`. If a test waits on obsolete copy or anchor names, update the test to the approved contract; do not interrupt after progress output without a final summary.

- [ ] **Step 6: Update graph and run final static checks**

```bash
graphify update .
git diff --check
git status --short
```

Expected: graph update succeeds; no whitespace errors; only intended files are present.

- [ ] **Step 7: Commit bounded QA fixes**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts e2e/a11y/landing.interactive.a11y.spec.ts src/pages/landing/ui/use-landing-scene-motion.ts src/pages/landing/ui/styles/hero.module.css src/pages/landing/ui/styles/quality-standard.module.css src/pages/landing/ui/styles/services.module.css src/pages/landing/ui/styles/review-method.module.css src/pages/landing/ui/styles/process.module.css src/pages/landing/ui/styles/faq.module.css src/pages/landing/ui/styles/contact.module.css src/pages/landing/ui/styles/form-controls.module.css
git commit -m "fix(landing): 시네마틱 재설계 최종 품질 보정"
```

Skip the commit only if no tracked fixes remain.

- [ ] **Step 8: Refresh remote master and integrate without force push**

```bash
git fetch origin
git switch master
git pull --ff-only origin master
git merge --ff-only codex/futur-anti-slop-redesign
git push origin master
```

If `origin/master` advanced and prevents fast-forwarding the feature branch, return to `codex/futur-anti-slop-redesign`, merge `origin/master`, resolve there, rerun Steps 1–6, then repeat the fast-forward integration.

- [ ] **Step 9: Prove final Git state**

```bash
git rev-list --left-right --count master...origin/master
git status --short --branch
```

Expected: `0 0` and a clean `master` worktree.
