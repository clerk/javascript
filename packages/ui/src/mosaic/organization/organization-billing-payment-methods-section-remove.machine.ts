import { setup } from '../machine/setup';

export interface OrganizationBillingPaymentMethodsRemoveContext {
  /** The payment method currently targeted for removal, set when the dialog opens. */
  paymentMethodId: string;
  /** Human-readable label for the confirmation copy, e.g. `"visa ⋯ 4242"`. */
  paymentMethodLabel: string;
  removePaymentMethod: (params: { paymentMethodId: string }) => Promise<void>;
  error: string | null;
}

export type OrganizationBillingPaymentMethodsRemoveEvent =
  | { type: 'OPEN'; paymentMethod: { id: string; label: string } }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationBillingPaymentMethodsRemoveContext,
  OrganizationBillingPaymentMethodsRemoveEvent
>();

export const organizationBillingPaymentMethodsRemoveMachine = createMachine({
  id: 'paymentMethodsRemove',
  initial: 'idle',
  context: {
    paymentMethodId: '',
    paymentMethodLabel: '',
    removePaymentMethod: async () => {},
    error: null,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'confirming',
          actions: assign((_, event) => ({
            paymentMethodId: event.paymentMethod.id,
            paymentMethodLabel: event.paymentMethod.label,
            error: null,
          })),
        },
      },
    },
    confirming: {
      on: {
        CONFIRM: 'removing',
        CANCEL: {
          target: 'idle',
          actions: assign(() => ({ error: null })),
        },
      },
    },
    removing: {
      invoke: fromPromise(ctx => ctx.removePaymentMethod({ paymentMethodId: ctx.paymentMethodId }), {
        // Back to idle (closed) on success; the removed method drops out of the revalidated list.
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
