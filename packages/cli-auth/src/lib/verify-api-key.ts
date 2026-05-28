import { ClerkCliAuthError } from '../errors';
import type { UserInfo } from '../types';
import { request } from './http';

export interface VerifyApiKeyParams {
  endpoint: string;
  apiKey: string;
  timeoutMs?: number;
}

export async function verifyApiKey(params: VerifyApiKeyParams): Promise<UserInfo> {
  const { body: parsed } = await request(params.endpoint, {
    headers: { Authorization: `Bearer ${params.apiKey}` },
    errorCode: 'verify_api_key',
    timeoutMs: params.timeoutMs,
  });

  if (!parsed || typeof parsed !== 'object') {
    throw new ClerkCliAuthError('verify_api_key', 'API key verification response was not a JSON object.');
  }

  const user = parsed as UserInfo;
  if (typeof user.sub !== 'string' || user.sub.length === 0) {
    throw new ClerkCliAuthError('verify_api_key', 'API key verification response did not include sub.');
  }

  return user;
}
