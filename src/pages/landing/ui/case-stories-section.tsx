import { useRef, useState, type KeyboardEvent } from 'react';

import { caseStories } from '../config';
import { Lines } from '../lib/line-breaks';
import type { CaseStoryKey } from '../model/types';
import { cx } from './lib/cx';
import styles from './styles/case-stories.module.css';
import sharedStyles from './styles/shared.module.css';

function ArtifactBoard({ story }: { story: (typeof caseStories)[number] }) {
  const flowLabel = story.artifact.label.replace(/ 보드$/, '');

  return (
    <figure className={styles.artifactBoard} data-artifact-board>
      <figcaption className={styles.artifactTopbar}>
        <span>{story.icon}</span>
        <strong>{story.artifact.label}</strong>
        <i aria-hidden='true'>STRUCTURE</i>
      </figcaption>
      <dl className={styles.artifactColumns} aria-label={`${story.artifact.label} 속성`}>
        {story.artifact.columns.map((column, index) => (
          <div key={column}>
            <dt>영역 {index + 1}</dt>
            <dd>{column}</dd>
          </div>
        ))}
      </dl>
      {story.key === 'system' ? (
        <table className={styles.artifactTable} aria-label={story.artifact.label}>
          <thead>
            <tr>
              <th scope='col'>단계</th>
              <th scope='col'>상태</th>
              <th scope='col'>권한·처리 기준</th>
            </tr>
          </thead>
          <tbody>
            {story.artifact.rows.map((row, index) => (
              <tr key={row.title}>
                <th scope='row'>{String(index + 1).padStart(2, '0')}</th>
                <td>{row.title}</td>
                <td>{row.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ol className={styles.artifactRows} aria-label={flowLabel}>
          {story.artifact.rows.map((row, index) => (
            <li key={row.title} className={styles.artifactRow}>
              <b>{String(index + 1).padStart(2, '0')}</b>
              <strong>{row.title}</strong>
              <span>{row.meta}</span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

export function CaseStoriesSection() {
  const [activeKey, setActiveKey] = useState<CaseStoryKey>('web');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activateTabAt = (index: number) => {
    const story = caseStories[index];
    if (!story) return;
    setActiveKey(story.key);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
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
      data-landing-section='records'
    >
      <div className={sharedStyles.container}>
        <div className={styles.caseHead}>
          <div>
            <span className={sharedStyles.kicker}>Project Records</span>
            <h2 className={sharedStyles.sectionTitle}>
              문제와 결정, 전달물로
              <br />
              남긴 프로젝트 기록.
            </h2>
            <p className={sharedStyles.sectionDesc}>
              고객명과 민감한 데이터는 비식별 처리하고, 확인 가능한 문제·결정·전달물·결과만
              정리했습니다.
            </p>
          </div>
          <div className={styles.tabs} role='tablist' aria-label='프로젝트 기록'>
            {caseStories.map((story, index) => (
              <button
                key={story.key}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type='button'
                role='tab'
                id={`record-tab-${story.key}`}
                aria-controls={`record-panel-${story.key}`}
                aria-selected={story.key === activeKey}
                tabIndex={story.key === activeKey ? 0 : -1}
                onClick={() => setActiveKey(story.key)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {story.tabLabel}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.recordList}>
          {caseStories.map((story, index) => (
            <article
              key={story.key}
              className={cx(styles.record, index === 0 && styles.recordLead)}
              id={`record-panel-${story.key}`}
              role='tabpanel'
              aria-labelledby={`record-tab-${story.key}`}
              hidden={story.key !== activeKey}
            >
              <div className={styles.caseCopy}>
                <span className={styles.caseLabel}>{story.label}</span>
                <h3 className={styles.caseTitle}>
                  <Lines text={story.title} />
                </h3>
                <p className={styles.caseDesc}>{story.description}</p>
                <ul className={styles.caseList}>
                  {story.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className={styles.caseTags} aria-label='프로젝트 구성 요소'>
                  {story.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className={styles.stackTags} aria-label='적용 기술'>
                  <strong>STACK</strong>
                  {story.stack.map((tag) => (
                    <span key={tag} data-stack-tag>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.caseVisual}>
                <ArtifactBoard story={story} />
                <div className={styles.sideNote}>
                  <span>{story.icon}</span>
                  <div>
                    <strong>{story.noteTitle}</strong>
                    <small>{story.noteDescription}</small>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
