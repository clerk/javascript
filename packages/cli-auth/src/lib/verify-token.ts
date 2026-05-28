import { ClerkCliAuthError } from '../errors';
import type { Identity } from '../types';
import { request } from './http';

export interface VerifyTokenParams {
  endpoint: string;
  token: string;
  timeoutMs?: number;
}

/**
 * POST a credential (API key, machine token, or OAuth access token) to a consumer-hosted
 * `identityEndpoint` and return the verified `Identity`. The endpoint is responsible for
 * verifying the credential server-side.
 */
export async function verifyToken(params: VerifyTokenParams): Promise<Identity> {
  const { body: parsed } = await request(params.endpoint, {
    headers: { Authorization: `Bearer ${params.token}` },
    errorCode: 'verify_api_key',
    timeoutMs: params.timeoutMs,
  });

  if (!parsed || typeof parsed !== 'object') {
    throw new ClerkCliAuthError('verify_api_key', 'Identity endpoint response was not a JSON object.');
  }

  const identity = parsed as Identity;
  if (typeof identity.sub !== 'string' || !identity.sub) {
    throw new ClerkCliAuthError('verify_api_key', 'Identity endpoint response did not include sub.');
  }

  return identity;
}
