import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { type RefObject } from 'react';

gsap.registerPlugin(useGSAP);

const INTERACTIVE_SELECTOR = '[data-landing-interactive]';
const SPOTLIGHT_SELECTOR = '[data-landing-spotlight]';
const SURFACE_SELECTOR = '[data-landing-surface]';
const LABEL_SELECTOR = '[data-landing-label]';
const ARROW_SELECTOR = '[data-landing-arrow]';
const SERVICE_ICON_SELECTOR = '[data-landing-service-icon]';

type PageRef = RefObject<HTMLElement | null>;

type CssSetter = (value: number) => void;
type CssSetterMap = Map<string, CssSetter>;

const cssSetterCache = new WeakMap<HTMLElement, CssSetterMap>();

function getControl(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
}

function getSpotlightTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(SPOTLIGHT_SELECTOR);
}

function getSurface(control: HTMLElement) {
  if (control.dataset.landingInteractive === 'stage-choice') {
    return control.querySelector<HTMLElement>(SURFACE_SELECTOR) ?? control;
  }

  if (control.dataset.landingInteractive === 'check-tile') {
    return control.querySelector<HTMLElement>(SURFACE_SELECTOR) ?? control;
  }

  if (control.dataset.landingInteractive === 'card-link') {
    return control.closest<HTMLElement>('[data-landing-card]') ?? control;
  }

  return control;
}

function getArrow(control: HTMLElement) {
  return control.querySelector<HTMLElement>(ARROW_SELECTOR);
}

function getLabel(control: HTMLElement) {
  return control.querySelector<HTMLElement>(LABEL_SELECTOR);
}

function isNode(target: EventTarget | null): target is Node {
  return target instanceof Node;
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

  const runSetter = setter;
  runSetter(value);
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

function animateButtonDetails(control: HTMLElement, active: boolean) {
  const label = getLabel(control);
  const arrow = getArrow(control);

  if (label) {
    gsap.to(label, {
      x: active ? -2 : 0,
      duration: active ? 0.24 : 0.2,
      ease: 'power3.out',
      overwrite: true,
      ...(active ? {} : { clearProps: 'transform' }),
    });
  }

  if (arrow) {
    gsap.to(arrow, {
      x: active ? 6 : 0,
      duration: active ? 0.28 : 0.22,
      ease: active ? 'back.out(2.2)' : 'power3.out',
      overwrite: true,
      ...(active ? {} : { clearProps: 'transform' }),
    });
  }
}

function animateFineEnter(control: HTMLElement) {
  const surface = getSurface(control);
  const type = control.dataset.landingInteractive;
  const isButton = type === 'button';
  const isCardLink = type === 'card-link';
  const isRoundControl = type === 'round';

  gsap.killTweensOf(surface);

  gsap.to(surface, {
    y: isCardLink ? -8 : isRoundControl ? -3 : -2,
    scale: isButton ? 1.012 : isRoundControl ? 1.035 : 1.008,
    duration: 0.28,
    ease: 'power3.out',
    overwrite: true,
  });

  if (isButton) {
    gsap.set(control, {
      '--btn-spot-opacity': 1,
      '--btn-sheen-opacity': 1,
      '--btn-sheen-x': '0%',
    });
    gsap.to(control, {
      '--btn-sheen-x': '310%',
      duration: 0.62,
      ease: 'power3.out',
      overwrite: true,
    });
  }

  if (isCardLink) {
    const icon = surface.querySelector<HTMLElement>(SERVICE_ICON_SELECTOR);
    const arrow = getArrow(control);

    gsap.to(control, { x: 2, duration: 0.22, ease: 'power3.out', overwrite: true });
    if (icon) {
      gsap.to(icon, { y: -5, rotate: -3, scale: 1.04, duration: 0.3, ease: 'back.out(2)' });
    }
    if (arrow) gsap.to(arrow, { x: 7, duration: 0.28, ease: 'back.out(2)', overwrite: true });
  }

  animateButtonDetails(control, true);
}

function animateFineLeave(control: HTMLElement) {
  const surface = getSurface(control);
  const type = control.dataset.landingInteractive;
  const isButton = type === 'button';
  const isCardLink = type === 'card-link';

  gsap.killTweensOf(surface);

  gsap.to(surface, {
    y: 0,
    scale: 1,
    duration: 0.28,
    ease: 'power3.out',
    overwrite: true,
    clearProps: 'transform',
  });

  if (isButton) {
    gsap.to(control, {
      '--btn-spot-opacity': 0,
      '--btn-sheen-opacity': 0,
      '--btn-sheen-x': '0%',
      duration: 0.18,
      ease: 'power2.out',
      overwrite: true,
    });
  }

  if (isCardLink) {
    const icon = surface.querySelector<HTMLElement>(SERVICE_ICON_SELECTOR);
    const arrow = getArrow(control);

    gsap.to(control, {
      x: 0,
      duration: 0.22,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'transform',
    });
    if (icon) {
      gsap.to(icon, {
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.28,
        ease: 'power3.out',
        overwrite: true,
        clearProps: 'transform',
      });
    }
    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        duration: 0.22,
        ease: 'power3.out',
        overwrite: true,
        clearProps: 'transform',
      });
    }
  }

  animateButtonDetails(control, false);
}

function animatePressStart(control: HTMLElement) {
  const surface = getSurface(control);
  const isCardLink = control.dataset.landingInteractive === 'card-link';
  const arrow = getArrow(control);

  gsap.killTweensOf(surface);
  gsap.to(surface, {
    y: 1,
    scale: isCardLink ? 0.992 : 0.972,
    duration: 0.08,
    ease: 'power3.out',
    overwrite: true,
  });

  if (arrow) {
    gsap.to(arrow, { x: 3, duration: 0.08, ease: 'power3.out', overwrite: true });
  }
}

function animatePressEnd(control: HTMLElement) {
  const surface = getSurface(control);
  const arrow = getArrow(control);

  gsap.to(surface, {
    y: 0,
    scale: 1,
    duration: 0.22,
    ease: 'back.out(2)',
    overwrite: true,
    clearProps: 'transform',
  });

  if (arrow) {
    gsap.to(arrow, {
      x: 0,
      duration: 0.18,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'transform',
    });
  }
}

export function useLandingGsapInteractions(pageRef: PageRef) {
  useGSAP(
    (_, contextSafe) => {
      const page = pageRef.current;

      if (!page || !contextSafe) return undefined;

      const mm = gsap.matchMedia(page);

      mm.add(
        {
          finePointer: '(hover: hover) and (pointer: fine)',
          coarsePointer: '(hover: none), (pointer: coarse)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const conditions = context.conditions as
            | { finePointer?: boolean; coarsePointer?: boolean; reduceMotion?: boolean }
            | undefined;

          if (conditions?.reduceMotion) return undefined;

          const cleanups: Array<() => void> = [];
          let pressedControl: HTMLElement | null = null;

          const addListener = (target: EventTarget, type: string, listener: EventListener) => {
            target.addEventListener(type, listener);
            cleanups.push(() => target.removeEventListener(type, listener));
          };

          if (conditions?.finePointer) {
            const handlePointerMove = contextSafe((event: PointerEvent) => updateSpotlight(event));
            const handlePointerOver = contextSafe((event: PointerEvent) => {
              if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

              const control = getControl(event.target);
              if (
                !control ||
                (isNode(event.relatedTarget) && control.contains(event.relatedTarget))
              ) {
                return;
              }

              animateFineEnter(control);
            });
            const handlePointerOut = contextSafe((event: PointerEvent) => {
              if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

              const control = getControl(event.target);
              if (
                !control ||
                (isNode(event.relatedTarget) && control.contains(event.relatedTarget))
              ) {
                return;
              }

              animateFineLeave(control);
            });
            const handleFocusIn = contextSafe((event: FocusEvent) => {
              const control = getControl(event.target);
              const focusTarget = event.target;
              const focusIsVisible =
                focusTarget instanceof Element && focusTarget.matches(':focus-visible');

              if (!control || (!control.matches(':focus-visible') && !focusIsVisible)) return;

              animateFineEnter(control);
            });
            const handleFocusOut = contextSafe((event: FocusEvent) => {
              const control = getControl(event.target);
              if (!control) return;

              animateFineLeave(control);
            });

            addListener(page, 'pointermove', handlePointerMove as EventListener);
            addListener(page, 'pointerover', handlePointerOver as EventListener);
            addListener(page, 'pointerout', handlePointerOut as EventListener);
            addListener(page, 'focusin', handleFocusIn as EventListener);
            addListener(page, 'focusout', handleFocusOut as EventListener);
          }

          if (conditions?.coarsePointer) {
            const releasePressed = contextSafe(() => {
              if (!pressedControl) return;

              animatePressEnd(pressedControl);
              pressedControl = null;
            });
            const handlePointerDown = contextSafe((event: PointerEvent) => {
              if (event.button !== 0) return;

              const control = getControl(event.target);
              if (!control) return;

              pressedControl = control;
              animatePressStart(control);
            });

            addListener(page, 'pointerdown', handlePointerDown as EventListener);
            addListener(document, 'pointerup', releasePressed as EventListener);
            addListener(document, 'pointercancel', releasePressed as EventListener);
            addListener(document, 'lostpointercapture', releasePressed as EventListener);
          }

          return () => {
            cleanups.forEach((cleanup) => cleanup());
            gsap.killTweensOf(Array.from(page.querySelectorAll(INTERACTIVE_SELECTOR)));
            gsap.killTweensOf(
              Array.from(
                page.querySelectorAll(
                  `${LABEL_SELECTOR},${ARROW_SELECTOR},${SERVICE_ICON_SELECTOR}`,
                ),
              ),
            );
          };
        },
      );

      return () => mm.revert();
    },
    { scope: pageRef },
  );
}
