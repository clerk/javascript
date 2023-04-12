import { noop } from '@clerk/shared';
import type { PasswordSettingsData } from '@clerk/types';
import { useCallback, useRef } from 'react';

import { loadZxcvbn } from '../utils';
import { usePasswordComplexity } from './usePasswordComplexity';
import { usePasswordStrength } from './usePasswordStrength';

type UsePasswordConfig = PasswordSettingsData & {
  strengthMeter: boolean;
  complexity: boolean;
};

type UsePasswordCbs = {
  onValidationFailed?: (errorMessage: string | undefined) => void;
  onValidationSuccess?: () => void;
};

export const usePassword = (config: UsePasswordConfig, callbacks?: UsePasswordCbs) => {
  const { onValidationFailed = noop, onValidationSuccess = noop } = callbacks || {};
  const { strengthMeter, show_zxcvbn, complexity } = config;
  const { setPassword: setPasswordComplexity } = usePasswordComplexity(config);
  const { getScore } = usePasswordStrength();
  const hasZxcvbnDownloadRef = useRef(false);

  const reportSuccessOrError = useCallback(
    (error: string | undefined) => {
      if (error) {
        onValidationFailed(error);
      } else {
        onValidationSuccess();
      }
    },
    [callbacks],
  );

  const setPassword = useCallback(
    (_password: string) => {
      let zxcvbnError = '';
      let complexityError = '';

      if (!complexity && !(strengthMeter && show_zxcvbn)) {
        return;
      }

      if (complexity) {
        const { failedValidationsText } = setPasswordComplexity(_password);
        complexityError = failedValidationsText;
      }

      if (complexity && strengthMeter && show_zxcvbn) {
        void loadZxcvbn().then(zxcvbn => {
          hasZxcvbnDownloadRef.current = true;
          const setPasswordScore = getScore(zxcvbn);
          const { errorText } = setPasswordScore(_password);
          zxcvbnError = errorText;
          reportSuccessOrError(complexityError || zxcvbnError);
        });

        if (!hasZxcvbnDownloadRef.current && complexityError) {
          onValidationFailed(complexityError);
        }
        return;
      }
      reportSuccessOrError(complexityError || zxcvbnError);
    },
    [onValidationFailed, onValidationSuccess, strengthMeter, show_zxcvbn, complexity, getScore, setPasswordComplexity],
  );

  return {
    setPassword,
    getScore,
  };
};
