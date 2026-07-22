import { constants } from '@clerk/backend/internal';

export function getAuthKeyFromRequest(req: Request, key: keyof typeof constants.Attributes): string | null | undefined {
  return getHeader(req, constants.Headers[key]);
}

function getHeader(req: Request, name: string) {
  return req.headers.get(name);
}

export const isRedirect = (res: Response) => {
  return (
    [300, 301, 302, 303, 304, 307, 308].includes(res.status) ||
    res.headers.get(constants.Headers.ClerkRedirectTo) === 'true'
  );
};

export const setHeader = <T extends Response>(res: T, name: string, val: string): T => {
  res.headers.set(name, val);
  return res;
};

/**
 * Patches request to avoid duplex issues with unidici
 * For more information, see:
 * https://github.com/nodejs/node/issues/46221
 * https://github.com/whatwg/fetch/pull/1457
 * @internal
 */
export const patchRequest = (request: Request) => {
  // Omit `signal` from the clone: Node 24's bundled undici tightened the
  // instanceof AbortSignal check on RequestInit.signal and rejects any signal
  // it does not recognize as its own — including the standard AbortSignal from
  // framework Request subclasses or from `new AbortController()`. Until the
  // ecosystem stabilizes, abort propagation through this clone is intentionally
  // dropped. See packages/backend/src/proxy.ts for the same workaround.
  const clonedRequest = new Request(request.url, {
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    cache: request.cache,
  });

  // If duplex is not set, set it to 'half' to avoid duplex issues with unidici
  if (clonedRequest.method !== 'GET' && clonedRequest.body !== null && !('duplex' in clonedRequest)) {
    (clonedRequest as unknown as { duplex: 'half' }).duplex = 'half';
  }

  return clonedRequest;
};
