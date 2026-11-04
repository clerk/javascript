import { clerkMiddleware } from '@clerk/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const withClerk = process.env.CLERK_SECRET_KEY ? clerkMiddleware() : null;

const studioPaths = /^\/(studio|template|capture|recorder)(\/|$)/;

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (studioPaths.test(request.nextUrl.pathname)) {
    return process.env.NODE_ENV === 'development' ? NextResponse.next() : new NextResponse(null, { status: 404 });
  }
  return withClerk ? withClerk(request, event) : NextResponse.next();
}

export const config = {
  matcher: [
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/live(.*)',
    '/studio(.*)',
    '/template(.*)',
    '/capture(.*)',
    '/recorder(.*)',
  ],
};
