import { useSafeLayoutEffect } from '@clerk/shared/react';
import { useRef } from 'react';

export function useSkeletonShimmer<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null);

  useSafeLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      return;
    }
    element.style.setProperty('--_cl-skeleton-state', 'running');
    for (const animation of element.getAnimations?.({ subtree: true }) ?? []) {
      animation.startTime = 0;
    }
    return () => {
      element.style.removeProperty('--_cl-skeleton-state');
    };
  }, [enabled]);

  return ref;
}
