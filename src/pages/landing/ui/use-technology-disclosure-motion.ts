import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { type RefObject } from 'react';

gsap.registerPlugin(useGSAP);

const DETAILS_SELECTOR = '[data-technology-details]';
const PANEL_SELECTOR = '[data-technology-disclosure-panel]';
const CONTENT_SELECTOR = '[data-technology-disclosure-content]';
const GROUP_SELECTOR = '[data-technology-group]';

const OPEN_DURATION = 0.48;
const CURTAIN_DURATION = 0.42;
const CLOSE_DURATION = 0.3;
const DISCLOSURE_EASE = 'power3.inOut';

type TechnologySectionRef = RefObject<HTMLElement | null>;

function getVisibleGroups(details: HTMLDetailsElement) {
  return Array.from(details.querySelectorAll<HTMLElement>(GROUP_SELECTOR)).filter((group) => {
    const rect = group.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  });
}

function revealGroupsInViewport(details: HTMLDetailsElement) {
  const groups = Array.from(details.querySelectorAll<HTMLElement>(GROUP_SELECTOR));
  const openingGroups = new Set([...groups.slice(0, 4), ...getVisibleGroups(details)]);

  openingGroups.forEach((group) => {
    group.dataset.landingVisible = 'true';
  });
}

function getScrollTarget(details: HTMLDetailsElement, summary: HTMLElement) {
  const stickyTop = Number.parseFloat(getComputedStyle(summary).top) || 0;
  const detailsTop = details.getBoundingClientRect().top;

  if (detailsTop >= stickyTop) return null;

  const documentTop = window.scrollY + detailsTop;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  return Math.min(Math.max(0, documentTop - stickyTop), maxScroll);
}

export function useTechnologyDisclosureMotion(sectionRef: TechnologySectionRef) {
  useGSAP(
    (_, contextSafe) => {
      const section = sectionRef.current;

      if (!section || !contextSafe) return undefined;

      const details = section.querySelector<HTMLDetailsElement>(DETAILS_SELECTOR);
      const summary = details?.querySelector<HTMLElement>('summary');
      const panel = details?.querySelector<HTMLElement>(PANEL_SELECTOR);
      const content = details?.querySelector<HTMLElement>(CONTENT_SELECTOR);

      if (!details || !summary || !panel || !content) return undefined;

      const media = gsap.matchMedia(section);

      media.add('(prefers-reduced-motion: no-preference)', () => {
        let disclosureTimeline: gsap.core.Timeline | null = null;
        let scrollTween: gsap.core.Tween | null = null;
        let revealFrame: number | null = null;
        let closingGroups: HTMLElement[] = [];
        let targetState: 'open' | 'closed' = details.open ? 'open' : 'closed';

        details.dataset.technologyDisclosureEnhanced = 'true';

        const killActiveMotion = () => {
          disclosureTimeline?.kill();
          scrollTween?.kill();
          if (revealFrame !== null) cancelAnimationFrame(revealFrame);
          disclosureTimeline = null;
          scrollTween = null;
          revealFrame = null;
        };

        const clearGroupMotion = () => {
          if (!closingGroups.length) return;
          gsap.set(closingGroups, { clearProps: 'opacity,transform' });
          closingGroups = [];
        };

        const settleOpen = () => {
          if (targetState !== 'open') return;

          delete details.dataset.technologyDisclosureClosing;
          gsap.set(panel, { clearProps: 'height,overflow' });
          gsap.set(content, { clearProps: 'clipPath' });
          clearGroupMotion();
          disclosureTimeline = null;
        };

        const settleClosed = (scrollTarget: number | null) => {
          if (targetState !== 'closed') return;

          details.open = false;
          delete details.dataset.technologyDisclosureClosing;
          gsap.set(panel, { clearProps: 'height,overflow' });
          gsap.set(content, { clearProps: 'clipPath' });
          clearGroupMotion();
          disclosureTimeline = null;

          if (scrollTarget !== null) window.scrollTo(0, scrollTarget);
        };

        const animateOpen = () => {
          const wasClosed = !details.open;
          const interruptedGroups = closingGroups;

          targetState = 'open';
          killActiveMotion();
          delete details.dataset.technologyDisclosureClosing;

          if (wasClosed) details.open = true;

          const currentHeight = wasClosed ? 0 : panel.getBoundingClientRect().height;
          const targetHeight = panel.scrollHeight;
          gsap.set(panel, { height: currentHeight, overflow: 'hidden' });

          if (wasClosed) {
            gsap.set(content, { clipPath: 'inset(0 0 100% 0)' });
          }

          revealFrame = requestAnimationFrame(() => {
            revealFrame = null;
            if (targetState === 'open') revealGroupsInViewport(details);
          });

          disclosureTimeline = gsap.timeline({ onComplete: settleOpen });
          disclosureTimeline.to(
            panel,
            {
              duration: OPEN_DURATION,
              ease: DISCLOSURE_EASE,
              height: targetHeight,
            },
            0,
          );
          disclosureTimeline.to(
            content,
            {
              clipPath: 'inset(0 0 0% 0)',
              duration: CURTAIN_DURATION,
              ease: DISCLOSURE_EASE,
            },
            0,
          );

          if (interruptedGroups.length) {
            disclosureTimeline.to(
              interruptedGroups,
              {
                clearProps: 'opacity,transform',
                duration: 0.2,
                ease: 'power2.out',
                opacity: 1,
                y: 0,
              },
              0,
            );
          }
        };

        const animateClosed = () => {
          targetState = 'closed';
          killActiveMotion();
          details.dataset.technologyDisclosureClosing = 'true';

          const currentHeight = panel.getBoundingClientRect().height;
          const scrollTarget = getScrollTarget(details, summary);
          closingGroups = getVisibleGroups(details);

          gsap.set(panel, { height: currentHeight, overflow: 'hidden' });
          disclosureTimeline = gsap.timeline({ onComplete: () => settleClosed(scrollTarget) });
          disclosureTimeline.to(
            content,
            {
              clipPath: 'inset(0 0 100% 0)',
              duration: CLOSE_DURATION,
              ease: DISCLOSURE_EASE,
            },
            0,
          );
          disclosureTimeline.to(
            panel,
            {
              duration: CLOSE_DURATION,
              ease: DISCLOSURE_EASE,
              height: 0,
            },
            0,
          );

          if (closingGroups.length) {
            disclosureTimeline.to(
              closingGroups,
              {
                duration: 0.16,
                ease: 'power2.in',
                opacity: 0,
                stagger: 0.02,
                y: -8,
              },
              0,
            );
          }

          if (scrollTarget !== null) {
            const scrollPosition = { y: window.scrollY };
            scrollTween = gsap.to(scrollPosition, {
              duration: CLOSE_DURATION,
              ease: DISCLOSURE_EASE,
              onUpdate: () => window.scrollTo(0, scrollPosition.y),
              overwrite: true,
              y: scrollTarget,
            });
          }
        };

        const handleSummaryClick = contextSafe((event: MouseEvent) => {
          event.preventDefault();

          if (targetState === 'closed' || details.dataset.technologyDisclosureClosing === 'true') {
            animateOpen();
            return;
          }

          animateClosed();
        });

        summary.addEventListener('click', handleSummaryClick);

        return () => {
          summary.removeEventListener('click', handleSummaryClick);
          killActiveMotion();

          if (targetState === 'closed') details.open = false;
          delete details.dataset.technologyDisclosureEnhanced;
          delete details.dataset.technologyDisclosureClosing;
          gsap.set(panel, { clearProps: 'height,overflow' });
          gsap.set(content, { clearProps: 'clipPath' });
          clearGroupMotion();
        };
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );
}
