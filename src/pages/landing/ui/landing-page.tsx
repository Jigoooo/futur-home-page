import { useRef } from 'react';

import { CaseStoriesSection } from './case-stories-section';
import { ContactSection } from './contact-section';
import { CustomCursor } from './custom-cursor';
import { FaqSection } from './faq-section';
import { FooterSection } from './footer-section';
import { HeaderSection } from './header-section';
import { HeroSection } from './hero-section';
import { LandingScrollbar } from './landing-scrollbar';
import { OperationsPolicySection } from './operations-policy-section';
import { ProcessSection } from './process-section';
import { ReviewsSection } from './reviews-section';
import { ServicesSection } from './services-section';
import { StackSection } from './stack-section';
import scrollTopStyles from './styles/scroll-top.module.css';
import sharedStyles from './styles/shared.module.css';
import { TeamSection } from './team-section';
import { TrustSection } from './trust-section';
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
      <main ref={pageRef} className={sharedStyles.page} data-landing-page>
        <HeaderSection />
        <HeroSection />
        <TrustSection />
        <ServicesSection />
        <StackSection />
        <CaseStoriesSection />
        <TeamSection />
        <ProcessSection />
        <OperationsPolicySection />
        <ReviewsSection />
        <FaqSection />
        <ContactSection />
        <FooterSection />
        <LandingScrollbar />
        <button
          type='button'
          className={scrollTopStyles.scrollTop}
          data-landing-interactive='round'
          aria-label='상단으로 이동'
          onClick={scrollToPageTop}
        >
          ↑
        </button>
      </main>
    </>
  );
}
