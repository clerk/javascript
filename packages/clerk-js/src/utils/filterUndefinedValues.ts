/**
 * Filters out undefined values from the first level of an object.
 * Preserves all other falsy values (null, false, 0, empty string).
 *
 * @param obj - The object to filter, or any other value
 */
export function filterUndefinedValues<T>(obj: T): T {
  // Return non-objects as-is (including FormData, arrays, primitives, etc.)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || obj instanceof FormData) {
    return obj;
  }

  // Filter out undefined values from the first level only
  const filtered = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      (filtered as any)[key] = value;
    }
  }

  return filtered;
}
