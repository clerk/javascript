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
  const pathname = router?.location.pathname || ''; // Equivalent to usePathname()

  // Early return for no router (SSR initial or error)
  if (!pathname) {
    return '/';
  }

  // Equivalent to useParams() – gets params for the current (leaf) route, which includes catch-alls
  const params = useParams() as Record<string, string | string[] | undefined>; // Typed as needed

  return React.useMemo(() => {
    // Apply optional catch-all heuristic first (mirrors Next.js fallback)
    const processedPath = removeOptionalCatchAllSegment(pathname);

    // For resolved pathnames in TanStack: Split into parts (exclude leading /)
    const pathParts = processedPath.split('/').filter(Boolean);

    // Identify catch-all params: Those that are arrays (splats like [...rest])
    const catchAllParams = Object.values(params || {})
      .filter((v): v is string[] => Array.isArray(v))
      .flat(Infinity); // Flatten all (handles multiple/nested, though rare)

    // If no catch-all segments, return full path
    if (catchAllParams.length === 0) {
      return pathname.replace(/\/$/, '') || '/'; // Normalize trailing slash
    }

    // Slice off the trailing segments matching the catch-all length
    // E.g., pathParts = ['user', '123', 'profile', 'security'], length=1 → slice(0, 3) = /user/123/profile
    const baseParts = pathParts.slice(0, pathParts.length - catchAllParams.length);
    const basePath = `/${baseParts.join('/')}`;

    // Normalize: Ensure absolute and no trailing slash unless root
    return basePath.replace(/\/$/, '') || '/';
  }, [pathname, params]); // Dependencies: Recompute on navigation or param changes
};
