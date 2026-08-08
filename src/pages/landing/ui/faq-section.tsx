import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { faqItems } from '../config';
import { cx } from './lib/cx';
import styles from './styles/faq.module.css';
import sharedStyles from './styles/shared.module.css';

export function FaqSection() {
  const [openItems, setOpenItems] = useState<number[]>([0]);
  const [keyboardToggle, setKeyboardToggle] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenItems((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };

  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.faqSection)}
      id='faq'
      data-landing-section='faq'
    >
      <div className={sharedStyles.container}>
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
            const isOpen = openItems.includes(index);
            const buttonId = `faq-button-${index}`;
            const panelId = `faq-panel-${index}`;
            return (
              <div
                key={item.question}
                className={cx(
                  styles.item,
                  isOpen && styles.itemOpen,
                  keyboardToggle === index && styles.keyboardToggle,
                )}
              >
                <button
                  type='button'
                  id={buttonId}
                  className={styles.summary}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={(event) => {
                    setKeyboardToggle(event.detail === 0 ? index : null);
                    toggle(index);
                  }}
                >
                  <span className={styles.question}>{item.question}</span>
                  <span className={styles.toggle} aria-hidden='true'>
                    <ChevronDown size={16} strokeWidth={1.8} />
                  </span>
                </button>
                <section
                  id={panelId}
                  aria-labelledby={buttonId}
                  className={styles.panel}
                  hidden={!isOpen}
                  inert={!isOpen ? true : undefined}
                >
                  <div className={styles.panelInner}>
                    <p className={styles.answer}>{item.answer}</p>
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
