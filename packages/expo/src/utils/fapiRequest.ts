import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIErrorJSON } from '@clerk/shared/types';

export type FapiPayload<R extends { object: string }> = {
  response?: R;
  errors?: ClerkAPIErrorJSON[];
};

export type FapiResponse<R extends { object: string }> = {
  ok: boolean;
  status: number;
  statusText: string;
  headers?: Headers;
  payload: FapiPayload<R> | null;
};

export async function requestWithSignedOutRetry<R extends { object: string }>(
  request: () => Promise<FapiResponse<R>>,
): Promise<FapiResponse<R>> {
  const response = await request();
  if (
    !response.ok &&
    response.status === 401 &&
    getFapiErrors(response.payload).some(error => error.code === 'signed_out')
  ) {
    // The Expo response hook has already persisted the replacement device token.
    return request();
  }

  return response;
}

export function getResponseJSON<R extends { object: string }, O extends R['object']>(
  payload: FapiPayload<R> | null,
  object: O,
): Extract<R, { object: O }> | null {
  const response = payload?.response;
  return !!response && typeof response === 'object' && isResponseObject(response, object) ? response : null;
}

function isResponseObject<R extends { object: string }, O extends R['object']>(
  response: R,
  object: O,
): response is Extract<R, { object: O }> {
  return response.object === object;
}

export function toClerkAPIResponseError(
  response: FapiResponse<{ object: string }>,
  fallbackMessage: string,
): ClerkAPIResponseError {
  const errors = getFapiErrors(response.payload);
  return new ClerkAPIResponseError(errors[0]?.long_message || response.statusText || fallbackMessage, {
    data: errors,
    status: response.status,
    retryAfter: getRetryAfter(response.headers),
  });
}

function getFapiErrors(payload: FapiPayload<{ object: string }> | null): ClerkAPIErrorJSON[] {
  return payload?.errors ?? [];
}

function getRetryAfter(headers: Headers | undefined): number | undefined {
  const retryAfter = headers?.get('retry-after');
  if (!retryAfter) {
    return undefined;
  }

  const retryAfterSeconds = parseInt(retryAfter, 10);
  return Number.isNaN(retryAfterSeconds) ? undefined : retryAfterSeconds;
}
