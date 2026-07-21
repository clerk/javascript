import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON, ClientJSON, ClientResource } from '@clerk/shared/types';

import { errorThrower } from './errors';

/**
 * Controls which Account Portal auth screen opens for hosted auth.
 */
export type HostedAuthMode = 'sign-in' | 'sign-up';

export type CreateHostedAuthParams = {
  redirectUrl: string;
  codeChallenge: string;
  mode?: HostedAuthMode;
  state: string;
};

export type RedeemHostedAuthParams = {
  rotatingTokenNonce: string;
  codeVerifier: string;
};

export type HostedAuthResource = {
  url: string;
};

type HostedAuthJSON = {
  object: 'hosted_auth';
  url: string;
};

type HostedAuthPayload = {
  response?: HostedAuthJSON | ClientJSON;
  errors?: ClerkAPIErrorJSON[];
};

type HostedAuthResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers?: Headers;
  payload: HostedAuthPayload | null;
};

type FapiClient = {
  request: (requestInit: {
    method: 'POST';
    path: '/client/hosted_auth' | '/client';
    body: CreateHostedAuthParams | (RedeemHostedAuthParams & { _method: 'GET' });
  }) => Promise<HostedAuthResponse>;
};

export type HostedAuthClerkInstance = {
  getFapiClient: () => FapiClient;
  handleUnauthenticated?: () => Promise<unknown>;
};

export async function createHostedAuth(
  params: CreateHostedAuthParams,
  clerk: HostedAuthClerkInstance,
): Promise<HostedAuthResource> {
  const request = () =>
    clerk.getFapiClient().request({
      method: 'POST',
      path: '/client/hosted_auth',
      body: params,
    });

  let response = await request();
  if (
    !response.ok &&
    response.status === 401 &&
    getHostedAuthErrors(response.payload).some(error => error.code === 'signed_out')
  ) {
    // The Expo response hook has already persisted the replacement device token.
    response = await request();
  }

  if (!response.ok) {
    throw buildHostedAuthAPIResponseError(response);
  }

  const hostedAuthJSON = getResponseJSON(response.payload, 'hosted_auth');
  if (!hostedAuthJSON?.url) {
    return errorThrower.throw('Hosted auth creation returned an invalid response.');
  }

  return {
    url: hostedAuthJSON.url,
  };
}

export async function redeemHostedAuth(
  params: RedeemHostedAuthParams,
  clerk: HostedAuthClerkInstance,
): Promise<ClientJSON> {
  const response = await clerk.getFapiClient().request({
    method: 'POST',
    path: '/client',
    body: {
      _method: 'GET',
      rotatingTokenNonce: params.rotatingTokenNonce,
      codeVerifier: params.codeVerifier,
    },
  });

  if (!response.ok) {
    await throwHostedAuthAPIResponseError(response, clerk);
  }

  const clientJSON = getResponseJSON(response.payload, 'client');
  if (!clientJSON) {
    return errorThrower.throw('Hosted auth completion returned an invalid response.');
  }

  return clientJSON;
}

function getResponseJSON(payload: HostedAuthResponse['payload'], object: 'hosted_auth'): HostedAuthJSON | null;
function getResponseJSON(payload: HostedAuthResponse['payload'], object: 'client'): ClientJSON | null;
function getResponseJSON(payload: HostedAuthResponse['payload'], object: string): HostedAuthJSON | ClientJSON | null {
  const response = payload?.response;
  return !!response && typeof response === 'object' && response.object === object ? response : null;
}

export function applyHostedAuthClientJSON(client: ClientResource, clientJSON: ClientJSON): ClientResource {
  // Hosted auth gets the same /client payload as Client.reload(), but its verifier-bound
  // exchange uses a request body. Apply it to the existing ClerkJS client instance here
  // instead of adding a hosted-auth branch to every resource reload path.
  const mutableClient = client as ClientResource & {
    fromJSON?: (data: ClientJSON) => ClientResource;
  };
  if (typeof mutableClient.fromJSON !== 'function') {
    return errorThrower.throw('Hosted auth completion could not update the current client.');
  }

  return mutableClient.fromJSON(clientJSON);
}

// Redemption only: creation handles its own 401s via the signed_out retry above.
async function throwHostedAuthAPIResponseError(
  response: HostedAuthResponse,
  clerk: HostedAuthClerkInstance,
): Promise<never> {
  if (response.status === 401) {
    await clerk.handleUnauthenticated?.();
  }

  throw buildHostedAuthAPIResponseError(response);
}

function buildHostedAuthAPIResponseError(response: HostedAuthResponse) {
  const errors = getHostedAuthErrors(response.payload);
  return new ClerkAPIResponseError(errors[0]?.long_message || response.statusText || 'Hosted auth request failed.', {
    data: errors,
    status: response.status,
    retryAfter: getRetryAfter(response.headers),
  });
}

function getHostedAuthErrors(payload: HostedAuthResponse['payload']): ClerkAPIErrorJSON[] {
  if (!payload || !('errors' in payload)) {
    return [];
  }

  return payload.errors ?? [];
}

function getRetryAfter(headers: Headers | undefined): number | undefined {
  const retryAfter = headers?.get('retry-after');
  if (!retryAfter) {
    return undefined;
  }

  const retryAfterSeconds = parseInt(retryAfter, 10);
  return Number.isNaN(retryAfterSeconds) ? undefined : retryAfterSeconds;
}
