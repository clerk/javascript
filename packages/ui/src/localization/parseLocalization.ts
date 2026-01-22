import type { LocalizationInput, LocalizationResource } from '@clerk/shared/types';
import {
  fastDeepMergeAndReplace,
  isFlattenedObject,
  unflattenObject,
  validateLocalizationFormat,
} from '@clerk/shared/utils';
import { dequal as deepEqual } from 'dequal';

import { useOptions } from '../contexts';
import { defaultResource } from './defaultEnglishResource';

let cache: LocalizationResource | undefined;
let prev: LocalizationInput | undefined;

const parseLocalizationResource = (
  userDefined: LocalizationInput,
  base: LocalizationResource,
): LocalizationResource => {
  if (!cache || (!!prev && prev !== userDefined && !deepEqual(userDefined, prev))) {
    prev = userDefined;

    // If no user-defined localization, just return base
    if (!userDefined || Object.keys(userDefined).length === 0) {
      cache = base;
      return cache;
    }

    // Validate no mixing of formats (throws if mixed)
    validateLocalizationFormat(userDefined as Record<string, unknown>);

    // Convert flattened to nested if needed
    const normalized = isFlattenedObject(userDefined as Record<string, unknown>)
      ? unflattenObject<LocalizationResource>(userDefined as Record<string, unknown>)
      : (userDefined as LocalizationResource);

    const res = {} as LocalizationResource;
    fastDeepMergeAndReplace(base, res);
    fastDeepMergeAndReplace(normalized, res);
    cache = res;
    return cache;
  }
  return cache;
};

export const useParsedLocalizationResource = () => {
  const { localization } = useOptions();
  return parseLocalizationResource(localization || {}, defaultResource as any as LocalizationResource);
};
