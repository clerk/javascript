import type { ClerkAPIError, PasswordSettingsData } from '@clerk/types';

import type { LocalizationKey } from '../localization';
import { localizationKeys } from '../localization/localizationKeys';
import { canUseListFormat } from '../utils';

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

type LocalizationConfigProps = {
  t: (localizationKey: LocalizationKey | string | undefined) => string;
  locale: string;
  passwordSettings: PasswordSettingsData;
};
export const createPasswordError = (errors: ClerkAPIError[], localizationConfig: LocalizationConfigProps) => {
  if (!localizationConfig) {
    return errors[0].longMessage;
  }

  const { t, locale, passwordSettings } = localizationConfig;

  const message = errors.map((s: any) => {
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

export const addFullStop = (string: string | undefined) => {
  return !string ? '' : string.endsWith('.') ? string : `${string}.`;
};

export const createListFormat = (message: string[], locale: string) => {
  let messageWithPrefix: string;
  if (canUseListFormat(locale)) {
    const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
    messageWithPrefix = formatter.format(message);
  } else {
    messageWithPrefix = message.join(', ');
  }

  return messageWithPrefix;
};
