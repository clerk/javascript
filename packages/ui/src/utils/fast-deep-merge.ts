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
        // Guard against prototype pollution by checking if the key is a non-enumerable property
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
          target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
        }
      }
      fastDeepMergeAndReplace(source[key], target[key]);
    } else {
      // Guard against prototype pollution by checking if the key is a non-enumerable property
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = source[key];
      }
    }
  }
};

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
        // Guard against prototype pollution by checking if the key is a non-enumerable property
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
          target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
        }
      }
      fastDeepMergeAndKeep(source[key], target[key]);
    } else if (target[key] === undefined) {
      // Guard against prototype pollution by checking if the key is a non-enumerable property
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = source[key];
      }
    }
  }
};
