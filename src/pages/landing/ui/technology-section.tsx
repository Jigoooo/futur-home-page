import { ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import { useRef } from 'react';

import { technologyCapabilities } from '../config';
import { cx } from './lib/cx';
import sharedStyles from './styles/shared.module.css';
import styles from './styles/technology.module.css';
import { useTechnologyDisclosureMotion } from './use-technology-disclosure-motion';
import { useTechnologyMarqueeControl } from './use-technology-marquee-control';

export function TechnologySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useTechnologyDisclosureMotion(sectionRef);
  const { toggleMarquee, userPaused } = useTechnologyMarqueeControl(sectionRef);

  return (
    <section
      ref={sectionRef}
      className={cx(sharedStyles.sectionBlock, styles.technology)}
      id='technology'
      data-landing-section
      data-header-surface='dark'
      data-cursor-contrast='light'
    >
      <div className={styles.heading}>
        <h2
          className={cx(
            sharedStyles.sectionTitle,
            styles.title,
            sharedStyles.reveal,
            sharedStyles.revealUp,
          )}
          data-landing-reveal='up'
        >
          기술은 목적과 환경에 맞게 선택합니다.
        </h2>
        <button
          className={styles.marqueeControl}
          type='button'
          aria-label={userPaused ? '기술 흐름 재생' : '기술 흐름 일시정지'}
          aria-pressed={userPaused}
          data-technology-marquee-control
          onClick={toggleMarquee}
        >
          {userPaused ? (
            <Play size={18} strokeWidth={1.9} aria-hidden='true' />
          ) : (
            <Pause size={18} strokeWidth={1.9} aria-hidden='true' />
          )}
        </button>
      </div>

      <div className={styles.index} data-technology-index>
        {technologyCapabilities.map((capability, index) => (
          <article
            className={styles.row}
            key={capability.key}
            data-technology-row={capability.key}
            data-technology-summary
          >
            <div
              className={cx(styles.rowInfo, sharedStyles.reveal, sharedStyles.revealUp)}
              data-landing-reveal='up'
            >
              <span className={styles.rowNumber}>{String(index + 1).padStart(2, '0')}</span>
              <h3>{capability.label}</h3>
              <p>{capability.description}</p>
            </div>

            <div className={styles.marqueeViewport} data-technology-marquee-viewport>
              <div className={styles.marquee} data-technology-marquee>
                <p>{capability.featuredTechnologies.join(' · ')}</p>
                <p aria-hidden='true'>{capability.featuredTechnologies.join(' · ')}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.detailsWrap}>
        <details className={styles.details} data-technology-details>
          <summary>
            <span className={styles.summaryClosedLabel}>기술 범위 전체 보기</span>
            <span className={styles.summaryOpenLabel}>기술 범위 접기</span>
            <ChevronDown
              className={styles.summaryIcon}
              size={22}
              strokeWidth={1.8}
              aria-hidden='true'
            />
          </summary>
          <div className={styles.disclosurePanel} data-technology-disclosure-panel>
            <div className={styles.disclosureContent} data-technology-disclosure-content>
              <div className={styles.fullList}>
                {technologyCapabilities.map((capability, capabilityIndex) => (
                  <section
                    className={styles.technologyChapter}
                    key={capability.key}
                    data-technology-chapter={capability.key}
                  >
                    <header
                      className={cx(
                        styles.chapterHeading,
                        sharedStyles.reveal,
                        sharedStyles.revealUp,
                      )}
                      data-technology-chapter-heading
                      data-landing-reveal='up'
                    >
                      <span className={styles.chapterNumber}>
                        {String(capabilityIndex + 1).padStart(2, '0')}
                      </span>
                      <h3>{capability.label}</h3>
                      <p>{capability.description}</p>
                    </header>
                    <div className={styles.chapterGroups}>
                      {capability.groups.map((group) => (
                        <section
                          className={cx(
                            styles.technologyGroup,
                            sharedStyles.reveal,
                            sharedStyles.revealUp,
                          )}
                          key={`${capability.key}-${group.label}`}
                          data-technology-group
                          data-landing-reveal='up'
                        >
                          <div className={styles.groupHeading}>
                            <h4>{group.label}</h4>
                          </div>
                          <p>
                            {group.technologies.map((technology, index) => (
                              <span key={technology} data-technology>
                                {index > 0 ? ', ' : ''}
                                {technology}
                              </span>
                            ))}
                          </p>
                        </section>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              <button
                className={styles.disclosureClose}
                type='button'
                data-technology-disclosure-close
              >
                <span>기술 범위 접기</span>
                <ChevronUp size={22} strokeWidth={1.8} aria-hidden='true' />
              </button>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
