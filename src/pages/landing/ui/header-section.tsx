import { useRef } from 'react';

import { navigationItems } from '../config';
import styles from './styles/header.module.css';
import { useAdaptiveHeader } from './use-adaptive-header';

export function HeaderSection() {
  const headerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const { activeHref, handleNavigation, hydrated, layout, glassTone } = useAdaptiveHeader({
    headerRef,
    menuRef,
  });

  return (
    <header
      ref={headerRef}
      id='top'
      className={styles.nav}
      data-landing-nav
      data-header-hydrated={hydrated ? 'true' : 'false'}
      data-header-layout={hydrated ? layout : undefined}
      data-header-glass-tone={glassTone}
    >
      <script>
        {`document.documentElement.dataset.headerInitialLayout=window.matchMedia('(max-width: 900px)').matches?'mobile-persistent':'desktop-fluid';`}
      </script>
      <div
        className={styles.glassShell}
        data-header-glass
        data-landing-spotlight='header'
        data-cursor-contrast='dark'
      >
        <span className={styles.backdropLayer} data-header-backdrop-layer aria-hidden='true' />
        <div className={styles.motionContent} data-header-motion-content>
          <a href='#top' className={styles.logo} aria-label='FUTUR home' onClick={handleNavigation}>
            FUTUR<span>.</span>
          </a>

          <nav ref={menuRef} className={styles.navMenu} aria-label='주요 메뉴'>
            <div className={styles.menuLinks}>
              {navigationItems.map((item) => {
                const active = activeHref === item.href;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    data-header-section-link
                    aria-current={active ? 'location' : undefined}
                    onClick={handleNavigation}
                  >
                    <span>{item.label}</span>
                  </a>
                );
              })}
              <a className={styles.contactLink} href='#footer' onClick={handleNavigation}>
                <span>문의</span>
              </a>
              <span
                className={styles.activeIndicator}
                data-header-active-indicator
                aria-hidden='true'
              />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
