import { useSafeLayoutEffect } from './useSafeLayoutEffect';

export const useInvokeMiddlewareOnAuthChange = (callback: () => void) => {
  useSafeLayoutEffect(() => {
    window.__unstable__onAfterSetActive = () => {
      // Re-run the middleware every time there auth state changes.
      // This enables complete control from a centralised place (NextJS middleware),
      // as we will invoke it every time the client-side auth state changes, eg: signing-out, switching orgs, etc.\
      callback();
    };
  }, []);
};
