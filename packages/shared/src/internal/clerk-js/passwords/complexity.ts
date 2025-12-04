import type { PasswordSettingsData } from '@/types';

export type ComplexityErrors = {
  [key in keyof Partial<Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>>]?: boolean;
};

export type UsePasswordComplexityConfig = Omit<
  PasswordSettingsData,
  'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'
>;

const createTestComplexityCases = (config: Pick<UsePasswordComplexityConfig, 'allowed_special_characters'>) => {
  let specialCharsRegex: RegExp;
  if (config.allowed_special_characters) {
    // Avoid a nested group by escaping the `[]` characters
    let escaped = config.allowed_special_characters.replace('[', '\\[');
    escaped = escaped.replace(']', '\\]');
    specialCharsRegex = new RegExp(`[${escaped}]`);
  } else {
    specialCharsRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
  }

  return (
    password: string,
    {
      minLength,
      maxLength,
    }: {
      minLength: number;
      maxLength: number;
    },
  ) => {
    return {
      max_length: password.length < maxLength,
      min_length: password.length >= minLength,
      require_numbers: /\d/.test(password),
      require_lowercase: /[a-z]/.test(password),
      require_uppercase: /[A-Z]/.test(password),
      require_special_char: specialCharsRegex.test(password),
    };
  };
};

export const validate = (password: string, config: UsePasswordComplexityConfig): ComplexityErrors => {
  const { max_length, min_length, require_special_char, require_lowercase, require_numbers, require_uppercase } =
    config;
  const testComplexityCases = createTestComplexityCases(config);
  const testCases = testComplexityCases(password, {
    maxLength: config.max_length,
    minLength: config.min_length,
  });

  const keys = {
    max_length,
    min_length,
    require_special_char,
    require_lowercase,
    require_numbers,
    require_uppercase,
  };

  const _validationsFailedMap = new Map();
  for (const k in keys) {
    const key = k as keyof typeof keys;

    if (!keys[key]) {
      continue;
    }

    if (!testCases[key]) {
      _validationsFailedMap.set(key, true);
    }
  }

  return Object.freeze(Object.fromEntries(_validationsFailedMap));
};

export const createValidateComplexity = (config: UsePasswordComplexityConfig) => {
  return (password: string) => validate(password, config);
};
