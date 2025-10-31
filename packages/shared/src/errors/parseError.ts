import type { ClerkAPIError as ClerkAPIErrorInterface, ClerkAPIErrorJSON } from '../types';
import { ClerkAPIError } from './clerkApiError';

/**
 * Parses an array of ClerkAPIErrorJSON objects into an array of ClerkAPIError objects.
 *
 * @internal
 */
export function parseErrors(data: ClerkAPIErrorJSON[] = []): ClerkAPIErrorInterface[] {
  return data.length > 0 ? data.map(e => new ClerkAPIError(e)) : [];
}

/**
 * Parses a ClerkAPIErrorJSON object into a ClerkAPIError object.
 *
 * @deprecated Use `ClerkAPIError` class instead
 *
 * @internal
 */
export function parseError(error: ClerkAPIErrorJSON): ClerkAPIErrorInterface {
  return new ClerkAPIError(error);
}

/**
 * Converts a ClerkAPIError object into a ClerkAPIErrorJSON object.
 *
 * @internal
 */
export function errorToJSON(error: ClerkAPIError | null): ClerkAPIErrorJSON {
  return {
    code: error?.code || '',
    message: error?.message || '',
    long_message: error?.longMessage,
    meta: {
      param_name: error?.meta?.paramName,
      session_id: error?.meta?.sessionId,
      email_addresses: error?.meta?.emailAddresses,
      identifiers: error?.meta?.identifiers,
      zxcvbn: error?.meta?.zxcvbn,
      plan: error?.meta?.plan,
      is_plan_upgrade_possible: error?.meta?.isPlanUpgradePossible,
    },
  };
}
