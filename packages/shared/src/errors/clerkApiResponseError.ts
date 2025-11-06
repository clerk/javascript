import type { ClerkAPIErrorJSON, ClerkAPIResponseError as ClerkAPIResponseErrorInterface } from '../types';
import { ClerkAPIError } from './clerkApiError';
import type { ClerkErrorParams } from './clerkError';
import { ClerkError } from './clerkError';
import { createErrorTypeGuard } from './createErrorTypeGuard';

interface ClerkAPIResponseOptions extends Omit<ClerkErrorParams, 'message' | 'code'> {
  data: ClerkAPIErrorJSON[];
  status: number;
  clerkTraceId?: string;
  retryAfter?: number;
}

export class ClerkAPIResponseError extends ClerkError implements ClerkAPIResponseErrorInterface {
  static kind = 'ClerkAPIResponseError';
  status: number;
  clerkTraceId?: string;
  retryAfter?: number;
  errors: ClerkAPIError[];

  constructor(message: string, options: ClerkAPIResponseOptions) {
    const { data: errorsJson, status, clerkTraceId, retryAfter } = options;
    super({ ...options, message, code: 'api_response_error' });
    Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);
    this.status = status;
    this.clerkTraceId = clerkTraceId;
    this.retryAfter = retryAfter;
    this.errors = (errorsJson || []).map(e => new ClerkAPIError(e));
  }

  public toString() {
    let message = `[${this.name}]\nMessage:${this.message}\nStatus:${this.status}\nSerialized errors: ${this.errors.map(
      e => JSON.stringify(e),
    )}`;

    if (this.clerkTraceId) {
      message += `\nClerk Trace ID: ${this.clerkTraceId}`;
    }

    return message;
  }

  // Override formatMessage to keep it unformatted for backward compatibility
  protected static override formatMessage(name: string, msg: string, _: string, __: string | undefined) {
    return msg;
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
export const isClerkApiResponseError = createErrorTypeGuard(ClerkAPIResponseError);
