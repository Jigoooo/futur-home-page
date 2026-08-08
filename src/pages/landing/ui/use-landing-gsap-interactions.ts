import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { type RefObject } from 'react';

gsap.registerPlugin(useGSAP);

const SPOTLIGHT_SELECTOR = '[data-landing-spotlight]';

type PageRef = RefObject<HTMLElement | null>;
type CssSetter = (value: number) => void;
type CssSetterMap = Map<string, CssSetter>;

const cssSetterCache = new WeakMap<HTMLElement, CssSetterMap>();

function getSpotlightTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(SPOTLIGHT_SELECTOR);
}

function setCssPixel(target: HTMLElement, property: string, value: number) {
  let setters = cssSetterCache.get(target);
  if (!setters) {
    setters = new Map();
    cssSetterCache.set(target, setters);
  }

  let setter = setters.get(property);
  if (!setter) {
    setter = gsap.quickSetter(target, property, 'px') as CssSetter;
    setters.set(property, setter);
  }
  setter(value);
}

function updateSpotlight(event: PointerEvent) {
  const target = getSpotlightTarget(event.target);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (target.dataset.landingSpotlight === 'button') {
    setCssPixel(target, '--spot-x', x);
    setCssPixel(target, '--spot-y', y);
    return;
  }
  setCssPixel(target, '--mx', x);
  setCssPixel(target, '--my', y);
}

export function useLandingGsapInteractions(pageRef: PageRef) {
  useGSAP(
    (_, contextSafe) => {
      const page = pageRef.current;
      if (!page || !contextSafe) return undefined;

      const media = gsap.matchMedia(page);
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

          const handlePointerMove = contextSafe((event: PointerEvent) => updateSpotlight(event));
          page.addEventListener('pointermove', handlePointerMove as EventListener, {
            passive: true,
          });

          return () => {
            page.removeEventListener('pointermove', handlePointerMove as EventListener);
          };
        },
      );

      return () => media.revert();
    },
    { scope: pageRef },
  );
}
