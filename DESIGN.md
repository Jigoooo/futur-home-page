---
name: FUTUR Landing
description: 풀스크린 파티클 Hero와 Adaptive Island, 클래식 B2B 본문을 결합한 개발 파트너 랜딩
colors:
  charcoal: '#202523'
  paper: '#F3F1EC'
  paper-cool: '#E9ECEC'
  blue: '#1E4DC4'
  muted: '#545C58'
typography:
  family: 'Wanted Sans Variable, Wanted Sans, FUTUR Sans Critical, Apple SD Gothic Neo, Noto Sans KR, system-ui, sans-serif'
  hero: 'clamp(56px, 5.6vw, 80px)'
  section: '50px desktop, clamp(33px, 8vw, 42px) mobile'
  body: '16px–19px'
radius:
  card: '18px–40px'
  header: '28px'
  button: '999px'
---

# Design System: FUTUR Hybrid Classic

## Authority

이 문서는 현재 랜딩의 최종 디자인 권위다. 구현 순서는
`src/pages/landing/ui/landing-page.tsx`, 토큰은 `src/styles/tokens.css`, 개별 형태와 반응형
규칙은 각 CSS Module을 따른다. `docs/futur_react_docs_package/DESIGN.md`는 역사적 참고자료이며
충돌 시 이 문서, 현재 소스 순으로 판단한다.

`docs/superpowers/specs/2026-08-11-futur-continuous-liquid-island-design.md`는
`docs/superpowers/specs/2026-08-11-futur-adaptive-island-header-design.md`의 Header 상태, motion,
glass 계약만 대체한다. 공개 문의 UI 제거와 server/model/config/mail/legal 보존을 포함한 나머지
Adaptive Island 경계는 그대로 유효하다.

Hero의 particle surface와 ring/dot cursor는 시네마틱 구현을 유지한다. Header는 데스크톱의
연속형 상태와 모바일의 두 상태를 분리하고, Hero 이후에는 클래식 B2B 문서 표면을 사용한다.
삭제된 시네마틱 본문 장면, 문의 폼 UI, merge/mask/path stage를 다시 만들지 않는다.

## Final Page Order

`data-landing-section` 순서는 다음과 같다.

1. Hero (`#hero`)
2. 서비스 (`#services`)
3. 기술 (`#stack`)
4. 팀 (`#team`)
5. 프로세스 (`#process`)
6. 운영 원칙 (`#operations`)
7. FAQ (`#faq`)
8. Footer (`#footer`)

Header의 주요 내비게이션은 서비스, 기술, 팀, 프로세스, FAQ의 다섯 앵커만 제공한다.
`operations`는 별도 메뉴를 추가하지 않고 프로세스 활성 구간으로 취급한다. Hero와 Footer에서는
활성 링크가 없다. Footer는 semantic `footer`이면서 현재 `main` 안의 마지막
`data-landing-section`이다.

## Hero: Full-bleed Particle and Content Gutter

Hero는 최소 `100svh`의 charcoal full-bleed surface다. 절대 배치된 particle layer와 WebGL2
canvas는 viewport 전체 폭을 유지하고 장식 요소로 보조기술에서 숨긴다. HTML headline과 설명은
particle lifecycle과 독립적으로 SSR에서 읽을 수 있다.

- 데스크톱 content wrapper: `min(1400px, calc(100% - 64px))`
- `720px` 이하 content wrapper: `calc(100% - 40px)`; `390px` viewport에서 좌우 gutter 각각
  `20px` 이상
- Hero가 viewport 밖이거나 문서가 숨겨지면 particle render를 멈추고 복귀 시 재개한다.
- reduced motion, Save-Data, WebGL 초기화 실패, context loss에서는 정적/fallback surface를
  사용하되 Hero 높이, 대비, headline과 설명을 유지한다.
- 공개 Hero CTA와 `#contact` 링크는 없다.

## Continuous Liquid Island

Header root의 `data-header-layout`은 데스크톱에서 `desktop-fluid`, 모바일에서
`mobile-compact | mobile-expanded`를 사용한다.

- 데스크톱 `1280×720`: `desktop-fluid`는 top `18px`, 시작 `1232×76px`, radius `28px`다.
  `scrollY 0 → 160px` 진행률에 따라 visual width scale `1 → 0.92`, visual width
  `1232 → 약 1133px`, visual height `76 → 약 68px`, radius `28 → 24px`로 연속 축소된다.
  로고와 서비스, 기술, 팀, 프로세스, FAQ 링크는 전 구간에 항상 보이고 tab order에 남는다.
  Compact toggle과 close control은 사용하지 않는다.
- 모바일 `390×844`: Hero부터 `mobile-compact`이며 `220×56px`, top `10px`; 열린
  `mobile-expanded`는 `370×158px`이고 화면 좌우 `10px`을 남긴다.
- 모바일 메뉴는 6-track CSS grid에서 각 링크가 2 track을 차지해 `3+2` 두 행으로 보인다.
- Compact 화면 라벨은 Hero/Footer `FUTUR.`, services `서비스`, stack `기술`, team `팀`,
  process/operations `프로세스`, faq `FAQ`다.
- 활성 링크는 하나의 `aria-current='location'`으로 전달하며 operations는 `#process`로 매핑한다.

Compact surface 전체가 native button이다. `aria-expanded`, 실제 menu id를 가리키는
`aria-controls`, `주요 메뉴 열기|닫기 · 현재 위치 {label}` 접근 가능한 이름을 제공한다. 클릭,
Enter, Space로 열 수 있고 메뉴 선택, 바깥 pointer, Escape, 열린 위치에서 누적 `24px` 스크롤로
닫힌다. 모든 닫힘 경로는 compact layout commit 직후 toggle로 포커스를 복귀한다.

JavaScript 비활성 상태에서는 logo와 다섯 링크를 정적으로 노출하고, 모바일 shell은 `158px`
높이로 링크를 포함한다. 동작하지 않는 toggle/close control은 숨긴다. Hydration 전후에도 핵심
탐색 경로가 사라지지 않는다.

## Crystal Glass and Motion

fixed outer Header는 위치와 hit area를 소유하고, 단일 inner `data-header-glass` surface가 배경,
optical rim, 얇은 상단 specular, 약한 inner shadow를 소유한다. 높은 opacity의 중첩 glass card나
전체 표면 흰색 gradient는 만들지 않는다.

- dark surface tint: `rgba(248, 250, 255, 0.18)`
- light surface tint: `rgba(248, 250, 255, 0.26)`
- filter: `blur(20px) saturate(135%) contrast(1.03)`
- border/radius: `1px` optical rim, `28px` radius
- backdrop-filter 미지원 또는 `prefers-contrast: more`: `rgba(248, 250, 255, 0.92)`와 filter
  `none`

fine pointer와 normal motion에서만 `--mx/--my` spotlight가 움직인다. coarse pointer와 reduced
motion에서는 정적 중심값을 사용한다. header glass는 dark cursor contrast, navy toggle/close는
light cursor contrast를 선언한다.

데스크톱은 `scrollY / 160` 진행률을 한 번의 `requestAnimationFrame`에서 반영하고 약
`180~240ms` follow response로 현재 값에서 자연스럽게 반전한다. scroll frame마다 React state나
layout width/height를 쓰지 않으며 typography 크기는 유지한다.

모바일은 한 animation owner가 shell geometry와 menu item을 함께 제어한다. open은 `320ms`,
bounded `power3.inOut`, menu item `opacity 0 → 1`, `translateY(6px) → 0`, `28ms` stagger다.
close는 `280ms`이며 menu opacity를 먼저 낮춘다. 반대 입력은 현재 computed geometry에서 즉시
새 timeline을 시작한다. 종료 후 transform/width/height/opacity inline style을 정리하고
`will-change`는 `data-header-motion='true'` 구간에만 둔다. reduced motion에서는 상태와 desktop
진행률을 animation 없이 즉시 반영하고 CSS animation/transition duration과 delay도 `0s`다.

Hash target offset은 expanded rect가 아니라 CSS의 compact 기준값을 사용한다. desktop은
`92px`, mobile은 `82px`이며 target heading은 Header 아래에 남는다.

## Classic Sections, Reveal, and Cursor

서비스, 기술, 팀, 프로세스, 운영 원칙, FAQ의 여섯 `data-classic-surface`가 Hero 다음에 이어진다.
본문 최대 폭은 `1180px`, 공통 제목은 desktop `50px`, mobile 최대 `42px`다. mobile grid는
한 열이고 가로 overflow를 만들지 않는다.

본문은 `data-landing-reveal`에서 `data-landing-visible`로 한 번만 전환한다. SSR/no-JS에서는
콘텐츠가 보이고, reduced motion에서는 observer/transition 없이 최종 상태를 제공한다. Hero와
운영 원칙은 light cursor, paper 본문과 Footer는 dark cursor를 사용한다. custom cursor는 fine
pointer, 폭 `900px` 초과, normal motion에서만 활성화하고 나머지는 native cursor와
`focus-visible`을 유지한다.

## Contact UI and Preserved Boundaries

공개 랜딩에서 문의 폼 UI와 진입 anchor는 제거된 상태가 계약이다. Header/Hero/서비스 카드에
문의 CTA나 `#contact` runtime anchor가 없고, contact form component/style 및 랜딩 폼 전송
E2E도 존재하지 않는다.

다음 contact 문자열은 삭제 대상이 아니라 의도적으로 보존한 경계다.

- `src/pages/landing/config/contact.ts`: server validation이 사용하는 허용값
- `src/pages/landing/model/contact-inquiry.ts`: 문의 입력/result 타입
- `src/pages/landing/server/contact-inquiry.functions.ts`, `contact-inquiry.server.ts`,
  `contact-mail.server.ts`: 향후 재사용 가능한 server validation/delivery 경계
- `e2e/contact-server-boundaries.chrome.spec.ts`, `e2e/contact-mail-safety.chrome.spec.ts`:
  rate limit/idempotency/메일 실발송 차단 회귀
- Footer의 공개 이메일, 주소, `mailto:`와 company JSON-LD `ContactPoint`: 현재 사용자가 연락할
  수 있는 공개 경로
- 개인정보처리방침과 이용약관의 문의·수집·보유·책임자 문구: 실제 production legal copy
- particle shader/engine의 `contact`: 포인터와 표면의 물리적 접촉을 뜻하며 문의 기능과 무관

privacy/terms production copy는 문의 폼 UI 제거 범위 밖이며 변경하지 않는다. 서버 입력 경계가
보존되므로 개인정보처리방침의 기존 수집 항목도 유지한다.

## Evidence and SLA Boundary

공개 문구는 확인 가능한 회사 정보, 실제 구현, 사용자가 제공한 조건만 설명한다. 공개 근거 없는
고객 로고·후기·사례·숫자 지표나 상시 지원·응답 시간·자동 계약·확정 일정 같은 SLA를 만들거나
암시하지 않는다. 법인과 연락처 사실은 `src/entities/company/config/company-infos.ts`를 따른다.

## Regression Checklist

- [ ] Hero particle layer는 viewport-wide이고 모바일 HTML copy gutter는 `20px` 이상이다.
- [ ] `data-landing-section`과 주요 내비게이션 순서가 Final Page Order와 일치한다.
- [ ] Adaptive Island의 상태, 크기, label, active mapping과 모든 dismissal focus가 유지된다.
- [ ] single glass surface, dark/light tint, fallback, spotlight/cursor 경계가 유지된다.
- [ ] no-JS와 reduced-motion에서 다섯 탐색 링크와 핵심 콘텐츠가 접근 가능하다.
- [ ] 문의 UI/`#contact` runtime anchor는 없고 Footer 및 contact server/model/config/legal 경계는
      유지된다.
- [ ] axe WCAG 2.2 AA, runtime, server/mail safety, 전체 Playwright, lint, build가 통과한다.
- [ ] `1280×720`과 `390×844`의 Hero/services/operations/Footer compact/expanded에서 가로
      overflow, 대비, glass legibility 문제가 없다.
