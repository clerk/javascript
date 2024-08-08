import { enUS } from '@clerk/localizations';

import { makeLocalizeable } from '~/utils/make-localizable';

import { useOptions } from './use-options';

export function useLocalizations() {
  const options = useOptions();
  const { t, translateError } = makeLocalizeable(options?.localization || enUS);
  return { t, translateError, locale: options?.localization?.locale || 'en-US' };
}
