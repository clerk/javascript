import { createPathMatcher, type PathMatcherParam } from '@clerk/shared/pathMatcher';
import type { RouteMiddleware } from 'nuxt/app';

type RouteLocation = Parameters<RouteMiddleware>[0];

export type RouteMatcherParam = PathMatcherParam;

/**
 * Returns a function that accepts a Vue Router route location and returns whether the route matches the list of
 * predefined routes that can be passed in as the first argument.
 *
 * You can use glob patterns to match multiple routes or a function to match against the route object.
 * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
 * For more information, see: https://clerk.com/docs
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  const matcher = createPathMatcher(routes);
  return (to: RouteLocation) => matcher(to.path);
};
