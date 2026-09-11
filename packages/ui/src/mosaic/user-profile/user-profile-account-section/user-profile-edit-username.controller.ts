import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';
import type { UserProfileFormError } from './user-profile-account-section.types';
import { UserProfileSaveError } from './user-profile-account-section.types';
import type { UserProfileEditUsernameField } from './user-profile-edit-username.view';

export interface UserProfileEditUsernameContext {
  saveUsername: (username: string) => Promise<void>;
  savedUsername: string;
  username: string;
  error: UserProfileFormError<UserProfileEditUsernameField> | undefined;
}

export type UserProfileEditUsernameEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; value: string }
  | { type: 'SAVE' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<UserProfileEditUsernameContext, UserProfileEditUsernameEvent>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('edit-username deps are not seated'));
}

function isSaveable(context: UserProfileEditUsernameContext): boolean {
  return context.username !== context.savedUsername && context.username !== '';
}

function toFormError(cause: unknown): UserProfileFormError<UserProfileEditUsernameField> {
  if (cause instanceof UserProfileSaveError) {
    return { message: cause.message, fields: cause.fields };
  }
  if (cause instanceof Error) {
    return { message: cause.message };
  }
  return { message: 'Something went wrong. Please try again.' };
}

export const userProfileEditUsernameMachine = createMachine({
  id: 'editUsername',
  initial: 'idle',
  context: {
    saveUsername: notSeated,
    savedUsername: '',
    username: '',
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'editing',
          actions: assign(context => ({ username: context.savedUsername, error: undefined })),
        },
      },
    },
    editing: {
      on: {
        TYPE: { actions: assign((_, event) => ({ username: event.value })) },
        SAVE: { target: 'saving', guard: isSaveable },
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    saving: {
      invoke: fromPromise(context => context.saveUsername(context.username), {
        onDone: { target: 'idle', actions: assign(() => ({ error: undefined })) },
        onError: {
          target: 'editing',
          actions: assign((_, event) => ({ error: toFormError(event.error) })),
        },
      }),
    },
  },
});

export interface UserProfileEditUsernameControllerOptions {
  username?: string;
  onSubmit: (username: string) => Promise<void>;
}

export interface UserProfileEditUsernameController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  onUsernameChange: (value: string) => void;
  onSubmit: () => void;
  canSave: boolean;
  isSaving: boolean;
  error: UserProfileFormError<UserProfileEditUsernameField> | undefined;
}

export function useUserProfileEditUsernameController({
  username = '',
  onSubmit,
}: UserProfileEditUsernameControllerOptions): UserProfileEditUsernameController {
  const [snapshot, send] = useMachine(userProfileEditUsernameMachine, {
    context: { saveUsername: onSubmit, savedUsername: username },
  });

  return {
    isOpen: snapshot.value === 'editing' || snapshot.value === 'saving',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    username: snapshot.context.username,
    onUsernameChange: value => send({ type: 'TYPE', value }),
    onSubmit: () => send({ type: 'SAVE' }),
    canSave: isSaveable(snapshot.context),
    isSaving: snapshot.value === 'saving',
    error: snapshot.context.error,
  };
}
