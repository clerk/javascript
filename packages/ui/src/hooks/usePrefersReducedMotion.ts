import { useEffect, useState } from 'react';

const mediaQueryNoPreference = '(prefers-reduced-motion: no-preference)';

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window === 'undefined' || !window.matchMedia(mediaQueryNoPreference).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryNoPreference);
    const listener = () => {
      setPrefersReducedMotion(!mediaQueryList.matches);
    };
    listener();

    if ('addEventListener' in mediaQueryList) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    }

    (mediaQueryList as MediaQueryList).addListener(listener);
    return () => (mediaQueryList as MediaQueryList).removeListener(listener);
  }, []);

  return prefersReducedMotion;
}
