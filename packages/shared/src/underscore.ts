/**
 * Convert words to a sentence.
 *
 * @param items - An array of words to be joined.
 * @returns A string with the items joined by a comma and the last item joined by ", or".
 */
export const toSentence = (items: string[]): string => {
  // TODO: Once Safari supports it, use Intl.ListFormat
  if (items.length == 0) {
    return '';
  }
  if (items.length == 1) {
    return items[0];
  }
  let sentence = items.slice(0, -1).join(', ');
  sentence += `, or ${items.slice(-1)}`;
  return sentence;
};

const IP_V4_ADDRESS_REGEX =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Checks if a string is a valid IPv4 address.
 *
 * @returns True if the string is a valid IPv4 address, false otherwise.
 */
export function isIPV4Address(str: string | undefined | null): boolean {
  return IP_V4_ADDRESS_REGEX.test(str || '');
}

/**
 * Converts the first character of a string to uppercase.
 *
 * @param str - The string to be converted.
 * @returns The modified string with the rest of the string unchanged.
 *
 * @example
 * ```ts
 * titleize('hello world') // 'Hello world'
 * ```
 */
export function titleize(str: string | undefined | null): string {
  const s = str || '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Converts a string from snake_case to camelCase.
 */
export function snakeToCamel(str: string | undefined): string {
  return str ? str.replace(/([-_][a-z])/g, match => match.toUpperCase().replace(/-|_/, '')) : '';
}

/**
 * Converts a string from camelCase to snake_case.
 */
export function camelToSnake(str: string | undefined): string {
  return str ? str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`) : '';
}

const createDeepObjectTransformer = (transform: any) => {
  const deepTransform = (obj: any): any => {
    if (!obj) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(el => {
        if (typeof el === 'object' || Array.isArray(el)) {
          return deepTransform(el);
        }
        return el;
      });
    }

    const copy = { ...obj };
    const keys = Object.keys(copy);
    for (const oldName of keys) {
      const newName = transform(oldName.toString());
      if (newName !== oldName) {
        copy[newName] = copy[oldName];
        delete copy[oldName];
      }
      if (typeof copy[newName] === 'object') {
        copy[newName] = deepTransform(copy[newName]);
      }
    }
    return copy;
  };

  return deepTransform;
};

/**
 * Transforms camelCased objects/ arrays to snake_cased.
 * This function recursively traverses all objects and arrays of the passed value
 * camelCased keys are removed.
 *
 * @function
 */
export const deepCamelToSnake = createDeepObjectTransformer(camelToSnake);

/**
 * Transforms snake_cased objects/ arrays to camelCased.
 * This function recursively traverses all objects and arrays of the passed value
 * camelCased keys are removed.
 *
 * @function
 */
export const deepSnakeToCamel = createDeepObjectTransformer(snakeToCamel);

/**
 * A function to determine if a value is truthy.
 *
 * @returns True for `true`, true, positive numbers. False for `false`, false, 0, negative integers and anything else.
 */
export function isTruthy(value: unknown): boolean {
  // Return if Boolean
  if (typeof value === `boolean`) {
    return value;
  }

  // Return false if null or undefined
  if (value === undefined || value === null) {
    return false;
  }

  // If the String is true or false
  if (typeof value === `string`) {
    if (value.toLowerCase() === `true`) {
      return true;
    }

    if (value.toLowerCase() === `false`) {
      return false;
    }
  }

  // Now check if it's a number
  const number = parseInt(value as string, 10);
  if (isNaN(number)) {
    return false;
  }

  if (number > 0) {
    return true;
  }

  // Default to false
  return false;
}

/**
 * Get all non-undefined values from an object.
 */
export function getNonUndefinedValues<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
