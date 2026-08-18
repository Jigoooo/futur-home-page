# FUTUR SEO·GEO·공유 자산 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 랜딩의 법적 문서 전환, 검색 메타데이터, 구조화 데이터, 크롤러 문서와 공유 이미지를 사실 기반으로 정리한다.

**Architecture:** 라우트 전환과 hash 스크롤을 분리하고, 회사 SEO 상수와 JSON-LD 생성을 entity config로 모은다. 이미지 자산은 기존 로고와 `futur_main.png`를 ImageMagick으로 결정적으로 파생하며, 공개 라우트와 배포 스크립트는 기존 TanStack Start·Nitro 경계를 유지한다.

**Tech Stack:** React 19, TanStack Router/Start, Nitro 3, TypeScript 6, Playwright, ImageMagick, Bash, PM2 deployment scripts

## Global Constraints

- 단일 랜딩과 `/privacy`, `/terms` 구조를 유지한다.
- Hero 문구와 화면 디자인은 변경하지 않는다.
- 고객, 프로젝트, 후기, 성과, 인원과 SLA 수치를 추가하지 않는다.
- 모든 크롤러를 허용한다.
- 파비콘·Organization logo는 B2-B charcoal roundel, 18% padding, 외곽 경계 중앙 정렬을 사용한다.
- 공유 카드는 기존 검은 `futur_main.png` 구성, 원형 배경 없음, `BUILT FOR WHAT’S NEXT.`, 1200×630 PNG로 고정한다.
- ImageGen과 신규 런타임 의존성을 사용하지 않는다.
- 기존 `/logo*`, `/futur_main.png` 호환 자산은 삭제하거나 덮어쓰지 않는다.
- 작업은 `master`에서 수행하고 기능용 원격 `codex/*` 브랜치를 만들지 않는다.

---

### Task 1: 법적 문서 스크롤 회귀를 테스트로 고정

**Files:**

- Modify: `e2e/landing-tactile-continuity.chrome.spec.ts`
- Modify: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Consumes: Footer의 native `/privacy`, `/terms` Link와 `scrollToHashTarget()`
- Produces: pathname 전환은 즉시 top, hash 이동은 명시적 smooth라는 회귀 계약

- [ ] **Step 1: 실패하는 pathname 전환 테스트 작성**

`landing-tactile-continuity.chrome.spec.ts`에 Footer 위치에서 Link를 클릭하고 700ms 동안 첫 프레임부터 scrollY를 수집하는 테스트를 추가한다.

```ts
test('opens legal routes at the top without reverse smooth scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#footer');

  const trace = await page.evaluate(async () => {
    const link = document.querySelector<HTMLAnchorElement>('a[href="/privacy"]')!;
    link.scrollIntoView({ block: 'center', behavior: 'instant' });
    link.click();
    const frames: Array<{ path: string; y: number }> = [];
    const startedAt = performance.now();
    while (performance.now() - startedAt < 700) {
      frames.push({ path: location.pathname, y: Math.round(scrollY) });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    return frames;
  });

  const privacyFrames = trace.filter((frame) => frame.path === '/privacy');
  expect(privacyFrames.length).toBeGreaterThan(0);
  expect(privacyFrames.every((frame) => frame.y === 0)).toBe(true);
});
```

- [ ] **Step 2: 기존 구현에서 RED 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-tactile-continuity.chrome.spec.ts \
  --project=chrome --workers=1 --retries=0 \
  --grep 'opens legal routes at the top'
```

Expected: FAIL. `/privacy` 프레임 중 `scrollY > 0`이 존재한다.

- [ ] **Step 3: hash 이동 회귀 추가**

`landing-adaptive-island.chrome.spec.ts`에서 `scrollTo`를 기록해 Header의 `#technology` 이동이 reduced motion이 아닐 때 `behavior: 'smooth'`, reduced motion일 때 `behavior: 'auto'`인지 검증한다.

- [ ] **Step 4: 새 테스트만 다시 실행해 RED 근거 저장**

Run: 위 두 파일을 `--workers=1 --retries=0`으로 실행한다.

- [ ] **Step 5: 테스트 커밋**

```bash
git add e2e/landing-tactile-continuity.chrome.spec.ts e2e/landing-adaptive-island.chrome.spec.ts
git commit -m "test(scroll): 법적 문서 전환 위치 계약 추가"
```

---

### Task 2: pathname 전환과 hash smooth를 분리

**Files:**

- Modify: `src/styles/globals.css`
- Modify: `src/router.tsx`
- Test: `e2e/landing-tactile-continuity.chrome.spec.ts`
- Test: `e2e/landing-adaptive-island.chrome.spec.ts`

**Interfaces:**

- Consumes: `scrollToPageTop()`, `scrollToHashTarget()`
- Produces: 전역 `scroll-behavior:auto`; 사용자 hash 이동만 명시적 smooth

- [ ] **Step 1: 전역 smooth 제거**

`globals.css`의 `html`에서 다음 선언을 삭제한다.

```css
scroll-behavior: smooth;
```

- [ ] **Step 2: 더 이상 필요 없는 popstate 보정 제거**

`router.tsx`의 `window.addEventListener('popstate', ...)` 블록을 삭제한다. `scrollRestoration: true`는 유지한다.

- [ ] **Step 3: 스크롤 전용 회귀 GREEN 확인**

Run:

```bash
pnpm exec playwright test \
  e2e/landing-tactile-continuity.chrome.spec.ts \
  e2e/landing-adaptive-island.chrome.spec.ts \
  --project=chrome --workers=1 --retries=0
```

Expected: pathname 전환·hash 이동·뒤로 가기 계약 PASS.

- [ ] **Step 4: lint와 typecheck**

```bash
pnpm lint
pnpm exec tsc -b --noEmit
```

- [ ] **Step 5: 구현 커밋**

```bash
git add src/styles/globals.css src/router.tsx
git commit -m "fix(router): 법적 문서 전환 스크롤 즉시화"
```

---

### Task 3: 검색·공유 자산 생성 계약

**Files:**

- Create: `scripts/generate-seo-assets.sh`
- Create: `public/favicon.ico`
- Create: `public/favicon-32.png`
- Create: `public/favicon-48.png`
- Create: `public/favicon-96.png`
- Create: `public/apple-touch-icon.png`
- Create: `public/organization-logo-512.png`
- Create: `public/media/share/futur-main-og-v2.png`
- Modify: `e2e/seo-cutover-contract.chrome.spec.ts`

**Interfaces:**

- Consumes: `public/logo_512x512.png`, `public/futur_main.png`, ImageMagick `magick`
- Produces: `generate-seo-assets.sh`; B2-B favicon family; 1200×630 OG PNG

- [ ] **Step 1: 실패하는 자산 계약 테스트 작성**

`seo-cutover-contract.chrome.spec.ts`에 각 새 파일 존재 여부와 브라우저 natural size를 검증한다.

```ts
test('serves the approved search identity and share card dimensions', async ({ page }) => {
  for (const [path, width, height] of [
    ['/favicon-48.png', 48, 48],
    ['/organization-logo-512.png', 512, 512],
    ['/media/share/futur-main-og-v2.png', 1200, 630],
  ] as const) {
    await page.goto(path);
    const size = await page.locator('img').evaluate((image: HTMLImageElement) => ({
      width: image.naturalWidth,
      height: image.naturalHeight,
    }));
    expect(size).toEqual({ width, height });
  }
});
```

- [ ] **Step 2: RED 확인**

Run:

```bash
pnpm exec playwright test e2e/seo-cutover-contract.chrome.spec.ts \
  --project=chrome --workers=1 --retries=0
```

Expected: 새 파일 404로 FAIL.

- [ ] **Step 3: 결정적 생성 스크립트 작성**

`generate-seo-assets.sh`는 `set -Eeuo pipefail`, `command -v magick`, `mktemp -d`, trap cleanup을 사용한다. 핵심 합성은 다음 값으로 고정한다.

```bash
magick -size 512x512 canvas:none \
  public/logo_512x512.png -geometry +0+50 -composite "$tmp_dir/mark-centered.png"

magick -size 512x512 canvas:none \
  -fill '#202523' -draw 'circle 256,256 256,0' \
  \( "$tmp_dir/mark-centered.png" -resize 328x328 \) \
  -gravity center -composite public/organization-logo-512.png
```

조직 로고를 96, 48, 32, 16px로 축소하고 16/32/48을 묶어 `favicon.ico`를 만든다. Apple touch icon은 180px로 만든다.

OG 생성은 다음 crop과 문구를 사용한다.

```bash
magick public/futur_main.png \
  -crop 3024x1588+0+900 +repage -resize 1200x630 \
  -fill black -draw 'rectangle 0,442 1200,510' \
  -font "$font_path" -pointsize 26 -kerning 1.5 -fill white \
  -gravity center -annotate +0+155 'BUILT FOR WHAT’S NEXT.' \
  public/media/share/futur-main-og-v2.png
```

`font_path`는 macOS Arial Bold를 우선하고 없으면 ImageMagick의 `DejaVu-Sans-Bold`를 사용한다.

- [ ] **Step 4: 스크립트를 실행하고 시각 검증**

```bash
bash scripts/generate-seo-assets.sh
```

`view_image`로 48px roundel, 512px Organization logo, OG PNG를 확인한다. OG에는 원형 배경이 없어야 한다.

- [ ] **Step 5: 자산 테스트 GREEN 확인**

Run: Task 3 Step 2 명령.

- [ ] **Step 6: 자산 커밋**

```bash
git add scripts/generate-seo-assets.sh public/favicon.ico public/favicon-32.png \
  public/favicon-48.png public/favicon-96.png public/apple-touch-icon.png \
  public/organization-logo-512.png public/media/share/futur-main-og-v2.png \
  e2e/seo-cutover-contract.chrome.spec.ts
git commit -m "feat(brand): 검색 로고와 공유 카드 자산 추가"
```

---

### Task 4: 메타데이터와 구조화 데이터 정규화

**Files:**

- Create: `src/entities/company/config/company-seo.ts`
- Modify: `src/entities/company/config/company-infos.ts`
- Modify: `src/entities/company/index.ts`
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/privacy.tsx`
- Modify: `src/routes/terms.tsx`
- Modify: `src/routes/$.tsx`
- Modify: `src/routes/futur-release.ts`
- Modify: `e2e/seo-cutover-contract.chrome.spec.ts`

**Interfaces:**

- Produces: `HOME_SEO`, `createCompanyStructuredData(): Record<string, unknown>`
- Consumes: `COMPANY_INFOS`, approved image URLs and copy

- [ ] **Step 1: 실패하는 SSR head·JSON-LD 테스트 작성**

홈에서 다음 exact 값을 검사한다.

```ts
const title = 'FUTUR | 웹·앱·업무 시스템·AI 통합 개발';
const description =
  '퓨터(Futur)는 웹·앱, SaaS·솔루션, 업무 시스템·SI, AI 통합·AX 구축과 운영·유지보수를 함께하는 개발 파트너입니다.';

await expect(page).toHaveTitle(title);
await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://futur.co.kr/');
```

JSON-LD를 parse해 `@graph`의 WebSite와 Organization, `legalName: '퓨터'`, logo ImageObject를 검사하고 unsupported 수치·후기·전화번호·sameAs가 없음을 검사한다.

- [ ] **Step 2: RED 확인**

Run: `seo-cutover-contract.chrome.spec.ts` 단독.

- [ ] **Step 3: SEO config 구현**

```ts
export const HOME_SEO = {
  canonicalUrl: 'https://futur.co.kr/',
  title: 'FUTUR | 웹·앱·업무 시스템·AI 통합 개발',
  description:
    '퓨터(Futur)는 웹·앱, SaaS·솔루션, 업무 시스템·SI, AI 통합·AX 구축과 운영·유지보수를 함께하는 개발 파트너입니다.',
  imageUrl: 'https://futur.co.kr/media/share/futur-main-og-v2.png',
  imageAlt: '검은 배경 위 FUTUR 심볼과 BUILT FOR WHAT’S NEXT. 문구',
} as const;
```

`createCompanyStructuredData()`는 `@context`와 WebSite·Organization `@graph`를 반환한다.

- [ ] **Step 4: Root head 교체**

`__root.tsx`에서 legacy description, keywords, geo.position, ICBM을 제거한다. 새 favicon links, HOME_SEO, JSON-LD를 사용한다.

- [ ] **Step 5: 법적·404·health route 메타 보강**

- Privacy canonical/og:url: `https://futur.co.kr/privacy`
- Terms canonical/og:url: `https://futur.co.kr/terms`
- `$` route head: `페이지를 찾을 수 없습니다 · FUTUR`, `robots=noindex,nofollow`
- `/futur-release`: `X-Robots-Tag: noindex, nofollow, nosnippet`

- [ ] **Step 6: focused GREEN 확인**

Run: SEO spec, legal privacy spec, privacy/terms a11y.

- [ ] **Step 7: 커밋**

```bash
git add src/entities/company src/routes e2e/seo-cutover-contract.chrome.spec.ts
git commit -m "feat(seo): 검색 메타와 조직 구조화 데이터 정규화"
```

---

### Task 5: robots·sitemap·llms 및 실패 incoming 정리

**Files:**

- Create: `src/routes/llms[.]txt.ts`
- Modify: `src/routeTree.gen.ts` (generated)
- Modify: `public/robots.txt`
- Modify: `src/routes/sitemap[.]xml.ts`
- Modify: `deploy/scripts/deploy-release.sh`
- Modify: `e2e/seo-cutover-contract.chrome.spec.ts`
- Modify: `e2e/deployment-release-script.chrome.spec.ts`

**Interfaces:**

- Produces: GET `/llms.txt`; failed deployment incoming cleanup
- Consumes: `COMPANY_INFOS`, `HOME_SEO`, release script `incoming_dir`

- [ ] **Step 1: 실패하는 공개 텍스트 계약 추가**

```ts
test('publishes truthful crawler documents', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('User-agent: OAI-SearchBot');
  expect(robots).toContain('User-agent: GPTBot');
  expect(robots).toContain('Allow: /');

  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).toContain('AI 통합·AX');
  expect(llms).not.toMatch(/완료 프로젝트|고객 만족|평균 경력|업무시간/);
});
```

- [ ] **Step 2: 실패 배포 incoming cleanup RED 추가**

기존 deployment harness에서 PM2 시작 또는 health check 실패 후 `incoming` 경로가 남지 않는지 검사한다.

```ts
expect(existsSync(join(harness.deployPath, '.incoming', firstSha))).toBe(false);
```

- [ ] **Step 3: `/llms.txt` 구현**

본문은 회사명, 공개 주소·이메일, 네 서비스 범위와 `/`, `/privacy`, `/terms` 링크만 포함한다. 응답은 `text/plain; charset=utf-8`, `Cache-Control: public, max-age=86400`을 사용한다.

- [ ] **Step 4: robots와 sitemap 갱신**

robots는 OAI-SearchBot, GPTBot, `*`을 모두 `Allow: /`로 선언하고 Sitemap을 유지한다. Sitemap은 홈 한 개와 실제 콘텐츠 변경일 `2026-08-18`을 사용한다.

- [ ] **Step 5: rollback cleanup 구현**

`rollback_release()` 성공 경로 마지막에 다음 함수를 호출한다.

```bash
cleanup_incoming() {
  if [[ "$incoming_dir" == "${deploy_path}/.incoming/${release_sha}" && -d "$incoming_dir" ]]; then
    rm -rf -- "$incoming_dir"
  fi
}
```

rollback이 실패한 경우에는 진단 자료 보존을 위해 cleanup을 호출하지 않는다. finalize는 기존 cleanup을 함수로 교체한다.

- [ ] **Step 6: route tree 생성과 focused GREEN**

```bash
pnpm build
pnpm exec playwright test \
  e2e/seo-cutover-contract.chrome.spec.ts \
  e2e/deployment-release-script.chrome.spec.ts \
  --project=chrome --workers=1 --retries=0
```

- [ ] **Step 7: 커밋**

```bash
git add src/routes/llms[.]txt.ts src/routeTree.gen.ts public/robots.txt \
  src/routes/sitemap[.]xml.ts deploy/scripts/deploy-release.sh \
  e2e/seo-cutover-contract.chrome.spec.ts e2e/deployment-release-script.chrome.spec.ts
git commit -m "feat(seo): 크롤러 문서와 배포 실패 정리 보강"
```

---

### Task 6: 통합 검증·문서·master 배포

**Files:**

- Modify: `DESIGN.md`
- Modify: `docs/futur_react_docs_package/DESIGN.md`

**Interfaces:**

- Consumes: Tasks 1-5 전체 결과
- Produces: 배포 가능한 master SHA와 운영 검증 근거

- [ ] **Step 1: 디자인 문서 반영**

경로 전환은 instant, hash 이동은 smooth, B2-B 검색 로고, 원본 FUTUR OG, WebSite/Organization, 모든 크롤러 허용과 `llms.txt` 계약을 기록한다.

- [ ] **Step 2: focused suite 실행**

```bash
pnpm exec playwright test \
  e2e/seo-cutover-contract.chrome.spec.ts \
  e2e/landing-tactile-continuity.chrome.spec.ts \
  e2e/landing-adaptive-island.chrome.spec.ts \
  e2e/deployment-release-script.chrome.spec.ts \
  e2e/a11y/privacy.a11y.spec.ts \
  e2e/a11y/terms.a11y.spec.ts \
  --workers=1 --retries=0
```

- [ ] **Step 3: 정적 검증**

```bash
pnpm lint
pnpm exec tsc -b --noEmit
pnpm build
git diff --check
graphify update .
```

- [ ] **Step 4: Codex 내부 브라우저 검증**

390px와 데스크톱에서 Footer→Privacy/Terms가 첫 프레임부터 top인지 확인하고, 홈 head·favicon·OG 원본과 가로 overflow를 확인한다.

- [ ] **Step 5: 문서 커밋과 origin master push**

```bash
git add DESIGN.md docs/futur_react_docs_package/DESIGN.md graphify-out
git commit -m "docs(seo): 검색과 공유 자산 운영 계약 반영"
git push origin master
```

- [ ] **Step 6: CI·배포·공개 SHA 검증**

GitHub Actions `CI & Deploy`가 성공할 때까지 모니터링한다. `https://futur.co.kr/futur-release`가 새 master SHA와 정확히 일치해야 다음 TLS 계획으로 이동한다.
