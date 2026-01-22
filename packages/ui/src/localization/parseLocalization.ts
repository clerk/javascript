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

function parseLocalizationResource(userDefined: LocalizationInput, base: LocalizationResource): LocalizationResource {
  if (!cache || (!!prev && prev !== userDefined && !deepEqual(userDefined, prev))) {
    prev = userDefined;

    if (!userDefined || Object.keys(userDefined).length === 0) {
      cache = base;
      return cache;
    }

    const input = userDefined as Record<string, unknown>;
    validateLocalizationFormat(input);

    const normalized = isFlattenedObject(input)
      ? unflattenObject<LocalizationResource>(input)
      : (userDefined as LocalizationResource);

    const res = {} as LocalizationResource;
    fastDeepMergeAndReplace(base, res);
    fastDeepMergeAndReplace(normalized, res);
    cache = res;
    return cache;
  }
  return cache;
}

export const useParsedLocalizationResource = () => {
  const { localization } = useOptions();
  return parseLocalizationResource(localization || {}, defaultResource as any as LocalizationResource);
};
