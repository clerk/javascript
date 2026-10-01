import { useSafeLayoutEffect } from '@clerk/shared/react';
import { useRef } from 'react';

const PERIOD_MS = 1200;
const MS_PER_PX = 2.5;

export function useSkeletonWave<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null);

  useSafeLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      return;
    }
    const now = Number(document.timeline?.currentTime ?? performance.now());
    const top = element.getBoundingClientRect().top + window.scrollY;
    const phase = (((now - top * MS_PER_PX) % PERIOD_MS) + PERIOD_MS) % PERIOD_MS;
    element.style.setProperty('--_cl-skeleton-delay', `${-phase}ms`);
    element.setAttribute('data-skeleton-wave', '');
    return () => {
      element.style.removeProperty('--_cl-skeleton-delay');
      element.removeAttribute('data-skeleton-wave');
    };
  }, [enabled]);

  return ref;
}
