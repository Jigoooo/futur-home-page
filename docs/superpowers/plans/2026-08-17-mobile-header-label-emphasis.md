# Mobile Header Label Emphasis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `560px` 이하 Header의 현재 섹션명만 `15px / 750 / -0.015em`으로 강조한다.

**Architecture:** 기존 `data-header-mobile-roll="enhanced"`, `data-header-section-link`와 `aria-current="location"`을 그대로 사용한다. CSS가 현재 섹션 anchor의 typography만 덮어쓰고, GSAP 훅·DOM·React state·문의 CTA는 변경하지 않는다.

**Tech Stack:** React 19, TypeScript, CSS Modules, GSAP 3.15, Playwright, axe-core

## Global Constraints

- 변경은 `560px` 이하의 현재 섹션명에만 적용한다.
- 현재 섹션명은 `font-size: 15px`, `font-weight: 750`, `letter-spacing: -0.015em`을 사용한다.
- 로고 `20px`와 문의 버튼 `13px`의 크기·굵기는 유지한다.
- `561px` 이상 전체 메뉴의 `14px / 700` typography를 변경하지 않는다.
- 세로 롤링 거리·시간·easing, Header geometry, glass tone과 navigation 동작은 변경하지 않는다.
- no-JS에서는 기존 전체 메뉴의 `13px / 700` typography를 유지한다.
- 새 React state, DOM element, 외부 dependency를 추가하지 않는다.

---

## File Structure

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
  - 현재 섹션·문의·태블릿·no-JS의 계산된 typography와 geometry를 검증한다.
- Modify: `src/pages/landing/ui/styles/header.module.css`
  - `560px` 이하 enhanced current anchor typography의 단일 소유자다.
- Modify: `docs/futur_react_docs_package/DESIGN.md`
  - 제품 Header 계약에 중앙 라벨 강조 수치를 반영한다.
- Update: `graphify-out/*` via `graphify update .`
  - CSS·테스트·문서 관계를 project graph에 반영한다.

---

### Task 1: 모바일 현재 섹션명 typography 강조

**Files:**

- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`
- Modify: `src/pages/landing/ui/styles/header.module.css`
- Modify: `docs/futur_react_docs_package/DESIGN.md`

**Interfaces:**

- Consumes: `data-header-mobile-roll="enhanced"`, `data-header-section-link`, `aria-current="location"`
- Produces: `560px` 이하 current section anchor의 `15px / 750 / -0.015em` computed typography

- [ ] **Step 1: 계산된 typography 회귀 테스트를 먼저 작성한다**

`landing-adaptive-island.chrome.spec.ts`에 다음 실제 브라우저 계약을 추가한다.

```ts
test('emphasizes only the current narrow-mobile section label', async ({ browser, page }) => {
  for (const viewport of [
    { width: 560, height: 844 },
    { width: 390, height: 844 },
    { width: 320, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#technology');
    await waitForHeader(page, 'mobile-persistent');
    await scrollSectionIntoView(page, '#technology');
    await waitForMobileRoll(page);

    const current = navigation(page).getByRole('link', { name: '기술', exact: true });
    const inquiry = navigation(page).getByRole('link', { name: '문의', exact: true });

    await expect(current).toHaveCSS('font-size', '15px');
    await expect(current).toHaveCSS('font-weight', '750');
    await expect(current).toHaveCSS('letter-spacing', '-0.225px');
    await expect(inquiry).toHaveCSS('font-size', '13px');
    await expect(inquiry).toHaveCSS('font-weight', '700');

    const frame = await readActiveMobileFrame(page);
    expect(frame.activeCenter).toBeCloseTo(frame.headerCenter, 0);
    await expectNoHorizontalOverflow(page);
  }

  await page.setViewportSize({ width: 561, height: 844 });
  await page.goto('/#technology');
  await waitForHeader(page, 'mobile-persistent');
  await expect(navigation(page).getByRole('link', { name: '기술', exact: true })).toHaveCSS(
    'font-size',
    '14px',
  );

  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto('/#technology');
  await expect(
    noJsPage.getByRole('navigation', { name: '주요 메뉴' }).getByRole('link', {
      name: '기술',
      exact: true,
    }),
  ).toHaveCSS('font-size', '13px');
  await noJs.close();
});
```

현재 spec의 `readActiveMobileFrame()`가 없다면 기존 중앙 좌표 계산을 다음 helper로 한 번만 추출한다.

```ts
async function readActiveMobileFrame(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-landing-nav]')!;
    const active = root.querySelector<HTMLElement>(
      '[data-header-section-link][aria-current="location"]',
    )!;
    const rootRect = root.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    return {
      activeCenter: activeRect.left + activeRect.width / 2,
      headerCenter: rootRect.left + rootRect.width / 2,
    };
  });
}
```

- [ ] **Step 2: 기존 CSS에서 테스트가 예상 이유로 실패하는지 확인한다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --grep "emphasizes only the current" --workers=1 --retries=0
```

Expected: FAIL. current section의 실제 값이 `13px / 700 / normal`이다.

- [ ] **Step 3: enhanced current anchor typography를 최소 구현한다**

`header.module.css`의 `@media (max-width: 560px)` 안에서 기존 current anchor selector에 세 선언만 추가한다.

```css
.nav[data-header-mobile-roll='enhanced'] [data-header-section-link][aria-current='location'] {
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.015em;
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}
```

`.navMenu`, `.logo`, `.contactLink`, GSAP span과 `561px` 이상 규칙은 수정하지 않는다.

- [ ] **Step 4: 제품 디자인 문서를 구현과 일치시킨다**

`DESIGN.md`의 `9.1 Header`에 다음 문장을 추가한다.

```markdown
- `560px` 이하 현재 섹션명은 `15px / 750 / -0.015em`으로 강조하고 로고와 문의 버튼의 typography는 유지한다.
```

- [ ] **Step 5: focused RED를 GREEN으로 전환하고 Header 회귀를 실행한다**

Run:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --workers=1 --retries=0
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/landing-runtime-errors.chrome.spec.ts \
  --project=chrome --workers=1 --retries=0
PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 \
  pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts \
  e2e/a11y/landing.interactive.a11y.spec.ts --project=a11y --workers=1 --retries=0
pnpm lint
pnpm exec tsc -b --noEmit
pnpm build
```

Expected: Header test가 새 항목을 포함해 전부 PASS, runtime `3 passed`, landing a11y `7 passed`, lint/typecheck/build exit `0`.

- [ ] **Step 6: Codex 내부 브라우저에서 실제 균형을 확인한다**

`http://127.0.0.1:3001/#technology`을 내부 브라우저에 열고 다음을 확인한다.

- `390px`: 중앙 기술 `15px / 750`, 문의 `13px / 700`, center delta `0px`
- `320px`: 로고·기술·문의 겹침과 horizontal overflow `0`
- 기술→FAQ 롤링의 y·opacity 방향과 완료 후 transient role `0`
- console warning/error `0`

- [ ] **Step 7: graphify와 diff를 갱신한다**

Run:

```bash
graphify update .
git diff --check
git status --short
```

Expected: graph update 성공, 변경 목록은 CSS·Header E2E·`DESIGN.md`로 제한된다.

- [ ] **Step 8: 변경을 커밋한다**

```bash
git add e2e/landing-adaptive-island.chrome.spec.ts \
  src/pages/landing/ui/styles/header.module.css \
  docs/futur_react_docs_package/DESIGN.md
git commit -m "style(header): 모바일 현재 섹션명 강조"
```

---

## Completion Criteria

- `560px`, `390px`, `320px` current section만 `15px / 750 / -0.015em`이다.
- 로고·문의와 `561px` 이상·no-JS typography는 기존 값을 유지한다.
- 중앙 정렬, 롤링 모션, Header geometry와 접근성 fallback은 변하지 않는다.
- Header/runtime/a11y, lint, typecheck, build, 내부 브라우저와 graphify 검증을 통과한다.
