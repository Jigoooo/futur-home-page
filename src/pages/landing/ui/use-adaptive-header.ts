import gsap from 'gsap';
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
  clearDesktopActiveIndicator,
  startDesktopActiveIndicatorMotion,
} from './header-active-indicator';
import {
  clearDesktopHeaderFrame,
  getDesktopHeaderProgress,
  writeDesktopHeaderFrame,
} from './header-motion';
import { getLandingNavOffset, scrollToHashTarget } from '../lib/scroll-to-page-top';

export type HeaderLayout = 'desktop-fluid' | 'mobile-persistent';
type HeaderSurface = 'dark' | 'light';

type AdaptiveHeaderRefs = {
  headerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
};

const sectionLabels = new Map([
  ['services', { href: '#services', label: '서비스' }],
  ['technology', { href: '#technology', label: '기술' }],
  ['faq', { href: '#faq', label: 'FAQ' }],
  ['footer', { href: null, label: '문의' }],
]);
const headerSectionProbeGuard = 8;
const headerSurfaceProbeRatio = 0.5;
const navigationLandingProbeTolerance = 1;

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

function getVisibleSectionId(header: HTMLElement | null) {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-landing-section]'));
  const viewportProbe = Math.max(
    (header?.getBoundingClientRect().bottom ?? 0) + headerSectionProbeGuard,
    getLandingNavOffset() + navigationLandingProbeTolerance,
  );
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

function getVisibleHeaderSurface(
  header: HTMLElement | null,
  currentSurface: HeaderSurface,
): HeaderSurface {
  const surfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-header-surface]'));
  const headerRect = header?.getBoundingClientRect();
  if (!headerRect) return currentSurface;

  const probeY = headerRect.top + headerRect.height * headerSurfaceProbeRatio;
  const surfaceAtMidpoint = surfaces.find((surface) => {
    const rect = surface.getBoundingClientRect();
    return rect.top <= probeY && rect.bottom > probeY;
  });

  if (!surfaceAtMidpoint) return currentSurface;
  return surfaceAtMidpoint.dataset.headerSurface === 'light' ? 'light' : 'dark';
}

export function useAdaptiveHeader({ headerRef, menuRef }: AdaptiveHeaderRefs) {
  const [layout, setLayout] = useState<HeaderLayout>('desktop-fluid');
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [glassTone, setGlassTone] = useState<HeaderSurface>('dark');
  const [hydrated, setHydrated] = useState(false);
  const activeSectionIdRef = useRef('hero');
  const glassToneRef = useRef<HeaderSurface>('dark');
  const layoutRef = useRef<HeaderLayout>('desktop-fluid');
  const reducedMotionRef = useRef(false);
  const desktopIndicatorTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const updateLayout = useCallback((nextLayout: HeaderLayout) => {
    if (layoutRef.current === nextLayout) return;
    layoutRef.current = nextLayout;
    setLayout(nextLayout);
  }, []);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compactViewport = window.matchMedia('(max-width: 900px)');
    reducedMotionRef.current = reducedMotion.matches;

    const syncBaseLayout = () => {
      updateLayout(compactViewport.matches ? 'mobile-persistent' : 'desktop-fluid');
    };
    const syncMotionPreference = () => {
      reducedMotionRef.current = reducedMotion.matches;
    };
    compactViewport.addEventListener('change', syncBaseLayout);
    reducedMotion.addEventListener('change', syncMotionPreference);
    syncBaseLayout();
    const hydrationFrame = window.requestAnimationFrame(() => {
      setHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(hydrationFrame);
      compactViewport.removeEventListener('change', syncBaseLayout);
      reducedMotion.removeEventListener('change', syncMotionPreference);
    };
  }, [updateLayout]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const compactViewport = window.matchMedia('(max-width: 900px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const proxy = { value: getDesktopHeaderProgress(window.scrollY) };
    let scrollY = window.scrollY;
    let viewportWidth = window.innerWidth;
    let targetProgress = proxy.value;
    let targetViewportWidth = viewportWidth;
    let hasWrittenDesktopFrame = false;
    let frameId = 0;
    let quickSetProgress: ReturnType<typeof gsap.quickTo> | null = null;
    let desktopActive = !compactViewport.matches;

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
    const cancelDesktopMotion = () => {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      quickSetProgress?.tween.kill();
      quickSetProgress = null;
    };
    const writeFrame = () => {
      frameId = 0;
      if (compactViewport.matches) {
        cancelDesktopMotion();
        return;
      }

      const progress = getDesktopHeaderProgress(scrollY);
      const firstDesktopFrame = !hasWrittenDesktopFrame;
      const progressChanged = targetProgress !== progress;
      const viewportChanged = targetViewportWidth !== viewportWidth;
      if (!firstDesktopFrame && !progressChanged && !viewportChanged) {
        return;
      }

      targetProgress = progress;
      targetViewportWidth = viewportWidth;
      hasWrittenDesktopFrame = true;
      if (firstDesktopFrame || reducedMotion.matches) {
        proxy.value = progress;
        writeDesktopHeaderFrame(header, viewportWidth, progress);
      } else if (viewportChanged && !progressChanged) {
        writeDesktopHeaderFrame(header, viewportWidth, proxy.value);
      } else {
        quickSetProgress?.(progress);
      }
    };
    const scheduleFrame = () => {
      scrollY = window.scrollY;
      viewportWidth = window.innerWidth;
      if (compactViewport.matches) {
        cancelDesktopMotion();
        return;
      }
      if (frameId) return;
      frameId = window.requestAnimationFrame(writeFrame);
    };
    const syncMotionPreference = () => {
      createQuickSetter();
      if (reducedMotion.matches && !compactViewport.matches) {
        scrollY = window.scrollY;
        viewportWidth = window.innerWidth;
        const progress = getDesktopHeaderProgress(scrollY);
        proxy.value = progress;
        targetProgress = progress;
        targetViewportWidth = viewportWidth;
        hasWrittenDesktopFrame = true;
        writeDesktopHeaderFrame(header, viewportWidth, progress);
        return;
      }
      scheduleFrame();
    };
    const syncViewportMode = () => {
      if (compactViewport.matches) {
        const leavingDesktop = desktopActive;
        desktopActive = false;
        cancelDesktopMotion();
        if (leavingDesktop) {
          hasWrittenDesktopFrame = false;
          clearDesktopHeaderFrame(header);
        }
        return;
      }
      desktopActive = true;
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
      cancelDesktopMotion();
      window.removeEventListener('scroll', scheduleFrame);
      window.removeEventListener('resize', scheduleFrame);
      compactViewport.removeEventListener('change', syncViewportMode);
      reducedMotion.removeEventListener('change', syncMotionPreference);
      clearDesktopHeaderFrame(header);
    };
  }, [headerRef]);

  useEffect(() => {
    let frameId = 0;
    let shouldUpdateActiveSection = false;
    const scheduleHeaderMeasurement = (includeActiveSection: boolean) => {
      shouldUpdateActiveSection ||= includeActiveSection;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const nextGlassTone = getVisibleHeaderSurface(headerRef.current, glassToneRef.current);
        if (nextGlassTone !== glassToneRef.current) {
          glassToneRef.current = nextGlassTone;
          setGlassTone(nextGlassTone);
        }
        const updateSection = shouldUpdateActiveSection;
        shouldUpdateActiveSection = false;
        if (!updateSection) return;
        const nextSectionId = getVisibleSectionId(headerRef.current) ?? 'hero';
        if (nextSectionId === activeSectionIdRef.current) return;

        activeSectionIdRef.current = nextSectionId;
        setActiveSectionId(nextSectionId);
      });
    };
    const updateActiveSection = () => scheduleHeaderMeasurement(true);
    const updateHeaderTone = () => scheduleHeaderMeasurement(false);
    const resizeObserver = new ResizeObserver(updateHeaderTone);
    const header = headerRef.current;
    if (header) resizeObserver.observe(header);

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    window.addEventListener('landing-surface-change', updateActiveSection);
    updateActiveSection();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      window.removeEventListener('landing-surface-change', updateActiveSection);
    };
  }, [headerRef]);

  const handleNavigation = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
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
    window.requestAnimationFrame(() => {
      if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
      window.requestAnimationFrame(() => scrollToHashTarget(url.hash));
    });
  }, []);

  const activeSection = sectionLabels.get(activeSectionId);
  const activeHref = activeSection?.href ?? null;

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const indicator = menu?.querySelector<HTMLElement>('[data-header-active-indicator]');
    if (!menu || !indicator) return;

    const target = activeHref ? menu.querySelector<HTMLElement>(`a[href="${activeHref}"]`) : null;
    desktopIndicatorTimelineRef.current = startDesktopActiveIndicatorMotion({
      container: indicator.parentElement ?? menu,
      indicator,
      previousTimeline: desktopIndicatorTimelineRef.current,
      reducedMotion: reducedMotionRef.current,
      target,
    });
  }, [activeHref, layout, menuRef]);

  useEffect(() => {
    const menu = menuRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;

    const repositionIndicator = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const indicator = menu?.querySelector<HTMLElement>('[data-header-active-indicator]');
        if (!menu || !indicator) return;

        const target = menu.querySelector<HTMLElement>('a[aria-current="location"]');
        desktopIndicatorTimelineRef.current = startDesktopActiveIndicatorMotion({
          container: indicator.parentElement ?? menu,
          indicator,
          previousTimeline: desktopIndicatorTimelineRef.current,
          reducedMotion: reducedMotion.matches,
          resize: true,
          target,
        });
      });
    };

    window.addEventListener('resize', repositionIndicator, { passive: true });
    reducedMotion.addEventListener('change', repositionIndicator);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', repositionIndicator);
      reducedMotion.removeEventListener('change', repositionIndicator);
      desktopIndicatorTimelineRef.current?.kill();
      desktopIndicatorTimelineRef.current = null;
      const indicator = menu?.querySelector<HTMLElement>('[data-header-active-indicator]');
      if (indicator) clearDesktopActiveIndicator(indicator);
    };
  }, [menuRef]);

  return {
    activeHref,
    handleNavigation,
    hydrated,
    layout,
    glassTone,
  };
}
