import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const proxy = process.env.CLERK_SECRET_KEY ? clerkMiddleware() : () => NextResponse.next();

export default proxy;

export const config = {
  matcher: ['/sign-in(.*)', '/sign-up(.*)', '/live(.*)'],
};
