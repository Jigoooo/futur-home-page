import { HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';

const styleGateCss = `
html[data-style-gate='pending'] body {
  overflow: hidden;
}

.style-gate-app {
  opacity: 0;
}

html[data-style-gate='ready'] .style-gate-app {
  opacity: 1;
  transition: opacity 160ms ease;
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
  display: grid;
  width: min(360px, 100%);
  min-height: 230px;
  place-items: center;
  padding: 42px 38px 36px;
  border: 1px solid rgba(220, 230, 244, 0.88);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 34px 88px rgba(56, 78, 130, 0.14);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
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

.style-gate-orbit {
  position: relative;
  width: 92px;
  height: 92px;
  margin-bottom: 24px;
  border: 1.4px dashed rgba(73, 117, 220, 0.24);
  border-radius: 999px;
  transform: rotate(-9deg);
}

.style-gate-orbit::before,
.style-gate-orbit::after {
  content: "";
  position: absolute;
  border-radius: 999px;
}

.style-gate-orbit::before {
  inset: 17px;
  border: 1px solid rgba(138, 114, 255, 0.18);
}

.style-gate-orbit::after {
  width: 12px;
  height: 12px;
  left: 7px;
  top: 12px;
  background: #2f6bff;
  box-shadow: 0 0 0 7px rgba(47, 107, 255, 0.12);
  transform-origin: 39px 34px;
  animation: styleGateOrbit 1.45s linear infinite;
}

.style-gate-mark {
  position: relative;
  z-index: 1;
  color: #07183f;
  font-size: 30px;
  font-weight: 950;
  line-height: 1;
}

.style-gate-mark span {
  color: #2f6bff;
}

.style-gate-line {
  position: relative;
  z-index: 1;
  width: 132px;
  height: 3px;
  margin-top: 26px;
  overflow: hidden;
  border-radius: 999px;
  background: #e7eefb;
}

.style-gate-line i {
  position: absolute;
  inset: 0;
  width: 44%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(47, 107, 255, 0), #2f6bff, rgba(47, 107, 255, 0));
  animation: styleGateLine 1.05s ease-in-out infinite;
}

@keyframes styleGateOrbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes styleGateLine {
  from {
    transform: translateX(-105%);
  }
  to {
    transform: translateX(240%);
  }
}

@media (prefers-reduced-motion: reduce) {
  html[data-style-gate='ready'] .style-gate-app,
  html[data-style-gate='ready'] .style-gate-loader {
    transition: none;
  }

  .style-gate-orbit::after,
  .style-gate-line i {
    animation: none;
  }
}
`;

const styleGateScript = `
(() => {
  const root = document.documentElement;
  let isReady = false;

  root.dataset.styleGate = 'pending';

  const getStylesheets = () =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  const areStylesheetsLoaded = () =>
    getStylesheets().every((stylesheet) => stylesheet.sheet);

  const areLandingStylesApplied = () => {
    const page = document.querySelector('.page');

    if (!page) {
      return true;
    }

    const hero = document.querySelector('.hero');
    const nav = document.querySelector('.nav');

    if (!hero || !nav) {
      return false;
    }

    const heroStyle = window.getComputedStyle(hero);
    const navStyle = window.getComputedStyle(nav);

    return heroStyle.paddingTop !== '0px' && navStyle.position === 'sticky';
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
      stylesheet.addEventListener('load', checkAfterPaint, { once: true });
      stylesheet.addEventListener('error', checkAfterPaint, { once: true });
    });
  };

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      watchStylesheets();
      checkAfterPaint();
    },
    { once: true },
  );
  window.addEventListener('load', checkAfterPaint, { once: true });

  window.setTimeout(() => {
    if (!isReady) {
      root.dataset.styleGate = 'ready';
    }
  }, 2500);
})();
`;

export function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='ko' data-style-gate='pending' suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: styleGateCss }} />
        <script dangerouslySetInnerHTML={{ __html: styleGateScript }} />
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>html[data-style-gate='pending'] body{overflow:auto}.style-gate-loader{display:none!important}.style-gate-app{opacity:1!important}</style>",
          }}
        />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <div className='style-gate-loader' aria-hidden='true'>
          <div className='style-gate-card'>
            <div className='style-gate-orbit' />
            <strong className='style-gate-mark'>
              FUTUR<span>.</span>
            </strong>
            <div className='style-gate-line'>
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
