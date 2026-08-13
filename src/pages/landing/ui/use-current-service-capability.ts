import { useEffect, useState } from 'react';

import { serviceCapabilities } from '../config';
import type { ServiceCapabilityKey } from '../model/types';

const SERVICE_SELECTOR = '[data-service-capability]';

function findCurrentCapability(): ServiceCapabilityKey {
  const chapters = Array.from(document.querySelectorAll<HTMLElement>(SERVICE_SELECTOR));
  if (!chapters.length) return 'product';

  const probe = window.innerHeight / 2;
  const crossingChapter = chapters.find((chapter) => {
    const rect = chapter.getBoundingClientRect();
    return rect.top <= probe && rect.bottom > probe;
  });
  const closestChapter =
    crossingChapter ??
    chapters.reduce((closest, chapter) => {
      const closestDistance = Math.abs(closest.getBoundingClientRect().top - probe);
      const chapterDistance = Math.abs(chapter.getBoundingClientRect().top - probe);
      return chapterDistance < closestDistance ? chapter : closest;
    });
  const key = closestChapter.dataset.serviceCapability;

  return serviceCapabilities.some((capability) => capability.key === key)
    ? (key as ServiceCapabilityKey)
    : 'product';
}

export function useCurrentServiceCapability(): ServiceCapabilityKey {
  const [currentCapability, setCurrentCapability] = useState<ServiceCapabilityKey>('product');

  useEffect(() => {
    let frameId = 0;

    const update = () => {
      frameId = 0;
      setCurrentCapability(findCurrentCapability());
    };
    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return currentCapability;
}
