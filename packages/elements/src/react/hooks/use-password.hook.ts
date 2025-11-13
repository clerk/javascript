import { useClerk } from '@clerk/shared/react';
import type { PasswordSettingsData, PasswordValidation } from '@clerk/shared/types';
import { noop } from '@clerk/shared/utils';
import * as React from 'react';

import type { ErrorCodeOrTuple } from '../utils/generate-password-error-text';
import { generatePasswordErrorText } from '../utils/generate-password-error-text';

// This hook should mimic the already existing usePassword hook in the clerk-js package
// @see packages/clerk-js/src/ui/hooks/usePassword.ts

export type PasswordConfig = Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>;

type UsePasswordCallbacks = {
  onValidationError?: (error: string | undefined, codes: ErrorCodeOrTuple[]) => void;
  onValidationSuccess?: () => void;
  onValidationWarning?: (warning: string, codes: ErrorCodeOrTuple[]) => void;
  onValidationInfo?: (info: string, codes: ErrorCodeOrTuple[]) => void;
  onValidationComplexity?: (b: boolean) => void;
};

export const usePassword = (callbacks?: UsePasswordCallbacks) => {
  const clerk = useClerk();
  // @ts-expect-error - ignore error for now
  const passwordSettings = clerk.__unstable__environment?.userSettings.passwordSettings as PasswordSettingsData;
  const { disable_hibp, min_zxcvbn_strength, show_zxcvbn, ...config } = passwordSettings || {};

  const {
    onValidationError = noop,
    onValidationSuccess = noop,
    onValidationWarning = noop,
    onValidationInfo = noop,
    onValidationComplexity,
  } = callbacks || {};

  const onValidate = React.useCallback(
    (res: PasswordValidation) => {
      /**
       * Failed complexity rules always have priority
       */
      if (res.complexity) {
        if (Object.values(res?.complexity).length > 0) {
          const { message, codes } = generatePasswordErrorText({
            config,
            failedValidations: res.complexity,
          });

          if (res.complexity?.min_length) {
            return onValidationInfo(message, codes);
          }
          return onValidationError(message, codes);
        }
      }

      /**
       * Failed strength
       */
      if (res?.strength?.state === 'fail') {
        const keys = res.strength.keys;
        const error = JSON.stringify(keys);
        return onValidationError(error, keys);
      }

      /**
       * Password meets all criteria but could be stronger
       */
      if (res?.strength?.state === 'pass') {
        const keys = res.strength.keys;
        const error = JSON.stringify(keys);
        return onValidationWarning(error, keys);
      }

      /**
       * Password meets all criteria and is strong
       */
      return onValidationSuccess();
    },
    [callbacks, config],
  );

  const validatePassword = React.useMemo(() => {
    return (password: string) => {
      return clerk.client.signUp.validatePassword(password, {
        onValidation: onValidate,
        onValidationComplexity,
      });
    };
  }, [onValidate]);

  return {
    validatePassword,
  };
};
