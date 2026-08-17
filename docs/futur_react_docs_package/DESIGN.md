# DESIGN.md — FUTUR Landing Design System

> 이 문서는 FUTUR 랜딩 페이지의 디자인 기준서입니다. React 전환, 컴포넌트 구현, 애니메이션 조정, 반응형 수정 시 반드시 이 문서를 우선 기준으로 사용합니다.

---

## 1. 디자인 방향성

### 핵심 컨셉

```text
Approachable Technical Partner
```

FUTUR는 SI·외주 개발을 맡기려는 고객에게 “전문적이지만 부담스럽지 않은 개발 파트너”로 보여야 합니다. 따라서 디자인은 너무 엔터프라이즈처럼 딱딱하거나, 너무 스타트업 SaaS처럼 과하게 트렌디하면 안 됩니다.

### 키워드

- 여유로운
- 밝은
- 둥근
- 신뢰감 있는
- 친절한
- 기술적이지만 어렵지 않은
- 직접 문의하기 쉬운
- 운영까지 고려하는

### 피해야 할 느낌

- 사람 사진 중심의 에이전시 소개
- 촌스러운 파란색 그라데이션 남용
- 모든 카드가 같은 크기로 빽빽하게 나열되는 구조
- 너무 많은 fade/blur 애니메이션
- “AI가 만든 SaaS 템플릿” 같은 과한 3D/글로우
- 문구가 방어적으로 느껴지는 표현
  - 예: `사진 대신`, `실명 노출 없이도`

---

## 2. 브랜드 톤

### 브랜드 표기

기본 표기는 아래를 사용합니다.

```text
FUTUR.
```

- 마침표는 포인트 컬러 blue 사용 가능
- 로고를 과하게 꾸미지 않는다.
- 로고 이미지를 AI 이미지로 생성하지 않는다.
- 실제 구현에서는 텍스트 또는 SVG 워드마크로 관리한다.

### 카피 톤

문장은 짧고 명확하게 씁니다. 외주 문의자가 기술을 몰라도 이해할 수 있어야 합니다.

좋은 예:

```text
아이디어를 현실의 서비스로,
복잡한 업무를 쉬운 흐름으로.
```

```text
완성된 기획서가 없어도 괜찮습니다.
목표와 상황을 먼저 정리하고, 현실적인 개발 범위와 진행 순서를 함께 잡습니다.
```

피해야 할 예:

```text
최신 기술 스택과 완벽한 아키텍처를 기반으로 디지털 트랜스포메이션을 선도합니다.
```

이유: 외주 고객에게 부담스럽고 추상적입니다.

---

## 3. 색상 토큰

현재 v10 기준 색상 토큰입니다. React 전환 시 `styles/tokens.css`에 정의합니다.

```css
:root {
  --ink: #0a1330;
  --navy: #07183f;
  --navy-2: #10265f;
  --blue: #2f6bff;
  --blue-2: #7fa8ff;
  --sky: #72d8ff;
  --mint: #31c7a4;
  --violet: #8a70ff;
  --amber: #ffb95c;
  --rose: #ff7d9f;

  --muted: #66738d;
  --muted-2: #8792a8;
  --line: #e3ebf6;
  --line-2: #eef3f9;
  --surface: #ffffff;
  --soft: #f5f8ff;
  --bg: #fbfcff;
}
```

### 색상 사용 원칙

- 배경은 `--bg`, `--surface`, `--soft` 중심으로 밝게 유지한다.
- 핵심 CTA는 `--navy` 또는 `--blue`를 사용한다.
- `--blue`는 강조점에 사용하되 과도하게 넓은 면적에 쓰지 않는다.
- `mint`, `violet`, `amber`, `rose`는 작은 아이콘/태그/포인트에만 사용한다.
- 서비스 카드 상단에 알록달록한 꽉 찬 line을 반복하지 않는다.

---

## 4. 타이포그래피

### Font Stack

```css
font-family: Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

### 타이포 원칙

- 한글은 자간을 너무 좁히지 않는다.
- 큰 제목은 굵게 쓰되 문장 길이를 줄인다.
- 줄바꿈은 단어/맥락 기준으로 관리한다.
- `word-break: keep-all`을 기본으로 적용한다.

```css
body {
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### 권장 크기

```css
--text-hero: 68px;
--text-section-title: 50px;
--text-card-title: 22px;
--text-body-lg: 20px;
--text-body: 16px;
--text-small: 13px;
```

모바일에서는 아래 수준으로 줄입니다.

```css
--text-hero-mobile: 42px;
--text-section-title-mobile: 38px;
--text-body-mobile: 15px;
```

---

## 5. 레이아웃 / 여백

### Container

```css
.container {
  width: min(100% - 36px, 1180px);
  margin-inline: auto;
}
```

데스크톱에서는 1180px 기준을 사용하되, 모바일에서는 `min-width`를 강제하지 않습니다.

### Section Spacing

FUTUR 랜딩은 “숨쉬는 듯한 레이아웃”이 중요합니다.

```css
.section {
  padding-block: 180px;
}
```

권장 범위:

| 화면 | 섹션 상하 여백 |
|---|---:|
| Desktop | 160px ~ 200px |
| Tablet | 120px ~ 150px |
| Mobile | 88px ~ 120px |

주의:

- 정보가 타이트하게 몰려 보이면 섹션 여백을 줄이지 말고 카드 내부 정보를 줄인다.
- 카드 grid gap은 최소 18px 이상, 큰 카드 영역은 28px~44px를 권장한다.

---

## 6. Radius / Shadow

```css
:root {
  --radius-xl: 56px;
  --radius-lg: 44px;
  --radius-md: 30px;
  --radius-sm: 20px;

  --shadow: 0 32px 90px rgba(25, 45, 86, .10);
  --shadow-soft: 0 18px 54px rgba(25, 45, 86, .075);
  --shadow-hover: 0 36px 90px rgba(20, 42, 94, .16);
}
```

### 원칙

- 둥근 느낌은 유지하되 모든 요소가 과하게 말랑해 보이지 않게 한다.
- 큰 패널: 40px~56px
- 카드: 24px~34px
- 버튼: 999px pill
- 작은 icon box: 14px~20px

---

## 7. Motion System

### Easing

```css
:root {
  --ease: cubic-bezier(.16, 1, .3, 1);
  --spring: cubic-bezier(.2, 1.25, .34, 1);
}
```

### Duration

| 목적 | 시간 |
|---|---:|
| Button hover | 220ms ~ 320ms |
| Card hover | 260ms ~ 360ms |
| Section reveal | 620ms ~ 760ms |
| Tab content switch | 260ms ~ 380ms |
| Floating idle | 4s ~ 7s |

### 애니메이션 원칙

- 모든 요소에 fade/blur를 적용하지 않는다.
- 섹션 제목/큰 레이아웃만 reveal을 사용한다.
- 카드 hover는 `lift + shadow + arrow movement + inner glow` 정도로 제한한다.
- 버튼 hover는 outer hit-area를 움직이지 않는다.
- footer는 reveal 대상에서 제외한다.
- `prefers-reduced-motion`에서는 애니메이션을 제거하거나 최소화한다.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. 컴포넌트 디자인 가이드

### 8.1 Button

역할:

- 주요 CTA
- 보조 CTA
- 카드 내부 링크

원칙:

- 클릭 영역은 고정한다.
- hover 시 버튼 자체가 움직이지 않는다.
- 내부 label/arrow/highlight만 움직인다.
- hover 경계에서 흔들리지 않아야 한다.
- focus-visible을 반드시 제공한다.

상태:

| 상태 | 표현 |
|---|---|
| default | solid/navy 또는 white/line |
| hover | spotlight, arrow 이동 |
| active | 살짝 눌림 가능 |
| focus | blue ring |
| disabled | opacity + cursor not-allowed |

---

### 8.2 Card

기본 카드 hover:

```text
translateY(-6px)
shadow 강화
border-color 살짝 강조
icon tilt 또는 arrow 이동
```

주의:

- 모든 카드가 hover에서 같은 방식으로 움직이지 않아도 된다.
- 서비스 카드, 팀 카드, 프로세스 카드의 motion character를 다르게 둔다.
- 카드 내부 텍스트가 너무 조밀하면 card padding을 늘린다.

---

### 8.3 Custom Select

디자인:

- 흰색 또는 아주 연한 blue surface
- border는 `--line` 또는 약간 진한 `#d9e4f5`
- chevron은 우측 중앙 정렬
- option 간격은 충분히 넓게
- 선택 option은 check mark 또는 background로 표시

구조:

```text
Label
Trigger Button
Dropdown List
Options
Hidden Input or controlled value
```

주의:

- dropdown 배경이 흐릿해서 읽기 어려우면 안 된다.
- option이 서로 붙어 보이면 안 된다.
- keyboard navigation이 필요하다.

---

### 8.4 CheckboxTile

디자인:

- 왼쪽 정렬을 기본으로 한다.
- 체크 아이콘과 텍스트 baseline을 맞춘다.
- 카드 전체가 클릭 가능해야 한다.
- checked 상태는 background와 border 모두로 표시한다.

권장 구조:

```text
[check icon] title
             description
```

주의:

- 필요한 서비스/필요한 영역은 가운데 정렬하지 않는다.
- 문구가 줄바꿈되면 grid 너비, gap, title copy를 다시 조정한다.

---

### 8.5 StageSelector

Quick Brief의 현재 단계는 토글보다 “단계 카드”가 적합합니다.

권장 디자인:

```text
01  아이디어
    목표와 방향을 정리하는 단계

02  기획 중
    화면과 기능 범위를 구체화하는 단계

03  운영 개선
    기존 서비스의 문제를 개선하는 단계
```

원칙:

- 왼쪽 정렬
- 선택 상태는 border/background/index color로 표현
- radio input은 숨겨도 native 상태는 유지
- 모바일에서는 1열

---

### 8.6 Tabs

Case Stories 탭은 단순히 active class만 바꾸는 것이 아니라 실제 content data가 바뀌어야 합니다.

필수:

- `role="tablist"`
- `role="tab"`
- `role="tabpanel"`
- `aria-selected`
- `aria-controls`
- ArrowLeft / ArrowRight / Home / End 지원

Motion:

- 탭 자체는 pill highlight
- content는 짧은 slide/fade 정도
- 과한 blur 금지

---

### 8.7 TextField / TextArea

원칙:

- placeholder만으로 의미를 전달하지 않는다.
- label은 항상 보인다.
- focus ring은 선명해야 한다.
- helper text는 작은 크기지만 contrast가 너무 낮으면 안 된다.
- required는 `*`와 validation 모두로 표시한다.

---

### 8.8 Custom Cursor

사용 목적:

- 브랜드 감도 향상
- 버튼/카드 hover 시 짧은 label 제공

비사용 조건:

- 모바일/터치 환경
- `prefers-reduced-motion: reduce`
- 성능 저하 환경
- 폼 입력에 방해되는 경우

디자인:

- aura circle + small dot
- `data-cursor-text` hover 시 label 표시
- label 표시 시 dot은 숨긴다.

중요:

- 커스텀 커서는 기능을 설명하는 유일한 수단이면 안 된다.
- `mailto:`/`tel:`/브라우저 alert 이후 복구가 완벽하지 않으면 해당 링크 클릭 시 커서를 숨기고 다음 pointermove에서 다시 표시한다.
- 문제가 반복되면 primary CTA에서 커스텀 커서를 비활성화한다.

---

## 9. 섹션별 디자인 기준

### 9.1 Header

- Header는 viewport 상단에 고정된 하나의 glass surface를 사용한다.
- 데스크톱은 스크롤에 따라 폭과 높이만 연속적으로 정리하며 로고·서비스·기술·FAQ·문의 링크를 계속 노출한다.
- `561px ~ 900px`에서는 높이 `58px`의 Header에 로고·서비스·기술·FAQ·문의를 모두 표시한다.
- `560px` 이하에서는 너비 `calc(100% - 24px)`, 높이 `60px`의 `FUTUR. | 현재 섹션 | 문의` 구조를 사용한다.
- 현재 섹션은 중앙 masked lane에서 이전 `-9px`, 새 라벨 `+10px` 범위의 세로 롤링으로 교체한다.
- Hero와 Footer에서는 중앙 섹션명을 비우고, reduced motion에서는 즉시 교체한다.
- no-JS에서는 서비스·기술·FAQ·문의 전체 hash navigation을 노출한다.
- 실제 배경 surface가 Header 중간선을 통과할 때 light/dark glass tone을 전환한다.

### 9.2 Hero

목표:

- 첫 화면에서 FUTUR가 무엇을 하는지 바로 이해되어야 한다.

구성:

- 왼쪽: headline, description, CTA, 3개 포인트
- 오른쪽: 사람 사진 없이 project brief/system card/floating cards

주의:

- 우측 visual이 잘리지 않도록 overflow 확인
- floating card가 첫 렌더링에서 튀지 않게 `is-ready` 이후 idle animation 시작
- CTA는 `프로젝트 문의하기`, `사례 둘러보기`처럼 직접적이어야 한다.

### 9.3 Quick Brief

목표:

- 문의 진입장벽을 낮춘다.

구성:

- 왼쪽: “처음 문의할 때부터 부담 없게” 설명과 concern cards
- 오른쪽: 실제 선택 가능한 brief form

주의:

- `현재 단계`는 단계 카드형
- `필요한 영역`은 넓은 checkbox tile
- summary token은 선택 즉시 갱신

### 9.4 Services

목표:

- FUTUR가 할 수 있는 일을 명확히 보여준다.

카드:

- 웹·앱 개발
- 업무 시스템 구축
- 연동·API
- 운영·유지보수

주의:

- 4열로 좁게 밀지 않는다.
- 2x2를 기본으로 한다.
- 제목 줄바꿈이 어색하면 `.nowrap` 또는 copy 수정.

### 9.5 Case Stories

목표:

- 실제 프로젝트 유형별 결과를 보여준다.

탭:

- 업무 시스템
- 모바일 앱
- 연동·자동화

주의:

- 우측 visual과 텍스트가 겹치면 안 된다.
- 탭 전환 시 title, desc, metrics, list, visual label 모두 변경한다.

### 9.6 Team

목표:

- 실명/사진 없이도 역할과 경험으로 신뢰를 준다.

구성:

- PM
- Frontend
- Backend
- Mobile
- Ops
- UI/UX

주의:

- “사진 대신” 같은 문구 사용 금지
- 카드가 오밀조밀하지 않도록 2열 또는 여유로운 grid
- 직군, 경력, 위치, 강점, 경험, 태그를 분리해 읽기 쉽게 만든다.

### 9.7 Process

목표:

- 외주 진행 과정의 불안감을 줄인다.

단계:

1. 상담 및 분석
2. 기획 및 제안
3. 디자인 및 개발
4. 테스트 및 검증
5. 배포 및 운영

디자인:

- 세로 타임라인
- step card hover는 약하게
- 여백 충분히

### 9.8 Review

목표:

- 신뢰감 보강

주의:

- 후기는 너무 과장하지 않는다.
- 익명 처리 시 `김OO`, `이OO` 등 사용 가능.
- 별점은 과하게 크지 않게.

### 9.9 Contact

목표:

- 문의를 가장 쉽게 만든다.

구성:

- CTA card
- 상담 전 확인사항
- 실제 form

주의:

- form input은 contrast 충분히
- 필요한 서비스 checkbox는 왼쪽 정렬
- 개인정보 동의는 실제 checkbox state 유지
- 제출 후 result message 표시

### 9.10 Footer

목표:

- 사이트의 마무리와 마지막 문의 경로를 제공한다.

구성:

- top CTA card
- brand block
- service links
- project links
- company links
- contact links
- socials
- copyright

주의:

- footer top border와 CTA card 사이 gap이 답답하지 않아야 한다.
- social icon은 flex center 정렬한다.
- footer는 너무 밋밋하지 않게 subtle background 또는 top CTA로 강조한다.
- reveal animation 대상에서 제외한다.

---

## 10. 반응형 디자인

### Breakpoints

```css
@media (max-width: 1180px) {}
@media (max-width: 900px) {}
@media (max-width: 560px) {}
```

### Mobile 원칙

- 모든 큰 grid는 1열로 전환
- hero visual은 너무 크면 숨기거나 축소
- floating cards 일부 숨김 가능
- Quick Brief는 stage, needs, selects 모두 1열
- Contact form은 1열
- Footer는 1열 또는 2열 후 1열
- custom cursor는 비활성화

---

## 11. 접근성 기준

필수:

- focus-visible 스타일
- 충분한 contrast
- keyboard navigation
- label이 보이는 form
- aria-live는 요약/결과에만 사용
- 커스텀 select/tab은 ARIA role 적용
- reduced motion 대응

금지:

- hover에서만 정보 제공
- 색상만으로 상태 표시
- focus outline 제거
- placeholder만으로 label 대체
- 커스텀 커서 때문에 기본 조작 방해

---

## 12. 최종 QA 체크리스트

### Visual

- [ ] Hero 우측 비주얼이 잘리지 않는다.
- [ ] Section 사이 여백이 충분하다.
- [ ] Services 제목 줄바꿈이 어색하지 않다.
- [ ] Team cards가 오밀조밀하지 않다.
- [ ] Footer top border와 CTA card 사이 여백이 안정적이다.
- [ ] Social icon이 중앙 정렬되어 있다.

### Interaction

- [ ] Button hover가 흔들리지 않는다.
- [ ] Card hover는 lift/arrow/icon motion이 있다.
- [ ] CustomSelect option 간격과 chevron 정렬이 자연스럽다.
- [ ] CheckboxTile은 왼쪽 정렬이고 체크 상태가 명확하다.
- [ ] Case tabs가 실제로 내용 전환된다.
- [ ] Quick Brief summary가 갱신된다.
- [ ] Contact form이 입력/체크/제출된다.

### Cursor

- [ ] label 표시 시 dot이 숨겨진다.
- [ ] input hover에서 과한 cursor label이 뜨지 않는다.
- [ ] mailto/tel 클릭 후 다음 pointermove에서 복구된다.
- [ ] 모바일에서는 custom cursor가 없다.

### Responsive

- [ ] 1440px desktop
- [ ] 1180px narrow desktop
- [ ] 900px tablet
- [ ] 768px tablet
- [ ] 430px mobile
- [ ] 390px mobile

### Accessibility

- [ ] Tab key 이동 가능
- [ ] Arrow keys for tabs/select
- [ ] Escape closes select
- [ ] Focus visible 확인
- [ ] Reduced motion 확인

---

## 13. 참고 자료

- GDWEB 심사위원/평가기준: https://www.gdweb.co.kr/sub/judge.asp
- UX Patterns Getting Started: https://uxpatterns.dev/patterns/getting-started
- UX Patterns Checkbox: https://uxpatterns.dev/patterns/forms/checkbox
- UX Patterns Text Field: https://uxpatterns.dev/patterns/forms/text-field
- UX Patterns Selection Input: https://uxpatterns.dev/patterns/forms/selection-input
- UX Patterns Button: https://uxpatterns.dev/patterns/forms/button
- WAI-ARIA Select-Only Combobox Example: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
- MDN prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- MDN Intersection Observer API: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
