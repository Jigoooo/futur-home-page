import type {
  BriefNeed,
  BriefStage,
  CaseStory,
  ContactCheckItem,
  ContactChip,
  ConcernItem,
  FooterColumn,
  NavItem,
  ProcessStep,
  ReviewItem,
  SelectOption,
  ServiceItem,
  TeamRole,
} from '@/types/landing';

export const navigationItems: NavItem[] = [
  { label: '서비스', href: '#services' },
  { label: '프로젝트', href: '#cases' },
  { label: '팀', href: '#team' },
  { label: '프로세스', href: '#process' },
  { label: '문의', href: '#contact' },
];

export const heroPoints = [
  { title: '기획 전 상담 가능', description: '아이디어 단계부터 정리' },
  { title: '범위·일정 투명화', description: '무리 없는 개발 단계 설계' },
  { title: '운영까지 고려', description: '배포 후 개선과 유지보수' },
];

export const concerns: ConcernItem[] = [
  {
    index: '01',
    title: '무엇부터 말해야 할지 모르겠다면',
    description: '목표, 사용자, 필요한 화면부터 천천히 정리합니다.',
    cursorText: '정리',
  },
  {
    index: '02',
    title: '기능 범위가 흐릿하다면',
    description: '우선순위와 MVP 기준으로 개발 단계를 나눕니다.',
    cursorText: '범위',
  },
  {
    index: '03',
    title: '비용과 일정이 걱정된다면',
    description: '필수 범위와 선택 범위를 구분해 무리 없는 계획을 제안합니다.',
    cursorText: '계획',
  },
];

export const briefStages: BriefStage[] = [
  {
    value: '아이디어',
    index: '01',
    label: '아이디어',
    description: '목표와 방향을 정리하는 단계',
  },
  {
    value: '기획 중',
    index: '02',
    label: '기획 중',
    description: '화면과 기능 범위를 구체화하는 단계',
  },
  {
    value: '운영 개선',
    index: '03',
    label: '운영 개선',
    description: '기존 서비스의 문제를 개선하는 단계',
  },
];

export const briefNeeds: BriefNeed[] = [
  {
    value: '웹 서비스',
    label: '웹 서비스',
    description: '랜딩·관리자·포털',
    defaultChecked: true,
  },
  { value: '모바일 앱', label: '모바일 앱', description: '현장 앱·업무 앱' },
  {
    value: '업무 시스템',
    label: '업무 시스템',
    description: 'ERP·WMS·CRM',
    defaultChecked: true,
  },
  { value: 'API 연동', label: 'API 연동', description: '결제·알림·인증' },
];

export const timelineOptions: SelectOption[] = [
  { value: '협의 후 결정', label: '협의 후 결정' },
  { value: '1개월 이내', label: '1개월 이내' },
  { value: '1~3개월', label: '1~3개월' },
  { value: '3개월 이상', label: '3개월 이상' },
];

export const budgetOptions: SelectOption[] = [
  { value: '협의 필요', label: '협의 필요' },
  { value: '500만원 이하', label: '500만원 이하' },
  { value: '500~1,000만원', label: '500~1,000만원' },
  { value: '1,000만원 이상', label: '1,000만원 이상' },
];

export const services: ServiceItem[] = [
  {
    title: '웹·앱 개발',
    description: '사용자가 실제로 쓰기 쉬운 화면과 현장 업무에 맞는 앱을 구현합니다.',
    cursorText: 'WEB',
    icon: 'desktop',
  },
  {
    title: '업무 시스템 구축',
    description: '반복 업무와 수기 관리를 줄이고 데이터 기반으로 일할 수 있는 구조를 만듭니다.',
    cursorText: 'SYS',
    icon: 'system',
  },
  {
    title: '연동·API',
    description:
      '인증, 결제, 알림, 파일 업로드 등 운영에 필요한 외부 서비스를 안정적으로 연결합니다.',
    cursorText: 'API',
    icon: 'link',
  },
  {
    title: '운영·유지보수',
    description: '배포 이후의 오류 대응, 기능 개선, 성능 점검까지 지속적으로 관리합니다.',
    cursorText: 'OPS',
    icon: 'shield',
  },
];

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

export const teamRoles: TeamRole[] = [
  {
    badge: 'PM',
    location: '서울',
    experience: '7년+',
    title: '프로젝트 매니저',
    job: '기획 · 일정 · 커뮤니케이션',
    strength: '요구사항 정리, 범위 조율',
    projectExperience: 'B2B 업무 시스템 / 외주 프로젝트',
    tags: ['기획', '문서화', '커뮤니케이션'],
    cursorText: 'PM',
  },
  {
    badge: 'FE',
    location: '경기',
    experience: '5년+',
    title: '프론트엔드 개발',
    job: '웹 화면 · 상태 관리 · 인터랙션',
    strength: '사용성 높은 화면 구조',
    projectExperience: '관리자, 대시보드, 현장 업무 UI',
    tags: ['React', 'TypeScript', 'TanStack'],
    cursorText: 'FE',
  },
  {
    badge: 'BE',
    location: '서울',
    experience: '6년+',
    title: '백엔드 개발',
    job: 'API · 데이터 · 권한 구조',
    strength: '안정적인 서비스 로직',
    projectExperience: 'ERP, 주문, 재고, 인증 시스템',
    tags: ['Node.js', 'Spring', 'SQL'],
    cursorText: 'BE',
  },
  {
    badge: 'APP',
    location: '서울',
    experience: '4년+',
    title: '모바일 개발',
    job: '현장 앱 · 스캐너 · 사진 업로드',
    strength: '실사용 환경에 맞는 앱 흐름',
    projectExperience: '배송, 검수, 설치, 점검 앱',
    tags: ['Expo', 'Kotlin', 'iOS'],
    cursorText: 'APP',
  },
  {
    badge: 'OPS',
    location: '경기',
    experience: '5년+',
    title: '운영·인프라',
    job: '배포 · 모니터링 · 장애 대응',
    strength: '운영 가능한 배포 환경',
    projectExperience: 'Nginx, PM2, SSL, 서버 운영',
    tags: ['Docker', 'Nginx', 'CI/CD'],
    cursorText: 'OPS',
  },
  {
    badge: 'UX',
    location: '부산',
    experience: '4년+',
    title: 'UI/UX 설계',
    job: '화면 구조 · 디자인 시스템',
    strength: '복잡한 기능의 쉬운 흐름화',
    projectExperience: '랜딩, 관리자, 디자인 시스템',
    tags: ['Figma', 'Prototype', 'Design System'],
    cursorText: 'UX',
  },
];

export const processSteps: ProcessStep[] = [
  {
    index: '01',
    title: '상담 및 분석',
    description: '하고 싶은 일, 현재 문제, 사용자 흐름을 정리해 프로젝트의 기준을 세웁니다.',
  },
  {
    index: '02',
    title: '기획 및 제안',
    description: '필수 기능과 선택 기능을 나누고, 일정과 범위를 현실적으로 제안합니다.',
  },
  {
    index: '03',
    title: '디자인 및 개발',
    description: '사용자 화면과 데이터 흐름을 함께 보며 개발하고, 진행 상황을 공유합니다.',
  },
  {
    index: '04',
    title: '테스트 및 검증',
    description: '업무 시나리오 기준으로 기능을 검증하고 안정성을 높입니다.',
  },
  {
    index: '05',
    title: '배포 및 운영',
    description: '배포 이후에도 오류 대응, 개선, 운영 가이드를 함께 제공합니다.',
  },
];

export const reviews: ReviewItem[] = [
  {
    quote:
      '요구사항이 정리되지 않은 상태였는데, 필요한 범위와 우선순위를 함께 잡아주셔서 프로젝트를 안정적으로 시작할 수 있었습니다.',
    person: '대표이사 김OO',
    context: '온라인 교육 플랫폼',
  },
  {
    quote: '기술적인 부분뿐 아니라 운영 관점에서 필요한 화면을 제안해주셔서 만족도가 높았습니다.',
    person: '서비스 기획자 이OO',
    context: '헬스케어 앱',
  },
  {
    quote: '외부 API 연동과 관리자 화면을 함께 구성해 내부 업무가 훨씬 단순해졌습니다.',
    person: '마케팅 팀장 박OO',
    context: '업무 관리 시스템',
  },
];

export const contactChips: ContactChip[] = [
  { label: '기획서 없이 문의 가능', icon: 'calendar' },
  { label: '빠른 범위 검토', icon: 'clock' },
  { label: '운영까지 고려한 제안', icon: 'shield' },
];

export const contactServices: ContactCheckItem[] = [
  {
    value: '웹·앱 개발',
    title: '웹·앱 개발',
    description: '랜딩·관리자·모바일 화면',
    defaultChecked: true,
  },
  { value: '업무 시스템', title: '업무 시스템', description: 'ERP·WMS·내부 포털' },
  { value: '연동·API', title: '연동·API', description: '인증·결제·알림·파일' },
  {
    value: '운영·유지보수',
    title: '운영·유지보수',
    description: '배포 이후 개선과 대응',
  },
];

export const projectTypeOptions: SelectOption[] = [
  { value: '신규 구축', label: '신규 구축' },
  { value: '기존 서비스 개선', label: '기존 서비스 개선' },
  { value: '운영·유지보수', label: '운영·유지보수' },
  { value: '검토 후 결정', label: '검토 후 결정' },
];

export const replyTypeOptions: SelectOption[] = [
  { value: '이메일', label: '이메일' },
  { value: '전화', label: '전화' },
  { value: '둘 다 가능', label: '둘 다 가능' },
];

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
