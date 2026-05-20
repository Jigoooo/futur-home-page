import { services } from '../config';
import { Icon } from './icons';
import { cx } from './lib/cx';
import styles from './styles/services.module.css';
import sharedStyles from './styles/shared.module.css';

export function ServicesSection() {
  return (
    <section className={cx(sharedStyles.section, sharedStyles.container)} id='services'>
      <div className={cx(styles.serviceLayout, sharedStyles.gridLayout)}>
        <div
          className={cx(sharedStyles.reveal, sharedStyles.revealLeft)}
          data-landing-reveal='left'
        >
          <span className={sharedStyles.kicker}>Our Services</span>
          <h2 className={sharedStyles.sectionTitle}>
            <span className={sharedStyles.nowrap}>비즈니스에 필요한</span>
            <br />
            개발 과정을
            <br className={sharedStyles.desktopBreak} /> 한 흐름으로.
          </h2>
          <p className={sharedStyles.sectionDesc}>
            화면만 만드는 것이 아니라, 사용 방식·데이터·운영까지 연결해 실제로 굴러가는 서비스를
            만듭니다.
          </p>
        </div>
        <div
          className={cx(
            styles.serviceList,
            sharedStyles.twoColumnList,
            sharedStyles.reveal,
            sharedStyles.revealRight,
          )}
          data-landing-reveal='right'
        >
          {services.map((service) => (
            <article
              key={service.title}
              className={styles.serviceCard}
              data-landing-card
              data-landing-spotlight='card'
              data-cursor-text={service.cursorText}
            >
              <div className={styles.serviceIcon} data-landing-service-icon>
                <Icon name={service.icon} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a className={styles.cardLink} href='#contact' data-landing-interactive='card-link'>
                자세히 보기 <i data-landing-arrow>→</i>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
