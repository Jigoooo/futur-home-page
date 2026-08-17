import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

test.describe('검색 색인 이관 계약', () => {
  const homeTitle = 'FUTUR | 웹·앱·업무 시스템·AI 통합 개발';
  const homeDescription =
    '퓨처(Futur)는 웹·앱, SaaS·솔루션, 업무 시스템·SI, AI 통합·AX 구축과 운영·유지보수를 함께하는 개발 파트너입니다.';
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
    expect(sitemapRoute).toContain("lastmod: '2026-08-18'");
    expect(robots).toContain('Sitemap: https://futur.co.kr/sitemap.xml');
    expect(existsSync(`${projectRoot}public/navere8ef67b613b49d65b53d06be40fc4072.html`)).toBe(
      true,
    );
  });

  test('승인된 검색 아이덴티티와 공유 카드 규격을 제공한다', async ({ request }) => {
    for (const [path, width, height] of [
      ['/favicon-48.png', 48, 48],
      ['/organization-logo-512.png', 512, 512],
      ['/media/share/futur-main-og-v2.png', 1200, 630],
    ] as const) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/png');
      const image = await response.body();
      const size = { height: image.readUInt32BE(20), width: image.readUInt32BE(16) };

      expect(size).toEqual({ height, width });
    }

    expect(existsSync(`${projectRoot}public/favicon.ico`)).toBe(true);
    expect(existsSync(`${projectRoot}scripts/generate-seo-assets.sh`)).toBe(true);
  });

  test('홈의 검색 메타와 회사 구조화 데이터를 사실 기반으로 제공한다', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(homeTitle);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      homeDescription,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://futur.co.kr/',
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', homeTitle);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://futur.co.kr/media/share/futur-main-og-v2.png',
    );
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute(
      'content',
      'image/png',
    );
    await expect(page.locator('link[rel="icon"][sizes="48x48"]')).toHaveAttribute(
      'href',
      '/favicon-48.png',
    );
    await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
    await expect(page.locator('meta[name="geo.position"], meta[name="ICBM"]')).toHaveCount(0);

    const structuredData = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
    ) as { '@graph'?: Array<Record<string, unknown>> };
    const website = structuredData['@graph']?.find((item) => item['@type'] === 'WebSite');
    const organization = structuredData['@graph']?.find((item) => item['@type'] === 'Organization');

    expect(website).toMatchObject({
      '@id': 'https://futur.co.kr/#website',
      alternateName: ['퓨터', 'Futur'],
      name: 'FUTUR',
      url: 'https://futur.co.kr/',
    });
    expect(organization).toMatchObject({
      '@id': 'https://futur.co.kr/#organization',
      legalName: '퓨터',
      logo: {
        '@type': 'ImageObject',
        height: 512,
        url: 'https://futur.co.kr/organization-logo-512.png',
        width: 512,
      },
      name: 'FUTUR',
    });
    expect(JSON.stringify(organization)).not.toMatch(
      /telephone|sameAs|rating|review|numberOfEmployees|완료 프로젝트|고객 만족/,
    );
  });

  test('법적 문서와 404가 각 URL에 맞는 색인 계약을 가진다', async ({ page }) => {
    for (const [path, canonical] of [
      ['/privacy', 'https://futur.co.kr/privacy'],
      ['/terms', 'https://futur.co.kr/terms'],
    ] as const) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex,follow',
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    }

    const response = await page.goto('/missing-search-document');
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle('페이지를 찾을 수 없습니다 · FUTUR');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow',
    );
  });

  test('release marker는 검색 결과에 노출되지 않는다', async ({ request }) => {
    const response = await request.get('/futur-release');

    expect(response.headers()['cache-control']).toBe('no-store');
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow, nosnippet');
  });

  test('모든 검색 크롤러에 사실 기반 공개 문서를 제공한다', async ({ request }) => {
    const robotsResponse = await request.get('/robots.txt');
    const robots = await robotsResponse.text();
    expect(robotsResponse.status()).toBe(200);
    expect(robots).toContain('User-agent: OAI-SearchBot');
    expect(robots).toContain('User-agent: GPTBot');
    expect(robots).toContain('User-agent: *');
    expect(robots.match(/Allow: \//g)).toHaveLength(3);
    expect(robots).toContain('Sitemap: https://futur.co.kr/sitemap.xml');

    const llmsResponse = await request.get('/llms.txt');
    const llms = await llmsResponse.text();
    expect(llmsResponse.status()).toBe(200);
    expect(llmsResponse.headers()['content-type']).toContain('text/plain');
    expect(llms).toContain('서비스·솔루션 개발');
    expect(llms).toContain('업무 시스템·SI');
    expect(llms).toContain('AI 통합·AX');
    expect(llms).toContain('운영·유지보수');
    expect(llms).not.toMatch(/완료 프로젝트|고객 만족|평균 경력|업무시간|포트폴리오|아티클/);
  });
});
