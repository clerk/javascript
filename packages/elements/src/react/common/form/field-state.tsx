import { ClerkElementsFieldError } from '~/internals/errors';
import type { ErrorCodeOrTuple } from '~/react/utils/generate-password-error-text';

import { useFieldContext, useFieldFeedback, useFieldState, useValidityStateContext } from './hooks';
import type { FieldStates } from './types';
import { enrichFieldState } from './utils';

type FieldStateRenderFn = {
  children: (state: {
    state: FieldStates;
    message: string | undefined;
    codes: ErrorCodeOrTuple[] | undefined;
  }) => React.ReactNode;
};

const DISPLAY_NAME = 'ClerkElementsFieldState';

/**
 * Programmatically access the state of the wrapping `<Field>`. Useful for implementing animations when direct access to the state value is necessary.
 *
 * @param {Function} children - A function that receives `state`, `message`, and `codes` as an argument. `state` will is a union of `"success" | "error" | "idle" | "warning" | "info"`. `message` will be the corresponding message, e.g. error message. `codes` will be an array of keys that were used to generate the password validation messages. This prop is only available when the field is of type `password` and has `validatePassword` set to `true`.
 *
 * @example
 *
 * <Clerk.Field name="email">
 *  <Clerk.Label>Email</Clerk.Label>
 *  <Clerk.FieldState>
 *    {({ state }) => (
 *      <Clerk.Input className={`text-${state}`} />
 *    )}
 *  </Clerk.FieldState>
 * </Clerk.Field>
 *
 * @example
 * <Clerk.Field name="password">
 *  <Clerk.Label>Password</Clerk.Label>
 *  <Clerk.Input validatePassword />
 *  <Clerk.FieldState>
 *    {({ state, message, codes }) => (
 *      <pre>Field state: {state}</pre>
 *      <pre>Field msg: {message}</pre>
 *      <pre>Pwd keys: {codes.join(', ')}</pre>
 *    )}
 *  </Clerk.FieldState>
 * </Clerk.Field>
 */
export function FieldState({ children }: FieldStateRenderFn) {
  const field = useFieldContext();
  const { feedback } = useFieldFeedback({ name: field?.name });
  const { state } = useFieldState({ name: field?.name });
  const validity = useValidityStateContext();

  const message = feedback?.message instanceof ClerkElementsFieldError ? feedback.message.message : feedback?.message;
  const codes = feedback?.codes;

  const fieldState = { state: enrichFieldState(validity, state), message, codes };

  return children(fieldState);
}

FieldState.displayName = DISPLAY_NAME;
