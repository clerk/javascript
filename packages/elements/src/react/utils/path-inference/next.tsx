import { useParams, usePathname } from 'next/navigation';
import React from 'react';

// Adapted from packages/nextjs/src/client-boundary/hooks/usePathnameWithoutCatchAll.tsx

export const usePathnameWithoutCatchAll = () => {
  const pathRef = React.useRef<string>();
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
