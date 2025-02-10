import { type FieldDetails, fieldHasValueSelector, useFormSelector } from '~/internals/machines/form';

import { useFieldFeedback } from './use-field-feedback';

export function useField({ name }: Partial<Pick<FieldDetails, 'name'>>) {
  const hasValue = useFormSelector(fieldHasValueSelector(name));
  const { feedback } = useFieldFeedback({ name });

  const shouldBeHidden = false; // TODO: Implement clerk-js utils
  const hasError = feedback ? feedback.type === 'error' : false;

  return {
    hasValue,
    props: {
      'data-hidden': shouldBeHidden ? true : undefined,
      serverInvalid: hasError,
    },
  };
}
