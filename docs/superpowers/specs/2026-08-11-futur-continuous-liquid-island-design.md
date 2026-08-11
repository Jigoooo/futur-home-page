# FUTUR Continuous Liquid Island 설계

## 1. 목적

현재 Adaptive Island는 데스크톱에서 Hero 전체 메뉴를 `220×58px` Compact 버튼으로 교체하고,
모바일에서는 Compact를 `370×158px` 메뉴로 펼친다. 브라우저 계측 결과 두 전환 모두 중간
geometry가 재생되지 않고 마지막 프레임에서 점프한다. 또한 흰색 tint와 두 pseudo layer가
겹쳐 배경이 거의 보이지 않는 불투명한 frosted panel로 보인다.

이번 변경은 다음 결과를 만든다.

- 데스크톱에서는 로고와 다섯 개 메뉴를 항상 보여준다.
- 스크롤 정도에 따라 상단바 전체가 소폭, 연속적으로 축소된다.
- 모바일에서는 Compact와 3+2 메뉴 구조를 유지하되 실제 중간 프레임이 보이는 단일 timeline을
  사용한다.
- 유리 뒤의 Hero particle과 본문 색이 식별되는 clear crystal glass로 조정한다.
- 문의 UI 제거, Hero particle, ring/dot cursor, Footer 및 문의 server/model/config 경계는 변경하지
  않는다.

## 2. 현재 결함과 근거

2026-08-11 포트 3000의 실제 브라우저에서 다음을 확인했다.

- 데스크톱에서 `scrollY`가 48px을 넘은 직후 Header는 `1327×76px`에서 `220×58px`로 바뀌었다.
- 같은 프레임에 메뉴는 `297×44px`에서 `1×1px` clip 상태가 됐다.
- Compact 메뉴 열기는 약 360ms 동안 `scaleX(0.268) scaleY(0.853)`에 고정된 뒤
  `820×68px`로 점프했다.
- 모바일 열기는 약 315ms 동안 `220×56px`, `scaleX(0.595) scaleY(0.354)`에 고정된 뒤
  `370×158px`로 점프했다.
- 원인은 paused 상태로 만든 Flip animation을 상위 timeline에 넣어 실제 geometry 보간이
  진행되지 않는 구조다. 현재 E2E는 최종 geometry와 indicator scale을 검사하지만 Header의
  연속 중간 프레임은 검사하지 않는다.
- glass base는 dark surface에서 alpha `0.46`이고, `::before` opacity `0.72`, `::after`
  opacity `0.62`가 추가로 겹친다. 결과는 clear liquid glass가 아니라 불투명한 회색 panel이다.

## 3. 범위와 비범위

### 기존 설계와의 관계

- 이 문서는 루트 `DESIGN.md`와
  `docs/superpowers/specs/2026-08-11-futur-adaptive-island-header-design.md`의 Header 상태,
  geometry, motion, glass 계약만 대체한다.
- 공개 문의 UI와 `#contact` 제거, 문의 server/model/config/mail/legal 보존 경계는 기존 Adaptive
  Island 설계를 그대로 따른다.
- Hero particle, custom cursor, 본문 section, FAQ, Footer의 기존 디자인 계약은 이 문서가
  변경하지 않는다.

### 포함

- Header 상태 모델과 motion ownership 단순화
- 데스크톱 scroll-linked scale
- 모바일 Compact 열기·닫기 timeline
- glass tint, rim, specular, shadow 조정
- 활성 섹션 표시, 접근성, no-JS, reduced-motion 유지
- 중간 프레임을 검증하는 E2E와 fresh visual QA

### 제외

- Hero particle engine·shader 변경
- 커스텀 cursor 구조 변경
- 본문 section 디자인 변경
- 채팅 FAB 추가
- 문의 UI 또는 `#contact` 복원
- 문의 server/model/config/mail/legal 경계 변경
- 새 animation 또는 UI dependency 추가

## 4. 상태 모델

데스크톱과 모바일의 책임을 분리한다.

### 데스크톱: `desktop-fluid`

- viewport가 901px 이상이면 로고와 서비스, 기술, 팀, 프로세스, FAQ를 항상 노출한다.
- 별도의 Compact 버튼과 Expanded close control을 사용하지 않는다.
- DOM과 접근성 tree는 스크롤 중 바뀌지 않는다.
- 활성 섹션 underline과 glass tone만 현재 section에 맞춰 갱신한다.

### 모바일: `mobile-compact | mobile-expanded`

- viewport가 900px 이하이면 `mobile-compact`로 시작한다.
- Compact 전체가 실제 button이며 현재 위치, `aria-expanded`, `aria-controls`를 제공한다.
- 열리면 다섯 메뉴와 close controller를 노출한다.
- 메뉴 선택, 바깥 pointer, Escape, 열린 뒤 24px scroll로 닫는다.
- 닫힘과 viewport 전환의 focus ownership 계약은 현재 구현보다 약화하지 않는다.

## 5. 데스크톱 scroll-linked motion

스크롤 진행률은 다음과 같다.

```text
progress = clamp(scrollY / 160, 0, 1)
```

- visual width scale: `1 → 0.92`
- visual height: `76px → 약 68px`
- horizontal padding과 menu gap: 시작값 대비 약 10% 감소
- radius: `28px → 24px`
- shadow는 Hero의 넓고 옅은 값에서 본문의 조금 짧고 선명한 값으로 보간한다.
- logo와 menu typography는 읽기 크기를 유지하고, shell 축소로 인한 왜곡이 보이지 않도록
  content scale 보정을 적용한다.

fixed outer positioner는 전체 hit area와 중앙 정렬을 소유하고, inner glass shell만 축소한다.
scroll handler는 passive listener에서 최신 `scrollY`만 저장하고 한 번의 `requestAnimationFrame`에서
CSS custom property 또는 GSAP quick setter를 갱신한다. scroll frame마다 React state, DOM query,
width·height layout write를 반복하지 않는다.

desktop motion은 진행률을 따라가되 약 `180~240ms`의 짧은 follow response를 사용한다. 빠르게 위로
돌아가도 현재 값에서 자연스럽게 반전하며 overshoot, bounce, snap은 사용하지 않는다.

## 6. 모바일 열기·닫기 motion

기존 paused Flip은 완전히 제거한다. 한 animation owner가 shell과 menu를 함께 제어한다.

### 열기

- 시작: `220×56px`
- 종료: `calc(100% - 20px)`, 최대 `370×158px`
- duration: `320ms`
- easing: bounded `power3.inOut`
- menu item: `opacity 0 → 1`, `translateY(6px) → 0`, `28ms` stagger
- active indicator: menu가 읽히기 시작한 뒤 짧게 따라붙되 overshoot하지 않는다.

### 닫기

- duration: `280ms`
- menu opacity를 먼저 낮추고 shell은 현재 geometry에서 Compact로 돌아간다.
- 닫힘 후 inline transform, width, height, opacity를 모두 정리한다.

열림 도중 닫기, 닫힘 도중 열기, 반복 입력은 이전 animation을 단순 취소하고 현재 computed 상태에서
반대 timeline을 시작한다. 마지막 프레임까지 기다렸다가 상태를 점프시키지 않는다.

## 7. Clear Crystal Glass

단일 `data-header-glass` surface 원칙은 유지한다.

### 기본 tint

- dark Hero·운영 원칙: 흰색 alpha `0.18`을 기준으로 조정
- 밝은 본문: 흰색 alpha `0.26`을 기준으로 조정
- blur: `18~22px`
- saturate: 약 `135%`
- contrast: 약 `1.03`

### 표면 구성

- 현재 전체 표면을 덮는 높은 opacity의 흰색 gradient는 제거한다.
- 1px optical rim, 위쪽 가장자리의 얇은 specular highlight, 약한 inner shadow만 사용한다.
- pointer reflection은 fine pointer와 no-preference motion에서만 낮은 opacity로 이동한다.
- 하단 progressive blur는 배경을 가리지 않는 낮은 opacity로 제한하거나 제거한다.
- 배경 particle과 section color가 glass 뒤에서 형태와 색으로 식별돼야 한다.

### fallback

- `backdrop-filter` 미지원 및 `prefers-contrast: more`에서만 alpha 약 `0.92`의 불투명 표면을
  사용한다.
- coarse pointer와 reduced-motion에서는 reflection을 정적 중심값으로 둔다.

## 8. 접근성과 대체 경로

- desktop nav는 항상 접근성 tree와 tab order에 존재한다.
- mobile closed nav와 nonfunctional controls는 접근성 tree와 tab order에서 제거한다.
- mobile expanded close controller는 현재 위치를 포함한 name, `aria-expanded=true`,
  `aria-controls`를 제공한다.
- viewport 전환 시 hidden element에 focus가 남지 않으며 외부 focus를 빼앗지 않는다.
- reduced-motion은 desktop 진행률과 mobile 상태를 animation 없이 즉시 반영한다.
- JavaScript 비활성 상태에서는 desktop 전체 nav와 mobile의 정적 3+2 메뉴를 노출한다.
- hash target offset은 mobile Compact와 desktop 최종 visual height를 기준으로 유지한다.

## 9. 회귀 테스트

### 데스크톱

- 0, 40, 80, 120, 160px에서 menu와 logo가 모두 보이고 접근 가능하다.
- scroll progress에 따라 shell scale과 radius가 단조롭게 변한다.
- 최소 5개 이상의 서로 다른 중간 크기를 관측한다.
- 위로 반전했을 때 값이 연속적으로 복원되고 inline transform이 남지 않는다.

### 모바일

- 열기·닫기 동안 `requestAnimationFrame`마다 geometry를 수집한다.
- 최소 5개 이상의 서로 다른 width와 height를 관측한다.
- 80ms 이상 같은 중간 geometry에 멈추지 않는다.
- 마지막 표본과 직전 표본 사이에 큰 geometry jump가 없다.
- 약 120ms 지점에서 반대 입력을 주어도 현재 프레임에서 반전한다.
- 종료 후 GSAP inline transform, width, height, opacity가 남지 않는다.

### 공통

- active section, keyboard, focus return, outside click, Escape, 24px dismiss를 유지한다.
- reduced-motion, no-JS, high-contrast, backdrop-filter fallback을 유지한다.
- Hero particle, ring/dot cursor, runtime error, axe WCAG 2.2 AA를 통과한다.
- 1280×720과 390×844에서 Hero, 밝은 본문, 운영 원칙의 closed/open 상태를 캡처한다.
- glass 뒤 배경 가시성, text contrast, horizontal overflow를 직접 검사한다.

## 10. 완료 조건

- 데스크톱에서 메뉴가 사라지지 않고 스크롤 정도에 따라 소폭 연속 축소된다.
- 모바일에서 멈춤 뒤 점프하는 프레임이 없다.
- glass 뒤의 particle과 section color가 명확히 보인다.
- animation interruption, 접근성, no-JS, reduced-motion 계약이 회귀하지 않는다.
- 대상 E2E, 전체 E2E, lint, build, graphify update, diff-check가 통과한다.
- 새 dependency와 공개 문의 UI가 추가되지 않는다.
