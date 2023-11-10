import { useEffect, useState } from 'react';

const mediaQueryNoPreference = '(prefers-reduced-motion: no-preference)';

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryNoPreference);
    setPrefersReducedMotion(!window.matchMedia(mediaQueryNoPreference).matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(!event.matches);
    };

    mediaQueryList.addEventListener('change', listener);

    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
