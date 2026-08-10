import type { RefObject } from 'react';

import { CustomCursor } from './custom-cursor';
import { useLandingGsapInteractions } from './use-landing-gsap-interactions';

export function LandingEnhancements({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  useLandingGsapInteractions(pageRef);

  return <CustomCursor />;
}
