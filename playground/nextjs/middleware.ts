import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*', '/sign-up*', '/app-dir*'];

const isPublic = (path: string) => {
  return publicPaths.find(x => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};
export default withClerkMiddleware(req => {
  return NextResponse.next();
});
export const config = { matcher: '/((?!.*\\.).*)' };
