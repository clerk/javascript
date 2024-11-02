import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, createClerkRequest } from '@clerk/backend/internal';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative, isValidProxyUrl } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';
import type { RequestHandler, Response } from 'express';
import type { IncomingMessage } from 'http';

import { clerkClient as defaultClerkClient } from './clerkClient';
import { satelliteAndMissingProxyUrlAndDomain, satelliteAndMissingSignInUrl } from './errors';
import type { AuthenticateRequestParams, ClerkMiddlewareOptions, ExpressRequestWithAuth } from './types';
import { loadApiEnv, loadClientEnv } from './utils';

export const authenticateRequest = (opts: AuthenticateRequestParams) => {
  const { clerkClient, request, options } = opts;
  const { jwtKey, authorizedParties, audience } = options || {};

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
  });
};

const incomingMessageToRequest = (req: IncomingMessage): Request => {
  const headers = Object.keys(req.headers).reduce((acc, key) => Object.assign(acc, { [key]: req?.headers[key] }), {});
  // @ts-ignore Optimistic attempt to get the protocol in case
  // req extends IncomingMessage in a useful way. No guarantee
  // it'll work.
  const protocol = req.connection?.encrypted ? 'https' : 'http';
  const dummyOriginReqUrl = new URL(req.url || '', `${protocol}://clerk-dummy`);
  return new Request(dummyOriginReqUrl, {
    method: req.method,
    headers: new Headers(headers),
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

export const authenticateAndDecorateRequest = (options: ClerkMiddlewareOptions = {}) => {
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

      const auth = requestState.toAuth();
      Object.assign(request, { auth });

      next();
    } catch (err) {
      next(err);
    }
  };

  return middleware;
};
