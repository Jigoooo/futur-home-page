import type { RefObject } from 'react';

import { CustomCursor } from './custom-cursor';
import { useLandingGsapInteractions } from './use-landing-gsap-interactions';
import { useServicesChapterMotion } from './use-services-chapter-motion';

export function LandingEnhancements({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  useLandingGsapInteractions(pageRef);
  useServicesChapterMotion(pageRef);

  return <CustomCursor />;
}
