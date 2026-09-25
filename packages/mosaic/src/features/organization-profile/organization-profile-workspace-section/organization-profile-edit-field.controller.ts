import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/useMachine';
import type { OrganizationProfileFormError } from '../organization-profile.types';
import { OrganizationProfileSaveError } from '../organization-profile.types';

export interface OrganizationProfileEditFieldContext {
  save: (value: string) => Promise<void>;
  savedValue: string;
  value: string;
  error: OrganizationProfileFormError | undefined;
}

export type OrganizationProfileEditFieldEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; value: string }
  | { type: 'SAVE' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileEditFieldContext,
  OrganizationProfileEditFieldEvent
>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('edit-field deps are not seated'));
}

function isSaveable(context: OrganizationProfileEditFieldContext): boolean {
  return context.value !== context.savedValue && context.value !== '';
}

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
    save: notSeated,
    savedValue: '',
    value: '',
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'editing',
          actions: assign(context => ({ value: context.savedValue, error: undefined })),
        },
      },
    },
    editing: {
      on: {
        TYPE: { actions: assign((_, event) => ({ value: event.value })) },
        SAVE: { target: 'saving', guard: isSaveable },
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    saving: {
      invoke: fromPromise(context => context.save(context.value), {
        onDone: { target: 'idle', actions: assign(() => ({ error: undefined })) },
        onError: {
          target: 'editing',
          actions: assign((_, event) => ({ error: toFormError(event.error) })),
        },
      }),
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
  const [snapshot, send] = useMachine(organizationProfileEditFieldMachine, {
    context: { save: onSubmit, savedValue: value },
  });

  return {
    isOpen: snapshot.value === 'editing' || snapshot.value === 'saving',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    value: snapshot.context.value,
    onValueChange: next => send({ type: 'TYPE', value: next }),
    onSubmit: () => send({ type: 'SAVE' }),
    canSave: isSaveable(snapshot.context),
    isSaving: snapshot.value === 'saving',
    error: snapshot.context.error,
  };
}
