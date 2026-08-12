import { teamRoles } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/team.module.css';

export function TeamSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, sharedStyles.section, styles.teamSection)}
      id='team'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container} data-classic-surface>
        <div className={cx(styles.teamLayout, sharedStyles.gridLayout)}>
          <div
            className={cx(sharedStyles.stickyLead, sharedStyles.reveal, sharedStyles.revealLeft)}
            data-landing-reveal='left'
          >
            <span className={sharedStyles.kicker}>Our Team</span>
            <h2 className={sharedStyles.sectionTitle}>
              프로젝트를 움직이는
              <br />
              역할들.
            </h2>
            <p className={sharedStyles.sectionDesc}>
              각자의 전문 영역을 나누되, 프로젝트 목표와 사용자의 업무 흐름은 함께 이해합니다.
            </p>
          </div>
          <div
            className={cx(styles.roleGrid, sharedStyles.twoColumnList)}
            data-landing-reveal='right'
            data-team-role-grid
          >
            {teamRoles.map((role) => (
              <article
                key={role.badge}
                className={styles.roleCard}
                data-team-role-card={role.badge}
              >
                <span className={styles.roleIndex} data-team-role-index>
                  {role.badge}
                </span>
                <h3>{role.title}</h3>
                <p className={styles.roleJob}>{role.responsibility}</p>
                <ul className={styles.roleScopes} aria-label={`${role.title} 역할 범위`}>
                  {role.tags.map((tag) => (
                    <li key={tag} data-team-role-scope>
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
