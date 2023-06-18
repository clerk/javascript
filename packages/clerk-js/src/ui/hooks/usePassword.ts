import { noop } from '@clerk/shared';
import type { PasswordSettingsData } from '@clerk/types';
import { useCallback, useMemo } from 'react';

import { localizationKeys, useLocalizations } from '../localization';
import type { FormControlState } from '../utils';
import { loadZxcvbn } from '../utils';
import type { ComplexityErrors } from './usePasswordComplexity';
import { createValidateComplexity, generateErrorTextUtil } from './usePasswordComplexity';
import type { PasswordStrength } from './usePasswordStrength';
import { createValidatePasswordStrength } from './usePasswordStrength';

type UsePasswordConfig = PasswordSettingsData & {
  validatePassword: boolean;
};

type PasswordValidation = {
  complexity?: ComplexityErrors;
  strength?: PasswordStrength;
};

type UsePasswordCbs = {
  onValidationFailed?: (errorMessage: string | undefined) => void;
  onValidationSuccess?: () => void;
  onValidationWarning?: (warningMessage: string) => void;
  onValidationComplexity?: (b: boolean) => void;
};

type ValidatePasswordCbs = {
  onValidation?: (res: PasswordValidation) => void;
  onValidationComplexity?: (b: boolean) => void;
};

export const MIN_PASSWORD_LENGTH = 8;

const createValidatePassword = (config: UsePasswordConfig, callbacks?: ValidatePasswordCbs) => {
  const { onValidation = noop, onValidationComplexity = noop } = callbacks || {};
  const { show_zxcvbn, validatePassword: validatePasswordProp } = config;
  const getComplexity = createValidateComplexity(config);
  const getScore = createValidatePasswordStrength(config);
  let result = {} satisfies PasswordValidation;

  return (password: string) => {
    if (!validatePasswordProp) {
      return;
    }

    /**
     * Validate Complexity
     */
    const failedValidationsComplexity = getComplexity(password);
    onValidationComplexity(Object.keys(failedValidationsComplexity).length === 0);
    result = {
      ...result,
      complexity: failedValidationsComplexity,
    };
    /**
     * Validate score
     */
    if (show_zxcvbn) {
      /**
       * Lazy load zxcvbn without preventing a complexityError to be thrown if it exists
       */
      void loadZxcvbn().then(zxcvbn => {
        const setPasswordScore = getScore(zxcvbn);
        const strength = setPasswordScore(password);

        result = {
          ...result,
          strength,
        };
        onValidation({
          ...result,
          strength,
        });
      });
    }

    onValidation({
      ...result,
      complexity: failedValidationsComplexity,
    });
  };
};

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
    (confirmPassword: string) =>
      passwordField.value.trim().length >= MIN_PASSWORD_LENGTH && passwordField.value === confirmPassword,
    [passwordField.value],
  );

  const isPasswordMatch = useMemo(() => checkPasswordMatch(confirmPasswordField.value), [confirmPasswordField.value]);

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
