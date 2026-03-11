import { AuthStatus } from '@clerk/backend/internal';
import { clerkFrontendApiProxy, DEFAULT_PROXY_PATH, stripTrailingSlashes } from '@clerk/backend/proxy';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Readable } from 'stream';

import { clerkClient } from './clerkClient';
import * as constants from './constants';
import type { ClerkFastifyOptions } from './types';
import { fastifyRequestToRequest, requestToProxyRequest } from './utils';

export const withClerkMiddleware = (options: ClerkFastifyOptions) => {
  const frontendApiProxy = options.frontendApiProxy;
  const proxyPath = stripTrailingSlashes(frontendApiProxy?.path ?? DEFAULT_PROXY_PATH) || DEFAULT_PROXY_PATH;

  return async (fastifyRequest: FastifyRequest, reply: FastifyReply) => {
    const publishableKey = options.publishableKey || constants.PUBLISHABLE_KEY;
    const secretKey = options.secretKey || constants.SECRET_KEY;

    // Handle Frontend API proxy requests and auto-derive proxyUrl
    let resolvedProxyUrl = options.proxyUrl;
    if (frontendApiProxy) {
      const requestUrl = new URL(
        fastifyRequest.url,
        `${fastifyRequest.protocol}://${fastifyRequest.hostname || 'localhost'}`,
      );
      const isEnabled =
        typeof frontendApiProxy.enabled === 'function'
          ? frontendApiProxy.enabled(requestUrl)
          : frontendApiProxy.enabled;

      if (isEnabled) {
        if (requestUrl.pathname === proxyPath || requestUrl.pathname.startsWith(proxyPath + '/')) {
          const proxyRequest = requestToProxyRequest(fastifyRequest);

          const proxyResponse = await clerkFrontendApiProxy(proxyRequest, {
            proxyPath,
            publishableKey,
            secretKey,
          });

          reply.code(proxyResponse.status);
          proxyResponse.headers.forEach((value, key) => {
            reply.header(key, value);
          });

          if (proxyResponse.body) {
            const reader = proxyResponse.body.getReader();
            const stream = new Readable({
              async read() {
                try {
                  const { done, value } = await reader.read();
                  if (done) {
                    this.push(null);
                  } else {
                    this.push(Buffer.from(value));
                  }
                } catch (error) {
                  this.destroy(error instanceof Error ? error : new Error(String(error)));
                }
              },
            });
            return reply.send(stream);
          }
          return reply.send();
        }

        // Pass just the path - the backend resolves it against the request's
        // public origin (from x-forwarded-* headers).
        if (!resolvedProxyUrl) {
          resolvedProxyUrl = proxyPath;
        }
      }
    }

    const req = fastifyRequestToRequest(fastifyRequest);

    const requestState = await clerkClient.authenticateRequest(req, {
      ...options,
      secretKey,
      publishableKey,
      proxyUrl: resolvedProxyUrl,
      acceptsToken: 'any',
    });

    requestState.headers.forEach((value, key) => reply.header(key, value));

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      return reply.code(307).send();
    } else if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    // @ts-expect-error Inject auth so getAuth can read it
    fastifyRequest.auth = requestState.toAuth();
  };
};
