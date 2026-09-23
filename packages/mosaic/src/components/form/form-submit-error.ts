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
  readonly banner: string | undefined;
  readonly fields: FormFieldErrors<TValues> | undefined;

  constructor({ message, fields }: FormError<TValues>) {
    super(message ?? Object.values(fields ?? {}).join(' '));
    this.name = 'FormSubmitError';
    this.banner = message;
    this.fields = fields;
  }
}
