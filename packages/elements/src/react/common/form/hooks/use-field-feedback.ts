import { type FieldDetails, fieldFeedbackSelector, useFormSelector } from '~/internals/machines/form';

export function useFieldFeedback({ name }: Partial<Pick<FieldDetails, 'name'>>) {
  const feedback = useFormSelector(fieldFeedbackSelector(name));

  return {
    feedback,
  };
}
