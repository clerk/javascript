'use client';

import { useRef } from 'react';

import type { PagesOrInfiniteOptions } from '../types';

/**
 * Shared helper to safely merge user-provided pagination options with defaults.
 * Caches initial page and page size for the lifecycle of the component.
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
