# 002 — Header blur를 스크롤 중에도 유지한다

- **Status**: DONE
- **Severity**: HIGH
- **Category**: Cohesion, Visual continuity

## Decision

스크롤 성능을 위해 live blur를 제거하는 것보다, blur가 사라졌다 복원되는 시각 변화가 더 크게
느껴진다는 사용자 검토를 우선한다. Header의 단일 backdrop layer는 정지·스크롤·섹션 전환에서
항상 `blur(12px) saturate(135%) contrast(1.03)`을 유지한다.

## Implementation

- scroll lifecycle용 `data-header-scrolling`과 `data-header-backdrop-suspended`를 제거한다.
- Scroll Edge 장식 레이어와 opacity crossfade를 제거한다.
- Header geometry, semantic dark/light tint, shared active indicator, mobile morph는 유지한다.
- Hero particle count, shader, DPR tier와 4-pass pipeline은 변경하지 않는다.
- backdrop-filter 미지원 및 high-contrast 환경의 불투명 fallback은 유지한다.

## Verification

- desktop scroll sample 전체에서 computed filter가 exact 12px이고 opacity가 1인지 확인한다.
- scroll marker와 Scroll Edge DOM이 존재하지 않는지 확인한다.
- Adaptive Header, Hero/runtime, axe, lint, build를 통과한다.
