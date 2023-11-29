import { parse as parseCookies } from 'cookie';

class ClerkRequest extends Request {
  clerkUrl: URL;
  cookies: Map<string, string>;

  constructor(req: Request) {
    super(req);
    this.clerkUrl = this.#deriveUrlFromHeaders(req);
    this.cookies = new Map(Object.entries(parseCookies(req.headers.get('cookie') || '')));
  }

  #deriveUrlFromHeaders = (req: Request) => {
    const reqUrl = new URL(req.url);
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('x-forwarded-host') || reqUrl.host;
    const res = new URL(`${protocol}://${host}`);
    res.pathname = reqUrl.pathname;
    reqUrl.searchParams.forEach((value, key) => {
      res.searchParams.append(key, value);
    });
    return res;
  };
}

export const createClerkRequest = (req: Request): ClerkRequest => {
  return new ClerkRequest(req);
};

export type { ClerkRequest };
