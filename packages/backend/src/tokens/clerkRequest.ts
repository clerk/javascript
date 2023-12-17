import { parse as parseCookies } from 'cookie';

import { constants } from '../constants';

export type WithClerkUrl<T> = T & {
  /**
   * When a NextJs app is hosted on a platform different from Vercel
   * or inside a container (Netlify, Fly.io, AWS Amplify, docker etc),
   * req.url is always set to `localhost:3000` instead of the actual host of the app.
   *
   * The `authMiddleware` uses the value of the available req.headers in order to construct
   * and use the correct url internally. This url is then exposed as `experimental_clerkUrl`,
   * intended to be used within `beforeAuth` and `afterAuth` if needed.
   */
  clerkUrl: URL;
};

class ClerkRequest extends Request {
  clerkUrl: URL;
  cookies: Map<string, string>;

  public constructor(req: Request) {
    super(req);
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
    const origin = resolvedHost && resolvedProtocol ? `${resolvedProtocol}://${resolvedHost}` : '';

    return new URL(initialUrl.pathname + initialUrl.search, origin);
  }

  private getFirstValueFromHeader(value?: string | null) {
    return value?.split(',')[0];
  }

  private parseCookies(req: Request) {
    const cookiesRecord = parseCookies(req.headers.get('cookie') || '');
    return new Map(Object.entries(cookiesRecord).map(([key, value]) => [key, this.decodeCookieValue(value)]));
  }

  private decodeCookieValue(str: string) {
    return str ? str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent) : str;
  }
}

export const createClerkRequest = (...args: ConstructorParameters<typeof ClerkRequest>): ClerkRequest => {
  return new ClerkRequest(...args);
};

export type { ClerkRequest };
