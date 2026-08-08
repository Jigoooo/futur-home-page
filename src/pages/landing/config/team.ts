import type { TeamRole } from '../model/types';

export const teamRoles: TeamRole[] = [
  {
    badge: 'PM',
    title: '프로젝트 매니저',
    job: '기획 · 일정 · 커뮤니케이션',
    strength: '요구사항 정리, 범위 조율',
    projectExperience: 'B2B 업무 시스템 / 외주 프로젝트',
    tags: ['기획', '문서화', '커뮤니케이션'],
  },
  {
    badge: 'PLAN',
    title: '서비스 기획',
    job: '요구사항 정리 · 화면 흐름 · IA',
    strength: '복잡한 요구를 실행 가능한 단위로 정리',
    projectExperience: 'B2B 업무 시스템, 외주 프로젝트',
    tags: ['요구사항', 'IA', '와이어프레임'],
  },
  {
    badge: 'FE',
    title: '프론트엔드 · 모바일 · UI/UX 설계',
    job: '웹/모바일 화면 · UI/UX 설계 · 디자인 시스템',
    strength: '실사용 환경에 맞는 화면 흐름과 디자인 시스템',
    projectExperience: '관리자, 대시보드, 모바일 앱, 디자인 시스템',
    tags: ['React', 'TypeScript', 'Expo', 'Figma'],
  },
  {
    badge: 'BE',
    title: '백엔드 개발',
    job: 'API · 데이터 · 권한 구조',
    strength: '안정적인 서비스 로직',
    projectExperience: 'ERP, 주문, 재고, 인증 시스템',
    tags: ['Node.js', 'Spring', 'SQL'],
  },
  {
    badge: 'OPS',
    title: '운영·인프라',
    job: '배포 · 모니터링 · 장애 대응',
    strength: '운영 가능한 배포 환경',
    projectExperience: 'Nginx, PM2, SSL, 서버 운영',
    tags: ['Docker', 'Nginx', 'CI/CD'],
  },
];
