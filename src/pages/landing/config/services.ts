import type { ServiceItem } from '../model/types';

type ServiceRailItem = Pick<ServiceItem, 'title' | 'description'>;

export const services: ServiceRailItem[] = [
  {
    title: '웹·앱 개발',
    description: '사용 흐름과 운영 환경에 맞춰 웹 서비스와 모바일 앱을 설계하고 구현합니다.',
  },
  {
    title: '업무 시스템 구축',
    description: '반복 업무와 관리 기준을 정리하고, 필요한 화면과 데이터 구조를 만듭니다.',
  },
  {
    title: '외부 서비스 연동',
    description: '인증, 결제, 알림, 파일 업로드 등 운영에 필요한 외부 서비스와 API를 연결합니다.',
  },
  {
    title: '배포 이후 운영',
    description: '배포 뒤 생기는 오류를 살피고 기능 개선과 운영 점검을 이어갑니다.',
  },
];
