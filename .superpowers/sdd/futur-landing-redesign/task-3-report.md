# Task 3 — Purposeful motion, accessible interactions, and regression coverage

## Outcome

Implemented the approved motion tokens and interaction contracts without adding a dependency. Pointer-driven motion is short and transform/opacity based; keyboard-driven high-frequency interactions update immediately. Scrollbar, modal, FAQ, tabs, select, and custom cursor behavior now have focused Chromium regression coverage.

## RED

Command:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts
```

Initial result: **6 failed, 2 passed**.

- Failed: scrollbar role/ARIA/keyboard contract.
- Failed: modal label, initial focus, inert background, focus trap/restore contract.
- Failed: closed FAQ panels were not hidden/inert.
- Failed: custom-select post-open geometry/state contract.
- Failed: cursor readiness, idle RAF, visibility, and native fallback contract.
- Failed: runtime style gate detected forbidden infinite pulse motion.
- Passed before implementation: the existing reduced-motion and rapid-tab baselines.

## GREEN

Command:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts
```

Final result: **8 passed (11.0s)**.

Covered scenarios:

1. Scrollbar ARIA values and Arrow/Page/Home/End keyboard scrolling.
2. Modal initial focus, focus trap, inert background, Escape/backdrop close, and focus restore.
3. FAQ hidden/inert closed state and keyboard-expanded state.
4. Custom-select post-open measurement, active descendant, and selection alignment.
5. Cursor native fallback, readiness, 1.2s idle stop, hide, and restart.
6. Reduced-motion computed styles.
7. Rapid tab last-selection-wins plus repeated menu console silence.
8. Runtime rejection of infinite, ease-in, scale-zero, and `transition: all` motion.

## Additional verification

```sh
pnpm exec playwright test e2e/a11y/landing.interactive.a11y.spec.ts --grep "CaseStories —"
```

Result: **1 passed (5.4s)**. Rapidly selected tabs retain an axe-valid contrast state.

```sh
pnpm exec playwright test -c playwright.task-2.config.ts --grep "does not promise"
pnpm exec playwright test -c playwright.task-2.config.ts --grep "mobile disclosure"
```

Result: **1 passed** for the FAQ pointer disclosure and **1 passed** for the mobile disclosure in focused single-worker runs.

```sh
pnpm lint
```

Result: **passed, 0 errors and 0 warnings**.

```sh
pnpm build
```

Result: **passed**; TypeScript project build and client/SSR/Nitro production builds completed.

```sh
git diff --check
```

Result: **passed**.

```sh
graphify update .
```

Result: graph refresh was attempted as required. Graphify refused to overwrite because the new extraction had 1,862 nodes while the existing graph has 10,930; no force overwrite was used. Existing graph output was preserved.

## Full E2E regression result

Command:

```sh
pnpm test:e2e
```

Fresh final result: **33 passed, 5 failed, 1 skipped (1.0m)**.

The focused Task 3 suite remained fully green. The five full-suite failures were:

- Protected `e2e/landing.chrome.spec.ts` expects a previously deleted hero asset.
- Static accessibility coverage expects the previously deleted `#process` section.
- One Task 1 idempotency/rate-store assertion was unstable under the shared six-worker run; Task 3 did not change the contact server/security path.
- FAQ disclosure visibility and the mobile disclosure menu timed out in the shared six-worker snapshot; each passes when rerun in the focused single-worker configuration. The FAQ pointer path was then simplified to a single click-state transaction and reverified. The full suite was not rerun again because the controller explicitly requested closure without blocking on stale/protected cross-task failures.

## Motion feel checks

- Hero explanatory sequence uses three staged transform/opacity entrances and completes within 820ms; movement is capped at 16px.
- Interactive feedback is under 300ms: press 100ms, hover 150ms, disclosure/select 180ms in and 120ms out, tabs 220ms, modal 250ms in and 180ms out.
- Pointer tab transitions are interruptible and keyboard tab changes are immediate.
- Card hover lift is at most 2px and gated to hover-capable fine pointers.
- Reduced motion removes spatial movement and animation while retaining only short opacity/color feedback.
- Cursor dot/aura/label remain intact, native cursor remains available before readiness, and custom cursor work pauses while idle/hidden.
- No blur entrances, infinite decoration, layout-property animation, `scale(0)`, `transition: all`, or ease-in UI remains in the runtime landing styles covered by the test.
- Chromium checks on port 3000 confirmed tab state legibility and post-interaction axe contrast. Final subjective cross-browser visual review remains appropriate for the controller.

## Files

### Test and configuration

- `playwright.task-3.config.ts`
- `e2e/task-3/landing-motion-accessibility.spec.ts`

### Motion and interaction implementation

- `src/styles/tokens.css`
- `src/styles/globals.css`
- `src/pages/root/ui/root-document.tsx`
- `src/pages/landing/ui/case-stories-section.tsx`
- `src/pages/landing/ui/custom-select.tsx`
- `src/pages/landing/ui/faq-section.tsx`
- `src/pages/landing/ui/landing-page.tsx`
- `src/pages/landing/ui/landing-scrollbar.tsx`
- `src/pages/landing/ui/legal-modal.tsx`
- `src/pages/landing/ui/use-custom-cursor.ts`
- `src/pages/landing/ui/use-landing-gsap-interactions.ts`
- `src/pages/landing/ui/styles/button.module.css`
- `src/pages/landing/ui/styles/case-stories.module.css`
- `src/pages/landing/ui/styles/custom-cursor.module.css`
- `src/pages/landing/ui/styles/faq.module.css`
- `src/pages/landing/ui/styles/footer.module.css`
- `src/pages/landing/ui/styles/form-controls.module.css`
- `src/pages/landing/ui/styles/header.module.css`
- `src/pages/landing/ui/styles/hero.module.css`
- `src/pages/landing/ui/styles/landing-scrollbar.module.css`
- `src/pages/landing/ui/styles/legal-modal.module.css`
- `src/pages/landing/ui/styles/scroll-top.module.css`
- `src/pages/landing/ui/styles/services.module.css`
- `src/pages/landing/ui/styles/shared.module.css`
- `src/pages/landing/ui/styles/team.module.css`

Protected dirty files were not edited or staged by Task 3.
