import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

import { waitForStyleGateReady } from './wait-style-gate';

/**
 * WCAG 2.0/2.1/2.2 AA + best-practice 까지 검사.
 * - wcag2aaa 는 과도한 색대비 요구로 마케팅 페이지에는 부적합 → 제외
 * - experimental 은 룰셋 휘발성 높아 제외
 */
const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
] as const;

export interface RunA11yScanOptions {
  /** axe 분석 범위 포함 셀렉터 (미지정 시 페이지 전체) */
  include?: string;
  /** 의도적 제외 셀렉터 (외부 위젯 영역 등) */
  exclude?: string[];
  /**
   * 의도된 룰 waiver 목록. 각 룰 id 위에 반드시 사유 주석을 남길 것.
   * 예: ['color-contrast'] // AXE-WAIVE: GSAP transition 중 일시적 — issue #123
   */
  disableRules?: string[];
  /** axe 분석 직전 추가 셋업 (모달 열기, 탭 전환 등) */
  beforeScan?: (page: Page) => Promise<void>;
}

interface AxeViolationNode {
  target: unknown[];
}

interface AxeViolation {
  id: string;
  help: string;
  helpUrl: string;
  nodes: AxeViolationNode[];
}

export async function runA11yScan(page: Page, opts: RunA11yScanOptions = {}) {
  await waitForStyleGateReady(page);
  if (opts.beforeScan) await opts.beforeScan(page);

  let builder = new AxeBuilder({ page }).withTags([...WCAG_TAGS]);
  if (opts.include) builder = builder.include(opts.include);
  for (const sel of opts.exclude ?? []) builder = builder.exclude(sel);
  if (opts.disableRules?.length) builder = builder.disableRules(opts.disableRules);

  const results = await builder.analyze();
  const violations = results.violations as AxeViolation[];
  expect.soft(violations, formatViolations(violations)).toEqual([]);
}

function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) return '';
  return violations
    .map((v) => {
      const targets = v.nodes
        .map((n) => `  - ${JSON.stringify(n.target)}`)
        .join('\n');
      return `[${v.id}] ${v.help}\n${v.helpUrl}\n${targets}`;
    })
    .join('\n\n');
}
