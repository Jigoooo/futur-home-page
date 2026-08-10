import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PageRef = RefObject<HTMLElement | null>;

export function useServicesChapterMotion(pageRef: PageRef) {
  useGSAP(
    () => {
      const page = pageRef.current;
      const chapter = page?.querySelector<HTMLElement>('[data-editorial-chapter="services"]');

      if (!page || !chapter) return undefined;

      const rows = Array.from(chapter.querySelectorAll<HTMLElement>('[data-service-row]'));
      const media = gsap.matchMedia();

      media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        rows[0]?.setAttribute('data-service-active', 'true');

        const chapterTween = gsap.fromTo(
          chapter,
          { clipPath: 'inset(5% 2% round 28px)' },
          {
            clipPath: 'inset(0% 0% round 0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 92%',
              end: 'top 55%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

        const rowTriggers = rows.map((row) =>
          ScrollTrigger.create({
            trigger: row,
            start: 'top 58%',
            end: 'bottom 42%',
            onToggle: ({ isActive }) => {
              if (!isActive) return;
              rows.forEach((candidate) => {
                if (candidate === row) candidate.dataset.serviceActive = 'true';
                else delete candidate.dataset.serviceActive;
              });
            },
          }),
        );

        return () => {
          chapterTween.scrollTrigger?.kill();
          chapterTween.kill();
          rowTriggers.forEach((trigger) => trigger.kill());
          rows.forEach((row) => delete row.dataset.serviceActive);
          gsap.set(chapter, { clearProps: 'clipPath' });
        };
      });

      return () => media.revert();
    },
    { scope: pageRef },
  );
}
