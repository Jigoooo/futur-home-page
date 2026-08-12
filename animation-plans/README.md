# Animation Plans

| Plan                                      | Title                                          | Severity | Status     |
| ----------------------------------------- | ---------------------------------------------- | -------- | ---------- |
| [001](./001-crossfade-header-backdrop.md) | Header live blur를 정적 글라스와 교차 전환한다 | HIGH     | SUPERSEDED |
| [002](./002-persistent-header-blur.md)    | Header blur를 스크롤 중에도 유지한다           | HIGH     | DONE       |

## Execution order

1. 001의 crossfade 계약은 사용자 시각 검토 후 폐기됐다.
2. 002가 현재 권위다. Header는 모든 스크롤 상태에서 `blur(12px)`를 유지한다.
