import { parse as parseCookies } from 'cookie';

import { constants } from '../constants';
import type { ClerkUrl, WithClerkUrl } from './clerkUrl';
import { createClerkUrl } from './clerkUrl';

class ClerkRequest extends Request {
  readonly clerkUrl: ClerkUrl;
  readonly cookies: Map<string, string>;

  public constructor(req: ClerkRequest | Request) {
    super(req, req);
    this.clerkUrl = this.deriveUrlFromHeaders(req);
    this.cookies = this.parseCookies(req);
  }

  public decorateWithClerkUrl = <R extends object>(req: R): WithClerkUrl<R> => {
    return Object.assign(req, { clerkUrl: this.clerkUrl });
  };

  /**
   * Used to fix request.url using the x-forwarded-* headers
   * TODO add detailed description of the issues this solves
   */
  private deriveUrlFromHeaders(req: Request) {
    const initialUrl = new URL(req.url);
    const forwardedProto = req.headers.get(constants.Headers.ForwardedProto);
    const forwardedHost = req.headers.get(constants.Headers.ForwardedHost);
    const host = req.headers.get(constants.Headers.Host);
    const protocol = initialUrl.protocol;

    const resolvedHost = this.getFirstValueFromHeader(forwardedHost) ?? host;
    const resolvedProtocol = this.getFirstValueFromHeader(forwardedProto) ?? protocol?.replace(/[:/]/, '');
    const origin = resolvedHost && resolvedProtocol ? `${resolvedProtocol}://${resolvedHost}` : initialUrl.origin;

    return createClerkUrl(initialUrl.pathname + initialUrl.search, origin);
  }

  private getFirstValueFromHeader(value?: string | null) {
    return value?.split(',')[0];
  }

  private parseCookies(req: Request) {
    const cookiesRecord = parseCookies(this.decodeCookieValue(req.headers.get('cookie') || ''));
    return new Map(Object.entries(cookiesRecord));
  }

  private decodeCookieValue(str: string) {
    return str ? str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent) : str;
  }
}

export const createClerkRequest = (...args: ConstructorParameters<typeof ClerkRequest>): ClerkRequest => {
  return args[0] instanceof ClerkRequest ? args[0] : new ClerkRequest(...args);
};

export type { ClerkRequest };
