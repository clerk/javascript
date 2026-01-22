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
 * Converts a flattened object to nested format.
 * { "a.b.c": "value" } => { a: { b: { c: "value" } } }
 */
export function unflattenObject<T extends Record<string, unknown>>(flat: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      current[part] = current[part] || {};
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result as T;
}
