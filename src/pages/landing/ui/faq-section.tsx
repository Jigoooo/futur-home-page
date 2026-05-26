import { useState } from 'react';

import { faqItems } from '../config';
import { cx } from './lib/cx';
import styles from './styles/faq.module.css';
import sharedStyles from './styles/shared.module.css';

export function FaqSection() {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

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
        {faqItems.map((item, index) => {
          const isOpen = openSet.has(index);
          const buttonId = `faq-button-${index}`;
          const panelId = `faq-panel-${index}`;
          return (
            <div key={item.question} className={cx(styles.item, isOpen && styles.itemOpen)}>
              <button
                type='button'
                id={buttonId}
                className={styles.summary}
                aria-expanded={isOpen ? 'true' : 'false'}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
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
              </button>
              <div
                id={panelId}
                role='region'
                aria-labelledby={buttonId}
                className={styles.panel}
                aria-hidden={isOpen ? 'false' : 'true'}
              >
                <div className={styles.panelInner}>
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
