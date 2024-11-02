import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus, createClerkRequest } from '@clerk/backend/internal';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative, isValidProxyUrl } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';
import type { Response } from 'express';
import type { IncomingMessage } from 'http';

import type { AuthenticateRequestParams } from './types';
import { loadApiEnv, loadClientEnv } from './utils';

export const authenticateRequest = (opts: AuthenticateRequestParams) => {
  const { clerkClient, secretKey, publishableKey, req: incomingMessage, options } = opts;
  const { jwtKey, authorizedParties, audience } = options || {};

  const clerkRequest = createClerkRequest(incomingMessageToRequest(incomingMessage));
  const env = { ...loadApiEnv(), ...loadClientEnv() };
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
  let dummyOriginReqUrl: URL;

  try {
    dummyOriginReqUrl = new URL(req.url || '', `${protocol}://clerk-dummy`);
  } catch (e) {
    throw new Error(`Invalid request URL: ${req.url}`);
  }

  return new Request(dummyOriginReqUrl, {
    method: req.method,
    headers: new Headers(headers),
  });
};

export const setResponseHeaders = (requestState: RequestState, res: Response): Error | undefined => {
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

const satelliteAndMissingProxyUrlAndDomain =
  'Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl';
const satelliteAndMissingSignInUrl = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL.`;
