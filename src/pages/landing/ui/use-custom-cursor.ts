import { useEffect, type RefObject } from 'react';

interface UseCustomCursorParams {
  auraRef: RefObject<HTMLDivElement | null>;
  dotRef: RefObject<HTMLDivElement | null>;
  labelRef: RefObject<HTMLSpanElement | null>;
}

export function useCustomCursor({ auraRef, dotRef, labelRef }: UseCustomCursorParams) {
  useEffect(() => {
    const aura = auraRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    if (!aura || !dot || !label || reduceMotion || !finePointer) return undefined;

    document.documentElement.classList.add('custom-cursor-enabled');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let auraX = mouseX;
    let auraY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let frame = 0;

    const render = () => {
      auraX += (mouseX - auraX) * 0.17;
      auraY += (mouseY - auraY) * 0.17;
      dotX += (mouseX - dotX) * 0.46;
      dotY += (mouseY - dotY) * 0.46;

      aura.style.transform = `translate3d(${auraX}px,${auraY}px,0) translate(-50%,-50%)`;
      dot.style.transform = `translate3d(${dotX}px,${dotY}px,0) translate(-50%,-50%)`;
      frame = window.requestAnimationFrame(render);
    };

    const recoverCursor = () => {
      document.body.classList.remove('cursor-muted', 'cursor-hot', 'cursor-soft');
      label.textContent = '';
      document.body.classList.add('cursor-ready');
    };

    const handleMove = (event: PointerEvent | MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      document.body.classList.remove('cursor-muted');
      document.body.classList.add('cursor-ready');
    };

    const handlePointerEnter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      label.textContent = target.dataset.cursorText || '';
      document.body.classList.add('cursor-hot');
    };

    const handlePointerLeave = () => {
      label.textContent = '';
      document.body.classList.remove('cursor-hot');
    };

    const handleSoftEnter = () => document.body.classList.add('cursor-soft');
    const handleSoftLeave = () => document.body.classList.remove('cursor-soft');

    const resetCursorState = ({ mute = false, duration = 0 } = {}) => {
      document.body.classList.remove('cursor-hot', 'cursor-soft');
      label.textContent = '';

      if (!mute) return;

      document.body.classList.add('cursor-muted');
      window.setTimeout(() => document.body.classList.remove('cursor-muted'), duration || 260);
    };
    const handleBlur = () => resetCursorState({ mute: true, duration: 520 });
    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetCursorState({ mute: true, duration: 520 });
        return;
      }

      recoverCursor();
    };
    const handlePointerUp = () => window.setTimeout(recoverCursor, 80);
    const handleProtocolLink = () => resetCursorState({ mute: true, duration: 380 });
    const handleClickablePointerDown = () => resetCursorState();

    const hotTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-cursor-text]'));
    const softTargets = Array.from(
      document.querySelectorAll<HTMLElement>('input,textarea,.custom-select'),
    );
    const protocolLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"], a[href^="tel:"]'),
    );
    const clickableTargets = Array.from(
      document.querySelectorAll<HTMLElement>('a,button,.select-option,label'),
    );

    hotTargets.forEach((target) => {
      target.addEventListener('pointerenter', handlePointerEnter);
      target.addEventListener('pointerleave', handlePointerLeave);
    });

    softTargets.forEach((target) => {
      target.addEventListener('pointerenter', handleSoftEnter);
      target.addEventListener('pointerleave', handleSoftLeave);
    });

    protocolLinks.forEach((link) => {
      link.addEventListener('pointerdown', handleProtocolLink);
      link.addEventListener('click', handleProtocolLink);
    });

    clickableTargets.forEach((target) => {
      target.addEventListener('pointerdown', handleClickablePointerDown, { passive: true });
    });

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('focus', recoverCursor);
    window.addEventListener('pageshow', recoverCursor);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('pointermove', recoverCursor, { passive: true });
    document.addEventListener('mousemove', recoverCursor, { passive: true });
    document.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove('custom-cursor-enabled');
      document.body.classList.remove('cursor-ready', 'cursor-hot', 'cursor-soft', 'cursor-muted');

      hotTargets.forEach((target) => {
        target.removeEventListener('pointerenter', handlePointerEnter);
        target.removeEventListener('pointerleave', handlePointerLeave);
      });
      softTargets.forEach((target) => {
        target.removeEventListener('pointerenter', handleSoftEnter);
        target.removeEventListener('pointerleave', handleSoftLeave);
      });
      protocolLinks.forEach((link) => {
        link.removeEventListener('pointerdown', handleProtocolLink);
        link.removeEventListener('click', handleProtocolLink);
      });
      clickableTargets.forEach((target) => {
        target.removeEventListener('pointerdown', handleClickablePointerDown);
      });
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('focus', recoverCursor);
      window.removeEventListener('pageshow', recoverCursor);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('pointermove', recoverCursor);
      document.removeEventListener('mousemove', recoverCursor);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auraRef, dotRef, labelRef]);
}
