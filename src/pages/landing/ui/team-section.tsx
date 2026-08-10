import { teamRoles } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/team.module.css';

export function TeamSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.teamSection)}
      id='team'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container}>
        <div className={styles.head} data-reveal>
          <h2 className={sharedStyles.sectionTitle}>프로젝트를 함께 움직이는 역할</h2>
          <p className={sharedStyles.sectionDesc}>
            역할별 전문성을 바탕으로 요구사항부터 운영과 인수인계까지 연결합니다.
          </p>
        </div>
        <div className={styles.roleList}>
          {teamRoles.map((role) => (
            <article key={role.badge} className={styles.roleCard} data-reveal>
              <span className={styles.badge} aria-hidden='true'>
                {role.badge}
              </span>
              <h3>{role.title}</h3>
              <p>{role.responsibility}</p>
              <ul aria-label={`${role.title} 담당 영역`}>
                {role.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
