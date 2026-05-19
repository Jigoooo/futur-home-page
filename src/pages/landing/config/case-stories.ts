import type { CaseStory } from '../model/types';

export const caseStories: CaseStory[] = [
  {
    key: 'system',
    tabLabel: '업무 시스템',
    label: 'B2B SYSTEM',
    title: '내부 업무 시스템을\n한 화면으로 정리',
    description:
      '흩어져 있던 요청, 처리 상태, 승인 흐름을 한 곳에서 확인하도록 구성해 반복적인 확인 업무를 줄였습니다.',
    icon: 'SYS',
    noteTitle: '처리 흐름 단순화',
    noteDescription: '요청·처리·완료 상태를 명확하게 구분',
    metrics: [
      { value: '42%', label: '반복 확인 감소' },
      { value: '12+', label: '핵심 화면 구성' },
      { value: '운영', label: '개선 지표 추적' },
    ],
    items: [
      '요청 등록부터 완료까지 상태 흐름을 한 화면에서 확인',
      '담당자, 권한, 처리 이력을 기준으로 업무 누락 방지',
      '관리자와 현장 사용자가 함께 쓰는 구조로 설계',
    ],
  },
  {
    key: 'mobile',
    tabLabel: '모바일 앱',
    label: 'FIELD MOBILE',
    title: '현장 업무를 위한\n모바일 앱 구축',
    description:
      '사진 업로드, 바코드 스캔, 체크리스트 등 현장에서 필요한 동작을 앱 흐름에 맞춰 단순화했습니다.',
    icon: 'APP',
    noteTitle: '현장 입력 최소화',
    noteDescription: '사진·스캔·체크로 빠르게 처리',
    metrics: [
      { value: '35%', label: '입력 시간 단축' },
      { value: '5개', label: '주요 업무 흐름' },
      { value: '모바일', label: '현장 사용 최적화' },
    ],
    items: [
      '촬영, 스캔, 서명 등 현장 기능을 업무 순서에 맞게 배치',
      '오프라인 상황과 재시도 흐름을 고려한 안정성 설계',
      '관리자 페이지와 연결해 진행 상태를 실시간 확인',
    ],
  },
  {
    key: 'api',
    tabLabel: '연동·자동화',
    label: 'INTEGRATION',
    title: '외부 서비스와\n운영 데이터를 연결',
    description:
      '인증, 알림, 파일, 결제, 외부 시스템 API를 운영 흐름에 맞게 연결해 수작업과 중복 입력을 줄였습니다.',
    icon: 'API',
    noteTitle: '연동 상태 가시화',
    noteDescription: '실패·재시도·로그를 함께 관리',
    metrics: [
      { value: '8+', label: '외부 연동 항목' },
      { value: '자동화', label: '반복 작업 감소' },
      { value: '로그', label: '운영 이슈 추적' },
    ],
    items: [
      '서비스 운영에 필요한 외부 API와 내부 데이터 구조 연결',
      '실패 로그, 재시도, 알림 등 운영 중 발생 가능한 상황 반영',
      '보안과 권한을 고려한 인증 흐름 구성',
    ],
  },
];
