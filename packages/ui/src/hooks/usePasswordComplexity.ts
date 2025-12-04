import type {
  ComplexityErrors,
  UsePasswordComplexityConfig,
} from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { validate } from '@clerk/shared/internal/clerk-js/passwords/complexity';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LocalizationKey } from '../localization';
import { localizationKeys, useLocalizations } from '../localization';
import { addFullStop, createListFormat } from '../utils/passwordUtils';

const errorMessages: Record<keyof Omit<ComplexityErrors, 'allowed_special_characters'>, [string, string] | string> = {
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
        locale: locale || 'en',
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
