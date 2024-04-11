import { authMiddleware } from '@clerk/nextjs/server';
import { NextMiddleware, NextResponse } from 'next/server';

const clerkMiddleware = authMiddleware()

const middleware: NextMiddleware = (request, event) => {
  if (request.geo?.country?.toLocaleUpperCase() === 'IN') {
    return new NextResponse(null, { status: 403 });
  }
  return clerkMiddleware(request, event);
};

export default middleware;

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
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
