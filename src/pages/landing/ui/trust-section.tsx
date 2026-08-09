import { trustStats } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/trust.module.css';

export function TrustSection() {
  return (
    <section className={cx(sharedStyles.sectionBlock, styles.trustSection)}>
      <div className={sharedStyles.container}>
        <div
          className={cx(styles.head, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <span className={sharedStyles.kicker}>Why FUTUR</span>
          <h2 className={cx(sharedStyles.sectionTitle, styles.title)}>숫자로 보는 함께한 시간.</h2>
        </div>
        <dl
          className={cx(styles.grid, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          {trustStats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.value}>{stat.value}</dt>
              <dd className={styles.body}>
                <strong>{stat.label}</strong>
                {stat.caption ? <em>{stat.caption}</em> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
