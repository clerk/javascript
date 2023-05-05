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
Check if signInUrl is missing from your configuration or it is not a absolute URL

1) With middleware
   e.g. export default withClerkMiddleware(req => {...}, {signInUrl:'SOME_URL',isSatellite:true});
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_SIGN_IN_URL='SOME_URL'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'`;

export const receivedRequestForIgnoredRoute = (url: string, matcher: string) =>
  `Clerk: A request for a static file or a NextJS internal route was intercepted by authMiddleware. Usually, these requests require no authentication logic so the authMiddleware ignores them by default.
However, for improved performance, these requests should be ignored using the default config.matcher API exported from your middleware file.
The request URL was: ${url}.

To resolve this warning, open your middleware file, set your config.matcher as shown below and restart your dev server:

export const config = {
  matcher: ${matcher},
};

If you intentionally want to run the authMiddleware for this route, you can exclude it from the default ignoredRoutes.
`;
