export const missingDomainAndProxy = `
Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.

1) With middleware
   e.g. export default withClerkMiddleware(req => {...}, {domain:'YOUR_DOMAIN',isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_DOMAIN='YOUR_DOMAIN'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'
   `;

export const missingSignInUrlInDev = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL

1) With middleware
   e.g. export default withClerkMiddleware(req => {...}, {signInUrl:'SOME_URL',isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_SIGN_IN_URL='SOME_URL'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'`;

export const receivedRequestForIgnoredRoute = (url: string, matcher: string) =>
  `Clerk: The middleware was skipped for this request URL: ${url}. For performance reasons, it's recommended to your middleware matcher to:
export const config = {
  matcher: ${matcher},
};

Alternatively, you can set your own ignoredRoutes. See https://clerk.com/docs/nextjs/middleware
`;

export const getAuthAuthHeaderMissing = () =>
  'You need to use "authMiddleware" (or the deprecated "withClerkMiddleware") in your Next.js middleware file. You also need to make sure that your middleware matcher is configured correctly and matches this route or page. See https://clerk.com/docs/quickstarts/get-started-with-nextjs';

export const authAuthHeaderMissing = () =>
  "Clerk: auth() was called but it looks like you aren't using `authMiddleware` in your middleware file. Please use `authMiddleware` and make sure your middleware matcher is configured correctly and it matches this route or page. See https://clerk.com/docs/quickstarts/get-started-with-nextjs";
