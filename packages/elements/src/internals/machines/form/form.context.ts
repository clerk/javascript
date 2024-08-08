import { createActorContext } from '@xstate/react';
import type { SnapshotFrom } from 'xstate';

import { FormMachine } from '~/internals/machines/form';
import { inspect } from '~/internals/utils/inspector';

export type SnapshotState = SnapshotFrom<typeof FormMachine>;

const FormMachineContext = createActorContext(FormMachine, { inspect });

export const FormStoreProvider = FormMachineContext.Provider;
export const useFormStore = FormMachineContext.useActorRef;
export const useFormSelector = FormMachineContext.useSelector;

/**
 * Selects a global error, if it exists
 */
export const globalErrorsSelector = (state: SnapshotState) => state.context.errors;

/**
 * Selects if a specific field has a value
 */
export const fieldValueSelector = (name: string | undefined) => (state: SnapshotState) =>
  name ? state.context.fields.get(name)?.value : '';

/**
 * Selects if a specific field has a value
 */
export const fieldHasValueSelector = (name: string | undefined) => (state: SnapshotState) =>
  Boolean(fieldValueSelector(name)(state));

type MapValue<A> = A extends Map<any, infer V> ? V : never;

/**
 * Selects field-specific feedback, if they exist
 *
 * @note We declare an explicit return type here because TypeScript's inference results in the subtype reduction of the
 *       union used for feedback. Explicitly declaring the return type allows for all members of the union to be
 *       included in the return type.
 */
export const fieldFeedbackSelector =
  (name: string | undefined) =>
  (state: SnapshotState): MapValue<SnapshotState['context']['fields']>['feedback'] | undefined =>
    name ? state.context.fields.get(name)?.feedback : undefined;
