import type { ZxcvbnResult } from '@zxcvbn-ts/core';
import { useCallback, useState } from 'react';

import { useEnvironment } from '../contexts';
import { localizationKeys, useLocalizations } from '../localization';
import type { zxcvbnFN } from '../utils';

export const usePasswordStrength = () => {
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

      let errorText = '';
      let warningText = '';
      if (result?.feedback?.suggestions?.length > 0 && result.score < min_zxcvbn_strength) {
        const errors = [...result.feedback.suggestions];
        const fErrors = errors.map(er => t(localizationKeys(`unstable__errors.zxcvbn.suggestions.${er}` as any)));
        if (result.score < min_zxcvbn_strength) {
          fErrors.unshift(t(localizationKeys('unstable__errors.zxcvbn.notEnough')));
        }
        errorText = fErrors.join(' ');
        // onValidationFailed(fErrors, fErrors.join(' '));
      } else if (result.score >= min_zxcvbn_strength && result.score < 3) {
        warningText = t(localizationKeys('unstable__errors.zxcvbn.couldBeStronger'));
        // onValidationWarning(warningText);
      } else if (result.score >= min_zxcvbn_strength) {
        // onValidationSuccess?.();
      }
      return {
        errorText,
        warningText,
      };
    },
    [min_zxcvbn_strength],
  );
  return {
    getScore,
    zxcvbnResult,
  };
};
