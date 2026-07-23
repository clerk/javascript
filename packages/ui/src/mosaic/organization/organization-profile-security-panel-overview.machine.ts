import { setup } from '../machine/setup';

/**
 * The overview flow for a *configured* enterprise SSO connection: the two mutating
 * actions the legacy `SecuritySsoSection` three-dot menu exposes — activate /
 * deactivate (`setConnectionActive`) and remove (`deleteConnection`, behind the
 * type-to-confirm reset dialog).
 *
 * Status / badge / domain-chips are NOT states here — they are derived by the view
 * from the connection entity the controller passes in; revalidation after a mutation
 * drives the settled UI. Only the async actions and the remove confirmation are flow.
 *
 * Mutations are injected as plain, id-bound functions from the controller (the Clerk
 * adapter), so this machine stays Clerk-free and testable in plain JS — mirroring
 * `organization-profile-delete-section.machine.ts`.
 */
export interface OrganizationProfileSecurityPanelOverviewContext {
  /** The org name the remove dialog requires typed to confirm. */
  organizationName: string;
  /** What the user has typed into the remove dialog's confirmation field. */
  confirmationValue: string;
  activateConnection: () => Promise<void>;
  deactivateConnection: () => Promise<void>;
  removeConnection: () => Promise<void>;
  error: string | null;
}

export type OrganizationProfileSecurityPanelOverviewEvent =
  | { type: 'ACTIVATE' }
  | { type: 'DEACTIVATE' }
  | { type: 'OPEN_REMOVE' }
  | { type: 'TYPE_CONFIRMATION'; value: string }
  | { type: 'CONFIRM_REMOVE' }
  | { type: 'CANCEL_REMOVE' };

/**
 * The machine stores whatever `.message` its injected mutation throws. The
 * controller (the Clerk adapter) is responsible for reproducing legacy's
 * `handleError(err, [], setError)` global-error extraction — it catches the Clerk
 * error, pulls the first *global* API message, and re-throws a normalized `Error`
 * so this layer stays Clerk-free and testable in plain JS (mirroring
 * `organization-profile-delete-section.machine.ts`).
 */
const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileSecurityPanelOverviewContext,
  OrganizationProfileSecurityPanelOverviewEvent
>();

export const organizationProfileSecurityPanelOverviewMachine = createMachine({
  id: 'securityOverview',
  initial: 'idle',
  context: {
    organizationName: '',
    confirmationValue: '',
    activateConnection: async () => {},
    deactivateConnection: async () => {},
    removeConnection: async () => {},
    error: null,
  },
  states: {
    idle: {
      on: {
        ACTIVATE: 'activating',
        DEACTIVATE: 'deactivating',
        OPEN_REMOVE: 'confirmingRemove',
      },
    },
    // activating / deactivating are only reachable from `idle`, so the state itself
    // single-flights the mutation — the legacy `card.isLoading` guard is unnecessary.
    activating: {
      invoke: fromPromise(ctx => ctx.activateConnection(), {
        onDone: { target: 'idle', actions: assign(() => ({ error: null })) },
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({ error: toErrorMessage(event.error) })),
        },
      }),
    },
    deactivating: {
      invoke: fromPromise(ctx => ctx.deactivateConnection(), {
        onDone: { target: 'idle', actions: assign(() => ({ error: null })) },
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({ error: toErrorMessage(event.error) })),
        },
      }),
    },
    confirmingRemove: {
      on: {
        TYPE_CONFIRMATION: {
          actions: assign((_, event) => ({ confirmationValue: event.value, error: null })),
        },
        CONFIRM_REMOVE: {
          target: 'removing',
          guard: context => context.confirmationValue === context.organizationName,
        },
        // Reset-on-close: legacy's dialog unmounts and re-initializes an empty field,
        // so close→reopen always starts blank. Clear the typed value + error here.
        CANCEL_REMOVE: {
          target: 'idle',
          actions: assign(() => ({ confirmationValue: '', error: null })),
        },
      },
    },
    // Removing does NOT end in a `final` state: deleting the connection flips the
    // refreshed entity back to `unconfigured` and the user can start over, so the
    // overview must stay live. Return to `idle` with the confirmation + error cleared.
    removing: {
      invoke: fromPromise(ctx => ctx.removeConnection(), {
        onDone: { target: 'idle', actions: assign(() => ({ confirmationValue: '', error: null })) },
        onError: {
          target: 'confirmingRemove',
          actions: assign((_, event) => ({ error: toErrorMessage(event.error) })),
        },
      }),
    },
  },
});
