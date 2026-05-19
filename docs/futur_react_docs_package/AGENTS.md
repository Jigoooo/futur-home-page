# AGENTS.md

> FUTUR 랜딩 페이지 React 전환 작업을 위한 Codex 지침입니다. Codex는 작업 전에 이 문서와 `DESIGN.md`, `FUTUR_REACT_MIGRATION_PLAN.md`를 먼저 읽어야 합니다.

---

## 1. Project Goal

`futur_2026_layout_v10.html` 시안을 React + TypeScript 기반 랜딩 페이지로 전환한다.

목표는 단순 HTML 복사가 아니라 다음을 만족하는 구조화된 구현이다.

- 컴포넌트 재사용성
- 디자인 시스템 유지
- 실제 입력/체크/탭/셀렉트 상호작용
- 반응형 지원
- 접근성 지원
- 과하지 않은 마이크로 인터랙션
- 유지보수 가능한 데이터 분리

---

## 2. Must Read Before Coding

```text
DESIGN.md
FUTUR_REACT_MIGRATION_PLAN.md
futur_2026_layout_v10.html
```

디자인 결정은 `DESIGN.md`를 우선한다. 구현 순서와 컴포넌트 책임은 `FUTUR_REACT_MIGRATION_PLAN.md`를 따른다.

---

## 3. Non-Negotiable Design Rules

- 사람 사진을 사용하지 않는다.
- 팀 섹션은 실명/사진이 아니라 역할, 경력, 위치, 강점, 태그 중심이다.
- `사진 대신`, `실명 노출 없이도` 같은 문구는 쓰지 않는다.
- FUTUR 로고는 과하게 꾸미지 않는다. 기본은 `FUTUR.` 워드마크다.
- 라이트 테마와 넉넉한 여백을 유지한다.
- 모든 요소에 동일한 fade animation을 적용하지 않는다.
- footer는 흐려지거나 미완성 상태로 보여서는 안 된다.
- 모바일 반응형을 반드시 지원한다.
- 한글 단어가 어색하게 쪼개지지 않도록 `word-break: keep-all`을 유지한다.

---

## 4. Component Rules

### Button

- hover 시 버튼 outer hit-area를 움직이지 않는다.
- label, arrow, spotlight layer만 움직인다.
- hover 경계에서 flicker가 없어야 한다.

### CustomSelect

- 기본 브라우저 select처럼 보이면 안 된다.
- `role="combobox"`, `role="listbox"`, `role="option"`을 사용한다.
- ArrowUp/ArrowDown/Enter/Escape 키보드 조작을 지원한다.
- chevron은 우측 중앙 정렬한다.
- option 간격은 충분히 둔다.

### CheckboxTile

- 실제 checkbox state는 유지한다.
- 시각 UI는 직접 디자인한다.
- 필요한 서비스/필요한 영역은 왼쪽 정렬한다.
- 카드 전체가 클릭 가능해야 한다.

### StageSelector

- Quick Brief의 현재 단계는 토글이 아니라 단계 카드형으로 구현한다.
- `01 아이디어`, `02 기획 중`, `03 운영 개선`처럼 단계성을 보여준다.

### CaseStories Tabs

- 탭 클릭 시 실제 내용이 바뀌어야 한다.
- 방향키/Home/End 조작을 지원한다.

### CustomCursor

- desktop fine pointer에서만 활성화한다.
- mobile/touch와 reduced motion에서는 비활성화한다.
- cursor label이 뜰 때 중앙 dot은 숨긴다.
- `mailto:`/`tel:` 클릭 후에는 다음 pointermove/focus/pageshow에서 복구되도록 graceful fallback을 둔다.
- 문제가 반복되면 primary CTA는 `mailto:` 대신 `#contact` 스크롤 또는 이메일 복사 버튼을 사용한다.

---

## 5. Suggested Commands

프로젝트가 Vite 기반인 경우:

```bash
npm run dev
npm run build
npm run lint
```

프로젝트가 pnpm 기반인 경우:

```bash
pnpm dev
pnpm build
pnpm lint
```

아직 스크립트가 없다면 package manager를 확인한 뒤 최소 스크립트를 제안하고 구현한다.

---

## 6. Quality Bar

작업 완료 전 확인한다.

- [ ] Desktop 1440px에서 레이아웃이 안정적이다.
- [ ] 1180px 이하에서 overflow가 없다.
- [ ] 900px 이하에서 1열 레이아웃이 자연스럽다.
- [ ] 430px/390px 모바일에서 CTA, 폼, 카드가 잘리지 않는다.
- [ ] Tab key로 폼과 탭/셀렉트를 조작할 수 있다.
- [ ] CustomSelect keyboard navigation이 동작한다.
- [ ] Case tabs 내용이 실제 전환된다.
- [ ] Quick Brief summary가 실제 갱신된다.
- [ ] Contact form submit demo가 동작한다.
- [ ] Reduced motion 설정에서 과한 애니메이션이 꺼진다.
- [ ] Footer icon 정렬과 top gap이 자연스럽다.

---

## 7. Do Not

- 사용자에게 이미 확정된 디자인 방향을 임의로 되돌리지 않는다.
- 의미 없는 3D 일러스트/사람 사진을 추가하지 않는다.
- 모든 section/card에 동일한 fade-up을 넣지 않는다.
- 접근성을 무시한 custom select를 만들지 않는다.
- CSS를 컴포넌트마다 중복해서 흩뿌리지 않는다.
- 외부 패키지를 추가할 때 이유를 설명하지 않고 설치하지 않는다.
- mobile layout을 나중으로 미루지 않는다.

---

## 8. Preferred Implementation Style

- React function component 사용
- TypeScript type/interface 명시
- 반복 콘텐츠는 data file에서 import
- UI component는 controlled API를 우선
- effect cleanup 필수
- event listener는 hook으로 분리
- className은 읽기 쉬운 명명 사용
- 디자인 토큰은 CSS variable로 관리
- SVG icon은 component 또는 inline svg로 관리

---

## 9. Source of Truth

- 디자인 기준: `DESIGN.md`
- 구현 계획: `FUTUR_REACT_MIGRATION_PLAN.md`
- 현재 시안 기준: `futur_2026_layout_v10.html`
