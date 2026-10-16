import { clerkMiddleware } from '@clerk/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const withClerk = process.env.CLERK_SECRET_KEY ? clerkMiddleware() : null;

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  return withClerk ? withClerk(request, event) : NextResponse.next();
}

export const config = {
  matcher: ['/sign-in(.*)', '/sign-up(.*)', '/live(.*)'],
};
