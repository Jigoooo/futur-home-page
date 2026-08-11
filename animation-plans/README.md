# Animation Plans

| Plan                                      | Title                                          | Severity | Status |
| ----------------------------------------- | ---------------------------------------------- | -------- | ------ |
| [001](./001-crossfade-header-backdrop.md) | Header live blur를 정적 글라스와 교차 전환한다 | HIGH     | DONE   |

## Execution order

1. 001은 완료됐다. Header scroll-glass의 fade-out/Scroll Edge 진입은 160ms
   `ease-in-out`, idle 복원은 160ms `ease-out` 계약을 사용한다.
