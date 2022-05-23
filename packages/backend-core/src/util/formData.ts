import { FormDataLike } from '../types';

/**
 * Check if given object is FormData
 *
 * @param value an object to test
 */
export function isFormData(value: unknown): value is FormDataLike {
  return (
    (value as FormDataLike) &&
    isFunction((value as FormDataLike).constructor) &&
    (value as FormDataLike)[Symbol.toStringTag] === 'FormData' &&
    /* eslint-disable @typescript-eslint/unbound-method */
    isFunction((value as FormDataLike).append) &&
    isFunction((value as FormDataLike).getAll) &&
    isFunction((value as FormDataLike).entries) &&
    /* eslint-enable */
    isFunction((value as FormDataLike)[Symbol.iterator])
  );
}

// eslint-disable-next-line @typescript-eslint/ban-types
function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}
