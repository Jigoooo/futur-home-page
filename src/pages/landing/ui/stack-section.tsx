import { stackGroups } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/stack.module.css';

export function StackSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.stackSection)}
      id='stack'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container} data-classic-surface>
        <div
          className={cx(styles.head, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <span className={sharedStyles.kicker}>Stack</span>
          <h2 className={cx(sharedStyles.sectionTitle, styles.title)}>
            이미 검증된 도구로,
            <br />
            안정적으로 만듭니다.
          </h2>
          <p className={sharedStyles.sectionDesc}>
            새 기술을 무리하게 도입하기보다, 신뢰할 수 있는 스택을 깊게 사용합니다.
          </p>
        </div>
        <div
          className={cx(styles.groups, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          {stackGroups.map((group) => (
            <section
              key={group.key}
              className={styles.group}
              aria-labelledby={`stack-${group.key}`}
            >
              <h3 className={styles.groupLabel} id={`stack-${group.key}`}>
                {group.title}
              </h3>
              <ul className={styles.chips}>
                {group.items.map((item) => (
                  <li key={item} className={styles.chip}>
                    <span className={styles.dot} aria-hidden='true' />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
