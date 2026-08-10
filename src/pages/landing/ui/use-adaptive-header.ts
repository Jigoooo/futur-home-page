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
  const pendingFlipRef = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const updateLayout = useCallback(
    (nextLayout: HeaderLayout) => {
      if (layoutRef.current === nextLayout) return;

      const header = headerRef.current;
      if (header && motionReadyRef.current && !reducedMotionRef.current) {
        gsap.killTweensOf([header, ...header.querySelectorAll('*')]);
        Flip.killFlipsOf(header);
        pendingFlipRef.current = Flip.getState(header);
      }

      layoutRef.current = nextLayout;
      setLayout(nextLayout);
    },
    [headerRef],
  );

  const restoreToggleFocus = useCallback(() => {
    window.requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, [toggleRef]);

  const closeMenu = useCallback(() => {
    if (layoutRef.current !== 'menu-expanded') return;
    updateLayout('compact');
    restoreToggleFocus();
  }, [restoreToggleFocus, updateLayout]);

  useLayoutEffect(() => {
    const flipState = pendingFlipRef.current;
    const header = headerRef.current;
    if (!flipState || !header || reducedMotionRef.current) return;

    pendingFlipRef.current = null;
    const opening = layout === 'menu-expanded';
    const menuItems = menuRef.current?.querySelectorAll('a, button') ?? [];

    if (opening) {
      gsap.fromTo(
        header,
        { scaleX: 0.96, scaleY: 1.03 },
        { scaleX: 1, scaleY: 1, duration: 0.07, ease: 'power2.out', overwrite: true },
      );
    }

    Flip.from(flipState, {
      targets: header,
      duration: opening ? 0.42 : 0.36,
      delay: opening ? 0.07 : 0,
      ease: 'power3.inOut',
      absolute: true,
      nested: true,
      prune: true,
    });

    if (opening) {
      gsap.fromTo(
        menuItems,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.22, stagger: 0.03, delay: 0.16, ease: 'power2.out' },
      );
    }
  }, [headerRef, layout, menuRef]);

  useLayoutEffect(() => {
    const indicator = headerRef.current?.querySelector<HTMLElement>(
      '[data-header-active-indicator]',
    );
    if (!indicator || !motionReadyRef.current || reducedMotionRef.current) return;

    gsap.killTweensOf(indicator);
    gsap.fromTo(
      indicator,
      { scaleX: 0.72 },
      { scaleX: 1, duration: 0.07, ease: 'power2.out', overwrite: true },
    );
  }, [activeSectionId, headerRef]);

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
        gsap.killTweensOf([headerRef.current, ...headerRef.current.querySelectorAll('*')]);
        Flip.killFlipsOf(headerRef.current);
        gsap.set(headerRef.current.querySelectorAll('*'), { clearProps: 'transform,opacity' });
        gsap.set(headerRef.current, { clearProps: 'transform,opacity' });
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
    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    const handleScroll = () => {
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
      if (layoutRef.current === 'menu-expanded') {
        updateLayout('compact');
        restoreToggleFocus();
      }

      window.requestAnimationFrame(() => {
        if (!scrollToHashTarget(url.hash)) return;
        if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
      });
    },
    [restoreToggleFocus, updateLayout],
  );

  const displayedSectionId = layout === 'menu-expanded' ? openedSectionId : activeSectionId;
  const activeSection = sectionLabels.get(displayedSectionId);

  return {
    activeHref: activeSection?.href ?? null,
    compactLabel: activeSection?.label ?? 'FUTUR.',
    handleMenuClose: closeMenu,
    handleNavigation,
    hydrated,
    layout,
    toggleMenu,
  };
}
