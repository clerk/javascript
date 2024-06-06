import { useRouter } from 'next/compat/router';
import React from 'react';

import { removeOptionalCatchAllSegment } from './utils';

// Adapted from packages/nextjs/src/client-boundary/hooks/usePathnameWithoutCatchAll.tsx

export const usePathnameWithoutCatchAll = () => {
  const pathRef = React.useRef<string>();

  /**
   * The compat version of useRouter returns null instead of throwing an error when used inside App router.
   * Use it to detect if the component is used inside pages or app router
   * TODO: Should we skip this compat layer since in the router we do not use compat?
   */
  const pagesRouter = useRouter();

  if (pagesRouter) {
    if (pathRef.current) {
      return pathRef.current;
    } else {
      // The optional catch all route is included in the pathname in pages router. It starts with [[... and we can just remove it
      pathRef.current = removeOptionalCatchAllSegment(pagesRouter.pathname);
      return pathRef.current;
    }
  }

  /**
   * Require is used to avoid importing next/navigation when the pages router is used, as it will throw an error.
   * Can't use dynamic import as the hook needs to be sync
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const usePathname = require('next/navigation').usePathname;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useParams = require('next/navigation').useParams;

  /**
   * Get the pathname that includes any named or catch all params.
   * @example
   * /user/[id]/profile/[[...rest]]/page.tsx
   *
   * This filesystem route could give us the following pathname:
   * /user/123/profile/security
   * if the user navigates to the security section of the user profile
   */
  const pathname = usePathname() || '';
  const pathParts = pathname.split('/').filter(Boolean);
  /**
   * For /user/[id]/profile/[[...rest]]/page.tsx useParams will return { id: '123', rest: ['security'] }.
   * So catch all params are always arrays
   */
  const catchAllParams = Object.values(useParams() || {})
    .filter(v => Array.isArray(v))
    .flat(Infinity);
  if (pathRef.current) {
    return pathRef.current;
  } else {
    // /user/123/profile/security should be transformed to /user/123/profile
    pathRef.current = `/${pathParts.slice(0, pathParts.length - catchAllParams.length).join('/')}`;
    return pathRef.current;
  }
};
