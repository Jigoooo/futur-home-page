# FUTUR Header Transition Polish 설계

## 1. 목적

Hero에서 서비스로 넘어갈 때 Header가 이미 최대 축소 상태인데도 scroll event마다 동일한 GSAP
target을 다시 전달하고, 고정 glass surface의 geometry와 shadow custom property를 반복 기록한다.
로컬 3000번 비교 계측에서는 109개 scroll frame 동안 Header style write가 2,178회 발생했다.

같은 Header는 Hero 같은 어두운 배경에서도 밝은 본문용 navy text와 강한 흰 border를 유지해,
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
- Hero particle engine, 70,000-particle tier, Services reveal choreography는 변경하지 않는다.

## 3. Dark / Light surface 계약

- `data-header-glass-tone='dark'`는 Hero와 운영 원칙에서 사용한다.
  - logo와 일반 nav text: 불투명도 0.9 이상의 near-white.
  - active/focus text: `--blue-2` 계열.
  - optical border: 흰색 단색이 아니라 낮은 alpha의 cool-blue rim.
  - inset highlight도 낮은 alpha로 제한한다.
- `data-header-glass-tone='light'`는 밝은 본문과 Footer에서 사용한다.
  - logo와 일반 nav text: 기존 navy.
  - active/focus text: 기존 accessible blue.
- text와 border의 전환은 `160ms power2.out`에 해당하는 `var(--ease-out)`로 제한한다.
- backdrop tint, blur, saturate, contrast 수치는 기존 Clear Crystal Glass 계약을 유지한다.
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
- Hero에서 computed logo/nav text는 밝고 border는 강한 pure-white rim이 아니다.
- Services에서 computed logo/nav text는 navy이고 active text는 accessible blue다.
- Services→Stack→Team에서 shared indicator의 실제 중간 x frame이 네 개 이상 관측된다.
- 빠른 retarget, reduced-motion, desktop resize, 390px mobile exclusion, no-JS, runtime, axe를 검증한다.

## 6. 완료 조건

- Hero→Services 경계에서 종료된 Header geometry tween이 재시작되지 않는다.
- 어두운 배경에서 Header 글자가 읽히고 border만 흰색으로 뜨지 않는다.
- 데스크톱 활성 밑줄이 과하지 않은 200ms Shared Glide로 이어진다.
- Hero particle, mobile Island, cursor, 본문, FAQ, Footer, server/mail 경계가 유지된다.
