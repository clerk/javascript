import { invalidateNextRouterCache } from '../utils/invalidateNextRouterCache';
import { useSafeLayoutEffect } from './useSafeLayoutEffect';

export const useInvalidateCacheOnAuthChange = () => {
  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = invalidateNextRouterCache;
  }, []);
};
