import type { ProcessStep } from '../model/types';

export const processSteps: ProcessStep[] = [
  {
    index: '01',
    title: '요청 확인',
    description: '현재 상황, 만들고 싶은 결과, 주요 사용자를 확인합니다.',
  },
  {
    index: '02',
    title: '범위 정리',
    description: '필요한 기능과 우선순위, 검토할 조건을 정리합니다.',
  },
  {
    index: '03',
    title: '설계와 구현',
    description: '사용자 화면과 코드·데이터 구조를 함께 설계하고 구현합니다.',
  },
  {
    index: '04',
    title: '검토와 수정',
    description: '주요 사용 흐름을 살피고 발견한 문제를 수정합니다.',
  },
  {
    index: '05',
    title: '배포와 운영',
    description: '배포 조건을 확인한 뒤 서비스를 배포하고, 운영 단계의 변경을 관리합니다.',
  },
];
