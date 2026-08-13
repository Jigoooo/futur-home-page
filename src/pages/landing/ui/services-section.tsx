import { serviceCapabilities } from '../config';
import { cx } from './lib/cx';
import styles from './styles/services.module.css';
import sharedStyles from './styles/shared.module.css';
import { useCurrentServiceCapability } from './use-current-service-capability';

export function ServicesSection() {
  const currentCapability = useCurrentServiceCapability();

  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.services)}
      id='services'
      data-landing-section
    >
      <div
        className={styles.intro}
        data-service-intro
        data-header-surface='dark'
        data-cursor-contrast='light'
      >
        <div className={styles.introContent} data-landing-reveal='up'>
          <h2 className={sharedStyles.sectionTitle}>만들고, 연결하고, 운영까지 이어갑니다.</h2>
          <p className={sharedStyles.sectionDesc}>
            새로운 서비스부터 기존 업무 시스템의 개선까지. 필요한 범위를 함께 정리하고 목적에 맞는
            기술로 구현합니다.
          </p>
        </div>
      </div>

      <div
        className={styles.serviceLayout}
        data-service-layout
        data-header-surface='light'
        data-cursor-contrast='dark'
      >
        <aside
          className={styles.serviceIndex}
          data-service-sticky-index
          data-landing-reveal='up'
          aria-hidden='true'
        >
          <ol>
            {serviceCapabilities.map((capability) => (
              <li
                className={styles.progressItem}
                key={capability.key}
                data-service-progress-item
                data-current={currentCapability === capability.key ? 'true' : undefined}
              >
                <span>{capability.index}</span>
                <span>{capability.title}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className={styles.serviceChapters}>
          {serviceCapabilities.map((capability) => (
            <article
              className={styles.serviceChapter}
              id={`service-${capability.key}`}
              key={capability.key}
              data-service-capability={capability.key}
              data-landing-reveal='up'
            >
              <span className={styles.chapterIndex} data-service-chapter-index>
                {capability.index}
              </span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <ul aria-label={`${capability.title} 범위`}>
                {capability.scopes.map((scope) => (
                  <li key={scope}>{scope}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
