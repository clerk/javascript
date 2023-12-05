import { authMiddleware } from '@clerk/nextjs/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', /^(\/(sign-in|sign-up|app-dir|custom)\/*).*$/];

export const middleware = (req, evt) => {
  return authMiddleware({
    publicRoutes: publicPaths,
    publishableKey: req.headers.get("x-publishable-key"),
    secretKey: req.headers.get("x-secret-key"),
    proxyUrl: req.headers.get("x-proxy-url"),
    domain: req.headers.get("x-domain"),
  })(req, evt)
};

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
