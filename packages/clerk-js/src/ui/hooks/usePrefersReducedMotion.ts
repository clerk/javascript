import { useEffect, useState } from 'react';

const mediaQueryNoPreference = '(prefers-reduced-motion: no-preference)';

// Get the correct initial value instead of defaulting to true
const getInitialValue = () => {
  if (typeof window === 'undefined') {
    return true;
  } // SSR fallback
  return !window.matchMedia(mediaQueryNoPreference).matches;
};

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialValue);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryNoPreference);
    setPrefersReducedMotion(!window.matchMedia(mediaQueryNoPreference).matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(!event.matches);
    };

    const addListenerCompat = (event: any, handler: any) => {
      if ('addEventListener' in mediaQueryList) {
        return mediaQueryList.addEventListener(event, handler);
      } else {
        // @ts-expect-error This is a fix for Safari iOS 13.4
        // This version only supports the deprecated addListener method
        // addListener accepts a single argument, which is the handler
        return mediaQueryList.addListener(handler);
      }
    };

    const removeListenerCompat = (event: any, handler: any) => {
      if ('addEventListener' in mediaQueryList) {
        return mediaQueryList.removeEventListener(event, handler);
      } else {
        // @ts-ignore same as above
        return mediaQueryList.removeListener(handler);
      }
    };

    addListenerCompat('change', listener);
    return () => removeListenerCompat('change', listener);
  }, []);

  return prefersReducedMotion;
}
