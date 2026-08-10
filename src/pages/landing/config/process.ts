import type { ProcessStep } from '../model/types';

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
