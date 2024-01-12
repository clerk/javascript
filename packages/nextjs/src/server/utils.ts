import type { RequestState } from '@clerk/backend';
import { buildRequestUrl, constants } from '@clerk/backend';
import { handleValueOrFn } from '@clerk/shared/handleValueOrFn';
import { isHttpOrHttps } from '@clerk/shared/proxy';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { constants as nextConstants } from '../constants';
import { API_KEY, DOMAIN, IS_SATELLITE, PROXY_URL, SECRET_KEY, SIGN_IN_URL } from './clerkClient';
import { missingDomainAndProxy, missingSignInUrlInDev } from './errors';
import type { NextMiddlewareResult, RequestLike, WithAuthOptions } from './types';

export function setCustomAttributeOnRequest(req: RequestLike, key: string, value: string): void {
  Object.assign(req, { [key]: value });
}

export function getCustomAttributeFromRequest(req: RequestLike, key: string): string | null | undefined {
  // @ts-expect-error
  return key in req ? req[key] : undefined;
}

export function getAuthKeyFromRequest(
  req: RequestLike,
  key: keyof typeof constants.Attributes,
): string | null | undefined {
  const val = getCustomAttributeFromRequest(req, constants.Attributes[key]) || getHeader(req, constants.Headers[key]);
  if (val) {
    return val;
  }
  // alternatively, check whether the value exists as a query param
  // this is only required for specific nextjs versions that don't support overriding request headers
  // and is no longer needed in v5
  if (key === 'AuthStatus' || key === 'AuthToken') {
    return getQueryParam(req, key) || undefined;
  }
  return undefined;
}

// Tries to extract auth status from the request using several strategies
// TODO: Rename Auth status and align the naming across media
export function getAuthStatusFromRequest(req: RequestLike): string | null | undefined {
  return (
    getCustomAttributeFromRequest(req, constants.Attributes.AuthStatus) ||
    getHeader(req, constants.Headers.AuthStatus) ||
    getQueryParam(req, constants.SearchParams.AuthStatus)
  );
}

function getQueryParam(req: RequestLike, name: string): string | null | undefined {
  if (isNextRequest(req)) {
    return req.nextUrl.searchParams.get(name);
  }

  // Check if the request contains a parsed query object
  // NextApiRequest does, but the IncomingMessage in the GetServerSidePropsContext case does not
  let queryParam: string | null | undefined;
  if ('query' in req) {
    queryParam = req.query[name] as string | undefined;
  }

  // Fall back to query string
  if (!queryParam) {
    const qs = (req.url || '').split('?')[1];
    queryParam = new URLSearchParams(qs).get(name);
  }
  return queryParam;
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
  req: NextRequest,
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

/**
 * Test whether the currently installed nextjs version supports overriding the request headers.
 * This feature was added in nextjs v13.0.1
 * https://github.com/vercel/next.js/pull/41380
 */
export const nextJsVersionCanOverrideRequestHeaders = () => {
  try {
    const headerKey = 'clerkTest';
    const headerKeyInRes = `${MIDDLEWARE_HEADER_PREFIX}-${headerKey}`;
    const res = NextResponse.next({ request: { headers: new Headers({ [headerKey]: 'true' }) } });
    return res.headers.has(headerKeyInRes);
  } catch (e) {
    return false;
  }
};

export const injectSSRStateIntoObject = <O, T>(obj: O, authObject: T) => {
  // Serializing the state on dev env is a temp workaround for the following issue:
  // https://github.com/vercel/next.js/discussions/11209|Next.js
  const __clerk_ssr_state = (
    process.env.NODE_ENV !== 'production' ? JSON.parse(JSON.stringify({ ...authObject })) : { ...authObject }
  ) as T;
  return { ...obj, __clerk_ssr_state };
};

export function isDevelopmentFromApiKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

// Auth result will be set as both a query param & header when applicable
export function decorateRequest(
  req: NextRequest,
  res: NextMiddlewareResult,
  requestState: RequestState,
): NextMiddlewareResult {
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
    if (nextJsVersionCanOverrideRequestHeaders()) {
      // If we detect that the host app is using a nextjs installation that reliably sets the
      // request headers, we don't need to fall back to the searchParams strategy.
      // In this case, we won't set them at all in order to avoid having them visible in the req.url
      setRequestHeadersOnNextResponse(res, req, {
        [constants.Headers.AuthStatus]: status,
        [constants.Headers.AuthToken]: token || '',
        [constants.Headers.AuthMessage]: message || '',
        [constants.Headers.AuthReason]: reason || '',
      });
    } else {
      res.headers.set(constants.Headers.AuthStatus, status);
      res.headers.set(constants.Headers.AuthToken, token || '');
      res.headers.set(constants.Headers.AuthMessage, message || '');
      res.headers.set(constants.Headers.AuthReason, reason || '');
      rewriteURL.searchParams.set(constants.SearchParams.AuthStatus, status);
      rewriteURL.searchParams.set(constants.SearchParams.AuthToken, token || '');
      rewriteURL.searchParams.set(constants.Headers.AuthMessage, message || '');
      rewriteURL.searchParams.set(constants.Headers.AuthReason, reason || '');
    }
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

export const handleMultiDomainAndProxy = (req: NextRequest, opts: WithAuthOptions) => {
  const requestURL = buildRequestUrl(req);
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(opts?.proxyUrl, requestURL, PROXY_URL);
  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, requestURL).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const isSatellite = handleValueOrFn(opts.isSatellite, new URL(req.url), IS_SATELLITE);
  const domain = handleValueOrFn(opts.domain, new URL(req.url), DOMAIN);
  const signInUrl = opts?.signInUrl || SIGN_IN_URL;

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(missingDomainAndProxy);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromApiKey(SECRET_KEY || API_KEY)) {
    throw new Error(missingSignInUrlInDev);
  }

  return {
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
  };
};
