import type { ReviewItem } from '../model/types';

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
