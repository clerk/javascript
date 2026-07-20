import { pathToRegexp } from './pathToRegexp';
import type { Autocomplete } from './types';

/**
 * @deprecated Prefer {@link WithPathSegmentWildcard}; `(.*)` also matches sibling routes
 * (e.g., `/dashboard(.*)` matches `/dashboardxyz`).
 */
export type WithPathPatternWildcard<T = string> = `${T & string}(.*)`;

type StripTrailingSlash<T extends string> = T extends '/'
  ? T
  : T extends `${infer Prefix}/`
    ? StripTrailingSlash<Prefix>
    : T;

/**
 * Suggests the `:path*` subtree form (e.g., `/dashboard/:path*`), which matches on
 * path-segment boundaries. `/` is special-cased to `/:path*` to avoid a malformed `//:path*`.
 *
 * @deprecated Will be removed in the next major version together with {@link createPathMatcher}.
 */
export type WithPathSegmentWildcard<T = string> = T extends '/'
  ? '/:path*'
  : `${StripTrailingSlash<T & string>}/:path*`;
/**
 * @deprecated Will be removed in the next major version together with {@link createPathMatcher}.
 */
export type PathPattern = Autocomplete<WithPathSegmentWildcard>;
/**
 * @deprecated Will be removed in the next major version together with {@link createPathMatcher}.
 */
export type PathMatcherParam = Array<RegExp | PathPattern> | RegExp | PathPattern;

export class MalformedURLError extends Error {
  public readonly statusCode = 400;

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

const precomputePathRegex = (patterns: Array<string | RegExp>) => {
  return patterns.map(pattern => (pattern instanceof RegExp ? pattern : pathToRegexp(pattern)));
};

/**
 * Normalizes a URL path for safe route matching.
 *
 * 1. Decodes percent-encoded unreserved characters using decodeURI (not
 *    decodeURIComponent) so path-reserved delimiters like %2F, %3F, %23
 *    are preserved — matching how framework routers interpret paths.
 * 2. Collapses consecutive slashes (e.g., //api/admin → /api/admin) to
 *    prevent bypass via extra slashes.
 *
 * @throws {MalformedURLError} if the path contains invalid percent-encoding
 */
export const normalizePath = (pathname: string): string => {
  try {
    pathname = decodeURI(pathname);
  } catch (e) {
    throw new MalformedURLError(pathname, e);
  }
  return pathname.replace(/\/\/+/g, '/');
};

/**
 * Creates a function that matches paths against a set of patterns.
 *
 * @param patterns - A string, RegExp, or array of patterns to match against
 * @returns A function that takes a pathname and returns true if it matches any of the patterns
 *
 * @deprecated This function will be removed in the next major version. Pattern-based path matching
 * can diverge from how frameworks route requests; use your framework's native routing primitives
 * to decide which paths to protect instead.
 */
export const createPathMatcher = (patterns: PathMatcherParam) => {
  const routePatterns = [patterns || ''].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (pathname: string) => matchers.some(matcher => matcher.test(normalizePath(pathname)));
};
