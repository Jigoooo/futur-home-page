# FUTUR Header Transition Polish 설계

## 1. 목적

Hero에서 서비스로 넘어갈 때 Header가 이미 최대 축소 상태인데도 scroll event마다 동일한 GSAP
target을 다시 전달하고, 고정 glass surface의 geometry와 shadow custom property를 반복 기록한다.
로컬 3000번 비교 계측에서는 109개 scroll frame 동안 Header style write가 2,178회 발생했다.

같은 Header는 Hero 같은 어두운 배경에서 glass 분리력이 부족하고 강한 흰 border를 유지해,
메뉴 글자는 배경에 묻히고 border만 흰 선처럼 도드라진다.

이번 변경은 불필요한 scroll-linked write를 멈추고 semantic surface별 ink와 optical border를
분리한 뒤, 승인된 Shared Glide indicator를 같은 lifecycle 안에 추가한다.

## 2. 성능 계약

- 데스크톱 geometry progress는 기존 `clamp(scrollY / 160, 0, 1)`을 유지한다.
- scheduled frame에서 계산한 target progress가 직전 target과 같고 viewport width도 같으면
  `gsap.quickTo`를 다시 호출하지 않는다.
- scrollY가 160px을 넘은 뒤 Hero→Services를 통과하는 동안 Header geometry custom property를
  반복 기록하지 않는다.
- resize는 width가 실제로 바뀐 경우에만 geometry를 다시 계산한다.
- active section 탐색은 기존 한 번의 rAF ownership을 유지하고 React state는 section id가 실제로
  바뀔 때만 갱신한다.
- active/tone probe는 viewport 중앙이 아니라 실제 Header rect의 `bottom + 8px`이다. 다음 섹션이
  이 선에 도달하기 전까지 이전 섹션의 ink와 active state를 유지한다.
- Hero particle engine, 70,000-particle tier, Services reveal choreography는 변경하지 않는다.

## 3. Backdrop-adaptive surface 계약

- Hero와 운영 원칙 같은 dark section에서는 logo와 일반 nav text를 white로 사용한다.
- Our Services, Stack, Our Team, Process, FAQ, Footer 같은 light section에서는 logo와 일반 nav
  text를 navy, active/focus text를 accessible blue로 사용한다.
- glass의 반투명 합성 결과가 뒤의 각 픽셀을 그대로 받아들이므로, 한 Header 아래에 dark/light가
  함께 있어도 각 영역의 surface 명도는 서로 다르게 남는다.
- glass background와 filter는 이번 변경에서 수정하지 않는다. dark 약 `0.18`, light 약 `0.26`,
  blur `20px`, saturate `135%`, contrast `1.03`의 기존 값을 그대로 둔다.
- `data-header-glass-tone='dark'`의 optical border만 흰색 단색에서 낮은 alpha의 cool-blue rim으로
  낮춘다.
- text shadow, glow, `mix-blend-mode`, text 복제는 사용하지 않는다.
- color와 border 전환은 `160ms var(--ease-out)`로 제한한다.
- fallback/high-contrast에서는 기존 0.92 opaque surface와 dark ink를 유지한다.

## 4. Shared Glide 계약

`docs/superpowers/specs/2026-08-11-futur-active-nav-indicator-design.md`의 승인된 A안을 그대로
구현한다. 데스크톱 `menuLinks`에는 하나의 `data-header-active-indicator`만 존재하며 x, width,
opacity를 GSAP timeline으로 이동한다. mobile은 기존 link-local indicator를 유지할 수 있도록
별도 장식 요소를 사용한다.

Shared Glide는 section change와 resize에만 측정·실행하고 scroll frame마다 link rect를 읽지 않는다.
Hero와 Footer에서는 숨기며 reduced-motion은 즉시 target geometry를 적용한다.

## 5. 테스트 계약

- Hero→Services 구간에서 scroll frame을 발생시킨 뒤 Header geometry write 수가 0에 가깝고,
  progress target이 바뀔 때만 write가 발생한다.
- viewport resize 뒤에는 새 width가 한 번 반영되고 stale custom property가 남지 않는다.
- Hero에서는 logo/nav ink가 white이고 Services·Stack·Team에서는 navy다.
- Services가 화면 중간에 보이더라도 top이 Header probe 아래에 있으면 Hero dark state를 유지하고,
  Services top이 probe를 통과한 뒤에만 light/Services state로 전환한다.
- glass의 기존 dark/light tint·filter 값은 바뀌지 않고 Hero border는 강한 pure-white rim이 아니다.
- text shadow와 `mix-blend-mode`가 없고 static/interactive axe를 통과한다.
- Services→Stack→Team에서 shared indicator의 실제 중간 x frame이 네 개 이상 관측된다.
- 빠른 retarget, reduced-motion, desktop resize, 390px mobile exclusion, no-JS, runtime, axe를 검증한다.

## 6. 완료 조건

- Hero→Services 경계에서 종료된 Header geometry tween이 재시작되지 않는다.
- 어두운 배경에서 glass가 글자를 분리하고 border만 흰색으로 뜨지 않는다.
- 데스크톱 활성 밑줄이 과하지 않은 200ms Shared Glide로 이어진다.
- Hero particle, mobile Island, cursor, 본문, FAQ, Footer, server/mail 경계가 유지된다.
