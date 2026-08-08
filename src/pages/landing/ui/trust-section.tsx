import { trustCriteria } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/trust.module.css';

export function TrustSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.trustSection)}
      data-landing-section='why'
    >
      <div className={sharedStyles.container}>
        <div
          className={cx(styles.head, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <span className={sharedStyles.kicker}>Why FUTUR</span>
          <h2 className={cx(sharedStyles.sectionTitle, styles.title)}>
            결과를 만드는 세 가지 기준.
          </h2>
        </div>
        <ol
          className={cx(styles.grid, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          {trustCriteria.map((criterion) => (
            <li key={criterion.index} className={styles.stat}>
              <span className={styles.value}>{criterion.index}</span>
              <div className={styles.body}>
                <strong>{criterion.title}</strong>
                <p>{criterion.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
