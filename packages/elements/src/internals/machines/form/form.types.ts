import type { ClerkElementsFieldError } from '~/internals/errors';
import type { FieldStates } from '~/react/common/form/types';
import type { PasswordConfig } from '~/react/hooks/use-password.hook';
import type { ErrorCodeOrTuple } from '~/react/utils/generate-password-error-text';

export type FormDefaultValues = Map<string, FieldDetails['value']>;

interface FeedbackBase {
  codes?: Array<ErrorCodeOrTuple>;
}

export interface FeedbackErrorType extends FeedbackBase {
  type: Extract<FieldStates, 'error'>;
  message: ClerkElementsFieldError;
}

export interface FeedbackOtherType extends FeedbackBase {
  type: Exclude<FieldStates, 'idle' | 'error'>;
  message: string;
}

export interface FeedbackPasswordErrorType extends FeedbackErrorType {
  config?: PasswordConfig;
}

export interface FeedbackPasswordInfoType extends FeedbackOtherType {
  config?: PasswordConfig;
}

export type FieldDetails = {
  name?: string;
  type: React.HTMLInputTypeAttribute;
  value?: string | readonly string[] | number;
  checked?: boolean;
  feedback?: FeedbackErrorType | FeedbackOtherType | FeedbackPasswordErrorType | FeedbackPasswordInfoType;
};

export type FormFields = Map<string, FieldDetails>;
