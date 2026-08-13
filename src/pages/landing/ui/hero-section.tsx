import { EditorialTextReveal } from './editorial-text-reveal';
import { HeroParticleBackground } from './hero-particle-background';
import styles from './styles/hero.module.css';

export function HeroSection() {
  return (
    <section
      id='hero'
      className={styles.hero}
      data-landing-hero
      data-landing-section
      data-header-surface='dark'
      data-cursor-contrast='light'
    >
      <HeroParticleBackground />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <EditorialTextReveal
            as='h1'
            className={styles.title}
            lines={['BUILT FOR', 'WHAT’S NEXT.']}
            split='lines'
            trigger='load'
            accessibleLabel='BUILT FOR WHAT’S NEXT.'
            lineAttribute='data-hero-headline-row'
          />
          <p>다음 변화를 내다보며, 오래 쓰이는 제품을 만듭니다.</p>
        </div>
      </div>
    </section>
  );
}
