import { ChevronUp } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react';

import { CaseStoriesSection } from './case-stories-section';
import { ContactSection } from './contact-section';
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
import { scrollToPageTop } from '../lib/scroll-to-page-top';

const LandingEnhancements = lazy(() =>
  import('./landing-enhancements').then((module) => ({ default: module.LandingEnhancements })),
);

function DeferredLandingEnhancements({ pageRef }: { pageRef: RefObject<HTMLElement | null> }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let idleCallbackId: number | undefined;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    const enable = () => setEnabled(true);
    const eventOptions = { once: true, passive: true } as const;
    const eventNames = ['pointermove', 'touchstart', 'wheel'] as const;

    eventNames.forEach((eventName) => window.addEventListener(eventName, enable, eventOptions));
    window.addEventListener('keydown', enable, { once: true });

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleCallbackId = idleWindow.requestIdleCallback(enable, { timeout: 700 });
    } else {
      timeoutId = globalThis.setTimeout(enable, 500);
    }

    return () => {
      eventNames.forEach((eventName) => window.removeEventListener(eventName, enable));
      window.removeEventListener('keydown', enable);

      if (idleCallbackId !== undefined && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
    };
  }, []);

  if (!enabled) return null;
  return <LandingEnhancements pageRef={pageRef} />;
}

export function LandingPage() {
  const pageRef = useRef<HTMLElement | null>(null);

  useInViewReveal();
  return (
    <>
      <Suspense fallback={null}>
        <DeferredLandingEnhancements pageRef={pageRef} />
      </Suspense>
      <main ref={pageRef} className={sharedStyles.page} data-landing-page>
        <span
          className={sharedStyles.headerSentinel}
          data-landing-header-sentinel
          aria-hidden='true'
        />
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
          <ChevronUp size={22} strokeWidth={2.2} />
        </button>
      </main>
    </>
  );
}
