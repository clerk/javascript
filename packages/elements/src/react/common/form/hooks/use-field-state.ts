import { type FieldDetails, fieldHasValueSelector, useFormSelector } from '~/internals/machines/form';

import { FIELD_STATES, type FieldStates } from '../types';
import { useFieldFeedback } from './use-field-feedback';

/**
 * Given a field name, determine the current state of the field
 */
export function useFieldState({ name }: Partial<Pick<FieldDetails, 'name'>>) {
  const { feedback } = useFieldFeedback({ name });
  const hasValue = useFormSelector(fieldHasValueSelector(name));

  /**
   * If hasValue is false, the state should be idle
   * The rest depends on the feedback type
   */
  let state: FieldStates = FIELD_STATES.idle;

  if (!hasValue) {
    state = FIELD_STATES.idle;
  }

  switch (feedback?.type) {
    case 'error':
      state = FIELD_STATES.error;
      break;
    case 'warning':
      state = FIELD_STATES.warning;
      break;
    case 'info':
      state = FIELD_STATES.info;
      break;
    case 'success':
      state = FIELD_STATES.success;
      break;
    default:
      break;
  }

  return {
    state,
  };
}
