import type { ClerkAPIError, UsernameSettingsData } from '@clerk/types';

import { type LocalizationKey, localizationKeys } from '../localization';

type LocalizationConfigProps = {
  t: (localizationKey: LocalizationKey | string | undefined) => string;
  locale: string;
  usernameSettings: Pick<UsernameSettingsData, 'max_length' | 'min_length'>;
};

export const createUsernameError = (errors: ClerkAPIError[], localizationConfig: LocalizationConfigProps) => {
  const { t, usernameSettings } = localizationConfig;

  if (!localizationConfig) {
    return errors[0].longMessage;
  }

  const msg = t(
    localizationKeys('unstable__errors.form_username_invalid_length', {
      min_length: usernameSettings.min_length,
      max_length: usernameSettings.max_length,
    }),
  );

  return msg;
};
