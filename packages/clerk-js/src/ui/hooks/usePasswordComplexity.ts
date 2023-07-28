import type { PasswordSettingsData } from '@clerk/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LocalizationKey } from '../localization';
import { localizationKeys, useLocalizations } from '../localization';
import { addFullStop, createListFormat } from '../utils';

export type ComplexityErrors = {
  [key in keyof Partial<Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>>]?: boolean;
};

type UsePasswordComplexityConfig = Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>;

const createTestComplexityCases = (config: Pick<UsePasswordComplexityConfig, 'allowed_special_characters'>) => {
  let specialCharsRegex: RegExp;
  if (config.allowed_special_characters) {
    // Avoid a nested group by escaping the `[]` characters
    let escaped = config.allowed_special_characters.replace('[', '\\[');
    escaped = escaped.replace(']', '\\]');
    specialCharsRegex = new RegExp(`[${escaped}]`);
  } else {
    specialCharsRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
  }

  return (
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
};

const errorMessages = {
  max_length: ['unstable__errors.passwordComplexity.maximumLength', 'length'],
  min_length: ['unstable__errors.passwordComplexity.minimumLength', 'length'],
  require_numbers: 'unstable__errors.passwordComplexity.requireNumbers',
  require_lowercase: 'unstable__errors.passwordComplexity.requireLowercase',
  require_uppercase: 'unstable__errors.passwordComplexity.requireUppercase',
  require_special_char: 'unstable__errors.passwordComplexity.requireSpecialCharacter',
};

export const generateErrorTextUtil = ({
  config,
  failedValidations,
  locale,
  t,
}: {
  config: UsePasswordComplexityConfig;
  failedValidations: ComplexityErrors | undefined;
  locale: string;
  t: (localizationKey: LocalizationKey | string | undefined) => string;
}) => {
  if (!failedValidations || Object.keys(failedValidations).length === 0) {
    return '';
  }

  // show min length error first by itself
  const hasMinLengthError = failedValidations?.min_length || false;

  const messages = Object.entries(failedValidations)
    .filter(k => (hasMinLengthError ? k[0] === 'min_length' : true))
    .filter(([, v]) => !!v)
    .map(([k]) => {
      const localizedKey = errorMessages[k as keyof typeof errorMessages];
      if (Array.isArray(localizedKey)) {
        const [lk, attr] = localizedKey;
        return t(localizationKeys(lk as any, { [attr]: config[k as keyof UsePasswordComplexityConfig] as any }));
      }
      return t(localizationKeys(localizedKey as any));
    });

  const messageWithPrefix = createListFormat(messages, locale);

  return addFullStop(
    `${t(localizationKeys('unstable__errors.passwordComplexity.sentencePrefix'))} ${messageWithPrefix}`,
  );
};

const validate = (password: string, config: UsePasswordComplexityConfig): ComplexityErrors => {
  const { max_length, min_length, require_special_char, require_lowercase, require_numbers, require_uppercase } =
    config;
  const testComplexityCases = createTestComplexityCases(config);
  const testCases = testComplexityCases(password, {
    maxLength: config.max_length,
    minLength: config.min_length,
  });

  const keys = {
    max_length,
    min_length,
    require_special_char,
    require_numbers,
    require_lowercase,
    require_uppercase,
  };

  const _validationsFailedMap = new Map();
  for (const k in keys) {
    const key = k as keyof typeof keys;

    if (!keys[key]) {
      continue;
    }

    if (!testCases[key]) {
      _validationsFailedMap.set(key, true);
    }
  }

  return Object.freeze(Object.fromEntries(_validationsFailedMap));
};

export const createValidateComplexity = (config: UsePasswordComplexityConfig) => {
  return (password: string) => validate(password, config);
};

export const usePasswordComplexity = (config: UsePasswordComplexityConfig) => {
  const [password, _setPassword] = useState('');
  const [failedValidations, setFailedValidations] = useState<ComplexityErrors>();
  const { t, locale } = useLocalizations();

  // Populates failedValidations state
  useEffect(() => {
    getComplexity('');
  }, []);

  const hasPassedComplexity = useMemo(
    () => !!password && Object.keys(failedValidations || {}).length === 0,
    [failedValidations, password],
  );

  const hasFailedComplexity = useMemo(
    () => !!password && Object.keys(failedValidations || {}).length > 0,
    [failedValidations, password],
  );

  const generateErrorText = useCallback(
    (failedValidations: ComplexityErrors | undefined) => {
      return generateErrorTextUtil({
        config,
        t,
        locale,
        failedValidations,
      });
    },
    [t, locale],
  );

  const failedValidationsText = useMemo(() => generateErrorText(failedValidations), [failedValidations]);

  const getComplexity = useCallback((password: string) => {
    _setPassword(password);
    const complexity = validate(password, config);
    setFailedValidations(complexity);
    return {
      failedValidationsText: generateErrorText(complexity),
    };
  }, []);

  return {
    password,
    getComplexity,
    failedValidations,
    failedValidationsText,
    hasFailedComplexity,
    hasPassedComplexity,
  };
};
