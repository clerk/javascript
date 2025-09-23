import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';

/**
 * Parses an array of ClerkAPIErrorJSON objects into an array of ClerkAPIError objects.
 *
 * @internal
 */
export function parseErrors(data: ClerkAPIErrorJSON[] = []): ClerkAPIError[] {
  return data.length > 0 ? data.map(parseError) : [];
}

/**
 * Parses a ClerkAPIErrorJSON object into a ClerkAPIError object.
 *
 * @internal
 */
export function parseError(error: ClerkAPIErrorJSON): ClerkAPIError {
  return {
    code: error.code,
    message: error.message,
    longMessage: error.long_message,
    meta: {
      paramName: error?.meta?.param_name,
      sessionId: error?.meta?.session_id,
      emailAddresses: error?.meta?.email_addresses,
      identifiers: error?.meta?.identifiers,
      zxcvbn: error?.meta?.zxcvbn,
      plan: error?.meta?.plan,
      isPlanUpgradePossible: error?.meta?.is_plan_upgrade_possible,
    },
  };
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
