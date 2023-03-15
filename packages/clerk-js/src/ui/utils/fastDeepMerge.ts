/**
 * Merges 2 objects without creating new object references
 * The merged props will appear on the `target` object
 * If `target` already has a value for a given key it will not be overwritten
 */
export const fastDeepMergeAndReplace = (
  source: Record<any, any> | undefined | null,
  target: Record<any, any> | undefined | null,
) => {
  if (!source || !target) {
    return;
  }

  for (const key in source) {
    if (source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === undefined) {
        target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
      }
      fastDeepMergeAndReplace(source[key], target[key]);
    } else {
      target[key] = source[key];
    }
  }
};

export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export const fastDeepMergeAndKeep = (
  source: Record<any, any> | undefined | null,
  target: Record<any, any> | undefined | null,
) => {
  if (!source || !target) {
    return;
  }

  for (const key in source) {
    if (source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === undefined) {
        target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
      }
      fastDeepMergeAndKeep(source[key], target[key]);
    } else if (target[key] === undefined) {
      target[key] = source[key];
    }
  }
};

function deepMerge(source: Record<any, any> | undefined | null, target: Record<any, any> | undefined | null) {
  if (!source || !target) {
    return;
  }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(target, { [key]: source[key] });
        } else {
          target[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }

  return target;
}

export const deepCopyAndReturn = <T extends Record<any, any> | undefined | null>(source: T): T => {
  if (!source) {
    return source;
  }

  const target = {};
  deepMerge(source, target);
  return target as T;
};
