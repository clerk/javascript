import type { FastifyRequest } from 'fastify';

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
  return new Request(dummyOriginReqUrl, { method: req.method, headers });
};
