import type {
  AttemptFirstFactorParams,
  PrepareFirstFactorParams,
  SignInFirstFactor,
  SignInResource,
  SignInStatus,
} from '@clerk/shared/types';

import { setup } from '../machine/setup';

export interface FirstFactorContext {
  factor: SignInFirstFactor;
  value: string;
  error: string | null;
  canResend: boolean;
  completionStatus: SignInStatus | null;
  // Injected deps
  attemptFn: (params: AttemptFirstFactorParams) => Promise<SignInResource>;
  prepareFn: (params: PrepareFirstFactorParams) => Promise<SignInResource>;
}

export type FirstFactorEvent =
  | { type: 'TYPE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'SHOW_ALTERNATIVES' }
  | { type: 'SHOW_FORGOT_PASSWORD' }
  | { type: 'SELECT_STRATEGY'; factor: SignInFirstFactor }
  | { type: 'RESEND' }
  | { type: 'BACK' };

const { createMachine, assign, fromPromise } = setup<FirstFactorContext, FirstFactorEvent>();

// Strategies that require a prepare call before showing the code input.
// password, passkey, and social/enterprise strategies are excluded.
const PREPARE_STRATEGIES = new Set([
  'email_code',
  'phone_code',
  'email_link',
  'reset_password_email_code',
  'reset_password_phone_code',
]);

const needsPrepare = (factor: SignInFirstFactor): boolean => PREPARE_STRATEGIES.has(factor.strategy);

// Build the strategy-specific attempt params from the current factor and entered value.
function buildAttemptParams(factor: SignInFirstFactor, value: string): AttemptFirstFactorParams {
  if (factor.strategy === 'password') {
    return { strategy: 'password', password: value };
  }
  // SAFETY: buildAttemptParams is only called from `submitting`, which is only reachable
  // via `verifying`. The machine's routing guarantees factor.strategy is 'password' or a
  // code-based strategy at this call site. TypeScript cannot narrow through state-entry invariants.
  return { strategy: factor.strategy, code: value } as AttemptFirstFactorParams;
}

/**
 * Models the UI modes within the first-factor verification screen.
 *
 * The initial state is derived from the factor: code-based strategies (email_code,
 * phone_code, reset_password_*) start in `preparing` to trigger a prepareFirstFactor
 * call before showing the input. Password goes straight to `verifying`.
 *
 * Replaces scattered boolean flags (`showAllStrategies`, `showForgotPasswordStrategies`,
 * `passwordErrorCode`, `card.isLoading`) with named states. Impossible combinations
 * — like submitting while the alternatives overlay is open — become unrepresentable.
 *
 * On completion, `context.completionStatus` carries the signIn.status so the
 * parent machine can route to secondFactor, resetPassword, or complete:
 *
 *   const [snapshot, send] = useMachine(firstFactorMachine, {
 *     context: { factor, attemptFn: signIn.attemptFirstFactor, prepareFn: signIn.prepareFirstFactor },
 *     onDone: () => parentSend({ type: 'FACTOR_COMPLETE', nextStatus: snapshot.context.completionStatus }),
 *   });
 */
export function createFirstFactorMachine(deps: {
  factor: SignInFirstFactor;
  attemptFn: (params: AttemptFirstFactorParams) => Promise<SignInResource>;
  prepareFn: (params: PrepareFirstFactorParams) => Promise<SignInResource>;
}) {
  return createMachine({
    id: 'firstFactor',
    // Code-based strategies must prepare before showing the input.
    initial: ctx => (needsPrepare(ctx.factor) ? 'preparing' : 'verifying'),
    context: {
      factor: deps.factor,
      value: '',
      error: null,
      canResend: true,
      completionStatus: null,
      attemptFn: deps.attemptFn,
      prepareFn: deps.prepareFn,
    },
    states: {
      // Calls prepareFirstFactor on entry (delivers the code via email/SMS).
      // SAFETY: `preparing` is only entered when needsPrepare(ctx.factor) is true (see
      // the initial resolver and routingStrategy always-transitions). TypeScript cannot
      // narrow ctx.factor through state-entry invariants, so the cast is required.
      preparing: {
        invoke: fromPromise(ctx => ctx.prepareFn(ctx.factor as PrepareFirstFactorParams), {
          onDone: 'verifying',
          onError: {
            target: 'verifying',
            actions: assign((_, e) => ({ error: String(e.error) })),
          },
        }),
      },

      verifying: {
        on: {
          TYPE: {
            actions: assign((_, e) => ({ value: e.value, error: null })),
          },
          SUBMIT: 'submitting',
          SHOW_ALTERNATIVES: 'showingAlternatives',
          SHOW_FORGOT_PASSWORD: 'showingForgotPassword',
          RESEND: 'resending',
        },
      },

      submitting: {
        invoke: fromPromise(ctx => ctx.attemptFn(buildAttemptParams(ctx.factor, ctx.value)), {
          onDone: {
            target: 'complete',
            // SAFETY: e.output is a SignInResource whose .status is always a valid SignInStatus
            // string; TypeScript types output as the broad resolved return type and does not
            // narrow .status to the SignInStatus literal union automatically.
            actions: assign((_, e) => ({ completionStatus: e.output.status as SignInStatus })),
          },
          onError: {
            target: 'verifying',
            actions: assign((_, e) => ({ error: String(e.error) })),
          },
        }),
      },

      // After selecting a strategy, route to preparing (for code) or verifying (for password).
      routingStrategy: {
        always: [{ target: 'preparing', guard: ctx => needsPrepare(ctx.factor) }, { target: 'verifying' }],
      },

      showingAlternatives: {
        on: {
          SELECT_STRATEGY: {
            target: 'routingStrategy',
            actions: assign((_, e) => ({ factor: e.factor, value: '', error: null })),
          },
          BACK: 'verifying',
        },
      },

      showingForgotPassword: {
        on: {
          SELECT_STRATEGY: {
            target: 'routingStrategy',
            actions: assign((_, e) => ({ factor: e.factor, value: '', error: null })),
          },
          BACK: 'verifying',
        },
      },

      // Re-delivers the code by calling prepareFirstFactor again, then starts the cooldown.
      resending: {
        // SAFETY: same invariant as `preparing` — `resending` is only reachable when
        // the current factor requires a prepare call (needsPrepare is true).
        invoke: fromPromise(ctx => ctx.prepareFn(ctx.factor as PrepareFirstFactorParams), {
          onDone: {
            target: 'cooldown',
            actions: assign(() => ({ canResend: false, value: '' })),
          },
          onError: {
            target: 'verifying',
            actions: assign((_, e) => ({ error: String(e.error) })),
          },
        }),
      },

      // Timer lives in the machine — no useEffect + setTimeout in the component.
      cooldown: {
        after: {
          30_000: {
            target: 'verifying',
            actions: assign(() => ({ canResend: true })),
          },
        },
      },

      complete: { type: 'final' },
    },
  });
}
