import type { PasswordSettingsData } from '@clerk/types';

import { localizationKeys } from '../customizables';
import { addFullStop, createListFormat } from '../utils';

// match FAPI error codes with localization keys
export const mapComplexityErrors = (passwordSettings: Pick<PasswordSettingsData, 'max_length' | 'min_length'>) => {
  return {
    form_password_length_too_long: [
      'unstable__errors.passwordComplexity.maximumLength',
      'length',
      passwordSettings.max_length,
    ],
    form_password_length_too_short: [
      'unstable__errors.passwordComplexity.minimumLength',
      'length',
      passwordSettings.min_length,
    ],
    form_password_no_uppercase: 'unstable__errors.passwordComplexity.requireUppercase',
    form_password_no_lowercase: 'unstable__errors.passwordComplexity.requireLowercase',
    form_password_no_number: 'unstable__errors.passwordComplexity.requireNumbers',
    form_password_no_special_char: 'unstable__errors.passwordComplexity.requireSpecialCharacter',
  };
};

export const createPasswordError = (error: any, localizationConfig: any) => {
  if (!localizationConfig) {
    return error[0].longMessage;
  }

  const { t, locale, passwordSettings } = localizationConfig;

  const message = error.map((s: any) => {
    const localizedKey = (mapComplexityErrors(passwordSettings) as any)[s.code];

    if (Array.isArray(localizedKey)) {
      const [lk, attr, val] = localizedKey;
      return t(localizationKeys(lk, { [attr]: val }));
    }
    return t(localizationKeys(localizedKey));
  });

  const messageWithPrefix = createListFormat(message, locale);

  const passwordErrorMessage = addFullStop(
    `${t(localizationKeys('unstable__errors.passwordComplexity.sentencePrefix'))} ${messageWithPrefix}`,
  );

  return passwordErrorMessage;
};
