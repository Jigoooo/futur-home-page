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

function createServiceTimeline(_page: HTMLElement): SceneCleanup {
  return noOp;
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
