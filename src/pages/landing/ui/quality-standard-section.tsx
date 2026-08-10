import { cx } from './lib/cx';
import styles from './styles/quality-standard.module.css';
import sharedStyles from './styles/shared.module.css';

export function QualityStandardSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.section)}
      id='quality'
      data-landing-section
      data-cursor-contrast='dark'
      aria-labelledby='quality-title'
    >
      <div className={cx(sharedStyles.container, styles.copy)} data-quality-copy data-scene-target>
        <p className={styles.statement}>품질 기준</p>
        <h2 className={styles.title} id='quality-title'>
          화면에서 시작해 제품의 구조까지 이어집니다.
        </h2>
        <p className={styles.description}>
          사용자가 만나는 흐름과 팀이 운영할 구조를 분리하지 않습니다.
        </p>
        <div className={styles.stage} data-quality-stage data-scene-target aria-hidden='true'>
          <i className={styles.orb} data-quality-orb='charcoal' />
          <i className={styles.orb} data-quality-orb='blue' />
        </div>
      </div>
    </section>
  );
}
