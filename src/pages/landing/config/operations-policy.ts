import type { OperationsPolicy } from '../model/types';

export const operationsPolicies: OperationsPolicy[] = [
  {
    icon: 'shield',
    title: '정보 보호 범위 협의',
    description: '자료 취급과 비밀유지 조건은 프로젝트 시작 전에 필요한 범위로 확인합니다.',
  },
  {
    icon: 'clock',
    title: '운영 조건 명시',
    description: '모니터링과 대응 범위, 연락 방식은 운영 상황에 맞춰 문서로 정리합니다.',
  },
  {
    icon: 'system',
    title: '변경 이력 공유',
    description: '오류와 개선 작업은 원인, 변경 내용, 확인 결과가 남도록 관리합니다.',
  },
  {
    icon: 'check',
    title: '코드와 운영 자산 인계',
    description: '합의한 코드, 문서, 디자인, 운영 자료를 종료 범위에 맞춰 정리합니다.',
  },
];
