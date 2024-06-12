import { useRouter } from 'next/compat/router';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';

import { removeOptionalCatchAllSegment } from './utils';

// Adapted from packages/nextjs/src/client-boundary/hooks/usePathnameWithoutCatchAll.tsx

/**
 * This hook grabs the current pathname (both in pages and app router) and removes any (optional) catch all segments.
 * @example
 * 1. /user/[id]/profile/[[...rest]]/page.tsx
 * 2. /user/123/profile/security
 * 3. /user/123/profile
 * @returns The pathname without any catch all segments
 */
export const usePathnameWithoutCatchAll = () => {
  const pathRef = React.useRef<string>();

  /**
   * The compat version of useRouter returns null instead of throwing an error when used inside App router.
   * Use it to detect if the component is used inside pages or app router
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
