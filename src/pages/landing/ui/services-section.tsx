import { ArrowRight } from 'lucide-react';

import { services } from '../config';
import { EditorialTextReveal } from './editorial-text-reveal';
import { cx } from './lib/cx';
import styles from './styles/services.module.css';
import sharedStyles from './styles/shared.module.css';

export function ServicesSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.serviceChapter)}
      id='services'
      data-landing-section
      data-cursor-contrast='dark'
      data-editorial-chapter='services'
    >
      <div className={sharedStyles.container}>
        <div className={styles.serviceLead}>
          <div className={styles.leadCopy}>
            <EditorialTextReveal
              as='h2'
              className={cx(sharedStyles.sectionTitle, styles.serviceTitle)}
              lines={['필요한 영역을 연결해', '하나의 제품으로 만듭니다.']}
              split='lines'
              trigger='in-view'
              accessibleLabel='필요한 영역을 연결해 하나의 제품으로 만듭니다.'
            />
            <p className={cx(sharedStyles.sectionDesc, styles.serviceDesc)}>
              화면 경험, 코드와 데이터 구조, 배포 후 운영을 따로 떼어 보지 않습니다.
            </p>
          </div>
        </div>

        <div className={styles.serviceBody}>
          <div className={styles.merge} data-service-merge data-scene-target aria-hidden='true'>
            {['blue', 'slate', 'taupe', 'olive'].map((tone) => (
              <i key={tone} data-service-layer={tone} />
            ))}
            <i data-service-core />
          </div>

          <div className={styles.serviceList}>
            {services.map((service) => (
              <article key={service.title} className={styles.serviceRow} data-service-row>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a className={styles.serviceLink} href='#contact'>
                  문의하기
                  <ArrowRight size={15} strokeWidth={1.8} aria-hidden='true' />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
