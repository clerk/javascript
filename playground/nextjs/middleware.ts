import { authMiddleware } from '@clerk/nextjs/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', /^(?!\/(sign-in|sign-up|app-dir|custom)\/*).*$/];

export const middleware = (req, evt) => {
  console.log("pk", req.headers.get("x-publishable-key"));
  return authMiddleware({
    publicRoutes: publicPaths,
    publishableKey: req.headers.get("x-publishable-key"),
    secretKey: req.headers.get("x-secret-key"),
    debug: true
  })(req, evt)
};

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
