import { ArrowDown, ArrowRight } from 'lucide-react';

import { heroPoints } from '../config';
import { Button } from './button';
import { cx } from './lib/cx';
import styles from './styles/hero.module.css';
import sharedStyles from './styles/shared.module.css';

function FloatingCard({
  className,
  badge,
  title,
  description,
}: {
  className: string;
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className={cx(styles.floatCard, className)} aria-hidden='true'>
      <div className={styles.ico}>{badge}</div>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className={cx(styles.hero, sharedStyles.container)} data-landing-hero>
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
            FUTUR는 기획서가 완성되지 않은 단계부터 함께 정리하고, 웹·앱·업무 시스템을 운영 가능한
            형태로 만듭니다.
          </p>
          <div className={styles.heroActions}>
            <Button href='#contact' cursorText='START'>
              <span data-landing-label>프로젝트 문의하기</span>
              <span data-landing-arrow>
                <ArrowRight size={14} strokeWidth={2.2} />
              </span>
            </Button>
            <Button href='#cases' variant='ghost' cursorText='VIEW'>
              <span data-landing-label>사례 둘러보기</span>
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

        <div className={styles.heroVisual}>
          <div className={styles.visualOrbit} aria-hidden='true' />
          <div className={cx(styles.visualOrbit, styles.two)} aria-hidden='true' />
          <div className={cx(styles.bubble, styles.b1)} aria-hidden='true' />
          <div className={cx(styles.bubble, styles.b2)} aria-hidden='true' />
          <div className={cx(styles.bubble, styles.b3)} aria-hidden='true' />
          <div className={cx(styles.bubble, styles.b4)} aria-hidden='true' />
          <FloatingCard
            className={styles.f1}
            badge='UX'
            title='흐름 정리'
            description='화면·업무 구조'
          />
          <FloatingCard
            className={styles.f2}
            badge='API'
            title='연동 설계'
            description='인증·데이터'
          />
          <FloatingCard
            className={styles.f3}
            badge='APP'
            title='현장 앱'
            description='모바일 업무'
          />
          <FloatingCard
            className={styles.f4}
            badge='OPS'
            title='운영 지원'
            description='배포·개선'
          />
          <div className={styles.heroPanel}>
            <img
              className={styles.heroProductImage}
              src='/landing/hero-product-preview.png'
              alt='업무 대시보드, 현장 모바일 앱, API 연동 흐름을 함께 보여주는 FUTUR 서비스 화면 예시'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
