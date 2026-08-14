# FUTUR Service Hover, Footer Signature, and Header Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a restrained pointer-responsive lift and ink lens to the four informational service cards, turn the Footer lower area into an editorial information rail with a one-time signature reveal, and switch the adaptive Header tone when the incoming surface crosses the Header's vertical midpoint.

**Architecture:** Keep the existing semantic sections and data content intact. Each pointer effect owns a dedicated GSAP hook and an inner transform/lens layer so it cannot conflict with the shared reveal or CTA motion systems; the Header keeps its existing scroll scheduler but replaces full-coverage surface detection with a midpoint probe. CSS Modules own all static geometry, color, masking, responsive behavior, and no-JavaScript fallbacks.

**Tech Stack:** React 19, TypeScript 6, GSAP 3.15 with `@gsap/react`, CSS Modules, Playwright 1.60, axe-core

## Global Constraints

- Keep the current Hero, Services copy and asymmetric `1 / 2+3 / 4` grid, Technology, six-question single-open FAQ, Header navigation, legal routes, and Footer `mailto:` inquiry CTA.
- Do not add images, video, SVG decoration, WebGL, textures, generated artwork, customer logos, projects, statistics, social channels, or navigation.
- Do not add dependencies or expand the shared Button/global interaction hook for service-card or Footer-signature motion.
- Service cards remain informational `<article>` elements: no link, button, click handler, `tabIndex`, role, pointer cursor, or hover-only information.
- Service hover is fine-pointer only: `translateY(-7px)`, `scale(1.006)`, `320ms power3.out` enter, `480ms back.out(1.35)` leave, `180ms` lens fade, and no rotation/skew.
- Footer signature remains decorative and `aria-hidden='true'`; pointer movement may reveal color inside glyphs but must not translate, scale, rotate, or magnetize the wordmark.
- Touch, coarse pointer, reduced motion, and no-JavaScript paths remain static and fully readable.
- Header tone changes when the incoming `[data-header-surface]` crosses the Header's vertical midpoint, and the visual tone transition uses `240ms` rather than the current `160ms`.
- Preserve all real Footer data: email, address, privacy, terms, copyright, representative, business registration, mail-order registration, and privacy officer.
- Verify `1280×900`, `900×844`, and `390×844` without horizontal overflow.
- Run `graphify update .` only after the implementation and documentation are complete.

---

## File Structure

- Create `src/pages/landing/ui/use-service-card-hover-motion.ts`: owns only fine-pointer service-card entry, tracking, leave/cancel, interruption, media-query activation, and cleanup.
- Create `src/pages/landing/ui/use-footer-signature-motion.ts`: owns only fine-pointer Footer signature lens coordinates, opacity, interruption, media-query activation, and cleanup.
- Create `e2e/landing-service-footer-motion.chrome.spec.ts`: owns the dedicated service-card and Footer-signature DOM, motion, fallback, no-JavaScript, and responsive regression contract.
- Modify `src/pages/landing/ui/services-section.tsx`: adds the section ref and service surface/lens DOM, then invokes `useServiceCardHoverMotion`.
- Modify `src/pages/landing/ui/styles/services.module.css`: moves each card color to its inner surface, adds the pre-rendered shadow/lens layers, and defines static fallbacks.
- Modify `src/pages/landing/ui/footer-section.tsx`: adds the Footer ref, restructures the real information, removes the small duplicate logo, adds the signature DOM, then invokes `useFooterSignatureMotion`.
- Modify `src/pages/landing/ui/styles/footer.module.css`: owns the two-rule information hierarchy, responsive stacking, signature typography, one-time reveal, radial mask, and fallbacks.
- Modify `src/pages/landing/ui/use-adaptive-header.ts`: replaces full-island surface coverage with a vertical-midpoint probe.
- Modify `src/pages/landing/ui/styles/header.module.css`: centralizes the Header tone duration at `240ms` for ink, rim, glass background, and contact treatment.
- Modify `e2e/landing-adaptive-island.chrome.spec.ts`: replaces the old full-coverage assertion with bidirectional midpoint-crossing assertions and checks the `240ms` transition duration.
- Modify `e2e/a11y/landing.static.a11y.spec.ts`: adds a standalone Footer scan while retaining the full-page and Services scans.
- Modify `DESIGN.md`: records the midpoint Header surface contract, Lifted Ink Surface, Footer information rail, and signature lens fallbacks.

---

### Task 1: Move Header tone switching to the incoming surface midpoint

**Files:**

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts:817-881`
- Modify: `src/pages/landing/ui/use-adaptive-header.ts:41-98`
- Modify: `src/pages/landing/ui/styles/header.module.css:1-208`

**Interfaces:**

- Consumes: `[data-landing-nav]`, `[data-header-surface='dark|light']`, and the existing `requestAnimationFrame`-limited `updateActiveSection()` scheduler.
- Produces: `getVisibleHeaderSurface(header, currentSurface): HeaderSurface`, whose probe is `headerRect.top + headerRect.height * 0.5`, plus CSS variable `--header-tone-duration: 240ms`.

- [ ] **Step 1: Replace the full-coverage regression with a failing midpoint regression**

  In `e2e/landing-adaptive-island.chrome.spec.ts`, replace the test beginning at line 817 with the following boundary test. It checks both scroll directions and keeps section activation separate from glass tone:

  ```ts
  test('switches Header ink when the incoming surface crosses the island midpoint', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = header(page);
    await expect(nav).toHaveAttribute('data-header-hydrated', 'true');

    const placeServicesTopAt = async (offsetFromHeaderMidpoint: number) => {
      await page.evaluate((offset) => {
        const headerElement = document.querySelector<HTMLElement>('[data-landing-nav]')!;
        const servicesElement = document.querySelector<HTMLElement>('#services')!;
        const servicesDocumentTop = servicesElement.getBoundingClientRect().top + window.scrollY;
        const headerRect = headerElement.getBoundingClientRect();
        const headerMidpoint = headerRect.top + headerRect.height / 2;
        window.scrollTo({
          top: servicesDocumentTop - headerMidpoint - offset,
          behavior: 'instant',
        });
      }, offsetFromHeaderMidpoint);
    };

    await placeServicesTopAt(2);
    await expect(nav).toHaveAttribute('data-header-glass-tone', 'dark');

    await placeServicesTopAt(-2);
    await expect(nav).toHaveAttribute('data-header-glass-tone', 'light');

    await placeServicesTopAt(-2);
    await expect(nav).toHaveAttribute('data-header-glass-tone', 'light');

    await placeServicesTopAt(2);
    await expect(nav).toHaveAttribute('data-header-glass-tone', 'dark');

    const toneTransitions = await nav.evaluate((element) => {
      const glass = element.querySelector<HTMLElement>('[data-header-glass]')!;
      const logo = element.querySelector<HTMLElement>('a[aria-label="FUTUR home"]')!;
      return {
        glass: getComputedStyle(glass).transitionDuration,
        logo: getComputedStyle(logo).transitionDuration,
      };
    });
    expect(toneTransitions).toEqual({ glass: '0.24s, 0.24s', logo: '0.24s' });
  });
  ```

- [ ] **Step 2: Run the focused test to verify RED**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts --project=chrome --grep "incoming surface crosses"
  ```

  Expected: FAIL because `getVisibleHeaderSurface()` still requires one surface to cover the Header's complete top-to-bottom rectangle; the tone remains dark when Services has crossed the midpoint but not the Header top.

- [ ] **Step 3: Implement midpoint surface detection**

  Replace `headerSurfaceCoverageTolerance` and `getVisibleHeaderSurface()` in `use-adaptive-header.ts` with this exact probe rule:

  ```ts
  const headerSurfaceProbeRatio = 0.5;

  function getVisibleHeaderSurface(
    header: HTMLElement | null,
    currentSurface: HeaderSurface,
  ): HeaderSurface {
    const surfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-header-surface]'));
    const headerRect = header?.getBoundingClientRect();
    if (!headerRect) return currentSurface;

    const probeY = headerRect.top + headerRect.height * headerSurfaceProbeRatio;
    const surfaceAtMidpoint = surfaces.find((surface) => {
      const rect = surface.getBoundingClientRect();
      return rect.top <= probeY && rect.bottom > probeY;
    });

    if (!surfaceAtMidpoint) return currentSurface;
    return surfaceAtMidpoint.dataset.headerSurface === 'light' ? 'light' : 'dark';
  }
  ```

  Do not change `getVisibleSectionId()`: active navigation and compact labels continue using the existing Header/nav-offset probe, while color follows the physical midpoint surface.

- [ ] **Step 4: Slow only the Header tone properties to 240ms**

  Add the token at `.nav`, replace the five `0.16s` color/border transitions, and include glass/contact background color:

  ```css
  .nav {
    --header-tone-duration: 240ms;
  }

  .glassShell {
    transition:
      background-color var(--header-tone-duration) var(--ease-out),
      border-color var(--header-tone-duration) var(--ease-out);
  }

  .logo,
  .logo span,
  .compactToggle,
  .navMenu,
  .navMenu a {
    transition: color var(--header-tone-duration) var(--ease-out);
  }

  .navMenu .contactLink {
    transition:
      color var(--header-tone-duration) var(--ease-out),
      background-color var(--header-tone-duration) var(--ease-out);
  }

  .activeIndicator {
    transition: background-color var(--header-tone-duration) var(--ease-out);
  }
  ```

  Keep the existing `prefers-reduced-motion` rule that forces transition duration to zero.

- [ ] **Step 5: Run the Header regression and commit**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts --project=chrome --grep "Header ink|glass tone|incoming surface"
  pnpm lint
  ```

  Expected: all selected Header tests PASS; no active-section assertion changes.

  Commit:

  ```bash
  git add e2e/landing-adaptive-island.chrome.spec.ts src/pages/landing/ui/use-adaptive-header.ts src/pages/landing/ui/styles/header.module.css
  git commit -m "fix(header): 표면 전환 기준을 중앙선으로 조정"
  ```

---

### Task 2: Add the Lifted Ink Surface to all service cards

**Files:**

- Create: `src/pages/landing/ui/use-service-card-hover-motion.ts`
- Create: `e2e/landing-service-footer-motion.chrome.spec.ts`
- Modify: `src/pages/landing/ui/services-section.tsx:1-60`
- Modify: `src/pages/landing/ui/styles/services.module.css:1-257`

**Interfaces:**

- Consumes: `serviceCapabilities`, existing `data-service-card` reveal ownership, GSAP `quickTo()`, and `RefObject<HTMLElement | null>`.
- Produces: `useServiceCardHoverMotion(sectionRef: RefObject<HTMLElement | null>): void`, one `[data-service-card-surface]` and one `[data-service-card-lens][aria-hidden='true']` per service article.

- [ ] **Step 1: Create the dedicated service/Footer motion spec with failing service structure tests**

  Create `e2e/landing-service-footer-motion.chrome.spec.ts` with the shared hydration helper and the structural/static contract:

  ```ts
  import { expect, test, type Page } from '@playwright/test';

  async function waitForLandingHydration(page: Page) {
    await page.waitForFunction(() => {
      const landing = document.querySelector('[data-landing-page]');
      return landing && Object.keys(landing).some((key) => key.startsWith('__reactProps$'));
    });
  }

  test('keeps four informational service cards with one surface and lens each', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#services');
    await waitForLandingHydration(page);

    const cards = page.locator('#services [data-service-card]');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('[data-service-card-surface]')).toHaveCount(4);
    await expect(cards.locator('[data-service-card-lens][aria-hidden="true"]')).toHaveCount(4);
    await expect(cards.locator('a, button, [role], [tabindex], img, picture, svg')).toHaveCount(0);

    const cursorValues = await cards.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).cursor),
    );
    expect(cursorValues.every((cursor) => cursor === 'auto' || cursor === 'default')).toBe(true);
  });
  ```

- [ ] **Step 2: Run the structural test to verify RED**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-service-footer-motion.chrome.spec.ts --project=chrome --grep "four informational service cards"
  ```

  Expected: FAIL because no card currently contains `data-service-card-surface` or `data-service-card-lens`.

- [ ] **Step 3: Add the Services ref and non-interactive inner DOM**

  Replace `services-section.tsx` with the complete component below. The article remains the reveal owner and the new surface owns only hover transforms:

  ```tsx
  import { useRef } from 'react';

  import { serviceCapabilities } from '../config';
  import { cx } from './lib/cx';
  import styles from './styles/services.module.css';
  import sharedStyles from './styles/shared.module.css';
  import { useServiceCardHoverMotion } from './use-service-card-hover-motion';

  export function ServicesSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    useServiceCardHoverMotion(sectionRef);

    return (
      <section
        ref={sectionRef}
        className={cx(sharedStyles.sectionBlock, styles.services)}
        id='services'
        data-landing-section
        data-header-surface='light'
        data-cursor-contrast='dark'
      >
        <div className={cx(sharedStyles.container, styles.intro)} data-service-intro>
          <h2
            className={cx(sharedStyles.sectionTitle, sharedStyles.reveal, sharedStyles.revealUp)}
            data-landing-reveal='up'
          >
            새로운 서비스부터,
            <br />
            운영 중인 시스템까지.
          </h2>
          <p
            className={cx(sharedStyles.sectionDesc, sharedStyles.reveal, sharedStyles.revealUp)}
            data-landing-reveal='up'
          >
            웹·앱과 업무 시스템을 만들고, 기존 시스템과 AI 기능을 연결하며, 배포 이후 운영까지
            이어갑니다.
          </p>
        </div>

        <div className={cx(sharedStyles.container, styles.gallery)} data-service-gallery>
          {serviceCapabilities.map((capability) => (
            <article
              className={cx(styles.card, styles[capability.tone])}
              id={`service-${capability.key}`}
              key={capability.key}
              data-service-capability={capability.key}
              data-service-card
              data-landing-reveal='up'
            >
              <div className={styles.surface} data-service-card-surface>
                <span className={styles.lens} data-service-card-lens aria-hidden='true' />
                <div className={styles.copy}>
                  <span className={styles.index} data-service-card-index>
                    {capability.index}
                  </span>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                  <ul aria-label={`${capability.title} 범위`}>
                    {capability.scopes.map((scope) => (
                      <li key={scope}>{scope}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }
  ```

  Do not add hover/focus semantics or `data-landing-interactive` to cards.

- [ ] **Step 4: Move card paint to the inner surface and add shadow/lens layers**

  Preserve every existing grid/copy/font rule, but change the card and tone ownership and add these layers in `services.module.css`:

  ```css
  .card {
    --service-card-background: transparent;
    --service-card-ink: rgba(92, 145, 255, 0.2);
    position: relative;
    min-width: 0;
    min-height: 460px;
    overflow: visible;
    border-radius: 20px;
    color: #0b1734;
    cursor: default;
  }

  .ice {
    --service-card-background: #dfeaf4;
    --service-card-ink: rgba(92, 145, 255, 0.2);
  }

  .sand {
    --service-card-background: #eee5d7;
    --service-card-ink: rgba(255, 180, 105, 0.18);
  }

  .mint {
    --service-card-background: #dceae3;
    --service-card-ink: rgba(70, 190, 145, 0.16);
  }

  .periwinkle {
    --service-card-background: #dde2f0;
    --service-card-ink: rgba(128, 116, 255, 0.18);
  }

  .surface {
    position: relative;
    isolation: isolate;
    min-height: inherit;
    border-radius: inherit;
    background: var(--service-card-background);
    transform-origin: 50% 50%;
  }

  .surface::before {
    position: absolute;
    z-index: -1;
    pointer-events: none;
    content: '';
    inset: 0;
    border-radius: inherit;
    box-shadow: 0 28px 70px rgba(11, 23, 52, 0.12);
    opacity: var(--service-card-shadow-opacity, 0);
  }

  .lens {
    --service-lens-x: 0;
    --service-lens-y: 0;
    position: absolute;
    z-index: 0;
    pointer-events: none;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    background: radial-gradient(
      circle clamp(220px, 24vw, 340px) at calc(var(--service-lens-x) * 1px)
        calc(var(--service-lens-y) * 1px),
      var(--service-card-ink),
      transparent 72%
    );
    opacity: 0;
  }

  .copy {
    position: relative;
    z-index: 1;
  }
  ```

  Move the current `.card` opacity/entrance transform transitions and `body[data-landing-ready] .card` selector unchanged; do not apply them to `.surface`.

- [ ] **Step 5: Implement the fine-pointer GSAP hook**

  Create `use-service-card-hover-motion.ts` with this behavior and cleanup shape:

  ```ts
  import { useGSAP } from '@gsap/react';
  import gsap from 'gsap';
  import { type RefObject } from 'react';

  gsap.registerPlugin(useGSAP);

  const CARD_SELECTOR = '[data-service-card]';
  const SURFACE_SELECTOR = '[data-service-card-surface]';
  const LENS_SELECTOR = '[data-service-card-lens]';

  export function useServiceCardHoverMotion(sectionRef: RefObject<HTMLElement | null>): void {
    useGSAP(
      (_, contextSafe) => {
        const section = sectionRef.current;
        if (!section || !contextSafe) return undefined;

        const media = gsap.matchMedia(section);
        media.add(
          {
            finePointer: '(hover: hover) and (pointer: fine)',
            reduceMotion: '(prefers-reduced-motion: reduce)',
          },
          (context) => {
            const conditions = context.conditions as
              | { finePointer?: boolean; reduceMotion?: boolean }
              | undefined;
            if (!conditions?.finePointer || conditions.reduceMotion) return undefined;

            const cleanups: Array<() => void> = [];
            const cards = Array.from(section.querySelectorAll<HTMLElement>(CARD_SELECTOR));

            cards.forEach((card) => {
              const surface = card.querySelector<HTMLElement>(SURFACE_SELECTOR);
              const lens = card.querySelector<HTMLElement>(LENS_SELECTOR);
              if (!surface || !lens) return;

              const moveLensX = gsap.quickTo(lens, '--service-lens-x', {
                duration: 0.14,
                ease: 'power3.out',
              });
              const moveLensY = gsap.quickTo(lens, '--service-lens-y', {
                duration: 0.14,
                ease: 'power3.out',
              });
              const writePointer = (event: PointerEvent, immediate = false) => {
                const rect = surface.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                if (immediate) {
                  gsap.set(lens, { '--service-lens-x': x, '--service-lens-y': y });
                  return;
                }
                moveLensX(x);
                moveLensY(y);
              };
              const enter = contextSafe((event: PointerEvent) => {
                writePointer(event, true);
                gsap.killTweensOf([surface, lens]);
                gsap.to(surface, {
                  y: -7,
                  scale: 1.006,
                  '--service-card-shadow-opacity': 1,
                  duration: 0.32,
                  ease: 'power3.out',
                  overwrite: true,
                });
                gsap.to(lens, { opacity: 1, duration: 0.18, ease: 'power2.out', overwrite: true });
              });
              const move = contextSafe((event: PointerEvent) => writePointer(event));
              const leave = contextSafe(() => {
                gsap.killTweensOf([surface, lens]);
                gsap.to(surface, {
                  y: 0,
                  scale: 1,
                  '--service-card-shadow-opacity': 0,
                  duration: 0.48,
                  ease: 'back.out(1.35)',
                  overwrite: true,
                  onComplete: () => {
                    gsap.set(surface, { clearProps: 'transform' });
                    surface.style.removeProperty('--service-card-shadow-opacity');
                  },
                });
                gsap.to(lens, { opacity: 0, duration: 0.18, ease: 'power2.out', overwrite: true });
              });

              card.addEventListener('pointerenter', enter);
              card.addEventListener('pointermove', move);
              card.addEventListener('pointerleave', leave);
              card.addEventListener('pointercancel', leave);
              cleanups.push(() => {
                card.removeEventListener('pointerenter', enter);
                card.removeEventListener('pointermove', move);
                card.removeEventListener('pointerleave', leave);
                card.removeEventListener('pointercancel', leave);
                moveLensX.tween.kill();
                moveLensY.tween.kill();
                gsap.killTweensOf([surface, lens]);
                gsap.set(surface, { clearProps: 'transform' });
                gsap.set(lens, { clearProps: 'opacity' });
                surface.style.removeProperty('--service-card-shadow-opacity');
                lens.style.removeProperty('--service-lens-x');
                lens.style.removeProperty('--service-lens-y');
              });
            });

            return () => cleanups.forEach((cleanup) => cleanup());
          },
        );

        return () => media.revert();
      },
      { scope: sectionRef },
    );
  }
  ```

- [ ] **Step 6: Add motion, interruption, and fallback tests**

  Append these concrete assertions to the dedicated spec:

  ```ts
  test('lifts one fine-pointer service surface and tracks the local ink lens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#services');
    await waitForLandingHydration(page);

    const card = page.locator('[data-service-card]').first();
    const surface = card.locator('[data-service-card-surface]');
    const lens = card.locator('[data-service-card-lens]');
    const box = await card.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move((box?.x ?? 0) + 80, (box?.y ?? 0) + 90);
    await expect
      .poll(() =>
        surface.evaluate((element) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
          return matrix.m42;
        }),
      )
      .toBeLessThan(-5.5);
    const activeTransform = await surface.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { rotateB: matrix.b, rotateC: matrix.c, scale: matrix.a, y: matrix.m42 };
    });
    expect(activeTransform.y).toBeGreaterThan(-8.5);
    expect(activeTransform.scale).toBeGreaterThan(1.003);
    expect(activeTransform.scale).toBeLessThan(1.009);
    expect(activeTransform.rotateB).toBeCloseTo(0, 5);
    expect(activeTransform.rotateC).toBeCloseTo(0, 5);

    const firstX = await lens.evaluate((element) =>
      element.style.getPropertyValue('--service-lens-x'),
    );
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) - 80, (box?.y ?? 0) + 140);
    await expect
      .poll(() => lens.evaluate((element) => element.style.getPropertyValue('--service-lens-x')))
      .not.toBe(firstX);

    await page.mouse.move(0, 0);
    await expect
      .poll(() => surface.evaluate((element) => element.style.transform), { timeout: 1_000 })
      .toBe('');
  });

  test('redirects a service return tween on rapid re-entry', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#services');
    await waitForLandingHydration(page);
    const card = page.locator('[data-service-card]').nth(1);
    const surface = card.locator('[data-service-card-surface]');
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    const inside = { x: (box?.x ?? 0) + 70, y: (box?.y ?? 0) + 70 };

    await page.mouse.move(inside.x, inside.y);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(80);
    await page.mouse.move(inside.x + 40, inside.y + 20);
    await expect
      .poll(() =>
        surface.evaluate(
          (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
        ),
      )
      .toBeLessThan(-5.5);
  });

  test('keeps service cards static for reduced motion and touch', async ({ browser }) => {
    const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
    await reducedPage.goto('/#services');
    await reducedPage.locator('[data-service-card]').first().hover();
    await expect(reducedPage.locator('[data-service-card-surface]').first()).toHaveCSS(
      'transform',
      'none',
    );
    await reducedPage.close();

    const touchContext = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const touchPage = await touchContext.newPage();
    await touchPage.goto('/#services');
    await expect(touchPage.locator('[data-service-card-surface]').first()).toHaveCSS(
      'transform',
      'none',
    );
    await expect(touchPage.locator('[data-service-card-lens]').first()).toHaveCSS('opacity', '0');
    await touchContext.close();
  });
  ```

- [ ] **Step 7: Run the service tests and commit**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-service-footer-motion.chrome.spec.ts --project=chrome --grep "service"
  pnpm exec playwright test e2e/landing-capability-gallery.chrome.spec.ts --project=chrome --grep "service|gallery"
  pnpm lint
  ```

  Expected: all service-specific and existing gallery tests PASS.

  Commit:

  ```bash
  git add e2e/landing-service-footer-motion.chrome.spec.ts src/pages/landing/ui/services-section.tsx src/pages/landing/ui/styles/services.module.css src/pages/landing/ui/use-service-card-hover-motion.ts
  git commit -m "feat(services): 카드 잉크 hover 모션 추가"
  ```

---

### Task 3: Build the Footer information rail and signature lens

**Files:**

- Create: `src/pages/landing/ui/use-footer-signature-motion.ts`
- Modify: `src/pages/landing/ui/footer-section.tsx:1-83`
- Modify: `src/pages/landing/ui/styles/footer.module.css:1-205`
- Modify: `e2e/landing-service-footer-motion.chrome.spec.ts`

**Interfaces:**

- Consumes: `Button variant='footer'`, `mailHref`, `COMPANY_INFOS`, `useInViewReveal()`, and the existing `waitForLandingHydration(page: Page)` helper from the dedicated motion spec.
- Produces: `useFooterSignatureMotion(footerRef: RefObject<HTMLElement | null>): void`, exactly one `[data-footer-signature][aria-hidden='true']`, one `[data-footer-signature-base]`, and one `[data-footer-signature-lens]`.

- [ ] **Step 1: Add failing Footer structure and information-preservation tests**

  Append this test to `e2e/landing-service-footer-motion.chrome.spec.ts`:

  ```ts
  test('replaces the duplicate Footer logo with one decorative signature and preserves real information', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#footer');
    await waitForLandingHydration(page);

    const footer = page.locator('#footer');
    const inquiry = footer.getByRole('link', { name: '문의하기', exact: true });
    await expect(inquiry).toHaveAttribute('href', /^mailto:/);
    await expect(inquiry.locator('[data-landing-label]')).toHaveText('문의하기');

    await expect(footer.getByRole('heading', { name: 'FUTUR.' })).toHaveCount(0);
    const signature = footer.locator('[data-footer-signature][aria-hidden="true"]');
    await expect(signature).toHaveCount(1);
    await expect(signature.locator('[data-footer-signature-base]')).toHaveText('FUTUR.');
    await expect(signature.locator('[data-footer-signature-lens]')).toHaveText('FUTUR.');
    await expect(footer.locator('address')).toBeVisible();
    expect(await footer.locator('a[href^="mailto:"]').count()).toBeGreaterThanOrEqual(2);

    const lowerHairlineCount = await footer.locator(':scope > div > *').evaluateAll(
      (elements) =>
        elements.filter((element) => {
          const style = getComputedStyle(element);
          return style.borderTopStyle === 'solid' && style.borderTopWidth === '1px';
        }).length,
    );
    expect(lowerHairlineCount).toBe(2);

    for (const text of [
      '서비스와 시스템을 만들고, 필요한 기술을 연결해 운영까지 이어갑니다.',
      '개인정보처리방침',
      '이용약관',
      '사업자등록번호',
      '통신판매업',
      '개인정보 보호책임자',
    ]) {
      await expect(footer.getByText(text, { exact: false }).first()).toBeVisible();
    }
  });
  ```

- [ ] **Step 2: Run the Footer structure test to verify RED**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-service-footer-motion.chrome.spec.ts --project=chrome --grep "decorative signature"
  ```

  Expected: FAIL because the current Footer still has an `h3` logo and no signature DOM.

- [ ] **Step 3: Restructure Footer DOM without changing real destinations or facts**

  Replace `footer-section.tsx` with the complete component below. This preserves the CTA's `mailto:`, variant, magnetic owner, and label layer while changing only the lower reading order:

  ```tsx
  import { Link } from '@tanstack/react-router';
  import { useRef } from 'react';

  import { Button } from './button';
  import styles from './styles/footer.module.css';
  import sharedStyles from './styles/shared.module.css';
  import { useFooterSignatureMotion } from './use-footer-signature-motion';
  import { mailHref } from '../lib/company-links';
  import { COMPANY_INFOS } from '@/entities/company';

  export function FooterSection() {
    const footerRef = useRef<HTMLElement | null>(null);
    useFooterSignatureMotion(footerRef);

    return (
      <footer
        ref={footerRef}
        className={styles.footer}
        id='footer'
        data-landing-section
        data-header-surface='dark'
        data-cursor-contrast='light'
      >
        <div className={sharedStyles.container}>
          <div className={styles.footerTop}>
            <h2>필요한 변화가 있다면, 그 시작부터 함께합니다.</h2>
            <p>
              새로운 아이디어도, 이미 운영 중인 시스템의 문제도 괜찮습니다. 현재 상황과 필요한
              기능을 알려주세요.
            </p>
            <Button
              className={styles.footerCta}
              variant='footer'
              href={mailHref}
              data-landing-magnetic='true'
            >
              <span data-landing-label>문의하기</span>
            </Button>
          </div>

          <div className={styles.infoRail}>
            <p className={styles.serviceStatement}>
              서비스와 시스템을 만들고, 필요한 기술을 연결해 운영까지 이어갑니다.
            </p>
            <div className={styles.contactDetails}>
              <strong>문의</strong>
              <a href={mailHref}>{COMPANY_INFOS.EMAIL}</a>
              <address>{COMPANY_INFOS.ADDRESS}</address>
            </div>
          </div>

          <div className={styles.legalMetadata}>
            <nav className={styles.legalLinks} aria-label='법적 고지'>
              <Link to='/privacy' className={styles.legalPrimary}>
                개인정보처리방침
              </Link>
              <span className={styles.legalDivider} aria-hidden='true'>
                ·
              </span>
              <Link to='/terms' className={styles.legalSecondary}>
                이용약관
              </Link>
            </nav>
            <div className={styles.legalFacts}>
              <span>© 2026 FUTUR. All rights reserved.</span>
              <span>
                대표 {COMPANY_INFOS.CEO} · 사업자등록번호 {COMPANY_INFOS.BUSINESS_LICENSE} ·
                통신판매업 {COMPANY_INFOS.MAIL_ORDER_LICENSE}
              </span>
              <span>
                개인정보 보호책임자 {COMPANY_INFOS.PRIVACY_OFFICER.NAME} (
                <a href={`mailto:${COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}`}>
                  {COMPANY_INFOS.PRIVACY_OFFICER.EMAIL}
                </a>
                )
              </span>
            </div>
          </div>

          <div
            className={styles.signature}
            data-footer-signature
            data-landing-reveal='footer-signature'
            aria-hidden='true'
          >
            <span className={styles.signatureBase} data-footer-signature-base>
              FUTUR.
            </span>
            <span className={styles.signatureLens} data-footer-signature-lens>
              FUTUR.
            </span>
          </div>
        </div>
      </footer>
    );
  }
  ```

- [ ] **Step 4: Implement the editorial rail and one-time signature reveal**

  Replace `.footerGrid`, Footer `h3`, `.copyright`, and the current three-rule stacking with these responsibilities in `footer.module.css`:

  ```css
  .infoRail {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
    gap: clamp(48px, 8vw, 128px);
    align-items: start;
    padding-block: 54px;
    border-top: 1px solid rgba(225, 231, 243, 0.2);
  }

  .serviceStatement {
    max-width: 560px;
    margin: 0;
    color: rgba(238, 242, 249, 0.82);
    font-size: clamp(18px, 1.8vw, 25px);
    font-weight: 600;
    line-height: 1.55;
  }

  .contactDetails {
    display: grid;
    gap: 12px;
    color: rgba(224, 230, 240, 0.68);
    font-size: 14px;
    line-height: 1.65;
  }

  .contactDetails strong,
  .contactDetails a,
  .contactDetails address {
    color: inherit;
    font-style: normal;
  }

  .legalMetadata {
    display: grid;
    gap: 20px;
    padding-block: 24px 34px;
    border-top: 1px solid rgba(225, 231, 243, 0.16);
  }

  .legalLinks,
  .legalFacts {
    display: flex;
    align-items: center;
    gap: 10px 18px;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
  }

  .legalFacts {
    color: rgba(211, 218, 231, 0.64);
    font-size: 13px;
    line-height: 1.6;
  }

  .signature {
    --footer-signature-x: 0;
    --footer-signature-y: 0;
    position: relative;
    overflow: hidden;
    width: 100%;
    margin-top: clamp(34px, 5vw, 72px);
    font-family: var(--font-display);
    font-size: clamp(112px, 18vw, 260px);
    font-weight: 700;
    letter-spacing: -0.055em;
    line-height: 0.78;
    white-space: nowrap;
    clip-path: inset(0);
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition:
      clip-path 700ms var(--ease-out),
      opacity 700ms var(--ease-out),
      transform 700ms var(--ease-out);
  }

  :global(body[data-landing-ready='true']) .signature:not([data-landing-visible='true']) {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }

  .signatureBase,
  .signatureLens {
    display: block;
  }

  .signatureBase {
    color: rgba(255, 255, 255, 0.07);
  }

  .signatureLens {
    position: absolute;
    pointer-events: none;
    inset: 0;
    color: transparent;
    background: linear-gradient(90deg, #315cff 0%, rgba(255, 255, 255, 0.92) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-mask-image: radial-gradient(
      circle clamp(180px, 22vw, 320px) at calc(var(--footer-signature-x) * 1px)
        calc(var(--footer-signature-y) * 1px),
      #000 0%,
      transparent 72%
    );
    mask-image: radial-gradient(
      circle clamp(180px, 22vw, 320px) at calc(var(--footer-signature-x) * 1px)
        calc(var(--footer-signature-y) * 1px),
      #000 0%,
      transparent 72%
    );
    opacity: 0;
  }

  @media (max-width: 900px) {
    .infoRail {
      grid-template-columns: 1fr;
      gap: 38px;
    }

    .legalMetadata,
    .legalFacts {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 560px) {
    .signature {
      font-size: clamp(72px, 26vw, 124px);
    }
  }
  ```

  Keep exactly two lower-Footer hairlines: `infoRail` top and `legalMetadata` top. Do not add a border to the signature.

- [ ] **Step 5: Implement the Footer signature pointer hook**

  Create `use-footer-signature-motion.ts`:

  ```ts
  import { useGSAP } from '@gsap/react';
  import gsap from 'gsap';
  import { type RefObject } from 'react';

  gsap.registerPlugin(useGSAP);

  export function useFooterSignatureMotion(footerRef: RefObject<HTMLElement | null>): void {
    useGSAP(
      (_, contextSafe) => {
        const footer = footerRef.current;
        const signature = footer?.querySelector<HTMLElement>('[data-footer-signature]');
        const lens = signature?.querySelector<HTMLElement>('[data-footer-signature-lens]');
        if (!footer || !signature || !lens || !contextSafe) return undefined;

        const media = gsap.matchMedia(footer);
        media.add(
          {
            finePointer: '(hover: hover) and (pointer: fine)',
            reduceMotion: '(prefers-reduced-motion: reduce)',
          },
          (context) => {
            const conditions = context.conditions as
              | { finePointer?: boolean; reduceMotion?: boolean }
              | undefined;
            if (!conditions?.finePointer || conditions.reduceMotion) return undefined;

            const moveX = gsap.quickTo(signature, '--footer-signature-x', {
              duration: 0.16,
              ease: 'power3.out',
            });
            const moveY = gsap.quickTo(signature, '--footer-signature-y', {
              duration: 0.16,
              ease: 'power3.out',
            });
            const writePointer = (event: PointerEvent, immediate = false) => {
              const rect = signature.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const y = event.clientY - rect.top;
              if (immediate) {
                gsap.set(signature, { '--footer-signature-x': x, '--footer-signature-y': y });
                return;
              }
              moveX(x);
              moveY(y);
            };
            const enter = contextSafe((event: PointerEvent) => {
              writePointer(event, true);
              gsap.to(lens, { opacity: 1, duration: 0.2, ease: 'power2.out', overwrite: true });
            });
            const move = contextSafe((event: PointerEvent) => writePointer(event));
            const leave = contextSafe(() => {
              gsap.to(lens, { opacity: 0, duration: 0.18, ease: 'power2.out', overwrite: true });
            });

            signature.addEventListener('pointerenter', enter);
            signature.addEventListener('pointermove', move);
            signature.addEventListener('pointerleave', leave);
            signature.addEventListener('pointercancel', leave);

            return () => {
              signature.removeEventListener('pointerenter', enter);
              signature.removeEventListener('pointermove', move);
              signature.removeEventListener('pointerleave', leave);
              signature.removeEventListener('pointercancel', leave);
              moveX.tween.kill();
              moveY.tween.kill();
              gsap.killTweensOf(lens);
              gsap.set(lens, { clearProps: 'opacity' });
              signature.style.removeProperty('--footer-signature-x');
              signature.style.removeProperty('--footer-signature-y');
            };
          },
        );

        return () => media.revert();
      },
      { scope: footerRef },
    );
  }
  ```

  The hook must never tween the signature wrapper's `x`, `y`, `scale`, or `rotation`; its only wrapper writes are the two mask-coordinate custom properties.

- [ ] **Step 6: Add reveal, pointer, and fallback tests**

  Append the following assertions to the dedicated spec:

  ```ts
  test('reveals the Footer signature once and tracks the lens without moving the wordmark', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await waitForLandingHydration(page);

    const signature = page.locator('[data-footer-signature]');
    await signature.scrollIntoViewIfNeeded();
    await expect(signature).toHaveAttribute('data-landing-visible', 'true');
    const finalTransform = await signature.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(finalTransform);

    const box = await signature.boundingBox();
    expect(box).not.toBeNull();
    const beforeRect = await signature.evaluate((element) =>
      element.getBoundingClientRect().toJSON(),
    );
    await page.mouse.move((box?.x ?? 0) + 100, (box?.y ?? 0) + 40);
    await expect(signature.locator('[data-footer-signature-lens]')).toHaveCSS('opacity', '1');
    const firstX = await signature.evaluate((element) =>
      element.style.getPropertyValue('--footer-signature-x'),
    );
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) - 120, (box?.y ?? 0) + 55);
    await expect
      .poll(() =>
        signature.evaluate((element) => element.style.getPropertyValue('--footer-signature-x')),
      )
      .not.toBe(firstX);
    const afterRect = await signature.evaluate((element) =>
      element.getBoundingClientRect().toJSON(),
    );
    expect(afterRect.x).toBeCloseTo(beforeRect.x, 1);
    expect(afterRect.y).toBeCloseTo(beforeRect.y, 1);

    await page.mouse.move(0, 0);
    await expect(signature.locator('[data-footer-signature-lens]')).toHaveCSS('opacity', '0');

    await page.locator('#services').scrollIntoViewIfNeeded();
    await signature.scrollIntoViewIfNeeded();
    await expect(signature).toHaveAttribute('data-landing-visible', 'true');
  });

  test('uses a static Footer signature for reduced motion and touch', async ({ browser }) => {
    const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
    await reducedPage.goto('/#footer');
    const reducedSignature = reducedPage.locator('[data-footer-signature]');
    await expect(reducedSignature).toHaveCSS('transform', 'none');
    await expect(reducedSignature.locator('[data-footer-signature-lens]')).toHaveCSS(
      'opacity',
      '0',
    );
    await reducedPage.close();

    const touchContext = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const touchPage = await touchContext.newPage();
    await touchPage.goto('/#footer');
    await expect(touchPage.locator('[data-footer-signature-lens]')).toHaveCSS('opacity', '0');
    await touchContext.close();
  });
  ```

- [ ] **Step 7: Run the Footer tests and commit**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-service-footer-motion.chrome.spec.ts --project=chrome --grep "Footer|signature"
  pnpm exec playwright test e2e/landing-runtime-errors.chrome.spec.ts --project=chrome
  pnpm lint
  ```

  Expected: Footer motion tests and the existing magnetic CTA runtime path PASS.

  Commit:

  ```bash
  git add e2e/landing-service-footer-motion.chrome.spec.ts src/pages/landing/ui/footer-section.tsx src/pages/landing/ui/styles/footer.module.css src/pages/landing/ui/use-footer-signature-motion.ts
  git commit -m "feat(footer): 정보 레일과 시그니처 렌즈 추가"
  ```

---

### Task 4: Lock fallback, overflow, accessibility, and design contracts

**Files:**

- Modify: `e2e/landing-service-footer-motion.chrome.spec.ts`
- Modify: `e2e/a11y/landing.static.a11y.spec.ts:15-27`
- Modify: `src/pages/landing/ui/styles/services.module.css`
- Modify: `src/pages/landing/ui/styles/footer.module.css`
- Modify: `DESIGN.md:59-125`

**Interfaces:**

- Consumes: the service surface/lens and Footer signature DOM from Tasks 2-3, native SSR markup, shared `useInViewReveal()`, and the existing a11y fixture.
- Produces: static no-JavaScript/reduced-motion CSS, explicit responsive overflow coverage, a standalone Footer axe scan, and the updated canonical design contract.

- [ ] **Step 1: Add responsive and no-JavaScript regression tests**

  Append the following test to the dedicated motion spec:

  ```ts
  test('keeps Services and Footer readable without horizontal overflow at supported widths', async ({
    browser,
  }) => {
    const page = await browser.newPage();
    for (const width of [1280, 900, 390]) {
      await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
      await page.goto('/');
      await waitForLandingHydration(page);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      ).toBe(false);
      await expect(page.locator('[data-service-card]')).toHaveCount(4);
      await expect(page.locator('[data-footer-signature]')).toHaveCount(1);
    }
    await page.close();

    const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
    const noScriptPage = await noScriptContext.newPage();
    await noScriptPage.goto('/');
    await expect(noScriptPage.locator('[data-service-card]')).toHaveCount(4);
    await expect(noScriptPage.locator('[data-footer-signature]')).toBeVisible();
    await expect(noScriptPage.getByRole('link', { name: '문의하기', exact: true })).toHaveAttribute(
      'href',
      /^mailto:/,
    );
    await noScriptContext.close();
  });
  ```

- [ ] **Step 2: Add explicit CSS fallback rules**

  Add the following to the relevant modules after their default final-state styles:

  ```css
  /* services.module.css */
  @media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
    .surface {
      transform: none !important;
    }

    .surface::before,
    .lens {
      opacity: 0 !important;
    }
  }
  ```

  ```css
  /* footer.module.css */
  @media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
    .signature {
      clip-path: inset(0) !important;
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }

    .signatureLens {
      opacity: 0 !important;
    }
  }
  ```

  Do not set `overflow-x: hidden` on the page to conceal a layout defect. Keep clipping local to each lens/signature field and let the regression fail if a child exceeds the viewport.

- [ ] **Step 3: Add a standalone Footer axe scan**

  Extend the static a11y section table so Services and Footer are both independently attributable:

  ```ts
  const sections = [
    { id: '#services', name: '서비스' },
    { id: '#technology', name: '기술(대표 기술)' },
    { id: '#faq', name: 'FAQ(단일 열림 아코디언)' },
    { id: '#footer', name: 'Footer 문의와 법적 정보' },
  ] as const;
  ```

  No interactive a11y test is required for the decorative signature because it cannot receive focus and exposes no information.

- [ ] **Step 4: Update the canonical design documentation**

  In root `DESIGN.md`, make these exact contract changes:
  - Replace “Header 전체를 덮는 표면” behavior with “Header 캡슐의 세로 중앙선을 통과하는 실제 `[data-header-surface]`” and record `240ms` tone transitions.
  - Replace “서비스 카드 hover 장식은 추가하지 않는다” with Lifted Ink Surface values: `-7px`, `1.006`, per-tone lens colors, `320/480/180ms`, and informational/non-focusable semantics.
  - Replace the plain Footer lower-layout description with information rail → legal metadata → decorative `FUTUR.` signature order and exactly two hairlines.
  - Record the one-time `700ms` signature reveal, fine-pointer radial glyph mask, and static touch/reduced/no-JavaScript fallbacks.
  - Keep the existing anti-fabrication, default-pointer, CTA, legal-route, Technology, and FAQ rules unchanged.

- [ ] **Step 5: Run fallback/a11y tests and commit**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-service-footer-motion.chrome.spec.ts --project=chrome
  pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts --project=a11y
  pnpm exec playwright test e2e/a11y/landing.interactive.a11y.spec.ts --project=a11y
  pnpm lint
  ```

  Expected: dedicated motion, standalone Footer/Services, full-page, and interactive a11y scans PASS.

  Commit:

  ```bash
  git add DESIGN.md e2e/landing-service-footer-motion.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts src/pages/landing/ui/styles/services.module.css src/pages/landing/ui/styles/footer.module.css
  git commit -m "test(landing): 모션 fallback과 접근성 계약 보강"
  ```

---

### Task 5: Run complete verification, inspect the real page, and refresh graphify

**Files:**

- Modify only if verification exposes a defect in the files already listed above.
- Generated by project tool: `graphify-out/*`

**Interfaces:**

- Consumes: all implementation commits from Tasks 1-4.
- Produces: a clean full verification result, internal-browser visual evidence at all target widths, and an updated project graph.

- [ ] **Step 1: Run the focused implementation suites**

  Run:

  ```bash
  pnpm exec playwright test e2e/landing-service-footer-motion.chrome.spec.ts e2e/landing-adaptive-island.chrome.spec.ts e2e/landing-capability-gallery.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --project=chrome
  ```

  Expected: all four focused spec files PASS with no console/page errors.

- [ ] **Step 2: Run all accessibility and E2E suites**

  Run:

  ```bash
  pnpm exec playwright test --project=a11y
  pnpm test:e2e
  ```

  Expected: all accessibility and full E2E tests PASS. If a test fails, apply the smallest in-scope correction, rerun that exact failing test, then rerun both commands.

- [ ] **Step 3: Run static verification**

  Run:

  ```bash
  pnpm lint
  pnpm build
  ```

  Expected: both commands exit with code 0 and no TypeScript, ESLint, or production-build error.

- [ ] **Step 4: Inspect in the Codex in-app browser**

  Keep the local site on `http://127.0.0.1:3000/` and inspect these exact states using the Codex in-app browser, not external Chrome:
  1. `1280×900`: scroll Hero → Services slowly and confirm Header tone begins after Services crosses half the glass capsule; reverse direction and confirm the same boundary.
  2. `1280×900`: hover each service card at left/center/right positions; confirm local lens tracking, `-7px` lift, no tilt, no pointer cursor, no neighbor movement, and clean return.
  3. `1280×900`: scroll to Footer; confirm CTA remains centered/usable, exactly two lower rules, no small duplicate logo, one-time upward signature reveal, and glyph-contained lens.
  4. `900×844` and `390×844`: confirm static cards/signature on touch-style layouts, correct reading order, legal wrapping, signature on one line, and no horizontal scroll.

  Record defects by exact viewport and element; do not broaden the design while fixing a regression.

- [ ] **Step 5: Refresh graphify and commit any generated graph changes**

  Run:

  ```bash
  graphify update .
  git status --short
  ```

  If `graphify-out/*` changes, commit only those graph files after inspecting the status:

  ```bash
  git add graphify-out
  git commit -m "chore(graphify): 랜딩 모션 그래프 갱신"
  ```

  If the graph is already current and no files change, do not create an empty commit.

- [ ] **Step 6: Confirm branch state before handoff**

  Run:

  ```bash
  git status --short --branch
  git log -5 --oneline --decorate
  ```

  Expected: no unintended untracked/modified files; all implementation commits are visible on the current branch. Do not merge or push unless the user explicitly requests that integration step.

---

## Self-Review Record

- Spec coverage: Header midpoint and `240ms` tone, all four service surfaces/lenses, exact lift/scale/eases/colors, fine-pointer gating, Footer data preservation, two hairlines, one-time signature reveal, pointer mask, accessibility, responsive/no-JavaScript fallbacks, full verification, internal-browser review, and graph refresh are each assigned to a task.
- Exclusions retained: no images, generated media, new dependency, card interactivity, custom cursor, fabricated proof, Footer navigation, or shared Button/global-hook expansion.
- Interface consistency: `useServiceCardHoverMotion(sectionRef)` and `useFooterSignatureMotion(footerRef)` signatures and all six approved DOM selectors are identical in component, hook, CSS, and test steps.
- Placeholder scan: every implementation step contains exact code or exact edit values, with no deferred implementation markers.
