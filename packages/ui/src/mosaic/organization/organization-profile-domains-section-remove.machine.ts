import { setup } from '../machine/setup';

export interface OrganizationProfileDomainsSectionRemoveContext {
  /** The domain currently targeted for removal, set when the dialog opens. */
  domainId: string;
  domainName: string;
  deleteDomain: (params: { domainId: string }) => Promise<void>;
  error: string | null;
}

export type OrganizationProfileDomainsSectionRemoveEvent =
  | { type: 'OPEN'; domain: { id: string; name: string } }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileDomainsSectionRemoveContext,
  OrganizationProfileDomainsSectionRemoveEvent
>();

export const organizationProfileDomainsSectionRemoveMachine = createMachine({
  id: 'domainsRemove',
  initial: 'idle',
  context: {
    domainId: '',
    domainName: '',
    deleteDomain: async () => {},
    error: null,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'confirming',
          actions: assign((_, event) => ({ domainId: event.domain.id, domainName: event.domain.name, error: null })),
        },
      },
    },
    confirming: {
      on: {
        CONFIRM: 'deleting',
        CANCEL: {
          target: 'idle',
          actions: assign(() => ({ error: null })),
        },
      },
    },
    deleting: {
      invoke: fromPromise(ctx => ctx.deleteDomain({ domainId: ctx.domainId }), {
        // Back to idle (closed) on success; the removed domain drops out of the revalidated list.
        onDone: {
          target: 'idle',
          actions: assign(() => ({ error: null })),
        },
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
