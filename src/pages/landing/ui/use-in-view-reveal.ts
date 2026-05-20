import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-landing-reveal]';

export function useInViewReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));

    if (!targets.length) return undefined;

    document.body.dataset.landingReady = 'true';

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => {
        target.dataset.landingVisible = 'true';
      });
      return () => {
        delete document.body.dataset.landingReady;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.landingVisible = 'true';
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      delete document.body.dataset.landingReady;
    };
  }, []);
}
