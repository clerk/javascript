import { redirectToSignIn, getAuth, withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*', '/sign-up*', '/app-dir*', '/custom*'];

const isPublic = (path: string) => {
  return publicPaths.find(x => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};
export default withClerkMiddleware(req => {
  const { userId, debug } = getAuth(req);
  console.log('app-dir: middleware:debug', debug());

  if (!userId && !isPublic(req.nextUrl.pathname)) {
    console.log(req.url);
    const resp = redirectToSignIn({ returnBackUrl: req.url });
    return resp;
  }
  return NextResponse.next();
});
export const config = { matcher: '/((?!.*\\.).*)' };
