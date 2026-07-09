import { deprecated } from '@clerk/shared/deprecated';
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
 *
 * @deprecated This function will be removed in the next major version. Use Nuxt's built-in
 * route middleware to protect pages instead: create a named middleware that checks the user's
 * authentication status and opt pages into it with `definePageMeta()`. Child routes inherit
 * the middleware applied to their parent, so a single declaration can protect a whole section.
 *
 * ```ts
 * // app/middleware/auth.ts
 * export default defineNuxtRouteMiddleware(() => {
 *   const { isSignedIn } = useAuth();
 *
 *   if (!isSignedIn.value) {
 *     return navigateTo('/sign-in');
 *   }
 * });
 * ```
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  deprecated(
    'createRouteMatcher',
    "Use Nuxt's built-in route middleware to protect pages instead: create a named middleware that checks the user's authentication status and opt pages into it with `definePageMeta({ middleware: 'auth' })`.",
  );

  const matcher = createPathMatcher(routes);
  return (to: RouteLocation) => matcher(to.path);
};
