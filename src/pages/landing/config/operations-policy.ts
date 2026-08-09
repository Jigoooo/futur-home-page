import type { OperationsPolicy } from '../model/types';

// TODO(사용자 확인): 실제 운영 정책에 맞게 SLA·문구 보정.
export const operationsPolicies: OperationsPolicy[] = [
  {
    icon: 'shield',
    title: 'NDA 자동 체결',
    description: '첫 회의 전 표준 NDA로 기획서·자료·아이디어를 안전하게 보호합니다.',
  },
  {
    icon: 'clock',
    title: '24/7 모니터링 · 알림',
    description: '배포 이후에도 핵심 지표를 자동으로 감시하고, 이상 상황을 즉시 알립니다.',
  },
  {
    icon: 'system',
    title: '4시간 내 장애 응답',
    description: '운영 SLA 기반으로 책임 있게 대응하고, 원인과 조치를 투명하게 공유합니다.',
  },
  {
    icon: 'check',
    title: '코드 · 자산 100% 인도',
    description: '종료 시점에 모든 코드·디자인·운영 자산을 고객 자산으로 명문화해 인도합니다.',
  },
];
