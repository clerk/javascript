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
(This log only appears in development mode)
`;

export const getAuthAuthHeaderMissing = () =>
  'You need to use "authMiddleware" (or the deprecated "withClerkMiddleware") in your Next.js middleware file. You also need to make sure that your middleware matcher is configured correctly and matches this route or page. See https://clerk.com/docs/quickstarts/get-started-with-nextjs';

export const authAuthHeaderMissing = () =>
  "Clerk: auth() was called but it looks like you aren't using `authMiddleware` in your middleware file. Please use `authMiddleware` and make sure your middleware matcher is configured correctly and it matches this route or page. See https://clerk.com/docs/quickstarts/get-started-with-nextjs";

export const infiniteRedirectLoopDetected = () =>
  `Clerk: Infinite redirect loop detected. That usually means that we were not able to determine the auth state for this request. A list of common causes and solutions follows.

Reason 1:
Your server's system clock is inaccurate. Clerk will continuously try to issue new tokens, as the existing ones will be treated as "expired" due to clock skew.
How to resolve:
-> Make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

Reason 2:
Your Clerk instance keys are incorrect, or you recently changed keys (Publishable Key, Secret Key).
How to resolve:
-> Make sure you're using the correct keys from the Clerk Dashboard. If you changed keys recently, make sure to clear your browser application data and cookies.

Reason 3:
A bug that may have already been fixed in the latest version of Clerk NextJS package.
How to resolve:
-> Make sure you are using the latest version of '@clerk/nextjs' and 'next'.
`;

export const informAboutProtectedRouteInfo = (
  path: string,
  hasPublicRoutes: boolean,
  hasIgnoredRoutes: boolean,
  defaultIgnoredRoutes: string[],
) => {
  const publicRoutesText = hasPublicRoutes
    ? `1. To make the route accessible to both signed in and signed out users, add "${path}" to the \`publicRoutes\` array passed to authMiddleware`
    : `1. To make the route accessible to both signed in and signed out users, pass \`publicRoutes: ["${path}"]\` to authMiddleware`;
  const ignoredRoutes = [...defaultIgnoredRoutes, path].map(r => `"${r}"`).join(', ');
  const ignoredRoutesText = hasIgnoredRoutes
    ? `2. To prevent Clerk authentication from running at all, add "${path}" to the \`ignoredRoutes\` array passed to authMiddleware`
    : `2. To prevent Clerk authentication from running at all, pass \`ignoredRoutes: [${ignoredRoutes}]\` to authMiddleware`;
  const afterAuthText =
    "3. Pass a custom `afterAuth` to authMiddleware, and replace Clerk's default behavior of redirecting unless a route is included in publicRoutes";

  return `INFO: Clerk: The request to ${path} is being redirected because there is no signed-in user, and the path is not included in \`ignoredRoutes\` or \`publicRoutes\`. To prevent this behavior, choose one of:

${[publicRoutesText, ignoredRoutesText, afterAuthText].join('\n')}

For additional information about middleware, please visit https://clerk.com/docs/nextjs/middleware
(This log only appears in development mode, or if \`debug: true\` is passed to authMiddleware)`;
};
