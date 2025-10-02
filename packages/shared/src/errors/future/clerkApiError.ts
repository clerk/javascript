/* eslint-disable jsdoc/require-jsdoc */
import type { ClerkAPIErrorJSON, ClerkApiErrorResponseJSON } from '@clerk/types';

import { parseError } from '../parseError';
import { ClerkError } from './future';

/**
 * A ClerkError subclass that represents the shell response of a Clerk API error.
 * This error contains an array of ClerkApiError instances, each representing a specific error that occurred.
 */
export class ClerkApiResponseError extends ClerkError {
  readonly name = 'ClerkApiResponseError';
  readonly retryAfter?: number;
  readonly errors: ClerkApiError[];

  constructor(data: ClerkApiErrorResponseJSON) {
    const errorMesages = data.errors.map(e => e.message).join(', ');
    const message = `Api errors occurred: ${errorMesages}. Check the \`errors\` property for more details about the specific errors.`;
    super({ message, code: 'clerk_api_error', clerkTraceId: data.clerk_trace_id });
    this.errors = data.errors.map(e => new ClerkApiError(e));
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

/**
 * This error contains the specific error message, code, and any additional metadata that was returned by the Clerk API.
 */
export class ClerkApiError extends ClerkError {
  readonly name = 'ClerkApiError';

  constructor(json: ClerkAPIErrorJSON) {
    const parsedError = parseError(json);
    super({
      code: parsedError.code,
      message: parsedError.message,
      longMessage: parsedError.longMessage,
    });
  }
}

/**
 * Type guard to check if a value is a ClerkApiError instance.
 */
export function isClerkApiError(error: Error): error is ClerkApiError {
  return error instanceof ClerkApiError;
}
