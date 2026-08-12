import { servicePhases } from '../config';
import { Icon } from './icons';
import styles from './styles/services.module.css';

export function ServicesCapabilityMap() {
  return (
    <ol className={styles.capabilityMap} data-capability-map aria-label='서비스 제공 단계'>
      {servicePhases.map((phase) => (
        <li
          key={phase.key}
          className={styles.phase}
          data-capability-phase
          data-service-phase={phase.key}
        >
          <div className={styles.phaseMarker} aria-hidden='true'>
            <span>{phase.index}</span>
          </div>
          <header className={styles.phaseHeader}>
            <span className={styles.phaseLabel} data-service-phase-label>
              {phase.label}
            </span>
            <h3>{phase.title}</h3>
          </header>
          <div className={styles.phaseServices}>
            {phase.services.map((service) => (
              <article key={service.title} className={styles.serviceItem}>
                <div className={styles.serviceIcon} data-landing-service-icon>
                  <Icon name={service.icon} />
                </div>
                <div className={styles.serviceCopy}>
                  <h4>{service.title}</h4>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
