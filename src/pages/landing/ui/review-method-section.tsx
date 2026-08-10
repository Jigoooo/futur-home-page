import { reviewMethodRecords } from '../config/review-method';
import { cx } from './lib/cx';
import styles from './styles/review-method.module.css';
import sharedStyles from './styles/shared.module.css';

export function ReviewMethodSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.section)}
      id='review'
      data-landing-section
      data-cursor-contrast='dark'
      aria-labelledby='review-title'
    >
      <div className={sharedStyles.container}>
        <header className={styles.header}>
          <h2 className={styles.title} id='review-title'>
            검토는 취향이 아니라 기준으로 진행합니다.
          </h2>
          <p className={styles.description}>
            목적과 범위를 먼저 맞춥니다. 실제 흐름과 운영 조건을 살피고, 선택한 방향과 근거를
            기록합니다.
          </p>
        </header>
      </div>

      <div className={cx(sharedStyles.container, styles.sceneWrap)}>
        <div className={styles.stage} data-review-stage aria-hidden='true'>
          <div className={styles.mask} data-review-mask aria-hidden='true' />
        </div>
        <div className={styles.groups}>
          {reviewMethodRecords.map((record, index) => (
            <article key={record.title} className={styles.group} data-review-group>
              <span className={styles.marker} aria-hidden='true'>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.groupCopy}>
                <h3>{record.title}</h3>
                <p>{record.description}</p>
              </div>
              <ul aria-label={`${record.title} 검토 기준`}>
                {record.fields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
