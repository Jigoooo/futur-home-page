# Services Variants Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build production-quality B and C service variants alongside A, expose them through development-only query previews, and remove STACK and PROCESS from the shared landing flow.

**Architecture:** Keep the shared section shell in `services-section.tsx`, split each visual direction into its own component and CSS Module, and select the preview with an SSR-safe external-store hook that returns A in production. Preserve the existing service data as the single source of truth and add scope metadata used by B and C.

**Tech Stack:** React 19, TypeScript, CSS Modules, Playwright, existing reveal utilities

## Global Constraints

- Default and production output remain variant A until the user selects a final direction.
- B and C are available only through `?services=b` and `?services=c` in development.
- Do not add dependencies or fabricate clients, performance claims, model-training capability, or portfolio evidence.
- STACK and PROCESS are removed from rendering and navigation but their source files remain recoverable.
- Header navigation becomes Services, Team, Operations, FAQ.
- Static Bento cards are not focusable; C uses real buttons because it changes visible content.
- All variants support 390px layouts and reduced motion.

---

### Task 1: Shared page contraction

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `e2e/landing-classic-restoration.chrome.spec.ts`
- Modify: `e2e/landing-anti-slop.chrome.spec.ts`
- Modify: `e2e/a11y/landing.static.a11y.spec.ts`
- Modify: `src/pages/landing/ui/landing-page.tsx`
- Modify: `src/pages/landing/config/navigation.ts`
- Modify: `src/pages/landing/ui/use-adaptive-header.ts`

- [ ] Write failing assertions for section order `hero, services, team, operations, faq`, missing `#stack/#process`, and navigation `#services/#team/#operations/#faq`.
- [ ] Run focused structural tests and verify they fail against the current page.
- [ ] Remove STACK and PROCESS rendering/imports, update navigation, and map Operations directly to its own link.
- [ ] Update obsolete header motion test targets from STACK/PROCESS to Team/Operations without weakening the indicator behavior checks.
- [ ] Run the structural and adaptive-header tests until they pass.

### Task 2: Variant preview boundary

**Files:**

- Create: `src/pages/landing/ui/use-services-preview-variant.ts`
- Create: `src/pages/landing/ui/services-capability-map.tsx`
- Modify: `src/pages/landing/ui/services-section.tsx`
- Modify: `src/pages/landing/ui/styles/services.module.css`
- Create: `src/pages/landing/ui/styles/services-capability-map.module.css`
- Test: `e2e/landing-cinematic-editorial.chrome.spec.ts`

- [ ] Write a failing test proving `/` renders A and `/?services=b` requests a different variant boundary.
- [ ] Extract the approved A map without visual or semantic regression.
- [ ] Implement an SSR-safe development preview selector with production fallback `a`.
- [ ] Run A regression tests and the preview-boundary test.

### Task 3: B asymmetric Bento

**Files:**

- Create: `src/pages/landing/ui/services-bento-grid.tsx`
- Create: `src/pages/landing/ui/styles/services-bento-grid.module.css`
- Modify: `src/pages/landing/model/types.ts`
- Modify: `src/pages/landing/config/services.ts`
- Test: `e2e/landing-cinematic-editorial.chrome.spec.ts`

- [ ] Write a failing B test for five cards, span values `7,5,5,7,12`, service scopes, and no interactive descendants.
- [ ] Add service keys and three scope strings per service.
- [ ] Implement the asymmetric grid, service-specific abstract visuals, restrained hover, mobile stacking, and reduced-motion fallback.
- [ ] Run the focused B test and verify it passes.

### Task 4: C interactive index

**Files:**

- Create: `src/pages/landing/ui/services-capability-index.tsx`
- Create: `src/pages/landing/ui/styles/services-capability-index.module.css`
- Test: `e2e/landing-cinematic-editorial.chrome.spec.ts`

- [ ] Write a failing C test for five buttons, initial selection, focus preview, click selection, and the selected service detail.
- [ ] Implement selected and preview state with hover/focus parity and `aria-pressed` buttons.
- [ ] Render a desktop shared detail panel and a mobile inline accordion panel from the same detail component.
- [ ] Run the focused C test and verify it passes.

### Task 5: Comparison and verification

**Files:**

- Update generated graph files under `graphify-out/`

- [ ] Run the relevant cinematic, motion, adaptive-header, classic restoration, anti-slop, and accessibility tests.
- [ ] Inspect A, B, and C in separate internal-browser tabs at desktop and 390px.
- [ ] Check hover/focus/selected states and browser console errors.
- [ ] Run `pnpm lint`, `pnpm build`, `git diff --check`, and `graphify update .`.
