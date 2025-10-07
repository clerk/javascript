import { useParams, useRouter } from '@tanstack/react-router';
import React from 'react';

import { removeOptionalCatchAllSegment } from './utils';

/**
 * This hook grabs the current pathname and removes any (optional) catch-all segments.
 * Adapted from Next.js App Router logic for TanStack Router.
 * @example
 * Route: /user/$[id]/profile/$[...rest] (or file: user.[id].profile.[[...rest]].tsx)
 * Pathname: /user/123/profile/security
 * Params: { id: '123', rest: ['security'] }
 * Returns: /user/123/profile
 * @returns The pathname without any catch-all segments
 */
export const usePathnameWithoutCatchAll = (): string => {
  const router = useRouter();

  const pathname = router?.location.pathname || '';
  const params = useParams() as Record<string, string | string[] | undefined>;

  return React.useMemo(() => {
    const processedPath = removeOptionalCatchAllSegment(pathname);
    const pathParts = processedPath.split('/').filter(Boolean);
    const catchAllParams = Object.values(params || {})
      .filter((v): v is string[] => Array.isArray(v))
      .flat(Infinity);

    if (!pathname || catchAllParams.length === 0) {
      return pathname.replace(/\/$/, '') || '/';
    }

    // Slice off the trailing segments matching the catch-all length
    // E.g., pathParts = ['user', '123', 'profile', 'security'], length=1 → slice(0, 3) = /user/123/profile
    const baseParts = pathParts.slice(0, pathParts.length - catchAllParams.length);
    const basePath = `/${baseParts.join('/')}`;

    return basePath.replace(/\/$/, '') || '/';
  }, [pathname, params]);
};
