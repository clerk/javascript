import type { FastifyRequest } from 'fastify';
import { Readable } from 'stream';

export const fastifyRequestToRequest = (req: FastifyRequest): Request => {
  const headers = new Headers(
    Object.keys(req.headers).reduce((acc, key) => {
      const value = req.headers[key];
      if (!value) {
        return acc;
      }

      if (typeof value === 'string') {
        acc.set(key, value);
      } else {
        acc.set(key, value.join(','));
      }
      return acc;
    }, new Headers()),
  );

  // Making some manual tests it seems that FastifyRequest populates the req protocol / hostname
  // based on the forwarded headers. Nevertheless, we are gonna use a dummy base and the request
  // will be fixed by the internals of the clerk/backend package
  const dummyOriginReqUrl = new URL(req.url || '', `${req.protocol}://clerk-dummy`);
  return new Request(dummyOriginReqUrl, {
    method: req.method,
    headers,
  });
};

/**
 * Converts a Fastify request to a Fetch API Request with a real URL and body streaming,
 * suitable for proxy forwarding.
 */
export const requestToProxyRequest = (req: FastifyRequest): Request => {
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  });

  const forwardedProto = req.headers['x-forwarded-proto'];
  const protoHeader = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const proto = (protoHeader || '').split(',')[0].trim();
  const protocol = proto === 'https' || req.protocol === 'https' ? 'https' : 'http';

  const forwardedHost = req.headers['x-forwarded-host'];
  const hostHeader = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
  const host = (hostHeader || '').split(',')[0].trim() || req.hostname || 'localhost';

  const url = new URL(req.url || '', `${protocol}://${host}`);

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: hasBody ? (Readable.toWeb(req.raw) as ReadableStream) : undefined,
    // @ts-expect-error - duplex required for streaming bodies but not in all TS definitions
    duplex: hasBody ? 'half' : undefined,
  });
};
