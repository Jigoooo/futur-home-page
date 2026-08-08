import { HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';

const styleGateCss = `
html:not([data-style-gate='ready']) body {
  overflow: hidden;
}

.style-gate-app {
  opacity: 0;
  pointer-events: none;
}

html[data-style-gate='ready'] .style-gate-app {
  opacity: 1;
}

html[data-style-gate='ready'] body[data-landing-ready='true'] .style-gate-app,
html[data-style-gate='ready'] body:not(:has([data-landing-page])) .style-gate-app {
  pointer-events: auto;
}

.style-gate-loader {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  overflow: hidden;
  background:
    radial-gradient(760px 460px at 82% 12%, rgba(227, 238, 255, 0.96), rgba(227, 238, 255, 0) 68%),
    radial-gradient(720px 420px at 8% 18%, rgba(242, 247, 255, 0.92), rgba(242, 247, 255, 0) 70%),
    linear-gradient(180deg, #fbfcff 0%, #ffffff 100%);
  color: #07183f;
  font-family:
    Pretendard,
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  letter-spacing: 0;
}

html[data-style-gate='ready'] .style-gate-loader {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 180ms ease,
    visibility 0s linear 180ms;
}

.style-gate-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(380px, 100%);
  padding: 44px 40px 38px;
  border: 1px solid rgba(220, 230, 244, 0.88);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 34px 88px rgba(56, 78, 130, 0.14);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  transition:
    opacity 320ms ease,
    transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

html[data-style-gate='ready'] .style-gate-card {
  opacity: 0;
  transform: translate3d(0, -8px, 0);
}

.style-gate-card::before,
.style-gate-card::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.style-gate-card::before {
  width: 120px;
  height: 120px;
  right: -48px;
  top: -52px;
  background: rgba(47, 107, 255, 0.1);
}

.style-gate-card::after {
  width: 82px;
  height: 82px;
  left: -34px;
  bottom: -32px;
  background: rgba(185, 234, 219, 0.34);
}

.style-gate-mark {
  position: relative;
  z-index: 1;
  color: #07183f;
  font-size: 30px;
  font-weight: 950;
  line-height: 1;
  opacity: 0;
  transform: translate3d(0, 10px, 0);
  animation: styleGateCopyIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0s forwards;
}

.style-gate-mark span {
  color: #2f6bff;
}

.style-gate-copy {
  position: relative;
  z-index: 1;
  margin: 22px 0 0;
  color: #13234e;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: -0.01em;
  opacity: 0;
  transform: translate3d(0, 10px, 0);
  animation: styleGateCopyIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.18s forwards;
}

.style-gate-sub {
  position: relative;
  z-index: 1;
  margin: 8px 0 0;
  color: #66738d;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  opacity: 0;
  transform: translate3d(0, 10px, 0);
  animation: styleGateCopyIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.32s forwards;
}

.style-gate-dots {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 7px;
  margin-top: 24px;
  opacity: 0;
  animation: styleGateCopyIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards;
}

.style-gate-dots i {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #2f6bff;
  opacity: 0.6;
}

@keyframes styleGateCopyIn {
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  html[data-style-gate='ready'] .style-gate-app,
  html[data-style-gate='ready'] .style-gate-loader,
  html[data-style-gate='ready'] .style-gate-card {
    transition: none;
  }

  .style-gate-mark,
  .style-gate-copy,
  .style-gate-sub,
  .style-gate-dots {
    opacity: 1;
    transform: none;
    animation: none;
  }

  .style-gate-dots i {
    animation: none;
    opacity: 0.6;
  }
}
`;

const styleGateScript = `
(() => {
  const root = document.documentElement;
  let isReady = false;
  let isDomReady = false;
  const watchedStylesheets = new WeakSet();

  root.dataset.styleGate = 'pending';

  const getStylesheets = () =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  const areStylesheetsLoaded = () =>
    getStylesheets().every((stylesheet) => stylesheet.sheet);

  const isHeroImageReady = () => {
    const heroImage = document.querySelector('[data-landing-hero-image]');

    if (!heroImage) {
      return true;
    }

    if (!(heroImage instanceof HTMLImageElement)) {
      return true;
    }

    return heroImage.complete && heroImage.naturalWidth > 0;
  };

  const areLandingStylesApplied = () => {
    const app = document.querySelector('.style-gate-app');

    if (!app) {
      return false;
    }

    const page = document.querySelector('[data-landing-page]');

    if (!page) {
      return isDomReady;
    }

    const hero = document.querySelector('[data-landing-hero]');
    const nav = document.querySelector('[data-landing-nav]');

    if (!hero || !nav) {
      return false;
    }

    const heroStyle = window.getComputedStyle(hero);
    const navStyle = window.getComputedStyle(nav);

    if (heroStyle.paddingTop === '0px' || navStyle.position !== 'sticky') {
      return false;
    }

    return isHeroImageReady();
  };

  const revealWhenReady = () => {
    if (isReady) {
      return;
    }

    if (!areStylesheetsLoaded() || !areLandingStylesApplied()) {
      return;
    }

    isReady = true;
    root.dataset.styleGate = 'ready';
  };

  const checkAfterPaint = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(revealWhenReady);
    });
  };

  const watchStylesheets = () => {
    getStylesheets().forEach((stylesheet) => {
      if (watchedStylesheets.has(stylesheet)) {
        return;
      }

      watchedStylesheets.add(stylesheet);
      stylesheet.addEventListener('load', checkAfterPaint, { once: true });
      stylesheet.addEventListener('error', checkAfterPaint, { once: true });
    });
  };

  let heroImageWatched = false;
  const watchHeroImage = () => {
    if (heroImageWatched) {
      return;
    }

    const heroImage = document.querySelector('[data-landing-hero-image]');

    if (!(heroImage instanceof HTMLImageElement)) {
      return;
    }

    heroImageWatched = true;

    if (heroImage.complete && heroImage.naturalWidth > 0) {
      checkAfterPaint();
      return;
    }

    heroImage.addEventListener('load', checkAfterPaint, { once: true });
    heroImage.addEventListener('error', checkAfterPaint, { once: true });
  };

  const keepCheckingUntilReady = () => {
    if (isReady) {
      return;
    }

    watchStylesheets();
    watchHeroImage();
    checkAfterPaint();
    window.setTimeout(keepCheckingUntilReady, 120);
  };

  const observeStylesheetLinks = () => {
    const observer = new MutationObserver(() => {
      if (isReady) {
        observer.disconnect();
        return;
      }

      watchStylesheets();
      watchHeroImage();
      checkAfterPaint();
    });

    observer.observe(document.head, { childList: true, subtree: true });

    return observer;
  };

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      isDomReady = true;
      watchStylesheets();
      watchHeroImage();
      checkAfterPaint();
    },
    { once: true },
  );
  window.addEventListener('load', checkAfterPaint, { once: true });
  observeStylesheetLinks();
  keepCheckingUntilReady();
})();
`;

export function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='ko' data-style-gate='pending' suppressHydrationWarning>
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: styleGateCss }} />
        <script dangerouslySetInnerHTML={{ __html: styleGateScript }} />
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>html[data-style-gate='pending'] body{overflow:auto}.style-gate-loader{display:none!important}.style-gate-app{opacity:1!important;pointer-events:auto!important}</style>",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <div className='style-gate-loader' aria-hidden='true'>
          <div className='style-gate-card'>
            <strong className='style-gate-mark'>
              FUTUR<span>.</span>
            </strong>
            <p className='style-gate-copy'>아이디어를 현실의 서비스로.</p>
            <p className='style-gate-sub'>FUTUR가 함께 만듭니다.</p>
            <div className='style-gate-dots'>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className='style-gate-app'>{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
