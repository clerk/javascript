import { pathToRegexp } from './pathToRegexp';
import type { Autocomplete } from './types';

export type WithPathPatternWildcard<T = string> = `${T & string}(.*)`;
export type PathPattern = Autocomplete<WithPathPatternWildcard>;
export type PathMatcherParam = Array<RegExp | PathPattern> | RegExp | PathPattern;

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
  return (pathname: string) => matchers.some(matcher => matcher.test(pathname));
};
