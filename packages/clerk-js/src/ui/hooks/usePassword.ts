import type { PasswordValidation } from '@clerk/shared/types';
import { noop } from '@clerk/shared/utils';
import { useCallback, useMemo } from 'react';

import type { UsePasswordCbs, UsePasswordConfig } from '../../utils/passwords/password';
import { createValidatePassword } from '../../utils/passwords/password';
import { localizationKeys, useLocalizations } from '../localization';
import type { FormControlState } from '../utils/useFormControl';
import { generateErrorTextUtil } from './usePasswordComplexity';

export const usePassword = (config: UsePasswordConfig, callbacks?: UsePasswordCbs) => {
  const { t, locale } = useLocalizations();
  const {
    onValidationError = noop,
    onValidationSuccess = noop,
    onValidationWarning = noop,
    onValidationInfo = noop,
    onValidationComplexity,
  } = callbacks || {};

  const onValidate = useCallback(
    (res: PasswordValidation) => {
      /**
       * Failed complexity rules always have priority
       */
      if (Object.values(res?.complexity || {}).length > 0) {
        const message = generateErrorTextUtil({
          config,
          t,
          failedValidations: res.complexity,
          locale,
        });

        if (res.complexity?.min_length) {
          return onValidationInfo(message);
        }

        return onValidationError(message);
      }

      /**
       * Failed strength
       */
      if (res?.strength?.state === 'fail') {
        const error = res.strength.keys.map(localizationKey => t(localizationKeys(localizationKey as any))).join(' ');
        return onValidationError(error);
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

  const validatePassword = useMemo(() => {
    return createValidatePassword(config, {
      onValidation: onValidate,
      onValidationComplexity,
    });
  }, [onValidate]);

  return {
    validatePassword,
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

  const setConfirmPasswordFeedback = useCallback(
    (password: string) => {
      if (checkPasswordMatch(password)) {
        confirmPasswordField.setSuccess(t(localizationKeys('formFieldError__matchingPasswords')));
      } else {
        confirmPasswordField.setError(t(localizationKeys('formFieldError__notMatchingPasswords')));
      }
    },
    [confirmPasswordField.setError, confirmPasswordField.setSuccess, t, checkPasswordMatch],
  );

  return {
    setConfirmPasswordFeedback,
    isPasswordMatch,
  };
};
