# Task 2 Report: Evidence-first information architecture and deterministic visuals

## Status

- 완료: 승인된 섹션 순서, qualitative Why FUTUR, semantic Delivery Map, semantic Project Record artifact boards, 통합 Delivery, 모바일 메뉴를 구현했다.
- 제외 유지: contact server 동작과 Task 1 보안 계약은 수정하지 않았다.
- 사용자 변경 보존: `.github/workflows/ci.yml`, `playwright.config.ts`, 삭제된 `e2e/landing.comet.spec.ts`, untracked `e2e/landing.chrome.spec.ts`는 수정·스테이징하지 않았다.

## RED

명령:

```bash
pnpm exec playwright test --config=playwright.task-2.config.ts
```

결과: exit 1, `6 failed`.

- 섹션 order marker가 없어 expected 8개 대비 actual 0개.
- `/landing/` 생성 이미지가 2개 렌더링됨.
- `FUTUR 프로젝트 전달 지도`가 1440/1024/390 모두 존재하지 않음.
- `메뉴 열기` 모바일 버튼이 존재하지 않음.

## GREEN

최종 명령:

```bash
pnpm lint && pnpm build && pnpm exec playwright test --config=playwright.task-2.config.ts && pnpm exec playwright test e2e/landing-runtime-errors.chrome.spec.ts --config=playwright.task-1.config.ts && git diff --check
```

결과: exit 0.

- `pnpm lint`: 0 errors, 기존 미수정 파일의 `jsx-a11y/prefer-tag-over-role` warning 4개만 남음 (`custom-select.tsx` 3개, `legal-modal.tsx` 1개).
- `pnpm build`: client, SSR, Nitro build 성공.
- Task 2 Chrome: `6 passed (6.7s)`.
- 기존 landing runtime smoke: `1 passed (6.3s)`.
- `git diff --check`: 출력 없음.

## Responsive checks

- 1440x900: Delivery Map의 세 단계가 visible, horizontal overflow 0.
- 1024x768: Delivery Map이 single-column hero 아래에 visible, horizontal overflow 0.
- 390x844: Delivery Map의 세 단계가 vertical flow로 visible, horizontal overflow 0.
- 390x844: logo + 44px menu button, dialog menu, 전체 anchors, contact CTA, open/close 상태를 Chrome에서 확인.
- 공통 section padding을 desktop `126-176px`, mobile `76-92px` 범위로 줄이고 Process/Operations/Reviews/Stack 독립 섹션을 제거해 전체 리듬을 압축했다.

## Changed files

### Test and composition

- `playwright.task-2.config.ts`
- `e2e/landing-evidence.chrome.spec.ts`
- `src/pages/landing/ui/landing-page.tsx`
- `src/pages/landing/ui/header-section.tsx`
- `src/pages/landing/ui/hero-section.tsx`
- `src/pages/landing/ui/trust-section.tsx`
- `src/pages/landing/ui/case-stories-section.tsx`
- `src/pages/landing/ui/services-section.tsx`
- `src/pages/landing/ui/delivery-section.tsx`
- `src/pages/landing/ui/team-section.tsx`
- `src/pages/landing/ui/faq-section.tsx`
- `src/pages/landing/ui/contact-section.tsx`
- `src/pages/landing/ui/footer-section.tsx`

### Config and types

- `src/pages/landing/config/case-stories.ts`
- `src/pages/landing/config/faq.ts`
- `src/pages/landing/config/hero.ts`
- `src/pages/landing/config/index.ts`
- `src/pages/landing/config/navigation.ts`
- `src/pages/landing/config/team.ts`
- `src/pages/landing/config/trust.ts`
- `src/pages/landing/model/types.ts`
- `src/routes/index.tsx`
- `package.json`

### Visual system

- `src/pages/landing/ui/styles/button.module.css`
- `src/pages/landing/ui/styles/case-stories.module.css`
- `src/pages/landing/ui/styles/contact.module.css`
- `src/pages/landing/ui/styles/custom-cursor.module.css`
- `src/pages/landing/ui/styles/delivery.module.css`
- `src/pages/landing/ui/styles/footer.module.css`
- `src/pages/landing/ui/styles/form-controls.module.css`
- `src/pages/landing/ui/styles/header.module.css`
- `src/pages/landing/ui/styles/hero.module.css`
- `src/pages/landing/ui/styles/services.module.css`
- `src/pages/landing/ui/styles/shared.module.css`
- `src/pages/landing/ui/styles/team.module.css`
- `src/pages/landing/ui/styles/trust.module.css`
- `src/styles/globals.css`

## Deleted files

- `scripts/generate-project-record-images.mjs`
- `public/landing/hero-product-preview.webp`
- `public/landing/project-records/web-platform.webp`
- `public/landing/project-records/mobile-workflow.webp`
- `public/landing/project-records/business-system.webp`
- `public/landing/project-records/integration-automation.webp`
- `src/pages/landing/config/operations-policy.ts`
- `src/pages/landing/config/process.ts`
- `src/pages/landing/config/reviews.ts`
- `src/pages/landing/config/stack.ts`
- `src/pages/landing/ui/operations-policy-section.tsx`
- `src/pages/landing/ui/process-section.tsx`
- `src/pages/landing/ui/reviews-section.tsx`
- `src/pages/landing/ui/stack-section.tsx`
- `src/pages/landing/ui/styles/operations-policy.module.css`
- `src/pages/landing/ui/styles/process.module.css`
- `src/pages/landing/ui/styles/reviews.module.css`
- `src/pages/landing/ui/styles/stack.module.css`

## Self-review

- 최종 order는 Header, Hero, Why FUTUR, Project Records, Services, Delivery, Team, FAQ, Contact, Footer다.
- trust/case 수치, 팀 연차 수치, 24/7/SLA/회신 시간/고정 일정 문구를 제거했다.
- Project Records는 문제·진행·결과 copy를 유지하고 네 종류의 HTML/CSS `<figure>` artifact board와 stack tags를 제공한다.
- 모든 artifact board는 DOM에 유지하면서 접근 가능한 tabs로 한 보드씩 노출해 페이지 높이를 제한한다. Arrow/Home/End 키 탐색을 유지했다.
- Hero Delivery Map은 이미지/SVG/무작위 장식 없이 HTML/CSS로만 구성했다.
- radial glow와 다색 card accent를 제거하고 blue 중심, mint는 handoff semantic 상태에만 사용했다.
- 일반 card radius는 20-28px, Hero와 lead case만 큰 radius를 사용한다.
- 생성 이미지 preload와 package generation script 참조를 제거한 뒤 생성 자산을 삭제했다.
- contact server와 security files에는 diff가 없다.

## Concerns

- `graphify update .`는 실행했지만 새 추출 1,866 nodes와 기존 graph.json 10,930 nodes 차이를 감지해 fail-closed로 덮어쓰기를 거부했다. `--force`는 그래프 대량 축소 위험 때문에 사용하지 않았다.
- WebP는 `apply_patch`가 binary UTF-8 read에서 실패해, 참조 제거 확인 후 정확한 5개 경로를 `rm`으로 삭제했다.
- 전체 lint의 warning 4개는 이번 Task 2에서 수정하지 않은 기존 custom select/legal modal 역할 구현에 남아 있다.

## Fix round 1/5

### Findings addressed

- FAQ의 `TODO(사용자 확인)`와 고정 `일일 단위 업데이트` 약속을 제거하고, 프로젝트에서 합의한 주기와 도구를 따르는 조건부 문구로 교체했다.
- artifact board에서 `aria-hidden`을 제거했다. 공통 속성은 `<dl>`, 웹·모바일·연동 흐름은 `<ol>`, 업무 권한·상태 매트릭스는 `<table>`로 노출했다.
- 모바일 sheet를 modal dialog가 아닌 disclosure navigation으로 변경했다. 열릴 때 첫 링크로 focus를 이동하고 Escape로 닫을 때 trigger focus를 복원한다.
- Contact CTA/card/form과 Footer lead surface를 `data-standard-surface`로 명시하고 desktop/mobile radius를 모두 20-28px 범위로 제한했다.
- 네 Project Record tab을 pointer와 ArrowRight/Home/End 키로 전환하며 `aria-selected`, matching panel, unique board content, stack tag를 검증하도록 회귀 테스트를 확장했다.

### RED evidence

명령:

```bash
pnpm exec playwright test --config=playwright.task-2.config.ts
```

결과: exit 1, `5 failed, 6 passed (42.6s)`.

- 고정 cadence/SLA 금지 문구 검사: `일일 단위` 1건 검출.
- artifact semantics 검사: 이름 있는 flow list와 `<dl>` 부재.
- mobile disclosure 검사: 이름 있는 navigation 부재.
- standard surface radius 검사: desktop/mobile 모두 계약 marker 0개.
- 네 tab pointer/keyboard 전환 검사는 기존 구현에서 통과했고, unique panel/board/stack 계약을 추가로 고정했다.

### GREEN evidence

명령:

```bash
pnpm exec playwright test --config=playwright.task-2.config.ts
```

결과: exit 0, `11 passed (13.9s)`.

추가 검증:

```bash
pnpm lint
pnpm exec tsc -b --pretty false
pnpm build
git diff --check
```

- lint: exit 0, error 0. 기존 미수정 `custom-select.tsx`/`legal-modal.tsx` warning 4개 유지.
- typecheck: exit 0, 출력 없음.
- build: exit 0, client/SSR/Nitro 성공.
- diff check: exit 0, 출력 없음.

### Fix files

- `.superpowers/sdd/futur-landing-redesign/task-2-report.md`
- `e2e/landing-evidence.chrome.spec.ts`
- `src/pages/landing/config/faq.ts`
- `src/pages/landing/ui/case-stories-section.tsx`
- `src/pages/landing/ui/header-section.tsx`
- `src/pages/landing/ui/contact-section.tsx`
- `src/pages/landing/ui/footer-section.tsx`
- `src/pages/landing/ui/styles/case-stories.module.css`
- `src/pages/landing/ui/styles/contact.module.css`
- `src/pages/landing/ui/styles/footer.module.css`

### Fix concerns

- `graphify update .`는 재실행했지만 이전과 동일하게 새 추출 1,866 nodes와 기존 10,930 nodes 차이를 감지해 fail-closed로 종료했다. 강제 덮어쓰기는 하지 않았다.

## Fix round 2/5

### Findings addressed

- artifact board의 `STRUCTURE` 레이블만 `aria-hidden='true'`로 처리하고, 실제 프로젝트 데이터인 `<dl>`, `<ol>`, `<table>`은 접근성 트리에 유지했다.
- blanket `aria-hidden` 0건 검사를 제거했다. 대신 장식 레이블은 숨겨져야 하고, 속성·흐름·권한 상태 데이터에는 `aria-hidden`이 없어야 한다는 계약을 각각 검증한다.
- 네 Project Record의 pointer/keyboard 검증을 공통 `expectSelectedRecord` assertion으로 통합했다. 모든 전환마다 선택 tab, visible matching panel, 고유 board 제목, stack tag를 확인한다.
- keyboard 경로는 `Home`, 네 레코드를 순회하는 `ArrowRight`, 우측 wrap, `ArrowLeft` wrap, `Home`, `End`를 모두 검증한다.

### RED evidence

초기 테스트 작성 후 동일 명령에서 이름 있는 flow 내부가 아닌 첫 일반 list item을 선택한 테스트 오류를 확인했다: exit 1, `1 failed, 10 passed (18.7s)`. locator를 이름 있는 flow list로 한정하고 실제 semantic 데이터(`신청 정보`, `사용자`)를 사용하도록 테스트만 정정했다.

명령:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts
```

프로덕션 수정 전 결과: exit 1, `1 failed, 10 passed (18.9s)`.

- 실패: `STRUCTURE` locator의 `aria-hidden` expected `"true"`, received `null`.
- 통과: 강화한 전체 pointer/keyboard tab 경로와 `<dl>/<ol>/<table>` semantic data 노출 검사.

### GREEN evidence

명령:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts
```

결과: exit 0, `11 passed (12.3s)`.

추가 검증:

```bash
pnpm lint
pnpm exec tsc -b --pretty false
pnpm build
git diff --check
```

- lint: exit 0, error 0. 기존 미수정 `custom-select.tsx`/`legal-modal.tsx` warning 4개 유지.
- typecheck: exit 0, 출력 없음.
- build: exit 0, client/SSR/Nitro 성공.
- diff check: exit 0, 출력 없음.

### Fix files

- `.superpowers/sdd/futur-landing-redesign/task-2-report.md`
- `e2e/landing-evidence.chrome.spec.ts`
- `src/pages/landing/ui/case-stories-section.tsx`

### Fix concerns

- `graphify update .`는 재실행했지만 새 추출 1,868 nodes와 기존 10,930 nodes 차이를 감지해 fail-closed로 덮어쓰기를 거부했다. `--force`는 사용하지 않았다.
- lint warning 4개는 이번 round의 좁은 범위 밖인 기존 custom select/legal modal 구현에 남아 있다.

## Fix round 3/5

### Findings addressed

- artifact topbar의 장식용 `WEB`, `APP`, `SYS`, `API` icon span에만 `aria-hidden='true'`를 추가했다. 기존 `<dl>`, `<ol>`, `<table>`과 내부 데이터는 계속 접근성 트리에 노출된다.
- case tab을 click 또는 keyboard로 조작하는 두 테스트가 `body[data-landing-ready='true']`를 먼저 기다리도록 공통 helper를 추가했다. Playwright assertion 기반 대기라 고정 timeout은 사용하지 않는다.
- 장식 아이콘 네 개의 정확한 텍스트와 `aria-hidden`만 좁게 검사하며, blanket `aria-hidden` 규칙은 추가하지 않았다.

### RED evidence

명령:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts --grep "artifact board structure"
```

프로덕션 수정 전 결과: exit 1, 1 failed.

- hydration-ready 대기와 semantic board 검사는 통과했다.
- 첫 장식 icon `WEB`의 `aria-hidden` expected `"true"`, received `null`로 실패했다.

### GREEN evidence

독립 artifact 접근성 테스트:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts --grep "artifact board structure"
```

결과: exit 0, `1 passed (4.5s)`.

독립 tab interaction 테스트:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts --grep "working pointer and keyboard tabs"
```

결과: exit 0, `1 passed (4.7s)`.

전체 Task 2 suite:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts
```

결과: exit 0, `11 passed (9.0s)`.

추가 검증:

```bash
pnpm exec eslint e2e/landing-evidence.chrome.spec.ts src/pages/landing/ui/case-stories-section.tsx
pnpm exec tsc -b --pretty false
pnpm build
git diff --check
```

- targeted lint: exit 0, 출력 없음.
- typecheck: exit 0, 출력 없음.
- build: exit 0, client/SSR/Nitro 성공.
- diff check: exit 0, 출력 없음.

### Fix files

- `.superpowers/sdd/futur-landing-redesign/task-2-report.md`
- `e2e/landing-evidence.chrome.spec.ts`
- `src/pages/landing/ui/case-stories-section.tsx`

### Fix concerns

- `graphify update .`는 새 추출 1,869 nodes와 기존 10,930 nodes 차이를 감지해 다시 fail-closed로 덮어쓰기를 거부했다. `--force`는 사용하지 않았다.

## Final evidence fix

### Finding addressed

- Project Records에 표시되던 case별 stack tag 영역을 제거했다.
- `caseStories`의 미검증 stack 값은 모두 빈 배열로 교체해 `Payment`, `Camera`, `Admin Web`, `RBAC`, `Queue` 등 프로젝트별 기술 주장 데이터가 남지 않게 했다.
- tab 공통 assertion에서 stack tag 요구를 제거하고, Project Records 안에 stack tag/`STACK` 레이블/금지된 case-specific stack 문구가 없음을 검증한다.

### RED evidence

명령:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts --grep "qualitative evidence"
```

프로덕션 수정 전 결과: exit 1, 1 failed.

- `[data-stack-tag]` expected 0, received 16으로 실패했다.

### GREEN evidence

독립 회귀 테스트:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts --grep "qualitative evidence"
```

결과: exit 0, `1 passed (3.5s)`.

전체 Task 2 suite:

```bash
pnpm exec playwright test --config playwright.task-2.config.ts
```

결과: exit 0, `11 passed (8.4s)`.

추가 검증:

```bash
pnpm exec eslint e2e/landing-evidence.chrome.spec.ts src/pages/landing/config/case-stories.ts src/pages/landing/ui/case-stories-section.tsx
pnpm exec tsc -b --pretty false
pnpm build
git diff --check
```

- targeted lint: exit 0, 출력 없음.
- typecheck: exit 0, 출력 없음.
- build: exit 0, client/SSR/Nitro 성공.
- diff check: exit 0, 출력 없음.

### Fix files

- `.superpowers/sdd/futur-landing-redesign/task-2-report.md`
- `e2e/landing-evidence.chrome.spec.ts`
- `src/pages/landing/config/case-stories.ts`
- `src/pages/landing/ui/case-stories-section.tsx`

### Concerns

- `graphify update .`는 새 추출 1,847 nodes와 기존 10,930 nodes 차이를 감지해 fail-closed로 덮어쓰기를 거부했다. `--force`는 사용하지 않았다.
- 다른 agent/user의 contact server, motion test, CI/Playwright 변경은 보존하고 stage하지 않았다.
