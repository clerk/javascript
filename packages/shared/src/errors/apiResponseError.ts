import type {
  ClerkAPIError,
  ClerkAPIErrorJSON,
  ClerkAPIResponseError as ClerkAPIResponseErrorInterface,
} from '@clerk/types';

import { parseErrors } from './parseError';

interface ClerkAPIResponseOptions {
  data: ClerkAPIErrorJSON[];
  status: number;
  clerkTraceId?: string;
  retryAfter?: number;
}

/**
 * Interface representing a Clerk API Response Error.
 */
export class ClerkAPIResponseError extends Error implements ClerkAPIResponseErrorInterface {
  clerkError: true;

  status: number;
  message: string;
  clerkTraceId?: string;
  retryAfter?: number;

  errors: ClerkAPIError[];

  constructor(message: string, { data, status, clerkTraceId, retryAfter }: ClerkAPIResponseOptions) {
    super(message);

    Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);

    this.status = status;
    this.message = message;
    this.clerkTraceId = clerkTraceId;
    this.retryAfter = retryAfter;
    this.clerkError = true;
    this.errors = parseErrors(data);
  }

  public toString = () => {
    let message = `[${this.name}]\nMessage:${this.message}\nStatus:${this.status}\nSerialized errors: ${this.errors.map(
      e => JSON.stringify(e),
    )}`;

    if (this.clerkTraceId) {
      message += `\nClerk Trace ID: ${this.clerkTraceId}`;
    }

    return message;
  };
}
