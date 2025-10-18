import type { PasswordSettingsData } from './userSettings';

export interface ZxcvbnResult {
  feedback: {
    warning: string | null;
    suggestions: string[];
  };
  score: 0 | 1 | 2 | 3 | 4;
  password: string;
  guesses: number;
  guessesLog10: number;
  calcTime: number;
}

export type ComplexityErrors = {
  [key in keyof Partial<Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>>]?: boolean;
};

export type PasswordValidation = {
  complexity?: ComplexityErrors;
  strength?: PasswordStrength;
};

export type ValidatePasswordCallbacks = {
  onValidation?: (res: PasswordValidation) => void;
  onValidationComplexity?: (b: boolean) => void;
};

export type PasswordStrength<T = ZxcvbnResult> =
  | {
      state: 'excellent';
      result: T;
    }
  | {
      state: 'pass' | 'fail';
      keys: string[];
      result: T;
    };
