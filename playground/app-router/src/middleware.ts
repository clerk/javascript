import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextMiddleware, NextResponse } from 'next/server';

const AUTH_VERIFY_PATH = '/verify';

export default clerkMiddleware((auth, req) => {
  if (
    !auth().has({
      assurance: {
        level: 'secondFactor',
        maxAge: '10m',
      },
    }) &&
    req.nextUrl.pathname !== AUTH_VERIFY_PATH
  ) {
    // return NextResponse.rewrite(new URL(AUTH_VERIFY_PATH, req.url));
  }
});

// export default authMiddleware({
//   publicRoutes: ['/'],
//   beforeAuth: req => {
//     // console.log('middleware:beforeAuth', req.url);
//     if (req.nextUrl.searchParams.get('redirect')) {
//       return NextResponse.redirect('https://google.com');
//     }
//     const res = NextResponse.next();
//     res.headers.set('x-before-auth', 'true');
//     return res;
//   },
//   afterAuth: (auth, req) => {
//     // console.log('middleware:afterAuth', auth.userId, req.url, auth.isPublicRoute);
//     if (!auth.userId && !auth.isPublicRoute) {
//       const url = new URL('/sign-in', req.url);
//       url.searchParams.append('redirect_url', req.url);
//       return NextResponse.redirect(url);
//     }
//     const res = NextResponse.next();
//     res.headers.set('x-after-auth', 'true');
//     return res;
//   },
//   debug: true
// });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
