import { useEffect, useRef } from 'react';

import { createHeroParticleEngine } from './hero-particle-engine';
import styles from './styles/hero.module.css';

type NetworkInformation = {
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
};

const HERO_PARTICLE_STOP_RATIO = 0.16;
const HERO_PARTICLE_RESUME_RATIO = 0.24;
const HERO_PARTICLE_EXIT_START_RATIO = 0.62;
const HERO_PARTICLE_EXIT_END_RATIO = 0.16;

function getParticleExitOpacity(canvas: HTMLCanvasElement) {
  const bounds = canvas.getBoundingClientRect();
  const visibleHeight = Math.max(
    0,
    Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0),
  );
  const visibleRatio = bounds.height > 0 ? visibleHeight / bounds.height : 0;
  const progress =
    (visibleRatio - HERO_PARTICLE_EXIT_END_RATIO) /
    (HERO_PARTICLE_EXIT_START_RATIO - HERO_PARTICLE_EXIT_END_RATIO);

  return Math.min(1, Math.max(0, progress));
}

function shouldUseStaticBackground() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
  return reduceMotion || saveData;
}

export function HeroParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    if (shouldUseStaticBackground()) {
      canvas.dataset.particleState = 'static';
      return undefined;
    }

    const engine = createHeroParticleEngine(canvas);
    if (!engine) {
      canvas.dataset.particleState = 'fallback';
      return undefined;
    }

    canvas.dataset.particleState = 'ready';
    let isHeroVisible = true;
    let isDocumentVisible = document.visibilityState === 'visible';
    let pointerActive = false;
    let exitOpacityFrame = 0;

    const writeExitOpacity = () => {
      exitOpacityFrame = 0;
      canvas.style.setProperty(
        '--hero-particle-exit-opacity',
        getParticleExitOpacity(canvas).toFixed(4),
      );
    };
    const scheduleExitOpacity = () => {
      if (exitOpacityFrame) return;
      exitOpacityFrame = window.requestAnimationFrame(writeExitOpacity);
    };

    const syncPlayback = () => {
      if (isHeroVisible && isDocumentVisible) engine.start();
      else engine.stop();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const isInside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!isInside) {
        engine.clearPointer();
        if (pointerActive) {
          pointerActive = false;
          canvas.dataset.pointerActive = 'false';
        }
        return;
      }

      pointerActive = true;
      canvas.dataset.pointerActive = 'true';
      engine.setPointer({
        x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        y: 1 - ((event.clientY - bounds.top) / bounds.height) * 2,
        at: event.timeStamp,
      });
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === 'visible';
      syncPlayback();
    };

    const resizeObserver = new ResizeObserver(() => engine.resize());
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const visibleRatio = entry?.intersectionRatio ?? 1;
        if (isHeroVisible && visibleRatio <= HERO_PARTICLE_STOP_RATIO) {
          isHeroVisible = false;
        } else if (!isHeroVisible && visibleRatio >= HERO_PARTICLE_RESUME_RATIO) {
          isHeroVisible = true;
        }
        syncPlayback();
      },
      { threshold: [HERO_PARTICLE_STOP_RATIO, HERO_PARTICLE_RESUME_RATIO] },
    );
    intersectionObserver.observe(canvas);

    const handleContextLost = () => {
      canvas.dataset.particleState = 'fallback';
      engine.stop();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', scheduleExitOpacity, { passive: true });
    window.addEventListener('resize', scheduleExitOpacity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    scheduleExitOpacity();
    syncPlayback();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', scheduleExitOpacity);
      window.removeEventListener('resize', scheduleExitOpacity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      window.cancelAnimationFrame(exitOpacityFrame);
      canvas.style.removeProperty('--hero-particle-exit-opacity');
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      engine.destroy();
    };
  }, []);

  return (
    <div className={styles.particleLayer} data-hero-particle-layer aria-hidden='true'>
      <canvas
        ref={canvasRef}
        className={styles.particleCanvas}
        data-hero-particles
        data-particle-state='pending'
        data-pointer-active='false'
      />
    </div>
  );
}
