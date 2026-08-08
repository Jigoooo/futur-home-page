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

---

## Fix round 1 — review blockers

### Scope completed

- Replaced cursor width/height animation with a fixed 82px tracker and a transform/opacity-only pseudo-ring. The visual ring still resolves to 42px at rest, 58px over soft targets, and 82px over labelled targets.
- Added cursor failure recovery: an RAF setup/scheduling failure clears ready/running/hot/soft/muted/enabled state and restores the native cursor without emitting an uncaught page error.
- Deleted the inert landing-wide pointer geometry/GSAP spotlight hook, its call sites/data attributes/unused CSS variables, both GSAP dependencies, and their lockfile entries.
- Added interruptible FAQ presence state: pointer enter uses 180ms, pointer exit remains rendered until the 120ms opacity transition completes, then applies `hidden`/`inert`; keyboard toggles are immediate.
- Added mobile-menu presence state: pointer entry originates at the top-right with `translateY(-6px) scale(.98)` plus opacity at 180ms, pointer exit remains mounted for 120ms, and keyboard/Escape paths are immediate with focus restoration.
- Refreshed custom-select modality on every keyboard open/navigation/select/Escape path, including keyboard actions after a pointer open. Pointer enter/exit remains 180/120ms; keyboard close/select computes to 0ms.
- Replaced modal close delay with actual backdrop `animationend`; reduced-motion close unmounts immediately and releases inert/focus state without waiting for full motion.
- Moved service/team/stage/check, navigation underline, scroll-top, footer, consent, and modal-close hover transforms behind fine-pointer plus no-preference gates, with explicit coarse/reduced fallbacks.
- Replaced applicable 160ms hover/color literals with `--motion-hover` and retained the approved exact token scale.
- Closed the shared-worker FAQ/mobile regression by keeping the styled app non-interactive until the existing React hydration-ready marker is present. The earlier failures were lost pre-hydration clicks, not shared component state.

### RED evidence

Command:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts
```

Result before fix-round implementation: **7 failed, 8 passed (1.4m)**.

The seven failures were:

1. cursor pseudo-ring did not expose transform/opacity-only timing;
2. forced cursor RAF failure left ready/enabled state behind;
3. FAQ did not retain pointer exit presence or use 180/120ms timing;
4. mobile disclosure had no mounted enter/exit state;
5. custom select retained pointer modality during keyboard close/select;
6. reduced/coarse hover-transform checks failed/timed out against ungated targets;
7. package/lockfile still contained GSAP and the static contract detected it.

The existing scrollbar, modal focus, FAQ keyboard, select geometry, reduced-motion, rapid-tab, console-silence, and forbidden-style checks remained green.

### GREEN evidence

Command:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts
```

Final result: **15 passed (19.3s)**.

The suite now verifies exact 100/150/180/120/220/250/180ms tokens, hero completion at no more than 900ms, no layout-property transitions/animations across landing styles, fixed cursor geometry, cursor failure cleanup, FAQ/menu presence timing, select modality, modal animation synchronization, reduced/coarse hovered computed styles, and absence of GSAP in source/package/lockfile.

Concurrent regression reproduction:

```sh
pnpm exec playwright test e2e/landing-evidence.chrome.spec.ts \
  --grep "does not promise|mobile disclosure" --workers=2
```

Result after hydration interaction gate: **2 passed (7.8s)**. Before the gate, both tests failed together because they clicked SSR markup without waiting for `data-landing-ready`.

Final full regression:

```sh
pnpm test:e2e
```

Result: **35 passed, 3 failed, 1 skipped (58.9s)**. FAQ and mobile disclosure both passed in the six-worker run. Remaining failures are cross-task/protected:

- `e2e/contact-server-boundaries.chrome.spec.ts` idempotency-capacity assertion: expected `RATE_LIMITED`, received `{ ok: true }` under the shared server run. Task 3 did not edit contact server/security behavior.
- protected untracked `e2e/landing.chrome.spec.ts`: expects the deleted `FUTUR 서비스 화면 예시` hero asset.
- `e2e/a11y/landing.static.a11y.spec.ts`: waits for the deleted `#process` section.

Static/build checks:

```sh
pnpm lint
pnpm exec tsc -b --pretty false
pnpm build
git diff --check
```

Result: all passed. Production output no longer contains the GSAP runtime chunk.

```sh
graphify update .
```

Result: attempted after the final code change. Graphify again fail-closed because the new extraction contained 1,849 nodes versus 10,930 in the existing graph; no destructive `--force` overwrite was used and graph output was preserved.

### Fix-round files

- `.superpowers/sdd/futur-landing-redesign/task-3-report.md`
- `e2e/task-3/landing-motion-accessibility.spec.ts`
- `package.json`
- `pnpm-lock.yaml`
- `src/pages/root/ui/root-document.tsx`
- `src/pages/landing/ui/button.tsx`
- `src/pages/landing/ui/contact-section.tsx`
- `src/pages/landing/ui/custom-cursor.tsx`
- `src/pages/landing/ui/custom-select.tsx`
- `src/pages/landing/ui/faq-section.tsx`
- `src/pages/landing/ui/header-section.tsx`
- `src/pages/landing/ui/landing-page.tsx`
- `src/pages/landing/ui/legal-modal.tsx`
- `src/pages/landing/ui/services-section.tsx`
- `src/pages/landing/ui/use-custom-cursor.ts`
- deleted `src/pages/landing/ui/use-landing-gsap-interactions.ts`
- `src/pages/landing/ui/styles/button.module.css`
- `src/pages/landing/ui/styles/contact.module.css`
- `src/pages/landing/ui/styles/custom-cursor.module.css`
- `src/pages/landing/ui/styles/faq.module.css`
- `src/pages/landing/ui/styles/footer.module.css`
- `src/pages/landing/ui/styles/form-controls.module.css`
- `src/pages/landing/ui/styles/header.module.css`
- `src/pages/landing/ui/styles/legal-modal.module.css`
- `src/pages/landing/ui/styles/scroll-top.module.css`
- `src/pages/landing/ui/styles/services.module.css`
- `src/pages/landing/ui/styles/team.module.css`

Protected dirty files remain untouched and unstaged.

---

## Fix round 2 — residual keyboard and route-gate review

### Scope completed

- Custom-select keyboard navigation now disables the active option's color/background/border transition as well as the listbox and arrow. Arrow/Home/End, selection, Escape, and keyboard reopen all refresh keyboard modality.
- FAQ keyboard activation now disables the containing item's border/shadow transition in addition to the chevron and answer. Reduced-motion pointer close applies `hidden` and `inert` immediately instead of depending on a transition event that will not occur.
- Legal-modal Escape and keyboard-activated close-button paths unmount immediately in normal motion. Pointer close-button and backdrop paths retain the 180ms exit and still release page inertness/focus on completion.
- Mobile-menu pointer exit removal is synchronized to the shell opacity `transitionend`; the former independent 120ms timer was removed. Keyboard/Escape removal remains immediate.
- The root style gate now restores pointer interaction for `/privacy`, `/terms`, and 404 pages once the style gate is ready, while the landing route still waits for its hydration-ready marker.
- Contact-card email hover now uses `--motion-hover` and only applies on fine pointers with no reduced-motion preference.
- Cursor RAF failures now clear custom-cursor state, restore the native cursor, and expose `data-landing-cursor-failed='true'` for diagnosis.
- Static contracts now inspect root/global styles, seconds and milliseconds notation in transitions, all four positional layout properties, and the absence of timer-driven mobile-menu exit code.

### RED evidence

Command:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts
```

Result before fix-round-2 implementation: **7 failed, 12 passed (55.3s)**.

The seven failures were:

1. cursor RAF failure had no diagnostic marker;
2. FAQ keyboard toggle left the item border/shadow transition at 150ms;
3. custom-select active option retained a 150ms transition under keyboard modality;
4. normal-motion modal Escape did not unmount within 100ms;
5. non-landing routes retained `pointer-events: none` after the root style gate became ready;
6. contact-card hover still used the hard-coded `0.2s` contract and was not reduced-motion gated;
7. expanded static duration/header checks detected the residual hard-coded transition/timer contract.

### GREEN evidence

Focused command:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts
```

Final focused result after the hook-dependency cleanup rerun: **19 passed (49.2s)**.

The real-browser assertions confirm immediate keyboard option/FAQ/modal state changes, retained pointer modal exit after 100ms, transition-completion menu removal, immediate reduced-motion FAQ cleanup, native cursor restoration with a failure marker, and working pointer interaction on privacy, terms, and 404 routes.

Full regression command:

```sh
pnpm test:e2e
```

Result: **36 passed, 3 skipped (20.9s)** using six workers. FAQ, mobile disclosure, contact delivery/server boundaries, non-landing a11y routes, and all landing evidence flows passed together; there are no remaining full-suite failures.

Static/build commands:

```sh
pnpm lint
pnpm exec tsc -b --pretty false
pnpm build
git diff --check
```

Result: all passed; lint completed with zero warnings/errors. Build output was generated successfully and diff whitespace checks were clean.

```sh
graphify update .
```

Result: attempted after the final source changes. Graphify fail-closed because the extracted graph had 1,849 nodes versus 10,930 in the existing graph; no destructive `--force` overwrite was used, so existing graph artifacts were preserved.

### Motion feel checks

- Keyboard interaction reads as immediate: option focus/selection, FAQ container state, menu close, modal Escape, and modal close-button activation have no spatial or border/shadow lag.
- Pointer disclosures retain their directional context: FAQ 180/120ms presence and modal 180ms exit remain visible long enough to read without exceeding the 300ms UI budget.
- Reduced-motion paths remove dependency on spatial transition completion and restore hidden/inert state within the 100ms regression bound.
- Contact hover uses the shared 150ms token only for fine-pointer/no-preference input; reduced motion retains the non-hover computed color.
- Cursor failure visibly returns to the native pointer and leaves a diagnostic marker without stale ready/enabled attributes.

### Fix-round-2 files

- `.superpowers/sdd/futur-landing-redesign/task-3-report.md`
- `e2e/task-3/landing-motion-accessibility.spec.ts`
- `src/pages/root/ui/root-document.tsx`
- `src/pages/landing/ui/faq-section.tsx`
- `src/pages/landing/ui/header-section.tsx`
- `src/pages/landing/ui/legal-modal.tsx`
- `src/pages/landing/ui/use-custom-cursor.ts`
- `src/pages/landing/ui/styles/contact.module.css`
- `src/pages/landing/ui/styles/faq.module.css`
- `src/pages/landing/ui/styles/form-controls.module.css`

Protected and cross-task dirty files remain untouched and unstaged.

---

## Final narrow motion fix — custom-select trigger

- Added computed-style coverage for the combobox trigger on keyboard Escape, reopen, and close.
- Included `.selectTrigger` in the existing keyboard-modality zero-duration rule so its border/color/background state does not lag behind Arrow/Home/End/open/close actions.

RED:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts --grep "custom select refreshes keyboard modality"
```

Result: **1 failed**; the trigger computed `transition-duration: 0.15s` instead of `0s`.

GREEN:

```sh
pnpm exec playwright test -c playwright.task-3.config.ts --grep "custom select refreshes keyboard modality"
pnpm exec playwright test -c playwright.task-3.config.ts
pnpm lint
```

Result: **1 passed**, then **19 passed (48.0s)**; lint completed with zero warnings/errors.
