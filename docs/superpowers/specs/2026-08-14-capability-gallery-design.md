# FUTUR Capability Gallery Design

## Status

Approved and implemented. 사용자가 선택한 1안에서 이미지 요소를 제거한 서비스 갤러리와 경계 없는 기술 인덱스를 현재 랜딩 계약으로 정의한다.

## Product Boundary

- 페이지 순서는 `Hero → Services → Technology → FAQ → Footer`다.
- Hero 문구·파티클·크기, 서비스 4개, 기술 분류 16개·기술 70개를 유지한다. FAQ 계약은 `2026-08-14-faq-accordion-design.md`가 대체한다.
- 고객·프로젝트·성과·후기·팀 인원·AI 모델 자체 개발 역량은 만들지 않는다.
- 서비스 카드에는 이미지·SVG·아이콘을 사용하지 않는다.

## Services Gallery

Services는 warm off-white 인트로와 border·shadow 없는 4개 capability card로 구성한다. desktop은 1번과 4번이 전폭, 2번과 3번이 반폭인 bento이며, `1180px` 이하에서 copy/image 세로 구조, `760px` 이하에서 한 열이 된다.

카드는 번호·제목·설명·범위만 포함한다. 전폭 카드는 제목·설명과 업무 범위를 비대칭 열로 나누고, 반폭 카드는 자연스러운 세로 흐름을 사용한다. 전체 카드가 최초 진입 시 한 번 나타나며 hover 장식을 추가하지 않는다. sticky index, chapter selection, surface gate와 curtain은 사용하지 않는다.

## Technology Index

Technology는 near-black surface와 hairline으로 구분한 4개 row다. 각 row는 번호·직군·설명과 viewport보다 넓은 대표 기술 띠를 갖는다. 대표 기술은 desktop에서도 `52px`을 넘지 않으며 본문을 압도하지 않는다. 모든 일반 모션 화면에서 기술 띠는 일정한 속도의 무한 marquee로 흐르고, 홀수·짝수 행은 서로 반대 방향으로 이동한다. hover와 focus-within에서는 일시 정지하며 pin, sticky, snap과 스크롤 진행 연동은 사용하지 않는다.

태블릿과 모바일에서도 marquee가 계속 동작해 애매한 중간 너비에서 멈추지 않는다. reduced motion에서는 transform 없는 정적 행을 제공한다. 기존 native `<details>`는 기본 닫힘 상태로 16개 분류와 70개 기술을 모두 제공한다.

## Pointer and Footer

운영체제 기본 포인터를 유지하고 custom ring/dot cursor와 전역 `cursor: none` 계약을 제거한다. Header의 surface tone 계산과 컨트롤별 hover·focus 피드백은 유지한다.

Footer CTA는 중앙 정렬된 `문의하기`만 표시하는 cobalt surface다. 기존 magnetic 외곽 이동과 liquid fill 내부 반응은 유지하고 reduced motion에서는 색상·outline만 사용한다.

## Verification Contract

- 이미지 없는 서비스 카드 4개, sticky index·surface gate 없음
- desktop asymmetric bento, `1180 / 900 / 390px` no overflow
- 기술 row·marquee 4개, 전체 분류 16개·기술 70개
- 기본 포인터, custom cursor DOM·dataset 없음
- Footer CTA의 불투명 배경과 광학적 중앙 정렬
- no-JS, reduced motion, keyboard, axe WCAG 2.2 AA, lint, build, 내부 브라우저 시각 QA
