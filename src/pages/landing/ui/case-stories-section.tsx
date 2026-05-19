import { useRef, useState, type KeyboardEvent } from 'react';

import { caseStories } from '../config';
import { Lines } from '../lib/line-breaks';
import type { CaseStoryKey } from '../model/types';

export function CaseStoriesSection() {
  const [activeKey, setActiveKey] = useState<CaseStoryKey>('system');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    caseStories.findIndex((story) => story.key === activeKey),
  );
  const activeStory = caseStories[activeIndex] || caseStories[0];

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
    <section className='case-section' id='cases'>
      <div className='container'>
        <div className='case-head motion-up'>
          <div>
            <span className='kicker'>Case Stories</span>
            <h2 className='section-title'>
              결과가 보이는
              <br />
              프로젝트 이야기.
            </h2>
            <p className='section-desc'>
              업종보다 중요한 것은 업무의 흐름입니다. FUTUR는 화면, 데이터, 운영 과정을 함께
              설계합니다.
            </p>
          </div>
          <div className='tabs' role='tablist' aria-label='프로젝트 사례'>
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
                  className='tab'
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
          className='case-panel motion-up'
          id='panel-case'
          role='tabpanel'
          aria-labelledby={`tab-${activeStory.key}`}
        >
          <div className='case-panel-inner'>
            <div className='case-copy'>
              <span className='case-label'>{activeStory.label}</span>
              <h3 className='case-title'>
                <Lines text={activeStory.title} />
              </h3>
              <p className='case-desc'>{activeStory.description}</p>
              <div className='case-metrics'>
                {activeStory.metrics.map((metric) => (
                  <div key={metric.label} className='metric'>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
              <ul className='case-list'>
                {activeStory.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className='case-visual' aria-hidden='true'>
              <div className='device-card'>
                <div className='device-top'>
                  <i />
                  <i />
                  <i />
                </div>
                <div className='device-row r1' />
                <div className='device-row r2' />
                <div className='device-chart'>
                  <svg viewBox='0 0 330 92' preserveAspectRatio='none'>
                    <path d='M10 66 C50 30,75 50,104 28 S158 38,188 22 S250 18,320 32' />
                  </svg>
                </div>
              </div>
              <div className='side-note'>
                <div className='note-icon'>{activeStory.icon}</div>
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
