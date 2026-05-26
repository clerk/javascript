import { ClerkCliAuthError } from '../errors';
import type { UserInfo } from '../types';

export interface VerifyApiKeyParams {
  endpoint: string;
  apiKey: string;
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function messageFromBody(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    for (const key of ['error_description', 'message', 'error']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }
  return fallback;
}

export async function verifyApiKey(params: VerifyApiKeyParams): Promise<UserInfo> {
  let response: Response;
  try {
    response = await fetch(params.endpoint, {
      headers: { Authorization: `Bearer ${params.apiKey}` },
    });
  } catch (error) {
    throw new ClerkCliAuthError('verify_api_key', `API key verification request failed: ${(error as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = await parseBody(response);
  } catch (error) {
    throw new ClerkCliAuthError(
      'verify_api_key',
      `API key verification response could not be parsed: ${(error as Error).message}`,
    );
  }

  if (!response.ok) {
    throw new ClerkCliAuthError(
      'verify_api_key',
      messageFromBody(parsed, `API key verification failed with HTTP ${response.status}.`),
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new ClerkCliAuthError('verify_api_key', 'API key verification response was not a JSON object.');
  }

  const user = parsed as UserInfo;
  if (typeof user.sub !== 'string' || user.sub.length === 0) {
    throw new ClerkCliAuthError('verify_api_key', 'API key verification response did not include sub.');
  }

  return user;
}
