import { noop } from '@clerk/shared';
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

type UsePasswordComplexityConfig = Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>;
type UsePasswordComplexityCbs = {
  onValidationFailed?: (validationErrorMessages: ComplexityErrorMessages, errorMessage: string) => void;
  onValidationSuccess?: () => void;
};

export const usePasswordComplexity = (config: UsePasswordComplexityConfig, callbacks?: UsePasswordComplexityCbs) => {
  const { onValidationFailed = noop, onValidationSuccess = noop } = callbacks || {};
  const { min_length, max_length, require_lowercase, require_numbers, require_uppercase, require_special_char } =
    config;

  const [password, _setPassword] = useState('');
  const [failedValidations, setFailedValidations] = useState<ComplexityErrorMessages>({});
  const { t } = useLocalizations();

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
    (failedValidations: ComplexityErrorMessages) => {
      const messageWithPrefix = Object.values(failedValidations).join(', ');
      return `${t(localizationKeys('unstable__errors.passwordComplexity.sentencePrefix'))} ${messageWithPrefix}`;
    },
    [t],
  );

  const failedValidationsText = useMemo(() => generateErrorText(failedValidations), [failedValidations]);

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

      let message = '';
      if (Object.keys(_validationsFailed).length > 0) {
        message = generateErrorText(_validationsFailed);
        onValidationFailed(_validationsFailed, message);
      } else {
        onValidationSuccess();
      }
      setFailedValidations(_validationsFailed);
      _setPassword(password);
      return {
        failedValidationsText: message,
      };
    },
    [callbacks?.onValidationFailed, callbacks?.onValidationSuccess, t, min_length, max_length],
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
