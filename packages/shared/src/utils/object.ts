import { camelToSnake, snakeToCamel } from './string';

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
