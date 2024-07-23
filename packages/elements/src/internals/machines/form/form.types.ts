import type { ClerkElementsFieldError } from '~/internals/errors';
import type { FieldStates } from '~/react/common/form/types';
import type { ErrorMessagesKey } from '~/react/utils/generate-password-error-text';

export type FormDefaultValues = Map<string, FieldDetailsWithValue['value']>;
export type FormDefaultCheckeds = Map<string, FieldDetailsWithChecked['checked']>;

interface FeedbackBase {
  codes?: Array<ErrorMessagesKey>;
}

export interface FeedbackErrorType extends FeedbackBase {
  type: Extract<FieldStates, 'error'>;
  message: ClerkElementsFieldError;
}

export interface FeedbackOtherType extends FeedbackBase {
  type: Exclude<FieldStates, 'idle' | 'error'>;
  message: string;
}

interface FieldDetailsBase {
  name?: string;
  feedback?: FeedbackErrorType | FeedbackOtherType;
}

export interface FieldDetailsWithValue extends FieldDetailsBase {
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'month'
    | 'week'
    | 'otp';
  value?: string | readonly string[] | number;
}

export interface FieldDetailsWithChecked extends FieldDetailsBase {
  type: 'checkbox';
  checked?: boolean;
}

export type FieldDetails = FieldDetailsWithValue | FieldDetailsWithChecked;

export type FormFields = Map<string, FieldDetails>;
