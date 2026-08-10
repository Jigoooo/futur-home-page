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
    .from(rows, { y: 24, opacity: 0, duration: 0.46, stagger: 0.07, ease: 'power3.out' }, '-=0.32');

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  };
}

function createReviewTimeline(_page: HTMLElement): SceneCleanup {
  return noOp;
}

function createProcessTimeline(_page: HTMLElement): SceneCleanup {
  return noOp;
}

function createContactTimeline(_page: HTMLElement): SceneCleanup {
  return noOp;
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
