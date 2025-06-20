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

interface SerializerConfig {
  nestedFields?: string[];
  arrayFields?: string[];
  customTransforms?: Record<string, TransformFn>;
}

/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
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

/**
 * Serializes a class instance into JSON format based on the provided configuration
 * @param data The class instance data to serialize
 * @param config The configuration object that defines how to serialize specific fields
 * @returns The serialized data with all transformations applied
 */
export function serializeToJSON<T extends object>(data: T | null, config: SerializerConfig = {}): Record<string, any> {
  if (!data) {
    return {};
  }

  const result: Record<string, any> = {};
  const { nestedFields = [], arrayFields = [], customTransforms = {} } = config;

  // Process each field in the data
  for (const [key, value] of Object.entries(data)) {
    // Skip if value is undefined
    if (value === undefined) {
      continue;
    }

    // Convert camelCase to snake_case for all keys
    const outputKey = camelToSnake(key);

    // 1. Custom transforms take precedence
    if (customTransforms[key]) {
      result[outputKey] = customTransforms[key](value);
      continue;
    }

    // 2. Auto-convert Date fields to timestamp
    if (value instanceof Date) {
      result[outputKey] = value.getTime();
      continue;
    }

    // 3. Nested object fields - call __internal_toSnapshot if available
    if (nestedFields.includes(key) && value) {
      if (typeof value === 'object' && value !== null && typeof value.__internal_toSnapshot === 'function') {
        result[outputKey] = value.__internal_toSnapshot();
      } else {
        result[outputKey] = value;
      }
      continue;
    }

    // 4. Array fields with nested objects
    if (arrayFields.includes(key) && Array.isArray(value)) {
      result[outputKey] = value.map(item => {
        if (typeof item === 'object' && item !== null && typeof item.__internal_toSnapshot === 'function') {
          return item.__internal_toSnapshot();
        }
        return item;
      });
      continue;
    }

    // 5. Direct assignment for primitive values
    result[outputKey] = value;
  }

  return result;
}
