const DISALLOWED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isDisallowedKey(key: string): boolean {
  return DISALLOWED_KEYS.has(key);
}

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
    if (isDisallowedKey(key)) {
      continue;
    }

    const segments = key.split('.');
    let current: Record<string, unknown> = result;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];

      if (!segment || isDisallowedKey(segment)) {
        continue;
      }

      if (!(segment in current) || typeof current[segment] !== 'object' || current[segment] === null) {
        current[segment] = {};
      }

      current = current[segment] as Record<string, unknown>;
    }

    const lastKey = segments[segments.length - 1];
    if (lastKey && !isDisallowedKey(lastKey)) {
      current[lastKey] = value;
    }
  }

  return result as T;
}
