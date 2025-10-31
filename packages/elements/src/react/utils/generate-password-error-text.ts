import type { Autocomplete, PasswordSettingsData } from '@clerk/shared/types';

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
export type ErrorCodeOrTuple = ErrorMessagesKey | [ErrorMessagesKey, Record<string, string | number>];

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

/**
 * This function builds a single entry in the error array returned from generatePasswordErrorText. It returns either a
 * string or a tuple containing the error code and relevant entries from the instance's password complexity conrfig.
 * @param key The string respresentation of a possible error during password validation
 * @param config The instance's password complexity configuration
 * @returns The error code or a tuple containing the error code and relevant entries from the config
 */
function buildErrorTuple(key: ErrorMessagesKey, config: ComplexityConfig): ErrorCodeOrTuple {
  switch (key) {
    case 'max_length':
      return [key, { max_length: config.max_length }];
    case 'min_length':
      return [key, { min_length: config.min_length }];
    case 'require_special_char':
      return [key, { allowed_special_characters: config.allowed_special_characters }];
    default:
      return key;
  }
}

export const generatePasswordErrorText = ({ config, failedValidations }: GeneratePasswordErrorTextProps) => {
  const codes: ErrorCodeOrTuple[] = [];

  if (!failedValidations || Object.keys(failedValidations).length === 0) {
    return {
      codes,
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
      const errorTuple = buildErrorTuple(entry, config);
      codes.push(errorTuple);
      const errorKey = errorMessages[entry];

      if (Array.isArray(errorKey)) {
        const [msg, replaceValue] = errorKey;
        return msg.replace(`%${replaceValue}%`, config[k as keyof ComplexityConfig] as string);
      }
      return errorKey;
    });

  const messageWithPrefix = createListFormat(messages);

  return {
    codes,
    message: `Your password must contain ${messageWithPrefix}.`,
  };
};
