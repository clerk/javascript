import { setup } from '../../../machine/setup';
import type { DoneInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import type { MembersRoles, MembersRolesState } from './members-table-tab.types';

interface RolesContext {
  loadRoles: (() => Promise<MembersRoles>) | undefined;
  result: MembersRoles | null;
}

const { createMachine, assign, fromPromise } = setup<RolesContext, never>();

const rolesMachine = createMachine({
  id: 'membersRoles',
  initial: context => (context.loadRoles ? 'loading' : 'unavailable'),
  context: { loadRoles: undefined, result: null },
  states: {
    unavailable: {},
    loading: {
      invoke: fromPromise(context => context.loadRoles?.() ?? Promise.resolve(null), {
        onDone: {
          target: 'ready',
          actions: assign<DoneInvokeEvent<MembersRoles | null>>((_, event) => ({ result: event.output })),
        },
        onError: { target: 'unavailable' },
      }),
    },
    ready: {},
  },
});

export function useMembersPanelRolesController(
  loadRoles: (() => Promise<MembersRoles>) | undefined,
): MembersRolesState {
  const [state] = useMachine(rolesMachine, { context: { loadRoles } });
  return {
    roles: state.value === 'ready' ? state.context.result : null,
    isLoading: state.value === 'loading',
  };
}
