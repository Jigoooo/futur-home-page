import { ArrowRight, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';

import { navigationItems } from '../config';
import { Button } from './button';
import { scrollToHashTarget } from '../lib/scroll-to-page-top';
import styles from './styles/header.module.css';

function handleHashLinkClick(event: MouseEvent<HTMLAnchorElement>) {
  const anchor = event.currentTarget;

  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    (anchor.target && anchor.target !== '_self')
  ) {
    return;
  }

  const url = new URL(anchor.href);

  if (
    url.origin !== window.location.origin ||
    url.pathname !== window.location.pathname ||
    !url.hash ||
    !scrollToHashTarget(url.hash)
  ) {
    return;
  }

  event.preventDefault();

  if (window.location.hash !== url.hash) {
    window.history.pushState(null, '', url.hash);
  }
}

export function HeaderSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPresent, setMenuPresent] = useState(false);
  const [keyboardMenu, setKeyboardMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);

  const openMenu = useCallback((immediate: boolean) => {
    setKeyboardMenu(immediate);
    setMenuPresent(true);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback((immediate: boolean) => {
    setKeyboardMenu(immediate);
    setMenuOpen(false);
    if (immediate) {
      setMenuPresent(false);
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    firstMenuLinkRef.current?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeMenu(true);
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMenu, menuOpen]);

  const handleMenuLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleHashLinkClick(event);
    closeMenu(event.detail === 0);
  };

  return (
    <header id='top' className={styles.nav} data-landing-nav>
      <a href='#top' className={styles.logo} aria-label='FUTUR home' onClick={handleHashLinkClick}>
        FUTUR<span>.</span>
      </a>
      <nav className={styles.navMenu} aria-label='주요 메뉴'>
        {navigationItems.map((item) => (
          <a key={item.href} href={item.href} onClick={handleHashLinkClick}>
            {item.label}
          </a>
        ))}
      </nav>
      <Button
        href='#contact'
        className={styles.ctaButton}
        cursorText='문의'
        onClick={handleHashLinkClick}
      >
        <span data-landing-label>문의하기</span>
        <span data-landing-arrow>
          <ArrowRight size={14} strokeWidth={2.2} />
        </span>
      </Button>
      <button
        ref={menuButtonRef}
        type='button'
        className={styles.menuButton}
        aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={menuOpen}
        aria-controls='mobile-menu'
        onClick={(event) => {
          const immediate = event.detail === 0;
          if (menuOpen) closeMenu(immediate);
          else openMenu(immediate);
        }}
      >
        {menuOpen ? <X size={20} aria-hidden='true' /> : <Menu size={20} aria-hidden='true' />}
      </button>
      {menuPresent ? (
        <div
          className={`${styles.mobileMenu} ${keyboardMenu ? styles.keyboardMenu : ''}`}
          data-mobile-menu-shell
          data-state={menuOpen ? 'open' : 'closed'}
          aria-hidden={!menuOpen}
          inert={!menuOpen ? true : undefined}
          onTransitionEnd={(event) => {
            if (
              !menuOpen &&
              event.currentTarget === event.target &&
              event.propertyName === 'opacity'
            ) {
              setMenuPresent(false);
            }
          }}
        >
          <nav id='mobile-menu' aria-label='모바일 메뉴'>
            {navigationItems.map((item, index) => (
              <a
                key={item.href}
                ref={index === 0 ? firstMenuLinkRef : undefined}
                href={item.href}
                onClick={handleMenuLinkClick}
              >
                {item.label}
              </a>
            ))}
            <Button href='#contact' className={styles.mobileCta} onClick={handleMenuLinkClick}>
              <span data-landing-label>문의하기</span>
              <span data-landing-arrow>
                <ArrowRight size={14} strokeWidth={2.2} />
              </span>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
