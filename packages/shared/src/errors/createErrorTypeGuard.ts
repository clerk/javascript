/* eslint-disable jsdoc/require-jsdoc */

/**
 * Creates a type guard function for any error class.
 * The returned function can be called as a standalone function or as a method on an error object.
 *
 * @example
 * ```typescript
 * class MyError extends Error {}
 * const isMyError = createErrorTypeGuard(MyError);
 *
 * // As a standalone function
 * if (isMyError(error)) { ... }
 *
 * // As a method (when attached to error object)
 * if (error.isMyError()) { ... }
 * ```
 */
export function createErrorTypeGuard<T extends new (...args: any[]) => Error>(
  ErrorClass: T,
): {
  (error: Error): error is InstanceType<T>;
  (this: Error): this is InstanceType<T>;
} {
  function typeGuard(this: Error | void, error?: Error): error is InstanceType<T> {
    const target = error ?? this;
    if (!target) {
      throw new TypeError(`${ErrorClass.name} type guard requires an error object`);
    }
    return target instanceof ErrorClass;
  }

  return typeGuard as {
    (error: Error): error is InstanceType<T>;
    (this: Error): this is InstanceType<T>;
  };
}
