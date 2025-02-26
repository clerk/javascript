import type { PathMatcherParam } from '@clerk/shared/pathMatcher';
import { createPathMatcher } from '@clerk/shared/pathMatcher';
import type { H3Event } from 'h3';
import { getRequestURL } from 'h3';

export type RouteMatcherParam = PathMatcherParam;

/**
 * `createRouteMatcher` is a Clerk helper function that allows you to protect multiple routes. It accepts an array of routes and checks if the route the user is trying to visit matches one of the routes passed to it.
 *
 * The `createRouteMatcher` helper function returns a function that accepts a Vue Router route location and will return `true` if the user is trying to access a route that matches on of the routes passed to `createRouteMatcher`.
 *
 * @example
 * ['/foo', '/bar(.*)']
 * @example
 * [/^\/foo\/.*$/]
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  const matcher = createPathMatcher(routes);
  return (event: H3Event) => {
    const url = getRequestURL(event);
    return matcher(new URL(url).pathname);
  };
};
