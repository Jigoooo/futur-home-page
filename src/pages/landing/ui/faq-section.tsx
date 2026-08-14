import { faqItems } from '../config';
import { cx } from './lib/cx';
import styles from './styles/faq.module.css';
import sharedStyles from './styles/shared.module.css';

export function FaqSection() {
  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.faqSection)}
      id='faq'
      data-landing-section
      data-header-surface='light'
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container} data-classic-surface>
        <div
          className={cx(styles.head, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <h2 className={cx(sharedStyles.sectionTitle, styles.title)}>자주 묻는 질문</h2>
        </div>
        <ol className={styles.list}>
          {faqItems.map((item, index) => (
            <li
              key={item.question}
              className={cx(styles.item, sharedStyles.reveal, sharedStyles.revealUp)}
              data-faq-item
              data-landing-reveal='up'
            >
              <span className={styles.index} aria-hidden='true'>
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
