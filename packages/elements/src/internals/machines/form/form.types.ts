import type { ClerkElementsFieldError } from '~/internals/errors';
import type { FieldStates } from '~/react/common/form/types';
import type { ErrorMessagesKey } from '~/react/utils/generate-password-error-text';

export type FormDefaultValues = Map<string, FieldDetails['value']>;

// TODO: Add type guard so that type: "error" is messages?: ClerkElementsFieldError[]
export type FieldDetails = {
  name?: string;
  value?: string | readonly string[] | number;
  feedback?: {
    type: Exclude<FieldStates, 'idle'>;
    message: string | ClerkElementsFieldError;
    passwordValidationKeys?: Array<ErrorMessagesKey>;
  };
};

export type FormFields = Map<string, FieldDetails>;
