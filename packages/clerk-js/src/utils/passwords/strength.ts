import type { PasswordSettingsData, ZxcvbnResult } from '@clerk/shared/types';

import type { zxcvbnFN } from '../zxcvbn';

type PasswordStrength =
  | {
      state: 'excellent';
      result: ZxcvbnResult;
    }
  | {
      state: 'pass' | 'fail';
      keys: string[];
      result: ZxcvbnResult;
    };

type CreateValidatePasswordStrength = (
  options: Pick<PasswordSettingsData, 'min_zxcvbn_strength'> & { onResult?: (res: ZxcvbnResult) => void },
) => (zxcvbn: zxcvbnFN) => (password: string) => PasswordStrength;

export const createValidatePasswordStrength: CreateValidatePasswordStrength = ({ min_zxcvbn_strength, onResult }) => {
  return zxcvbn => password => {
    const result = zxcvbn(password);
    onResult?.(result);

    if (result.score >= min_zxcvbn_strength && result.score < 3) {
      return {
        state: 'pass',
        keys: ['unstable__errors.zxcvbn.couldBeStronger'],
        result,
      };
    }

    if (result.score >= min_zxcvbn_strength) {
      return {
        state: 'excellent',
        result,
      };
    }

    return {
      state: 'fail',
      keys: [
        'unstable__errors.zxcvbn.notEnough',
        ...result.feedback.suggestions.map(er => `unstable__errors.zxcvbn.suggestions.${er}` as any),
      ],
      result,
    };
  };
};
