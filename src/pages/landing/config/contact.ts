import type { BriefStage, ContactCheckItem, ContactChip, SelectOption } from '../model/types';

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

export const contactChips: ContactChip[] = [
  { label: '기획서 없이 문의 가능', icon: 'calendar' },
  { label: '빠른 범위 검토', icon: 'clock' },
  { label: '운영까지 고려한 제안', icon: 'shield' },
];

export const contactServices: ContactCheckItem[] = [
  { value: '웹·앱 개발', title: '웹·앱 개발', description: '랜딩·관리자·모바일 화면' },
  { value: '업무 시스템', title: '업무 시스템', description: 'ERP·WMS·내부 포털' },
  { value: '연동·API', title: '연동·API', description: '인증·결제·알림·파일' },
  { value: '운영·유지보수', title: '운영·유지보수', description: '배포 이후 개선과 대응' },
];

export const replyTypeOptions: SelectOption[] = [
  { value: '이메일', label: '이메일' },
  { value: '전화', label: '전화' },
  { value: '둘 다 가능', label: '둘 다 가능' },
];
