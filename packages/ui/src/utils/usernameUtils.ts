import type { ClerkAPIError, UsernameSettingsData } from '@clerk/shared/types';

import { type LocalizationKey, localizationKeys } from '../localization';

type LocalizationConfigProps = {
  t: (localizationKey: LocalizationKey | string | undefined) => string;
  locale: string;
  usernameSettings: Pick<UsernameSettingsData, 'max_length' | 'min_length'>;
};

const INVALID_LENGTH = 'form_username_invalid_length';
const NEEDS_NON_NUMBER_CHAR = 'form_username_needs_non_number_char';

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

  if (clerkApiError?.code === NEEDS_NON_NUMBER_CHAR) {
    return t(localizationKeys(`unstable__errors.${NEEDS_NON_NUMBER_CHAR}`));
  }

  return clerkApiError;
};
