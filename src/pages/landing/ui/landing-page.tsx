import { ChevronUp } from 'lucide-react';

import { CaseStoriesSection } from './case-stories-section';
import { ContactSection } from './contact-section';
import { CustomCursor } from './custom-cursor';
import { DeliverySection } from './delivery-section';
import { FaqSection } from './faq-section';
import { FooterSection } from './footer-section';
import { HeaderSection } from './header-section';
import { HeroSection } from './hero-section';
import { LandingScrollbar } from './landing-scrollbar';
import { ServicesSection } from './services-section';
import scrollTopStyles from './styles/scroll-top.module.css';
import sharedStyles from './styles/shared.module.css';
import { TeamSection } from './team-section';
import { TrustSection } from './trust-section';
import { useInViewReveal } from './use-in-view-reveal';
import { scrollToPageTop } from '../lib/scroll-to-page-top';

export function LandingPage() {
  useInViewReveal();

  return (
    <>
      <CustomCursor />
      <main id='landing-page-content' className={sharedStyles.page} data-landing-page>
        <HeaderSection />
        <HeroSection />
        <TrustSection />
        <CaseStoriesSection />
        <ServicesSection />
        <DeliverySection />
        <TeamSection />
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
          <ChevronUp size={22} strokeWidth={2.2} />
        </button>
      </main>
    </>
  );
}
