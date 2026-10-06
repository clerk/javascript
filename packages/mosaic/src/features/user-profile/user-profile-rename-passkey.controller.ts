import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import { userProfilePasskeysMessages as m } from './user-profile-passkeys-section.messages';

interface UserProfileRenamePasskeyContext {
  name: string;
  error: string | undefined;
}

type UserProfileRenamePasskeyEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; value: string }
  | { type: 'SAVE' }
  | { type: 'CANCEL' };

type RenameHandler = (id: string, name: string) => void | Promise<void>;

const base = setup<UserProfileRenamePasskeyContext, UserProfileRenamePasskeyEvent>();
const { assign } = base;

function isSaveable(name: string, savedName: string, onRename: RenameHandler | undefined): boolean {
  return Boolean(onRename) && name.length > 1 && name !== savedName;
}

function openEditor(savedName: string) {
  return assign(() => ({ name: savedName, error: undefined }));
}

const { createMachine } = base.extend({
  guards: { isSaveable: () => false },
  actions: { openEditor: openEditor('') },
  actors: { rename: (): Promise<void> => Promise.resolve() },
});

const userProfileRenamePasskeyMachine = createMachine({
  id: 'renamePasskey',
  initial: 'idle',
  context: {
    name: '',
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
        TYPE: { actions: assign((_, event) => ({ name: event.value })) },
        SAVE: { target: 'saving', guard: 'isSaveable', actions: assign(() => ({ error: undefined })) },
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    saving: {
      invoke: {
        src: 'rename',
        onDone: { target: 'idle' },
        onError: {
          target: 'editing',
          actions: assign((_, event) => ({ error: event.error instanceof Error ? event.error.message : m.saveError })),
        },
      },
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
  const [snapshot, send] = useMachine(
    userProfileRenamePasskeyMachine.provide({
      guards: { isSaveable: context => isSaveable(context.name, name, onRename) },
      actions: { openEditor: openEditor(name) },
      actors: { rename: async context => onRename?.(id, context.name) },
    }),
  );

  return {
    isOpen: snapshot.value === 'editing' || snapshot.value === 'saving',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    name: snapshot.context.name,
    onNameChange: value => send({ type: 'TYPE', value }),
    onSubmit: () => send({ type: 'SAVE' }),
    canSave: isSaveable(snapshot.context.name, name, onRename),
    isSaving: snapshot.value === 'saving',
    error: snapshot.context.error,
  };
}
