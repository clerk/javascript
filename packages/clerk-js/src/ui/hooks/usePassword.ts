import { noop } from '@clerk/shared';
import type { PasswordValidation } from '@clerk/types';
import { useCallback, useMemo } from 'react';

import type { UsePasswordCbs, UsePasswordConfig } from '../../utils/passwords/password';
import { createValidatePassword } from '../../utils/passwords/password';
import { localizationKeys, useLocalizations } from '../localization';
import type { FormControlState } from '../utils';
import { generateErrorTextUtil } from './usePasswordComplexity';

export const MIN_PASSWORD_LENGTH = 8;

export const usePassword = (config: UsePasswordConfig, callbacks?: UsePasswordCbs) => {
  const { t, locale } = useLocalizations();
  const {
    onValidationFailed = noop,
    onValidationSuccess = noop,
    onValidationWarning = noop,
    onValidationComplexity,
  } = callbacks || {};

  const onValidate = useCallback(
    (res: PasswordValidation) => {
      /**
       * Failed complexity rules always have priority
       */
      if (Object.values(res?.complexity || {}).length > 0) {
        return onValidationFailed(
          generateErrorTextUtil({
            config,
            t,
            failedValidations: res.complexity,
            locale,
          }),
        );
      }

      /**
       * Failed strength
       */
      if (res?.strength?.state === 'fail') {
        const error = res.strength.keys.map(localizationKey => t(localizationKeys(localizationKey as any))).join(' ');
        return onValidationFailed(error);
      }

      /**
       * Password meets all criteria but could be stronger
       */
      if (res?.strength?.state === 'pass') {
        const error = res.strength.keys.map(localizationKey => t(localizationKeys(localizationKey as any))).join(' ');
        return onValidationWarning(error);
      }

      /**
       * Password meets all criteria and is strong
       */
      return onValidationSuccess();
    },
    [callbacks, t, locale],
  );

  const setPassword = useMemo(() => {
    return createValidatePassword(config, {
      onValidation: onValidate,
      onValidationComplexity,
    });
  }, [onValidate]);

  return {
    setPassword,
  };
};

export const useConfirmPassword = ({
  passwordField,
  confirmPasswordField,
}: {
  passwordField: FormControlState;
  confirmPasswordField: FormControlState;
}) => {
  const { t } = useLocalizations();
  const checkPasswordMatch = useCallback(
    (confirmPassword: string) => passwordField.value === confirmPassword,
    [passwordField.value],
  );

  const isPasswordMatch = useMemo(
    () => checkPasswordMatch(confirmPasswordField.value),
    [checkPasswordMatch, confirmPasswordField.value],
  );

  const displayConfirmPasswordFeedback = useCallback(
    (password: string) => {
      if (checkPasswordMatch(password)) {
        confirmPasswordField.setSuccessful(t(localizationKeys('formFieldError__matchingPasswords')));
      } else {
        confirmPasswordField.setError(t(localizationKeys('formFieldError__notMatchingPasswords')));
      }
    },
    [confirmPasswordField.setError, confirmPasswordField.setSuccessful, t, checkPasswordMatch],
  );

  return {
    displayConfirmPasswordFeedback,
    isPasswordMatch,
  };
};
