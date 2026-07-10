import { setup } from '../machine/setup';

/**
 * The verify-domain step's "prepare ownership verification" flow, ported 1:1 from
 * `OrganizationDomainsStep.tsx` `handlePrepareOwnershipVerification` + `ExpiredNotice`.
 *
 * An expired domain card's "verify again" button re-prepares the DNS ownership check.
 * Legacy holds the per-card spinner as component-local `useState` (`isVerifying`); here the
 * in-flight domain lives in context so the view can spin only the card being re-prepared.
 *
 * This is a single-flight flow: re-preparing one domain while another is already preparing
 * is not modelled (the `preparing` state has no `PREPARE` handler), matching that a user
 * re-prepares one expired card at a time. The legacy per-card spinners could in principle run
 * two at once; that is a cosmetic difference on a rare path.
 */
export interface OrganizationProfileSecurityWizardDomainsPrepareContext {
  /** The domain currently being re-prepared; drives which card shows the spinner. */
  pendingDomainId: string;
  error: string | null;
  prepareVerification: (domainId: string) => Promise<void>;
}

export type OrganizationProfileSecurityWizardDomainsPrepareEvent = { type: 'PREPARE'; domainId: string };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileSecurityWizardDomainsPrepareContext,
  OrganizationProfileSecurityWizardDomainsPrepareEvent
>();

export const organizationProfileSecurityWizardDomainsPrepareMachine = createMachine({
  id: 'securityWizardDomainsPrepare',
  initial: 'idle',
  context: {
    pendingDomainId: '',
    error: null,
    prepareVerification: async () => {},
  },
  states: {
    idle: {
      on: {
        PREPARE: {
          target: 'preparing',
          actions: assign((_, event) => ({ pendingDomainId: event.domainId, error: null })),
        },
      },
    },
    preparing: {
      invoke: fromPromise(context => context.prepareVerification(context.pendingDomainId), {
        onDone: {
          target: 'idle',
          actions: assign(() => ({ pendingDomainId: '', error: null })),
        },
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({
            pendingDomainId: '',
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
