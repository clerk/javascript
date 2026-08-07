import { clerkMiddleware } from '@clerk/astro/server';

export const onRequest = clerkMiddleware((auth, context, next) => {
  const requestURL = new URL(context.request.url);

  if (requestURL.pathname === '/organization' && auth().userId && !auth().orgId) {
    const searchParams = new URLSearchParams({
      redirectUrl: requestURL.href,
    });

    const orgSelection = new URL(`/discover?${searchParams.toString()}`, context.request.url);

    return context.redirect(orgSelection.href);
  }

  return next();
});
