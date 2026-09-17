import { useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/useMachine';
import type { UserProfileFormError } from '../user-profile-account-section/user-profile-account-section.types';
import { UserProfileSaveError } from '../user-profile-account-section/user-profile-account-section.types';
import type { UserProfileEditPasswordField, UserProfileEditPasswordValue } from './user-profile-password-section.types';

export interface UserProfileEditPasswordContext {
  savePassword: (value: UserProfileEditPasswordValue) => Promise<void>;
  requiresCurrentPassword: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
  error: unknown;
}

export type UserProfileEditPasswordEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; field: UserProfileEditPasswordField; value: string }
  | { type: 'TOGGLE_SIGN_OUT'; value: boolean }
  | { type: 'SAVE' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<UserProfileEditPasswordContext, UserProfileEditPasswordEvent>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('edit-password deps are not seated'));
}

const emptyFields = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
  error: undefined,
};

export function passwordsMismatch(context: UserProfileEditPasswordContext): boolean {
  return context.confirmPassword !== '' && context.confirmPassword !== context.newPassword;
}

export function isSaveable(context: UserProfileEditPasswordContext): boolean {
  return (
    context.newPassword !== '' &&
    context.confirmPassword === context.newPassword &&
    (!context.requiresCurrentPassword || context.currentPassword !== '')
  );
}

function toFormError(cause: unknown, fallback: string): UserProfileFormError<UserProfileEditPasswordField> | undefined {
  if (cause === undefined) {
    return undefined;
  }
  if (cause instanceof UserProfileSaveError) {
    return { message: cause.message, fields: cause.fields };
  }
  if (cause instanceof Error) {
    return { message: cause.message };
  }
  return { message: fallback };
}

export const userProfileEditPasswordMachine = createMachine({
  id: 'editPassword',
  initial: 'idle',
  context: {
    savePassword: notSeated,
    requiresCurrentPassword: false,
    ...emptyFields,
  },
  states: {
    idle: {
      on: {
        OPEN: { target: 'editing', actions: assign(() => emptyFields) },
      },
    },
    editing: {
      on: {
        TYPE: { actions: assign((_, event) => ({ [event.field]: event.value })) },
        TOGGLE_SIGN_OUT: { actions: assign((_, event) => ({ signOutOfOtherSessions: event.value })) },
        SAVE: { target: 'saving', guard: isSaveable },
        CANCEL: { target: 'idle', actions: assign(() => emptyFields) },
      },
    },
    saving: {
      invoke: fromPromise(
        context =>
          context.savePassword({
            currentPassword: context.requiresCurrentPassword ? context.currentPassword : undefined,
            newPassword: context.newPassword,
            signOutOfOtherSessions: context.signOutOfOtherSessions,
          }),
        {
          onDone: { target: 'idle', actions: assign(() => emptyFields) },
          onError: {
            target: 'editing',
            actions: assign((_, event) => ({ error: event.error })),
          },
        },
      ),
    },
  },
});

export interface UserProfileEditPasswordControllerOptions {
  requiresCurrentPassword?: boolean;
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<void>;
}

export interface UserProfileEditPasswordController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSignOutOfOtherSessionsChange: (value: boolean) => void;
  onSubmit: () => void;
  canSave: boolean;
  isSaving: boolean;
  error: UserProfileFormError<UserProfileEditPasswordField> | undefined;
}

export function useUserProfileEditPasswordController({
  requiresCurrentPassword = false,
  onSubmit,
}: UserProfileEditPasswordControllerOptions): UserProfileEditPasswordController {
  const m = useMessages('userProfilePasswordSection');
  const [snapshot, send] = useMachine(userProfileEditPasswordMachine, {
    context: { savePassword: onSubmit, requiresCurrentPassword },
  });
  const { context } = snapshot;
  const saveError = toFormError(context.error, m.errors.generic);
  const error = passwordsMismatch(context)
    ? { ...saveError, fields: { ...saveError?.fields, confirmPassword: m.errors.mismatch } }
    : saveError;

  return {
    isOpen: snapshot.value === 'editing' || snapshot.value === 'saving',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    currentPassword: context.currentPassword,
    newPassword: context.newPassword,
    confirmPassword: context.confirmPassword,
    signOutOfOtherSessions: context.signOutOfOtherSessions,
    onCurrentPasswordChange: value => send({ type: 'TYPE', field: 'currentPassword', value }),
    onNewPasswordChange: value => send({ type: 'TYPE', field: 'newPassword', value }),
    onConfirmPasswordChange: value => send({ type: 'TYPE', field: 'confirmPassword', value }),
    onSignOutOfOtherSessionsChange: value => send({ type: 'TOGGLE_SIGN_OUT', value }),
    onSubmit: () => send({ type: 'SAVE' }),
    canSave: isSaveable(context),
    isSaving: snapshot.value === 'saving',
    error,
  };
}
