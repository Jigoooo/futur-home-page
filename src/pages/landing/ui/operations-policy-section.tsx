import { operationsPolicies } from '../config';
import { Icon } from './icons';
import { cx } from './lib/cx';
import styles from './styles/operations-policy.module.css';
import sharedStyles from './styles/shared.module.css';

export function OperationsPolicySection() {
  return (
    <section className={cx(styles.opsSection, sharedStyles.container)}>
      <div
        className={cx(styles.head, sharedStyles.reveal, sharedStyles.revealUp)}
        data-landing-reveal='up'
      >
        <span className={sharedStyles.kicker}>Operations</span>
        <h2 className={cx(sharedStyles.sectionTitle, styles.title)}>
          만드는 것에서
          <br />
          끝나지 않습니다.
        </h2>
        <p className={sharedStyles.sectionDesc}>
          운영·보안·인수인계까지 명문화된 기준으로 진행합니다.
        </p>
      </div>
      <div
        className={cx(styles.grid, sharedStyles.reveal, sharedStyles.revealUp)}
        data-landing-reveal='up'
      >
        {operationsPolicies.map((policy) => (
          <article key={policy.title} className={styles.card}>
            <div className={styles.iconBox} aria-hidden='true'>
              <Icon name={policy.icon} />
            </div>
            <h3 className={styles.cardTitle}>{policy.title}</h3>
            <p className={styles.cardDesc}>{policy.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
