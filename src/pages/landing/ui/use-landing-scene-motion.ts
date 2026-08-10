import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PageRef = RefObject<HTMLElement | null>;
type SceneCleanup = () => void;

const noOp = (): void => {};

function createQualityTimeline(_page: HTMLElement): SceneCleanup {
  return noOp;
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
