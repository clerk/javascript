import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/protected(.*)', '/user(.*)', '/switcher(.*)']);
const isAdminRoute = createRouteMatcher(['/only-admin(.*)']);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }

    if (isAdminRoute(req)) {
      await auth.protect({ role: 'org:admin' });
    }
  },
  {
    contentSecurityPolicy: {
      strict: true,
    },
  },
);

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Don't run middleware on static files
    '/', // Run middleware on index page
    '/(api|trpc)(.*)',
  ], // Run middleware on API routes
};
