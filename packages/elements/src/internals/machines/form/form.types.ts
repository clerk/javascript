import type { ClerkElementsFieldError } from '~/internals/errors';
import type { FieldStates } from '~/react/common/form/types';
import type { ErrorMessagesKey } from '~/react/utils/generate-password-error-text';

export type FormDefaultValues = Map<string, FieldDetails['value']>;

interface FeedbackBase {
  passwordValidationKeys?: Array<ErrorMessagesKey>;
}

export interface FeedbackErrorType extends FeedbackBase {
  type: Extract<FieldStates, 'error'>;
  message: ClerkElementsFieldError;
}

export interface FeedbackOtherType extends FeedbackBase {
  type: Exclude<FieldStates, 'idle' | 'error'>;
  message: string;
}

export type FieldDetails = {
  name?: string;
  value?: string | readonly string[] | number;
  feedback?: FeedbackErrorType | FeedbackOtherType;
};

export type FormFields = Map<string, FieldDetails>;
