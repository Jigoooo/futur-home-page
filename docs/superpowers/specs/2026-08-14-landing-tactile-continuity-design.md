# FUTUR Landing Tactile Continuity Design

## Status

Superseded. Hero·정적 FAQ·독립 법적 페이지 계약은 유지하지만 Services surface gate와 Technology 스크롤 스택은 `2026-08-14-capability-gallery-design.md`로 대체된다.

## Product Boundary

- 최종 순서는 `Hero → Services → Technology → FAQ → Footer`다.
- Hero의 문구, 크기, particle 수·형태·pointer 반응은 변경하지 않는다.
- 서비스 4개, 기술 분류 16개와 기술 70개, FAQ 3개를 유지한다.
- 고객·프로젝트·성과·후기·팀 인원·AI 모델 자체 개발 역량을 만들어내지 않는다.

## Hero–Services Surface Contract

Services 인트로는 Hero와 같은 `#202523`을 쓰고 그라디언트와 경계선을 사용하지 않는다. 서비스 레이아웃은 `#FBFCFF` 전폭 surface며 desktop의 약 `40:60` 구성은 정보 배치만 나눈다.

첫 레이아웃에서 `data-service-surface-gate`가 밝은 면을 덮고, `data-service-surface-curtain`이 desktop `820ms`, tablet·mobile `520ms` 동안 위로 열린다. 전환은 최초 한 번만 재생하고 완료 시 `landing-surface-change`로 Header·cursor tone을 재계산한다. no-JS와 reduced motion에서 콘텐츠를 가리지 않는다.

Desktop 진행 표시는 비조작형 `<aside><ol>`이다. 현재 챕터는 `data-current='true'`와 색상으로만 구분하고 tablet·mobile에서는 숨긴다.

## Technology Stack Contract

네 개의 Capability Sheet는 번호, 역량명, 설명, 대표 기술 평문으로 구성한다. desktop `1181px` 이상에서만 native sticky를 쓰고 다음 sheet의 스크롤에 맞춰 이전 sheet의 scale을 `1 → 0.965`, brightness를 `1 → 0.72`로 줄인다. GSAP ScrollTrigger는 scrub만 담당하며 pin·snap을 추가하지 않는다.

`1180px` 이하, no-JS, reduced motion에서는 transform이 없는 세로 목록으로 보인다. native `<details>`는 스택 아래에서 기본 닫힘을 유지하고 전체 16개 분류·70개 기술을 키보드와 no-JS에서도 제공한다.

## FAQ and Footer Contract

FAQ는 `<ol>` 안의 정적 Q&A 3행이다. button, `aria-expanded`, 숨긴 panel, 둥근 카드와 아이콘을 사용하지 않는다. desktop은 번호 / 질문 / 답변 3열, tablet·mobile은 세로 흐름으로 배치한다.

Footer의 주 CTA는 기존 mailto를 유지하는 `문의하기` Button이다. 포인터 위치에서 차오르는 liquid fill과 최대 `6px` magnetic 이동을 분리된 내·외부 surface로 구현한다. 터치와 키보드에서는 press·focus 피드백을 유지하고 reduced motion에서 이동을 제거한다. 이메일은 작은 연락처로 유지하고 서비스 탐색 nav는 제거한다.

## Legal and Scrollbar Contract

`/privacy`, `/terms`는 모달이 아닌 독립 페이지다. 한국어 회사명은 `퓨터`, 영문 브랜드는 `Futur`로 표기하고 문서 메타데이터에도 같은 계약을 적용한다.

`PageScrollbar`는 landing·privacy·terms에 공유하되 fine pointer, `901px` 이상, no reduced motion일 때만 활성화한다. 활성 상태에서만 native scrollbar를 숨기고 track click, thumb drag, idle fade를 제공한다. mobile·coarse pointer·reduced motion·no-JS는 native scrolling을 유지한다.

## Verification Contract

- `data-landing-section`: `hero, services, technology, faq, footer`
- Hero·Services intro의 동일한 배경과 전폭 밝은 service surface
- desktop 40:60 sticky, `1180 / 900 / 390px` 세로 레이아웃과 no overflow
- Capability Sheet 4개, 전체 분류 16개, 기술 70개
- 정적 FAQ 3개, Footer mailto CTA, 작은 이메일, 서비스 nav 제거
- 독립 legal route, `퓨터 / Futur`, PageScrollbar 활성 조건
- no-JS, reduced motion, keyboard, axe WCAG 2.2 AA, lint, build, 내부 브라우저 시각 QA
