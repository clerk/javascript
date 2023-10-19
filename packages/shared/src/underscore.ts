/**
 * Converts an array of strings to a comma-separated sentence
 * @param items {Array<string>}
 * @returns {string} Returns a string with the items joined by a comma and the last item joined by ", or"
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

export function isIPV4Address(str: string | undefined | null): boolean {
  return IP_V4_ADDRESS_REGEX.test(str || '');
}

export function titleize(str: string | undefined | null): string {
  const s = str || '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function snakeToCamel(str: string | undefined): string {
  return str ? str.replace(/([-_][a-z])/g, match => match.toUpperCase().replace(/-|_/, '')) : '';
}

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
 */
export const deepCamelToSnake = createDeepObjectTransformer(camelToSnake);

/**
 * Transforms snake_cased objects/ arrays to camelCased.
 * This function recursively traverses all objects and arrays of the passed value
 * camelCased keys are removed.
 */
export const deepSnakeToCamel = createDeepObjectTransformer(snakeToCamel);
