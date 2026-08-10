# FUTUR Landing Classic Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 전체 화면 Hero와 semantic 커스텀 커서는 유지하면서, Hero 이후를 팀 소개가 존재했던 `12fa1c8`의 클래식 랜딩 레이아웃으로 선택 복원한다.

**Architecture:** 과거 커밋을 전체 revert하지 않고 컴포넌트·설정·CSS를 섹션 단위로 선택 복원한다. 현재 Hero particle 런타임과 cursor tone 경계는 그대로 둔다. Hero·커서를 제외한 클래식 화면은 `12fa1c8`의 실제 소스에서 시작하며, 문의 화면도 과거 TSX·필드 구성·CSS를 직접 복원한 뒤 현재의 강화된 서버 계약과 보안 경계만 다시 연결한다. 검증되지 않은 증거 섹션은 테스트에서 부재 계약으로 고정한다.

**Tech Stack:** React 19, TypeScript 6, CSS Modules, GSAP 3, TanStack Start, Playwright 1.60, axe-core

## Global Constraints

- 복원 기준점은 Git commit `12fa1c8`이다.
- `git checkout 12fa1c8 -- .`, 전체 revert, 강제 reset을 사용하지 않는다.
- Hero·커서·문의 서버 보안 예외를 제외한 랜딩 TSX·CSS는 `git show 12fa1c8:<path>`의 파일 본문 자체를 출발점으로 복원한다. 문의 UI는 예외가 아니며 반드시 과거 소스에서 시작한다.
- 현재 컴포넌트에 과거 token·간격을 재해석해 입히지 않는다. 과거 소스에서 시작해 사실 경계·현재 호환성·접근성 marker만 최소 수정한다.
- 현재 `HeroSection`, Hero particle engine/shader/GL, `CustomCursor`, `useCustomCursor` 동작을 보존한다.
- 문의의 과거 단계·서비스·일정·예산·담당자·내용·동의 필드 구성과 좌우 레이아웃을 복원한다.
- 현재 서버 입력 계약에 필요한 필드명, 검증, 전송 상태, fallback mail, 서버 allowlist/rate-limit/idempotency/honeypot/form-age/test-address guard를 과거 UI에 연결한다.
- 과거 문의의 `평균 회신 24시간`, `빠른 범위 검토` 같은 미검증 SLA 문구는 복원하지 않는다.
- 현재 pill 버튼의 spotlight, sheen, focus-visible, press 동작을 보존한다.
- 숫자 지표, 고객 후기, 익명 완료 사례, `24/7`, `4시간 응답`, 경력 연수, 자동 NDA를 복원하지 않는다.
- 신규 런타임 의존성을 추가하지 않는다.
- 포트 `3000`, 데스크톱 `1280×720`, 모바일 `390×844`를 시각 기준으로 사용한다.
- 각 작업은 RED → GREEN → review → commit 순서로 끝낸다.

---

## File Structure

### 현재 구현을 권위로 유지

- `src/pages/landing/ui/hero-section.tsx`
- `src/pages/landing/ui/styles/hero.module.css`
- `src/pages/landing/ui/hero-particle-*.ts*`
- `src/pages/landing/ui/custom-cursor.tsx`
- `src/pages/landing/ui/use-custom-cursor.ts`
- `src/pages/landing/ui/styles/custom-cursor.module.css`
- `src/pages/landing/server/**`

### 클래식 구조로 복원·수정

- `src/pages/landing/config/{navigation,services,stack,team,process,operations-policy}.ts`
- `src/pages/landing/model/types.ts`
- `src/pages/landing/ui/{services,stack,team,process,operations-policy}-section.tsx`
- `src/pages/landing/ui/{header,faq,contact,footer}-section.tsx`
- `src/pages/landing/ui/{contact-brief-fields,contact-identity-fields,custom-select}.tsx`
- `src/pages/landing/config/contact.ts`
- `src/pages/landing/ui/styles/{shared,header,services,stack,team,process,operations-policy,faq,contact,footer}.module.css`
- `src/pages/landing/ui/styles/form-controls.module.css`
- `src/pages/landing/ui/{landing-page,landing-enhancements}.tsx`
- `src/pages/landing/ui/{use-in-view-reveal,use-landing-gsap-interactions}.ts`

### 시네마틱 본문 전용 파일 삭제

- `src/pages/landing/config/review-method.ts`
- `src/pages/landing/ui/quality-standard-section.tsx`
- `src/pages/landing/ui/review-method-section.tsx`
- `src/pages/landing/ui/use-landing-scene-motion.ts`
- `src/pages/landing/ui/styles/quality-standard.module.css`
- `src/pages/landing/ui/styles/review-method.module.css`

---

### Task 1: 사실 기반 클래식 페이지 구조 복원

**Files:**

- Create: `e2e/landing-classic-restoration.chrome.spec.ts`
- Create: `src/pages/landing/config/stack.ts`
- Create: `src/pages/landing/config/team.ts`
- Create: `src/pages/landing/config/operations-policy.ts`
- Create: `src/pages/landing/ui/stack-section.tsx`
- Create: `src/pages/landing/ui/team-section.tsx`
- Create: `src/pages/landing/ui/operations-policy-section.tsx`
- Create: `src/pages/landing/ui/styles/{stack,team,operations-policy}.module.css`
- Modify: `src/pages/landing/config/{navigation,services,process,index}.ts`
- Modify: `src/pages/landing/model/types.ts`
- Modify: `src/pages/landing/ui/{services,process,landing-page,landing-enhancements}.tsx`
- Modify: `src/pages/landing/ui/styles/{services,process}.module.css`
- Modify: `src/pages/landing/ui/icons.tsx`
- Delete: 시네마틱 본문 전용 파일 6개

**Interfaces:**

- Produces: `stackGroups: StackGroup[]`, `teamRoles: TeamRole[]`, `operationsPolicies: OperationsPolicy[]`.
- Produces: `#services`, `#stack`, `#team`, `#process`, `#operations`, `#faq`, `#contact`.
- Preserves: `#hero`, `data-hero-particles`, 현재 H1과 cursor mount.

- [ ] **Step 1: 하이브리드 페이지 RED 테스트 작성**

```ts
import { expect, test } from '@playwright/test';

const orderedSections = [
  'hero',
  'services',
  'stack',
  'team',
  'process',
  'operations',
  'faq',
  'contact',
];

test('keeps the current hero and restores the factual classic order', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#hero canvas[data-hero-particles]')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 1, name: 'BUILT FOR WHAT’S NEXT.' }),
  ).toBeVisible();
  expect(
    await page
      .locator('main > section[data-landing-section]')
      .evaluateAll((nodes) => nodes.map((node) => node.id)),
  ).toEqual(orderedSections);
  await expect(page.getByRole('link', { name: '팀' })).toHaveAttribute('href', '#team');
});

test('does not restore unverified proof or cinematic-only scenes', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#trust, #reviews, #cases, #quality, #review')).toHaveCount(0);
  await expect(
    page.locator('[data-quality-stage], [data-review-stage], [data-service-merge]'),
  ).toHaveCount(0);
  await expect(page.getByText(/24\/7|4시간|30\+|95%\+|자동 NDA|경력 \d+년/)).toHaveCount(0);
});
```

- [ ] **Step 2: RED 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts --workers=1
```

Expected: `#stack`, `#team`, `#operations`와 새 순서가 없어 FAIL. Hero assertion은 PASS.

- [ ] **Step 3: 복원 섹션의 최소 타입 정의**

```ts
export type IconName = 'check' | 'clock' | 'desktop' | 'link' | 'shield' | 'system';

export interface ServiceItem {
  title: string;
  description: string;
  icon: IconName;
}

export interface StackGroup {
  key: 'frontend' | 'interaction' | 'server' | 'quality';
  title: string;
  items: string[];
}

export interface TeamRole {
  badge: string;
  title: string;
  responsibility: string;
  tags: string[];
}

export interface OperationsPolicy {
  icon: IconName;
  title: string;
  description: string;
}
```

과거 `location`, `experience`, `projectExperience`, `cursorText` 필드는 복원하지 않는다.

- [ ] **Step 4: 사실 기반 설정 작성**

`stackGroups`는 다음 값만 사용한다.

```ts
export const stackGroups: StackGroup[] = [
  { key: 'frontend', title: 'Frontend', items: ['React', 'TypeScript', 'TanStack', 'Vite'] },
  { key: 'interaction', title: 'Interaction', items: ['GSAP', 'CSS Modules'] },
  { key: 'server', title: 'Server', items: ['Node.js', 'TanStack Start'] },
  { key: 'quality', title: 'Quality', items: ['Playwright', 'axe-core'] },
];
```

`teamRoles`는 연차·위치·완료 프로젝트 없이 다음 다섯 역할을 사용한다.

```ts
export const teamRoles: TeamRole[] = [
  {
    badge: 'PM',
    title: '프로젝트 매니지먼트',
    responsibility: '요구사항과 범위를 정리하고 일정과 의사결정을 연결합니다.',
    tags: ['기획', '문서화', '커뮤니케이션'],
  },
  {
    badge: 'PLAN',
    title: '서비스 기획',
    responsibility: '업무 흐름을 화면 구조와 실행 가능한 기능 단위로 바꿉니다.',
    tags: ['요구사항', 'IA', '화면 흐름'],
  },
  {
    badge: 'FE',
    title: '프론트엔드·모바일',
    responsibility: '실사용 환경에 맞는 웹과 앱의 화면 경험을 구현합니다.',
    tags: ['React', 'TypeScript', 'UI/UX'],
  },
  {
    badge: 'BE',
    title: '백엔드',
    responsibility: 'API, 데이터, 권한 구조를 운영 가능한 형태로 설계합니다.',
    tags: ['API', '데이터', '권한'],
  },
  {
    badge: 'OPS',
    title: '운영·인프라',
    responsibility: '배포와 모니터링, 변경 이력과 인수인계 범위를 관리합니다.',
    tags: ['배포', '모니터링', '인수인계'],
  },
];
```

`operationsPolicies`는 다음 네 항목을 사용한다.

```ts
export const operationsPolicies: OperationsPolicy[] = [
  {
    icon: 'shield',
    title: '정보 보호 범위 협의',
    description: '자료 취급과 비밀유지 조건은 프로젝트 시작 전에 필요한 범위로 확인합니다.',
  },
  {
    icon: 'clock',
    title: '운영 조건 명시',
    description: '모니터링과 대응 범위, 연락 방식은 운영 상황에 맞춰 문서로 정리합니다.',
  },
  {
    icon: 'system',
    title: '변경 이력 공유',
    description: '오류와 개선 작업은 원인, 변경 내용, 확인 결과가 남도록 관리합니다.',
  },
  {
    icon: 'check',
    title: '코드와 운영 자산 인계',
    description: '합의한 코드, 문서, 디자인, 운영 자료를 종료 범위에 맞춰 정리합니다.',
  },
];
```

- [ ] **Step 5: 내비게이션과 기존 설정 갱신**

```ts
export const navigationItems: NavItem[] = [
  { label: '서비스', href: '#services' },
  { label: '기술', href: '#stack' },
  { label: '팀', href: '#team' },
  { label: '프로세스', href: '#process' },
  { label: 'FAQ', href: '#faq' },
  { label: '문의', href: '#contact' },
];
```

서비스는 `웹·앱 개발`, `업무 시스템 구축`, `연동·API`, `운영·유지보수` 네 항목을 사용한다. 프로세스는 `상담 및 분석`, `기획 및 제안`, `디자인 및 개발`, `테스트 및 검증`, `배포 및 운영` 다섯 단계로 되돌린다.

- [ ] **Step 6: 클래식 semantic 섹션 구현**

서비스는 아이콘·제목·설명·문의 링크를 가진 네 `<article>`로 구현한다. 기술은 네 그룹 `<section>`과 실제 `<ul>`, 팀은 다섯 역할 `<article>`, 운영은 네 원칙 `<article>`, 프로세스는 다섯 단계 `<ol>`로 구현한다. 각 섹션에 `data-landing-section`과 `data-cursor-contrast='dark'`를 지정한다.

Task 1에서는 각 컴포넌트가 import하는 CSS Module에 실제 class selector를 함께 작성해 TypeScript build가 독립적으로 통과하게 한다. grid는 우선 1열 final-state로 두고, 반응형 열·surface·간격은 Task 2에서 확정한다.

`icons.tsx`는 필요한 여섯 아이콘만 매핑한다.

```ts
const ICONS: Record<IconName, LucideIcon> = {
  check: Check,
  clock: Clock,
  desktop: Monitor,
  link: LinkIcon,
  shield: ShieldCheck,
  system: Server,
};
```

팀 역할 목록의 핵심 마크업은 다음과 같다.

```tsx
{
  teamRoles.map((role) => (
    <article key={role.badge} className={styles.roleCard} data-reveal>
      <span className={styles.badge} aria-hidden='true'>
        {role.badge}
      </span>
      <h3>{role.title}</h3>
      <p>{role.responsibility}</p>
      <ul aria-label={`${role.title} 담당 영역`}>
        {role.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </article>
  ));
}
```

- [ ] **Step 7: LandingPage 순서 교체와 시네마틱 본문 제거**

```tsx
<HeaderSection />
<HeroSection />
<ServicesSection />
<StackSection />
<TeamSection />
<ProcessSection />
<OperationsPolicySection />
<FaqSection />
<ContactSection />
<FooterSection />
```

현재 scroll-top threshold, SSR-visible content, lazy enhancement 경계는 유지한다. 시네마틱 본문 전용 파일과 모든 import/export를 삭제한다.

`landing-enhancements.tsx`에서는 `useLandingSceneMotion` import와 호출만 제거하고 `useCustomCursor()`, `useLandingGsapInteractions(pageRef)`, `<CustomCursor />`는 유지한다.

- [ ] **Step 8: GREEN과 dangling reference 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts --workers=1
rg -n "QualityStandard|ReviewMethod|useLandingSceneMotion|data-quality-stage|data-review-stage|data-service-merge" src
pnpm build
```

Expected: Playwright와 build PASS. `rg` exit 1 with no matches.

- [ ] **Step 9: 커밋**

```bash
git add e2e/landing-classic-restoration.chrome.spec.ts \
  src/pages/landing/config/index.ts src/pages/landing/config/navigation.ts \
  src/pages/landing/config/services.ts src/pages/landing/config/stack.ts \
  src/pages/landing/config/team.ts src/pages/landing/config/process.ts \
  src/pages/landing/config/operations-policy.ts src/pages/landing/config/review-method.ts \
  src/pages/landing/model/types.ts src/pages/landing/ui/icons.tsx \
  src/pages/landing/ui/services-section.tsx src/pages/landing/ui/stack-section.tsx \
  src/pages/landing/ui/team-section.tsx src/pages/landing/ui/process-section.tsx \
  src/pages/landing/ui/operations-policy-section.tsx src/pages/landing/ui/landing-page.tsx \
  src/pages/landing/ui/landing-enhancements.tsx \
  src/pages/landing/ui/quality-standard-section.tsx src/pages/landing/ui/review-method-section.tsx \
  src/pages/landing/ui/use-landing-scene-motion.ts \
  src/pages/landing/ui/styles/services.module.css src/pages/landing/ui/styles/stack.module.css \
  src/pages/landing/ui/styles/team.module.css src/pages/landing/ui/styles/process.module.css \
  src/pages/landing/ui/styles/operations-policy.module.css \
  src/pages/landing/ui/styles/quality-standard.module.css \
  src/pages/landing/ui/styles/review-method.module.css
git commit -m "feat(landing): 사실 기반 클래식 페이지 구조 복원"
```

---

### Task 2: 클래식 Header·본문 surface·반응형 스타일 복원

**Files:**

- Modify: `e2e/landing-classic-restoration.chrome.spec.ts`
- Modify: `e2e/a11y/landing.static.a11y.spec.ts`
- Modify: `src/pages/landing/ui/styles/{stack,team,operations-policy}.module.css`
- Modify: `src/pages/landing/ui/styles/{shared,header,services,process}.module.css`
- Modify: `src/pages/landing/ui/header-section.tsx`
- Modify: `src/pages/landing/ui/{services,stack,team,process,operations-policy}-section.tsx`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/globals.css`

**Interfaces:**

- Consumes: Task 1의 최종 section DOM.
- Produces: `[data-classic-surface]` 7개 중 서비스·기술·팀·프로세스·운영 5개.
- Preserves: header sentinel surface 전환, mobile CTA containment, Hero gutter.

- [ ] **Step 1: geometry RED 테스트 추가**

```ts
test('uses classic surfaces without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
  await expect(
    page.locator(
      '#services [data-classic-surface], #stack [data-classic-surface], #team [data-classic-surface], #process [data-classic-surface], #operations [data-classic-surface]',
    ),
  ).toHaveCount(5);
});
```

- [ ] **Step 2: RED 확인**

Run: `pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts --grep "classic surfaces" --workers=1`

Expected: `data-classic-surface`가 없어 FAIL.

- [ ] **Step 3: 중단된 스타일 이식 diff 폐기**

Task 2 구현자가 중단 전에 만든 uncommitted 파일은 모두 Task 2 소유 파일이다. 해당 diff를 먼저 `883956b` 상태로 되돌리고 RED 테스트부터 새 기준으로 다시 작성한다. Task 1 커밋과 문서 수정 커밋은 되돌리지 않는다.

- [ ] **Step 4: 과거 TSX·CSS 파일 본문 자체 복원**

다음 파일은 `git show 12fa1c8:<path>`의 전체 내용을 출발점으로 교체한다.

```text
src/pages/landing/ui/header-section.tsx
src/pages/landing/ui/services-section.tsx
src/pages/landing/ui/stack-section.tsx
src/pages/landing/ui/team-section.tsx
src/pages/landing/ui/process-section.tsx
src/pages/landing/ui/operations-policy-section.tsx
src/pages/landing/ui/styles/shared.module.css
src/pages/landing/ui/styles/header.module.css
src/pages/landing/ui/styles/services.module.css
src/pages/landing/ui/styles/stack.module.css
src/pages/landing/ui/styles/team.module.css
src/pages/landing/ui/styles/process.module.css
src/pages/landing/ui/styles/operations-policy.module.css
```

복원 후 허용되는 차이는 다음뿐이다.

- 과거 `cursorText`, 연차, 위치, 완료 프로젝트 필드 제거.
- 현재 `data-cursor-contrast`와 `data-classic-surface` marker 추가.
- Header의 현재 hash scroll handler와 Hero/solid surface sentinel 연결 유지.
- 현재 `Button` API에 맞춘 CTA 연결.
- Task 1의 사실 기반 config/type interface에 맞춘 property 이름 조정.

- [ ] **Step 5: 과거 token·global source 복원과 현재 호환 추가**

`src/styles/tokens.css`와 `src/styles/globals.css`도 `12fa1c8` 파일 본문을 기준으로 복원한다. 그 뒤 다음 현재 호환 값만 추가한다.

```css
:root {
  --font-body: 'Wanted Sans Variable', 'Wanted Sans', 'FUTUR Sans Critical', sans-serif;
  --font-display: var(--font-body);
  --charcoal: #202523;
  --paper: #f3f1ec;
  --paper-cool: #e9ecec;
  --haze-blue: #5c8dc5;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}
```

`globals.css`에는 현재 custom cursor의 `html[data-landing-cursor-enabled='true']` 네이티브 커서 억제·compact viewport 복구 규칙을 유지한다. Hero CSS와 custom cursor CSS는 수정하지 않는다.

- [ ] **Step 6: 과거 반응형 동작 확인**

- 서비스: 데스크톱 2×2, 모바일 1열.
- 기술: 데스크톱 4그룹, 태블릿 2열, 모바일 1열.
- 팀: 데스크톱 3열 후 2열 흐름, 모바일 1열.
- 프로세스: 번호가 보이는 5단계 목록, 모바일 1열.
- 운영: 데스크톱 2×2, 모바일 1열.
- 모든 H2는 데스크톱 `55px`, 모바일 `42px` 이하.
- 현재 Layered Merge, orbit, path SVG, clip-path stage 스타일을 복원하지 않는다.

- [ ] **Step 7: Header 호환 경계 확인**

과거 캡슐형 header 비례를 적용하되 현재 `data-header-surface`, cursor tone, 모바일 CTA containment를 유지한다. 6개 링크가 태블릿 breakpoint에서 기존 메뉴로 전환되도록 한다.

- [ ] **Step 8: GREEN 확인**

정적 a11y section 목록을 현재 `#services`, `#stack`, `#team`, `#process`, `#operations`, `#faq`, `#contact`로 갱신한다. 직접 복원된 과거 색의 contrast가 실패하면 과거 팔레트 안에서 AA를 만족하는 가장 가까운 token으로만 교체한다.

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts --workers=1
pnpm exec playwright test e2e/a11y/landing.static.a11y.spec.ts --workers=1
```

Expected: geometry, Hero, runtime, static axe PASS.

- [ ] **Step 9: 커밋**

```bash
git add e2e/landing-classic-restoration.chrome.spec.ts \
  e2e/a11y/landing.static.a11y.spec.ts \
  src/pages/landing/ui/header-section.tsx \
  src/pages/landing/ui/services-section.tsx \
  src/pages/landing/ui/stack-section.tsx \
  src/pages/landing/ui/team-section.tsx \
  src/pages/landing/ui/process-section.tsx \
  src/pages/landing/ui/operations-policy-section.tsx \
  src/pages/landing/ui/styles/shared.module.css \
  src/pages/landing/ui/styles/header.module.css \
  src/pages/landing/ui/styles/services.module.css \
  src/pages/landing/ui/styles/stack.module.css \
  src/pages/landing/ui/styles/team.module.css \
  src/pages/landing/ui/styles/process.module.css \
  src/pages/landing/ui/styles/operations-policy.module.css \
  src/styles/tokens.css src/styles/globals.css
git commit -m "feat(landing): 클래식 본문과 헤더 스타일 복원"
```

---

### Task 3: FAQ·문의·Footer 클래식 스타일과 기능 보존

**Files:**

- Modify: `e2e/landing-classic-restoration.chrome.spec.ts`
- Modify: `src/pages/landing/config/contact.ts`
- Modify: `src/pages/landing/ui/{faq,contact,footer}-section.tsx`
- Modify: `src/pages/landing/ui/{contact-brief-fields,contact-identity-fields,custom-select}.tsx`
- Modify: `src/pages/landing/ui/styles/{faq,contact,form-controls,footer}.module.css`
- Test unchanged: `e2e/contact-delivery.chrome.spec.ts`
- Test unchanged: `e2e/contact-mail-safety.chrome.spec.ts`
- Test unchanged: `e2e/contact-server-boundaries.chrome.spec.ts`
- Test unchanged: `e2e/a11y/landing.interactive.a11y.spec.ts`

**Interfaces:**

- Preserves: FAQ `aria-expanded`/`aria-controls`, Contact server input names, native consent controls, submit state, legal modal triggers.
- Preserves: `#faq`, `#contact`, `data-landing-section`, semantic cursor contrast marker와 승인된 전체 섹션 순서.
- Produces: FAQ와 Contact의 `data-classic-surface`; factual Footer columns.
- Restores: 문의 단계·서비스·일정·예산·담당자·내용·동의 필드와 `12fa1c8`의 클래식 좌우 레이아웃.

- [ ] **Step 1: 하단 기능·geometry RED 테스트 추가**

```ts
test('restores the classic contact composition and native controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#contact');

  await expect(
    page.locator('#faq [data-classic-surface], #contact [data-classic-surface]'),
  ).toHaveCount(2);
  await expect(page.locator('#contact input[name="stage"]')).toHaveCount(3);
  await expect(page.locator('#contact input[name="services"]')).toHaveCount(5);
  await expect(page.locator('#contact input[type="hidden"][name="timeline"]')).toHaveCount(1);
  await expect(page.locator('#contact input[type="hidden"][name="budget"]')).toHaveCount(1);
  await expect(page.locator('#contact input[name="name"]')).toHaveCount(1);
  await expect(page.locator('#contact input[name="company"]')).toHaveCount(1);
  await expect(page.locator('#contact input[name="email"]')).toHaveCount(1);
  await expect(page.locator('#contact textarea[name="message"]')).toHaveCount(1);
  for (const name of ['collectionConsent', 'overseasTransferConsent']) {
    const input = page.locator(`input[name="${name}"]`);
    await input.locator('..').click();
    await expect(input).toBeChecked();
  }
});
```

- [ ] **Step 2: RED 확인**

Run: `pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts --grep "classic contact composition" --workers=1`

Expected: classic surface 또는 과거 문의 구성 계약이 없어 FAIL.

- [ ] **Step 3: FAQ 시각 레이어만 복원**

`faq-section.tsx`와 `styles/faq.module.css`는 `git show 12fa1c8:<path>`의 파일 본문 자체에서 시작한다. 현재 FAQ config 카피와 disclosure 접근성 계약을 다시 연결하고 `id`, `data-landing-section`, semantic cursor contrast marker, `data-classic-surface`만 추가한다.

- [ ] **Step 4: 과거 문의 소스를 완전히 복원하고 현재 서버 경계 연결**

다음 input name을 변경하지 않는다.

```ts
const protectedContactNames = [
  'name',
  'email',
  'company',
  'stage',
  'timeline',
  'budget',
  'services',
  'otherService',
  'message',
  'collectionConsent',
  'overseasTransferConsent',
  'website',
];
```

`contact-section.tsx`, `contact-brief-fields.tsx`, `contact-identity-fields.tsx`, `custom-select.tsx`, `config/contact.ts`, `styles/contact.module.css`, `styles/form-controls.module.css`는 모두 `git show 12fa1c8:<path>`의 파일 본문과 class 구조에서 시작한다. 현재 어두운 시네마틱 문의 wrapper나 현재 필드 배열을 남겨두고 스타일만 바꾸지 않는다.

과거의 단계·필요 서비스·일정·예산·담당자 정보·문의 내용·동의 UI와 좌우 레이아웃을 그대로 복원한 뒤, 현재 `ContactInquiryInput`, pending/success/failure, fallback mail, visible label surface와 native checkbox 연결을 최소 수정으로 다시 이식한다. `id`, `data-landing-section`, semantic cursor contrast marker, `data-classic-surface`도 유지한다. `평균 회신 24시간`, `빠른 범위 검토`는 삭제하고 확인 가능한 이메일 등만 남긴다. 서버 파일은 수정하지 않는다.

- [ ] **Step 5: Footer 정보 구조 복원**

`footer-section.tsx`와 `styles/footer.module.css`는 `12fa1c8`의 파일 본문 자체에서 시작한다. 브랜드, 현재 연락처, 서비스 탐색, 정책 링크만 현재 factual config와 연결한다. 확인되지 않은 영문 슬로건, 고객·성과·운영 보장은 넣지 않는다.

- [ ] **Step 6: 문의·접근성 GREEN 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-classic-restoration.chrome.spec.ts e2e/contact-delivery.chrome.spec.ts e2e/contact-mail-safety.chrome.spec.ts e2e/contact-server-boundaries.chrome.spec.ts e2e/a11y/landing.interactive.a11y.spec.ts --workers=1
```

Expected: 0 failed. 환경 용량 guard에 의한 기존 skip만 허용.

- [ ] **Step 7: 커밋**

```bash
git add e2e/landing-classic-restoration.chrome.spec.ts src/pages/landing/config/contact.ts src/pages/landing/ui/faq-section.tsx src/pages/landing/ui/contact-section.tsx src/pages/landing/ui/contact-brief-fields.tsx src/pages/landing/ui/contact-identity-fields.tsx src/pages/landing/ui/custom-select.tsx src/pages/landing/ui/footer-section.tsx src/pages/landing/ui/styles/faq.module.css src/pages/landing/ui/styles/contact.module.css src/pages/landing/ui/styles/form-controls.module.css src/pages/landing/ui/styles/footer.module.css
git commit -m "feat(landing): 클래식 문의와 하단 레이아웃 복원"
```

---

### Task 4: 클래식 reveal과 현재 Hero·커서 회귀 통합

**Files:**

- Modify: `e2e/landing-cinematic-editorial.chrome.spec.ts`
- Modify: `e2e/landing-editorial-motion.chrome.spec.ts`
- Modify: `src/pages/landing/ui/landing-enhancements.tsx`
- Modify: `src/pages/landing/ui/use-in-view-reveal.ts`
- Modify: `src/pages/landing/ui/use-landing-gsap-interactions.ts`

**Interfaces:**

- Preserves: `useCustomCursor()`, `CustomCursor`, current button interaction.
- Removes: quality/merge/review/process scene timelines.
- Produces: `[data-landing-reveal][data-landing-visible='true']` one-shot reveal.

- [ ] **Step 1: 모션 RED 테스트 작성**

```ts
test('reveals classic sections once without hiding SSR content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-landing-reveal]').first()).toBeVisible();
  await page.locator('#team').scrollIntoViewIfNeeded();
  await expect(page.locator('#team [data-landing-reveal]').first()).toHaveAttribute(
    'data-landing-visible',
    'true',
  );
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('shows restored sections in their final state', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('[data-landing-reveal]:not([data-landing-visible="true"])'),
    ).toHaveCount(0);
  });
});
```

- [ ] **Step 2: RED 확인**

Run: `pnpm exec playwright test e2e/landing-editorial-motion.chrome.spec.ts --workers=1`

Expected: 현재 scene motion 계약과 새 classic reveal 계약이 달라 FAIL.

- [ ] **Step 3: LandingEnhancements를 커서·버튼 경계로 축소**

```tsx
export function LandingEnhancements({ pageRef }: Props) {
  useCustomCursor();
  useLandingGsapInteractions(pageRef);
  return <CustomCursor />;
}
```

scene motion import와 mount를 제거한다.

- [ ] **Step 4: one-shot reveal 구현**

`use-in-view-reveal.ts`는 `git show 12fa1c8:src/pages/landing/ui/use-in-view-reveal.ts`의 파일 본문 자체에서 시작한다. 현재 SSR visibility gate와 reduced-motion 요구에 필요한 최소 보정만 적용하고, 과거의 `data-landing-reveal` → `data-landing-visible` one-shot 계약을 그대로 사용한다.

- [ ] **Step 5: 시네마틱 테스트 정리**

`landing-cinematic-editorial.chrome.spec.ts`에서 quality stage, merge, review mask, process path, dark cinematic contact 기대만 제거한다. Hero full viewport/gutter, mobile header, scroll-top, cursor tone/ring-dot/lifecycle/coarse/reduced 테스트는 유지한다.

- [ ] **Step 6: GREEN 확인**

Run:

```bash
pnpm exec playwright test e2e/landing-editorial-motion.chrome.spec.ts e2e/landing-hero-cinematic.chrome.spec.ts e2e/landing-runtime-errors.chrome.spec.ts e2e/landing-cinematic-editorial.chrome.spec.ts --workers=1
```

Expected: 0 failed.

- [ ] **Step 7: 커밋**

```bash
git add e2e/landing-cinematic-editorial.chrome.spec.ts e2e/landing-editorial-motion.chrome.spec.ts src/pages/landing/ui/landing-enhancements.tsx src/pages/landing/ui/use-in-view-reveal.ts src/pages/landing/ui/use-landing-gsap-interactions.ts
git commit -m "refactor(landing): 클래식 reveal과 현재 커서 경계 통합"
```

---

### Task 5: 접근성·문서·최종 시각 QA

**Files:**

- Modify: `e2e/landing-anti-slop.chrome.spec.ts`
- Modify: `e2e/a11y/landing.static.a11y.spec.ts`
- Modify: `e2e/landing.chrome.spec.ts`
- Modify: `DESIGN.md`
- Modify: `PRODUCT.md` only if section inventory appears there

**Interfaces:**

- Produces: 최종 하이브리드 페이지의 회귀·문서 권위.

- [ ] **Step 1: 섹션 목록과 제거 계약 갱신**

정적 a11y 대상은 `#services`, `#stack`, `#team`, `#process`, `#operations`, `#faq`, `#contact`로 설정한다. anti-slop 테스트는 숫자 지표·후기·완료 사례·SLA 문구의 부재를 계속 assert한다.

- [ ] **Step 2: 디자인 권위 문서 갱신**

`DESIGN.md`에 다음을 기록한다.

- Hero와 cursor는 2026-08-10 시네마틱 구현 유지.
- Hero 이후는 `12fa1c8` 클래식 디자인의 선택 복원.
- 최종 섹션 순서와 classic surface 수치.
- 금지된 증거·SLA.
- Contact 보안·접근성 보존 경계.

- [ ] **Step 3: 금지 문구와 dead reference scan**

Run:

```bash
rg -n "24/7|4시간|30\\+|95%\\+|자동 NDA|experience|projectExperience|TrustSection|ReviewsSection|CaseStoriesSection|QualityStandardSection|ReviewMethodSection|useLandingSceneMotion" src DESIGN.md PRODUCT.md
```

Expected: no matches.

- [ ] **Step 4: 포트 3000 시각 QA**

다음 네 캡처를 만든다.

- `1280×720` first viewport
- `1280×720` full page
- `390×844` first viewport
- `390×844` full page

확인 항목:

- Hero full-bleed와 particle silhouette가 기존과 동일하다.
- Hero 다음부터 클래식 배경·카드·간격으로 자연스럽게 전환된다.
- 팀 카드에 연차·위치·완료 사례가 없다.
- cursor가 Hero, 밝은 surface, 버튼, 문의 surface에서 보인다.
- mobile header, card, form, footer에 overflow가 없다.

- [ ] **Step 5: 전체 검증**

Run sequentially:

```bash
pnpm exec playwright test --workers=1
pnpm lint
pnpm build
graphify update .
git diff --check
```

Expected:

- Playwright: 0 failed; 환경 guard의 기존 skip만 허용.
- ESLint: 0 errors. 기존 `prefer-tag-over-role` warnings는 보고.
- Build: client, SSR, Nitro, `/`, `/privacy`, `/terms` prerender PASS.
- Graphify: exit 0.
- Diff check: no whitespace errors.

- [ ] **Step 6: 최종 커밋과 상태 확인**

```bash
git add e2e/landing-anti-slop.chrome.spec.ts e2e/a11y/landing.static.a11y.spec.ts e2e/landing.chrome.spec.ts DESIGN.md PRODUCT.md
git commit -m "docs(landing): 클래식 선택 복원 계약 확정"
git status --short --branch
```

Expected: clean worktree on `codex/landing-classic-restoration`. 사용자의 별도 지시 없이 `master` merge 또는 push를 수행하지 않는다.
