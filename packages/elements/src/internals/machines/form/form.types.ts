import type { ClerkElementsFieldError } from '~/internals/errors';
import type { FieldStates } from '~/react/common/form/types';
import type { PasswordConfig } from '~/react/hooks/use-password.hook';
import type { ErrorCodeOrTuple } from '~/react/utils/generate-password-error-text';

export type FormDefaultValues = Map<string, FieldDetails['value']>;

interface FeedbackBase {
  codes?: Array<ErrorCodeOrTuple>;
}

export interface FeedbackErrorType extends FeedbackBase {
  message: ClerkElementsFieldError;
  type: Extract<FieldStates, 'error'>;
}

export interface FeedbackOtherType extends FeedbackBase {
  message: string;
  type: Exclude<FieldStates, 'idle' | 'error'>;
}

export interface FeedbackPasswordErrorType extends FeedbackErrorType {
  config?: PasswordConfig;
}

export interface FeedbackPasswordInfoType extends FeedbackOtherType {
  config?: PasswordConfig;
}

export type FieldDetails = {
  checked?: boolean;
  disabled?: boolean;
  feedback?: FeedbackErrorType | FeedbackOtherType | FeedbackPasswordErrorType | FeedbackPasswordInfoType;
  name?: string;
  type: React.HTMLInputTypeAttribute;
  value?: string | readonly string[] | number;
};

export type FormFields = Map<string, FieldDetails>;
