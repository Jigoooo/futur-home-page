import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './styles/landing-scrollbar.module.css';

const MIN_THUMB_SIZE = 48;
const TRACK_PADDING = 14;
const IDLE_HIDE_DELAY = 900;

type ScrollState = {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
};

function getScrollElement() {
  return document.scrollingElement ?? document.documentElement;
}

function setInstantScrollTop(top: number) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  getScrollElement().scrollTop = top;
  root.style.scrollBehavior = previousScrollBehavior;
}

function getScrollState(): ScrollState {
  const scrollElement = getScrollElement();

  return {
    clientHeight: window.innerHeight,
    scrollHeight: scrollElement.scrollHeight,
    scrollTop: scrollElement.scrollTop,
  };
}

export function LandingScrollbar() {
  const [scrollState, setScrollState] = useState<ScrollState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current === null) return;

    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const revealTemporarily = useCallback(() => {
    clearIdleTimer();
    setIsActive(true);
    idleTimerRef.current = window.setTimeout(() => {
      setIsActive(false);
      idleTimerRef.current = null;
    }, IDLE_HIDE_DELAY);
  }, [clearIdleTimer]);

  useEffect(() => {
    const shouldUseOverlay = window.matchMedia('(pointer: fine) and (min-width: 901px)').matches;

    if (!shouldUseOverlay) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      setScrollState(getScrollState());
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    const handleScroll = () => {
      revealTemporarily();
      scheduleUpdate();
    };

    scheduleUpdate();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate);
    resizeObserver?.observe(document.documentElement);
    resizeObserver?.observe(document.body);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      clearIdleTimer();
    };
  }, [clearIdleTimer, revealTemporarily]);

  const geometry = useMemo(() => {
    if (!scrollState || scrollState.scrollHeight <= scrollState.clientHeight) return null;

    const trackHeight = Math.max(0, scrollState.clientHeight - TRACK_PADDING * 2);
    const thumbHeight = Math.min(
      trackHeight,
      Math.max(MIN_THUMB_SIZE, (scrollState.clientHeight / scrollState.scrollHeight) * trackHeight),
    );
    const maxScrollTop = scrollState.scrollHeight - scrollState.clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollState.scrollTop / maxScrollTop) * maxThumbTop : 0;

    return { maxScrollTop, maxThumbTop, thumbHeight, thumbTop, trackHeight };
  }, [scrollState]);

  if (!geometry) return null;

  const scrollToThumbPosition = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const rawTop = clientY - rect.top - geometry.thumbHeight / 2;
    const thumbTop = Math.max(0, Math.min(rawTop, geometry.maxThumbTop));
    const scrollRatio = geometry.maxThumbTop > 0 ? thumbTop / geometry.maxThumbTop : 0;

    revealTemporarily();
    setInstantScrollTop(scrollRatio * geometry.maxScrollTop);
  };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    event.preventDefault();
    scrollToThumbPosition(event.clientY);
  };

  const handleThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startY = event.clientY;
    const startScrollTop = getScrollElement().scrollTop;
    const pointerId = event.pointerId;
    const thumb = event.currentTarget;

    setIsDragging(true);
    setIsActive(true);
    clearIdleTimer();
    thumb.setPointerCapture(pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const scrollRatio =
        geometry.maxThumbTop > 0 ? geometry.maxScrollTop / geometry.maxThumbTop : 0;
      const nextTop = Math.max(
        0,
        Math.min(startScrollTop + deltaY * scrollRatio, geometry.maxScrollTop),
      );

      setInstantScrollTop(nextTop);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      revealTemporarily();
      if (thumb.hasPointerCapture(pointerId)) {
        thumb.releasePointerCapture(pointerId);
      }
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const scrollElement = getScrollElement();
    const lineStep = 48;
    const pageStep = Math.max(1, scrollState?.clientHeight ?? window.innerHeight) * 0.9;
    let nextTop: number | null = null;

    if (event.key === 'ArrowDown') nextTop = scrollElement.scrollTop + lineStep;
    if (event.key === 'ArrowUp') nextTop = scrollElement.scrollTop - lineStep;
    if (event.key === 'PageDown') nextTop = scrollElement.scrollTop + pageStep;
    if (event.key === 'PageUp') nextTop = scrollElement.scrollTop - pageStep;
    if (event.key === 'Home') nextTop = 0;
    if (event.key === 'End') nextTop = geometry.maxScrollTop;
    if (nextTop === null) return;

    event.preventDefault();
    setInstantScrollTop(Math.max(0, Math.min(nextTop, geometry.maxScrollTop)));
    revealTemporarily();
  };

  return (
    <div
      ref={trackRef}
      className={styles.track}
      data-landing-scrollbar-track
      data-visible={isActive || isHovered || isDragging ? 'true' : undefined}
      data-hovered={isHovered || isDragging ? 'true' : undefined}
      data-dragging={isDragging ? 'true' : undefined}
      style={{ height: geometry.trackHeight }}
      role='scrollbar'
      tabIndex={0}
      aria-label='페이지 스크롤'
      aria-controls='landing-page-content'
      aria-orientation='vertical'
      aria-valuemin={0}
      aria-valuemax={Math.round(geometry.maxScrollTop)}
      aria-valuenow={Math.round(scrollState?.scrollTop ?? 0)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={handleTrackPointerDown}
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.thumb}
        data-landing-scrollbar-thumb
        style={{
          height: geometry.thumbHeight,
          transform: `translate3d(0, ${geometry.thumbTop}px, 0)`,
        }}
        onPointerDown={handleThumbPointerDown}
      />
    </div>
  );
}
