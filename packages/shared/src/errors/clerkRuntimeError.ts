import type { ClerkErrorParams } from './clerkError';
import { ClerkError } from './clerkError';
import { createErrorTypeGuard } from './createErrorTypeGuard';

type ClerkRuntimeErrorOptions = Omit<ClerkErrorParams, 'message'>;

/**
 * Custom error class for representing Clerk runtime errors.
 *
 * @class ClerkRuntimeError
 *
 * @example
 *   throw new ClerkRuntimeError('An error occurred', { code: 'password_invalid' });
 */
export class ClerkRuntimeError extends ClerkError {
  static kind = 'ClerkRuntimeError';
  /**
   * @deprecated Use `clerkError` property instead. This property is maintained for backward compatibility.
   */
  readonly clerkRuntimeError = true as const;

  constructor(message: string, options: ClerkRuntimeErrorOptions) {
    super({ ...options, message });
    Object.setPrototypeOf(this, ClerkRuntimeError.prototype);
  }
}

/**
 * Type guard to check if an error is a ClerkRuntimeError.
 * Can be called as a standalone function or as a method on an error object.
 *
 * @example
 * // As a standalone function
 * if (isClerkRuntimeError(error)) { ... }
 *
 * // As a method (when attached to error object)
 * if (error.isClerkRuntimeError()) { ... }
 */
export const isClerkRuntimeError = createErrorTypeGuard(ClerkRuntimeError);
