import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextMiddleware, NextResponse } from 'next/server';


export default clerkMiddleware((auth)=> {
  
})

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
