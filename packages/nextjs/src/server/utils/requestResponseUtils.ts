import { RequestCookie } from 'next/dist/server/web/spec-extension/cookies';
import { NextRequest } from 'next/server';

import { AUTH_RESULT, RequestLike } from '../types';

type RequestProps = {
  req: NextRequest;
  authResult: string;
};

export function setPrivateAuthResultOnRequest({ req, authResult }: RequestProps): void {
  Object.assign(req, { _authResult: authResult });
}

// Tries to extract auth result from the request using several strategies
export function getAuthResultFromRequest(req: RequestLike): string | null | undefined {
  return getPrivateAuthResult(req) || getQueryParam(req, AUTH_RESULT) || getHeader(req, AUTH_RESULT);
}

function getPrivateAuthResult(req: RequestLike): string | null | undefined {
  return '_authResult' in req ? req['_authResult'] : undefined;
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
    queryParam = new URL(req.url || '').searchParams.get(name);
  }
  return queryParam;
}

export function getHeader(req: RequestLike, name: string): string | null | undefined {
  if (isNextRequest(req)) {
    return req.headers.get(name);
  }

  // @ts-expect-error
  // If no header has been determined for IncomingMessage case, check if available within private `socket` headers
  return req.headers[name] || req.socket?._httpMessage?.getHeader(name);
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
