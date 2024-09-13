import { enUS } from '@clerk/localizations';
import { fastDeepMergeAndReplace } from '@clerk/shared';
import type { DeepPartial, DeepRequired, LocalizationResource } from '@clerk/types';
import { dequal as deepEqual } from 'dequal';

import { makeLocalizeable } from '~/utils/make-localizable';

import { useOptions } from './use-options';

const defaultResource = enUS as DeepRequired<typeof enUS>;

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
  }
  return cache;
};

export function useLocalizations() {
  const { localization } = useOptions();
  const parsedLocalization = parseLocalizationResource(
    localization || {},
    defaultResource as any as LocalizationResource,
  );
  const { t, translateError } = makeLocalizeable(parsedLocalization || enUS);
  return { t, translateError, locale: parsedLocalization?.locale || 'en-US' };
}
