import { ArrowRight } from 'lucide-react';

import { services } from '../config';
import { EditorialTextReveal } from './editorial-text-reveal';
import { Icon } from './icons';
import { cx } from './lib/cx';
import styles from './styles/services.module.css';
import sharedStyles from './styles/shared.module.css';

export function ServicesSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.serviceChapter)}
      id='services'
      data-editorial-chapter='services'
    >
      <div className={sharedStyles.container}>
        <div className={cx(styles.serviceLayout, sharedStyles.gridLayout)}>
          <div className={styles.serviceLead} data-services-sticky>
            <EditorialTextReveal
              as='h2'
              className={cx(sharedStyles.sectionTitle, styles.serviceTitle)}
              lines={['비즈니스에 필요한', '개발 과정을', '한 흐름으로.']}
              split='lines'
              trigger='in-view'
              accessibleLabel='비즈니스에 필요한 개발 과정을 한 흐름으로.'
            />
            <p className={cx(sharedStyles.sectionDesc, styles.serviceDesc)}>
              화면만 만드는 것이 아니라, 사용 방식·데이터·운영까지 연결해 실제로 굴러가는 서비스를
              만듭니다.
            </p>
          </div>
          <div className={styles.serviceList}>
            {services.map((service, index) => (
              <article
                key={service.title}
                className={styles.serviceCard}
                data-service-row
                data-service-index={index}
                data-cursor-text={service.cursorText}
              >
                <div className={styles.serviceIcon} data-landing-service-icon>
                  <Icon name={service.icon} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a className={styles.cardLink} href='#contact' data-landing-interactive='card-link'>
                  자세히 보기{' '}
                  <i data-landing-arrow>
                    <ArrowRight size={14} strokeWidth={2.2} />
                  </i>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
