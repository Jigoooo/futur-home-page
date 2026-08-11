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

import {
  clearDesktopHeaderFrame,
  getDesktopHeaderProgress,
  writeDesktopHeaderFrame,
} from './header-motion';
import { scrollToHashTarget } from '../lib/scroll-to-page-top';

gsap.registerPlugin(Flip);

export type HeaderLayout = 'desktop-fluid' | 'mobile-compact' | 'mobile-expanded';

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
  const [layout, setLayout] = useState<HeaderLayout>('desktop-fluid');
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [hydrated, setHydrated] = useState(false);
  const [openedSectionId, setOpenedSectionId] = useState('hero');
  const activeSectionIdRef = useRef('hero');
  const layoutRef = useRef<HeaderLayout>('desktop-fluid');
  const openScrollYRef = useRef(0);
  const motionReadyRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const focusReturnFrameRef = useRef(0);
  const focusReturnGenerationRef = useRef(0);
  const focusReturnTokenRef = useRef<number | null>(null);
  const pendingFlipRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const motionTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const cancelToggleFocusReturn = useCallback(() => {
    focusReturnGenerationRef.current += 1;
    focusReturnTokenRef.current = null;
    window.cancelAnimationFrame(focusReturnFrameRef.current);
  }, []);

  const scheduleToggleFocusReturn = useCallback(() => {
    focusReturnGenerationRef.current += 1;
    focusReturnTokenRef.current = focusReturnGenerationRef.current;
  }, []);

  const updateLayout = useCallback(
    (nextLayout: HeaderLayout) => {
      if (layoutRef.current === nextLayout) return;

      const header = headerRef.current;
      if (nextLayout !== 'mobile-compact') cancelToggleFocusReturn();
      const mobileMenuTransition =
        (layoutRef.current === 'mobile-compact' && nextLayout === 'mobile-expanded') ||
        (layoutRef.current === 'mobile-expanded' && nextLayout === 'mobile-compact');

      if (header && mobileMenuTransition && motionReadyRef.current && !reducedMotionRef.current) {
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
    [cancelToggleFocusReturn, headerRef],
  );

  const restoreToggleFocus = scheduleToggleFocusReturn;

  const closeMenu = useCallback(() => {
    if (layoutRef.current !== 'mobile-expanded') return;
    restoreToggleFocus();
    updateLayout('mobile-compact');
  }, [restoreToggleFocus, updateLayout]);

  useLayoutEffect(() => {
    const flipState = pendingFlipRef.current;
    const header = headerRef.current;
    if (!flipState || !header || reducedMotionRef.current) return;

    pendingFlipRef.current = null;
    header.dataset.headerMotion = 'true';
    const opening = layout === 'mobile-expanded';
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
    const focusReturnToken = focusReturnTokenRef.current;
    if (layout !== 'mobile-compact' || focusReturnToken === null) return;

    window.cancelAnimationFrame(focusReturnFrameRef.current);
    focusReturnFrameRef.current = window.requestAnimationFrame(() => {
      if (
        focusReturnTokenRef.current !== focusReturnToken ||
        focusReturnGenerationRef.current !== focusReturnToken ||
        layoutRef.current !== 'mobile-compact'
      ) {
        return;
      }
      focusReturnTokenRef.current = null;
      toggleRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusReturnFrameRef.current);
  }, [layout, toggleRef]);

  useLayoutEffect(() => {
    if (layout !== 'mobile-expanded') return;

    const currentLink = menuRef.current?.querySelector<HTMLElement>('a[aria-current="location"]');
    const closeButton = menuRef.current?.querySelector<HTMLElement>('[data-header-close]');
    (currentLink ?? closeButton)?.focus({ preventScroll: true });
  }, [layout, menuRef]);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compactViewport = window.matchMedia('(max-width: 900px)');
    reducedMotionRef.current = reducedMotion.matches;

    const syncBaseLayout = () => {
      if (compactViewport.matches && layoutRef.current === 'mobile-expanded') return;
      updateLayout(compactViewport.matches ? 'mobile-compact' : 'desktop-fluid');
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
    const trackHeaderFocus = (event: FocusEvent) => {
      const target = event.target;
      const header = headerRef.current;
      if (target instanceof Node && !header?.contains(target)) cancelToggleFocusReturn();
    };
    const releaseHeaderFocus = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget;
      if (!(nextTarget instanceof Node) || headerRef.current?.contains(nextTarget)) return;
      cancelToggleFocusReturn();
    };
    const releaseHeaderPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || headerRef.current?.contains(target)) return;
      cancelToggleFocusReturn();
    };
    compactViewport.addEventListener('change', syncBaseLayout);
    reducedMotion.addEventListener('change', syncMotionPreference);
    document.addEventListener('focusin', trackHeaderFocus);
    document.addEventListener('focusout', releaseHeaderFocus);
    document.addEventListener('pointerdown', releaseHeaderPointer);
    syncBaseLayout();
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
      compactViewport.removeEventListener('change', syncBaseLayout);
      reducedMotion.removeEventListener('change', syncMotionPreference);
      document.removeEventListener('focusin', trackHeaderFocus);
      document.removeEventListener('focusout', releaseHeaderFocus);
      document.removeEventListener('pointerdown', releaseHeaderPointer);
    };
  }, [cancelToggleFocusReturn, headerRef, updateLayout]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const compactViewport = window.matchMedia('(max-width: 900px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const proxy = { value: getDesktopHeaderProgress(window.scrollY) };
    let scrollY = window.scrollY;
    let viewportWidth = window.innerWidth;
    let frameId = 0;
    let quickSetProgress: ReturnType<typeof gsap.quickTo> | null = null;

    const createQuickSetter = () => {
      quickSetProgress?.tween.kill();
      quickSetProgress =
        reducedMotion.matches || compactViewport.matches
          ? null
          : gsap.quickTo(proxy, 'value', {
              duration: 0.2,
              ease: 'power2.out',
              onUpdate: () => writeDesktopHeaderFrame(header, viewportWidth, proxy.value),
            });
    };
    const writeFrame = () => {
      frameId = 0;
      if (compactViewport.matches) {
        quickSetProgress?.tween.kill();
        clearDesktopHeaderFrame(header);
        return;
      }

      const progress = getDesktopHeaderProgress(scrollY);
      if (reducedMotion.matches) {
        proxy.value = progress;
        writeDesktopHeaderFrame(header, viewportWidth, progress);
      } else {
        quickSetProgress?.(progress);
      }
    };
    const scheduleFrame = () => {
      scrollY = window.scrollY;
      viewportWidth = window.innerWidth;
      if (compactViewport.matches) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
        quickSetProgress?.tween.kill();
        clearDesktopHeaderFrame(header);
        return;
      }
      if (frameId) return;
      frameId = window.requestAnimationFrame(writeFrame);
    };
    const syncMotionPreference = () => {
      createQuickSetter();
      scheduleFrame();
    };
    const syncViewportMode = () => {
      if (compactViewport.matches) {
        scheduleFrame();
        return;
      }
      createQuickSetter();
      scheduleFrame();
    };

    createQuickSetter();
    window.addEventListener('scroll', scheduleFrame, { passive: true });
    window.addEventListener('resize', scheduleFrame, { passive: true });
    compactViewport.addEventListener('change', syncViewportMode);
    reducedMotion.addEventListener('change', syncMotionPreference);
    scheduleFrame();

    return () => {
      window.cancelAnimationFrame(frameId);
      quickSetProgress?.tween.kill();
      window.removeEventListener('scroll', scheduleFrame);
      window.removeEventListener('resize', scheduleFrame);
      compactViewport.removeEventListener('change', syncViewportMode);
      reducedMotion.removeEventListener('change', syncMotionPreference);
      clearDesktopHeaderFrame(header);
    };
  }, [headerRef]);

  useEffect(() => {
    let frameId = 0;
    const updateActiveSection = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (layoutRef.current === 'mobile-expanded') return;
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
    if (layout !== 'mobile-expanded') return undefined;

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
    if (layoutRef.current === 'mobile-expanded') {
      closeMenu();
      return;
    }

    cancelToggleFocusReturn();
    openScrollYRef.current = window.scrollY;
    setOpenedSectionId(activeSectionIdRef.current);
    if (layoutRef.current !== 'mobile-compact') return;
    updateLayout('mobile-expanded');
  }, [cancelToggleFocusReturn, closeMenu, updateLayout]);

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
      const closingMenu = layoutRef.current === 'mobile-expanded';
      if (closingMenu) {
        restoreToggleFocus();
        updateLayout('mobile-compact');
      }

      window.requestAnimationFrame(() => {
        if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
        window.requestAnimationFrame(() => scrollToHashTarget(url.hash));
      });
    },
    [restoreToggleFocus, updateLayout],
  );

  const displayedSectionId = layout === 'mobile-expanded' ? openedSectionId : activeSectionId;
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
