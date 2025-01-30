import type { PathMatcherParam } from '@clerk/shared/pathMatcher';
import { createPathMatcher } from '@clerk/shared/pathMatcher';
import type { H3Event } from 'h3';
import { getRequestURL } from 'h3';

export type RouteMatcherParam = PathMatcherParam;

/**
 * Returns a function that accepts a H3 Event and returns whether the route matches the list of
 * predefined API routes that can be passed in as the first argument.
 *
 * You can use glob patterns to match multiple routes or a function to match against the route object.
 * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
 * For more information, see: https://clerk.com/docs
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  const matcher = createPathMatcher(routes);
  return (event: H3Event) => {
    const url = getRequestURL(event);
    return matcher(new URL(url).pathname);
  };
};
