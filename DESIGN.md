---
name: FUTUR Landing
description: 풀스크린 파티클 Hero와 둥근 솔리드 장면이 이어지는 B2B 개발 파트너 랜딩
colors:
  charcoal: '#202523'
  paper: '#F3F1EC'
  paper-cool: '#E9ECEC'
  haze-slate: '#909EAE'
  haze-blue: '#5C8DC5'
  haze-taupe: '#AD9E90'
  haze-olive: '#736F60'
  muted: '#545C58'
typography:
  family: 'Wanted Sans Variable, Wanted Sans, FUTUR Sans Critical, Apple SD Gothic Neo, Noto Sans KR, system-ui, sans-serif'
  hero: 'clamp(56px, 5.6vw, 80px)'
  section: 'clamp(40px, 4.3vw, 55px)'
  body: '16px–19px'
radius:
  scene: '30px–72px'
  button: '999px'
---

# Design System: FUTUR Cinematic Editorial

## Authority

이 문서는 현재 랜딩의 최종 디자인 권위다. 구현 기준은 `src/pages/landing/ui/landing-page.tsx`, 디자인 토큰은 `src/styles/tokens.css`, 섹션별 형태와 모션은 각 CSS Module 및 `use-landing-scene-motion.ts`에 있다.

`docs/futur_react_docs_package/DESIGN.md`는 이전 패키지의 역사적 참고자료이며 현재 구현의 권위가 아니다. 두 문서가 충돌하면 이 루트 문서와 현재 소스를 따른다.

## Creative Direction

첫 화면은 파티클이 화면 전체를 채우고, 이후 장면은 paper와 charcoal 위에 둥근 솔리드 재료가 이어지는 Cinematic Editorial 흐름이다. 섹션을 똑같은 카드 묶음이나 전체 화면 슬라이드로 만들지 않는다. 장면마다 형태와 움직임이 해당 내용의 의미를 설명해야 한다.

최종 문서 순서는 다음과 같다.

1. Hero
2. 품질 기준
3. 제공 영역
4. 검토 방식
5. 진행 방식
6. FAQ
7. 문의
8. Footer

주요 내비게이션 앵커는 `#quality`, `#services`, `#review`, `#process`, `#faq`, `#contact`다.

## Color and Material

- **Charcoal**은 Hero와 문의의 깊은 바탕, 주요 텍스트와 잉크 역할을 맡는다.
- **Paper / Paper Cool**은 긴 문서를 읽는 기본 표면과 섹션 간 낮은 톤 변화를 만든다.
- **Haze Slate / Blue / Taupe / Olive**는 파티클 깊이, 솔리드 장면, 포커스와 선택 상태에 제한적으로 쓴다.
- 품질 기준, Layered Merge, 검토 장면, 문의 표면은 큰 둥근 덩어리로 구성한다. 내부 정보 행은 선과 간격으로 정리하고 모든 요소를 개별 카드로 만들지 않는다.
- 그림자는 재료의 깊이나 실제 overlay 계층을 설명할 때만 사용한다.

## Typography

영문 Hero와 한국어 제목, 본문, 내비게이션, 폼은 모두 self-hosted Wanted Sans 계열을 사용한다. 별도의 압축 영문 display 글꼴은 사용하지 않는다.

- Hero 문구는 정확히 `BUILT FOR WHAT’S NEXT.`이며 `BUILT FOR`와 `WHAT’S NEXT.` 두 행으로 렌더링한다.
- 데스크톱 Hero 제목은 최대 `80px`, 주요 섹션 제목은 최대 약 `55px`를 기준으로 한다.
- 제목은 짧고 단단한 행으로, 본문은 `word-break: keep-all`과 넉넉한 행간으로 조판한다.
- 한국어 제목 자간은 `-0.04em`보다 좁게 만들지 않는다.

## Hero: Full-screen Particle Surface

Hero는 `100vw × 100svh`의 charcoal 표면이다. WebGL2 파티클 canvas가 전체 면을 채우고, 문장과 CTA는 그 위의 실제 HTML로 남는다. canvas는 장식이며 `aria-hidden`이다.

- 헤드라인, 설명, CTA는 SSR과 WebGL 초기화 전에도 읽을 수 있어야 한다.
- 포인터 반응은 canvas 안에서만 활성화한다.
- Hero가 viewport 밖에 있거나 문서가 숨겨지면 렌더링을 멈추고 다시 보일 때 재개한다.
- `prefers-reduced-motion`, Save-Data, WebGL 초기화 실패, context loss에서는 정적 또는 fallback 표면을 사용한다.
- fallback에서도 Hero 높이, 대비, 문장과 문의 CTA를 보존한다.

## Section Scenes

### Quality Standard

하나의 큰 charcoal rounded stage와 두 개의 솔리드 orb로 보이는 경험과 제품 구조를 같은 품질 문제로 표현한다. 텍스트는 장면 안에 직접 놓이며 별도 카드 열로 분해하지 않는다.

### Services: Layered Merge

네 개의 haze layer와 중앙 core가 하나로 모이는 Layered Merge를 사용한다. 이는 화면, 코드, 데이터, 운영이 합쳐져 하나의 제품이 된다는 의미다. 서비스 목록은 옆의 큰 행 구조로 이어진다.

### Review

Taupe rounded surface 안에 원형 mask와 네 검토 그룹을 배치한다. 곡면의 확장과 행 reveal이 기준을 따라 검토 범위가 드러나는 흐름을 만든다.

### Process

다섯 단계 사이를 곡선 SVG path로 연결한다. 스크롤 진행에 맞춰 선과 marker가 이동하며, 섹션을 pin하거나 한 화면씩 교체하지 않는다.

### FAQ and Contact

FAQ는 조용한 accordion 행으로 유지한다. 문의는 하나의 큰 charcoal rounded surface 안에 안내, 실제 radio·checkbox·combobox·input·textarea와 전송 상태를 구성한다. 선택 항목과 입력 필드는 장식용 카드가 아니라 실제 폼 상태를 보존한다.

## Motion Contract

GSAP enhancement는 초기 HTML 뒤에 lazy-load한다. 섹션마다 다음과 같이 다른 움직임을 사용한다.

- 품질 기준: 원형 clip reveal과 orb parallax
- 제공 영역: 네 layer의 merge, core 등장, 서비스 행 reveal
- 검토 방식: 원형 mask 확장과 검토 그룹 reveal
- 진행 방식: 곡선 path draw와 marker 이동
- 문의: ellipse reveal과 폼 그룹 reveal

일반 scene, hover, press, return은 `power3.out` 또는 선형 scrub을 사용한다. `back.out(2.2)`는 버튼 arrow hover 진입, `back.out(2)`는 버튼 press release에만 허용한다. 버튼이 아닌 컨트롤이나 섹션 모션에 spring easing을 확장하지 않는다.

`prefers-reduced-motion: reduce`에서는 enhancement bundle을 로드하지 않고 모든 핵심 장면을 CSS의 최종 정적 상태로 보여준다. 콘텐츠의 가시성과 조작 가능성이 모션에 의존해서는 안 된다.

## Cursor Tones

커스텀 커서는 `data-cursor-contrast`로 선언한 semantic surface를 읽어 dark/light tone을 전환한다. 픽셀 색상을 샘플링하지 않는다.

- fine pointer이면서 viewport가 `900px`를 초과하고 모션 감소가 아닐 때만 활성화한다.
- 링크·버튼은 hot, 입력 표면은 soft 상태를 사용하되 의미나 상태를 커서만으로 전달하지 않는다.
- `mailto:`, `tel:`, window blur, visibility change 뒤에는 mute 상태를 정리하고 복구한다.
- 비활성 조건에서는 native cursor와 `focus-visible`을 그대로 제공한다.

## Contact States and Security Boundary

문의 폼은 기본, hover, selected, focus, invalid, pending, success, failure 상태를 시각적으로 구분한다. 오류는 색만이 아니라 문구와 연결된 접근성 상태로 전달하며, 결과 영역은 `aria-live` 또는 alert semantics를 사용한다.

클라이언트 검증은 빠른 피드백을 위한 것이며 보안 경계가 아니다. 서버는 입력 길이와 허용값, 동의, honeypot, 폼 체류 시간, 요청 제한, 중복 전송, 메일 전달 결과를 다시 확인한다. 비밀값은 서버 환경에만 두며 `.env.local`과 생성된 검토 산출물을 커밋하지 않는다.

## Accessibility and Resilience

- WCAG 2.2 AA를 기준으로 대비, 키보드 조작, 명확한 `focus-visible`, label과 오류 연결을 유지한다.
- 모든 주요 콘텐츠와 문의 경로는 JavaScript가 늦거나 비활성인 상태에서도 문서에 존재해야 한다.
- 장식 canvas, orb, mask, path는 보조기술에서 숨기고 의미는 텍스트와 실제 컨트롤로 제공한다.
- 모바일과 coarse pointer에서는 hover 또는 커스텀 커서를 전제로 하지 않는다.
- responsive gutter와 `100svh` Hero는 작은 화면에서도 가로 overflow 없이 핵심 문구와 CTA를 보존한다.

## Evidence Boundary

디자인은 확인 가능한 사실과 구현을 설명해야 한다. 공개 근거 없는 로고, 후기, 사례, 성과 수치, 서비스 수준, 경력 연수, 확정 일정 또는 계약상 보장을 설득 장치로 추가하지 않는다. 법인과 연락처 사실은 `src/entities/company/config/company-infos.ts`, 문의 동작과 보안 경계는 실제 서버 구현 및 회귀 테스트를 근거로 삼는다.

시각적 장면, 파티클, 모션은 품질 기준을 전달하는 표현이지 성과의 증거가 아니다. 디자인 검토 기록이나 생성 이미지도 공개 사실의 근거로 사용하지 않는다.

## Regression Checklist

- [ ] Hero가 전체 viewport를 채우고 헤드라인 두 행, 설명, CTA가 보인다.
- [ ] 문서와 주요 내비게이션 순서가 권위 목록과 일치한다.
- [ ] Wanted Sans와 제목 크기·자간 상한을 지킨다.
- [ ] Quality, Layered Merge, Review, Process, Contact가 각자 지정된 장면과 모션을 유지한다.
- [ ] section pinning, scroll snap, slide replacement가 없다.
- [ ] 버튼 외부에 `back.out(...)`이 없다.
- [ ] reduced-motion, Save-Data, WebGL fallback에서 핵심 콘텐츠가 정적으로 보인다.
- [ ] 커서 tone, native fallback, protocol link 복구가 동작한다.
- [ ] 문의 폼의 키보드 조작, 오류, 전송 결과, 서버 방어 경계가 유지된다.
- [ ] 공개 문구가 Evidence Boundary를 넘지 않는다.
