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
          <p>
            화면에 보이는 경험부터 코드와 데이터, 배포 뒤 운영까지 함께 봅니다. 다음 변화에도
            흔들리지 않을 디지털 제품을 만듭니다.
          </p>
        </div>
      </div>
    </section>
  );
}
