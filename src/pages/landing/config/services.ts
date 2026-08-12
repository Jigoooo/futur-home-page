import type { ServiceItem, ServicePhase } from '../model/types';

export const servicePhases: ServicePhase[] = [
  {
    key: 'build',
    index: '01',
    label: 'BUILD',
    title: '제품과 업무의 기반을 만듭니다.',
    services: [
      {
        key: 'web',
        title: '웹·앱 개발',
        description: '사용자가 실제로 쓰기 쉬운 화면과 현장 업무에 맞는 앱을 구현합니다.',
        icon: 'desktop',
        scopes: ['웹 서비스', '모바일 앱', '관리자 화면'],
      },
      {
        key: 'system',
        title: '업무 시스템 구축',
        description: '반복 업무와 수기 관리를 줄이고 데이터 기반으로 일할 수 있는 구조를 만듭니다.',
        icon: 'system',
        scopes: ['업무 흐름', '데이터 관리', '권한 설계'],
      },
    ],
  },
  {
    key: 'connect',
    index: '02',
    label: 'CONNECT',
    title: '필요한 기술을 하나의 흐름으로 연결합니다.',
    services: [
      {
        key: 'api',
        title: '연동·API',
        description:
          '인증, 결제, 알림, 파일 업로드 등 운영에 필요한 외부 서비스를 안정적으로 연결합니다.',
        icon: 'link',
        scopes: ['인증·결제', '알림', '파일·외부 API'],
      },
      {
        key: 'ai',
        title: 'AI 통합·AX',
        description:
          '기존 AI 모델과 API를 활용해 챗봇, 문서 검색, 업무 자동화를 서비스와 사내 시스템에 연결합니다.',
        icon: 'sparkles',
        scopes: ['AI 챗봇', '문서 검색', '업무 자동화'],
      },
    ],
  },
  {
    key: 'operate',
    index: '03',
    label: 'OPERATE',
    title: '출시 이후까지 안정적으로 운영합니다.',
    services: [
      {
        key: 'operations',
        title: '운영·유지보수',
        description: '배포 이후의 오류 대응, 기능 개선, 성능 점검까지 지속적으로 관리합니다.',
        icon: 'shield',
        scopes: ['오류 대응', '기능 개선', '성능 점검'],
      },
    ],
  },
];

export const services: ServiceItem[] = servicePhases.flatMap((phase) => phase.services);
