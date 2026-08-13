import { technologyCapabilities } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/technology.module.css';

export function TechnologySection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.technology)}
      id='technology'
      data-landing-section
      data-header-surface='dark'
      data-cursor-contrast='light'
    >
      <div className={sharedStyles.container}>
        <h2
          className={cx(
            sharedStyles.sectionTitle,
            styles.title,
            sharedStyles.reveal,
            sharedStyles.revealUp,
          )}
          data-landing-reveal='up'
        >
          기술은 목적과 환경에 맞게 선택합니다.
        </h2>

        <div className={styles.featuredList}>
          {technologyCapabilities.map((capability) => (
            <section
              className={cx(styles.featuredRow, sharedStyles.reveal, sharedStyles.revealUp)}
              key={capability.key}
              data-technology-summary
              data-landing-reveal='up'
            >
              <h3>{capability.label}</h3>
              <p>{capability.featuredTechnologies.join(', ')}</p>
            </section>
          ))}
        </div>

        <details className={styles.details} data-technology-details>
          <summary>기술 범위 전체 보기</summary>
          <div className={styles.fullList}>
            {technologyCapabilities.flatMap((capability) =>
              capability.groups.map((group) => (
                <section
                  className={styles.technologyGroup}
                  key={`${capability.key}-${group.label}`}
                  data-technology-group
                >
                  <div className={styles.groupHeading}>
                    <span>{capability.label}</span>
                    <h3>{group.label}</h3>
                  </div>
                  <p>
                    {group.technologies.map((technology, index) => (
                      <span key={technology} data-technology>
                        {index > 0 ? ', ' : ''}
                        {technology}
                      </span>
                    ))}
                  </p>
                </section>
              )),
            )}
          </div>
        </details>
      </div>
    </section>
  );
}
