import gsap from 'gsap';

export type MobileHeaderLayout = 'mobile-compact' | 'mobile-expanded';
export type HeaderMotionPhase = 'idle' | 'opening' | 'closing';

export type MobileHeaderMotionOptions = {
  header: HTMLElement;
  indicator: HTMLElement | null;
  menuItems: HTMLElement[];
  onComplete: () => void;
  onPhaseChange: (phase: HeaderMotionPhase) => void;
  previousTimeline: gsap.core.Timeline | null;
  reducedMotion: boolean;
  target: MobileHeaderLayout;
  viewportWidth: number;
};

export const DESKTOP_HEADER_SCROLL_RANGE = 160;

export function getDesktopHeaderProgress(scrollY: number) {
  return Math.min(1, Math.max(0, scrollY / DESKTOP_HEADER_SCROLL_RANGE));
}

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

export function writeDesktopHeaderFrame(
  header: HTMLElement,
  viewportWidth: number,
  progress: number,
) {
  const baseWidth = Math.min(1680, viewportWidth - 48);
  header.style.setProperty(
    '--header-fluid-width',
    `${lerp(baseWidth, baseWidth * 0.92, progress)}px`,
  );
  header.style.setProperty('--header-fluid-height', `${lerp(76, 68, progress)}px`);
  header.style.setProperty('--header-fluid-radius', `${lerp(28, 24, progress)}px`);
  header.style.setProperty('--header-fluid-shell-start', `${lerp(22, 20, progress)}px`);
  header.style.setProperty('--header-fluid-shell-end', `${lerp(18, 16.2, progress)}px`);
  header.style.setProperty('--header-fluid-menu-gap', `${lerp(12, 10.8, progress)}px`);
  header.style.setProperty('--header-fluid-shadow-y', `${lerp(18, 12, progress)}px`);
  header.style.setProperty('--header-fluid-shadow-blur', `${lerp(48, 34, progress)}px`);
  header.style.setProperty('--header-fluid-shadow-alpha', `${lerp(0.12, 0.16, progress)}`);
}

export function clearDesktopHeaderFrame(header: HTMLElement) {
  gsap.killTweensOf(header);
  for (const name of [
    '--header-fluid-width',
    '--header-fluid-height',
    '--header-fluid-radius',
    '--header-fluid-shell-start',
    '--header-fluid-shell-end',
    '--header-fluid-menu-gap',
    '--header-fluid-shadow-y',
    '--header-fluid-shadow-blur',
    '--header-fluid-shadow-alpha',
  ]) {
    header.style.removeProperty(name);
  }
}

export function getMobileHeaderGeometry(layout: MobileHeaderLayout, viewportWidth: number) {
  return layout === 'mobile-expanded'
    ? { width: Math.min(370, viewportWidth - 20), height: 158 }
    : { width: Math.min(220, viewportWidth - 20), height: 56 };
}

export function startMobileHeaderMotion(
  options: MobileHeaderMotionOptions,
): gsap.core.Timeline | null {
  const {
    header,
    indicator,
    menuItems,
    onComplete,
    onPhaseChange,
    previousTimeline,
    reducedMotion,
    target,
    viewportWidth,
  } = options;
  const current = header.getBoundingClientRect();
  const destination = getMobileHeaderGeometry(target, viewportWidth);
  const opening = target === 'mobile-expanded';
  const interrupted = previousTimeline !== null;
  const clear = () => {
    delete header.dataset.headerMotion;
    header.style.removeProperty('--header-mobile-width');
    header.style.removeProperty('--header-mobile-height');
    gsap.set([...menuItems, indicator].filter(Boolean), {
      clearProps: 'opacity,transform,transformOrigin',
    });
    onPhaseChange('idle');
  };

  previousTimeline?.eventCallback('onInterrupt', null);
  previousTimeline?.kill();
  header.style.setProperty('--header-mobile-width', `${current.width}px`);
  header.style.setProperty('--header-mobile-height', `${current.height}px`);

  if (reducedMotion) {
    clear();
    onComplete();
    return null;
  }

  header.dataset.headerMotion = 'true';
  onPhaseChange(opening ? 'opening' : 'closing');
  const timeline = gsap.timeline({
    onComplete: () => {
      clear();
      onComplete();
    },
    onInterrupt: clear,
  });
  timeline.to(
    header,
    {
      '--header-mobile-height': `${destination.height}px`,
      '--header-mobile-width': `${destination.width}px`,
      duration: opening ? 0.32 : 0.28,
      ease: 'power3.inOut',
    },
    0,
  );

  if (opening) {
    if (!interrupted) gsap.set(menuItems, { opacity: 0, y: 6 });
    timeline.to(
      menuItems,
      { duration: 0.2, ease: 'power2.out', opacity: 1, stagger: 0.028, y: 0 },
      0.07,
    );
    if (indicator) {
      if (!interrupted) gsap.set(indicator, { scaleX: 0.78, transformOrigin: 'left center' });
      timeline.to(indicator, { duration: 0.07, ease: 'power2.out', scaleX: 1 }, 0.21);
    }
  } else {
    timeline.to(menuItems, { duration: 0.12, ease: 'power2.in', opacity: 0, y: -2 }, 0);
  }

  return timeline;
}
