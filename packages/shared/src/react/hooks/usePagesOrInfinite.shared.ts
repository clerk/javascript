import { useRef } from 'react';

import type { PagesOrInfiniteOptions } from '../types';

/**
 * A hook that safely merges user-provided pagination options with default values.
 * It caches initial pagination values (page and size) until component unmount to prevent unwanted rerenders.
 *
 * @internal
 *
 * @example
 * ```typescript
 * // Example 1: With user-provided options
 * const userOptions = { initialPage: 2, pageSize: 20, infinite: true };
 * const defaults = { initialPage: 1, pageSize: 10, infinite: false };
 * useWithSafeValues(userOptions, defaults);
 * // Returns { initialPage: 2, pageSize: 20, infinite: true }
 *
 * // Example 2: With boolean true (use defaults)
 * const params = true;
 * const defaults = { initialPage: 1, pageSize: 10, infinite: false };
 * useWithSafeValues(params, defaults);
 * // Returns { initialPage: 1, pageSize: 10, infinite: false }
 *
 * // Example 3: With undefined options (fallback to defaults)
 * const params = undefined;
 * const defaults = { initialPage: 1, pageSize: 10, infinite: false };
 * useWithSafeValues(params, defaults);
 * // Returns { initialPage: 1, pageSize: 10, infinite: false }
 * ```
 */
export const useWithSafeValues = <T extends PagesOrInfiniteOptions>(params: T | true | undefined, defaultValues: T) => {
  const shouldUseDefaults = typeof params === 'boolean' && params;

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(
    shouldUseDefaults ? defaultValues.initialPage : (params?.initialPage ?? defaultValues.initialPage),
  );
  const pageSizeRef = useRef(shouldUseDefaults ? defaultValues.pageSize : (params?.pageSize ?? defaultValues.pageSize));

  const newObj: Record<string, unknown> = {};
  for (const key of Object.keys(defaultValues)) {
    // @ts-ignore - indexing into generic param to preserve unknown keys from defaults/params
    newObj[key] = shouldUseDefaults ? defaultValues[key] : (params?.[key] ?? defaultValues[key]);
  }

  return {
    ...newObj,
    initialPage: initialPageRef.current,
    pageSize: pageSizeRef.current,
  } as T;
};

/**
 * Returns an object containing only the keys from the first object that are not present in the second object.
 * Useful for extracting unique parameters that should be passed to a request while excluding common cache keys.
 *
 * @internal
 *
 * @example
 * ```typescript
 * // Example 1: Basic usage
 * const obj1 = { name: 'John', age: 30, city: 'NY' };
 * const obj2 = { name: 'John', age: 30 };
 * getDifferentKeys(obj1, obj2); // Returns { city: 'NY' }
 *
 * // Example 2: With cache keys
 * const requestParams = { page: 1, limit: 10, userId: '123' };
 * const cacheKeys = { userId: '123' };
 * getDifferentKeys(requestParams, cacheKeys); // Returns { page: 1, limit: 10 }
 * ```
 */
export function getDifferentKeys(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
): Record<string, unknown> {
  const keysSet = new Set(Object.keys(obj2));
  const differentKeysObject: Record<string, unknown> = {};

  for (const key1 of Object.keys(obj1)) {
    if (!keysSet.has(key1)) {
      differentKeysObject[key1] = obj1[key1];
    }
  }

  return differentKeysObject;
}
