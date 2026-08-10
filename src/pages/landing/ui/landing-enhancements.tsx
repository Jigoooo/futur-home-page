import type { RefObject } from 'react';

import { CustomCursor } from './custom-cursor';
import { useLandingGsapInteractions } from './use-landing-gsap-interactions';
import { useLandingSceneMotion } from './use-landing-scene-motion';

export function LandingEnhancements({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  useLandingGsapInteractions(pageRef);
  useLandingSceneMotion(pageRef);

  return <CustomCursor />;
}
