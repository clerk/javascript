import { useCallback, useRef, useState } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
}

export const useInView = (params: IntersectionOptions) => {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const paramsRef = useRef(params);

  paramsRef.current = params;

  const ref = useCallback((element: HTMLElement | null) => {
    if (!element) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    const { root, rootMargin, threshold } = paramsRef.current;
    const thresholds = Array.isArray(threshold) ? threshold : [threshold || 0];

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const _inView = entry.isIntersecting && thresholds.some(threshold => entry.intersectionRatio >= threshold);

          setInView(_inView);

          paramsRef.current.onChange?.(_inView, entry);
        });
      },
      {
        root,
        rootMargin,
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
