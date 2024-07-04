import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
// import { defineMiddleware, sequence } from "astro:middleware";

// export const onRequest = clerkMiddleware();

/**
 * 1. Support options
 */
// export const onRequest = clerkMiddleware();

/**
 * 2. Support chaining
 */
// const greeting = defineMiddleware(async (context, next) => {
//   console.log("greeting request");
//   console.log(context.locals.auth());
//   const response = await next();
//   console.log("greeting response");
//   return response;
// });

// export const onRequest = sequence(
//   clerkMiddleware({
//     // TODO: This does not work
//     afterSignInUrl: "/wow",
//   }),
//   greeting,
// );

const unautorized = () =>
  new Response(JSON.stringify({ error: 'unathorized access' }), {
    status: 401,
  });

/**
 * 3. Support handler
 */
const isProtectedPage = createRouteMatcher(['/user(.*)', '/discover(.*)', /^\/organization/]);

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
    const searchParams = new URLSearchParams({
      redirectUrl: requestURL.href,
    });

    const orgSelection = new URL(`/discover?${searchParams.toString()}`, context.request.url);

    return context.redirect(orgSelection.href);
  }

  return next();
});
