import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import {
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { scrollToHashTarget } from '../lib/scroll-to-page-top';

gsap.registerPlugin(Flip);

export type HeaderLayout = 'hero-expanded' | 'compact' | 'menu-expanded';

type AdaptiveHeaderRefs = {
  headerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
  toggleRef: RefObject<HTMLButtonElement | null>;
};

const sectionLabels = new Map([
  ['services', { href: '#services', label: '서비스' }],
  ['stack', { href: '#stack', label: '기술' }],
  ['team', { href: '#team', label: '팀' }],
  ['process', { href: '#process', label: '프로세스' }],
  ['operations', { href: '#process', label: '프로세스' }],
  ['faq', { href: '#faq', label: 'FAQ' }],
]);

function clearMotionStyles(header: HTMLElement) {
  delete header.dataset.headerMotion;
  gsap.set(header, { clearProps: 'all' });
  gsap.set(header.querySelectorAll('*'), {
    clearProps: 'opacity,transform,transformOrigin',
  });
}

function isPlainHashNavigation(event: MouseEvent<HTMLAnchorElement>) {
  const anchor = event.currentTarget;

  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    (anchor.target && anchor.target !== '_self')
  );
}

function getVisibleSectionId() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-landing-section]'));
  const viewportProbe = window.innerHeight * 0.5;
  const containingProbe = sections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= viewportProbe && rect.bottom > viewportProbe;
  });

  if (containingProbe) return containingProbe.id;

  return sections.reduce<{ distance: number; id: string } | null>((closest, section) => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - viewportProbe);

    return !closest || distance < closest.distance ? { distance, id: section.id } : closest;
  }, null)?.id;
}

export function useAdaptiveHeader({ headerRef, menuRef, toggleRef }: AdaptiveHeaderRefs) {
  const [layout, setLayout] = useState<HeaderLayout>('hero-expanded');
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [hydrated, setHydrated] = useState(false);
  const [openedSectionId, setOpenedSectionId] = useState('hero');
  const activeSectionIdRef = useRef('hero');
  const layoutRef = useRef<HeaderLayout>('hero-expanded');
  const openScrollYRef = useRef(0);
  const motionReadyRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const focusReturnFrameRef = useRef(0);
  const focusReturnPendingRef = useRef(false);
  const pendingFlipRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const motionTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const updateLayout = useCallback(
    (nextLayout: HeaderLayout) => {
      if (layoutRef.current === nextLayout) return;

      const header = headerRef.current;
      if (header && motionReadyRef.current && !reducedMotionRef.current) {
        motionTimelineRef.current?.kill();
        motionTimelineRef.current = null;
        gsap.killTweensOf([header, ...header.querySelectorAll('*')]);
        Flip.killFlipsOf(header);
        clearMotionStyles(header);
        pendingFlipRef.current = Flip.getState(header);
      }

      layoutRef.current = nextLayout;
      setLayout(nextLayout);
    },
    [headerRef],
  );

  const restoreToggleFocus = useCallback(() => {
    focusReturnPendingRef.current = true;
  }, []);

  const closeMenu = useCallback(() => {
    if (layoutRef.current !== 'menu-expanded') return;
    restoreToggleFocus();
    updateLayout('compact');
  }, [restoreToggleFocus, updateLayout]);

  useLayoutEffect(() => {
    const flipState = pendingFlipRef.current;
    const header = headerRef.current;
    if (!flipState || !header || reducedMotionRef.current) return;

    pendingFlipRef.current = null;
    header.dataset.headerMotion = 'true';
    const opening = layout === 'menu-expanded';
    const menuItems = menuRef.current?.querySelectorAll('a, button') ?? [];
    const motionContent = header.querySelector<HTMLElement>('[data-header-motion-content]');
    const indicator = header.querySelector<HTMLElement>('[data-header-active-indicator]');
    const flip = Flip.from(flipState, {
      targets: header,
      duration: opening ? 0.42 : 0.36,
      ease: 'power3.inOut',
      nested: true,
      paused: true,
      prune: true,
      scale: true,
    });
    const timeline = gsap.timeline();
    const finish = () => {
      clearMotionStyles(header);
      if (motionTimelineRef.current === timeline) motionTimelineRef.current = null;
    };
    timeline.eventCallback('onComplete', finish);
    timeline.eventCallback('onInterrupt', finish);
    motionTimelineRef.current = timeline;

    if (opening) {
      if (motionContent) {
        timeline.fromTo(
          motionContent,
          { scaleX: 0.96, scaleY: 1.03 },
          { scaleX: 1, scaleY: 1, duration: 0.07, ease: 'power2.out' },
          0,
        );
      }
      timeline.add(flip, 0.07);
      timeline.fromTo(
        menuItems,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.22, stagger: 0.03, ease: 'power2.out' },
        0.16,
      );
      if (indicator) {
        timeline.fromTo(
          indicator,
          { scaleX: 0.72 },
          { scaleX: 1, duration: 0.07, ease: 'power2.out' },
          0.49,
        );
      }
    } else {
      timeline.add(flip, 0);
    }

    return () => {
      timeline.kill();
      finish();
    };
  }, [headerRef, layout, menuRef]);

  useLayoutEffect(() => {
    if (layout !== 'compact' || !focusReturnPendingRef.current) return;

    window.cancelAnimationFrame(focusReturnFrameRef.current);
    focusReturnFrameRef.current = window.requestAnimationFrame(() => {
      if (!focusReturnPendingRef.current || layoutRef.current !== 'compact') return;
      focusReturnPendingRef.current = false;
      toggleRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusReturnFrameRef.current);
  }, [layout, toggleRef]);

  useLayoutEffect(() => {
    if (layout !== 'menu-expanded') return;

    const currentLink = menuRef.current?.querySelector<HTMLElement>('a[aria-current="location"]');
    const closeButton = menuRef.current?.querySelector<HTMLElement>('[data-header-close]');
    (currentLink ?? closeButton)?.focus({ preventScroll: true });
  }, [layout, menuRef]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compactViewport = window.matchMedia('(max-width: 900px)');
    const sentinel = document.querySelector<HTMLElement>('[data-landing-header-sentinel]');
    let heroVisible = window.scrollY <= 48;

    reducedMotionRef.current = reducedMotion.matches;

    const syncBaseLayout = () => {
      if (layoutRef.current === 'menu-expanded') return;
      updateLayout(compactViewport.matches || !heroVisible ? 'compact' : 'hero-expanded');
    };
    const syncMotionPreference = () => {
      reducedMotionRef.current = reducedMotion.matches;
      if (reducedMotion.matches && headerRef.current) {
        motionTimelineRef.current?.kill();
        motionTimelineRef.current = null;
        gsap.killTweensOf([headerRef.current, ...headerRef.current.querySelectorAll('*')]);
        Flip.killFlipsOf(headerRef.current);
        clearMotionStyles(headerRef.current);
      }
    };
    const syncHeroVisibility = () => {
      heroVisible = window.scrollY <= 48;
      syncBaseLayout();
    };

    const observer =
      sentinel && 'IntersectionObserver' in window
        ? new IntersectionObserver(syncHeroVisibility)
        : null;

    observer?.observe(sentinel as HTMLElement);
    compactViewport.addEventListener('change', syncBaseLayout);
    reducedMotion.addEventListener('change', syncMotionPreference);
    window.addEventListener('scroll', syncHeroVisibility, { passive: true });
    syncHeroVisibility();
    let motionReadyFrame = 0;
    const hydrationFrame = window.requestAnimationFrame(() => {
      setHydrated(true);
      motionReadyFrame = window.requestAnimationFrame(() => {
        motionReadyRef.current = true;
      });
    });

    return () => {
      window.cancelAnimationFrame(hydrationFrame);
      window.cancelAnimationFrame(motionReadyFrame);
      observer?.disconnect();
      compactViewport.removeEventListener('change', syncBaseLayout);
      reducedMotion.removeEventListener('change', syncMotionPreference);
      window.removeEventListener('scroll', syncHeroVisibility);
    };
  }, [headerRef, updateLayout]);

  useEffect(() => {
    let frameId = 0;
    const updateActiveSection = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (layoutRef.current === 'menu-expanded') return;
        const nextSectionId = getVisibleSectionId() ?? 'hero';
        activeSectionIdRef.current = nextSectionId;
        setActiveSectionId(nextSectionId);
      });
    };

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    updateActiveSection();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  useEffect(() => {
    if (layout !== 'menu-expanded') return undefined;

    openScrollYRef.current = window.scrollY;
    let suppressFocusScroll = false;
    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;

      const scrollYBeforeFocus = window.scrollY;
      suppressFocusScroll = true;
      window.requestAnimationFrame(() => {
        if (headerRef.current?.contains(document.activeElement)) {
          window.scrollTo({ top: scrollYBeforeFocus, behavior: 'instant' });
          openScrollYRef.current = scrollYBeforeFocus;
        }
        suppressFocusScroll = false;
      });
    };
    const handleScroll = () => {
      if (suppressFocusScroll) return;
      if (Math.abs(window.scrollY - openScrollYRef.current) >= 24) closeMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [closeMenu, headerRef, layout]);

  const toggleMenu = useCallback(() => {
    if (layoutRef.current === 'menu-expanded') {
      closeMenu();
      return;
    }

    focusReturnPendingRef.current = false;
    window.cancelAnimationFrame(focusReturnFrameRef.current);
    openScrollYRef.current = window.scrollY;
    setOpenedSectionId(activeSectionIdRef.current);
    updateLayout('menu-expanded');
  }, [closeMenu, updateLayout]);

  const handleNavigation = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainHashNavigation(event)) return;

      const anchor = event.currentTarget;
      const url = new URL(anchor.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        !url.hash
      ) {
        return;
      }

      event.preventDefault();
      const closingMenu = layoutRef.current === 'menu-expanded';
      if (closingMenu) {
        restoreToggleFocus();
        updateLayout('compact');
      }

      window.requestAnimationFrame(() => {
        if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
        window.requestAnimationFrame(() => scrollToHashTarget(url.hash));
      });
    },
    [restoreToggleFocus, updateLayout],
  );

  const displayedSectionId = layout === 'menu-expanded' ? openedSectionId : activeSectionId;
  const activeSection = sectionLabels.get(displayedSectionId);
  const glassTone =
    displayedSectionId === 'hero' || displayedSectionId === 'operations' ? 'dark' : 'light';

  return {
    activeHref: activeSection?.href ?? null,
    compactLabel: activeSection?.label ?? 'FUTUR.',
    handleMenuClose: closeMenu,
    handleNavigation,
    hydrated,
    layout,
    glassTone,
    toggleMenu,
  };
}
