import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';
import type { UserProfileFormError } from './user-profile-account-section.types';
import type { UserProfileEditNameField, UserProfileEditNameValue } from './user-profile-edit-name.view';

export interface UserProfileEditNameContext {
  saveName: (value: UserProfileEditNameValue) => Promise<void>;
  /** Injected every render. What `OPEN` seeds the fields from. */
  savedFirstName: string;
  savedLastName: string;
  firstName: string;
  lastName: string;
  error: UserProfileFormError<UserProfileEditNameField> | undefined;
}

export type UserProfileEditNameEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; field: UserProfileEditNameField; value: string }
  | { type: 'SAVE' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<UserProfileEditNameContext, UserProfileEditNameEvent>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('edit-name deps are not seated'));
}

type FieldCopy = UserProfileFormError<UserProfileEditNameField>['fields'];

function toFormError(cause: unknown): UserProfileFormError<UserProfileEditNameField> {
  if (cause instanceof Error) {
    return { message: cause.message, fields: (cause as Error & { fields?: FieldCopy }).fields };
  }
  return { message: 'Something went wrong. Please try again.' };
}

export const userProfileEditNameMachine = createMachine({
  id: 'editName',
  initial: 'idle',
  context: {
    saveName: notSeated,
    savedFirstName: '',
    savedLastName: '',
    firstName: '',
    lastName: '',
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'editing',
          actions: assign(context => ({
            firstName: context.savedFirstName,
            lastName: context.savedLastName,
            error: undefined,
          })),
        },
      },
    },
    editing: {
      on: {
        TYPE: { actions: assign((_, event) => ({ [event.field]: event.value })) },
        SAVE: 'saving',
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    saving: {
      invoke: fromPromise(context => context.saveName({ firstName: context.firstName, lastName: context.lastName }), {
        onDone: { target: 'idle', actions: assign(() => ({ error: undefined })) },
        onError: {
          target: 'editing',
          actions: assign((_, event) => ({ error: toFormError(event.error) })),
        },
      }),
    },
  },
});

export interface UserProfileEditNameControllerOptions {
  firstName?: string;
  lastName?: string;
  /** Resolve to close the dialog; reject with an `Error` to keep it open showing why. */
  onSave: (value: UserProfileEditNameValue) => Promise<void>;
}

export interface UserProfileEditNameController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  error: UserProfileFormError<UserProfileEditNameField> | undefined;
}

export function useUserProfileEditNameController({
  firstName = '',
  lastName = '',
  onSave,
}: UserProfileEditNameControllerOptions): UserProfileEditNameController {
  const [snapshot, send] = useMachine(userProfileEditNameMachine, {
    context: { saveName: onSave, savedFirstName: firstName, savedLastName: lastName },
  });

  return {
    isOpen: snapshot.value === 'editing' || snapshot.value === 'saving',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    firstName: snapshot.context.firstName,
    lastName: snapshot.context.lastName,
    onFirstNameChange: value => send({ type: 'TYPE', field: 'firstName', value }),
    onLastNameChange: value => send({ type: 'TYPE', field: 'lastName', value }),
    onSave: () => send({ type: 'SAVE' }),
    isSaving: snapshot.value === 'saving',
    error: snapshot.context.error,
  };
}
