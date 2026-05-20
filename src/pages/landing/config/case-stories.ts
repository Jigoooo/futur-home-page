import type { CaseStory } from '../model/types';

export const caseStories: CaseStory[] = [
  {
    key: 'system',
    tabLabel: '업무 시스템',
    label: 'B2B SYSTEM',
    title: '내부 업무 시스템을\n한 화면으로 정리',
    description:
      '요청, 처리 상태, 승인 흐름이 여러 도구에 흩어져 있던 문제를 한 화면의 업무 흐름으로 묶어 반복 확인을 줄였습니다.',
    icon: 'SYS',
    noteTitle: '처리 흐름 단순화',
    noteDescription: '요청·처리·완료 상태를 명확하게 구분',
    metrics: [
      { value: '42%', label: '반복 확인 감소' },
      { value: '12+', label: '핵심 화면 구성' },
      { value: '운영', label: '개선 지표 추적' },
    ],
    items: [
      '문제: 요청 상태와 승인 기준이 분리되어 담당자 확인이 반복됨',
      '구성: 등록, 처리, 완료 상태와 권한별 화면을 한 흐름으로 설계',
      '운영 결과: 누락 여부와 처리 이력을 같은 화면에서 추적',
    ],
  },
  {
    key: 'mobile',
    tabLabel: '모바일 앱',
    label: 'FIELD MOBILE',
    title: '현장 업무를 위한\n모바일 앱 구축',
    description:
      '사진 업로드, 바코드 스캔, 체크리스트처럼 현장에서 반복되는 입력을 업무 순서에 맞게 배치했습니다.',
    icon: 'APP',
    noteTitle: '현장 입력 최소화',
    noteDescription: '사진·스캔·체크로 빠르게 처리',
    metrics: [
      { value: '35%', label: '입력 시간 단축' },
      { value: '5개', label: '주요 업무 흐름' },
      { value: '모바일', label: '현장 사용 최적화' },
    ],
    items: [
      '문제: 현장 입력이 길어지고 사무실 재확인이 자주 발생함',
      '구성: 촬영, 스캔, 체크리스트를 실제 작업 순서대로 배치',
      '운영 결과: 관리자 화면과 연결해 진행 상태와 누락 항목을 확인',
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
      '문제: 외부 서비스 상태를 사람이 확인하고 다시 입력해야 했음',
      '구성: API 연동, 인증, 파일, 알림 흐름을 내부 데이터와 연결',
      '운영 결과: 실패 로그와 재시도 기준을 함께 관리하도록 구성',
    ],
  },
];
