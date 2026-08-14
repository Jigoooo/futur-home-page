import { Plus } from 'lucide-react';
import { useState } from 'react';

import { faqItems } from '../config';
import { cx } from './lib/cx';
import styles from './styles/faq.module.css';
import sharedStyles from './styles/shared.module.css';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
              data-open={openIndex === index ? 'true' : 'false'}
              data-landing-reveal='up'
            >
              <span className={styles.index} aria-hidden='true'>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.disclosure}>
                <h3 className={styles.question}>
                  <button
                    id={`faq-question-${index + 1}`}
                    className={styles.trigger}
                    type='button'
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index + 1}`}
                    data-faq-trigger
                    onClick={() => {
                      setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
                    }}
                  >
                    <span>{item.question}</span>
                    <span className={styles.icon} data-faq-icon aria-hidden='true'>
                      <Plus size={17} strokeWidth={2} />
                    </span>
                  </button>
                </h3>
                <section
                  id={`faq-answer-${index + 1}`}
                  className={styles.panel}
                  aria-labelledby={`faq-question-${index + 1}`}
                  aria-hidden={openIndex !== index}
                  data-faq-panel
                >
                  <div className={styles.panelInner}>
                    <p>{item.answer}</p>
                  </div>
                </section>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
