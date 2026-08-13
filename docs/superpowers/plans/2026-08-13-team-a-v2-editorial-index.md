# Team A v2 Editorial Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine Team variant A from a presentation-like four-column layout into a compact editorial role index while preserving its content, reading order, and reveal motion.

**Architecture:** Keep `TeamSection` as the shared A/B/C shell and keep `TeamRoleIndex` responsible only for variant A markup. Group each role title and responsibility into one semantic copy block, then use A-only CSS selectors for denser spacing so B and C remain visually unchanged.

**Tech Stack:** React 19, TypeScript, CSS Modules, existing IntersectionObserver reveal utility, Playwright

## Global Constraints

- Do not restore the `OUR TEAM` chip.
- Do not modify Team B or Team C markup, styles, interaction, or content.
- Do not modify the team role data or visible copy.
- Add no dependency, image, icon, SVG, border decoration, or card background.
- Animate only `opacity`, `transform`, and text color; preserve reduced-motion behavior.
- Keep the section free of links, buttons, and arbitrary focus targets in variant A.
- Prevent horizontal overflow at 1280px, 1024px, and 390px.

---

### Task 1: Convert Team A into a compact editorial index

**Files:**

- Modify: `e2e/landing-team-variants.chrome.spec.ts`
- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `src/pages/landing/ui/team-role-index.tsx`
- Modify: `src/pages/landing/ui/styles/team-role-index.module.css`
- Modify: `src/pages/landing/ui/styles/team.module.css`

**Interfaces:**

- Consumes: `teamRoles: TeamRole[]` from `src/pages/landing/config/team.ts`
- Produces: five `[data-team-role-row]` elements, each with one `[data-team-role-copy]` containing its `h3` and responsibility paragraph
- Preserves: `[data-team-role-grid]`, `[data-team-role-scope]`, `data-team-variant='a'`, and existing reveal observation

- [ ] **Step 1: Write the failing structural and visual tests**

Add assertions that each A row contains one grouped copy block, that the heading and paragraph share the same left position, that the row height is below 110px at 1280px, and that hover keeps the background transparent while changing the title color.

```ts
const rows = team.locator('[data-team-role-row]');
await expect(rows.locator('[data-team-role-copy]')).toHaveCount(5);

const firstGeometry = await rows.first().evaluate((row) => {
  const title = row.querySelector('h3')!;
  const description = row.querySelector('p')!;
  return {
    height: row.getBoundingClientRect().height,
    titleX: title.getBoundingClientRect().x,
    descriptionX: description.getBoundingClientRect().x,
  };
});

expect(firstGeometry.height).toBeLessThan(110);
expect(firstGeometry.titleX).toBeCloseTo(firstGeometry.descriptionX, 0);
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
env PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test \
  e2e/landing-team-variants.chrome.spec.ts \
  e2e/landing-cinematic-editorial.chrome.spec.ts \
  --project=chrome --grep 'Team A|Team comparison'
```

Expected: FAIL because `[data-team-role-copy]` does not exist, title and description use different grid columns, the current rows are at least 122px high, and hover adds a background.

- [ ] **Step 3: Group role copy in `TeamRoleIndex`**

Wrap the role title and responsibility in a single block without changing visible strings.

```tsx
<div className={styles.roleCopy} data-team-role-copy>
  <h3>{role.title}</h3>
  <p>{role.responsibility}</p>
</div>
```

- [ ] **Step 4: Replace the four-column presentation grid with a three-part editorial row**

Use `role code / grouped copy / tags`, reduce row padding and height, keep the background transparent in every pointer state, and move only the title on hover.

```css
.roleRow {
  grid-template-columns: 54px minmax(0, 1fr) minmax(210px, 0.42fr);
  min-height: 0;
  padding: 20px 12px;
  border-radius: 0;
  background: transparent;
}

.roleCopy p {
  margin: 8px 0 0;
}

.roleRow:hover h3 {
  color: #315fce;
  transform: translate3d(4px, 0, 0);
}
```

- [ ] **Step 5: Tighten only A's header-to-index rhythm**

Keep the shared spacing for B and C and override only the A section.

```css
.teamSection[data-team-variant='a'] .variantStage {
  margin-top: clamp(42px, 4.5vw, 64px);
}
```

- [ ] **Step 6: Add explicit tablet and mobile collapse rules**

At tablet width, move tags below the grouped copy. At mobile width, keep a narrow code column and place copy and tags in the second column without adding a card background.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run:

```bash
env PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test \
  e2e/landing-team-variants.chrome.spec.ts \
  e2e/landing-cinematic-editorial.chrome.spec.ts \
  --project=chrome --grep 'Team A|Team comparison'
```

Expected: all selected tests pass.

- [ ] **Step 8: Run full validation**

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

Expected: no lint errors, successful production build, all selected Playwright and accessibility tests pass, no whitespace errors, and the graph is updated.

- [ ] **Step 9: Verify in the internal browser**

Reload `http://127.0.0.1:3000/?team=a#team`, confirm the title-to-list gap is compact, rows read as continuous editorial content, hover does not create a rounded background, and browser console errors remain empty. Keep B and C tabs open for comparison.

- [ ] **Step 10: Commit only after the user chooses the final Team direction**

Do not commit the prototype implementation while A/B/C comparison remains active. Preserve the current dirty-worktree boundary until the user selects the final direction.
