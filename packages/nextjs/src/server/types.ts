import type { IncomingMessage } from 'http';
import type { NextApiRequest } from 'next';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { NextMiddleware, NextRequest } from 'next/server';

import type { ShouldProxyFn } from '@clerk/shared/proxy';

// Request contained in GetServerSidePropsContext, has cookies but not query
type GsspRequest = IncomingMessage & { cookies: NextApiRequestCookies };

export type RequestLike = NextRequest | NextApiRequest | GsspRequest;

export type NextMiddlewareRequestParam = Parameters<NextMiddleware>['0'];
export type NextMiddlewareEvtParam = Parameters<NextMiddleware>['1'];
export type NextMiddlewareReturn = ReturnType<NextMiddleware>;

/**
 * Options for configuring Frontend API proxy in clerkMiddleware
 */
export interface FrontendApiProxyOptions {
  /**
   * Enable proxy handling. Can be:
   * - `true` - enable for all domains
   * - `false` - disable for all domains
   * - A function: (url: URL) => boolean - enable based on the request URL
   */
  enabled: boolean | ShouldProxyFn;
  /**
   * The path prefix for proxy requests. Defaults to `/__clerk`.
   */
  path?: string;
}
