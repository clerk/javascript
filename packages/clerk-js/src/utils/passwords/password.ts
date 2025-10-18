import type { PasswordSettingsData, PasswordValidation, ValidatePasswordCallbacks } from '@clerk/shared/types';
import { noop } from '@clerk/shared/utils';

import { loadZxcvbn } from '../zxcvbn';
import { createValidateComplexity } from './complexity';
import { createValidatePasswordStrength } from './strength';

export type UsePasswordConfig = PasswordSettingsData & {
  validatePassword: boolean;
};

export type UsePasswordCbs = {
  onValidationError?: (error: string | undefined) => void;
  onValidationSuccess?: () => void;
  onValidationWarning?: (warning: string) => void;
  onValidationInfo?: (info: string) => void;
  onValidationComplexity?: (b: boolean) => void;
};

export const createValidatePassword = (config: UsePasswordConfig, callbacks?: ValidatePasswordCallbacks) => {
  const { onValidation = noop, onValidationComplexity = noop } = callbacks || {};
  const { show_zxcvbn, validatePassword: validatePasswordProp } = config;
  const getComplexity = createValidateComplexity(config);
  const getScore = createValidatePasswordStrength(config);
  let result: PasswordValidation = {} satisfies PasswordValidation;

  return (password: string, internalCallbacks?: ValidatePasswordCallbacks) => {
    const {
      onValidation: internalOnValidation = onValidation,
      onValidationComplexity: internalOnValidationComplexity = onValidationComplexity,
    } = internalCallbacks || {};
    if (!validatePasswordProp) {
      return;
    }

    /**
     * Validate Complexity
     */
    const failedValidationsComplexity = getComplexity(password);
    internalOnValidationComplexity(Object.keys(failedValidationsComplexity).length === 0);
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
        internalOnValidation({
          ...result,
          strength,
        });
      });
    }

    if (result.complexity && Object.keys(result.complexity).length === 0 && show_zxcvbn) {
      return;
    }

    internalOnValidation(result);
  };
};
