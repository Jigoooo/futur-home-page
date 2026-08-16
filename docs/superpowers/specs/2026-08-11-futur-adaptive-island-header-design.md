# FUTUR Adaptive Island 상단바 설계

> Superseded on 2026-08-17. 모바일 Compact/Expanded 계약은 `2026-08-17-mobile-header-persistent-navigation-design.md`의 상시 노출 `mobile-persistent` 계약으로 대체됐다. 데스크톱 glass surface와 tone 원칙만 역사적 배경으로 참고한다.

## 1. 목표와 확정 범위

상단바를 Hero의 전체 탐색에서 스크롤 후 작은 `FUTUR.` 섬으로 변하는 Adaptive Island로 바꾼다. 상단바는 페이지의 현재 위치를 안내하고 필요할 때만 다섯 개 탐색 항목을 펼친다. 문의 폼 UI와 그 진입 링크는 랜딩에서 제거하되, 실제 연락 가능한 Footer 이메일과 향후 재사용 가능한 문의 입력·서버 경계는 유지한다.

확정된 탐색 항목과 순서는 다음과 같다.

1. `서비스` → `#services`
2. `기술` → `#stack`
3. `팀` → `#team`
4. `프로세스` → `#process`
5. `FAQ` → `#faq`

최종 랜딩 순서는 `hero`, `services`, `stack`, `team`, `process`, `operations`, `faq`, `footer`다. `operations`는 별도 탐색 항목을 추가하지 않고 `프로세스`의 활성 구간으로 취급한다. Hero와 Footer에서는 활성 링크를 표시하지 않는다.

Skiper, Tailwind, Framer Motion을 비롯한 새 의존성은 추가하지 않는다.

## 2. 상태 계약

상단바 루트의 `data-header-layout`은 아래 세 상태 중 하나다.

- `hero-expanded`: 데스크톱 Hero에서 다섯 개 메뉴를 모두 보여주는 초기 상태
- `compact`: Hero 이탈 뒤 표시되는 Compact 상태
- `menu-expanded`: Compact 버튼으로 다섯 개 메뉴를 펼친 상태

데스크톱 기준 viewport는 `1280x720`이다. Hero에서는 `hero-expanded`로 시작하고 Hero 이탈 후 `compact`가 된다. 이 viewport에서 Hero expanded는 `1232x76px`, Compact는 `220x58px`, 확장 메뉴는 `820x68px`이며 top은 `18px`다. Compact 버튼은 상태나 라벨과 무관한 `data-header-toggle` marker를 제공한다.

모바일 기준 viewport는 `390x844`다. 모바일은 Hero에서도 `compact`로 시작한다. Compact는 `220x56px`, top `10px`이고 확장 메뉴는 `370x158px`다. 확장 시 화면 좌우에 각각 `10px`을 남기며 다섯 메뉴를 첫 줄 3개, 둘째 줄 2개의 `3+2` grid로 표시한다. 문서와 메뉴 어느 쪽에도 가로 overflow가 생기면 안 된다.

## 3. 동작과 현재 위치

Compact 컨트롤은 native `button`으로 구현하고 `aria-expanded`와 실제 메뉴 element를 가리키는 `aria-controls`를 항상 제공한다. 포인터 클릭, `Enter`, `Space` 모두 동일하게 메뉴를 연다.

Compact의 화면 라벨은 현재 구간을 보여준다. Hero와 Footer에서는 `FUTUR.`, services에서는 `서비스`, stack에서는 `기술`, team에서는 `팀`, process와 operations에서는 `프로세스`, faq에서는 `FAQ`다. 접근 가능한 이름은 화면 라벨과 열림 상태를 결합한다.

- 닫힘: `주요 메뉴 열기 · 현재 위치 {label}`
- 열림: `주요 메뉴 닫기 · 현재 위치 {label}`

메뉴는 다음 동작 중 하나가 발생하면 `compact`로 닫힌다.

- 메뉴 항목 선택
- 상단바 바깥 클릭
- `Escape`
- 메뉴를 연 위치로부터 세로 `24px` 이상 스크롤. 누적 `23px`에서는 열린 상태를 유지하고 정확히 `24px`가 되는 순간 닫는다.

모든 닫힘 경로에서 포커스는 Compact 버튼으로 돌아간다. 이 규칙은 키보드 사용자가 닫힌 메뉴 안에 포커스를 잃지 않게 하는 접근성 계약이기도 하다.

활성 섹션은 `services`, `stack`, `team`, `process`, `faq`를 추적하며 대응 링크 하나에만 `aria-current="location"`을 제공한다. `operations`가 화면의 현재 구간이면 `#process` 링크를 활성화한다. Hero와 Footer에서는 어느 링크에도 `aria-current`를 제공하지 않는다. 스크롤 앵커 위치는 Compact 높이를 기준으로 계산해 제목이 상단바 아래에 가려지지 않게 한다.

## 4. 모션 계약

일반 모션 환경에서는 기존 GSAP에 Flip을 사용해 상태 간 형태를 연결한다.

- 시작 squash: `70ms`
- 형태 morph: `420ms`
- 메뉴 stagger: 항목당 `25~35ms`
- 활성 indicator follow-through: `70ms`
- 닫힘: `340~380ms`

모션은 위치 이해를 돕는 범위에서만 사용하며 메뉴 조작이나 현재 위치 전달을 지연시키지 않는다. `prefers-reduced-motion: reduce`에서는 동일한 상태 전환과 포커스 결과를 animation/transition 없이 즉시 완료한다. CSS duration/delay만 0으로 만드는 데 그치지 않고 GSAP Flip도 실행하지 않아야 한다. 상태 변경 직후부터 전체 `70ms + 420ms + stagger/follow-through` 구간보다 긴 최소 `700ms` 동안 매 `requestAnimationFrame`마다 shell과 menu의 geometry, transform, opacity를 기록하며 모든 sample이 최초 sample과 동일해야 한다. 이 계약은 늦게 시작하는 GSAP와 opacity-only animation도 금지한다.

## 5. 크리스털 글라스 계약

Adaptive Island 표면은 배경에 따라 다음 값을 사용한다.

- 어두운 배경 tint: `46%`
- 밝은 배경 tint: `66%`
- blur: `18px`
- saturate: `145%`
- contrast: `1.04`
- 광학 테두리: `1px`

표면에는 inset highlight를 사용하고 fine pointer 환경에서만 spotlight를 제공한다. 스크롤 가장자리의 blur는 progressive하게 적용한다. `backdrop-filter` 미지원 환경과 고대비 환경에서는 효과에 의존하지 않고 `94%` 불투명 표면으로 대체해 텍스트 대비와 경계를 유지한다.

fixed outer Header는 위치와 Flip geometry만 소유하고, 단일 inner `data-header-glass` surface가 glass 표현을 소유한다. `will-change`는 `data-header-motion='true'`인 전환 구간에만 유지한다. Hash target offset은 CSS의 Compact 기준값인 desktop `92px`, mobile `82px`을 사용한다.

## 6. 접근성, no-JS, reduced-motion

- 상단바는 `주요 메뉴`라는 navigation landmark를 유지한다.
- Compact는 native button의 클릭·`Enter`·`Space` 동작을 보존한다.
- 화면 라벨은 현재 구간을, 접근 가능한 이름은 `주요 메뉴 열기|닫기 · 현재 위치 {label}` 형식으로 현재 위치와 조작 결과를 전달한다.
- 열림 상태는 `aria-expanded`, 소유 메뉴는 `aria-controls`, 현재 위치는 `aria-current="location"`으로 전달한다.
- 메뉴 닫힘 후 포커스는 Compact 버튼으로 돌아간다.
- focus-visible 표시와 텍스트/표면 대비는 밝고 어두운 모든 섹션에서 유지한다.
- JavaScript가 비활성화되어도 다섯 개 메뉴를 정적으로 모두 보여주며 Hero 제목과 모든 핵심 본문에 접근할 수 있어야 한다.
- reduced-motion에서도 기능과 상태 정보는 동일하며 animation/transition duration과 delay는 `0s`다.

## 7. 문의 UI 제거와 서버 경계

랜딩 DOM에서 다음 UI를 제거한다.

- `#contact` 섹션
- navigation의 `#contact` 항목
- Header 문의 CTA
- Hero 문의 CTA와 Hero 내부 링크
- 서비스 카드의 `#contact` 링크
- 문의 폼 UI 전용 component와 style

제거 후에도 다음 경계는 유지한다.

- Hero particle canvas
- Footer의 확인 가능한 이메일 및 `mailto:` 링크
- `src/pages/landing/model/contact-inquiry.ts`
- `src/pages/landing/server/contact-inquiry.functions.ts`
- `src/pages/landing/server/contact-inquiry.server.ts`
- `src/pages/landing/server/contact-mail.server.ts`
- `e2e/contact-server-boundaries.chrome.spec.ts`의 server 경계 행동 회귀
- `e2e/contact-mail-safety.chrome.spec.ts`의 실제 메일 차단 행동 회귀
- 문의 입력 검증, 메일 전송, allowlist, rate limit, idempotency, honeypot, form-age, test-address guard를 포함한 server 코드
- 개인정보처리방침과 이용약관의 기존 production 문구 및 수집 항목

즉, 이번 변경은 공개 랜딩의 문의 UI와 그 진입점만 제거한다. 입력 모델과 server 함수는 삭제하거나 약화하지 않으며, Footer 이메일·주소·`mailto:`와 company JSON-LD `ContactPoint`는 사용자가 연락할 수 있는 공개 경로로 남긴다. particle shader/engine의 `contact`는 포인터와 표면의 물리적 접촉을 뜻하므로 문의 UI 제거 대상이 아니다.

## 8. Hero full-bleed와 콘텐츠 gutter

Hero의 particle layer와 canvas는 viewport 전체 폭을 유지한다. HTML content wrapper는 desktop에서 `min(1400px, calc(100% - 64px))`, `720px` 이하에서 `calc(100% - 40px)`를 사용해 `390px` viewport의 좌우 gutter를 각각 `20px` 이상 보장한다. 공유 본문 container의 mobile `14px` gutter가 Hero wrapper를 덮어쓰지 않아야 한다.

## 9. 검증 계약

Playwright는 실제 Chrome에서 다음을 검증한다.

- `1280x720`의 `hero-expanded → compact → menu-expanded` 전환
- Compact의 `data-header-toggle`, 동적 화면/접근성 라벨, `aria-expanded`, `aria-controls`, 클릭·`Enter`·`Space`
- 다섯 활성 섹션, operations 매핑, Hero/Footer 비활성 상태. services/stack/team/process/operations/faq에서는 Compact를 실제로 열어 각 현재 위치 라벨의 `주요 메뉴 닫기 · 현재 위치 {label}`을 확인한다.
- 메뉴 선택, 바깥 클릭, `Escape`, `23px` 유지와 정확히 `24px` 스크롤에 따른 닫힘·포커스 복귀
- `390x844`의 Hero Compact, `3+2` grid, 좌우 `10px` 여백, 가로 overflow 방지
- reduced-motion의 CSS/GSAP/Flip 없는 즉시 전환과 700ms 매-frame geometry/transform/opacity 안정성, no-JS 정적 탐색
- 문의 UI 및 접근 가능한 이름이 문의인 Header CTA 제거, 최종 섹션 순서, Hero canvas, Footer 이메일, 문의 모델·server 세 계층과 server/mail 행동 spec 보존
- 모바일 Hero HTML copy의 좌우 `20px` 이상 gutter와 particle layer의 viewport-wide 폭 동시 보존

최종 구현은 대상 Playwright, 전체 E2E, axe WCAG 2.2 AA, lint, build, `graphify update .`, diff-check를 통과해야 한다.
