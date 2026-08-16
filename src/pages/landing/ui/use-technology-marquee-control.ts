import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

const VIEWPORT_SELECTOR = '[data-technology-marquee-viewport]';
const MARQUEE_SELECTOR = '[data-technology-marquee]';

type MarqueeState = 'running' | 'user-paused' | 'offscreen-paused' | 'page-hidden' | 'reduced';

interface TechnologyMarqueeControl {
  userPaused: boolean;
  toggleMarquee: () => void;
}

function isViewportVisible(viewport: HTMLElement) {
  const rect = viewport.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

export function useTechnologyMarqueeControl(
  sectionRef: RefObject<HTMLElement | null>,
): TechnologyMarqueeControl {
  const [userPaused, setUserPaused] = useState(false);
  const userPausedRef = useRef(false);
  const refreshRef = useRef<(() => void) | null>(null);

  const toggleMarquee = useCallback(() => {
    setUserPaused((current) => !current);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const items = Array.from(section.querySelectorAll<HTMLElement>(VIEWPORT_SELECTOR))
      .map((viewport) => ({
        marquee: viewport.querySelector<HTMLElement>(MARQUEE_SELECTOR),
        viewport,
      }))
      .filter(
        (item): item is { marquee: HTMLElement; viewport: HTMLElement } => item.marquee !== null,
      );
    const visibleViewports = new Map(
      items.map(({ viewport }) => [viewport, isViewportVisible(viewport)]),
    );

    const refresh = () => {
      const reduced = reduceMotion.matches;
      const pageHidden = document.visibilityState === 'hidden';

      if (reduced) delete section.dataset.technologyMarqueeEnhanced;
      else section.dataset.technologyMarqueeEnhanced = 'true';

      items.forEach(({ marquee, viewport }) => {
        let state: MarqueeState = 'running';

        if (reduced) state = 'reduced';
        else if (userPausedRef.current) state = 'user-paused';
        else if (pageHidden) state = 'page-hidden';
        else if (!visibleViewports.get(viewport)) state = 'offscreen-paused';

        marquee.dataset.technologyMarqueeState = state;
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visibleViewports.set(entry.target as HTMLElement, entry.isIntersecting);
      });
      refresh();
    });
    items.forEach(({ viewport }) => observer.observe(viewport));

    const handleVisibilityChange = () => refresh();
    const handleMotionPreferenceChange = () => refresh();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    reduceMotion.addEventListener('change', handleMotionPreferenceChange);
    refreshRef.current = refresh;
    refresh();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reduceMotion.removeEventListener('change', handleMotionPreferenceChange);
      refreshRef.current = null;
      delete section.dataset.technologyMarqueeEnhanced;
      items.forEach(({ marquee }) => delete marquee.dataset.technologyMarqueeState);
    };
  }, [sectionRef]);

  useEffect(() => {
    userPausedRef.current = userPaused;
    refreshRef.current?.();
  }, [userPaused]);

  return { toggleMarquee, userPaused };
}
