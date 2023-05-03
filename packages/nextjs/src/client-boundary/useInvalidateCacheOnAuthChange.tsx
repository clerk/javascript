import { useSafeLayoutEffect } from './useSafeLayoutEffect';

export const useInvalidateCacheOnAuthChange = (callback: () => void) => {
  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = callback;
  }, []);
};
