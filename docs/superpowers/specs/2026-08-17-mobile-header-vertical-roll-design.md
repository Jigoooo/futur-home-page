# FUTUR 모바일 Header 세로 롤링 설계

> Approved on 2026-08-17. 이 설계는 `2026-08-17-mobile-header-active-section-design.md`의 “모바일 섹션명 즉시 교체” 계약을 대체한다. 반응형 노출 구조와 no-JS 전체 탐색 원칙은 그대로 유지한다.

## 1. 목적

`560px` 이하 Header의 중앙 섹션명은 현재 위치를 알려 주지만, 즉시 교체만으로는 FUTUR의 glass surface와 모션 언어에 비해 정적으로 보인다. 서비스·기술·FAQ 사이를 이동할 때 짧은 세로 롤링을 적용해 현재 위치 변화를 분명하게 보여 주되, 좁은 Header의 가독성과 탐색 안정성을 해치지 않는다.

React Bits의 Rotating Text가 사용하는 mask와 위·아래 교체 구조를 참고한다. React Bits나 Motion을 새로 설치하지 않고 프로젝트에 이미 포함된 GSAP으로 같은 원리를 작게 구현한다.

## 2. 적용 범위

- `560px` 이하의 서비스·기술·FAQ 현재 섹션명에만 적용한다.
- `561px` 이상에서는 기존 전체 메뉴와 shared active indicator를 그대로 사용한다.
- Hero와 Footer에서는 중앙 라벨을 비운다. 섹션 밖에서 별도 `홈`·`문의` 문구를 만들지 않는다.
- Header의 surface probe, glass tone, hash navigation과 문의 CTA는 변경하지 않는다.

## 3. DOM과 상태 권위

- `useAdaptiveHeader()`의 `activeHref`와 기존 `navigationItems`를 현재 섹션의 단일 권위로 유지한다.
- 서비스·기술·FAQ의 기존 anchor DOM을 그대로 사용한다. 별도의 복제 라벨이나 접근성용 중복 텍스트를 추가하지 않는다.
- 신규 `useMobileHeaderSectionRoll()` 훅은 현재 anchor와 직전 anchor의 짧은 표시 전환만 담당한다. URL이나 현재 섹션을 별도 React state로 복제하지 않는다.
- 강화 상태는 Header의 `data-header-mobile-roll="enhanced"`로 표시한다. 실행 중 상태는 `data-header-mobile-roll-state="idle|running|reduced"`로 노출해 CSS와 테스트가 같은 계약을 사용한다.
- `560px` 이하 강화 상태에서 비활성 anchor는 `inert`와 `aria-hidden="true"`를 함께 사용해 화면과 tab 순서에서 제외한다. 활성 anchor는 `aria-current="location"`을 유지한다.

## 4. 모션

- 중앙 라벨 viewport는 기존 Header 중앙 좌표를 유지하고 `overflow: clip`으로 위·아래 이동을 가린다.
- 이전 라벨은 `y: 0 → -9px`, `opacity: 1 → 0`으로 빠진다.
- 새 라벨은 `y: 10px → 0`, `opacity: 0 → 1`로 들어온다.
- 이전 라벨은 `180ms`, `power2.in`을 사용한다.
- 새 라벨은 이전 라벨 시작 후 `70ms`에 시작하며 `240ms`, `back.out(1.25)`를 사용한다.
- 전체 전환은 약 `310ms` 안에 끝난다. scale, blur, 글자별 분해, scramble, glow는 사용하지 않는다.
- Hero·Footer 진입은 이전 라벨의 퇴장만 실행한다. 해당 영역에서 서비스·기술·FAQ로 진입할 때는 새 라벨의 등장만 실행한다.
- 빠른 스크롤이나 연속 hash 이동이 발생하면 진행 중 timeline을 중단하고 현재 transform·opacity에서 다음 상태로 이어 간다. 완료 후 임시 inline style을 제거한다.

## 5. 접근성과 fallback

- 라벨은 native anchor로 유지한다. 현재 섹션 변화는 스크롤에 따른 위치 정보이므로 `aria-live`를 추가해 화면 읽기 사용자를 반복적으로 방해하지 않는다.
- `prefers-reduced-motion: reduce`에서는 timeline을 만들지 않고 활성 anchor를 즉시 표시한다.
- JavaScript가 없거나 hydration 전에는 `data-header-mobile-roll="enhanced"`가 없으므로 서비스·기술·FAQ·문의 전체 hash navigation을 표시한다.
- `prefers-contrast: more`와 backdrop-filter 미지원 환경의 색상·focus ring은 기존 Header 계약을 유지한다.
- viewport가 `560px` 경계를 오갈 때 timeline과 임시 속성을 정리하고, 태블릿 전체 메뉴의 접근성 상태를 즉시 복원한다.

## 6. 구현 경계

- 신규 훅은 모바일 섹션 라벨의 timeline, viewport media query, inert 정리만 소유한다.
- `HeaderSection`은 훅에 `headerRef`, `menuRef`, `activeHref`를 전달할 뿐 모션 명령을 직접 소유하지 않는다.
- Header CSS는 중앙 mask, 강화 상태와 reduced-motion 최종 상태만 소유한다.
- 신규 외부 의존성, SplitText plugin, Motion, 문자 분해 컴포넌트는 추가하지 않는다.
- Hero, Services, Technology, FAQ, Footer 콘텐츠와 데스크톱 Header 모션은 수정하지 않는다.

## 7. 검증 계약

- `560px`, `390px`, `320px`에서 서비스→기술→FAQ 이동 시 이전 라벨은 위로 빠지고 새 라벨은 아래에서 들어온다.
- 종료 상태에서 활성 라벨 중심과 Header 중심의 오차는 `1px` 이하다.
- Hero와 Footer에서는 중앙 라벨이 없고, 서비스·기술·FAQ에서는 하나만 보인다.
- 연속 전환 중 timeline이 누적되지 않고 최종 `aria-current`, inert, opacity와 transform이 정확하다.
- `561px`, `768px`, `900px`에서는 전체 메뉴와 shared indicator가 그대로 보이고 mobile roll 속성이 남지 않는다.
- reduced motion에서는 transform·transition 지연 없이 즉시 교체된다.
- no-JS에서는 전체 메뉴가 보이며 모든 hash link가 접근 가능하다.
- Header focused Playwright, runtime error, axe WCAG 2.2 AA, lint, typecheck와 build를 통과한다.
