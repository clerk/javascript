import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, createClerkRequest } from '@clerk/backend/internal';
import { deprecated } from '@clerk/shared/deprecated';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative, isValidProxyUrl } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';
import type { RequestHandler, Response } from 'express';

import { clerkClient as defaultClerkClient } from './clerkClient';
import { satelliteAndMissingProxyUrlAndDomain, satelliteAndMissingSignInUrl } from './errors';
import type { AuthenticateRequestParams, ClerkMiddlewareOptions, ExpressRequestWithAuth } from './types';
import { incomingMessageToRequest, loadApiEnv, loadClientEnv } from './utils';

export const authenticateRequest = (opts: AuthenticateRequestParams) => {
  const { clerkClient, request, options } = opts;
  const { jwtKey, authorizedParties, audience, acceptsToken } = options || {};

  const clerkRequest = createClerkRequest(incomingMessageToRequest(request));
  const env = { ...loadApiEnv(), ...loadClientEnv() };

  const secretKey = options?.secretKey || env.secretKey;
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

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const middleware: RequestHandler = async (request, response, next) => {
    if ((request as ExpressRequestWithAuth).auth) {
      return next();
    }

    try {
      const requestState = await authenticateRequest({
        clerkClient,
        request,
        options,
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
          if (prop in target) return Reflect.get(target, prop, receiver);
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
