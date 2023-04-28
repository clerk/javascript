import type { DeepPartial, LocalizationResources } from '@clerk/types';
import { dequal as deepEqual } from 'dequal';

import { useOptions } from '../contexts';
import { fastDeepMergeAndReplace } from '../utils';
import { defaultResource } from './defaultEnglishResource';

let cache: LocalizationResources | undefined;
let prev: DeepPartial<LocalizationResources> | undefined;

const parseLocalizationResource = (
  userDefined: DeepPartial<LocalizationResources>,
  base: LocalizationResources,
): LocalizationResources => {
  if (!cache || (!!prev && prev !== userDefined && !deepEqual(userDefined, prev))) {
    prev = userDefined;
    const res = {} as LocalizationResources;
    fastDeepMergeAndReplace(base, res);
    fastDeepMergeAndReplace(userDefined, res);
    cache = res;
    return cache;
  }
  return cache;
};

export const useParsedLocalizationResource = () => {
  const { localization } = useOptions();
  return parseLocalizationResource(
    localization?.resources || {},
    defaultResource?.resources as any as LocalizationResources,
  );
};
