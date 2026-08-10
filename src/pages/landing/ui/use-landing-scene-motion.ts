import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PageRef = RefObject<HTMLElement | null>;
type SceneCleanup = () => void;

const noOp = (): void => {};

function createQualityTimeline(page: HTMLElement): SceneCleanup {
  const stage = page.querySelector<HTMLElement>('[data-quality-stage]');
  const orbs = page.querySelectorAll<HTMLElement>('[data-quality-orb]');

  if (!stage) return noOp;

  const reveal = gsap.fromTo(
    stage,
    { clipPath: 'circle(18% at 72% 52%)' },
    {
      clipPath: 'circle(78% at 58% 50%)',
      ease: 'power3.out',
      scrollTrigger: { trigger: stage, start: 'top 82%', end: 'top 38%', scrub: 0.55 },
    },
  );
  const parallax = gsap.to(orbs, {
    y: (index) => (index === 0 ? -24 : 32),
    ease: 'none',
    scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
  });

  return () => {
    reveal.scrollTrigger?.kill();
    parallax.scrollTrigger?.kill();
    reveal.kill();
    parallax.kill();
  };
}

function createServiceTimeline(page: HTMLElement): SceneCleanup {
  const scene = page.querySelector<HTMLElement>('[data-service-merge]');
  const layers = page.querySelectorAll<HTMLElement>('[data-service-layer]');
  const core = page.querySelector<HTMLElement>('[data-service-core]');
  const rows = page.querySelectorAll<HTMLElement>('#services [data-service-row]');

  if (!scene || !core || layers.length !== 4) return noOp;

  const layerOffsets = [
    { x: -92, y: -68, rotate: -12 },
    { x: 86, y: -52, rotate: 10 },
    { x: -74, y: 78, rotate: 8 },
    { x: 82, y: 70, rotate: -9 },
  ] as const;
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 78%', once: true },
  });
  timeline
    .from(layers, {
      x: (index) => layerOffsets[index]?.x ?? 0,
      y: (index) => layerOffsets[index]?.y ?? 0,
      rotate: (index) => layerOffsets[index]?.rotate ?? 0,
      opacity: 0.55,
      duration: 0.86,
      stagger: 0.08,
      ease: 'power3.out',
    })
    .from(core, { scale: 0.72, opacity: 0, duration: 0.52, ease: 'power3.out' }, '-=0.35')
    .from(
      rows,
      {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.52,
        stagger: 0.07,
        ease: 'power3.out',
      },
      '-=0.32',
    );

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  };
}

function createReviewTimeline(page: HTMLElement): SceneCleanup {
  const stage = page.querySelector<HTMLElement>('[data-review-stage]');
  const mask = page.querySelector<HTMLElement>('[data-review-mask]');
  const groups = page.querySelectorAll<HTMLElement>('[data-review-group]');

  if (!stage || !mask || groups.length !== 4) return noOp;

  const timeline = gsap.timeline({
    scrollTrigger: { trigger: stage, start: 'top 78%', once: true },
  });
  timeline
    .fromTo(
      mask,
      { clipPath: 'circle(0% at 76% 20%)' },
      { clipPath: 'circle(92% at 76% 20%)', duration: 0.82, ease: 'power3.out' },
    )
    .from(
      groups,
      {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.44,
        stagger: 0.07,
        ease: 'power3.out',
      },
      '-=0.4',
    );

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  };
}

function createProcessTimeline(page: HTMLElement): SceneCleanup {
  const section = page.querySelector<HTMLElement>('#process');
  const path = page.querySelector<SVGPathElement>('[data-process-path]');
  const marker = page.querySelector<SVGCircleElement>('[data-process-marker]');

  if (!section || !path || !marker) return noOp;

  const pathLength = path.getTotalLength();
  const progress = { value: 0 };
  const scrollTrigger = { trigger: section, start: 'top 72%', end: 'bottom 62%', scrub: 0.6 };
  const stroke = gsap.fromTo(
    path,
    { strokeDasharray: 1, strokeDashoffset: 1 },
    { strokeDashoffset: 0, ease: 'none', scrollTrigger },
  );
  const markerMotion = gsap.to(progress, {
    value: 1,
    ease: 'none',
    scrollTrigger,
    onUpdate: () => {
      const point = path.getPointAtLength(pathLength * progress.value);
      marker.setAttribute('cx', String(point.x));
      marker.setAttribute('cy', String(point.y));
    },
  });

  return () => {
    stroke.scrollTrigger?.kill();
    markerMotion.scrollTrigger?.kill();
    stroke.kill();
    markerMotion.kill();
  };
}

function createContactTimeline(page: HTMLElement): SceneCleanup {
  const surface = page.querySelector<HTMLElement>('[data-contact-surface]');
  const groups = surface?.querySelectorAll<HTMLElement>('[data-contact-motion-group]');

  if (!surface || !groups || groups.length === 0) return noOp;

  const timeline = gsap.timeline({
    scrollTrigger: { trigger: surface, start: 'top 78%', once: true },
  });

  timeline
    .fromTo(
      surface,
      { clipPath: 'ellipse(28% 18% at 78% 14%)' },
      { clipPath: 'ellipse(150% 132% at 54% 48%)', duration: 0.82, ease: 'power3.out' },
    )
    .from(
      groups,
      {
        clipPath: 'inset(0 0 100% 0 round 16px)',
        duration: 0.46,
        stagger: 0.05,
        ease: 'power3.out',
      },
      '-=0.38',
    );

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  };
}

export function useLandingSceneMotion(pageRef: PageRef) {
  useGSAP(
    () => {
      const page = pageRef.current;

      if (!page) return undefined;

      page.dataset.landingSceneMotion = 'ready';
      const cleanups = [
        createQualityTimeline(page),
        createServiceTimeline(page),
        createReviewTimeline(page),
        createProcessTimeline(page),
        createContactTimeline(page),
      ];

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        delete page.dataset.landingSceneMotion;
      };
    },
    { scope: pageRef },
  );
}
