import { useRef } from 'react';

import { CaseStoriesSection } from './case-stories-section';
import { ContactSection } from './contact-section';
import { CustomCursor } from './custom-cursor';
import { FooterSection } from './footer-section';
import { HeaderSection } from './header-section';
import { HeroSection } from './hero-section';
import { ProcessSection } from './process-section';
import { ReviewsSection } from './reviews-section';
import { ServicesSection } from './services-section';
import { landingStyleAnchors } from './styles';
import { TeamSection } from './team-section';
import { useInViewReveal } from './use-in-view-reveal';
import { useLandingGsapInteractions } from './use-landing-gsap-interactions';
import { scrollToPageTop } from '../lib/scroll-to-page-top';

export function LandingPage() {
  const pageRef = useRef<HTMLElement | null>(null);

  useInViewReveal();
  useLandingGsapInteractions(pageRef);

  return (
    <>
      <CustomCursor />
      <main ref={pageRef} className={`page ${landingStyleAnchors}`}>
        <HeaderSection />
        <HeroSection />
        <ServicesSection />
        <CaseStoriesSection />
        <TeamSection />
        <ProcessSection />
        <ReviewsSection />
        <ContactSection />
        <FooterSection />
        <button
          type='button'
          className='scroll-top'
          aria-label='상단으로 이동'
          onClick={scrollToPageTop}
        >
          ↑
        </button>
      </main>
    </>
  );
}
