export type FieldFeedbackType = 'error' | 'warning' | 'success' | 'info';

export interface FieldFeedback {
  type: FieldFeedbackType;
  message: string;
}

export type FormFieldErrors<TValues extends object> = Partial<Record<keyof TValues, string>>;

export interface FormError<TValues extends object> {
  message?: string;
  fields?: FormFieldErrors<TValues>;
}

export class FormSubmitError<TValues extends object = Record<string, unknown>> extends Error {
  readonly fields?: FormFieldErrors<TValues>;

  constructor(message: string, fields?: FormFieldErrors<TValues>) {
    super(message);
    this.name = 'FormSubmitError';
    this.fields = fields;
  }
}
