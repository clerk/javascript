import { setup } from '../machine/setup';

export interface OrganizationBillingPaymentMethodsAddContext {
  addPaymentMethod: (params: { gateway: string; paymentToken: string }) => Promise<void>;
  /** Payment gateway captured on submit (only `"stripe"` today), empty when idle. */
  gateway: string;
  /** Tokenized payment method returned by the gateway, empty when idle. */
  paymentToken: string;
  error: string | null;
}

export type OrganizationBillingPaymentMethodsAddEvent =
  | { type: 'OPEN' }
  | { type: 'CANCEL' }
  | { type: 'SUBMIT'; gateway: string; paymentToken: string };

const { createMachine, assign, fromPromise } = setup<
  OrganizationBillingPaymentMethodsAddContext,
  OrganizationBillingPaymentMethodsAddEvent
>();

// The gateway-facing card capture (Stripe's PaymentElement) is not migrated into the Mosaic view; it
// stays in the legacy user-facing surface. This machine owns only the Clerk-side lifecycle: SUBMIT
// carries the token the gateway produced, and the actor persists it via `addPaymentMethod`.
export const organizationBillingPaymentMethodsAddMachine = createMachine({
  id: 'paymentMethodsAdd',
  initial: 'idle',
  context: {
    addPaymentMethod: async () => {},
    gateway: '',
    paymentToken: '',
    error: null,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'open',
          actions: assign(() => ({ gateway: '', paymentToken: '', error: null })),
        },
      },
    },
    open: {
      on: {
        SUBMIT: {
          target: 'submitting',
          actions: assign((_, event) => ({ gateway: event.gateway, paymentToken: event.paymentToken, error: null })),
        },
        CANCEL: {
          target: 'idle',
          actions: assign(() => ({ error: null })),
        },
      },
    },
    submitting: {
      invoke: fromPromise(ctx => ctx.addPaymentMethod({ gateway: ctx.gateway, paymentToken: ctx.paymentToken }), {
        onDone: {
          target: 'idle',
          actions: assign(() => ({ gateway: '', paymentToken: '', error: null })),
        },
        onError: {
          target: 'open',
          actions: assign((_, event) => ({
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
