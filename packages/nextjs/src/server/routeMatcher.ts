import type { Autocomplete } from '@clerk/types';
import type Link from 'next/link';
import type { NextRequest } from 'next/server';

import { paths } from '../utils';

type WithPathPatternWildcard<T> = `${T & string}(.*)`;
type NextTypedRoute<T = Parameters<typeof Link>['0']['href']> = T extends string ? T : never;

// For extra safety, we won't recommend using a `/(.*)` route matcher.
type ExcludeRootPath<T> = T extends '/' ? never : T;

type RouteMatcherWithNextTypedRoutes = Autocomplete<
  WithPathPatternWildcard<ExcludeRootPath<NextTypedRoute>> | NextTypedRoute
>;

export type RouteMatcherParam =
  | Array<RegExp | RouteMatcherWithNextTypedRoutes>
  | RegExp
  | RouteMatcherWithNextTypedRoutes
  | ((req: NextRequest) => boolean);

/**
 * Create a function that matches a request against the specified routes.
 * Precomputes the glob matchers for the public routes, so we don't have to
 * recompile the regular expressions on every request.
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  if (typeof routes === 'function') {
    return (req: NextRequest) => routes(req);
  }

  const routePatterns = [routes || ''].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (req: NextRequest) => matchers.some(matcher => matcher.test(req.nextUrl.pathname));
};

const precomputePathRegex = (patterns: Array<string | RegExp>) => {
  return patterns.map(pattern => (pattern instanceof RegExp ? pattern : paths.toRegexp(pattern)));
};
