import { operationsPolicies } from '../config';
import { EditorialTextReveal } from './editorial-text-reveal';
import { Icon } from './icons';
import { cx } from './lib/cx';
import styles from './styles/operations-policy.module.css';
import sharedStyles from './styles/shared.module.css';

export function OperationsPolicySection() {
  return (
    <section className={cx(sharedStyles.sectionBlock, sharedStyles.bgDark, styles.opsSection)}>
      <div className={sharedStyles.container}>
        <div
          className={cx(styles.head, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <EditorialTextReveal
            as='h2'
            className={cx(sharedStyles.sectionTitle, styles.title)}
            lines={['만드는 것에서', '끝나지 않습니다.']}
            split='lines'
            trigger='in-view'
            accessibleLabel='만드는 것에서 끝나지 않습니다.'
          />
          <p className={cx(sharedStyles.sectionDesc, styles.desc)}>
            운영·보안·인수인계까지 명문화된 기준으로 진행합니다.
          </p>
        </div>
        <div
          className={cx(styles.grid, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          {operationsPolicies.map((policy) => (
            <article key={policy.title} className={styles.card}>
              <div className={styles.iconBox} aria-hidden='true'>
                <Icon name={policy.icon} />
              </div>
              <h3 className={styles.cardTitle}>{policy.title}</h3>
              <p className={styles.cardDesc}>{policy.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
