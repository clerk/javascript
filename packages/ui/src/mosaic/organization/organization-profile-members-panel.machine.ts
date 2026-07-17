import { setup } from '../machine/setup';

export interface OrganizationProfileMembersPanelContext {
  /** The current value of the search box (uncommitted). */
  search: string;
  /** The committed query the controller keys the memberships fetch off of. */
  query: string;
  /** The membership currently being removed, so the view can disable just that row. */
  pendingMembershipId: string | null;
  /** Injected per-removal effect — destroys a membership and revalidates the list. */
  removeMember: () => Promise<void>;
  error: string | null;
}

export type OrganizationProfileMembersPanelEvent =
  | { type: 'SEARCH_CHANGE'; value: string }
  | { type: 'SEARCH_SUBMIT' }
  | { type: 'REMOVE_MEMBER'; membershipId: string; run: () => Promise<void> };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileMembersPanelContext,
  OrganizationProfileMembersPanelEvent
>();

export const organizationProfileMembersPanelMachine = createMachine({
  id: 'organizationProfileMembersPanel',
  initial: 'ready',
  context: {
    search: '',
    query: '',
    pendingMembershipId: null,
    removeMember: async () => {},
    error: null,
  },
  states: {
    ready: {
      on: {
        // Typing only updates the uncommitted search value; the fetch is unchanged
        // until SEARCH_SUBMIT commits it into `query` (mirrors the legacy
        // search/query split so keystrokes don't trigger a request each time).
        SEARCH_CHANGE: {
          actions: assign((_, event) => ({ search: event.value })),
        },
        SEARCH_SUBMIT: {
          actions: assign(context => ({ query: context.search })),
        },
        REMOVE_MEMBER: {
          target: 'removing',
          actions: assign((_, event) => ({
            pendingMembershipId: event.membershipId,
            removeMember: event.run,
            error: null,
          })),
        },
      },
    },
    removing: {
      invoke: fromPromise(context => context.removeMember(), {
        onDone: {
          target: 'ready',
          actions: assign(() => ({ pendingMembershipId: null })),
        },
        onError: {
          target: 'ready',
          actions: assign((_, event) => ({
            pendingMembershipId: null,
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
