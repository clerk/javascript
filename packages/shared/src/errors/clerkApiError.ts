import type { ClerkAPIError as ClerkAPIErrorInterface, ClerkAPIErrorJSON } from '../types';
import { createErrorTypeGuard } from './createErrorTypeGuard';

export type ClerkAPIErrorMeta = Record<string, unknown>;

/**
 * This error contains the specific error message, code, and any additional metadata that was returned by the Clerk API.
 */
export class ClerkAPIError<Meta extends ClerkAPIErrorMeta = any> implements ClerkAPIErrorInterface {
  static kind = 'ClerkAPIError';
  readonly code: string;
  readonly message: string;
  readonly longMessage: string | undefined;
  readonly meta: Meta;

  constructor(json: ClerkAPIErrorJSON) {
    const parsedError = {
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
    this.code = parsedError.code;
    this.message = parsedError.message;
    this.longMessage = parsedError.longMessage;
    this.meta = parsedError.meta;
  }
}

/**
 * Type guard to check if a value is a ClerkAPIError instance.
 */
export const isClerkAPIError = createErrorTypeGuard(ClerkAPIError);
