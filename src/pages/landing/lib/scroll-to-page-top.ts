const HEADER_SCROLL_GAP = 16;

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

  const rect = nav.getBoundingClientRect();
  return Math.max(0, rect.height + rect.top + HEADER_SCROLL_GAP);
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
