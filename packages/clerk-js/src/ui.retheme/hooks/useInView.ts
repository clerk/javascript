import { useCallback, useRef, useState } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  /** Only trigger the inView callback once */
  triggerOnce?: boolean;
  /** Call this function whenever the in view state changes */
  onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
}

/**
 * A custom React hook that provides the ability to track whether an element is in view
 * based on the IntersectionObserver API.
 *
 * @param {IntersectionOptions} params - IntersectionObserver configuration options.
 * @returns {{
 *   inView: boolean,
 *   ref: (element: HTMLElement | null) => void
 * }} An object containing the current inView status and a ref function to attach to the target element.
 */
export const useInView = (params: IntersectionOptions) => {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const thresholds = Array.isArray(params.threshold) ? params.threshold : [params.threshold || 0];
  const internalOnChange = useRef<IntersectionOptions['onChange']>();

  internalOnChange.current = params.onChange;

  const ref = useCallback((element: HTMLElement | null) => {
    // Callback refs are called with null to clear the value, so we rely on that to cleanup the observer. (ref: https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback)
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
