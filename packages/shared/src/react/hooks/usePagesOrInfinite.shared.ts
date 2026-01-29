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

/**
 * Calculates the offset count for pagination based on initial page and page size.
 * This represents the number of items to skip before the first page.
 *
 * @param initialPage - The starting page number (1-based)
 * @param pageSize - The number of items per page
 * @returns The number of items to offset
 *
 * @example
 * ```typescript
 * calculateOffsetCount(1, 10); // Returns 0 (no offset for first page)
 * calculateOffsetCount(2, 10); // Returns 10 (skip first 10 items)
 * calculateOffsetCount(3, 20); // Returns 40 (skip first 40 items)
 * ```
 */
export function calculateOffsetCount(initialPage: number, pageSize: number): number {
  return (initialPage - 1) * pageSize;
}

/**
 * Calculates the total number of pages based on total count, offset, and page size.
 *
 * @param totalCount - The total number of items
 * @param offsetCount - The number of items to offset (from calculateOffsetCount)
 * @param pageSize - The number of items per page
 * @returns The total number of pages
 *
 * @example
 * ```typescript
 * calculatePageCount(100, 0, 10);  // Returns 10
 * calculatePageCount(95, 0, 10);   // Returns 10 (rounds up)
 * calculatePageCount(100, 20, 10); // Returns 8 (100 - 20 = 80 items, 8 pages)
 * ```
 */
export function calculatePageCount(totalCount: number, offsetCount: number, pageSize: number): number {
  return Math.ceil((totalCount - offsetCount) / pageSize);
}

/**
 * Determines if there is a next page available in non-infinite pagination mode.
 *
 * @param totalCount - The total number of items
 * @param offsetCount - The number of items to offset
 * @param currentPage - The current page number (1-based)
 * @param pageSize - The number of items per page
 * @returns True if there are more items beyond the current page
 *
 * @example
 * ```typescript
 * calculateHasNextPage(100, 0, 1, 10);  // Returns true (page 1 of 10)
 * calculateHasNextPage(100, 0, 10, 10); // Returns false (last page)
 * calculateHasNextPage(25, 0, 2, 10);   // Returns true (page 2, 5 more items)
 * calculateHasNextPage(20, 0, 2, 10);   // Returns false (exactly 2 pages)
 * ```
 */
export function calculateHasNextPage(
  totalCount: number,
  offsetCount: number,
  currentPage: number,
  pageSize: number,
): boolean {
  return totalCount - offsetCount > currentPage * pageSize;
}

/**
 * Determines if there is a previous page available in non-infinite pagination mode.
 *
 * @param currentPage - The current page number (1-based)
 * @param pageSize - The number of items per page
 * @param offsetCount - The number of items to offset
 * @returns True if there are pages before the current page
 *
 * @example
 * ```typescript
 * calculateHasPreviousPage(1, 10, 0);  // Returns false (first page)
 * calculateHasPreviousPage(2, 10, 0);  // Returns true (can go back to page 1)
 * calculateHasPreviousPage(1, 10, 10); // Returns false (first page with offset)
 * ```
 */
export function calculateHasPreviousPage(currentPage: number, pageSize: number, offsetCount: number): boolean {
  return (currentPage - 1) * pageSize > offsetCount;
}
