function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function getTargetId(hash: string) {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;

  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

function getLandingNavOffset() {
  const nav = document.querySelector<HTMLElement>('[data-landing-nav]');

  if (!nav) return 0;

  const offset = Number.parseFloat(
    getComputedStyle(nav).getPropertyValue('--landing-compact-header-offset'),
  );

  return Number.isFinite(offset) ? Math.max(0, offset) : 0;
}

export function scrollToPageTop() {
  window.scrollTo({ top: 0, behavior: getScrollBehavior() });
}

export function scrollToHashTarget(hash: string) {
  const targetId = getTargetId(hash);

  if (!targetId || targetId === 'top') {
    scrollToPageTop();
    return true;
  }

  const target = document.getElementById(targetId);

  if (!target) return false;

  const top = Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY - getLandingNavOffset(),
  );

  window.scrollTo({ top, behavior: getScrollBehavior() });
  return true;
}
