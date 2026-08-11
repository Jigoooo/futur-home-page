import gsap from 'gsap';

type DesktopActiveIndicatorMotionOptions = {
  container: HTMLElement;
  indicator: HTMLElement;
  previousTimeline: gsap.core.Timeline | null;
  reducedMotion: boolean;
  resize?: boolean;
  target: HTMLElement | null;
};

const visibleOpacity = 0.82;

export function clearDesktopActiveIndicator(indicator: HTMLElement) {
  gsap.killTweensOf(indicator);
  for (const property of ['--header-active-specular-opacity', 'opacity', 'transform', 'width']) {
    indicator.style.removeProperty(property);
  }
}

export function startDesktopActiveIndicatorMotion({
  container,
  indicator,
  previousTimeline,
  reducedMotion,
  resize = false,
  target,
}: DesktopActiveIndicatorMotionOptions): gsap.core.Timeline | null {
  previousTimeline?.kill();

  if (!target) {
    if (reducedMotion) {
      indicator.style.opacity = '0';
      return null;
    }

    return gsap.timeline().to(indicator, {
      duration: 0.1,
      ease: 'power2.out',
      opacity: 0,
    });
  }

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const x = targetRect.left - containerRect.left;
  const width = targetRect.width;

  if (reducedMotion) {
    gsap.set(indicator, {
      '--header-active-specular-opacity': 0.18,
      opacity: visibleOpacity,
      width,
      x,
    });
    return null;
  }

  indicator.style.setProperty('--header-active-specular-opacity', '0.35');
  const timeline = gsap.timeline();
  timeline.to(
    indicator,
    {
      duration: resize ? 0.16 : 0.2,
      ease: resize ? 'power2.out' : 'power3.out',
      width,
      x,
    },
    0,
  );
  timeline.to(
    indicator,
    {
      duration: 0.12,
      ease: 'power2.out',
      opacity: visibleOpacity,
    },
    0,
  );
  timeline.to(
    indicator,
    {
      '--header-active-specular-opacity': 0.18,
      duration: 0.06,
      ease: 'power2.out',
    },
    resize ? 0.1 : 0.14,
  );
  return timeline;
}
