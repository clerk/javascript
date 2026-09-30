import { useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/useMachine';
import type { UserProfileEnterpriseAccountsSectionViewProps } from './user-profile-enterprise-accounts-section.view';

type Ready = Required<Pick<UserProfileEnterpriseAccountsSectionViewProps, 'accounts' | 'connections'>> & {
  status: 'ready';
  onConnect: (connectionId: string) => Promise<'redirecting' | void>;
};

interface Context {
  selectedId: string | undefined;
  errorId: string | undefined;
  errorMessage: string | undefined;
  run: () => Promise<'redirecting' | void>;
}

type Event = { type: 'CONNECT'; id: string; run: () => Promise<'redirecting' | void> };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

const machine = createMachine({
  id: 'enterpriseAccountConnect',
  initial: 'idle',
  context: {
    selectedId: undefined,
    errorId: undefined,
    errorMessage: undefined,
    run: () => Promise.resolve(),
  },
  states: {
    idle: {
      on: {
        CONNECT: {
          target: 'connecting',
          actions: assign((_, event) => ({
            selectedId: event.id,
            errorId: undefined,
            errorMessage: undefined,
            run: event.run,
          })),
        },
      },
    },
    connecting: {
      invoke: fromPromise(context => context.run(), {
        onDone: [
          { target: 'redirecting', guard: (_, event) => event.output === 'redirecting' },
          { target: 'idle', actions: assign(() => ({ selectedId: undefined })) },
        ],
        onError: {
          target: 'idle',
          actions: assign((context, event) => ({
            selectedId: undefined,
            errorId: context.selectedId,
            errorMessage: event.error instanceof Error && event.error.message ? event.error.message : undefined,
          })),
        },
      }),
    },
    redirecting: {
      after: {
        2000: { target: 'idle', actions: assign(() => ({ selectedId: undefined })) },
      },
    },
  },
});

export function useUserProfileEnterpriseAccountsController(
  model: Ready,
): UserProfileEnterpriseAccountsSectionViewProps {
  const messages = useMessages('userProfileEnterpriseAccountsSection');
  const [snapshot, send] = useMachine(machine);
  const { selectedId, errorId, errorMessage } = snapshot.context;

  return {
    accounts: model.accounts,
    connections: model.connections.map(connection =>
      connection.id === errorId ? { ...connection, connectError: errorMessage ?? messages.errors.generic } : connection,
    ),
    pendingConnectionId: selectedId,
    onConnect: id => {
      if (!model.connections.some(connection => connection.id === id)) {
        return;
      }
      send({ type: 'CONNECT', id, run: () => model.onConnect(id) });
    },
  };
}
