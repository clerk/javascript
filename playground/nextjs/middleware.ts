import { authMiddleware } from '@clerk/nextjs/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', /^(\/(sign-in|sign-up|app-dir|custom|waitlist)\/*).*$/];

export default authMiddleware({
  publicRoutes: publicPaths,
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
