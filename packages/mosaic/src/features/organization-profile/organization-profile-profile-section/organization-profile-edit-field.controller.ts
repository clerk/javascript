import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import type { OrganizationProfileFormError } from '../organization-profile.types';
import { OrganizationProfileSaveError } from '../organization-profile.types';

export interface OrganizationProfileEditFieldContext {
  value: string;
  error: OrganizationProfileFormError | undefined;
}

export type OrganizationProfileEditFieldEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; value: string }
  | { type: 'SAVE' }
  | { type: 'CANCEL' };

const base = setup<OrganizationProfileEditFieldContext, OrganizationProfileEditFieldEvent>();
const { assign } = base;

function notSeated(): Promise<void> {
  return Promise.reject(new Error('edit-field deps are not seated'));
}

function isSaveable(value: string, savedValue: string): boolean {
  return value !== savedValue && value !== '';
}

function openEditor(savedValue: string) {
  return assign(() => ({ value: savedValue, error: undefined }));
}

const { createMachine } = base.extend({
  guards: { isSaveable: context => isSaveable(context.value, '') },
  actions: { openEditor: openEditor('') },
  actors: { save: notSeated },
});

function toFormError(cause: unknown): OrganizationProfileFormError {
  if (cause instanceof OrganizationProfileSaveError) {
    return { message: cause.message, field: cause.field };
  }
  if (cause instanceof Error) {
    return { message: cause.message };
  }
  return { message: 'Something went wrong. Please try again.' };
}

export const organizationProfileEditFieldMachine = createMachine({
  id: 'editOrganizationField',
  initial: 'idle',
  context: {
    value: '',
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: { target: 'editing', actions: 'openEditor' },
      },
    },
    editing: {
      on: {
        TYPE: { actions: assign((_, event) => ({ value: event.value })) },
        SAVE: { target: 'saving', guard: 'isSaveable' },
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    saving: {
      invoke: {
        src: 'save',
        onDone: { target: 'idle', actions: assign(() => ({ error: undefined })) },
        onError: {
          target: 'editing',
          actions: assign((_, event) => ({ error: toFormError(event.error) })),
        },
      },
    },
  },
});

export interface OrganizationProfileEditFieldControllerOptions {
  value?: string;
  onSubmit: (value: string) => Promise<void>;
}

export interface OrganizationProfileEditFieldController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  canSave: boolean;
  isSaving: boolean;
  error: OrganizationProfileFormError | undefined;
}

export function useOrganizationProfileEditFieldController({
  value = '',
  onSubmit,
}: OrganizationProfileEditFieldControllerOptions): OrganizationProfileEditFieldController {
  const [snapshot, send] = useMachine(
    organizationProfileEditFieldMachine.provide({
      guards: { isSaveable: context => isSaveable(context.value, value) },
      actions: { openEditor: openEditor(value) },
      actors: { save: context => onSubmit(context.value) },
    }),
  );

  return {
    isOpen: snapshot.value === 'editing' || snapshot.value === 'saving',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    value: snapshot.context.value,
    onValueChange: next => send({ type: 'TYPE', value: next }),
    onSubmit: () => send({ type: 'SAVE' }),
    canSave: isSaveable(snapshot.context.value, value),
    isSaving: snapshot.value === 'saving',
    error: snapshot.context.error,
  };
}
