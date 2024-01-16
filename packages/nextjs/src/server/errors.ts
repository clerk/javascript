export const missingDomainAndProxy = `
Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.

1) With middleware
   e.g. export default clerkMiddleware({domain:'YOUR_DOMAIN',isSatellite:true}); // or the deprecated authMiddleware()
2) With environment variables e.g.
   NEXT_PUBLIC_CLERK_DOMAIN='YOUR_DOMAIN'
   NEXT_PUBLIC_CLERK_IS_SATELLITE='true'
   `;

export const missingSignInUrlInDev = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL

1) With middleware
   e.g. export default clerkMiddleware({signInUrl:'SOME_URL', isSatellite:true}); // or the deprecated authMiddleware()
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

export const getAuthAuthHeaderMissing = () => authAuthHeaderMissing('getAuth');

export const authAuthHeaderMissing = (helperName = 'auth') =>
  `Clerk: ${helperName}() was called but Clerk can't detect usage of clerkMiddleware() (or the deprecated authMiddleware()). Please ensure the following:
-  clerkMiddleware() (or the deprecated authMiddleware()) is used in your Next.js Middleware.
- Your Middleware matcher is configured to match this route or page.
- If you are using the src directory, make sure the Middleware file is inside of it.

For more details, see https://clerk.com/docs/quickstarts/nextjs
`;

export const clockSkewDetected = (verifyMessage: string) =>
  `Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will continuously try to issue new tokens, as the existing ones will be treated as "expired" due to clock skew.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${verifyMessage}`;

export const infiniteRedirectLoopDetected = () =>
  `Clerk: Infinite redirect loop detected. That usually means that we were not able to determine the auth state for this request. A list of common causes and solutions follows.

Reason 1:
Your Clerk instance keys are incorrect, or you recently changed keys (Publishable Key, Secret Key).
How to resolve:
-> Make sure you're using the correct keys from the Clerk Dashboard. If you changed keys recently, make sure to clear your browser application data and cookies.

Reason 2:
A bug that may have already been fixed in the latest version of Clerk NextJS package.
How to resolve:
-> Make sure you are using the latest version of '@clerk/nextjs' and 'next'.
`;

export const informAboutProtectedRouteInfo = (
  path: string,
  hasPublicRoutes: boolean,
  hasIgnoredRoutes: boolean,
  isApiRoute: boolean,
  defaultIgnoredRoutes: string[],
) => {
  const infoText = isApiRoute
    ? `INFO: Clerk: The request to ${path} is being protected (401) because there is no signed-in user, and the path is included in \`apiRoutes\`. To prevent this behavior, choose one of:`
    : `INFO: Clerk: The request to ${path} is being redirected because there is no signed-in user, and the path is not included in \`ignoredRoutes\` or \`publicRoutes\`. To prevent this behavior, choose one of:`;
  const apiRoutesText = isApiRoute
    ? `To prevent Clerk authentication from protecting (401) the api route, remove the rule matching "${path}" from the \`apiRoutes\` array passed to authMiddleware`
    : undefined;
  const publicRoutesText = hasPublicRoutes
    ? `To make the route accessible to both signed in and signed out users, add "${path}" to the \`publicRoutes\` array passed to authMiddleware`
    : `To make the route accessible to both signed in and signed out users, pass \`publicRoutes: ["${path}"]\` to authMiddleware`;
  const ignoredRoutes = [...defaultIgnoredRoutes, path].map(r => `"${r}"`).join(', ');
  const ignoredRoutesText = hasIgnoredRoutes
    ? `To prevent Clerk authentication from running at all, add "${path}" to the \`ignoredRoutes\` array passed to authMiddleware`
    : `To prevent Clerk authentication from running at all, pass \`ignoredRoutes: [${ignoredRoutes}]\` to authMiddleware`;
  const afterAuthText =
    "Pass a custom `afterAuth` to authMiddleware, and replace Clerk's default behavior of redirecting unless a route is included in publicRoutes";

  return `${infoText}

${[apiRoutesText, publicRoutesText, ignoredRoutesText, afterAuthText]
  .filter(Boolean)
  .map((text, index) => `${index + 1}. ${text}`)
  .join('\n')}

For additional information about middleware, please visit https://clerk.com/docs/nextjs/middleware
(This log only appears in development mode, or if \`debug: true\` is passed to authMiddleware)`;
};
