import { useRef } from 'react';

import { serviceCapabilities } from '../config';
import { cx } from './lib/cx';
import styles from './styles/services.module.css';
import sharedStyles from './styles/shared.module.css';
import { useServiceCardHoverMotion } from './use-service-card-hover-motion';

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useServiceCardHoverMotion(sectionRef);

  return (
    <section
      ref={sectionRef}
      className={cx(sharedStyles.sectionBlock, styles.services)}
      id='services'
      data-landing-section
      data-header-surface='light'
      data-cursor-contrast='dark'
    >
      <div className={cx(sharedStyles.container, styles.intro)} data-service-intro>
        <h2
          className={cx(sharedStyles.sectionTitle, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          새로운 서비스부터,
          <br />
          운영 중인 시스템까지.
        </h2>
        <p
          className={cx(sharedStyles.sectionDesc, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          웹·앱과 업무 시스템을 만들고, 기존 시스템과 AI 기능을 연결하며, 배포 이후 운영까지
          이어갑니다.
        </p>
      </div>

      <div className={cx(sharedStyles.container, styles.gallery)} data-service-gallery>
        {serviceCapabilities.map((capability) => (
          <article
            className={cx(styles.card, styles[capability.tone])}
            id={`service-${capability.key}`}
            key={capability.key}
            data-service-capability={capability.key}
            data-service-card
            data-landing-reveal='up'
          >
            <div className={styles.surface} data-service-card-surface>
              <span className={styles.lens} data-service-card-lens aria-hidden='true' />
              <div className={styles.copy}>
                <span className={styles.index} data-service-card-index>
                  {capability.index}
                </span>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
                <ul aria-label={`${capability.title} 범위`}>
                  {capability.scopes.map((scope) => (
                    <li key={scope}>{scope}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
