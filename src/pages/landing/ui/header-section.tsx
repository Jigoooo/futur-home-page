import { ArrowRight } from 'lucide-react';
import { type MouseEvent, useEffect, useState } from 'react';

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
  const [surface, setSurface] = useState<'hero' | 'solid'>('hero');

  useEffect(() => {
    const sentinel = document.querySelector('[data-landing-header-sentinel]');

    if (!sentinel || !('IntersectionObserver' in window)) {
      const animationFrameId = window.requestAnimationFrame(() => {
        setSurface(window.scrollY > 48 ? 'solid' : 'hero');
      });
      return () => window.cancelAnimationFrame(animationFrameId);
    }

    const observer = new IntersectionObserver(([entry]) => {
      setSurface(entry?.isIntersecting === false ? 'solid' : 'hero');
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      id='top'
      className={styles.nav}
      data-landing-nav
      data-header-surface={surface}
      data-cursor-contrast='dark'
    >
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
        data-cursor-contrast='light'
        onClick={handleHashLinkClick}
      >
        <span data-landing-label>문의하기</span>
        <span data-landing-arrow>
          <ArrowRight size={14} strokeWidth={2.2} />
        </span>
      </Button>
    </header>
  );
}
