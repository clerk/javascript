/**
 * Converts a flattened object with dot-notation keys into a nested object structure.
 *
 * @example
 * ```typescript
 * const flattened = {
 *   "a.b.c": "value1",
 *   "a.b.d": "value2",
 *   "e": "value3"
 * };
 * const nested = unflattenObject(flattened);
 * // Result: { a: { b: { c: "value1", d: "value2" } }, e: "value3" }
 * ```
 *
 * @param obj - The flattened object with dot-notation keys
 * @returns A nested object structure
 */
export function unflattenObject<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result = {} as Record<string, unknown>;

  for (const [key, value] of Object.entries(obj)) {
    // Skip prototype pollution attempts
    if (key === '__proto__' || key === 'constructor') {
      continue;
    }

    const keys = key.split('.');
    let current: Record<string, unknown> = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const segment = keys[i];

      // Skip empty segments (consecutive dots, leading/trailing dots)
      if (!segment) {
        continue;
      }

      // Skip prototype pollution attempts
      if (segment === '__proto__' || segment === 'constructor') {
        continue;
      }

      if (!(segment in current) || typeof current[segment] !== 'object' || current[segment] === null) {
        current[segment] = {};
      }

      current = current[segment] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey && lastKey !== '__proto__' && lastKey !== 'constructor') {
      current[lastKey] = value;
    }
  }

  return result as T;
}
