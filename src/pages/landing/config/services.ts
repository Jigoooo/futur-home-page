import type { ServiceCapability } from '../model/types';

export const serviceCapabilities: ServiceCapability[] = [
  {
    key: 'product',
    index: '01',
    title: '서비스·솔루션 개발',
    description:
      '웹과 앱, SaaS와 독립 솔루션을 기획 의도와 실제 사용 흐름에 맞춰 설계하고 구현합니다.',
    scopes: ['웹 서비스·SaaS', '모바일·데스크톱 앱', '관리자·고객 포털'],
    tone: 'ice',
  },
  {
    key: 'system',
    index: '02',
    title: '업무 시스템·SI',
    description:
      '조직의 업무 흐름과 데이터 구조에 맞는 시스템을 구축하고, 기존 시스템과 외부 서비스를 연결합니다.',
    scopes: ['업무 시스템·SI', 'API·시스템 연동', '데이터·권한 구조'],
    tone: 'sand',
  },
  {
    key: 'ai',
    index: '03',
    title: 'AI 통합·AX',
    description:
      '검증된 AI 모델을 조직의 데이터와 업무 흐름에 연결해 검색, 대화, 자동화 경험을 구현합니다.',
    scopes: ['AI 챗봇·검색', 'RAG·에이전트', '업무 자동화·AX'],
    tone: 'mint',
  },
  {
    key: 'operations',
    index: '04',
    title: '운영·유지보수',
    description:
      '배포 환경을 구성하고 서비스 상태를 관찰하며, 오류 대응과 기능 개선이 이어지도록 관리합니다.',
    scopes: ['배포·인프라', '모니터링·오류 대응', '기능 개선·유지보수'],
    tone: 'periwinkle',
  },
];
