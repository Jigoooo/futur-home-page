# Task 2 보고서: 빠른 전환·접근성·반응형 fallback 보강

## 구현

- `e2e/landing-adaptive-island.chrome.spec.ts`
  - 서비스 → 기술 → FAQ → 서비스의 빠른 재진입 뒤 최종 서비스 링크 하나만 접근 가능하고, transient roll role이 남지 않는지 실제 스크롤로 검증했다.
  - Footer 이탈 뒤에는 모바일 섹션 라벨이 모두 사라지는지 확인했다.
  - 390px에서 enhancement가 켜진 뒤 561px으로 복귀할 때 `data-header-mobile-roll`이 제거되고, 세 섹션 링크가 모두 visible·non-inert·aria-hidden 아님을 확인했다.
  - reduced-motion에서는 `reduced` 상태, 현재 라벨 하나, 세 span의 `transform: none` 및 0초 transition/animation을 확인했다.
  - JavaScript 비활성화 상태에서는 mobile-roll dataset이 없고 전체 메뉴가 계속 보이는지 확인했다.
- `e2e/landing-runtime-errors.chrome.spec.ts`
  - 모바일 서비스 → 기술 → FAQ 빠른 전환 후 `idle` 정착과 기존 runtime error 수집 배열의 빈 상태를 함께 검증했다.

## Characterization / RED-GREEN

테스트를 먼저 추가한 뒤 brief의 focused 명령을 실행했다. 새 계약 5개가 Task 1 구현에서 모두 GREEN이었다.

- RED 없음: 560px 경계 cleanup, reduced-motion 즉시 상태, no-JS fallback, 빠른 재진입 최종 anchor 정착은 현재 구현이 이미 충족했다.
- 따라서 `use-mobile-header-section-roll.ts`와 `header.module.css`에는 중복 production 변경을 추가하지 않았다.

## 검증

| 명령 | 결과 |
| --- | --- |
| adaptive focused grep, Chrome, workers=1 | 5 passed (16.4s) |
| adaptive Chrome spec 단독, workers=1 | 16 passed (56.9s) |
| runtime Chrome spec 단독, workers=1 | 3 passed (6.8s) |
| landing static + interactive a11y, workers=1 | 7 passed (9.7s), axe 0 violations |
| `pnpm lint` | exit 0 |
| `pnpm exec tsc -b --noEmit` | exit 0 |
| `pnpm exec prettier --check` (수정 test 두 파일) | exit 0 |
| `git diff --check` | exit 0 |

처음 combined Chrome 명령은 7/19 진행 출력 이후 runner 결과가 이 작업의 출력 채널에 더 이상 전달되지 않았다. 프로세스 종료를 확인한 뒤, brief의 fallback에 따라 adaptive와 runtime을 각각 `--workers=1`로 재실행해 위 완료 수치를 확보했다.

## 변경 파일

- `e2e/landing-adaptive-island.chrome.spec.ts`
- `e2e/landing-runtime-errors.chrome.spec.ts`

지정된 dirty 문서 파일 두 개는 수정하거나 staging하지 않았다.

## Self-review

- 소스 문자열이나 hook 내부 상수 대신, visibility, `inert`, `aria-hidden`, transient role 제거, computed transform/duration, runtime error를 실제 브라우저에서 검증했다.
- 기존 서비스 → 기술 → FAQ 잔상 회귀를 복제하지 않고, 재진입의 최종 접근성 정합성과 Footer 이탈이라는 별도 계약을 추가했다.
- 코드 변경이 없으므로 Task 1 hook의 timeline/sequence guard 구현을 중복 수정하지 않았다.

## Concerns

- 없음. 다만 shared Playwright 출력 채널이 combined runner의 마지막 결과를 유실할 수 있어, 향후 동일 검증은 spec별 실행 결과를 기준으로 기록하는 편이 재현 가능하다.

## Fix round 1

### 변경

- 561px breakpoint round-trip은 이제 390px에서 서비스 섹션으로 진입해 `enhanced` / `idle` 상태를 실제로 확인한 뒤 resize한다. resize 뒤 세 섹션 링크의 visible·non-inert·aria-hidden 없음과 FAQ 진입 시 shared active indicator의 실표시(width와 opacity)를 검증한다.
- 빠른 서비스 재진입은 `#services`의 정확한 `aria-current="location"`, `inert=false`, `aria-hidden` 없음 및 `#technology` / `#faq` 각각의 `inert=true`, `aria-hidden="true"`를 명시적으로 검증한다.

### Covering tests 및 실제 출력

| 명령 | 결과 |
| --- | --- |
| adaptive focused grep (`rapid mobile section changes|breakpoint round trips`), Chrome, workers=1 | 2 passed (7.9s) |
| adaptive Chrome spec 전체, workers=1 | 16 passed (58.8s) |
| `pnpm lint` / `pnpm exec tsc -b --noEmit` / `git diff --check` | 모두 exit 0 |

새 요구사항은 현재 Task 1 구현에서 GREEN이었다. 테스트가 실제 결함을 드러내지 않았으므로 hook/CSS production 변경은 추가하지 않았다.

### Self-review

- 561px 테스트는 더 이상 enhancement가 적용되기 전의 초기 상태만 검사하지 않는다.
- 빠른 전환 테스트는 집계된 `aria-current` 개수 대신 각 최종 링크의 접근성 상태를 직접 검증한다.
- source 문자열이나 내부 상수 없이 실제 visibility, inert/aria, indicator geometry를 사용했다.
