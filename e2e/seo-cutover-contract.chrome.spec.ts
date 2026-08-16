import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

test.describe('검색 색인 이관 계약', () => {
  const redirects = [
    ['/contact', '/#footer'],
    ['/menu', '/#services'],
    ['/policy/privacy', '/privacy'],
    ['/policy/terms', '/terms'],
  ] as const;

  for (const [legacyPath, destination] of redirects) {
    test(`${legacyPath}는 관련 새 위치로 영구 이동한다`, async ({ request }) => {
      const response = await request.get(legacyPath, { maxRedirects: 0 });

      expect(response.status()).toBe(301);
      expect(response.headers().location).toBe(destination);
    });
  }

  test('대체 콘텐츠가 없는 기존 사례 URL을 홈으로 오인 리디렉션하지 않는다', async ({
    request,
  }) => {
    for (const legacyPath of ['/articles/1', '/portfolio/1']) {
      const response = await request.get(legacyPath, { maxRedirects: 0 });

      expect(response.status()).toBe(404);
      expect(response.headers().location).toBeUndefined();
    }
  });

  test('사이트맵은 실제 변경일을 사용하고 검색엔진 검증 자산을 유지한다', () => {
    const sitemapRoute = readFileSync(`${projectRoot}src/routes/sitemap[.]xml.ts`, 'utf8');
    const robots = readFileSync(`${projectRoot}public/robots.txt`, 'utf8');

    expect(sitemapRoute).not.toContain('new Date()');
    expect(sitemapRoute).toContain("lastmod: '2026-08-16'");
    expect(robots).toContain('Sitemap: https://futur.co.kr/sitemap.xml');
    expect(existsSync(`${projectRoot}public/navere8ef67b613b49d65b53d06be40fc4072.html`)).toBe(
      true,
    );
  });
});
