export interface ReviewMethodRecord {
  title: string;
  description: string;
  fields: readonly string[];
}

export const reviewMethodRecords: readonly ReviewMethodRecord[] = [
  {
    title: '목적과 범위',
    description: '해결할 문제를 먼저 확인하고, 이번 작업에서 다룰 범위를 나눕니다.',
    fields: ['목적', '우선순위', '범위'],
  },
  {
    title: '흐름과 상태',
    description: '사용자와 운영자의 흐름을 따라 화면, 상태 변화, 데이터 이동을 함께 살핍니다.',
    fields: ['사용 흐름', '상태 변화', '데이터'],
  },
  {
    title: '오류와 운영',
    description: '정상 동작과 함께 실패·복구, 운영 중 살펴야 할 조건까지 검토합니다.',
    fields: ['오류', '복구', '운영'],
  },
  {
    title: '의사결정 기록',
    description: '선택한 방향과 제외한 범위, 판단 근거를 기록해 다음 결정에 활용합니다.',
    fields: ['선택', '제외', '판단 근거'],
  },
];
