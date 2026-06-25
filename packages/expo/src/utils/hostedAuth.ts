import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON } from '@clerk/shared/types';

import { getClerkInstance } from '../provider/singleton';
import { errorThrower } from './errors';

export type FapiHostedAuthMode = 'sign_in' | 'sign_up';

export type CreateHostedAuthParams = {
  redirectUrl: string;
  codeChallenge: string;
  mode?: FapiHostedAuthMode;
  state?: string;
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

type HostedAuthResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers?: Headers;
  payload: HostedAuthPayload | HostedAuthJSON | null;
};

type FapiClient = {
  request: (requestInit: {
    method: 'POST';
    path: '/client/hosted_auth';
    body: CreateHostedAuthParams;
  }) => Promise<HostedAuthResponse>;
};

type ClerkWithFapiClient = {
  getFapiClient?: () => FapiClient | undefined;
};

export async function createHostedAuth(params: CreateHostedAuthParams, clerk?: unknown): Promise<HostedAuthResource> {
  const fapiClient =
    (clerk as ClerkWithFapiClient | undefined)?.getFapiClient?.() ??
    (getClerkInstance() as ClerkWithFapiClient | undefined)?.getFapiClient?.();
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

function getHostedAuthJSON(payload: HostedAuthResponse['payload']): HostedAuthJSON | null {
  if (!payload) {
    return null;
  }

  if ('response' in payload) {
    return payload.response ?? null;
  }

  return isHostedAuthJSON(payload) ? payload : null;
}

function isHostedAuthJSON(payload: HostedAuthResponse['payload']): payload is HostedAuthJSON {
  return !!payload && 'object' in payload && payload.object === 'hosted_auth';
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
