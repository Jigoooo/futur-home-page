import { processSteps } from '../config';
import { cx } from './lib/cx';
import styles from './styles/process.module.css';
import sharedStyles from './styles/shared.module.css';

export function ProcessSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.processSection)}
      id='process'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container}>
        <div className={styles.processLead} data-reveal>
          <h2 className={cx(sharedStyles.sectionTitle, styles.processTitle)}>진행 프로세스</h2>
          <p className={cx(sharedStyles.sectionDesc, styles.processDesc)}>
            필요한 범위와 기준을 맞춘 뒤 설계, 구현, 검증, 운영 순서로 진행합니다.
          </p>
        </div>
        <ol className={styles.processList}>
          {processSteps.map((step) => (
            <li key={step.index} className={styles.step} data-reveal>
              <span className={styles.stepNo} aria-hidden='true'>
                {step.index}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
