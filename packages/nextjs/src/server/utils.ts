import type { AuthenticateRequestOptions, ClerkRequest, RequestState } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { logger } from '@clerk/shared';
import { handleValueOrFn } from '@clerk/shared/handleValueOrFn';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps } from '@clerk/shared/proxy';
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { constants as nextConstants } from '../constants';
import { DOMAIN, ENCRYPTION_KEY, IS_SATELLITE, PROXY_URL, SECRET_KEY, SIGN_IN_URL } from './constants';
import { authSignatureInvalid, encryptionKeyInvalid, missingDomainAndProxy, missingSignInUrlInDev } from './errors';
import { errorThrower } from './errorThrower';
import type { RequestLike } from './types';

export function setCustomAttributeOnRequest(req: RequestLike, key: string, value: string): void {
  Object.assign(req, { [key]: value });
}

export function getCustomAttributeFromRequest(req: RequestLike, key: string): string | null | undefined {
  // @ts-expect-error - TS doesn't like indexing into RequestLike
  return key in req ? req[key] : undefined;
}

export function getAuthKeyFromRequest(
  req: RequestLike,
  key: keyof typeof constants.Attributes,
): string | null | undefined {
  return getCustomAttributeFromRequest(req, constants.Attributes[key]) || getHeader(req, constants.Headers[key]);
}

// TODO: Rename Auth status and align the naming across media
export function getAuthStatusFromRequest(req: RequestLike): string | null | undefined {
  return (
    getCustomAttributeFromRequest(req, constants.Attributes.AuthStatus) || getHeader(req, constants.Headers.AuthStatus)
  );
}

export function getHeader(req: RequestLike, name: string): string | null | undefined {
  if (isNextRequest(req)) {
    return req.headers.get(name);
  }

  // If no header has been determined for IncomingMessage case, check if available within private `socket` headers
  // When deployed to vercel, req.headers for API routes is a `IncomingHttpHeaders` key-val object which does not follow
  // the Headers spec so the name is no longer case-insensitive.
  return req.headers[name] || req.headers[name.toLowerCase()] || (req.socket as any)?._httpMessage?.getHeader(name);
}

export function getCookie(req: RequestLike, name: string): string | undefined {
  if (isNextRequest(req)) {
    // Nextjs broke semver in the 13.0.0 -> 13.0.1 release, so even though
    // this should be RequestCookie in all updated apps. In order to support apps
    // using v13.0.0 still, we explicitly add the string type
    // https://github.com/vercel/next.js/pull/41526
    const reqCookieOrString = req.cookies.get(name) as ReturnType<NextRequest['cookies']['get']> | string | undefined;
    if (!reqCookieOrString) {
      return undefined;
    }
    return typeof reqCookieOrString === 'string' ? reqCookieOrString : reqCookieOrString.value;
  }
  return req.cookies[name];
}

function isNextRequest(val: unknown): val is NextRequest {
  try {
    const { headers, nextUrl, cookies } = (val || {}) as NextRequest;
    return (
      typeof headers?.get === 'function' &&
      typeof nextUrl?.searchParams.get === 'function' &&
      typeof cookies?.get === 'function'
    );
  } catch (e) {
    return false;
  }
}

const OVERRIDE_HEADERS = 'x-middleware-override-headers';
const MIDDLEWARE_HEADER_PREFIX = 'x-middleware-request' as string;

export const setRequestHeadersOnNextResponse = (
  res: NextResponse | Response,
  req: Request,
  newHeaders: Record<string, string>,
) => {
  if (!res.headers.get(OVERRIDE_HEADERS)) {
    // Emulate a user setting overrides by explicitly adding the required nextjs headers
    // https://github.com/vercel/next.js/pull/41380
    // @ts-expect-error
    res.headers.set(OVERRIDE_HEADERS, [...req.headers.keys()]);
    req.headers.forEach((val, key) => {
      res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
    });
  }

  // Now that we have normalised res to include overrides, just append the new header
  Object.entries(newHeaders).forEach(([key, val]) => {
    res.headers.set(OVERRIDE_HEADERS, `${res.headers.get(OVERRIDE_HEADERS)},${key}`);
    res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
  });
};

export const injectSSRStateIntoObject = <O, T>(obj: O, authObject: T) => {
  // Serializing the state on dev env is a temp workaround for the following issue:
  // https://github.com/vercel/next.js/discussions/11209|Next.js
  const __clerk_ssr_state = (
    process.env.NODE_ENV !== 'production' ? JSON.parse(JSON.stringify({ ...authObject })) : { ...authObject }
  ) as T;
  return { ...obj, __clerk_ssr_state };
};

// Auth result will be set as both a query param & header when applicable
export function decorateRequest(
  req: ClerkRequest,
  res: Response,
  requestState: RequestState,
  {
    secretKey,
    signInUrl,
    signUpUrl,
    publishableKey,
  }: Pick<AuthenticateRequestOptions, 'publishableKey' | 'signInUrl' | 'signUpUrl'> &
    Required<Pick<AuthenticateRequestOptions, 'secretKey'>>,
): Response {
  const { reason, message, status, token } = requestState;
  // pass-through case, convert to next()
  if (!res) {
    res = NextResponse.next();
  }

  // redirect() case, return early
  if (res.headers.get(nextConstants.Headers.NextRedirect)) {
    return res;
  }

  let rewriteURL;

  // next() case, convert to a rewrite
  if (res.headers.get(nextConstants.Headers.NextResume) === '1') {
    res.headers.delete(nextConstants.Headers.NextResume);
    rewriteURL = new URL(req.url);
  }

  // rewrite() case, set auth result only if origin remains the same
  const rewriteURLHeader = res.headers.get(nextConstants.Headers.NextRewrite);

  if (rewriteURLHeader) {
    const reqURL = new URL(req.url);
    rewriteURL = new URL(rewriteURLHeader);

    // if the origin has changed, return early
    if (rewriteURL.origin !== reqURL.origin) {
      return res;
    }
  }

  if (rewriteURL) {
    const clerkRequestData = encryptClerkRequestData({ secretKey, signInUrl, signUpUrl, publishableKey });

    setRequestHeadersOnNextResponse(res, req, {
      [constants.Headers.AuthStatus]: status,
      [constants.Headers.AuthToken]: token || '',
      [constants.Headers.AuthSignature]: token ? createTokenSignature(token, secretKey) : '',
      [constants.Headers.AuthMessage]: message || '',
      [constants.Headers.AuthReason]: reason || '',
      [constants.Headers.ClerkUrl]: req.clerkUrl.toString(),
      ...(clerkRequestData ? { [constants.Headers.ClerkRequestData]: clerkRequestData } : {}),
    });
    res.headers.set(nextConstants.Headers.NextRewrite, rewriteURL.href);
  }

  return res;
}

export const apiEndpointUnauthorizedNextResponse = () => {
  return NextResponse.json(null, { status: 401, statusText: 'Unauthorized' });
};

export const isCrossOrigin = (from: string | URL, to: string | URL) => {
  const fromUrl = new URL(from);
  const toUrl = new URL(to);
  return fromUrl.origin !== toUrl.origin;
};

export const handleMultiDomainAndProxy = (clerkRequest: ClerkRequest, opts: AuthenticateRequestOptions) => {
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(opts?.proxyUrl, clerkRequest.clerkUrl, PROXY_URL);

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const isSatellite = handleValueOrFn(opts.isSatellite, new URL(clerkRequest.url), IS_SATELLITE);
  const domain = handleValueOrFn(opts.domain, new URL(clerkRequest.url), DOMAIN);
  const signInUrl = opts?.signInUrl || SIGN_IN_URL;

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(missingDomainAndProxy);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(opts.secretKey || SECRET_KEY)) {
    throw new Error(missingSignInUrlInDev);
  }

  return {
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
  };
};

export const redirectAdapter = (url: string | URL) => {
  return NextResponse.redirect(url, { headers: { [constants.Headers.ClerkRedirectTo]: 'true' } });
};

export function assertKey(key: string, onError: () => never): string {
  if (!key) {
    onError();
  }

  return key;
}

/**
 * Compute a cryptographic signature from a session token and provided secret key. Used to validate that the token has not been modified when transferring between middleware and the Next.js origin.
 */
function createTokenSignature(token: string, key: string): string {
  return hmacSHA1(token, key).toString();
}

/**
 * Assert that the provided token generates a matching signature.
 */
export function assertTokenSignature(token: string, key: string, signature?: string | null) {
  if (!signature) {
    throw new Error(authSignatureInvalid);
  }

  const expectedSignature = createTokenSignature(token, key);
  if (expectedSignature !== signature) {
    throw new Error(authSignatureInvalid);
  }
}

export type ClerkRequestData = Partial<AuthenticateRequestOptions>;

/**
 * Encrypt request data propagated between server requests.
 * @internal
 **/
export function encryptClerkRequestData(requestData: ClerkRequestData) {
  if (requestData.secretKey && !ENCRYPTION_KEY) {
    // TODO SDK-1833: change this to an error in the next major version of `@clerk/nextjs`
    logger.warnOnce(
      'Clerk: Missing `CLERK_ENCRYPTION_KEY`. Required for propagating `secretKey` middleware option. See docs: https://clerk.com/docs/references/nextjs/clerk-middleware#server-side-options-propagation',
    );
    return;
  }

  return AES.encrypt(
    JSON.stringify(requestData),
    ENCRYPTION_KEY ?? assertKey(SECRET_KEY, () => errorThrower.throwMissingSecretKeyError()),
  ).toString();
}

/**
 * Decrypt request data propagated between server requests.
 * @internal
 */
export function decryptClerkRequestData(encryptedRequestData?: string | undefined | null): ClerkRequestData {
  if (!encryptedRequestData) {
    return {};
  }

  try {
    const decryptedBytes = AES.decrypt(encryptedRequestData, ENCRYPTION_KEY || SECRET_KEY);
    const encoded = decryptedBytes.toString(encUtf8);
    return JSON.parse(encoded);
  } catch (err) {
    throw new Error(encryptionKeyInvalid);
  }
}
