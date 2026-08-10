import { trustStats } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/trust.module.css';

export function TrustSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.trustSection)}
      aria-label='함께한 기록'
    >
      <div className={sharedStyles.container}>
        <dl
          className={cx(styles.grid, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          {trustStats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.value}>{stat.value}</dt>
              <dd className={styles.body}>
                <strong>{stat.label}</strong>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
