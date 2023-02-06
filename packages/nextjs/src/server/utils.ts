import type { AuthObject } from '@clerk/backend';
import { constants } from '@clerk/backend';
import type { RequestCookie } from 'next/dist/server/web/spec-extension/cookies';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { RequestLike, WithAuthOptionsExperimental } from './types';

export function setCustomAttributeOnRequest(req: RequestLike, key: string, value: string): void {
  Object.assign(req, { [key]: value });
}

export function getCustomAttributeFromRequest(req: RequestLike, key: string): string | null | undefined {
  // @ts-expect-error
  return key in req ? req[key] : undefined;
}

export function setAuthStatusOnRequest(req: RequestLike, value: string) {
  return setCustomAttributeOnRequest(req, constants.Attributes.AuthStatus, value);
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
    const reqCookieOrString = req.cookies.get(name) as RequestCookie | string | undefined;
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

export const injectSSRStateIntoObject = (obj: any, authObject: AuthObject) => {
  // Serializing the state on dev env is a temp workaround for the following issue:
  // https://github.com/vercel/next.js/discussions/11209|Next.js
  const __clerk_ssr_state =
    process.env.NODE_ENV !== 'production' ? JSON.parse(JSON.stringify({ ...authObject })) : { ...authObject };
  return { ...obj, __clerk_ssr_state };
};

// TODO: Make this a generic and move to @clerk/shared
export const handleIsSatelliteBooleanOrFn = (opts: WithAuthOptionsExperimental, url: URL): boolean => {
  if (typeof opts.isSatellite === 'function') {
    return opts.isSatellite(url);
  }
  return opts.isSatellite || false;
};
