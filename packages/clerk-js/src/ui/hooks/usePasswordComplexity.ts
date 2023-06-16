import type { PasswordSettingsData } from '@clerk/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { localizationKeys, useLocalizations } from '../localization';
import { canUseListFormat } from '../utils';

type ComplexityErrorMessages = {
  [key in keyof Partial<Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>>]: string;
};

type UsePasswordComplexityConfig = Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>;

const useTestComplexityCases = (config: Pick<UsePasswordComplexityConfig, 'allowed_special_characters'>) => {
  let specialCharsRegex: RegExp;
  if (config.allowed_special_characters) {
    // Avoid a nested group by escaping the `[]` characters
    let escaped = config.allowed_special_characters.replace('[', '\\[');
    escaped = escaped.replace(']', '\\]');
    specialCharsRegex = new RegExp(`[${escaped}]`);
  } else {
    specialCharsRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
  }

  const testComplexityCases = (
    password: string,
    {
      minLength,
      maxLength,
    }: {
      minLength: number;
      maxLength: number;
    },
  ) => {
    return {
      max_length: password.length < maxLength,
      min_length: password.length >= minLength,
      require_numbers: /\d/.test(password),
      require_lowercase: /[a-z]/.test(password),
      require_uppercase: /[A-Z]/.test(password),
      require_special_char: specialCharsRegex.test(password),
    };
  };

  return {
    testComplexityCases,
  };
};

export const usePasswordComplexity = (config: UsePasswordComplexityConfig) => {
  const {
    min_length,
    max_length,
    require_lowercase,
    require_numbers,
    require_uppercase,
    require_special_char,
    allowed_special_characters,
  } = config;

  const { testComplexityCases } = useTestComplexityCases({
    allowed_special_characters,
  });

  const [password, _setPassword] = useState('');
  const [failedValidations, setFailedValidations] = useState<ComplexityErrorMessages>();
  const { t, locale } = useLocalizations();

  // Populates failedValidations state
  useEffect(() => {
    setPassword('');
  }, []);

  const errorMessages = useMemo(
    () =>
      ({
        max_length: t(localizationKeys('unstable__errors.passwordComplexity.maximumLength', { length: max_length })),
        min_length: t(localizationKeys('unstable__errors.passwordComplexity.minimumLength', { length: min_length })),
        require_numbers: t(localizationKeys('unstable__errors.passwordComplexity.requireNumbers')),
        require_lowercase: t(localizationKeys('unstable__errors.passwordComplexity.requireLowercase')),
        require_uppercase: t(localizationKeys('unstable__errors.passwordComplexity.requireUppercase')),
        require_special_char: t(localizationKeys('unstable__errors.passwordComplexity.requireSpecialCharacter')),
      } satisfies ComplexityErrorMessages),
    [min_length],
  );

  const passwordComplexity = useMemo(() => {
    return testComplexityCases(password, {
      maxLength: max_length,
      minLength: min_length,
    });
  }, [password, min_length, max_length]);

  const hasPassedComplexity = useMemo(
    () => !!password && Object.keys(failedValidations || {}).length === 0,
    [failedValidations, password],
  );

  const hasFailedComplexity = useMemo(
    () => !!password && Object.keys(failedValidations || {}).length > 0,
    [failedValidations, password],
  );

  const generateErrorText = useCallback(
    (failedValidations: ComplexityErrorMessages | undefined) => {
      if (!failedValidations) {
        return '';
      }
      let messageWithPrefix: string;
      if (canUseListFormat(locale)) {
        const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
        messageWithPrefix = formatter.format(Object.values(failedValidations).filter(f => !!f));
      } else {
        messageWithPrefix = Object.values(failedValidations)
          .filter(f => !!f)
          .join(', ');
      }
      return `${t(localizationKeys('unstable__errors.passwordComplexity.sentencePrefix'))} ${messageWithPrefix}`;
    },
    [t],
  );

  const failedValidationsText = useMemo(() => generateErrorText(failedValidations), [failedValidations]);

  const validate = useCallback((password: string) => {
    const testCases = testComplexityCases(password, {
      maxLength: max_length,
      minLength: min_length,
    });

    const keys = {
      max_length,
      min_length,
      require_special_char,
      require_lowercase,
      require_numbers,
      require_uppercase,
    };

    const _validationsFailedMap = new Map();
    for (const k in keys) {
      const key = k as keyof typeof keys;

      if (!keys[key]) {
        continue;
      }

      if (!testCases[key]) {
        _validationsFailedMap.set(key, errorMessages[key]);
      }
    }

    return Object.fromEntries(_validationsFailedMap);
  }, []);

  const setPassword = useCallback(
    (password: string) => {
      let message = '';
      const _validationsFailed = validate(password);
      if (Object.keys(_validationsFailed).length > 0) {
        message = generateErrorText(_validationsFailed);
        // onValidationFailed(_validationsFailed, message);
      } else {
        // onValidationSuccess();
      }
      setFailedValidations(_validationsFailed);
      _setPassword(password);
      return {
        failedValidationsText: message,
      };
    },
    [t, min_length, max_length],
  );

  return {
    password,
    passwordComplexity,
    setPassword,
    failedValidations,
    failedValidationsText,
    hasPassedComplexity,
    hasFailedComplexity,
  };
};
