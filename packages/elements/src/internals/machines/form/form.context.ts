import { createActorContext } from '@xstate/react';
import type { SnapshotFrom } from 'xstate';

import { FormMachine } from '~/internals/machines/form';
import { consoleInspector } from '~/internals/utils/inspector';

export type SnapshotState = SnapshotFrom<typeof FormMachine>;

const FormMachineContext = createActorContext(FormMachine, { inspect: consoleInspector });

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

/**
 * Selects field-specific feedback, if they exist
 */
export const fieldFeedbackSelector = (name: string | undefined) => (state: SnapshotState) =>
  name ? state.context.fields.get(name)?.feedback : undefined;
