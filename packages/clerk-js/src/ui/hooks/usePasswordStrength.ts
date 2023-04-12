import { noop } from '@clerk/shared';
import type { ZxcvbnResult } from '@zxcvbn-ts/core';
import { useCallback, useState } from 'react';

import { useEnvironment } from '../contexts';
import { localizationKeys, useLocalizations } from '../localization';
import type { zxcvbnFN } from '../utils';

type UsePasswordStrengthCbs = {
  onValidationFailed?: (validationErrorMessages: string[], errorMessage: string) => void;
  onValidationSuccess?: () => void;
};

export const usePasswordStrength = (callbacks?: UsePasswordStrengthCbs) => {
  const { onValidationFailed = noop, onValidationSuccess = noop } = callbacks || {};
  const {
    userSettings: {
      passwordSettings: { min_zxcvbn_strength },
    },
  } = useEnvironment();

  const { t } = useLocalizations();
  const [zxcvbnResult, setZxcvbnResult] = useState<ZxcvbnResult | undefined>(undefined);

  const getScore = useCallback(
    (zxcvbn: zxcvbnFN) => (password: string) => {
      const result = zxcvbn(password);
      setZxcvbnResult(result);

      let message = '';
      if (result?.feedback?.suggestions?.length > 0) {
        const errors = [...result.feedback.suggestions];
        const fErrors = errors.map(er => t(localizationKeys(`unstable__errors.zxcvbn.suggestions.${er}` as any)));
        if (result.score < min_zxcvbn_strength) {
          fErrors.unshift(t(localizationKeys('unstable__errors.zxcvbn.notEnough')));
        }
        message = fErrors.join(' ');
        onValidationFailed(fErrors, fErrors.join(' '));
      } else if (result.score >= min_zxcvbn_strength) {
        onValidationSuccess?.();
      }
      return {
        errorText: message,
      };
    },
    [onValidationFailed, onValidationSuccess, min_zxcvbn_strength],
  );
  return {
    getScore,
    zxcvbnResult,
  };
};
