import { ArrowDown, ArrowRight } from 'lucide-react';

import { heroPoints } from '../config';
import { Button } from './button';
import { cx } from './lib/cx';
import styles from './styles/hero.module.css';
import sharedStyles from './styles/shared.module.css';

export function HeroSection() {
  return (
    <section
      className={cx(styles.hero, sharedStyles.container)}
      data-landing-hero
      data-landing-section='hero'
    >
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>SI · 웹/앱/업무 시스템 개발</div>
          <h1 className={styles.title}>
            아이디어를 현실의 서비스로,
            <br />
            복잡한 업무를
            <br />
            <span className={styles.accent}>쉬운 흐름으로.</span>
          </h1>
          <p>
            FUTUR는 웹·앱·업무 시스템·API 프로젝트를 사용자 흐름부터 데이터 구조, 배포와 운영
            인수인계까지 한 기준으로 연결합니다.
          </p>
          <div className={styles.heroActions}>
            <Button href='#contact' cursorText='START'>
              <span data-landing-label>프로젝트 문의하기</span>
              <span data-landing-arrow>
                <ArrowRight size={14} strokeWidth={2.2} />
              </span>
            </Button>
            <Button href='#cases' variant='ghost' cursorText='VIEW'>
              <span data-landing-label>기록 둘러보기</span>
              <span data-landing-arrow>
                <ArrowDown size={14} strokeWidth={2.2} />
              </span>
            </Button>
          </div>
          <div className={styles.heroPoints}>
            {heroPoints.map((point) => (
              <div key={point.title} className={styles.point}>
                <strong>{point.title}</strong>
                <span>{point.description}</span>
              </div>
            ))}
          </div>
        </div>

        <figure className={styles.heroVisual} data-delivery-map>
          <div className={styles.mapHeader}>
            <span>DELIVERY MAP</span>
            <figcaption>FUTUR 프로젝트 전달 지도</figcaption>
          </div>
          <div className={styles.mapFlow}>
            <article className={styles.mapStep}>
              <span>01 · DEFINE</span>
              <h2>문제 · 사용자 흐름</h2>
              <ul>
                <li>사용자와 운영자 시나리오</li>
                <li>필수 범위와 우선순위</li>
              </ul>
            </article>
            <span className={styles.mapConnector} aria-hidden='true'>
              →
            </span>
            <article className={styles.mapStep}>
              <span>02 · STRUCTURE</span>
              <h2>화면 · 데이터 구조</h2>
              <ul>
                <li>화면·권한·상태 기준</li>
                <li>API와 저장 데이터 연결</li>
              </ul>
            </article>
            <span className={styles.mapConnector} aria-hidden='true'>
              →
            </span>
            <article className={cx(styles.mapStep, styles.mapStepReady)}>
              <span>03 · HANDOFF</span>
              <h2>배포 · 운영 기준</h2>
              <ul>
                <li>테스트와 배포 체크</li>
                <li>코드·문서·운영 인계</li>
              </ul>
            </article>
          </div>
        </figure>
      </div>
    </section>
  );
}
