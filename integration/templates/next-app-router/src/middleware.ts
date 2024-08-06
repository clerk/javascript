import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const csp = `default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' 'nonce-deadbeef';
  img-src 'self' https://img.clerk.com;
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  frame-src 'self' https://challenges.cloudflare.com;
`;

const isProtectedRoute = createRouteMatcher(['/protected(.*)', '/user(.*)', '/switcher(.*)']);
const isCSPRoute = createRouteMatcher(['/csp']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }

  if (isCSPRoute(req)) {
    req.headers.set('Content-Security-Policy', csp.replace(/\n/g, ''));
  }
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Don't run middleware on static files
    '/', // Run middleware on index page
    '/(api|trpc)(.*)',
  ], // Run middleware on API routes
};
