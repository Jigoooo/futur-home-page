import { Check } from 'lucide-react';

import { cx } from './lib/cx';
import styles from './styles/delivery.module.css';
import sharedStyles from './styles/shared.module.css';

const deliverySteps = [
  {
    index: '01',
    title: '문제와 범위 정렬',
    description: '사용자·운영자 흐름과 필수 범위를 먼저 맞춥니다.',
  },
  {
    index: '02',
    title: '화면과 구조 설계',
    description: '화면, 권한, 상태, 데이터와 연동 기준을 함께 정리합니다.',
  },
  {
    index: '03',
    title: '시나리오 기준 구현',
    description: '실제 업무 순서에 맞춰 개발하고 검증 가능한 단위로 공유합니다.',
  },
  {
    index: '04',
    title: '배포와 운영 인계',
    description: '배포 체크와 운영 기준, 코드와 문서를 인계 가능한 상태로 정리합니다.',
  },
];

const handoffItems = [
  '소스 코드와 환경 구성',
  '화면·권한·상태 기준',
  '배포 체크리스트',
  '운영 이슈와 후속 항목',
];

export function DeliverySection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.deliverySection)}
      id='delivery'
      data-landing-section='delivery'
    >
      <div className={sharedStyles.container}>
        <div className={styles.heading}>
          <div>
            <span className={sharedStyles.kicker}>Delivery</span>
            <h2 className={sharedStyles.sectionTitle}>
              만드는 과정과
              <br />
              넘겨드리는 기준.
            </h2>
          </div>
          <p className={sharedStyles.sectionDesc}>
            진행 단계와 운영 인계가 분리되지 않도록, 시작부터 마지막 전달물까지 같은 기준으로
            관리합니다.
          </p>
        </div>
        <div className={styles.layout}>
          <ol className={styles.steps}>
            {deliverySteps.map((step) => (
              <li key={step.index}>
                <span>{step.index}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <aside className={styles.handoff} aria-label='운영 인계 항목'>
            <span>HANDOFF PACKAGE</span>
            <h3>다음 담당자가 이어갈 수 있게.</h3>
            <ul>
              {handoffItems.map((item) => (
                <li key={item}>
                  <Check size={17} aria-hidden='true' />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
