import type { Autocomplete, PasswordSettingsData } from '@clerk/types';

// Copied from packages/clerk-js/src/ui/hooks/usePasswordComplexity.ts

type ComplexityErrors = {
  [key in keyof Partial<Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>>]?: boolean;
};

export type ComplexityConfig = Omit<PasswordSettingsData, 'disable_hibp' | 'min_zxcvbn_strength' | 'show_zxcvbn'>;

const errorMessages: Record<keyof Omit<ComplexityErrors, 'allowed_special_characters'>, [string, string] | string> = {
  max_length: ['less than %length% characters', 'length'],
  min_length: ['%length% or more characters', 'length'],
  require_numbers: 'a number',
  require_lowercase: 'a lowercase letter',
  require_uppercase: 'an uppercase letter',
  require_special_char: 'a special character',
};

export type ErrorMessagesKey = Autocomplete<keyof typeof errorMessages>;

const createListFormat = (message: string[]) => {
  let messageWithPrefix: string;
  if ('ListFormat' in Intl) {
    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
    messageWithPrefix = formatter.format(message);
  } else {
    messageWithPrefix = message.join(', ');
  }

  return messageWithPrefix;
};

type GeneratePasswordErrorTextProps = {
  config: ComplexityConfig;
  failedValidations: ComplexityErrors | undefined;
};

export const generatePasswordErrorText = ({ config, failedValidations }: GeneratePasswordErrorTextProps) => {
  const keys: ErrorMessagesKey[] = [];

  if (!failedValidations || Object.keys(failedValidations).length === 0) {
    return {
      keys,
      message: '',
    };
  }

  // show min length error first by itself
  const hasMinLengthError = failedValidations?.min_length || false;

  const messages = Object.entries(failedValidations)
    .filter(k => (hasMinLengthError ? k[0] === 'min_length' : true))
    .filter(([, v]) => !!v)
    .map(([k]) => {
      const entry = k as keyof typeof errorMessages;
      keys.push(entry);
      const errorKey = errorMessages[entry];

      if (Array.isArray(errorKey)) {
        const [msg, replaceValue] = errorKey;
        return msg.replace(`%${replaceValue}%`, config[k as keyof ComplexityConfig] as string);
      }
      return errorKey;
    });

  const messageWithPrefix = createListFormat(messages);

  return {
    keys,
    message: `Your password must contain ${messageWithPrefix}.`,
  };
};
