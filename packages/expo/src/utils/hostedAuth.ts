import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON, ClientJSON, ClientResource } from '@clerk/shared/types';

import { errorThrower } from './errors';

export type FapiHostedAuthMode = 'sign-in' | 'sign-up';

export type CreateHostedAuthParams = {
  redirectUrl: string;
  codeChallenge: string;
  mode?: FapiHostedAuthMode;
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
  const response = await clerk.getFapiClient().request({
    method: 'POST',
    path: '/client/hosted_auth',
    body: params,
  });

  if (!response.ok) {
    await throwHostedAuthAPIResponseError(response, clerk);
  }

  const hostedAuthJSON = getHostedAuthJSON(response.payload);
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

  const clientJSON = getClientJSON(response.payload);
  if (!clientJSON) {
    return errorThrower.throw('Hosted auth completion returned an invalid response.');
  }

  return clientJSON;
}

function getHostedAuthJSON(payload: HostedAuthResponse['payload']): HostedAuthJSON | null {
  if (!payload) {
    return null;
  }

  if (isHostedAuthJSON(payload.response)) {
    return payload.response;
  }

  return null;
}

function isHostedAuthJSON(payload: unknown): payload is HostedAuthJSON {
  return hasObjectType(payload, 'hosted_auth');
}

function getClientJSON(payload: HostedAuthResponse['payload']): ClientJSON | null {
  if (!payload) {
    return null;
  }

  if (isClientJSON(payload.response)) {
    return payload.response;
  }

  return null;
}

function isClientJSON(payload: unknown): payload is ClientJSON {
  return hasObjectType(payload, 'client');
}

function hasObjectType(payload: unknown, object: string): boolean {
  return !!payload && typeof payload === 'object' && (payload as { object?: unknown }).object === object;
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
