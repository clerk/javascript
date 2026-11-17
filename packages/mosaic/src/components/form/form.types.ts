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
