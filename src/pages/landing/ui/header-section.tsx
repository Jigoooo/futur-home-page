import { navigationItems } from '../config';
import { Button } from './button';
import { cx } from './lib/cx';
import styles from './styles/header.module.css';
import sharedStyles from './styles/shared.module.css';

export function HeaderSection() {
  return (
    <header id='top' className={cx(styles.nav, sharedStyles.container)} data-landing-nav>
      <a href='#top' className={styles.logo} aria-label='FUTUR home'>
        FUTUR<span>.</span>
      </a>
      <nav className={styles.navMenu} aria-label='주요 메뉴'>
        {navigationItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <Button href='#contact' className={styles.ctaButton} cursorText='문의'>
        <span data-landing-label>문의하기</span>
        <span data-landing-arrow>→</span>
      </Button>
    </header>
  );
}
