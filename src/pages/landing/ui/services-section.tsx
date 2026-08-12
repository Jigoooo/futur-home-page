import { cx } from './lib/cx';
import { ServicesCapabilityMap } from './services-capability-map';
import styles from './styles/services.module.css';
import sharedStyles from './styles/shared.module.css';

export function ServicesSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, sharedStyles.bgSoft, sharedStyles.section)}
      id='services'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container} data-classic-surface>
        <div className={cx(styles.serviceLayout, sharedStyles.gridLayout)}>
          <div
            className={cx(styles.serviceLead, sharedStyles.reveal, sharedStyles.revealLeft)}
            data-landing-reveal='left'
          >
            <h2 className={sharedStyles.sectionTitle}>
              기술보다 먼저,
              <br />
              쓰임을 생각합니다.
            </h2>
            <p className={sharedStyles.sectionDesc}>
              사용자와 운영자가 실제로 마주하는 흐름을 살피고, 필요한 기능과 시스템을 그에 맞게
              설계합니다.
            </p>
          </div>
          <div
            className={cx(styles.capabilityFlow, sharedStyles.reveal, sharedStyles.revealRight)}
            data-landing-reveal='right'
          >
            <ServicesCapabilityMap />
          </div>
        </div>
      </div>
    </section>
  );
}
