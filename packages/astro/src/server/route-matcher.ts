import type { Autocomplete } from '@clerk/types';
import { pathToRegexp } from 'path-to-regexp';

type WithPathPatternWildcard<T = string> = `${T & string}(.*)`;

type RouteMatcherRoutes = Autocomplete<WithPathPatternWildcard>;

export type RouteMatcherParam = Array<RegExp | RouteMatcherRoutes> | RegExp | RouteMatcherRoutes;

// TODO-SHARED: This can be moved to @clerk/shared as an identical implementation exists in @clerk/nextjs
/**
 * Returns a function that accepts a `Request` object and returns whether the request matches the list of
 * predefined routes that can be passed in as the first argument.
 *
 * You can use glob patterns to match multiple routes or a function to match against the request object.
 * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
 * For more information, see: https://clerk.com/docs
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  const routePatterns = [routes || ''].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (req: Request) => matchers.some(matcher => matcher.test(new URL(req.url).pathname));
};

const precomputePathRegex = (patterns: Array<string | RegExp>) => {
  return patterns.map(pattern => (pattern instanceof RegExp ? pattern : paths.toRegexp(pattern)));
};

export const paths = {
  toRegexp: (path: string) => {
    try {
      return pathToRegexp(path);
    } catch (e: any) {
      throw new Error(
        `Invalid path: ${path}.\nConsult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp\n${e.message}`,
      );
    }
  },
};
