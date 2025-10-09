/* eslint-disable jsdoc/require-jsdoc */
import type { ClerkErrorParams } from './future';
import { ClerkError } from './future';

export class ClerkRuntimeError extends ClerkError {
  readonly name = 'ClerkRuntimeError';

  constructor(params: ClerkErrorParams) {
    super(params);
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
export function isClerkRuntimeError(error: Error): error is ClerkRuntimeError;
export function isClerkRuntimeError(this: Error): this is ClerkRuntimeError;
export function isClerkRuntimeError(this: Error | void, error?: Error): error is ClerkRuntimeError {
  const target = error ?? this;
  if (!target) {
    throw new TypeError('isClerkRuntimeError requires an error object');
  }
  return target instanceof ClerkRuntimeError;
}
