import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: ['/', '/hash/sign-in', /^(\/(sign-in|sign-up)\/*).*$/, '/hash/sign-up', /^(\/(settings)\/*).*$/],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
