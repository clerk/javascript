import type { RequestAdapter } from '@clerk/backend';
import cookie from 'cookie';
import type { IncomingMessage, ServerResponse } from 'http';

import { getRequestUrl } from './authenticateRequest';

// https://nextjs.org/docs/api-routes/api-middlewares#connectexpress-middleware-support
export function runMiddleware(req: IncomingMessage, res: ServerResponse, fn: (...args: any) => any) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    void fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const parseCookies = (req: IncomingMessage) => {
  return cookie.parse(req.headers['cookie'] || '');
};

export class NodeRequestAdapter implements RequestAdapter {
  readonly reqCookies: Record<string, string>;
  constructor(readonly req: IncomingMessage) {
    this.reqCookies = parseCookies(req);
  }

  headers(key: string) {
    return (this.req?.headers?.[key] as string) || undefined;
  }
  cookies(key: string) {
    return this.reqCookies?.[key] || undefined;
  }
  searchParams(): URLSearchParams {
    return getRequestUrl(this.req)?.searchParams;
  }
}
