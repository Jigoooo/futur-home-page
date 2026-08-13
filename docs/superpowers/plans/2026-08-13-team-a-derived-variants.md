# Team A Derived Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing Team A/B/C comparison with three Team A-derived layouts named A1, A2, and A3, while removing the legacy B/C implementations and preserving the approved team content.

**Architecture:** Keep `teamRoles` as the single content source and keep the development-only query selection in `use-team-preview-variant.ts`. `TeamSection` renders one focused component per variant. A1 and A2 are static semantic article collections; A3 owns only its local active-role state and exposes hover, focus, click, and tap behavior.

**Tech Stack:** React 19, TypeScript, CSS Modules, existing in-view reveal attributes, Playwright.

## Global Constraints

- Keep the section title, section description, five roles, role descriptions, and fifteen role-scope values unchanged.
- Do not restore the `OUR TEAM` chip.
- Use `a1`, `a2`, and `a3`; unknown values and the old `b` and `c` values fall back to `a1`.
- Add no dependency, decorative SVG, gradient glow, card border system, or perpetual animation.
- Animate only transform and opacity; reduced motion renders the final state immediately.
- At 767px and below every variant becomes one column with no horizontal overflow.
- Preserve all unrelated dirty-worktree changes.
- Do not commit the comparison implementation before the user chooses the final Team direction.

---

### Task 1: Lock the A1/A2/A3 comparison contract

**Files:**

- Modify: `e2e/landing-team-variants.chrome.spec.ts`
- Modify: `src/pages/landing/ui/use-team-preview-variant.ts`
- Modify: `src/pages/landing/ui/team-section.tsx`

**Interfaces:**

- Produces: `TeamPreviewVariant = 'a1' | 'a2' | 'a3'`
- Produces: `useTeamPreviewVariant(): TeamPreviewVariant`
- Consumes: `TeamAOffsetEditorial`, `TeamAVerticalChapters`, `TeamAInteractiveField`

- [ ] **Step 1: Replace the old variant tests with a failing routing and rendering contract**

```ts
test('defaults unknown and retired Team variants to A1', async ({ page }) => {
  for (const search of ['', '?team=unknown', '?team=b', '?team=c']) {
    await page.goto(`/${search}#team`);
    await expect(page.locator('#team')).toHaveAttribute('data-team-variant', 'a1');
    await expect(page.locator('[data-team-a1]')).toHaveCount(1);
  }
});

test('renders each Team A-derived comparison variant', async ({ page }) => {
  for (const variant of ['a1', 'a2', 'a3']) {
    await page.goto(`/?team=${variant}#team`);
    const team = page.locator('#team');
    await expect(team).toHaveAttribute('data-team-variant', variant);
    await expect(team.locator(`[data-team-${variant}]`)).toHaveCount(1);
    await expect(team.locator('[data-team-role]')).toHaveCount(5);
    await expect(team.locator('[data-team-role-scope]')).toHaveCount(15);
  }
});
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `env PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-team-variants.chrome.spec.ts --project=chrome`

Expected: FAIL because the current code reports `a`, `b`, or `c` and does not render `data-team-a1`, `data-team-a2`, or `data-team-a3`.

- [ ] **Step 3: Change the development-only query contract**

```ts
export type TeamPreviewVariant = 'a1' | 'a2' | 'a3';

const FALLBACK_VARIANT: TeamPreviewVariant = 'a1';

function readVariant(): TeamPreviewVariant {
  if (!import.meta.env.DEV || typeof window === 'undefined') return FALLBACK_VARIANT;
  const variant = new URLSearchParams(window.location.search).get('team');
  return variant === 'a2' || variant === 'a3' ? variant : FALLBACK_VARIANT;
}
```

- [ ] **Step 4: Switch `TeamSection` to the three new component names**

```tsx
{
  variant === 'a1' && <TeamAOffsetEditorial />;
}
{
  variant === 'a2' && <TeamAVerticalChapters />;
}
{
  variant === 'a3' && <TeamAInteractiveField />;
}
```

- [ ] **Step 5: Re-run the focused test**

Run: `env PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-team-variants.chrome.spec.ts --project=chrome`

Expected: The routing assertions pass after the new components are implemented in Task 2. Until then, TypeScript or selector failures are expected and must not be hidden by weakening the test.

### Task 2: Implement the three distinct A-derived layouts

**Files:**

- Create: `src/pages/landing/ui/team-a-offset-editorial.tsx`
- Create: `src/pages/landing/ui/styles/team-a-offset-editorial.module.css`
- Create: `src/pages/landing/ui/team-a-vertical-chapters.tsx`
- Create: `src/pages/landing/ui/styles/team-a-vertical-chapters.module.css`
- Create: `src/pages/landing/ui/team-a-interactive-field.tsx`
- Create: `src/pages/landing/ui/styles/team-a-interactive-field.module.css`
- Modify: `e2e/landing-team-variants.chrome.spec.ts`

**Interfaces:**

- Consumes: `teamRoles: TeamRole[]`
- Produces: static `TeamAOffsetEditorial` and `TeamAVerticalChapters` components
- Produces: interactive `TeamAInteractiveField` with one active badge and `aria-pressed`

- [ ] **Step 1: Add failing A1 and A2 geometry tests**

```ts
test('keeps A1 asymmetric and A2 chapter offsets without row-table geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('/?team=a1#team');
  const a1X = await page
    .locator('[data-team-role]')
    .evaluateAll((roles) => roles.map((role) => Math.round(role.getBoundingClientRect().x)));
  expect(new Set(a1X).size).toBeGreaterThan(1);

  await page.goto('/?team=a2#team');
  const a2X = await page
    .locator('[data-team-role-copy]')
    .evaluateAll((roles) => roles.map((role) => Math.round(role.getBoundingClientRect().x)));
  expect(new Set(a2X).size).toBeGreaterThan(2);
});
```

- [ ] **Step 2: Add a failing A3 interaction test**

```ts
test('expands A3 roles through hover, focus, and click', async ({ page }) => {
  await page.goto('/?team=a3#team');
  const roles = page.locator('[data-team-role-trigger]');
  await expect(roles).toHaveCount(5);
  await expect(roles.first()).toHaveAttribute('aria-pressed', 'true');

  await roles.nth(1).hover();
  await expect(roles.nth(1)).toHaveAttribute('aria-pressed', 'true');

  await roles.nth(2).focus();
  await expect(roles.nth(2)).toHaveAttribute('aria-pressed', 'true');

  await roles.nth(3).click();
  await expect(roles.nth(3)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-team-role-expanded="BE"]')).toBeVisible();
});
```

- [ ] **Step 3: Run the focused tests and confirm the geometry and interaction failures**

Run: `env PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-team-variants.chrome.spec.ts --project=chrome`

Expected: FAIL because the new layouts and A3 triggers do not exist.

- [ ] **Step 4: Implement A1 as an open two-column offset composition**

Render each role as an `<article data-team-role>` containing code, a grouped title and description, and a plain `<ul>` of role-scope values. Use CSS Grid with two columns on desktop, intentional vertical offsets through role-specific selectors, no background, border, shadow, or fixed equal height. Collapse to one column below 768px.

- [ ] **Step 5: Implement A2 as five unequal vertical chapters**

Render the same semantic article structure inside `data-team-a2`. Give each chapter a content width and inline start chosen from a five-item CSS pattern. Use no per-role card surface and no repeated row divider. Collapse all inline offsets below 768px.

- [ ] **Step 6: Implement A3 as an in-place interactive field**

Use `useState(teamRoles[0]!.badge)` and a semantic `<button>` for every role. On `onMouseEnter`, `onFocus`, and `onClick`, set the active badge. Keep each role's detail in its own field item and expose the active detail with `data-team-role-expanded={role.badge}`. Use `aria-pressed={isActive}` and a visible `:focus-visible` outline. On desktop use an asymmetric grid; on mobile use a one-column expansion list.

- [ ] **Step 7: Implement motivated entry and state motion**

Use the existing `data-landing-visible` state to stagger each role with opacity and transforms no larger than 14px. A3 state changes may alter opacity and transform only. Under `prefers-reduced-motion: reduce`, set opacity to 1, transform to none, and transition duration to 0s.

- [ ] **Step 8: Run the focused tests until green**

Run: `env PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/landing-team-variants.chrome.spec.ts --project=chrome`

Expected: PASS for A1/A2 geometry, A3 interactions, shared content, mobile overflow, and reduced motion.

### Task 3: Remove legacy variants and verify the comparison

**Files:**

- Delete: `src/pages/landing/ui/team-role-index.tsx`
- Delete: `src/pages/landing/ui/styles/team-role-index.module.css`
- Delete: `src/pages/landing/ui/team-role-wall.tsx`
- Delete: `src/pages/landing/ui/styles/team-role-wall.module.css`
- Delete: `src/pages/landing/ui/team-role-explorer.tsx`
- Delete: `src/pages/landing/ui/styles/team-role-explorer.module.css`
- Modify: `src/pages/landing/ui/styles/team.module.css`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `e2e/a11y/landing.static.a11y.spec.ts`

**Interfaces:**

- Consumes: the A1/A2/A3 selectors established in Tasks 1 and 2
- Produces: no runtime import or test dependency on the legacy A/B/C components

- [ ] **Step 1: Update shared Team spacing and cross-suite expectations**

Replace old `data-team-variant='a'` selectors with the new shared A-derived stage spacing. Update the cinematic Team test to target A1 and assert that the A1 open composition has no card background. Update accessibility routes to include A1, A2, and A3 where the suite currently exercises Team comparisons.

- [ ] **Step 2: Delete the six legacy component and style files**

Delete only the listed files after the new imports compile. Confirm `rg -n "TeamRole(Index|Wall|Explorer)|team-role-(index|wall|explorer)" src e2e` returns no matches.

- [ ] **Step 3: Run targeted automated verification**

Run:

```bash
pnpm lint
pnpm build
env PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test \
  e2e/landing-team-variants.chrome.spec.ts \
  e2e/landing-cinematic-editorial.chrome.spec.ts \
  e2e/a11y/landing.static.a11y.spec.ts \
  --project=chrome --project=a11y
git diff --check
graphify update .
```

Expected: lint has zero errors, build succeeds, all selected Playwright tests pass, no whitespace errors are reported, and Graphify updates successfully.

- [ ] **Step 4: Inspect A1, A2, and A3 in the internal browser**

Open these three URLs in separate internal-browser tabs:

- `http://127.0.0.1:3000/?team=a1#team`
- `http://127.0.0.1:3000/?team=a2#team`
- `http://127.0.0.1:3000/?team=a3#team`

Confirm each variant is visually distinct, has no horizontal overflow at desktop, logs no browser errors, and A3 responds to pointer and keyboard focus. Keep all three tabs open as deliverables for the user's visual choice.

- [ ] **Step 5: Stop without committing the comparison implementation**

Report the verified comparison and wait for the user to choose the final Team direction. Do not stage or commit the implementation files yet.
