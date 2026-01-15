import type { ClerkErrorParams } from './clerkError';
import { ClerkError } from './clerkError';
import { createErrorTypeGuard } from './createErrorTypeGuard';

type ClerkOfflineErrorOptions = Omit<ClerkErrorParams, 'message' | 'code'> & {
  /**
   * Whether a cached token exists for the requested tokenId.
   * This avoids leaking raw tokens into error objects (which are often logged/serialized).
   */
  hasCachedToken?: boolean;
  /**
   * The tokenId that was being requested when the offline/connectivity failure happened.
   */
  tokenId?: string;
  /**
   * @deprecated Avoid attaching raw tokens to errors. Prefer `hasCachedToken` + re-calling `getToken()`.
   */
  cachedToken?: string;
};

/**
 * Error class for offline/network failure scenarios.
 *
 * Thrown when a network request fails due to the user being offline or
 * experiencing network connectivity issues. This allows applications to
 * distinguish between API errors and connectivity problems.
 *
 * @example
 * ```typescript
 * try {
 *   const token = await session.getToken();
 * } catch (e) {
 *   if (ClerkOfflineError.is(e)) {
 *     // Handle offline scenario
 *     showOfflineMessage();
 *     // Access cached token if available
 *     if (e.cachedToken) {
 *       useFallbackToken(e.cachedToken);
 *     }
 *   }
 * }
 * ```
 */
export class ClerkOfflineError extends ClerkError {
  static kind = 'ClerkOfflineError';
  static readonly ERROR_CODE = 'clerk_offline' as const;

  /**
   * Whether a cached token exists for the requested tokenId.
   */
  readonly hasCachedToken?: boolean;
  /**
   * The tokenId that was being requested when the offline/connectivity failure happened.
   */
  readonly tokenId?: string;
  /**
   * @deprecated Avoid attaching raw tokens to errors. Prefer `hasCachedToken` + re-calling `getToken()`.
   */
  readonly cachedToken?: string;

  constructor(message: string, options?: ClerkOfflineErrorOptions) {
    super({
      ...options,
      message,
      code: ClerkOfflineError.ERROR_CODE,
    });
    this.hasCachedToken = options?.hasCachedToken;
    this.tokenId = options?.tokenId;
    this.cachedToken = options?.cachedToken;
    Object.setPrototypeOf(this, ClerkOfflineError.prototype);
  }

  /**
   * Type guard to check if an error is a ClerkOfflineError.
   *
   * @example
   * ```typescript
   * if (ClerkOfflineError.is(error)) {
   *   // error is typed as ClerkOfflineError
   *   console.log(error.cachedToken);
   * }
   * ```
   */
  static is = createErrorTypeGuard(ClerkOfflineError);
}
