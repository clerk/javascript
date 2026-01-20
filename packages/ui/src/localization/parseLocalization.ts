import type { DeepPartial, LocalizationResource } from '@clerk/shared/types';
import createDeepmerge from '@fastify/deepmerge';
import { dequal as deepEqual } from 'dequal';

import { useOptions } from '../contexts';
import { defaultResource } from './defaultEnglishResource';

const deepmerge = createDeepmerge({ all: true });

/**
 * Recursively removes undefined values from an object.
 * This ensures that undefined values don't overwrite base values during merge.
 */
const stripUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = stripUndefined(value as Record<string, unknown>);
        } else {
          result[key] = value;
        }
      }
    }
  }
  return result as Partial<T>;
};

let cache: LocalizationResource | undefined;
let prev: DeepPartial<LocalizationResource> | undefined;

const parseLocalizationResource = (
  userDefined: DeepPartial<LocalizationResource>,
  base: LocalizationResource,
): LocalizationResource => {
  if (!cache || (!!prev && prev !== userDefined && !deepEqual(userDefined, prev))) {
    prev = userDefined;
    const cleanedUserDefined = stripUndefined(userDefined as Record<string, unknown>);
    cache = deepmerge(base, cleanedUserDefined) as LocalizationResource;
    return cache;
  }
  return cache;
};

export const useParsedLocalizationResource = () => {
  const { localization } = useOptions();
  return parseLocalizationResource(localization || {}, defaultResource as any as LocalizationResource);
};
