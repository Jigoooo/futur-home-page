import { faqItems } from '../config';
import { cx } from './lib/cx';
import styles from './styles/faq.module.css';
import sharedStyles from './styles/shared.module.css';

export function FaqSection() {
  return (
    <section className={cx(styles.faqSection, sharedStyles.container)} id='faq'>
      <div
        className={cx(styles.head, sharedStyles.reveal, sharedStyles.revealUp)}
        data-landing-reveal='up'
      >
        <span className={sharedStyles.kicker}>FAQ</span>
        <h2 className={cx(sharedStyles.sectionTitle, styles.title)}>자주 묻는 질문.</h2>
        <p className={sharedStyles.sectionDesc}>
          문의 전에 가장 많이 물어보시는 내용을 정리했습니다.
        </p>
      </div>
      <div
        className={cx(styles.list, sharedStyles.reveal, sharedStyles.revealUp)}
        data-landing-reveal='up'
      >
        {faqItems.map((item) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.summary}>
              <span className={styles.question}>{item.question}</span>
              <span className={styles.toggle} aria-hidden='true'>
                <svg viewBox='0 0 14 14' width='14' height='14' fill='none' stroke='currentColor'>
                  <path
                    d='M3 6l4 4 4-4'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
            </summary>
            <p className={styles.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
