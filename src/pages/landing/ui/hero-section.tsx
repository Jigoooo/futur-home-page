import { ArrowDown, ArrowRight } from 'lucide-react';

import { Button } from './button';
import { EditorialTextReveal } from './editorial-text-reveal';
import { HeroParticleBackground } from './hero-particle-background';
import { cx } from './lib/cx';
import styles from './styles/hero.module.css';
import sharedStyles from './styles/shared.module.css';

export function HeroSection() {
  return (
    <section className={styles.hero} data-landing-hero>
      <HeroParticleBackground />
      <div className={cx(styles.heroInner, sharedStyles.container)}>
        <div className={styles.heroCopy}>
          <EditorialTextReveal
            as='h1'
            className={styles.title}
            lines={['FROM COMPLEX WORK', 'TO SERVICES THAT WORK.']}
            split='words'
            trigger='load'
            accessibleLabel='FROM COMPLEX WORK TO SERVICES THAT WORK.'
          />
          <p>
            FUTUR는 웹·앱·업무 시스템의 사용자 흐름과 데이터 구조를 함께 설계하고, 배포 이후
            운영까지 이어갑니다.
          </p>
          <div className={styles.heroActions}>
            <Button href='#contact' cursorText='START'>
              <span data-landing-label>프로젝트 문의하기</span>
              <span data-landing-arrow>
                <ArrowRight size={14} strokeWidth={2.2} />
              </span>
            </Button>
            <Button
              href='#cases'
              variant='ghost'
              className={styles.secondaryAction}
              cursorText='VIEW'
            >
              <span data-landing-label>사례 둘러보기</span>
              <span data-landing-arrow>
                <ArrowDown size={14} strokeWidth={2.2} />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
