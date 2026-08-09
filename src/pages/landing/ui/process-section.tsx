import { processSteps } from '../config';
import { cx } from './lib/cx';
import styles from './styles/process.module.css';
import sharedStyles from './styles/shared.module.css';

export function ProcessSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, sharedStyles.bgSoft, styles.processSection)}
      id='process'
    >
      <div className={sharedStyles.container}>
        <div className={cx(styles.processLayout, sharedStyles.gridLayout)}>
          <div
            className={cx(sharedStyles.stickyLead, sharedStyles.reveal, sharedStyles.revealLeft)}
            data-landing-reveal='left'
          >
            <span className={sharedStyles.kicker}>Process</span>
            <h2 className={sharedStyles.sectionTitle}>
              가볍게 시작하고,
              <br />
              명확하게 진행합니다.
            </h2>
            <p className={sharedStyles.sectionDesc}>
              처음부터 모든 것을 확정하기보다, 필요한 범위를 정리하고 우선순위에 따라 단계적으로
              진행합니다.
            </p>
          </div>
          <div
            className={cx(styles.timeline, sharedStyles.reveal, sharedStyles.revealRight)}
            data-landing-reveal='timeline'
          >
            {processSteps.map((step) => (
              <div key={step.index} className={styles.step}>
                <div className={styles.stepNo}>{step.index}</div>
                <div className={styles.stepCard}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
