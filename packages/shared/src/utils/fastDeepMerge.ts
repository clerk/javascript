// Keys that could lead to prototype pollution attacks
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

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
    // Skip dangerous keys to prevent prototype pollution
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === undefined) {
        target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
      }
      fastDeepMergeAndReplace(source[key], target[key]);
    } else if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      target[key] = source[key];
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
    // Skip dangerous keys to prevent prototype pollution
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === undefined) {
        target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
      }
      fastDeepMergeAndKeep(source[key], target[key]);
    } else if (Object.prototype.hasOwnProperty.call(source, key) && target[key] === undefined) {
      target[key] = source[key];
    }
  }
};
