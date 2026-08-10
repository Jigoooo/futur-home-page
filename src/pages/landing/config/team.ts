import type { TeamRole } from '../model/types';

export const teamRoles: TeamRole[] = [
  {
    badge: 'PM',
    title: '프로젝트 매니지먼트',
    responsibility: '요구사항과 범위를 정리하고 일정과 의사결정을 연결합니다.',
    tags: ['기획', '문서화', '커뮤니케이션'],
  },
  {
    badge: 'PLAN',
    title: '서비스 기획',
    responsibility: '업무 흐름을 화면 구조와 실행 가능한 기능 단위로 바꿉니다.',
    tags: ['요구사항', 'IA', '화면 흐름'],
  },
  {
    badge: 'FE',
    title: '프론트엔드·모바일',
    responsibility: '실사용 환경에 맞는 웹과 앱의 화면 경험을 구현합니다.',
    tags: ['React', 'TypeScript', 'UI/UX'],
  },
  {
    badge: 'BE',
    title: '백엔드',
    responsibility: 'API, 데이터, 권한 구조를 운영 가능한 형태로 설계합니다.',
    tags: ['API', '데이터', '권한'],
  },
  {
    badge: 'OPS',
    title: '운영·인프라',
    responsibility: '배포와 모니터링, 변경 이력과 인수인계 범위를 관리합니다.',
    tags: ['배포', '모니터링', '인수인계'],
  },
];
