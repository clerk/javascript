import type { ClerkAPIError as ClerkAPIErrorInterface, ClerkAPIErrorJSON } from '../types';
import { createErrorTypeGuard } from './createErrorTypeGuard';

export type ClerkApiErrorMeta = Record<string, unknown>;

/**
 * This error contains the specific error message, code, and any additional metadata that was returned by the Clerk API.
 */
export class ClerkAPIError<Meta extends ClerkApiErrorMeta = any> implements ClerkAPIErrorInterface {
  static kind = 'ClerkApiError';
  readonly code: string;
  readonly message: string;
  readonly longMessage: string | undefined;
  readonly meta: Meta;

  constructor(json: ClerkAPIErrorJSON) {
    const parsedError = this.parseJsonError(json);
    this.code = parsedError.code;
    this.message = parsedError.message;
    this.longMessage = parsedError.longMessage;
    this.meta = parsedError.meta;
  }

  private parseJsonError(json: ClerkAPIErrorJSON) {
    return {
      code: json.code,
      message: json.message,
      longMessage: json.long_message,
      meta: {
        paramName: json.meta?.param_name,
        sessionId: json.meta?.session_id,
        emailAddresses: json.meta?.email_addresses,
        identifiers: json.meta?.identifiers,
        zxcvbn: json.meta?.zxcvbn,
        plan: json.meta?.plan,
        isPlanUpgradePossible: json.meta?.is_plan_upgrade_possible,
      } as unknown as Meta,
    };
  }
}

/**
 * Type guard to check if a value is a ClerkApiError instance.
 */
export const isClerkApiError = createErrorTypeGuard(ClerkAPIError);
