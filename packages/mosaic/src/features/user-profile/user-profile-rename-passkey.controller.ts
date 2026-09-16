import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';
import { userProfilePasskeysMessages as m } from './user-profile-passkeys-section.messages';

interface UserProfileRenamePasskeyContext {
  passkeyId: string;
  savedName: string;
  name: string;
  onRename: ((id: string, name: string) => void | Promise<void>) | undefined;
  error: string | undefined;
}

type UserProfileRenamePasskeyEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; value: string }
  | { type: 'SAVE' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<UserProfileRenamePasskeyContext, UserProfileRenamePasskeyEvent>();

function isSaveable(context: UserProfileRenamePasskeyContext): boolean {
  return Boolean(context.onRename) && context.name.length > 1 && context.name !== context.savedName;
}

const userProfileRenamePasskeyMachine = createMachine({
  id: 'renamePasskey',
  initial: 'idle',
  context: {
    passkeyId: '',
    savedName: '',
    name: '',
    onRename: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'editing',
          actions: assign(context => ({ name: context.savedName, error: undefined })),
        },
      },
    },
    editing: {
      on: {
        TYPE: { actions: assign((_, event) => ({ name: event.value })) },
        SAVE: { target: 'saving', guard: isSaveable, actions: assign(() => ({ error: undefined })) },
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    saving: {
      invoke: fromPromise(async context => context.onRename?.(context.passkeyId, context.name), {
        onDone: { target: 'idle' },
        onError: {
          target: 'editing',
          actions: assign((_, event) => ({ error: event.error instanceof Error ? event.error.message : m.saveError })),
        },
      }),
    },
  },
});

interface UserProfileRenamePasskeyControllerOptions {
  id: string;
  name: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
}

interface UserProfileRenamePasskeyController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  canSave: boolean;
  isSaving: boolean;
  error: string | undefined;
}

export function useUserProfileRenamePasskeyController({
  id,
  name,
  onRename,
}: UserProfileRenamePasskeyControllerOptions): UserProfileRenamePasskeyController {
  const [snapshot, send] = useMachine(userProfileRenamePasskeyMachine, {
    context: { passkeyId: id, savedName: name, onRename },
  });

  return {
    isOpen: snapshot.value === 'editing' || snapshot.value === 'saving',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    name: snapshot.context.name,
    onNameChange: value => send({ type: 'TYPE', value }),
    onSubmit: () => send({ type: 'SAVE' }),
    canSave: isSaveable(snapshot.context),
    isSaving: snapshot.value === 'saving',
    error: snapshot.context.error,
  };
}
