/**
 * Validates that a localization object uses a consistent format (either all flattened or all nested).
 * Throws an error if the format is mixed or invalid.
 *
 * @param obj - The localization object to validate
 * @throws {Error} If the object has mixed flattened and nested keys, or invalid key formats
 */
export function validateLocalizationFormat(obj: Record<string, unknown>): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('Localization object must be a non-null object');
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return; // Empty object is valid
  }

  // Check if any keys contain dots (flattened format)
  const hasFlattenedKeys = keys.some(key => key.includes('.'));

  // Check if any values are objects (nested format)
  const hasNestedValues = keys.some(key => {
    const value = obj[key];
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  });

  // If we have both flattened keys and nested values, that's a conflict
  if (hasFlattenedKeys && hasNestedValues) {
    throw new Error(
      'Localization object cannot mix flattened (dot-notation) keys with nested object values. Use either all flattened keys or all nested objects.',
    );
  }

  // Validate flattened key format
  if (hasFlattenedKeys) {
    for (const key of keys) {
      // Only validate keys that contain dots (flattened format)
      if (key.includes('.')) {
        // Check for empty segments (consecutive dots, leading/trailing dots)
        if (key.startsWith('.') || key.endsWith('.') || key.includes('..')) {
          throw new Error(
            `Invalid flattened key format: "${key}". Keys cannot start or end with dots, or contain consecutive dots.`,
          );
        }

        // Check for prototype pollution attempts
        const segments = key.split('.');
        if (segments.includes('__proto__') || segments.includes('constructor')) {
          throw new Error(
            `Invalid flattened key format: "${key}". Keys cannot contain "__proto__" or "constructor" segments.`,
          );
        }
      }
    }
  }

  // Validate nested format recursively
  if (hasNestedValues && !hasFlattenedKeys) {
    for (const value of Object.values(obj)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        validateLocalizationFormat(value as Record<string, unknown>);
      }
    }
  }
}
