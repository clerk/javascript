import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON, ClientJSON, ClientResource } from '@clerk/shared/types';

import { getClerkInstance } from '../provider/singleton';
import { errorThrower } from './errors';

export type FapiHostedAuthMode = 'sign_in' | 'sign_up';

export type CreateHostedAuthParams = {
  redirectUrl: string;
  codeChallenge: string;
  mode?: FapiHostedAuthMode;
  state?: string;
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
  response?: HostedAuthJSON;
  errors?: ClerkAPIErrorJSON[];
};

type ClientPayload = {
  response?: ClientJSON;
  client?: ClientJSON;
  meta?: {
    client?: ClientJSON;
  };
  errors?: ClerkAPIErrorJSON[];
};

type HostedAuthResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers?: Headers;
  payload: HostedAuthPayload | HostedAuthJSON | ClientPayload | ClientJSON | null;
};

type FapiClient = {
  request: (requestInit: {
    method: 'POST';
    path: '/client/hosted_auth' | '/client';
    body: CreateHostedAuthParams | (RedeemHostedAuthParams & { _method: 'GET' });
  }) => Promise<HostedAuthResponse>;
};

type ClerkWithFapiClient = {
  getFapiClient?: () => FapiClient | undefined;
};

export async function createHostedAuth(params: CreateHostedAuthParams, clerk?: unknown): Promise<HostedAuthResource> {
  const fapiClient = getHostedAuthFapiClient(clerk);
  if (!fapiClient) {
    return errorThrower.throw('Hosted auth requires a Clerk instance that can make FAPI requests.');
  }

  const response = await fapiClient.request({
    method: 'POST',
    path: '/client/hosted_auth',
    body: params,
  });

  if (!response.ok) {
    throw buildHostedAuthAPIResponseError(response);
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
  client: ClientResource,
  clerk?: unknown,
): Promise<ClientResource> {
  const fapiClient = getHostedAuthFapiClient(clerk);
  if (!fapiClient) {
    return errorThrower.throw('Hosted auth requires a Clerk instance that can make FAPI requests.');
  }

  const response = await fapiClient.request({
    method: 'POST',
    path: '/client',
    body: {
      _method: 'GET',
      rotatingTokenNonce: params.rotatingTokenNonce,
      codeVerifier: params.codeVerifier,
    },
  });

  if (!response.ok) {
    throw buildHostedAuthAPIResponseError(response);
  }

  const clientJSON = getClientJSON(response.payload);
  if (!clientJSON) {
    return errorThrower.throw('Hosted auth completion returned an invalid response.');
  }

  return applyClientJSON(client, clientJSON);
}

function getHostedAuthFapiClient(clerk?: unknown): FapiClient | undefined {
  return (
    (clerk as ClerkWithFapiClient | undefined)?.getFapiClient?.() ??
    (getClerkInstance() as ClerkWithFapiClient | undefined)?.getFapiClient?.()
  );
}

function getHostedAuthJSON(payload: HostedAuthResponse['payload']): HostedAuthJSON | null {
  if (!payload) {
    return null;
  }

  if ('response' in payload && isHostedAuthJSON(payload.response)) {
    return payload.response;
  }

  return isHostedAuthJSON(payload) ? payload : null;
}

function isHostedAuthJSON(payload: unknown): payload is HostedAuthJSON {
  return hasObjectType(payload, 'hosted_auth');
}

function getClientJSON(payload: HostedAuthResponse['payload']): ClientJSON | null {
  if (!payload) {
    return null;
  }

  if ('response' in payload && isClientJSON(payload.response)) {
    return payload.response;
  }

  if ('client' in payload && isClientJSON(payload.client)) {
    return payload.client;
  }

  if ('meta' in payload && isClientJSON(payload.meta?.client)) {
    return payload.meta.client;
  }

  return isClientJSON(payload) ? payload : null;
}

function isClientJSON(payload: unknown): payload is ClientJSON {
  return hasObjectType(payload, 'client');
}

function hasObjectType(payload: unknown, object: string): boolean {
  return !!payload && typeof payload === 'object' && (payload as { object?: unknown }).object === object;
}

function applyClientJSON(client: ClientResource, clientJSON: ClientJSON): ClientResource {
  // Hosted auth gets the same /client payload as Client.reload(), but the verifier-bound
  // exchange is Expo-specific. Apply it to the existing ClerkJS client instance here
  // instead of adding a hosted-auth branch to every resource reload path.
  const mutableClient = client as ClientResource & {
    fromJSON?: (data: ClientJSON) => ClientResource;
  };
  if (typeof mutableClient.fromJSON !== 'function') {
    return errorThrower.throw('Hosted auth completion could not update the current client.');
  }

  return mutableClient.fromJSON(clientJSON);
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
