import { pathToRegexp } from '@clerk/shared/pathToRegexp';
import type { Autocomplete } from '@clerk/types';
import type Link from 'next/link';
import type { NextRequest } from 'next/server';

type WithPathPatternWildcard<T> = `${T & string}(.*)`;
type NextTypedRoute<T = Parameters<typeof Link>['0']['href']> = T extends string ? T : never;

type RouteMatcherWithNextTypedRoutes = Autocomplete<WithPathPatternWildcard<NextTypedRoute> | NextTypedRoute>;

export type RouteMatcherParam =
  | Array<RegExp | RouteMatcherWithNextTypedRoutes>
  | RegExp
  | RouteMatcherWithNextTypedRoutes
  | ((req: NextRequest) => boolean);

export class MalformedURLError extends Error {
  public readonly statusCode = 400;
  public readonly cause?: unknown;

  constructor(pathname: string, cause?: unknown) {
    super(`Malformed encoding in URL path: ${pathname}`);
    this.name = 'MalformedURLError';
    this.cause = cause;
  }
}

/**
 * String-based check for MalformedURLError that works across package bundles
 * where `instanceof` would fail due to duplicate class identities.
 */
export function isMalformedURLError(e: unknown): e is MalformedURLError {
  return e instanceof Error && e.name === 'MalformedURLError';
}

/**
 * Normalizes a URL path for safe route matching.
 *
 * 1. Decodes percent-encoded unreserved characters using decodeURI (not
 *    decodeURIComponent) so path-reserved delimiters like %2F, %3F, %23
 *    are preserved — matching how framework routers interpret paths.
 * 2. Collapses consecutive slashes (e.g. //api/admin → /api/admin) to
 *    prevent bypass via extra slashes.
 *
 * @throws {MalformedURLError} if the path contains invalid percent-encoding
 */
const normalizePath = (pathname: string): string => {
  try {
    pathname = decodeURI(pathname);
  } catch (e) {
    throw new MalformedURLError(pathname, e);
  }
  return pathname.replace(/\/\/+/g, '/');
};

/**
 * Returns a function that accepts a `Request` object and returns whether the request matches the list of
 * predefined routes that can be passed in as the first argument.
 *
 * You can use glob patterns to match multiple routes or a function to match against the request object.
 * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
 * For more information, see: https://clerk.com/docs
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  if (typeof routes === 'function') {
    return (req: NextRequest) => routes(req);
  }

  const routePatterns = [routes || ''].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (req: NextRequest) => matchers.some(matcher => matcher.test(normalizePath(req.nextUrl.pathname)));
};

const precomputePathRegex = (patterns: Array<string | RegExp>) => {
  return patterns.map(pattern => (pattern instanceof RegExp ? pattern : pathToRegexp(pattern)));
};
