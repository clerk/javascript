import { deprecated } from '@clerk/shared/deprecated';
import { createPathMatcher, type WithPathPatternWildcard } from '@clerk/shared/pathMatcher';
import type { Autocomplete } from '@clerk/shared/types';
import type Link from 'next/link';
import type { NextRequest } from 'next/server';

type NextTypedRoute<T = Parameters<typeof Link>['0']['href']> = T extends string ? T : never;
type RouteMatcherWithNextTypedRoutes = Autocomplete<WithPathPatternWildcard<NextTypedRoute> | NextTypedRoute>;

export type RouteMatcherParam =
  | Array<RegExp | RouteMatcherWithNextTypedRoutes>
  | RegExp
  | RouteMatcherWithNextTypedRoutes
  | ((req: NextRequest) => boolean);

/**
 * Returns a function that accepts a `Request` object and returns whether the request matches the list of
 * predefined routes that can be passed in as the first argument.
 *
 * You can use glob patterns to match multiple routes or a function to match against the request object.
 * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
 * For more information, see: https://clerk.com/docs
 *
 * @deprecated This function will be removed in the next major version. Use resource-based auth checks instead.
 * Move auth checks into each page, layout, API route, or Server Function that accesses protected data.
 * Middleware-based auth checks rely on path matching, which can diverge from how Next.js routes requests and
 * leave protected resources reachable.
 *
 * For a migration guide, see:
 *   https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrating-from-create-route-matcher
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  deprecated(
    'createRouteMatcher',
    'Use resource-based auth checks instead. Move auth checks into each page, layout, API route, or Server Function that accesses protected data. Middleware-based auth checks rely on path matching, which can diverge from how Next.js routes requests and leave protected resources reachable. For a migration guide, see: https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrating-from-create-route-matcher',
  );
  if (typeof routes === 'function') {
    return (req: NextRequest) => routes(req);
  }

  const matcher = createPathMatcher(routes);
  return (req: NextRequest) => matcher(req.nextUrl.pathname);
};
