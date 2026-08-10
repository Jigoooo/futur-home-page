import { processSteps } from '../config';
import { EditorialTextReveal } from './editorial-text-reveal';
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
        <div className={styles.processLead}>
          <div className={styles.leadCopy}>
            <EditorialTextReveal
              as='h2'
              className={cx(sharedStyles.sectionTitle, styles.processTitle)}
              lines={['확인하고 정리하고', '검토하며 진행합니다.']}
              split='lines'
              trigger='in-view'
              accessibleLabel='확인하고 정리하고 검토하며 진행합니다.'
            />
            <p className={cx(sharedStyles.sectionDesc, styles.processDesc)}>
              필요한 범위와 기준을 먼저 맞추고 설계·구현·검토 결과를 다음 단계에 반영합니다.
            </p>
          </div>
        </div>

        <div className={styles.processScene}>
          <svg className={styles.pathVisual} viewBox='0 0 900 520' aria-hidden='true'>
            <path
              className={styles.path}
              data-process-path
              pathLength='1'
              d='M20 480C190 340 260 420 370 285C500 125 630 285 880 34'
            />
            <circle className={styles.markerVisual} data-process-marker cx='20' cy='480' r='12' />
          </svg>
          <ol className={styles.processList}>
            {processSteps.map((step) => (
              <li key={step.index} className={styles.step} data-process-step>
                <span className={styles.stepNo} aria-hidden='true'>
                  {step.index}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
