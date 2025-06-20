import { unixEpochToDate } from '../../utils/date';

type Constructor<T> = new (...args: any[]) => T;
type TransformFn = (value: any) => any;

interface ParserConfig {
  dateFields?: string[];
  nestedFields?: Record<string, Constructor<any>>;
  arrayFields?: Record<string, Constructor<any>>;
  customTransforms?: Record<string, TransformFn>;
  defaultValues?: Record<string, any>;
}

/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Parses a JSON object into a class instance based on the provided configuration
 * @param data The JSON data to parse
 * @param config The configuration object that defines how to parse specific fields
 * @returns The parsed data with all transformations applied
 */
export function parseJSON<T extends object>(data: Record<string, any> | null, config: ParserConfig = {}): Partial<T> {
  if (!data) {
    return {};
  }

  const result: Record<string, any> = {};
  const { dateFields = [], nestedFields = {}, arrayFields = {}, customTransforms = {}, defaultValues = {} } = config;

  // Process each field in the data
  for (const [key, value] of Object.entries(data)) {
    const camelKey = snakeToCamel(key);

    // Skip if value is undefined
    if (value === undefined) {
      continue;
    }

    // Apply transformations in order:

    // 1. Custom transforms take precedence
    if (customTransforms[camelKey]) {
      result[camelKey] = customTransforms[camelKey](value);
      continue;
    }

    // 2. Date fields
    if (dateFields.includes(camelKey)) {
      result[camelKey] = value ? unixEpochToDate(value) : null;
      continue;
    }

    // 3. Nested object fields
    if (nestedFields[camelKey] && value) {
      const Constructor = nestedFields[camelKey];
      result[camelKey] = new Constructor(value);
      continue;
    }

    // 4. Array fields with nested objects
    if (arrayFields[camelKey] && Array.isArray(value)) {
      const Constructor = arrayFields[camelKey];
      result[camelKey] = value.map(item => new Constructor(item));
      continue;
    }

    // 5. Default values
    if (Object.prototype.hasOwnProperty.call(defaultValues, camelKey)) {
      result[camelKey] = value ?? defaultValues[camelKey];
      continue;
    }

    // 6. Direct assignment for primitive values
    result[camelKey] = value;
  }

  return result as Partial<T>;
}
