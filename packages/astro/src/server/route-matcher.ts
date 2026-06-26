import { deprecated } from '@clerk/shared/deprecated';
import { createPathMatcher, type PathMatcherParam } from '@clerk/shared/pathMatcher';

export type RouteMatcherParam = PathMatcherParam;

/**
 * Returns a function that accepts a `Request` object and returns whether the request matches the list of
 * predefined routes that can be passed in as the first argument.
 *
 * You can use glob patterns to match multiple routes or a function to match against the request object.
 * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
 * For more information, see: https://clerk.com/docs
 *
 * @deprecated This function will be removed in the next major version. Use resource-based auth checks instead.
 * Move auth checks into each Astro page, API route, or server-side handler that accesses protected data.
 * Middleware-based auth checks rely on path matching, which can diverge from how Astro routes requests and
 * leave protected resources reachable.
 *
 * Instead of protecting routes only from middleware, protect the resource itself:
 *
 * ```ts
 * import type { APIRoute } from 'astro';
 *
 * export const GET: APIRoute = ({ locals }) => {
 *   const { userId } = locals.auth();
 *
 *   if (!userId) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *
 *   return Response.json({ userId });
 * };
 * ```
 */
export const createRouteMatcher = (routes: RouteMatcherParam) => {
  deprecated(
    'createRouteMatcher',
    'Use resource-based auth checks instead. Move auth checks into each Astro page, API route, or server-side handler that accesses protected data. Middleware-based auth checks rely on path matching, which can diverge from how Astro routes requests and leave protected resources reachable.',
  );

  const matcher = createPathMatcher(routes);
  return (req: Request) => matcher(new URL(req.url).pathname);
};
