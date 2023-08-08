import React, { useCallback, useRef, useState } from 'react';

import type { IntersectionOptions } from '../components/OrganizationSwitcher/OtherOrganizationActions';

export const useInView = (params: IntersectionOptions) => {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const thresholds = Array.isArray(params.threshold) ? params.threshold : [params.threshold || 0];
  const internalOnChange = React.useRef<IntersectionOptions['onChange']>();

  internalOnChange.current = params.onChange;

  const ref = useCallback((element: HTMLElement | null) => {
    if (!element) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const _inView = entry.isIntersecting && thresholds.some(threshold => entry.intersectionRatio >= threshold);

          setInView(_inView);

          if (internalOnChange.current) {
            internalOnChange.current(_inView, entry);
          }
        });
      },
      {
        root: params.root,
        rootMargin: params.rootMargin,
        threshold: thresholds,
      },
    );

    observerRef.current.observe(element);
  }, []);

  return {
    inView,
    ref,
  };
};
