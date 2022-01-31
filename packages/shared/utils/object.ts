import { camelToSnake } from './string';

/**
 * Transform camelCased object keys to snake_cased.
 * Mostly used for transforming parameter arguments retrieved from the Clerk client methods
 * to forward to the Clerk FAPI which expects snake_cased attributes in the resources.
 *
 * Transformation is DEEP.
 *
 * camelCased keys are removed.
 *
 * @param {T} obj Object to transform.
 * @return Same object but with
 */
export function camelToSnakeKeys<T extends Record<string, unknown>>(obj: T) {
  if (!obj) {
    return obj;
  }

  const keys: Array<keyof T> = Object.keys(obj);

  for (const oldName of keys) {
    const newName = camelToSnake(oldName.toString()) as keyof T;
    if (newName !== oldName) {
      obj[newName] = obj[oldName];
      delete obj[oldName];
    }
    if (typeof obj[newName] === 'object') {
      // @ts-ignore
      obj[newName] = camelToSnakeKeys(obj[newName]);
    }
  }
  return obj as T;
}
