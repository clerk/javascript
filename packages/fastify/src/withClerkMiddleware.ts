import { createIsomorphicRequest } from '@clerk/backend';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { clerkClient } from './clerkClient';
import * as constants from './constants';
import type { ClerkFastifyOptions } from './types';
import { getSingleValueFromArrayHeader } from './utils';

const DUMMY_URL_BASE = 'http://clerk-dummy';

export const withClerkMiddleware = (options: ClerkFastifyOptions) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const secretKey = options.secretKey || constants.SECRET_KEY;
    const publishableKey = options.publishableKey || constants.PUBLISHABLE_KEY;

    const requestState = await clerkClient.authenticateRequest({
      ...options,
      secretKey,
      publishableKey,
      apiKey: constants.API_KEY,
      frontendApi: constants.FRONTEND_API,
      request: createIsomorphicRequest((Request, Headers) => {
        const requestHeaders = Object.keys(req.headers).reduce(
          (acc, key) => Object.assign(acc, { [key]: req?.headers[key] }),
          {},
        );
        const headers = new Headers(requestHeaders);
        const forwardedHostHeader = getSingleValueFromArrayHeader(
          headers?.get(constants.Headers.ForwardedHost) || undefined,
        );
        if (forwardedHostHeader) {
          headers.set(constants.Headers.ForwardedHost, forwardedHostHeader);
        }
        const forwardedPortHeader = getSingleValueFromArrayHeader(
          headers?.get(constants.Headers.ForwardedPort) || undefined,
        );
        if (forwardedPortHeader) {
          headers.set(constants.Headers.ForwardedPort, forwardedPortHeader);
        }
        const reqUrl = isRelativeUrl(req.url) ? getAbsoluteUrlFromHeaders(req.url, headers) : req.url;
        return new Request(reqUrl, {
          method: req.method,
          headers,
        });
      }),
    });

    // Interstitial cases
    if (requestState.isUnknown) {
      return reply
        .code(401)
        .header(constants.Headers.AuthReason, requestState.reason)
        .header(constants.Headers.AuthMessage, requestState.message)
        .send();
    }

    if (requestState.isInterstitial) {
      const interstitialHtmlPage = clerkClient.localInterstitial({
        publishableKey,
        frontendApi: constants.FRONTEND_API,
      });

      return reply
        .code(401)
        .header(constants.Headers.AuthReason, requestState.reason)
        .header(constants.Headers.AuthMessage, requestState.message)
        .type('text/html')
        .send(interstitialHtmlPage);
    }

    // @ts-ignore
    req.auth = requestState.toAuth();
  };
};

// TODO: Move the utils below to shared package
// Creating a Request object requires a valid absolute URL
// Fastify's req.url is relative, so we need to construct an absolute URL
const getAbsoluteUrlFromHeaders = (url: string, headers: Headers): URL => {
  const forwardedProto = headers.get(constants.Headers.ForwardedProto);
  const forwardedPort = headers.get(constants.Headers.ForwardedPort);
  const forwardedHost = headers.get(constants.Headers.ForwardedHost);

  const fwdProto = getFirstValueFromHeaderValue(forwardedProto);
  let fwdPort = getFirstValueFromHeaderValue(forwardedPort);

  // If forwardedPort mismatch with forwardedProto determine forwardedPort
  // from forwardedProto as fallback (if exists)
  // This check fixes the Railway App issue
  const fwdProtoHasMoreValuesThanFwdPorts =
    (forwardedProto || '').split(',').length > (forwardedPort || '').split(',').length;
  if (fwdProto && fwdProtoHasMoreValuesThanFwdPorts) {
    fwdPort = getPortFromProtocol(fwdProto);
  }

  try {
    return new URL(url, `${fwdProto}://${forwardedHost}${fwdPort ? ':' + fwdPort : ''}`);
  } catch (e) {
    return new URL(url, DUMMY_URL_BASE);
  }
};

const PROTOCOL_TO_PORT_MAPPING: Record<string, string> = {
  http: '80',
  https: '443',
} as const;

function getPortFromProtocol(protocol: string) {
  return PROTOCOL_TO_PORT_MAPPING[protocol];
}

function getFirstValueFromHeaderValue(value?: string | null) {
  return value?.split(',')[0]?.trim() || '';
}

const isRelativeUrl = (url: string) => {
  const u = new URL(url, DUMMY_URL_BASE);
  return u.origin === DUMMY_URL_BASE;
};
