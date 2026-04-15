import { createPathMatcher, type PathMatcherParam } from '@clerk/shared/pathMatcher';
import type { RouteMiddleware } from 'nuxt/app';

type RouteLocation = Parameters<RouteMiddleware>[0];

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
  return (to: RouteLocation) => matcher(to.path);
};
