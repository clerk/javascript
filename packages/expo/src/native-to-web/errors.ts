/**
 * Why a session transfer failed.
 *
 * The SDK raises `unsupported_platform`, `clerk_not_loaded`, `signed_out`, `invalid_destination`,
 * `missing_dependency`, `browser_unavailable`, `load_failed`, `network_error`, and `unexpected_response`.
 * When Clerk refuses to create the transfer, the code is the first Clerk API error code,
 * such as `feature_not_enabled`. When the web page refuses to redeem it, the code is the
 * `__clerk_error_code` the page redirected with, such as `expired` or `already_used`.
 */
export type SessionTransferErrorCode =
  | 'unsupported_platform'
  | 'clerk_not_loaded'
  | 'signed_out'
  | 'invalid_destination'
  | 'missing_dependency'
  | 'browser_unavailable'
  | 'load_failed'
  | 'network_error'
  | 'unexpected_response'
  | 'feature_not_enabled'
  | 'resource_forbidden'
  | 'invalid_action_for_session'
  | 'user_locked'
  | 'invalid_token'
  | 'expired'
  | 'already_used'
  | 'source_session_invalid'
  | 'impersonation_in_progress'
  | 'other_user_signed_in'
  | 'cross_site_request'
  | (string & {});

/**
 * The error every session transfer API rejects with. Clerk API refusals keep the original
 * `ClerkAPIResponseError` on `cause`, so `status` and `retryAfter` stay available.
 */
export type SessionTransferError = Error & {
  name: 'SessionTransferError';
  code: SessionTransferErrorCode;
  cause?: unknown;
};

/**
 * Returns `true` when `error` came from a session transfer API.
 *
 * @example
 * ### Send a signed-out user to sign in
 * ```ts
 * try {
 *   await openExternalBrowser({ destination: 'https://app.example.com/settings' });
 * } catch (error) {
 *   if (isSessionTransferError(error) && error.code === 'signed_out') {
 *     router.replace('/sign-in');
 *   }
 * }
 * ```
 */
export function isSessionTransferError(error: unknown): error is SessionTransferError {
  return (
    error instanceof Error && error.name === 'SessionTransferError' && 'code' in error && typeof error.code === 'string'
  );
}

export function sessionTransferError(
  code: SessionTransferErrorCode,
  message: string,
  cause?: unknown,
): SessionTransferError {
  const error = Object.assign(new Error(message), { name: 'SessionTransferError' as const, code });
  return cause === undefined ? error : Object.assign(error, { cause });
}

export function toSessionTransferError(error: unknown): SessionTransferError {
  return isSessionTransferError(error)
    ? error
    : sessionTransferError('unexpected_response', 'The session transfer failed unexpectedly.', error);
}
