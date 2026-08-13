# FUTUR Technology Disclosure Motion Design

## Status

Approved direction. `기술 범위 전체 보기`를 긴 목록에 적합한 sticky reading rail과 curtain cascade disclosure로 개선하고, 대표 기술 marquee를 더 작고 빠르게 조정한다.

## Scope

- Technology 섹션의 대표 기술 marquee와 전체 기술 disclosure만 변경한다.
- 서비스 4개, 기술 역량 4개, 분류 16개, 기술 70개와 공개 문구는 유지한다.
- Hero, Services, FAQ, Footer, Header 내비게이션과 법적 페이지는 변경하지 않는다.
- 새 이미지, SVG 장식, 카드, 모달, 외부 모션 라이브러리는 추가하지 않는다.

## Selected Pattern

선택안은 `Sticky Reading Rail + Cascade Reveal`이다.

- 접힌 상태에서는 현재처럼 `기술 범위 전체 보기` 한 줄을 제공한다.
- 펼친 상태에서는 summary가 `기술 범위 접기`로 바뀌고 Header 아래에 sticky로 남는다.
- 전체 목록은 단순히 높이만 늘어나지 않고 위에서 아래로 면이 열리는 curtain reveal로 등장한다.
- 화면에 처음 보이는 기술 분류는 짧은 cascade로 등장하고, 아래쪽 분류는 viewport에 들어올 때 한 번만 나타난다.
- 목록을 읽는 동안 sticky summary를 눌러 언제든 닫을 수 있다.
- 닫을 때는 현재 읽기 위치가 FAQ나 Footer로 튀지 않도록 disclosure 시작점이 Header 아래에 오도록 스크롤을 정리한다.

## Disclosure Structure

기본 HTML은 native `<details>/<summary>`를 유지한다. JavaScript는 native 동작 위에 모션과 sticky 상태만 progressive enhancement로 추가한다.

- `details[data-technology-details]`: disclosure 상태와 no-JS fallback을 소유한다.
- `summary`: 실제 키보드 토글이며 펼침 상태에 따라 문구를 전환한다.
- `data-technology-disclosure-panel`: 높이와 curtain mask를 담당한다.
- `data-technology-group`: 각 분류의 최초 진입 reveal 단위다.
- `data-technology-disclosure-enhanced='true'`: JavaScript 모션이 연결된 상태다.
- `data-technology-disclosure-closing='true'`: 닫힘 애니메이션 중 native `open` 제거를 지연하는 상태다.

summary는 펼친 동안 `position: sticky`와 Header 아래 약 `96px` 기준을 사용한다. 좁은 화면에서는 Header 높이에 맞춰 약 `82px`로 조정한다. sticky summary는 별도 카드나 floating pill로 만들지 않고 Technology surface와 같은 near-black 면, 얇은 상·하단 hairline, 약한 backdrop 처리만 사용한다.

## Opening Motion

1. native `open` 상태가 먼저 적용되어 보조기술과 키보드 상태가 즉시 일치한다.
2. panel 높이는 `0 → auto`로 `480ms`, `var(--ease-in-out)`에 맞춰 열린다.
3. panel 내부 curtain은 `clip-path: inset(0 0 100% 0) → inset(0)`으로 `420ms` 동안 위에서 아래로 열린다.
4. 첫 viewport 안의 분류는 opacity `0 → 1`, translateY `16px → 0`으로 `360ms` 동안 등장하며 항목 간 지연은 `50ms`다.
5. 첫 viewport 아래의 분류는 기존 in-view observer 계약을 사용해 화면에 들어올 때 한 번만 같은 reveal을 실행한다.
6. summary의 실제 아이콘은 기존 아이콘 라이브러리의 ChevronDown 하나를 사용하고 `0deg → 180deg`, `280ms`로 회전한다. CSS 기호나 직접 만든 SVG는 사용하지 않는다.

blur, scale, bounce, glow, 글자별 분해와 지속 애니메이션은 사용하지 않는다.

## Closing Motion and Scroll Anchoring

- sticky summary를 누르면 기본 close를 잠시 막고 panel을 `300ms` 동안 위로 닫는다.
- 보이는 분류만 opacity와 translateY를 짧게 되돌리며 모든 16개 항목을 역순으로 길게 재생하지 않는다.
- panel이 닫히는 동안 disclosure 시작점이 Header 아래에 오도록 스크롤 위치를 함께 보정한다.
- close가 끝난 뒤 native `open` 속성을 제거하고 focus는 summary에 유지한다.
- 이미 닫히는 중 다시 입력되면 현재 프레임에서 열림으로 반전할 수 있어야 하며, 완료를 기다리는 입력 잠금은 만들지 않는다.

## Marquee Adjustment

- 데스크톱 대표 기술명: `clamp(28px, 2.8vw, 44px)`
- `560px` 이하: `clamp(24px, 7.4vw, 32px)`
- 기본 반복 시간: `20s`
- 홀수·짝수 행의 이동 방향 교차를 유지한다.
- hover와 focus-within에서 일시 정지한다.
- 페이지 scroll과 marquee 진행률은 연결하지 않는다.
- `1180px`, `900px`, `390px`를 포함한 모든 일반 모션 화면에서 자동 반복한다.

## Accessibility and Fallbacks

- summary는 native 키보드 동작과 접근성 트리를 유지한다.
- 열림 상태에서 문구는 `기술 범위 접기`, 닫힘 상태에서는 `기술 범위 전체 보기`다.
- focus-visible outline은 sticky 여부와 관계없이 유지한다.
- `prefers-reduced-motion: reduce`에서는 curtain, 높이 tween, cascade, 아이콘 회전과 marquee를 제거하고 즉시 최종 상태를 표시한다.
- JavaScript가 없으면 native `<details>`로 16개 분류와 70개 기술에 접근할 수 있다.
- 모션 중 panel 내용에 `aria-hidden`을 추가하지 않는다.
- 열림과 닫힘 중 focus를 강제로 다른 요소로 이동하지 않는다.

## Implementation Boundary

Technology 컴포넌트는 데이터 렌더링과 native disclosure markup만 소유한다. 신규 `useTechnologyDisclosureMotion` 훅은 open/close animation, interruption, scroll anchoring과 cleanup만 담당한다. 기존 공용 reveal observer는 viewport에 들어오는 분류를 한 번 보여주는 역할만 유지한다.

GSAP과 `@gsap/react`는 이미 프로젝트에 존재하므로 추가 의존성 없이 사용한다. marquee는 현재 CSS keyframe 구현을 유지하고 크기와 duration만 변경한다.

## Verification

- 닫힌 초기 상태와 summary의 native 키보드 토글을 확인한다.
- 열릴 때 panel height, curtain과 첫 분류 cascade가 정해진 순서로 한 번 재생되는지 확인한다.
- 긴 목록을 스크롤해도 summary가 Header 아래에 남는지 확인한다.
- 목록 중간에서 닫았을 때 FAQ나 Footer로 스크롤이 튀지 않고 summary에 focus가 유지되는지 확인한다.
- 열림·닫힘 중 반대 입력이 현재 프레임에서 자연스럽게 반전되는지 확인한다.
- `1280px`, `900px`, `390px`에서 marquee 크기와 `20s` 반복, hover·focus pause, 가로 overflow 부재를 확인한다.
- reduced motion과 no-JS에서 16개 분류와 70개 기술을 모두 읽을 수 있는지 확인한다.
- Technology 접힘·펼침·중간 스크롤 상태에서 axe WCAG 2.2 AA를 실행한다.

## Non-goals

- 기술 검색, 필터, 탭과 직군별 nested accordion
- 전체 화면 takeover, drawer 또는 modal
- 기술별 숙련도, 버전, 프로젝트 수치와 고객 근거
- 이미지, 아이콘 세트, 칩 구름과 장식용 그래픽
