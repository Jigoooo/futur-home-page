import type { FooterColumn } from '../model/types';

export const footerColumns: FooterColumn[] = [
  {
    title: '서비스',
    links: [
      { label: '웹·앱 개발', href: '#services' },
      { label: '업무 시스템', href: '#services' },
      { label: '연동·API', href: '#services' },
      { label: '운영·유지보수', href: '#services' },
    ],
  },
  {
    title: '프로젝트',
    links: [
      { label: '업무 시스템', href: '#cases' },
      { label: '모바일 앱', href: '#cases' },
      { label: '연동 자동화', href: '#cases' },
      { label: '진행 방식', href: '#process' },
    ],
  },
  {
    title: '회사',
    links: [
      { label: '팀', href: '#team' },
      { label: '프로세스', href: '#process' },
      { label: '문의하기', href: '#contact' },
      { label: 'FAQ', href: '#contact' },
    ],
  },
];
