import { createClerkClient } from '@clerk/backend';
import { AuthStatus, signedOutAuthObject } from '@clerk/backend/internal';
import { clerkFrontendApiProxy, DEFAULT_PROXY_PATH, stripTrailingSlashes } from '@clerk/backend/proxy';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Readable } from 'stream';

import * as constants from './constants';
import type { ClerkFastifyOptions } from './types';
import { fastifyRequestToRequest, requestToProxyRequest } from './utils';

export const withClerkMiddleware = (options: ClerkFastifyOptions) => {
  const { hookName: _hookName, frontendApiProxy, __internal_enableHandshake, ...clerkOptions } = options;
  const enableHandshake = __internal_enableHandshake ?? true;
  const proxyPath = stripTrailingSlashes(frontendApiProxy?.path ?? DEFAULT_PROXY_PATH) || DEFAULT_PROXY_PATH;
  const publishableKey = options.publishableKey || constants.PUBLISHABLE_KEY;
  const secretKey = options.secretKey || constants.SECRET_KEY;
  const apiUrl = options.apiUrl || apiUrlFromPublishableKey(publishableKey);
  const clerkClient = createClerkClient({
    ...clerkOptions,
    publishableKey,
    secretKey,
    machineSecretKey: options.machineSecretKey || constants.MACHINE_SECRET_KEY,
    apiUrl,
    apiVersion: options.apiVersion || constants.API_VERSION,
    jwtKey: options.jwtKey || constants.JWT_KEY,
    userAgent: options.userAgent || `${constants.SDK_METADATA.name}@${constants.SDK_METADATA.version}`,
    sdkMetadata: options.sdkMetadata || constants.SDK_METADATA,
  });

  return async (fastifyRequest: FastifyRequest, reply: FastifyReply) => {
    // Handle Frontend API proxy requests and auto-derive proxyUrl
    let resolvedProxyUrl = options.proxyUrl;
    if (frontendApiProxy) {
      let requestUrl: URL;
      try {
        requestUrl = new URL(
          fastifyRequest.url,
          `${fastifyRequest.protocol}://${fastifyRequest.hostname || 'localhost'}`,
        );
      } catch {
        return reply.code(400).send();
      }
      const isEnabled =
        typeof frontendApiProxy.enabled === 'function'
          ? frontendApiProxy.enabled(requestUrl)
          : frontendApiProxy.enabled;

      if (isEnabled) {
        if (requestUrl.pathname === proxyPath || requestUrl.pathname.startsWith(proxyPath + '/')) {
          let proxyRequest: Request;
          try {
            proxyRequest = requestToProxyRequest(fastifyRequest);
          } catch {
            return reply.code(400).send();
          }

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

    // Node accepts request targets/methods (`//`, TRACE) the fetch spec cannot represent; reject those instead of 500ing.
    let req: Request;
    try {
      req = fastifyRequestToRequest(fastifyRequest);
    } catch {
      return reply.code(400).send();
    }

    const requestState = await clerkClient.authenticateRequest(req, {
      ...clerkOptions,
      secretKey,
      publishableKey,
      proxyUrl: resolvedProxyUrl,
      acceptsToken: 'any',
      __internal_resolveHandshakeOnlyForNavigation: !enableHandshake,
    });

    requestState.headers.forEach((value, key) => reply.header(key, value));

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      // Development instances cannot establish auth state without the dev browser handshake.
      const isDevBrowserHandshake =
        requestState.reason === 'dev-browser-missing' || requestState.reason === 'dev-browser-sync';
      if (enableHandshake || isDevBrowserHandshake) {
        return reply.code(307).send();
      }
      reply.removeHeader(constants.Headers.Location);
      reply.removeHeader(constants.Headers.CacheControl);
    } else if (enableHandshake && requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    // A skipped handshake redirect leaves a handshake state whose toAuth() is null.
    // @ts-expect-error Inject auth so getAuth can read it
    fastifyRequest.auth =
      requestState.toAuth() ?? signedOutAuthObject({ reason: requestState.reason, message: requestState.message });
    fastifyRequest.clerk = clerkClient;
  };
};
