/**
 * Detects if an object uses flattened format (has dot-notation keys).
 */
export function isFlattenedObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).some(key => key.includes('.'));
}

/**
 * Detects if an object uses nested format (has object values).
 */
export function isNestedObject(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(value => typeof value === 'object' && value !== null && !Array.isArray(value));
}

/**
 * Validates that the localization object doesn't mix formats.
 * Throws a descriptive error if mixing is detected.
 */
export function validateLocalizationFormat(obj: Record<string, unknown>): void {
  const hasFlattened = isFlattenedObject(obj);
  const hasNested = isNestedObject(obj);

  if (hasFlattened && hasNested) {
    throw new Error(
      'Clerk: Localization object cannot mix nested and flattened formats. ' +
        'Use either nested format ({ signIn: { start: { title: "..." } } }) ' +
        'or flattened format ({ "signIn.start.title": "..." }), but not both.',
    );
  }
}

/**
 * Checks if a value is a non-null, non-array object that can be used for nesting.
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Returns a human-readable type description for error messages.
 */
function getTypeDescription(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

/**
 * Converts a flattened object to nested format.
 * { "a.b.c": "value" } => { a: { b: { c: "value" } } }
 */
export function unflattenObject<T extends Record<string, unknown>>(flat: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    if (parts.some(part => part === '')) {
      throw new Error(
        `Clerk: Localization key '${key}' contains empty segments (consecutive dots, leading/trailing dots are not allowed)`,
      );
    }

    let current = result;
    const pathSegments: string[] = [];

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      pathSegments.push(part);

      if (part in current) {
        const existing = current[part];
        if (!isObject(existing)) {
          const conflictingPath = pathSegments.join('.');
          const typeDesc = getTypeDescription(existing);
          throw new Error(
            `Clerk: Localization key conflict at path '${conflictingPath}': cannot set '${key}' because '${conflictingPath}' already exists as a ${typeDesc}`,
          );
        }
        current = existing;
      } else {
        current[part] = {};
        current = current[part] as Record<string, unknown>;
      }
    }

    const finalKey = parts[parts.length - 1];
    if (finalKey in current) {
      const existing = current[finalKey];
      const existingIsObject = isObject(existing);
      const newIsObject = isObject(value);

      if (existingIsObject !== newIsObject) {
        const finalPath = parts.join('.');
        const typeDesc = existingIsObject ? 'nested object' : getTypeDescription(existing);
        throw new Error(
          `Clerk: Localization key conflict at path '${finalPath}': cannot set '${key}' because '${finalPath}' already exists as a ${typeDesc}`,
        );
      }
    }

    current[finalKey] = value;
  }

  return result as T;
}
