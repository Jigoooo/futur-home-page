import { useRef, useState, type KeyboardEvent } from 'react';

import { caseStories } from '../config';
import { Lines } from '../lib/line-breaks';
import type { CaseStoryKey } from '../model/types';
import { cx } from './lib/cx';
import styles from './styles/case-stories.module.css';
import sharedStyles from './styles/shared.module.css';

export function CaseStoriesSection() {
  const [activeKey, setActiveKey] = useState<CaseStoryKey>('web');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    caseStories.findIndex((story) => story.key === activeKey),
  );
  const activeStory = caseStories[activeIndex] ?? caseStories[0];
  if (!activeStory) return null;

  const activateTabAt = (index: number) => {
    const nextStory = caseStories[index];
    if (!nextStory) return;

    setActiveKey(nextStory.key);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();

    if (event.key === 'ArrowRight') activateTabAt((index + 1) % caseStories.length);
    if (event.key === 'ArrowLeft')
      activateTabAt((index - 1 + caseStories.length) % caseStories.length);
    if (event.key === 'Home') activateTabAt(0);
    if (event.key === 'End') activateTabAt(caseStories.length - 1);
  };

  return (
    <section
      className={cx(sharedStyles.sectionBlock, sharedStyles.bgSoft, styles.caseSection)}
      id='cases'
    >
      <div className={sharedStyles.container}>
        <div
          className={cx(styles.caseHead, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
        >
          <div>
            <span className={sharedStyles.kicker}>Project Records</span>
            <h2 className={sharedStyles.sectionTitle}>
              실제로 진행한
              <br />
              프로젝트 흐름.
            </h2>
            <p className={sharedStyles.sectionDesc}>
              고객명과 민감한 데이터는 비식별 처리하고, 문제·진행 방식·결과 중심으로 정리했습니다.
            </p>
          </div>
          <div className={styles.tabs} role='tablist' aria-label='프로젝트 진행내역'>
            {caseStories.map((story, index) => {
              const tabStateProps =
                story.key === activeKey
                  ? ({ 'aria-selected': 'true', tabIndex: 0 } as const)
                  : ({ 'aria-selected': 'false', tabIndex: -1 } as const);

              return (
                <button
                  key={story.key}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type='button'
                  className={styles.tab}
                  data-landing-interactive='control'
                  role='tab'
                  id={`tab-${story.key}`}
                  aria-controls='panel-case'
                  {...tabStateProps}
                  onClick={() => setActiveKey(story.key)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  {story.tabLabel}
                </button>
              );
            })}
          </div>
        </div>
        <article
          className={cx(styles.casePanel, sharedStyles.reveal, sharedStyles.revealUp)}
          data-landing-reveal='up'
          id='panel-case'
          role='tabpanel'
          aria-labelledby={`tab-${activeStory.key}`}
        >
          <div className={styles.casePanelInner}>
            <div className={styles.caseCopy}>
              <span className={styles.caseLabel}>{activeStory.label}</span>
              <h3 className={styles.caseTitle}>
                <Lines text={activeStory.title} />
              </h3>
              <p className={styles.caseDesc}>{activeStory.description}</p>
              <div className={styles.caseMetrics}>
                {activeStory.metrics.map((metric) => (
                  <div key={metric.label} className={styles.metric}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
              <ul className={styles.caseList}>
                {activeStory.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className={styles.caseTags} aria-label='프로젝트 구성 요소'>
                {activeStory.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className={styles.caseVisual}>
              <div className={styles.caseImageFrame}>
                <img
                  className={styles.caseImage}
                  src={activeStory.image.src}
                  alt={activeStory.image.alt}
                  width={1536}
                  height={1024}
                  loading='lazy'
                  decoding='async'
                />
              </div>
              <div className={styles.sideNote}>
                <div className={styles.noteIcon}>{activeStory.icon}</div>
                <div>
                  <strong>{activeStory.noteTitle}</strong>
                  <span>{activeStory.noteDescription}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
