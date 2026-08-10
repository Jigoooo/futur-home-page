import { Menu, X } from 'lucide-react';
import { useRef } from 'react';

import { navigationItems } from '../config';
import styles from './styles/header.module.css';
import { useAdaptiveHeader } from './use-adaptive-header';

const HEADER_MENU_ID = 'landing-primary-menu';

export function HeaderSection() {
  const headerRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const {
    activeHref,
    compactLabel,
    handleMenuClose,
    handleNavigation,
    hydrated,
    layout,
    toggleMenu,
  } = useAdaptiveHeader({ headerRef, menuRef, toggleRef });
  const menuExpanded = layout === 'menu-expanded';
  const menuAccessible = layout !== 'compact';

  return (
    <header
      ref={headerRef}
      id='top'
      className={styles.nav}
      data-landing-nav
      data-header-hydrated={hydrated ? 'true' : 'false'}
      data-header-layout={hydrated ? layout : undefined}
      data-header-surface={layout === 'hero-expanded' ? 'hero' : 'solid'}
      data-cursor-contrast='dark'
    >
      <a href='#top' className={styles.logo} aria-label='FUTUR home' onClick={handleNavigation}>
        FUTUR<span>.</span>
      </a>

      <button
        ref={toggleRef}
        type='button'
        className={styles.compactToggle}
        data-header-toggle
        aria-expanded={menuExpanded}
        aria-controls={HEADER_MENU_ID}
        aria-label={`주요 메뉴 ${menuExpanded ? '닫기' : '열기'} · 현재 위치 ${compactLabel}`}
        onClick={toggleMenu}
      >
        <span>{compactLabel}</span>
        <Menu aria-hidden='true' size={18} strokeWidth={2.2} />
      </button>

      <nav
        ref={menuRef}
        id={HEADER_MENU_ID}
        className={styles.navMenu}
        aria-label='주요 메뉴'
        aria-hidden={!menuAccessible}
      >
        <div className={styles.menuLinks}>
          {navigationItems.map((item) => {
            const active = activeHref === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                tabIndex={menuAccessible ? 0 : -1}
                aria-current={active ? 'location' : undefined}
                onClick={handleNavigation}
              >
                <span>{item.label}</span>
                {active ? (
                  <span
                    className={styles.activeIndicator}
                    data-header-active-indicator
                    aria-hidden='true'
                  />
                ) : null}
              </a>
            );
          })}
        </div>
        <button
          type='button'
          className={styles.closeButton}
          aria-label='주요 메뉴 닫기'
          tabIndex={menuAccessible ? 0 : -1}
          onClick={handleMenuClose}
        >
          <X aria-hidden='true' size={17} strokeWidth={2.2} />
        </button>
      </nav>
    </header>
  );
}
