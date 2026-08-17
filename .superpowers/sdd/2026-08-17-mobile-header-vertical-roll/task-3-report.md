# Task 3 — 디자인 계약·전체 검증 보고서

기록일: 2026-08-17
기준: `73ecea9` 이후 Header 세로 롤링 구현 및 fallback 테스트가 포함된 worktree

## 문서 계약

- `DESIGN.md`의 Header 기준을 `561px ~ 900px` 전체 메뉴·높이 `58px`과 `560px 이하`의 `FUTUR. | 현재 섹션 | 문의`·너비 `calc(100% - 24px)`·높이 `60px`으로 단일화했다.
- 좁은 화면의 현재 섹션은 중앙 masked lane에서 이전 라벨 `-9px`, 새 라벨 `+10px`의 세로 롤링으로 교체하며, Hero·Footer는 비우고 reduced motion은 즉시 교체한다.
- no-JS에서는 서비스·기술·FAQ·문의 전체 hash navigation을 노출한다.
- 활성 섹션 설계에는 즉시 교체 계약이 세로 롤링 설계로 대체됐다는 note를 추가하고, 본문의 즉시 교체 문구도 후속 설계 참조로 바꿨다.
- 기존 상시 노출 설계의 이미 있던 `560px` 보완 note는 보존했다. 본문의 구형 전체 메뉴·`58px`·shared indicator 계약은 후속 세로 롤링 설계를 단일 상세 기준으로 연결해 제거했다.

## 정적 검사와 빌드

- `pnpm lint`: 통과, exit 0.
- `pnpm exec tsc -b --noEmit`: 통과, exit 0.
- `pnpm build`: 통과, exit 0. Nitro node-server artifact와 `.output/server/index.mjs`(20,091 bytes) 생성 확인.
- `git diff --check`: 통과, exit 0.

## Playwright

- 전체 실행: `PLAYWRIGHT_SKIP_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001 pnpm exec playwright test --workers=4 --retries=0`.
- runner는 122건을 시작했다. 출력으로 확인된 결과는 통과 115건, 환경 조건 skip 3건, 실패 0건이다.
- 118번째 결과 뒤 stdout과 종료가 반환되지 않아 4건의 최종 결과가 출력되지 않은 상태에서 종료 대기를 중단했다. 최종 종료 코드는 사용자 중단으로 130이며, assertion 실패 출력은 없었다.
- Header/runtime 분리 실행: `e2e/landing-adaptive-island.chrome.spec.ts`와 `e2e/landing-runtime-errors.chrome.spec.ts`를 `--workers=1 --retries=0`으로 실행해 19/19 통과, exit 0.
- a11y 분리 실행: `e2e/a11y`를 `--workers=1 --retries=0`으로 실행해 10/10 통과, exit 0.
- 전체 runner에서 출력된 실패 spec은 없으므로 별도 실패 파일 재실행 대상은 없었다.

## 내부 브라우저 확인

- Codex 내부 브라우저 조작 도구는 이 작업 환경에 없었다. 다만 root가 900/768/561/560/390/320px 확인을 완료했다고 전달했다.
- 대체 자동 증거로 Header/runtime 19건과 a11y 10건을 단일 worker로 통과시켰다. breakpoint, 가로 overflow, 중심 정렬, 세로 롤링, Hero·Footer 공백, reduced motion, no-JS 조건은 Header spec에 포함된다.

## Graph와 작업 트리

- `graphify update .`: 성공, 1,155 nodes / 1,390 edges / 127 communities로 재구성했다. 추적되는 `graphify-out/*` 변경은 남기지 않았다.
- `git diff --check`: 최종 통과.
- `git status --short`: 소유한 설계 문서 3개만 변경으로 확인했다. 이 보고서는 `.superpowers/` ignore 규칙 때문에 `git add -f`로 명시 커밋한다.

## Concerns

- 병렬 전체 Playwright runner는 assertion 실패 없이 종료 대기가 멈췄다. 단일-worker Header/runtime 및 a11y는 모두 통과했지만, 전체 122건의 clean exit 0은 이 환경에서 확보하지 못했다.
- Browser 조작 도구로 독립 재현은 하지 못했으나, root가 지정 여섯 viewport를 확인 완료했다.
