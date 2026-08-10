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
      <div className={sharedStyles.container}>
        <div className={styles.head} data-reveal>
          <h2 className={sharedStyles.sectionTitle}>기술 스택</h2>
          <p className={sharedStyles.sectionDesc}>
            현재 제품 구현과 품질 검증에 사용하는 도구를 역할별로 정리했습니다.
          </p>
        </div>
        <div className={styles.groups}>
          {stackGroups.map((group) => (
            <section
              key={group.key}
              className={styles.group}
              aria-labelledby={`stack-${group.key}`}
            >
              <h3 id={`stack-${group.key}`}>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
