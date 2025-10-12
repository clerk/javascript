/* eslint-disable jsdoc/require-jsdoc */
import type { ClerkApiErrorResponseJSON } from '@clerk/types';

import { ClerkApiError } from './clerkApiError';
import { ClerkError } from './clerkError';

type ClerkApiResponseErrorParams = ClerkApiErrorResponseJSON & {
  retryAfter?: number;
};

/**
 * A ClerkError subclass that represents the shell response of a Clerk API error.
 * This error contains an array of ClerkApiError instances, each representing a specific error that occurred.
 */
export class ClerkApiResponseError<E extends ClerkApiError = ClerkApiError> extends ClerkError {
  readonly name = 'ClerkApiResponseError';
  readonly retryAfter?: number;
  readonly errors: E[];
  readonly clerkTraceId: string | undefined;

  constructor(data: ClerkApiResponseErrorParams) {
    const errorMesages = data.errors.map(e => e.message).join(', ');
    const message = `Api errors occurred: ${errorMesages}. Check the \`errors\` property for more details about the specific errors.`;
    super({ message, code: 'clerk_api_error' });
    this.errors = data.errors.map(e => new ClerkApiError(e)) as E[];
    this.clerkTraceId = data.clerk_trace_id;
    this.retryAfter = data.retryAfter;
  }
}

/**
 * Type guard to check if an error is a ClerkApiResponseError.
 * Can be called as a standalone function or as a method on an error object.
 *
 * @example
 * // As a standalone function
 * if (isClerkApiResponseError(error)) { ... }
 *
 * // As a method (when attached to error object)
 * if (error.isClerkApiResponseError()) { ... }
 */
export function isClerkApiResponseError(error: Error): error is ClerkApiResponseError;
export function isClerkApiResponseError(this: Error): this is ClerkApiResponseError;
export function isClerkApiResponseError(this: Error | void, error?: Error): error is ClerkApiResponseError {
  const target = error ?? this;
  if (!target) {
    throw new TypeError('isClerkApiResponseError requires an error object');
  }
  return target instanceof ClerkApiResponseError;
}
