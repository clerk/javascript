import { useClerk } from '@clerk/clerk-react';
import { noop } from '@clerk/shared';
import type { PasswordSettingsData, PasswordValidation } from '@clerk/types';
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
        const error = keys.map(key => get(zxcvbnKeys, key)).join(' ');
        return onValidationError(error, keys);
      }

      /**
       * Password meets all criteria but could be stronger
       */
      if (res?.strength?.state === 'pass') {
        const keys = res.strength.keys;
        const error = keys.map(key => get(zxcvbnKeys, key)).join(' ');
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

const get = (t: Record<string, any>, path: string) => path.split('.').reduce((r, k) => r?.[k], t);

const zxcvbnKeys = {
  unstable__errors: {
    zxcvbn: {
      couldBeStronger: 'Your password works, but could be stronger. Try adding more characters.',
      goodPassword: 'Your password meets all the necessary requirements.',
      notEnough: 'Your password is not strong enough.',
      suggestions: {
        allUppercase: 'Capitalize some, but not all letters.',
        anotherWord: 'Add more words that are less common.',
        associatedYears: 'Avoid years that are associated with you.',
        capitalization: 'Capitalize more than the first letter.',
        dates: 'Avoid dates and years that are associated with you.',
        l33t: "Avoid predictable letter substitutions like '@' for 'a'.",
        longerKeyboardPattern: 'Use longer keyboard patterns and change typing direction multiple times.',
        noNeed: 'You can create strong passwords without using symbols, numbers, or uppercase letters.',
        pwned: 'If you use this password elsewhere, you should change it.',
        recentYears: 'Avoid recent years.',
        repeated: 'Avoid repeated words and characters.',
        reverseWords: 'Avoid reversed spellings of common words.',
        sequences: 'Avoid common character sequences.',
        useWords: 'Use multiple words, but avoid common phrases.',
      },
      warnings: {
        common: 'This is a commonly used password.',
        commonNames: 'Common names and surnames are easy to guess.',
        dates: 'Dates are easy to guess.',
        extendedRepeat: 'Repeated character patterns like "abcabcabc" are easy to guess.',
        keyPattern: 'Short keyboard patterns are easy to guess.',
        namesByThemselves: 'Single names or surnames are easy to guess.',
        pwned: 'Your password was exposed by a data breach on the Internet.',
        recentYears: 'Recent years are easy to guess.',
        sequences: 'Common character sequences like "abc" are easy to guess.',
        similarToCommon: 'This is similar to a commonly used password.',
        simpleRepeat: 'Repeated characters like "aaa" are easy to guess.',
        straightRow: 'Straight rows of keys on your keyboard are easy to guess.',
        topHundred: 'This is a frequently used password.',
        topTen: 'This is a heavily used password.',
        userInputs: 'There should not be any personal or page related data.',
        wordByItself: 'Single words are easy to guess.',
      },
    },
  },
};
