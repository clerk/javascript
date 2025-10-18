import type { ClerkAPIError, UsernameSettingsData } from '@clerk/shared/types';

import { type LocalizationKey, localizationKeys } from '../localization';

type LocalizationConfigProps = {
  t: (localizationKey: LocalizationKey | string | undefined) => string;
  locale: string;
  usernameSettings: Pick<UsernameSettingsData, 'max_length' | 'min_length'>;
};

const INVALID_LENGTH = 'form_username_invalid_length';

export const createUsernameError = (
  errors: ClerkAPIError[],
  localizationConfig: LocalizationConfigProps,
): ClerkAPIError | string | undefined => {
  const { t, usernameSettings } = localizationConfig;

  const clerkApiError = errors[0] as ClerkAPIError | undefined;

  if (!localizationConfig) {
    return clerkApiError;
  }

  if (clerkApiError?.code === INVALID_LENGTH) {
    return t(
      localizationKeys(`unstable__errors.${INVALID_LENGTH}`, {
        min_length: usernameSettings.min_length,
        max_length: usernameSettings.max_length,
      }),
    );
  }

  return clerkApiError;
};
