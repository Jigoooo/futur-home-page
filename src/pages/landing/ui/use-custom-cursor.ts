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

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let auraX = mouseX;
    let auraY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;
    let frame = 0;
    let lastMovementAt = 0;

    const clearCursorState = () => {
      delete document.documentElement.dataset.landingCursorEnabled;
      delete document.body.dataset.landingCursorReady;
      delete document.body.dataset.landingCursorHot;
      delete document.body.dataset.landingCursorSoft;
      delete document.body.dataset.landingCursorMuted;
      delete document.body.dataset.landingCursorRunning;
      label.textContent = '';
    };

    const stopRendering = () => {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
      delete document.body.dataset.landingCursorRunning;
    };

    const render = () => {
      if (document.hidden || performance.now() - lastMovementAt >= 1200) {
        stopRendering();
        return;
      }

      auraX += (mouseX - auraX) * 0.17;
      auraY += (mouseY - auraY) * 0.17;
      dotX += (mouseX - dotX) * 0.46;
      dotY += (mouseY - dotY) * 0.46;

      aura.style.transform = `translate3d(${auraX}px,${auraY}px,0) translate(-50%,-50%)`;
      dot.style.transform = `translate3d(${dotX}px,${dotY}px,0) translate(-50%,-50%)`;
      try {
        frame = window.requestAnimationFrame(render);
      } catch {
        frame = 0;
        clearCursorState();
      }
    };

    const startRendering = () => {
      if (frame || document.hidden) return;
      try {
        frame = window.requestAnimationFrame(render);
        document.body.dataset.landingCursorRunning = 'true';
      } catch {
        frame = 0;
        clearCursorState();
      }
    };

    const recoverCursor = () => {
      delete document.body.dataset.landingCursorMuted;
      delete document.body.dataset.landingCursorHot;
      delete document.body.dataset.landingCursorSoft;
      label.textContent = '';
      document.body.dataset.landingCursorReady = 'true';
    };

    const handleMove = (event: PointerEvent | MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      lastMovementAt = performance.now();
      document.documentElement.dataset.landingCursorEnabled = 'true';
      delete document.body.dataset.landingCursorMuted;
      document.body.dataset.landingCursorReady = 'true';
      startRendering();
    };

    const handlePointerEnter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      label.textContent = target.dataset.cursorText || '';
      document.body.dataset.landingCursorHot = 'true';
    };

    const handlePointerLeave = () => {
      label.textContent = '';
      delete document.body.dataset.landingCursorHot;
    };

    const handleSoftEnter = () => {
      document.body.dataset.landingCursorSoft = 'true';
    };
    const handleSoftLeave = () => {
      delete document.body.dataset.landingCursorSoft;
    };

    const resetCursorState = ({ mute = false, duration = 0 } = {}) => {
      delete document.body.dataset.landingCursorHot;
      delete document.body.dataset.landingCursorSoft;
      label.textContent = '';

      if (!mute) return;

      document.body.dataset.landingCursorMuted = 'true';
      window.setTimeout(() => {
        delete document.body.dataset.landingCursorMuted;
      }, duration || 260);
    };
    const handleBlur = () => resetCursorState({ mute: true, duration: 520 });
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRendering();
        resetCursorState({ mute: true, duration: 520 });
        return;
      }

      recoverCursor();
    };
    const handlePointerUp = () => window.setTimeout(recoverCursor, 80);
    const handleProtocolLink = () => resetCursorState({ mute: true, duration: 380 });
    const handleClickablePointerDown = () => resetCursorState({ mute: true, duration: 160 });

    const hotTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-cursor-text]'));
    const softTargets = Array.from(
      document.querySelectorAll<HTMLElement>('input,textarea,[data-landing-cursor-soft]'),
    );
    const protocolLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"], a[href^="tel:"]'),
    );
    const clickableTargets = Array.from(
      document.querySelectorAll<HTMLElement>('a,button,label,[data-landing-interactive]'),
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
    window.addEventListener('focus', recoverCursor);
    window.addEventListener('pageshow', recoverCursor);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopRendering();
      clearCursorState();

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
      window.removeEventListener('focus', recoverCursor);
      window.removeEventListener('pageshow', recoverCursor);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auraRef, dotRef, labelRef]);
}
