import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';
import type { UserProfileFormError } from './user-profile-account-section.types';
import type { UserProfileEditNameField, UserProfileEditNameValue } from './user-profile-edit-name.view';

export interface UserProfileEditNameContext {
  /** Saves the name. Injected from the caller's `onSave` prop, and stands in for the model's action. */
  saveName: (value: UserProfileEditNameValue) => Promise<void>;
  /** The saved name, injected on every render. What the fields are seeded from each time the dialog opens. */
  savedFirstName: string;
  savedLastName: string;
  /** What is currently typed. Owned here rather than by the view, so re-seeding is a transition. */
  firstName: string;
  lastName: string;
  /** Why the last attempt failed. */
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

/**
 * Reads a rejection as something the dialog can render. A plain `Error` is the whole failure and
 * belongs in the banner; a rejection already shaped as a form error keeps its field copy, which is
 * how an empty or over-long name lands under the control that caused it.
 */
type FieldCopy = UserProfileFormError<UserProfileEditNameField>['fields'];

function toFormError(cause: unknown): UserProfileFormError<UserProfileEditNameField> {
  if (cause instanceof Error) {
    return { message: cause.message, fields: (cause as Error & { fields?: FieldCopy }).fields };
  }
  return { message: 'Something went wrong. Please try again.' };
}

/**
 * The edit-name flow. `saving` decides the dialog's fate: a resolved save closes it and returns to
 * `idle`, where the next open re-seeds from whatever the model now reports; a rejection drops back
 * to `editing`, keeping what was typed so the user can correct it rather than retype it.
 *
 * Unlike the delete flow this has no terminal state — a name can be edited again straight away.
 */
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
  /** The saved first name. */
  firstName?: string;
  /** The saved last name. */
  lastName?: string;
  /**
   * Saves the name. Resolve and the dialog closes; reject with an `Error` and it stays open with
   * that message in its banner, or with `fields` set to put copy under a specific control.
   */
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

/**
 * Drives the edit-name dialog and hands the view plain props. A machine backs it because the flow
 * has an async step, an error path back to the step before it, and a success that closes a surface
 * the user did not close.
 */
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
