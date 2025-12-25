import { parse } from 'cookie-es';

import { constants } from '../constants';
import type { ClerkUrl } from './clerkUrl';
import { createClerkUrl } from './clerkUrl';

/**
 * A class that extends the native Request class,
 * adds cookies helpers and a normalised clerkUrl that is constructed by using the values found
 * in req.headers so it is able to work reliably when the app is running behind a proxy server.
 */
class ClerkRequest extends Request {
  readonly clerkUrl: ClerkUrl;
  readonly cookies: Map<string, string | undefined>;

  public constructor(input: ClerkRequest | Request | RequestInfo, init?: RequestInit) {
    // The usual way to duplicate a request object is to
    // pass the original request object to the Request constructor
    // both as the `input` and `init` parameters, eg: super(req, req)
    // However, this fails in certain environments like Vercel Edge Runtime
    // when a framework like Remix polyfills the global Request object.
    // This happens because `undici` performs the following instanceof check
    // which, instead of testing against the global Request object, tests against
    // the Request class defined in the same file (local Request class).
    // For more details, please refer to:
    // https://github.com/nodejs/undici/issues/2155
    // https://github.com/nodejs/undici/blob/7153a1c78d51840bbe16576ce353e481c3934701/lib/fetch/request.js#L854
    const url = typeof input !== 'string' && 'url' in input ? input.url : String(input);
    super(url, init || typeof input === 'string' ? undefined : input);
    this.clerkUrl = this.deriveUrlFromHeaders(this);
    this.cookies = this.parseCookies(this);
  }

  public toJSON() {
    return {
      url: this.clerkUrl.href,
      method: this.method,
      headers: JSON.stringify(Object.fromEntries(this.headers)),
      clerkUrl: this.clerkUrl.toString(),
      cookies: JSON.stringify(Object.fromEntries(this.cookies)),
    };
  }

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

    if (origin === initialUrl.origin) {
      return createClerkUrl(initialUrl);
    }

    try {
      return createClerkUrl(initialUrl.pathname + initialUrl.search, origin);
    } catch {
      return createClerkUrl(initialUrl);
    }
  }

  private getFirstValueFromHeader(value?: string | null) {
    return value?.split(',')[0];
  }

  private parseCookies(req: Request) {
    const cookiesRecord = parse(this.decodeCookieValue(req.headers.get('cookie') || ''));
    return new Map(Object.entries(cookiesRecord));
  }

  private decodeCookieValue(str: string) {
    return str ? str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent) : str;
  }
}

export const createClerkRequest = (...args: ConstructorParameters<typeof ClerkRequest>): ClerkRequest => {
  // Use duck typing instead of instanceof to avoid issues with polyfilled Request classes
  // (e.g., in TanStack Start or other environments with multiple Request class instances)
  // ClerkRequest has unique properties 'clerkUrl' and 'cookies' that distinguish it from Request
  const isClerkRequest = args[0] && typeof args[0] === 'object' && 'clerkUrl' in args[0] && 'cookies' in args[0];

  return isClerkRequest ? (args[0] as ClerkRequest) : new ClerkRequest(...args);
};

export type { ClerkRequest };
