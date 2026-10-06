import type { ResetPasswordParams, SignInResource, SignInStatus } from '@clerk/shared/types';

import { setup } from '../machine/setup';

export interface SignInContext {
  identifier: string;
  pendingPassword: string;
  pendingSignOutOfOtherSessions: boolean;
  pendingStatus: string;
  error: string | null;
  // Injected deps — passed via useMachine options.context so they're always current.
  createAttemptFn: (identifier: string) => Promise<SignInResource>;
  resetPasswordFn: (params: ResetPasswordParams) => Promise<SignInResource>;
}

export type SignInEvent =
  | { type: 'TYPE_IDENTIFIER'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'FACTOR_COMPLETE'; nextStatus: SignInStatus }
  | { type: 'FORGOT_PASSWORD' }
  | { type: 'SUBMIT_NEW_PASSWORD'; password: string; signOutOfOtherSessions: boolean }
  | { type: 'BACK' };

const { createMachine, assign, fromPromise } = setup<SignInContext, SignInEvent>();

/**
 * Models the top-level Clerk sign-in routing as an explicit state machine.
 *
 * Each named state corresponds to a distinct screen or async step. The entire
 * flow — identifier entry, first/second factor, password reset — is visible in
 * one object with no hidden boolean flags.
 *
 * Component usage:
 *   const [snapshot, send] = useMachine(machine, {
 *     context: { createAttemptFn: id => signIn.create({ identifier: id }), resetPasswordFn: signIn.resetPassword },
 *     onDone: () => setActive({ session: signIn.createdSessionId }).then(() => router.navigate(afterSignInUrl)),
 *   });
 *
 * Child factor components signal completion by calling:
 *   send({ type: 'FACTOR_COMPLETE', nextStatus: signIn.status })
 */
export function createSignInMachine(deps: Pick<SignInContext, 'createAttemptFn' | 'resetPasswordFn'>) {
  return createMachine({
    id: 'signIn',
    initial: 'collectingIdentifier',
    context: {
      identifier: '',
      pendingPassword: '',
      pendingSignOutOfOtherSessions: false,
      pendingStatus: '',
      error: null,
      createAttemptFn: deps.createAttemptFn,
      resetPasswordFn: deps.resetPasswordFn,
    },
    states: {
      collectingIdentifier: {
        on: {
          TYPE_IDENTIFIER: {
            actions: assign((_, e) => ({ identifier: e.value, error: null })),
          },
          SUBMIT: 'submittingIdentifier',
        },
      },

      submittingIdentifier: {
        invoke: fromPromise(ctx => ctx.createAttemptFn(ctx.identifier), {
          onDone: {
            target: 'routingIdentifier',
            actions: assign((_, e) => ({ pendingStatus: e.output.status })),
          },
          onError: {
            target: 'collectingIdentifier',
            actions: assign((_, e) => ({ error: String(e.error) })),
          },
        }),
      },

      // Transient state — `always` transitions fire synchronously so callers see the resolved state.
      routingIdentifier: {
        always: [
          { target: 'firstFactor', guard: ctx => ctx.pendingStatus === 'needs_first_factor' },
          { target: 'secondFactor', guard: ctx => ctx.pendingStatus === 'needs_second_factor' },
          { target: 'clientTrust', guard: ctx => ctx.pendingStatus === 'needs_client_trust' },
          { target: 'resetPassword', guard: ctx => ctx.pendingStatus === 'needs_new_password' },
          { target: 'complete' },
        ],
      },

      // Child factor component owns its own machine. When it reaches `complete`,
      // it calls onDone which sends FACTOR_COMPLETE with the resulting signIn.status.
      firstFactor: {
        on: {
          FACTOR_COMPLETE: [
            { target: 'secondFactor', guard: (_, e) => e.nextStatus === 'needs_second_factor' },
            { target: 'clientTrust', guard: (_, e) => e.nextStatus === 'needs_client_trust' },
            { target: 'resetPassword', guard: (_, e) => e.nextStatus === 'needs_new_password' },
            { target: 'complete' },
          ],
          FORGOT_PASSWORD: 'resetPassword',
          BACK: 'collectingIdentifier',
        },
      },

      secondFactor: {
        on: {
          FACTOR_COMPLETE: 'complete',
          BACK: 'firstFactor',
        },
      },

      clientTrust: {
        on: {
          FACTOR_COMPLETE: 'complete',
          BACK: 'firstFactor',
        },
      },

      // Shown when the user clicks "Forgot password" from firstFactor, or when
      // signIn.status is 'needs_new_password' after a reset code is verified.
      resetPassword: {
        on: {
          SUBMIT_NEW_PASSWORD: {
            target: 'submittingResetPassword',
            actions: assign((_, e) => ({
              pendingPassword: e.password,
              pendingSignOutOfOtherSessions: e.signOutOfOtherSessions,
              error: null,
            })),
          },
          BACK: 'firstFactor',
        },
      },

      submittingResetPassword: {
        invoke: fromPromise(
          ctx =>
            ctx.resetPasswordFn({
              password: ctx.pendingPassword,
              signOutOfOtherSessions: ctx.pendingSignOutOfOtherSessions,
            }),
          {
            onDone: {
              target: 'routingReset',
              actions: assign((_, e) => ({ pendingStatus: e.output.status })),
            },
            onError: {
              target: 'resetPassword',
              actions: assign((_, e) => ({ error: String(e.error) })),
            },
          },
        ),
      },

      routingReset: {
        always: [
          { target: 'secondFactor', guard: ctx => ctx.pendingStatus === 'needs_second_factor' },
          { target: 'resetPasswordSuccess' },
        ],
      },

      resetPasswordSuccess: {
        // Brief confirmation screen; the component calls onDone to fire navigation.
        type: 'final',
      },

      complete: {
        type: 'final',
      },
    },
  });
}
