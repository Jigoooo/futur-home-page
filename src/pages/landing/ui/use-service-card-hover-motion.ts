import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { type RefObject } from 'react';

gsap.registerPlugin(useGSAP);

const CARD_SELECTOR = '[data-service-card]';
const SURFACE_SELECTOR = '[data-service-card-surface]';
const LENS_SELECTOR = '[data-service-card-lens]';

export function useServiceCardHoverMotion(sectionRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    (_, contextSafe) => {
      const section = sectionRef.current;
      if (!section || !contextSafe) return undefined;

      const media = gsap.matchMedia(section);
      media.add(
        {
          finePointer: '(hover: hover) and (pointer: fine)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const conditions = context.conditions as
            | { finePointer?: boolean; reduceMotion?: boolean }
            | undefined;
          if (!conditions?.finePointer || conditions.reduceMotion) return undefined;

          const cleanups: Array<() => void> = [];
          const cards = Array.from(section.querySelectorAll<HTMLElement>(CARD_SELECTOR));

          cards.forEach((card) => {
            const surface = card.querySelector<HTMLElement>(SURFACE_SELECTOR);
            const lens = card.querySelector<HTMLElement>(LENS_SELECTOR);
            if (!surface || !lens) return;

            const moveLensX = gsap.quickTo(lens, '--service-lens-x', {
              duration: 0.14,
              ease: 'power3.out',
            });
            const moveLensY = gsap.quickTo(lens, '--service-lens-y', {
              duration: 0.14,
              ease: 'power3.out',
            });
            const writePointer = (event: PointerEvent, immediate = false) => {
              const rect = surface.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const y = event.clientY - rect.top;
              if (immediate) {
                gsap.set(lens, { '--service-lens-x': x, '--service-lens-y': y });
                return;
              }
              moveLensX(x);
              moveLensY(y);
            };
            const enter = contextSafe((event: PointerEvent) => {
              writePointer(event, true);
              gsap.killTweensOf(surface);
              gsap.killTweensOf(lens, 'opacity');
              gsap.to(surface, {
                y: -4,
                scale: 1.002,
                '--service-card-shadow-opacity': 1,
                duration: 0.32,
                ease: 'power3.out',
                overwrite: true,
              });
              gsap.to(lens, {
                opacity: 1,
                duration: 0.18,
                ease: 'power2.out',
                overwrite: true,
              });
            });
            const move = contextSafe((event: PointerEvent) => writePointer(event));
            const leave = contextSafe(() => {
              gsap.killTweensOf(surface);
              gsap.killTweensOf(lens, 'opacity');
              gsap.to(surface, {
                y: 0,
                scale: 1,
                '--service-card-shadow-opacity': 0,
                duration: 0.48,
                ease: 'back.out(1.2)',
                overwrite: true,
                onComplete: () => {
                  gsap.set(surface, { clearProps: 'transform' });
                  surface.style.removeProperty('--service-card-shadow-opacity');
                },
              });
              gsap.to(lens, {
                opacity: 0,
                duration: 0.18,
                ease: 'power2.out',
                overwrite: true,
              });
            });

            card.addEventListener('pointerenter', enter);
            card.addEventListener('pointermove', move);
            card.addEventListener('pointerleave', leave);
            card.addEventListener('pointercancel', leave);
            cleanups.push(() => {
              card.removeEventListener('pointerenter', enter);
              card.removeEventListener('pointermove', move);
              card.removeEventListener('pointerleave', leave);
              card.removeEventListener('pointercancel', leave);
              moveLensX.tween.kill();
              moveLensY.tween.kill();
              gsap.killTweensOf([surface, lens]);
              gsap.set(surface, { clearProps: 'transform' });
              gsap.set(lens, { clearProps: 'opacity' });
              surface.style.removeProperty('--service-card-shadow-opacity');
              lens.style.removeProperty('--service-lens-x');
              lens.style.removeProperty('--service-lens-y');
            });
          });

          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );
}
