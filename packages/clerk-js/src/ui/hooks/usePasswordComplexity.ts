import type { PasswordSettingsData } from '@clerk/types';
import { useCallback, useMemo, useState } from 'react';

import { localizationKeys, useLocalizations } from '../localization';

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
    require_special_char: /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(password),
  };
};

type ComplexityErrorMessages = {
  [key in keyof Partial<Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>>]: string;
};

export const usePasswordComplexity = (
  config: Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>,
  callbacks?: {
    onValidationFailed?: (validationErrorMessages: ComplexityErrorMessages, errorMessage: string) => void;
    onValidationSuccess?: () => void;
  },
) => {
  const { min_length, max_length, require_lowercase, require_numbers, require_uppercase, require_special_char } =
    config;

  const [_password, _setPassword] = useState('');
  const [failedValidations, setFailedValidations] = useState<ComplexityErrorMessages>({});
  const { t } = useLocalizations();

  const errorMessages = useMemo(
    () =>
      ({
        max_length: t(localizationKeys('passwordComplexity.maximumLength', { length: max_length })),
        min_length: t(localizationKeys('passwordComplexity.minimumLength', { length: min_length })),
        require_numbers: t(localizationKeys('passwordComplexity.requireNumbers')),
        require_lowercase: t(localizationKeys('passwordComplexity.requireLowercase')),
        require_uppercase: t(localizationKeys('passwordComplexity.requireUppercase')),
        require_special_char: t(localizationKeys('passwordComplexity.requireSpecialCharacter')),
      } satisfies ComplexityErrorMessages),
    [min_length],
  );

  const passwordComplexity = useMemo(() => {
    return testComplexityCases(_password, {
      maxLength: max_length,
      minLength: min_length,
    });
  }, [_password, min_length, max_length]);

  const hasPassedComplexity = useMemo(
    () => Object.keys(failedValidations || {}).length === 0 && !!_password,
    [failedValidations, _password],
  );

  const hasFailedComplexity = useMemo(
    () => Object.keys(failedValidations || {}).length > 0 && !!_password,
    [failedValidations, _password],
  );

  const setPassword = useCallback(
    (password: string) => {
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

      const _validationsFailed = Object.fromEntries(_validationsFailedMap);

      if (Object.keys(_validationsFailed).length > 0) {
        const messageWithPrefix = Object.values(_validationsFailed).join(', ');
        const message = `${t(localizationKeys('passwordComplexity.sentencePrefix'))} ${messageWithPrefix}`;
        callbacks?.onValidationFailed?.(_validationsFailed, message);
      } else {
        callbacks?.onValidationSuccess?.();
      }
      setFailedValidations(_validationsFailed);
      _setPassword(password);
    },
    [callbacks?.onValidationFailed, callbacks?.onValidationSuccess, t, min_length, max_length],
  );

  return {
    password: _password,
    passwordComplexity,
    setPassword,
    failedValidations,
    hasPassedComplexity,
    hasFailedComplexity,
  };
};
