import type { DeepPartial, LocalizationResource } from '@clerk/shared/types';
import { fastDeepMergeAndReplace } from '@clerk/shared/utils';
import { dequal as deepEqual } from 'dequal';

import { useOptions } from '../contexts';
import { defaultResource } from './defaultEnglishResource';

let cache: LocalizationResource | undefined;
let prev: DeepPartial<LocalizationResource> | undefined;

const parseLocalizationResource = (
  userDefined: DeepPartial<LocalizationResource>,
  base: LocalizationResource,
): LocalizationResource => {
  if (!cache || (!!prev && prev !== userDefined && !deepEqual(userDefined, prev))) {
    prev = userDefined;
    const res = {} as LocalizationResource;
    fastDeepMergeAndReplace(base, res);
    fastDeepMergeAndReplace(userDefined, res);
    cache = res;
    return cache;
  }
  return cache;
};

export const useParsedLocalizationResource = () => {
  const { localization } = useOptions();
  return parseLocalizationResource(localization || {}, defaultResource as any as LocalizationResource);
};
