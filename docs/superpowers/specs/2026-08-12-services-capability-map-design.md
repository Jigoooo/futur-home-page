# Services Capability Map Design

## Goal

`Our Services` 섹션을 독립 카드 모음에서 `Build → Connect → Operate`로 이어지는 하나의 역량 흐름으로 바꾼다. FUTUR가 화면 제작뿐 아니라 시스템 연결과 출시 이후 운영까지 맡는다는 사실을 한 번에 이해할 수 있어야 한다.

## Approved direction

이번 작업은 조사안 A인 연결형 Capability Map만 구현한다. B안 비대칭 Bento와 C안 서비스 인덱스는 이 결과와 섞지 않고 이후 별도 시안으로 만든다.

## Information architecture

서비스는 다음 세 단계로 묶는다.

1. `BUILD / 기반을 만듭니다.`
   - 웹·앱 개발
   - 업무 시스템 구축
2. `CONNECT / 필요한 기술을 연결합니다.`
   - 연동·API
   - AI 통합·AX
3. `OPERATE / 출시 이후까지 운영합니다.`
   - 운영·유지보수

AI 통합·AX는 기존 AI 모델과 API를 이용한 챗봇, 문서 검색, 업무 자동화 통합을 의미한다. 자체 AI 모델 개발이나 학습을 제공한다고 표현하지 않는다.

## Layout

- 기존 왼쪽 소개문과 오른쪽 서비스 영역의 큰 2열 구도는 유지한다.
- 오른쪽은 하나의 큰 흐름 표면으로 만들고 세 단계를 세로로 쌓는다.
- 각 단계는 번호, 영문 단계명, 한국어 설명, 해당 서비스 항목으로 구성한다.
- 단계 사이를 하나의 세로 레일로 연결해 구축부터 운영까지 이어지는 책임 범위를 보여준다.
- 독립 서비스 항목에는 별도 흰색 카드, 큰 그림자, 개별 spotlight를 사용하지 않는다.
- 데스크톱에서는 한 단계 안의 서비스 두 개를 2열로, 모바일에서는 1열로 배치한다.

## Visual language

- Hero와 현재 랜딩 페이지의 짙은 네이비 타이포그래피와 밝은 쿨 그레이 배경을 유지한다.
- 강조색은 기존 블루 한 가지로 통일한다.
- 단계 구분은 여백과 얇은 선을 우선하고, 둥근 흰색 카드의 반복을 줄인다.
- 아이콘은 현재 Lucide 매핑을 재사용하되 작은 보조 표시로만 사용한다.

## Interaction and motion

- 섹션 진입은 기존 `data-landing-reveal` 시스템을 재사용한다.
- 흐름 표면이 나타날 때 연결 레일이 위에서 아래로 한 번 그려진다.
- 포인터 hover에서는 해당 단계의 배경, 번호, 레일 지점만 절제해서 강조한다.
- 서비스 항목은 클릭 동작이 없으므로 커서, 링크, 버튼, `tabIndex`를 추가하지 않는다. 따라서 의미 없는 focus 상태도 만들지 않는다.
- coarse pointer와 `prefers-reduced-motion: reduce`에서는 불필요한 이동과 레일 드로잉 애니메이션을 제거한다.

## Accessibility and responsive behavior

- 단계는 순서가 있는 목록으로, 각 서비스는 `article`로 표현한다.
- hover가 없어도 모든 정보가 항상 보인다.
- 390px 모바일에서 가로 스크롤이 생기지 않아야 한다.
- 확대/축소와 reduced motion에서도 단계 순서와 텍스트가 유지되어야 한다.

## Verification

- E2E에서 단계 순서 `BUILD → CONNECT → OPERATE`와 서비스 분포 `2 → 2 → 1`을 확인한다.
- 서비스 5개와 AI 통합·AX 설명을 확인한다.
- 기존 spotlight 카드 속성이 제거되었는지 확인한다.
- 데스크톱 hover, 390px 모바일 폭, reduced motion, 정적 접근성 스캔을 확인한다.
- 관련 Playwright 테스트, lint, build, `graphify update .`를 실행한다.
