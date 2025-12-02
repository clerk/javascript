import type { ClerkAPIResponseError } from './clerkApiResponseError';
import type { ClerkRuntimeError } from './clerkRuntimeError';
import type { EmailLinkError } from './emailLinkError';
import type { MetamaskError } from './metamaskError';

/**
 * Checks if the provided error object is an unauthorized error.
 *
 * @internal
 *
 * @deprecated This is no longer used, and will be removed in the next major version.
 */
export function isUnauthorizedError(e: any): boolean {
  const status = e?.status;
  const code = e?.errors?.[0]?.code;
  return code === 'authentication_invalid' && status === 401;
}

/**
 * Checks if the provided error object is a captcha error.
 *
 * @internal
 */
export function isCaptchaError(e: ClerkAPIResponseError): boolean {
  return ['captcha_invalid', 'captcha_not_enabled', 'captcha_missing_token'].includes(e.errors[0].code);
}

/**
 * Checks if the provided error is a 4xx error.
 *
 * @internal
 */
export function is4xxError(e: any): boolean {
  const status = e?.status;
  return !!status && status >= 400 && status < 500;
}

/**
 * Checks if the provided error is a network error.
 *
 * @internal
 */
export function isNetworkError(e: any): boolean {
  // TODO: revise during error handling epic
  const message = (`${e.message}${e.name}` || '').toLowerCase().replace(/\s+/g, '');
  return message.includes('networkerror');
}

/**
 * Checks if the provided error is either a ClerkAPIResponseError, a ClerkRuntimeError, or a MetamaskError.
 *
 * @internal
 */
export function isKnownError(error: any): error is ClerkAPIResponseError | ClerkRuntimeError | MetamaskError {
  return isClerkAPIResponseError(error) || isMetamaskError(error) || isClerkRuntimeError(error);
}

/**
 * Checks if the provided error is a ClerkAPIResponseError.
 *
 * @internal
 */
export function isClerkAPIResponseError(err: any): err is ClerkAPIResponseError {
  return err && 'clerkError' in err;
}

/**
 * Checks if the provided error object is an instance of ClerkRuntimeError.
 *
 * @param err - The error object to check.
 * @returns True if the error is a ClerkRuntimeError, false otherwise.
 *
 * @example
 * const error = new ClerkRuntimeError('An error occurred');
 * if (isClerkRuntimeError(error)) {
 *   // Handle ClerkRuntimeError
 *   console.error('ClerkRuntimeError:', error.message);
 * } else {
 *   // Handle other errors
 *   console.error('Other error:', error.message);
 * }
 */
export function isClerkRuntimeError(err: any): err is ClerkRuntimeError {
  return 'clerkRuntimeError' in err;
}

/**
 * Checks if the provided error is a Clerk runtime error indicating a reverification was cancelled.
 *
 * @internal
 */
export function isReverificationCancelledError(err: any) {
  return isClerkRuntimeError(err) && err.code === 'reverification_cancelled';
}

/**
 * Checks if the provided error is a Metamask error.
 *
 * @internal
 */
export function isMetamaskError(err: any): err is MetamaskError {
  return 'code' in err && [4001, 32602, 32603].includes(err.code) && 'message' in err;
}

/**
 * Checks if the provided error is clerk api response error indicating a user is locked.
 *
 * @internal
 */
export function isUserLockedError(err: any) {
  return isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'user_locked';
}

/**
 * Checks if the provided error is a clerk api response error indicating a password was pwned.
 *
 * @internal
 */
export function isPasswordPwnedError(err: any) {
  return isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'form_password_pwned';
}

/**
 * Checks if the provided error is a clerk api response error indicating a password was untrusted.
 *
 * @internal
 */
export function isPasswordUntrustedError(err: any) {
  return isClerkAPIResponseError(err) && err.errors?.[0]?.code === 'form_password_untrusted';
}

/**
 * Checks if the provided error is an EmailLinkError.
 *
 * @internal
 */
export function isEmailLinkError(err: Error): err is EmailLinkError {
  return err.name === 'EmailLinkError';
}
