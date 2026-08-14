import { setup } from '../machine/setup';

/**
 * The verify-domain step's "remove a domain" flow, ported 1:1 from
 * `OrganizationDomainsStep.tsx` `handleRemoveDomain` + `RemoveDomainDialog`.
 *
 * The confirm dialog is a plain confirm/cancel (no type-to-confirm), so the flow mirrors the
 * domains-section remove machine: `idle → confirming → deleting → idle`. `isConnectionActive`
 * is carried so the dialog can pick the active/inactive subtitle copy the legacy dialog chose.
 *
 * The injected `removeDomain` reproduces the legacy handler end to end: drop the domain from
 * the connection (`updateConnection`), delete the domain, then revalidate. On success the flow
 * closes; on error it stays open with the message.
 */
export interface OrganizationProfileSecurityWizardDomainsRemoveContext {
  /** The domain targeted for removal, set when the dialog opens. */
  domainName: string;
  /** Whether the backing connection is active — selects the dialog subtitle copy. */
  isConnectionActive: boolean;
  removeDomain: (domainName: string) => Promise<void>;
  error: string | null;
}

export type OrganizationProfileSecurityWizardDomainsRemoveEvent =
  | { type: 'OPEN'; domainName: string; isConnectionActive: boolean }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileSecurityWizardDomainsRemoveContext,
  OrganizationProfileSecurityWizardDomainsRemoveEvent
>();

export const organizationProfileSecurityWizardDomainsRemoveMachine = createMachine({
  id: 'securityWizardDomainsRemove',
  initial: 'idle',
  context: {
    domainName: '',
    isConnectionActive: false,
    removeDomain: async () => {},
    error: null,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'confirming',
          actions: assign((_, event) => ({
            domainName: event.domainName,
            isConnectionActive: event.isConnectionActive,
            error: null,
          })),
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
      invoke: fromPromise(context => context.removeDomain(context.domainName), {
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
