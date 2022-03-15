import { camelToSnake, snakeToCamel } from './string';

const createDeepObjectTransformer = (transform: any) => {
  const deepTransform = <T extends Record<string, any> | Array<any>>(
    obj: T,
  ): any => {
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

    const keys = Object.keys(obj) as Array<keyof T>;
    for (const oldName of keys) {
      const newName = transform(oldName.toString()) as keyof T;
      if (newName !== oldName) {
        obj[newName] = obj[oldName];
        delete obj[oldName];
      }
      if (typeof obj[newName] === 'object') {
        // @ts-ignore
        obj[newName] = deepTransform(obj[newName]);
      }
    }
    return obj;
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
