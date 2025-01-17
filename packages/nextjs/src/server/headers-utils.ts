import { constants } from '@clerk/backend/internal';
import type { NextRequest } from 'next/server';

import type { RequestLike } from './types';

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

export function getHeader(req: RequestLike, name: string): string | null | undefined {
  if (isNextRequest(req) || isRequestWebAPI(req)) {
    return req.headers.get(name);
  }

  // If no header has been determined for IncomingMessage case, check if available within private `socket` headers
  // When deployed to vercel, req.headers for API routes is a `IncomingHttpHeaders` key-val object which does not follow
  // the Headers spec so the name is no longer case-insensitive.
  return req.headers[name] || req.headers[name.toLowerCase()] || (req.socket as any)?._httpMessage?.getHeader(name);
}

export function detectClerkMiddleware(req: RequestLike): boolean {
  return Boolean(getAuthKeyFromRequest(req, 'AuthStatus'));
}

export function isNextRequest(val: unknown): val is NextRequest {
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

export function isRequestWebAPI(val: unknown): val is Request {
  try {
    const { headers } = (val || {}) as Request;
    return typeof headers?.get === 'function';
  } catch (e) {
    return false;
  }
}
