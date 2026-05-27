import type { CaseStory } from '../model/types';

export const caseStories: CaseStory[] = [
  {
    key: 'web',
    tabLabel: '웹 플랫폼',
    label: 'ANONYMIZED WEB PROJECT',
    title: '예약·결제·관리 흐름을\n하나의 웹 플랫폼으로 통합',
    description:
      '사용자 신청, 운영자 확인, 결제 상태 관리가 분리되어 있던 흐름을 하나의 웹 서비스 구조로 재정리했습니다.',
    icon: 'WEB',
    noteTitle: '운영 화면 통합',
    noteDescription: '신청·결제·처리 이력을 한 화면에서 확인',
    image: {
      src: '/landing/project-records/web-platform.webp',
      alt: '예약과 결제 상태를 함께 관리하는 익명화된 웹 플랫폼 화면',
    },
    metrics: [
      { value: '8주', label: 'MVP 구축' },
      { value: '12+', label: '핵심 화면 구성' },
      { value: '운영', label: '배포 이후 개선' },
    ],
    items: [
      '문제: 신청, 결제, 운영 확인이 각기 다른 도구에 흩어져 있었음',
      '진행: 사용자 플로우와 관리자 플로우를 분리한 뒤 상태 기준을 먼저 정의',
      '결과: 운영자가 신청 상태와 처리 이력을 한 화면에서 확인하도록 구성',
    ],
    tags: ['예약 흐름', '관리자 화면', '결제 상태', '운영 개선'],
  },
  {
    key: 'mobile',
    tabLabel: '모바일 앱',
    label: 'ANONYMIZED MOBILE PROJECT',
    title: '현장 입력과 관리자 확인을\n모바일 앱으로 연결',
    description:
      '사진 업로드, 바코드 스캔, 체크리스트처럼 현장에서 반복되는 입력을 모바일 작업 순서에 맞게 배치했습니다.',
    icon: 'APP',
    noteTitle: '현장 입력 최소화',
    noteDescription: '사진·스캔·체크로 빠르게 처리',
    image: {
      src: '/landing/project-records/mobile-workflow.webp',
      alt: '현장 입력과 관리자 확인을 연결하는 익명화된 모바일 앱 화면',
    },
    metrics: [
      { value: '6주', label: '앱 1차 구축' },
      { value: '5개', label: '주요 업무 흐름' },
      { value: '연동', label: '관리자 화면 연결' },
    ],
    items: [
      '문제: 현장 입력이 길어지고 사무실 재확인이 자주 발생함',
      '진행: 촬영, 스캔, 체크리스트를 실제 작업 순서대로 재배치',
      '결과: 관리자 화면과 연결해 진행 상태와 누락 항목을 확인',
    ],
    tags: ['모바일 앱', '사진 업로드', '바코드 스캔', '체크리스트'],
  },
  {
    key: 'system',
    tabLabel: '업무 시스템',
    label: 'ANONYMIZED SYSTEM PROJECT',
    title: '반복 처리 업무를\n권한별 시스템으로 정리',
    description:
      '요청, 처리 상태, 승인 흐름이 여러 도구에 흩어져 있던 문제를 권한별 화면과 상태 이력으로 묶었습니다.',
    icon: 'SYS',
    noteTitle: '처리 기준 명확화',
    noteDescription: '요청·처리·완료 상태를 같은 기준으로 관리',
    image: {
      src: '/landing/project-records/business-system.webp',
      alt: '요청과 승인 상태를 관리하는 익명화된 업무 시스템 화면',
    },
    metrics: [
      { value: '14+', label: '업무 화면 구성' },
      { value: '권한', label: '역할별 접근' },
      { value: '로그', label: '처리 이력 추적' },
    ],
    items: [
      '문제: 요청 상태와 승인 기준이 분리되어 담당자 확인이 반복됨',
      '진행: 등록, 검토, 처리, 완료 상태와 권한별 화면을 한 흐름으로 설계',
      '결과: 누락 여부와 처리 이력을 같은 화면에서 추적하도록 구성',
    ],
    tags: ['업무 시스템', '권한 관리', '상태 이력', '승인 흐름'],
  },
  {
    key: 'automation',
    tabLabel: '연동·자동화',
    label: 'ANONYMIZED INTEGRATION PROJECT',
    title: '외부 API와 알림을\n운영 흐름에 맞게 자동화',
    description:
      '인증, 알림, 파일, 결제, 외부 시스템 API를 운영 흐름에 맞게 연결해 수작업과 중복 입력을 줄였습니다.',
    icon: 'API',
    noteTitle: '연동 상태 가시화',
    noteDescription: '실패·재시도·로그를 함께 관리',
    image: {
      src: '/landing/project-records/integration-automation.webp',
      alt: '외부 API 연동과 자동화 상태를 보여주는 익명화된 운영 화면',
    },
    metrics: [
      { value: '8+', label: '외부 연동 항목' },
      { value: '재시도', label: '실패 복구 기준' },
      { value: '로그', label: '운영 이슈 추적' },
    ],
    items: [
      '문제: 외부 서비스 상태를 사람이 확인하고 다시 입력해야 했음',
      '진행: API 연동, 인증, 파일, 알림 흐름을 내부 데이터와 연결',
      '결과: 실패 로그와 재시도 기준을 함께 관리하도록 구성',
    ],
    tags: ['API 연동', '알림 자동화', '실패 로그', '재시도 기준'],
  },
];
