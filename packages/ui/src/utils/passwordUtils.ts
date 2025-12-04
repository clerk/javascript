import type { ClerkAPIError, PasswordSettingsData } from '@clerk/shared/types';

import type { LocalizationKey } from '../localization';
import { localizationKeys } from '../localization/localizationKeys';
import { canUseListFormat } from './intl';

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
  passwordSettings: Pick<PasswordSettingsData, 'max_length' | 'min_length'>;
};

export const createPasswordError = (errors: ClerkAPIError[], localizationConfig: LocalizationConfigProps) => {
  if (!localizationConfig) {
    return errors[0].longMessage;
  }

  const { t, locale, passwordSettings } = localizationConfig;

  if (errors?.[0]?.code === 'form_password_size_in_bytes_exceeded' || errors?.[0]?.code === 'form_password_pwned') {
    return `${t(localizationKeys(`unstable__errors.${errors?.[0]?.code}` as any)) || errors?.[0]?.message}`;
  }

  if (errors?.[0]?.code === 'form_password_not_strong_enough') {
    const message = errors[0].meta?.zxcvbn?.suggestions
      ?.map(s => {
        return t(localizationKeys(`unstable__errors.zxcvbn.suggestions.${s.code}` as any));
      })
      .join(' ');

    return `${t(localizationKeys('unstable__errors.zxcvbn.notEnough'))} ${message}`;
  }

  // show min length error first by itself
  const minLenErrors = errors.filter(e => e.code === 'form_password_length_too_short');

  const message = (minLenErrors.length ? minLenErrors : errors).map((s: any) => {
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
