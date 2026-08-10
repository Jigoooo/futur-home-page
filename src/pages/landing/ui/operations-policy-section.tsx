import { operationsPolicies } from '../config';
import { Icon } from './icons';
import { cx } from './lib/cx';
import styles from './styles/operations-policy.module.css';
import sharedStyles from './styles/shared.module.css';

export function OperationsPolicySection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.operationsSection)}
      id='operations'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container}>
        <div className={styles.head} data-reveal>
          <h2 className={sharedStyles.sectionTitle}>운영 원칙</h2>
          <p className={sharedStyles.sectionDesc}>
            프로젝트 시작부터 종료 이후까지 필요한 운영 조건과 인계 범위를 문서로 남깁니다.
          </p>
        </div>
        <div className={styles.policyList}>
          {operationsPolicies.map((policy) => (
            <article key={policy.title} className={styles.policyCard} data-reveal>
              <span className={styles.icon} aria-hidden='true'>
                <Icon name={policy.icon} />
              </span>
              <h3>{policy.title}</h3>
              <p>{policy.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
