# Hero–Services 전환 및 타이포그래피 설계

## 상태

승인·구현 기준 문서다. 이전 `2026-08-13-services-responsive-continuity-design.md`의 밝은 Services 인트로와 tablet/mobile 인덱스 설계를 대체한다.

## 목표

- Hero의 문구·크기·particle 형태와 pointer 반응은 유지한다.
- Hero 말미에서 particle만 사라지고 전면 어두운 Services 인트로로 이어지게 한다.
- 첫 서비스 진입 시 흰 surface가 열리며 desktop `40:60` 구조로 전환한다.
- 서비스 1–4는 선택 UI가 아닌 읽기 위치 표시로만 사용한다.
- 한글과 영문 display의 역할을 분리하되 모든 폰트는 로컬로 제공한다.

## Hero 출구

Hero의 보이는 높이를 viewport와의 교차 높이로 계산한다. 가시 비율 `0.62` 이상은 opacity `1`, `0.16` 이하는 `0`, 중간은 선형 보간해 `--hero-particle-exit-opacity`에 기록한다. 쓰기는 scroll·resize 이벤트마다 직접 실행하지 않고 `requestAnimationFrame`으로 제한한다.

기존 renderer 정지·재개 임계값 `0.16 / 0.24`, visibility change, WebGL context loss, reduced-motion·Save-Data fallback은 유지한다.

## Services 전환

인트로는 `#202523 → #090B10` 세로 gradient와 Hero의 왼쪽 콘텐츠 축을 사용한다. 제목과 설명은 `20px` 아래에서 한 번 등장하며 각각 `620ms / 520ms`, 설명은 `90ms` 늦게 시작한다.

첫 챕터의 흰 surface는 article의 어두운 `::before` curtain이 `820ms` 동안 왼쪽으로 빠지며 열린다. hydration 시 curtain이 역방향으로 닫히지 않아야 하고, 한 번 열린 article은 다시 숨지 않는다. no-JS에서는 curtain이 화면 밖에 있고 reduced motion에서는 제거한다.

## 진행 표시와 반응형

- `1181px+`: 왼쪽 `40%` `100svh` sticky 진행 표시, 오른쪽 `60%` 서비스 챕터
- `1180px-`: 진행 표시 `display: none`, 한 열 챕터
- `561–1180px`: 챕터 최소 `68svh`
- `560px-`: 콘텐츠 자연 높이

진행 표시는 `<aside aria-hidden='true'><ol>`로 렌더링한다. 링크, 버튼, focus, hover, `aria-current`, hash 동기화가 없다. 현재 챕터는 `data-current='true'`와 색상 차이만 사용한다. `service-*` ID는 Footer 링크와 직접 접근을 위해 유지한다.

## 표면 계약

Header는 `[data-landing-section]`으로 메뉴 위치를 계산하고 `[data-header-surface='dark|light']`로 잉크 톤을 별도로 계산한다. 표면 probe는 실제 Header 하단 `8px` 지점이다.

- dark: Hero, Services 인트로, Technology, Footer
- light: 서비스 챕터 레이아웃, FAQ

custom cursor는 같은 surface 구간에서 dark surface에는 밝은 cursor, 흰 surface에는 어두운 cursor를 사용한다.

## 타이포그래피

- 한글·본문·메뉴·기술명: `SUIT Variable`
- Hero H1·FUTUR 로고·서비스 번호: `Space Grotesk Variable`
- 한글 fallback: `FUTUR Sans Critical`
- runtime 외부 CDN 요청 없음

굵기와 자간은 Hero `700 / -0.035em`, 대형 한글 `800 / -0.032em`, 중간 제목 `700–760`, 메뉴 `650–700`, 본문 `450–520`을 기준으로 한다.

## 제외 범위

Hero 문구·크기, 서비스·Technology·FAQ·Footer 문구와 페이지 순서, particle 수·형태는 바꾸지 않는다. 이미지·SVG 장식·사례·고객 로고·성과 수치와 새 모션 의존성을 추가하지 않는다.
