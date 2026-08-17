import gsap from 'gsap';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

type MobileRollMode = 'off' | 'animated' | 'reduced';

type MobileHeaderSectionRollOptions = {
  activeHref: string | null;
  headerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
};

const SECTION_SELECTOR = '[data-header-section-link]';
const NARROW_QUERY = '(max-width: 560px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function getMode(narrow: MediaQueryList, reduced: MediaQueryList): MobileRollMode {
  if (!narrow.matches) return 'off';
  return reduced.matches ? 'reduced' : 'animated';
}

function clearAnchorMotion(link: HTMLAnchorElement) {
  delete link.dataset.headerRollRole;
  gsap.set(link, { clearProps: 'opacity,visibility' });
  const text = link.querySelector<HTMLElement>('span');
  if (text) gsap.set(text, { clearProps: 'opacity,transform,visibility' });
}

function setAnchorAvailability(links: HTMLAnchorElement[], current: HTMLAnchorElement | null) {
  for (const link of links) {
    const available = link === current;
    link.inert = !available;
    if (available) link.removeAttribute('aria-hidden');
    else link.setAttribute('aria-hidden', 'true');
  }
}

function settleAnchors(
  header: HTMLElement,
  links: HTMLAnchorElement[],
  current: HTMLAnchorElement | null,
  state: 'idle' | 'reduced',
) {
  setAnchorAvailability(links, current);
  for (const link of links) clearAnchorMotion(link);
  header.dataset.headerMobileRollState = state;
}

function restoreAllAnchors(header: HTMLElement, links: HTMLAnchorElement[]) {
  for (const link of links) {
    link.inert = false;
    link.removeAttribute('aria-hidden');
    clearAnchorMotion(link);
  }
  delete header.dataset.headerMobileRoll;
  delete header.dataset.headerMobileRollState;
}

export function useMobileHeaderSectionRoll({
  activeHref,
  headerRef,
  menuRef,
}: MobileHeaderSectionRollOptions): void {
  const [mode, setMode] = useState<MobileRollMode>('off');
  const previousHrefRef = useRef<string | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const narrow = window.matchMedia(NARROW_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const sync = () => setMode(getMode(narrow, reduced));
    narrow.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    sync();

    return () => {
      narrow.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const menu = menuRef.current;
    if (!header || !menu) return;

    const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>(SECTION_SELECTOR));
    const previous = previousHrefRef.current
      ? (links.find((link) => link.getAttribute('href') === previousHrefRef.current) ?? null)
      : null;
    const incoming = activeHref
      ? (links.find((link) => link.getAttribute('href') === activeHref) ?? null)
      : null;
    timelineRef.current?.kill();
    for (const link of links) {
      if (link !== previous && link !== incoming) clearAnchorMotion(link);
    }

    if (mode === 'off') {
      restoreAllAnchors(header, links);
      previousHrefRef.current = activeHref;
      return;
    }

    header.dataset.headerMobileRoll = 'enhanced';
    setAnchorAvailability(links, incoming);

    if (mode === 'reduced' || previous === incoming) {
      settleAnchors(header, links, incoming, mode === 'reduced' ? 'reduced' : 'idle');
      previousHrefRef.current = activeHref;
      return;
    }

    header.dataset.headerMobileRollState = 'running';
    if (previous) previous.dataset.headerRollRole = 'outgoing';
    if (incoming) incoming.dataset.headerRollRole = 'incoming';

    const previousText = previous?.querySelector<HTMLElement>('span') ?? null;
    const incomingText = incoming?.querySelector<HTMLElement>('span') ?? null;
    if (previous) gsap.set(previous, { autoAlpha: 1 });
    if (incoming) gsap.set(incoming, { autoAlpha: 1 });

    if (incomingText) {
      const currentY = Number(gsap.getProperty(incomingText, 'y'));
      const currentOpacity = Number(gsap.getProperty(incomingText, 'opacity'));
      if (!incomingText.style.transform && !incomingText.style.opacity) {
        gsap.set(incomingText, { opacity: 0, y: 10 });
      } else {
        gsap.set(incomingText, { opacity: currentOpacity, y: currentY });
      }
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => settleAnchors(header, links, incoming, 'idle'),
    });
    if (previousText) {
      timelineRef.current.to(
        previousText,
        { duration: 0.18, ease: 'power2.in', opacity: 0, y: -9 },
        0,
      );
    }
    if (incomingText) {
      timelineRef.current.to(
        incomingText,
        { duration: 0.24, ease: 'back.out(1.25)', opacity: 1, y: 0 },
        0.07,
      );
    }

    previousHrefRef.current = activeHref;
    return () => {
      timelineRef.current?.kill();
    };
  }, [activeHref, headerRef, menuRef, mode]);

  useLayoutEffect(
    () => () => {
      timelineRef.current?.kill();
      const header = headerRef.current;
      const menu = menuRef.current;
      if (!header || !menu) return;
      restoreAllAnchors(
        header,
        Array.from(menu.querySelectorAll<HTMLAnchorElement>(SECTION_SELECTOR)),
      );
    },
    [headerRef, menuRef],
  );
}
