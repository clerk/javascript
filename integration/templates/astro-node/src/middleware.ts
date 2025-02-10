import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const unautorized = () =>
  new Response(JSON.stringify({ error: 'unathorized access' }), {
    status: 401,
  });

/**
 * 3. Support handler
 */
const isProtectedPage = createRouteMatcher(['/user(.*)', '/discover(.*)']);

const isProtectedApiRoute = createRouteMatcher(['/api/protected(.*)']);

export const onRequest = clerkMiddleware((auth, context, next) => {
  const requestURL = new URL(context.request.url);
  if (['/sign-in', '/', '/sign-up'].includes(requestURL.pathname)) {
    return next();
  }

  if (isProtectedApiRoute(context.request) && !auth().userId) {
    return unautorized();
  }

  if (isProtectedPage(context.request) && !auth().userId) {
    return auth().redirectToSignIn();
  }

  if (!auth().orgId && requestURL.pathname !== '/discover' && requestURL.pathname === '/organization') {
    if (!auth().userId) {
      return next();
    }
    const searchParams = new URLSearchParams({
      redirectUrl: requestURL.href,
    });

    const orgSelection = new URL(`/discover?${searchParams.toString()}`, context.request.url);

    return context.redirect(orgSelection.href);
  }

  return next();
});
