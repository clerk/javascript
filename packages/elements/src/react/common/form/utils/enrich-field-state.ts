import { FIELD_STATES, type FieldStates } from '../types';

/**
 * Radix can return the ValidityState object, which contains the validity of the field. We need to merge this with our existing fieldState.
 * When the ValidityState is valid: false, the fieldState should be overriden. Otherwise, it shouldn't change at all.
 * @see https://www.radix-ui.com/primitives/docs/components/form#validitystate
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
 */
export function enrichFieldState(validity: ValidityState | undefined, fieldState: FieldStates) {
  return validity?.valid === false ? FIELD_STATES.error : fieldState;
}
