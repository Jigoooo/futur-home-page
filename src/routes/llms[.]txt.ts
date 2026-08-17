import { createFileRoute } from '@tanstack/react-router';

import { COMPANY_INFOS, HOME_SEO } from '@/entities/company';

function generateLlmsText() {
  return `# FUTUR

> ${HOME_SEO.description}

## Company

- 한국어 상호: ${COMPANY_INFOS.LEGAL_NAME_KO}
- 영문 브랜드: ${COMPANY_INFOS.NAME}
- 주소: ${COMPANY_INFOS.ADDRESS}
- 이메일: ${COMPANY_INFOS.EMAIL}
- 웹사이트: ${HOME_SEO.canonicalUrl}

## Services

- 서비스·솔루션 개발: 웹·모바일·데스크톱 서비스와 SaaS·솔루션 구현
- 업무 시스템·SI: 업무 흐름에 맞춘 시스템 구축과 API·외부 서비스 연동
- AI 통합·AX: 조직 데이터와 업무 흐름을 연결한 검색·자동화·에이전트 구현
- 운영·유지보수: 배포, 모니터링, 오류 대응, 개선과 인수인계

## Pages

- [홈](${HOME_SEO.canonicalUrl})
- [개인정보 처리방침](${COMPANY_INFOS.URL}/privacy)
- [이용약관](${COMPANY_INFOS.URL}/terms)

## Contact

프로젝트 문의: ${COMPANY_INFOS.EMAIL}
`;
}

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(generateLlmsText(), {
          headers: {
            'Cache-Control': 'public, max-age=86400',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        }),
    },
  },
});
