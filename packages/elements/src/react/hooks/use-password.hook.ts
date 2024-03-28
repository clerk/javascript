import { useClerk } from '@clerk/clerk-react';
import { noop } from '@clerk/shared';
import type { PasswordValidation } from '@clerk/types';
import * as React from 'react';

// This hook should mimic the already existing usePassword hook in the clerk-js package
// @see packages/clerk-js/src/ui/hooks/usePassword.ts

type UsePasswordCallbacks = {
  onValidationError?: (error: string | undefined) => void;
  onValidationSuccess?: () => void;
  onValidationWarning?: (warning: string) => void;
  onValidationInfo?: (info: string) => void;
  onValidationComplexity?: (b: boolean) => void;
};

/**
 * TODO
 */
export const usePassword = (callbacks?: UsePasswordCallbacks) => {
  const clerk = useClerk();

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
      if (Object.values(res?.complexity || {}).length > 0) {
        const message = 'TODO';

        if (res.complexity?.min_length) {
          return onValidationInfo(message);
        }

        return onValidationError(message);
      }

      /**
       * Failed strength
       */
      if (res?.strength?.state === 'fail') {
        const error = 'TODO';
        return onValidationError(error);
      }

      /**
       * Password meets all criteria but could be stronger
       */
      if (res?.strength?.state === 'pass') {
        const error = 'TODO';
        return onValidationWarning(error);
      }

      /**
       * Password meets all criteria and is strong
       */
      return onValidationSuccess();
    },
    [callbacks],
  );

  const validatePassword = React.useMemo(() => {
    return (password: string) => {
      return clerk.client.signIn.validatePassword(password, {
        onValidation: onValidate,
        onValidationComplexity,
      });
    };
  }, [onValidate]);

  return {
    validatePassword,
  };
};
