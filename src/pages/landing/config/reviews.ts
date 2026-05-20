import type { ReviewItem } from '../model/types';

export const reviews: ReviewItem[] = [
  {
    quote:
      '요구사항이 흩어져 있던 상태에서 꼭 필요한 범위와 이후에 미뤄도 되는 범위를 나눠주셔서, 시작 기준을 빠르게 잡을 수 있었습니다.',
    person: '온라인 교육 플랫폼 대표',
    context: '초기 서비스 구축',
  },
  {
    quote:
      '화면 구현만 이야기하지 않고 운영자가 실제로 확인해야 하는 상태와 예외 흐름까지 같이 정리해준 점이 좋았습니다.',
    person: '헬스케어 앱 기획 리드',
    context: '모바일 업무 흐름 개선',
  },
  {
    quote:
      '외부 API 연동, 관리자 화면, 실패 로그를 한 흐름으로 묶어주면서 반복 확인과 수기 입력이 줄었습니다.',
    person: 'B2B 운영 시스템 담당자',
    context: '연동·관리자 화면 구축',
  },
];
