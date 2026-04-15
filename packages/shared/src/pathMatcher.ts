import type { Autocomplete } from '@clerk/types';

import { pathToRegexp } from './pathToRegexp';

export type WithPathPatternWildcard<T = string> = `${T & string}(.*)`;
export type PathPattern = Autocomplete<WithPathPatternWildcard>;
export type PathMatcherParam = Array<RegExp | PathPattern> | RegExp | PathPattern;

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

const precomputePathRegex = (patterns: Array<string | RegExp>) => {
  return patterns.map(pattern => (pattern instanceof RegExp ? pattern : pathToRegexp(pattern)));
};

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
 */
export const createPathMatcher = (patterns: PathMatcherParam) => {
  const routePatterns = [patterns || ''].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (pathname: string) => matchers.some(matcher => matcher.test(normalizePath(pathname)));
};
