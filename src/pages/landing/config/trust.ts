import type { TrustStat } from '../model/types';

// TODO(사용자 확인): 실제 누적 수치로 교체.
export const trustStats: TrustStat[] = [
  { value: '30+', label: '누적 프로젝트', caption: '운영까지 함께' },
  { value: '4년+', label: '평균 운영 동행', caption: '배포 이후도 함께' },
  { value: '95%+', label: '재의뢰율', caption: '계속 함께하는 이유' },
  { value: '24h', label: '평균 회신', caption: '빠른 첫 답변' },
];
