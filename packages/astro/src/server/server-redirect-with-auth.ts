// Middleware runs on the server side, before clerk-js is loaded, that's why we need Cookies.
import type { AuthenticateRequestOptions, ClerkRequest } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { DEV_BROWSER_KEY, setDevBrowserInURL } from '@clerk/shared/devBrowser';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';

import { getSafeEnv } from './get-safe-env';
import type { AstroMiddlewareContextParam } from './types';

// TODO-SHARED: This exists in @clerk/nextjs
/**
 * Grabs the dev browser from cookies and appends it to the redirect URL when redirecting to cross-origin.
 */
export const serverRedirectWithAuth = (
  context: AstroMiddlewareContextParam,
  clerkRequest: ClerkRequest,
  res: Response,
  opts: AuthenticateRequestOptions,
) => {
  const location = res.headers.get('location');
  const shouldAppendDevBrowser = res.headers.get(constants.Headers.ClerkRedirectTo) === 'true';

  if (
    shouldAppendDevBrowser &&
    !!location &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    isDevelopmentFromSecretKey(opts.secretKey || getSafeEnv(context).sk!) &&
    clerkRequest.clerkUrl.isCrossOrigin(location)
  ) {
    const devBrowser = clerkRequest.cookies.get(DEV_BROWSER_KEY) || '';
    const url = new URL(location);
    const urlWithDevBrowser = setDevBrowserInURL(url, devBrowser);
    return context.redirect(urlWithDevBrowser.href, 307);
  }
  return res;
};
