import gsap from 'gsap';

type ScrollCallbacks = {
  onComplete?: () => void;
  onInterrupt?: () => void;
};

type ActiveScroll = {
  cleanup: () => void;
  onInterrupt?: () => void;
  tween: gsap.core.Tween;
};

let activeScroll: ActiveScroll | null = null;

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function cancelActiveScroll() {
  const current = activeScroll;
  if (!current) return;

  activeScroll = null;
  current.cleanup();
  current.tween.kill();
  current.onInterrupt?.();
}

function getScrollDuration(top: number) {
  const viewportDistance = Math.abs(top - window.scrollY) / Math.max(window.innerHeight, 1);
  return Math.min(0.65, 0.42 + Math.max(0, viewportDistance - 1) * 0.07);
}

function scrollToPosition(top: number, callbacks: ScrollCallbacks = {}) {
  cancelActiveScroll();

  if (getScrollBehavior() === 'auto' || Math.abs(window.scrollY - top) <= 1) {
    window.scrollTo({ left: 0, top, behavior: 'auto' });
    callbacks.onComplete?.();
    return;
  }

  const position = { y: window.scrollY };
  const cancelOnKey = (event: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' '].includes(event.key)) {
      cancelActiveScroll();
    }
  };
  const cancel = () => cancelActiveScroll();
  const cleanup = () => {
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('keydown', cancelOnKey);
  };
  const tween = gsap.to(position, {
    duration: getScrollDuration(top),
    ease: 'power2.inOut',
    onComplete: () => {
      if (activeScroll?.tween !== tween) return;
      activeScroll = null;
      cleanup();
      window.scrollTo({ left: 0, top, behavior: 'auto' });
      callbacks.onComplete?.();
    },
    onUpdate: () => window.scrollTo({ left: 0, top: position.y, behavior: 'auto' }),
    y: top,
  });

  activeScroll = { cleanup, onInterrupt: callbacks.onInterrupt, tween };
  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });
  window.addEventListener('keydown', cancelOnKey);
}

function getTargetId(hash: string) {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;

  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export function getLandingNavOffset() {
  const nav = document.querySelector<HTMLElement>('[data-landing-nav]');

  if (!nav) return 0;

  const offset = Number.parseFloat(
    getComputedStyle(nav).getPropertyValue('--landing-compact-header-offset'),
  );

  return Number.isFinite(offset) ? Math.max(0, offset) : 0;
}

export function scrollToPageTop() {
  scrollToPosition(0);
}

export function resetScrollForPageNavigation() {
  cancelActiveScroll();
  window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
}

export function scrollToHashTarget(hash: string, callbacks: ScrollCallbacks = {}) {
  const targetId = getTargetId(hash);

  if (!targetId || targetId === 'top') {
    scrollToPosition(0, callbacks);
    return true;
  }

  const target = document.getElementById(targetId);

  if (!target) return false;

  const top = Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY - getLandingNavOffset(),
  );

  scrollToPosition(top, callbacks);
  return true;
}
