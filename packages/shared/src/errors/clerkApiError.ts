import type { ClerkAPIError as ClerkAPIErrorInterface, ClerkAPIErrorJSON } from '@clerk/types';

import { createErrorTypeGuard } from './createErrorTypeGuard';
import { parseError } from './parseError';

export type ClerkApiErrorMeta = Record<string, unknown>;

/**
 * This error contains the specific error message, code, and any additional metadata that was returned by the Clerk API.
 */
export class ClerkAPIError<Meta extends ClerkApiErrorMeta = any> implements ClerkAPIErrorInterface {
  readonly name = 'ClerkApiError';
  readonly code: string;
  readonly message: string;
  readonly longMessage: string | undefined;
  readonly meta: Meta;

  constructor(json: ClerkAPIErrorJSON) {
    const parsedError = parseError(json);
    this.code = parsedError.code;
    this.message = parsedError.message;
    this.longMessage = parsedError.longMessage;
    this.meta = json.meta as Meta;
  }
}

/**
 * Type guard to check if a value is a ClerkApiError instance.
 */
export const isClerkApiError = createErrorTypeGuard(ClerkAPIError);
