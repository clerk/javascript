import type { ClientJSON, ClientResource } from '@clerk/shared/types';

import { errorThrower } from './errors';
import type { FapiResponse } from './fapiRequest';
import { getResponseJSON, requestWithSignedOutRetry, toClerkAPIResponseError } from './fapiRequest';

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

type HostedAuthJSON = {
  object: 'hosted_auth';
  url: string;
};

type HostedAuthResponse = FapiResponse<HostedAuthJSON | ClientJSON>;

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
): Promise<string> {
  const request = () =>
    clerk.getFapiClient().request({
      method: 'POST',
      path: '/client/hosted_auth',
      body: params,
    });

  const response = await requestWithSignedOutRetry(request);
  if (!response.ok) {
    throw toClerkAPIResponseError(response, 'Hosted auth request failed.');
  }

  const hostedAuthJSON = getResponseJSON(response.payload, 'hosted_auth');
  if (!hostedAuthJSON?.url) {
    return errorThrower.throw('Hosted auth creation returned an invalid response.');
  }

  return hostedAuthJSON.url;
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

  throw toClerkAPIResponseError(response, 'Hosted auth request failed.');
}
