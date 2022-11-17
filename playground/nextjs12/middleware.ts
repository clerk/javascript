import { getAuth, withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*', '/sign-up*', '/app-dir*'];

const isPublic = (path: string) => {
  return publicPaths.find(x => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};
export default withClerkMiddleware(req => {
  if (isPublic(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const { userId } = getAuth(req);
  if (!userId) {
    console.log(req.url);
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});
export const config = { matcher: '/((?!.*\\.).*)' };
