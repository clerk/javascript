import { setup } from '../machine/setup';

export interface OrganizationBillingPaymentMethodsMakeDefaultContext {
  makeDefault: (params: { paymentMethodId: string }) => Promise<void>;
  /** The payment method whose make-default call is in flight, empty when idle. */
  pendingId: string;
  error: string | null;
}

export type OrganizationBillingPaymentMethodsMakeDefaultEvent = { type: 'MAKE_DEFAULT'; paymentMethodId: string };

const { createMachine, assign, fromPromise } = setup<
  OrganizationBillingPaymentMethodsMakeDefaultContext,
  OrganizationBillingPaymentMethodsMakeDefaultEvent
>();

// Make-default has no confirmation step, mirroring the legacy inline action: a click fires the
// mutation and the row reflects the in-flight `pendingId` until it settles.
export const organizationBillingPaymentMethodsMakeDefaultMachine = createMachine({
  id: 'paymentMethodsMakeDefault',
  initial: 'idle',
  context: {
    makeDefault: async () => {},
    pendingId: '',
    error: null,
  },
  states: {
    idle: {
      on: {
        MAKE_DEFAULT: {
          target: 'submitting',
          actions: assign((_, event) => ({ pendingId: event.paymentMethodId, error: null })),
        },
      },
    },
    submitting: {
      invoke: fromPromise(ctx => ctx.makeDefault({ paymentMethodId: ctx.pendingId }), {
        onDone: {
          target: 'idle',
          actions: assign(() => ({ pendingId: '', error: null })),
        },
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({
            pendingId: '',
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
