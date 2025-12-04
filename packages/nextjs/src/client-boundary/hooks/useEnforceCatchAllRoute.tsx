import type { RoutingStrategy } from '@clerk/shared/types';
import { isProductionEnvironment } from '@clerk/shared/utils';
import React from 'react';

import { useSession } from '../hooks';
import { usePagesRouter } from './usePagesRouter';

/**
 * This ugly hook  enforces that the Clerk components are mounted in a catch-all route
 * For pages router, we can parse the pathname we get from the useRouter hook
 * For app router, there is no reliable way to do the same check right now, so we
 * fire a request to a path under window.location.href and we check whether the path
 * exists or not
 */
export const useEnforceCatchAllRoute = (
  component: string,
  path: string,
  routing?: RoutingStrategy,
  requireSessionBeforeCheck = true,
) => {
  const ref = React.useRef(0);
  const { pagesRouter } = usePagesRouter();
  const { session, isLoaded } = useSession();

  // This check does not break the rules of hooks
  // as the condition will remain the same for the whole app lifecycle
  if (isProductionEnvironment()) {
    return;
  }

  React.useEffect(() => {
    if (!isLoaded || (routing && routing !== 'path')) {
      return;
    }

    // For components that require an active session, like UserProfile
    // we should not enforce the catch-all route if there is no session
    // because these components are usually protected by the middleware
    // and if the check runs before the session is available, it will fail
    // even if the route is a catch-all route, as the check request will result
    // in a 404 because of auth.protect();
    if (requireSessionBeforeCheck && !session) {
      return;
    }

    const ac = new AbortController();
    const error = () => {
      const correctPath = pagesRouter ? `${path}/[[...index]].tsx` : `${path}/[[...rest]]/page.tsx`;
      throw new Error(
        `
Clerk: The <${component}/> component is not configured correctly. The most likely reasons for this error are:

1. The "${path}" route is not a catch-all route.
It is recommended to convert this route to a catch-all route, eg: "${correctPath}". Alternatively, you can update the <${component}/> component to use hash-based routing by setting the "routing" prop to "hash".

2. The <${component}/> component is mounted in a catch-all route, but all routes under "${path}" are protected by the middleware.
To resolve this, ensure that the middleware does not protect the catch-all route or any of its children. If you are using the "createRouteMatcher" helper, consider adding "(.*)" to the end of the route pattern, eg: "${path}(.*)". For more information, see: https://clerk.com/docs/reference/nextjs/clerk-middleware#create-route-matcher
`,
      );
    };

    if (pagesRouter) {
      if (!pagesRouter.pathname.match(/\[\[\.\.\..+]]/)) {
        error();
      }
    } else {
      const check = async () => {
        // make sure to run this as soon as possible
        // but don't run again when strict mode is enabled
        ref.current++;
        if (ref.current > 1) {
          return;
        }
        let res;
        try {
          const url = `${window.location.origin}${
            window.location.pathname
          }/${component}_clerk_catchall_check_${Date.now()}`;
          res = await fetch(url, { signal: ac.signal });
        } catch {
          // no op
        }
        if (res?.status === 404) {
          error();
        }
      };
      void check();
    }

    return () => {
      // make sure to run this as soon as possible
      // but don't run again when strict mode is enabled
      if (ref.current > 1) {
        ac.abort();
      }
    };
  }, [isLoaded]);
};
