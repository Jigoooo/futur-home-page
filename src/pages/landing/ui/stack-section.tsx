import { stackItems } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/stack.module.css';

const STACK_GROUPS = ['Frontend', 'Mobile', 'Backend', 'Data · Infra', 'Design'] as const;

export function StackSection() {
  return (
    <section className={cx(styles.stackSection, sharedStyles.container)}>
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
        {STACK_GROUPS.map((group) => {
          const items = stackItems.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className={styles.group}>
              <div className={styles.groupLabel}>{group}</div>
              <ul className={styles.chips}>
                {items.map((item) => (
                  <li key={item.name} className={styles.chip}>
                    <span className={styles.dot} aria-hidden='true' />
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
