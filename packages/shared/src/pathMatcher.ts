import { pathToRegexp } from './pathToRegexp';
import type { Autocomplete } from './types';

export type WithPathPatternWildcard<T = string> = `${T & string}(.*)`;
export type PathPattern = Autocomplete<WithPathPatternWildcard>;
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
 * Creates a function that matches paths against a set of patterns.
 *
 * @param patterns - A string, RegExp, or array of patterns to match against
 * @returns A function that takes a pathname and returns true if it matches any of the patterns
 */
export const createPathMatcher = (patterns: PathMatcherParam) => {
  const routePatterns = [patterns || ''].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (pathname: string) => {
    try {
      // Use decodeURI (not decodeURIComponent) to decode unreserved characters
      // while preserving path-reserved delimiters like %2F, %3F, %23.
      // This aligns matcher behavior with how framework routers interpret paths.
      pathname = decodeURI(pathname);
    } catch (e) {
      throw new MalformedURLError(pathname, e);
    }
    // Collapse consecutive slashes so that //api/admin cannot bypass /api/admin
    pathname = pathname.replace(/\/\/+/g, '/');
    return matchers.some(matcher => matcher.test(pathname));
  };
};
