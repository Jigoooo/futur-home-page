import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { faqItems } from '../config';
import { EditorialTextReveal } from './editorial-text-reveal';
import { cx } from './lib/cx';
import styles from './styles/faq.module.css';
import sharedStyles from './styles/shared.module.css';

export function FaqSection() {
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set([0]));

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section
      className={cx(sharedStyles.sectionBlock, styles.faqSection)}
      id='faq'
      data-landing-section
      data-cursor-contrast='dark'
    >
      <div className={sharedStyles.container}>
        <div className={styles.head}>
          <EditorialTextReveal
            as='h2'
            className={cx(sharedStyles.sectionTitle, styles.title)}
            lines={['자주 묻는 질문.']}
            split='lines'
            trigger='in-view'
            accessibleLabel='자주 묻는 질문.'
          />
          <p className={sharedStyles.sectionDesc}>문의 전에 자주 묻는 내용을 정리했습니다.</p>
        </div>
        <div className={styles.list}>
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
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                >
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.question}>{item.question}</span>
                  <span className={styles.toggle} aria-hidden='true'>
                    <ChevronDown size={16} strokeWidth={1.8} />
                  </span>
                </button>
                <div
                  id={panelId}
                  role='region'
                  aria-labelledby={buttonId}
                  className={styles.panel}
                  aria-hidden={!isOpen}
                >
                  <div className={styles.panelInner}>
                    <p className={styles.answer}>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
