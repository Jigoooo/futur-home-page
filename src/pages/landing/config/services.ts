import type { ServiceItem } from '../model/types';

export const services: ServiceItem[] = [
  {
    title: '웹·앱 개발',
    description: '사용자가 실제로 쓰기 쉬운 화면과 현장 업무에 맞는 앱을 구현합니다.',
    icon: 'desktop',
  },
  {
    title: '업무 시스템 구축',
    description: '반복 업무와 수기 관리를 줄이고 데이터 기반으로 일할 수 있는 구조를 만듭니다.',
    icon: 'system',
  },
  {
    title: '연동·API',
    description:
      '인증, 결제, 알림, 파일 업로드 등 운영에 필요한 외부 서비스를 안정적으로 연결합니다.',
    icon: 'link',
  },
  {
    title: '운영·유지보수',
    description: '배포 이후의 오류 대응, 기능 개선, 성능 점검까지 지속적으로 관리합니다.',
    icon: 'shield',
  },
];
