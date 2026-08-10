import { ArrowRight } from 'lucide-react';

import { services } from '../config';
import { Icon } from './icons';
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
    >
      <div className={sharedStyles.container}>
        <div className={styles.serviceLead} data-reveal>
          <h2 className={cx(sharedStyles.sectionTitle, styles.serviceTitle)}>제공 서비스</h2>
          <p className={cx(sharedStyles.sectionDesc, styles.serviceDesc)}>
            화면 경험부터 업무 시스템, 외부 연동과 운영까지 필요한 범위를 함께 만듭니다.
          </p>
        </div>
        <div className={styles.serviceList}>
          {services.map((service) => (
            <article key={service.title} className={styles.serviceCard} data-reveal>
              <span className={styles.serviceIcon} aria-hidden='true'>
                <Icon name={service.icon} />
              </span>
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
    </section>
  );
}
