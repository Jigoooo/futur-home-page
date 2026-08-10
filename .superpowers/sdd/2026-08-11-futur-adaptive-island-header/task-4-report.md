# Task 4 보고서 — 크리스털 글라스와 반응형

## 상태

완료. Adaptive Island의 fixed outer positioner와 단일 inner glass surface를 분리하고,
desktop/mobile geometry, dark/light tint, fine-pointer spotlight, cursor contrast, fallback,
compact CSS scroll offset, transient `will-change` 계약을 구현했다.

## 변경 내용

- outer Header는 fixed 위치와 GSAP Flip geometry만 소유하고, inner `data-header-glass` surface가
  tint, optical rim, inset highlight, shadow, specular, progressive lower-edge blur/mask를 소유한다.
- desktop은 `hero-expanded 1232x76@1280`, `compact 220x58`, `menu-expanded 820x68`, top
  `18px`이고 mobile은 `compact 220x56`, `menu-expanded 370x158@390`, top `10px`다.
- mobile menu는 6-track grid에서 각 항목이 2 track을 사용해 첫 행 3개와 중앙 정렬된 둘째 행
  2개를 만든다.
- dark surface tint는 `rgba(248, 250, 255, 0.46)`, light surface tint는
  `rgba(248, 250, 255, 0.66)`이며 공통 filter는
  `blur(18px) saturate(145%) contrast(1.04)`다.
- inner surface에 `data-landing-spotlight='header'`를 연결해 기존 `--mx/--my` updater를
  재사용한다. fine pointer와 normal motion에서만 이동 highlight가 보이고 coarse/reduced motion은
  static `50%` 위치를 유지한다.
- glass에는 dark cursor, navy toggle/close controls에는 nested light cursor marker를 선언했다.
- backdrop-filter 미지원 `@supports not`와 `prefers-contrast: more`에서 94% opaque surface를
  사용한다.
- `--landing-compact-header-offset`은 desktop `92px`, mobile `82px`로 CSS가 소유하고 scroll
  utility가 computed value를 읽는다. TanStack의 후속 hash scroll보다 한 RAF 뒤에 offset scroll을
  적용해 실제 target top을 계약값으로 고정했다.
- `data-header-motion`은 Flip timeline 시작부터 완료/중단까지만 유지되며 이 구간에만
  `will-change`를 제공한다. scroll handler는 width/height를 쓰지 않는다.

## TDD RED → GREEN

### RED

```text
pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts --project=chrome --workers=1 --grep "precise responsive geometry|semantic glass tint|compact CSS offset|will-change scoped"

4 failed
- [data-header-glass] 0개
- [data-header-glass] spotlight/cursor marker 없음
- --landing-compact-header-offset computed value 없음
- data-header-motion 없음
exit 1
```

문법과 dev server는 정상이고 네 실패 모두 Task 4 production 계약 부재에서 발생했다.

### GREEN

```text
동일 focused command
4 passed (12.2s)
exit 0

pnpm exec playwright test e2e/landing-adaptive-island.chrome.spec.ts --project=chrome --workers=1
17 passed (27.6s)
exit 0
```

transition layout-write 회귀를 추가로 잠갔을 때 기존 Flip의 `absolute` mode가 동일한 inline
`width: 220px; height: 58px`를 frame마다 반복 기록해 RED가 됐다. fixed outer positioner에서
`absolute`를 제거하고 `scale: true` Flip으로 전환한 뒤 inline width/height 기록 0건으로 GREEN이
됐다.

## 시각 검증

`.review-screens/` 아래 ignored evidence로 desktop `1280x720`, mobile `390x844`의
`hero/services/operations/footer` compact/expanded 상태 16장을 생성해 직접 검사했다.

- 모든 상태에서 document horizontal overflow `0px`
- desktop compact `220x58`, expanded `820x68`; mobile compact `220x56`, expanded `370x158`
- mobile expanded는 3+2 grid이고 마지막 두 항목이 중앙 정렬됨
- dark/light surface 모두 nav label, active underline, navy control과 optical rim 식별 가능
- hero/services/operations/footer에서 `.46/.66` tint와 18px blur가 computed style로 유지됨

## 검증

```text
Adaptive Island 전체: 17 passed
cursor/runtime focused: 4 passed
axe WCAG 2.2 AA static/interactive: 8 passed
pnpm lint: 0 errors, 기존 FAQ prefer-tag-over-role warning 1건
pnpm build: TypeScript, client, SSR, Nitro, /, /privacy, /terms prerender 성공
graphify update .: 725 nodes, 977 edges, 78 communities
git diff --check: 출력 없음
```

`landing-cinematic-editorial.chrome.spec.ts`의 독립 Hero mobile gutter 테스트는 기존 CSS 값
`14px`과 테스트 기대 `>=20px`가 충돌해 단독 `repeat-each=3`에서도 3회 실패했다. Task 4 변경은
scoped Header CSS와 Header behavior에 한정되고 Hero gutter 파일은 수정하지 않았다.

## 보존 경계

- navigation, focus return, dismiss, no-JS, reduced-motion, active section behavior 유지
- Hero particle/canvas, FAQ, Footer, contact model/server/functions/mail 경계 무변경
- `#contact` runtime anchor나 특례 추가 없음
- 새 dependency 없음
- `.review-screens` PNG 외 임시 capture/debug script 없음
