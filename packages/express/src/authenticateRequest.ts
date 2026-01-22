import { Readable } from 'stream';

import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, createClerkRequest } from '@clerk/backend/internal';
import { clerkFrontendApiProxy, DEFAULT_PROXY_PATH } from '@clerk/backend/proxy';
import { deprecated } from '@clerk/shared/deprecated';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative, isValidProxyUrl } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';
import type { RequestHandler, Response } from 'express';

import { clerkClient as defaultClerkClient } from './clerkClient';
import { satelliteAndMissingProxyUrlAndDomain, satelliteAndMissingSignInUrl } from './errors';
import type { AuthenticateRequestParams, ClerkMiddlewareOptions, ExpressRequestWithAuth } from './types';
import { incomingMessageToRequest, loadApiEnv, loadClientEnv, requestToProxyRequest } from './utils';

/**
 * @internal
 * Authenticates an Express request by wrapping clerkClient.authenticateRequest and
 * converts the express request object into a standard web request object
 *
 * @param opts - Configuration options for request authentication
 * @param opts.clerkClient - The Clerk client instance to use for authentication
 * @param opts.request - The Express request object to authenticate
 * @param opts.options - Optional middleware configuration options
 */
export const authenticateRequest = (opts: AuthenticateRequestParams) => {
  const { clerkClient, request, options } = opts;
  const { jwtKey, authorizedParties, audience, acceptsToken } = options || {};

  const clerkRequest = createClerkRequest(incomingMessageToRequest(request));
  const env = { ...loadApiEnv(), ...loadClientEnv() };

  const secretKey = options?.secretKey || env.secretKey;
  const machineSecretKey = options?.machineSecretKey || env.machineSecretKey;
  const publishableKey = options?.publishableKey || env.publishableKey;

  const isSatellite = handleValueOrFn(options?.isSatellite, clerkRequest.clerkUrl, env.isSatellite);
  const domain = handleValueOrFn(options?.domain, clerkRequest.clerkUrl) || env.domain;
  const signInUrl = options?.signInUrl || env.signInUrl;
  const proxyUrl = absoluteProxyUrl(
    handleValueOrFn(options?.proxyUrl, clerkRequest.clerkUrl, env.proxyUrl),
    clerkRequest.clerkUrl.toString(),
  );

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(satelliteAndMissingProxyUrlAndDomain);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey || '')) {
    throw new Error(satelliteAndMissingSignInUrl);
  }

  return clerkClient.authenticateRequest(clerkRequest, {
    audience,
    secretKey,
    machineSecretKey,
    publishableKey,
    jwtKey,
    authorizedParties,
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
    acceptsToken,
  });
};

const setResponseHeaders = (requestState: RequestState, res: Response): Error | undefined => {
  if (requestState.headers) {
    requestState.headers.forEach((value, key) => res.appendHeader(key, value));
  }
  return setResponseForHandshake(requestState, res);
};

/**
 * Depending on the auth state of the request, handles applying redirects and validating that a handshake state was properly handled.
 *
 * Returns an error if state is handshake without a redirect, otherwise returns undefined. res.writableEnded should be checked after this method is called.
 */
const setResponseForHandshake = (requestState: RequestState, res: Response): Error | undefined => {
  const hasLocationHeader = requestState.headers.get('location');
  if (hasLocationHeader) {
    // triggering a handshake redirect
    res.status(307).end();
    return;
  }

  if (requestState.status === AuthStatus.Handshake) {
    return new Error('Clerk: unexpected handshake without redirect');
  }

  return;
};

const absoluteProxyUrl = (relativeOrAbsoluteUrl: string, baseUrl: string): string => {
  if (!relativeOrAbsoluteUrl || !isValidProxyUrl(relativeOrAbsoluteUrl) || !isProxyUrlRelative(relativeOrAbsoluteUrl)) {
    return relativeOrAbsoluteUrl;
  }
  return new URL(relativeOrAbsoluteUrl, baseUrl).toString();
};

export const authenticateAndDecorateRequest = (options: ClerkMiddlewareOptions = {}): RequestHandler => {
  const clerkClient = options.clerkClient || defaultClerkClient;
  const enableHandshake = options.enableHandshake ?? true;

  // Extract proxy configuration with defaults
  const frontendApiProxy = options.frontendApiProxy;
  const proxyEnabled = frontendApiProxy?.enabled ?? true;
  const proxyPath = frontendApiProxy?.path ?? DEFAULT_PROXY_PATH;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const middleware: RequestHandler = async (request, response, next) => {
    if ((request as ExpressRequestWithAuth).auth) {
      return next();
    }

    const env = { ...loadApiEnv(), ...loadClientEnv() };
    const publishableKey = options.publishableKey || env.publishableKey;
    const secretKey = options.secretKey || env.secretKey;

    // Handle Frontend API proxy requests early, before authentication
    if (frontendApiProxy && proxyEnabled) {
      const requestPath = request.originalUrl || request.url;
      if (requestPath.startsWith(proxyPath)) {
        // Convert Express request to Fetch API Request
        const proxyRequest = requestToProxyRequest(request);

        // Call the core proxy function
        const proxyResponse = await clerkFrontendApiProxy(proxyRequest, {
          proxyPath,
          publishableKey,
          secretKey,
        });

        // Send the proxy response back to the client
        response.status(proxyResponse.status);
        proxyResponse.headers.forEach((value, key) => {
          response.setHeader(key, value);
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
          stream.pipe(response);
        } else {
          response.end();
        }
        return;
      }
    }

    // Auto-derive proxyUrl from frontendApiProxy config if not explicitly set
    let resolvedOptions = options;
    if (frontendApiProxy && proxyEnabled && !options.proxyUrl) {
      const protocol = request.secure || request.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const host = request.headers['x-forwarded-host'] || request.headers.host || 'localhost';
      const derivedProxyUrl = `${protocol}://${host}${proxyPath}`;
      resolvedOptions = { ...options, proxyUrl: derivedProxyUrl };
    }

    try {
      const requestState = await authenticateRequest({
        clerkClient,
        request,
        options: resolvedOptions,
      });

      if (enableHandshake) {
        const err = setResponseHeaders(requestState, response);
        if (err) {
          return next(err);
        }
        if (response.writableEnded) {
          return;
        }
      }

      // TODO: For developers coming from the clerk-sdk-node package, we gave them examples
      // to use `req.auth` without calling it as a function. We need to keep this for backwards compatibility.
      const authHandler = (opts: Parameters<typeof requestState.toAuth>[0]) => requestState.toAuth(opts);
      const authObject = requestState.toAuth();

      const auth = new Proxy(authHandler, {
        get(target, prop, receiver) {
          deprecated('req.auth', 'Use `req.auth()` as a function instead.');
          // If the property exists on the function, return it
          if (prop in target) {
            return Reflect.get(target, prop, receiver);
          }
          // Otherwise, get it from the authObject
          return authObject?.[prop as keyof typeof authObject];
        },
      });

      Object.assign(request, { auth });

      next();
    } catch (err) {
      next(err);
    }
  };

  return middleware;
};
