import { teamRoles } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/team.module.css';

export function TeamSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, sharedStyles.section, styles.teamSection)}
      id='team'
      data-landing-section='team'
    >
      <div className={sharedStyles.container}>
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
            className={cx(
              styles.roleGrid,
              sharedStyles.twoColumnList,
              sharedStyles.reveal,
              sharedStyles.revealRight,
            )}
            data-landing-reveal='right'
          >
            {teamRoles.map((role) => (
              <article key={role.badge} className={styles.roleCard}>
                <div className={styles.roleTop}>
                  <div className={styles.roleBadge}>{role.badge}</div>
                </div>
                <h3>{role.title}</h3>
                <div className={styles.roleJob}>{role.job}</div>
                <div className={styles.roleInfo}>
                  <div>
                    <strong>강점</strong>
                    {role.strength}
                  </div>
                  <div>
                    <strong>경험</strong>
                    {role.projectExperience}
                  </div>
                </div>
                <div className={styles.tags}>
                  {role.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
