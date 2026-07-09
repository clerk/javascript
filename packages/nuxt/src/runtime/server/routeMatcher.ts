import { deprecated } from '@clerk/shared/deprecated';
import type { PathMatcherParam } from '@clerk/shared/pathMatcher';
import { createPathMatcher } from '@clerk/shared/pathMatcher';
import type { H3Event } from 'h3';

import { getRequestURL } from '#imports';

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
 *
 * @deprecated This function will be removed in the next major version. Match API route paths natively
 * inside `clerkMiddleware()` instead, and protect pages with Nuxt's built-in route middleware:
 *
 * ```ts
 * import { clerkMiddleware } from '@clerk/nuxt/server';
 *
 * export default clerkMiddleware(event => {
 *   const { isAuthenticated } = event.context.auth();
 *   const { pathname } = getRequestURL(event);
 *
 *   if (!isAuthenticated && pathname.startsWith('/api/admin')) {
 *     throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
 *   }
 * });
 * ```
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  deprecated(
    'createRouteMatcher',
    "Match API route paths natively inside `clerkMiddleware()` instead, for example: `getRequestURL(event).pathname.startsWith('/api/admin')`. To protect pages, use Nuxt's built-in route middleware.",
  );

  const matcher = createPathMatcher(routes);
  return (event: H3Event) => {
    const url = getRequestURL(event);
    return matcher(new URL(url).pathname);
  };
};
