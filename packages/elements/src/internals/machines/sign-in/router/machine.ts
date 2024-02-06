import type { SignInStatus } from '@clerk/types';
import type { NonReducibleUnknown } from 'xstate';
import { and, assign, log, not, or, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors/error';

import type { SignInRouterContext, SignInRouterSchema } from './types';

export type TSignInRouterMachine = typeof SignInRouterMachine;

const isCurrentPath =
  (path: `/${string}`) =>
  ({ context }: { context: SignInRouterContext }, _params?: NonReducibleUnknown) =>
    context.router?.match(path) ?? true;

const needsStatus =
  (status: SignInStatus) =>
  ({ context }: { context: SignInRouterContext }, _params?: NonReducibleUnknown) =>
    context.clerk.client.signIn.status === status;

export const SignInRouterMachineId = 'SignInRouter';

export const SignInRouterMachine = setup({
  actions: {
    logUnknownError: snapshot => console.error('Unknown error:', snapshot),
    navigateInternal: ({ context }, { path }: { path: string }) => {
      if (!context.router) return;
      const resolvedPath = [context.router?.basePath, path].join('/').replace(/\/\/g/, '/');
      if (resolvedPath === context.router.pathname()) return;
      context.router.replace(resolvedPath);
    },
    navigateExternal: ({ context }, { path }: { path: string }) => context.router?.push(path),
    setActive({ context }) {
      const beforeEmit = () => context.router?.push(context.clerk.buildAfterSignInUrl());
      void context.clerk.setActive({ session: context.clerk.client.signIn.createdSessionId, beforeEmit });
    },
    setError: assign({
      error: (_, { error }: { error?: ClerkElementsError }) => {
        if (error) return error;
        return new ClerkElementsRuntimeError('Unknown error');
      },
    }),
    resetError: assign({ error: undefined }),
    transfer: ({ context }) => context.router?.push(context.clerk.buildSignUpUrl()),
  },
  guards: {
    hasResource: ({ context }) => Boolean(context.clerk.client.signIn.status),

    isLoggedInAndSingleSession: and(['isLoggedIn', 'isSingleSessionMode']),
    isActivePathRoot: isCurrentPath('/'),
    isComplete: ({ context }) => {
      console.debug(context.clerk.client.signIn);
      return context.clerk.client.signIn.status === 'complete' && Boolean(context.clerk.client.signIn.createdSessionId);
    },
    isLoggedIn: ({ context }) => Boolean(context.clerk.user),
    isSingleSessionMode: ({ context }) => Boolean(context.clerk.__unstable__environment?.authConfig.singleSessionMode),

    needsStart: or([not('hasResource'), 'statusNeedsIdentifier', isCurrentPath('/')]),
    needsFirstFactor: and(['statusNeedsFirstFactor', isCurrentPath('/continue')]),
    needsSecondFactor: and(['statusNeedsSecondFactor', isCurrentPath('/continue')]),
    needsCallback: isCurrentPath('/sso-callback'),
    needsNewPassword: and(['statusNeedsNewPassword', isCurrentPath('/new-password')]),

    statusNeedsIdentifier: needsStatus('needs_identifier'),
    statusNeedsFirstFactor: needsStatus('needs_first_factor'),
    statusNeedsSecondFactor: needsStatus('needs_second_factor'),
    statusNeedsNewPassword: needsStatus('needs_new_password'),
  },
  types: {} as SignInRouterSchema,
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCWUB2BJDAlA9gK4AuYATgMQAKuAogGoDaADALqKgAO+sqxq+DBxAAPRABYATABoQAT0QBGZgFYAdAGZxGgOyKAbIp0b9+yQA4dAXyuy0mHARLk1OPhRbskIbr36DhMQRJFXFNAE5mcT1JRXDwkw1ZBQRjHTVDSQ0VSWZ9cXDzcXEbO3RsPCJSMlcMd0ZFLy4ePgEhbyCQ8IiomLiE-Q0k+URJHW6dPMlB0x1o0OtbEHsKp2ra+skmnxb-dtBOlW6NSOjFWPjE4ZTzc3VmZg1mePCVVUVFc1Ll8scqlzcxA8Gm2vlaAQ6oyOPTOFwGQ2SSluGR0byMGmmxge4W+Kz+zhqgI84lBuzagShx1OfUug2uiBUinU4X0zE+RjmIXOuN+lQJGyBjBUpL85MhwWhJ16536V0RCCOkjUtw+4XEbPMTw0PIcfPWyGIAEMyECAHK0AAaABVPMIwXsKakVPo1OJzs7VCcjPpwvLQmENEYinETFEvks8XqXAbjWbLTbGnayRCDohwnNlSonjpjCpUWNfSMEGZzGpJOJBsVUfNTDrVv8ajGTRRzdbGFsk6KU6I0xm7tnc-nxn6MWo9AVzPojplJDiI7y1i4AGKoMiwYhLw0AY2I+EorZtbE74P2PYQikDYRyBlUlnOOkn8vMqjL6pOlgfoU1dfx6xXa43bdd33eMGhFE9HSZUcWViSRpnMGDXifcwlVRJ5iiiJl9BzH8o0bMAt0ECBNx3PcW1Ao9vHtMVU3PSwlUGZQ3jGCsin0eVxGhFRGQQsxCjmRRilwxd8MIjBiKAsiDzA48HXFT5UTUBJlCGSJ9AQrR5SGdIjDyNjn20HJhIbNQAGFDQAGwsgAjbcAGsKCtXAAEFTWQJdaFwW0qOTU8gmvMcHwvXQUJzAwONyMdYludSQvEcwDGM-laDIMgpIo8C5NoqdSxMPNmCyEwukUeUHzCBJjA0O5wkEz4Sm+DB8AgOBhEjETZJos8AFp2KLHq1AeQahqG7IVCS9ZAQ67sggvZgMgKmqqqePM3RUJ9wiVAqTiyNVbjg8Myl1ES1CbYgpr8xAULmj07liIZuNReV8jCIoNsGtV1MS+cjpM-91xI4Dzsg7J0keEItGqtidHlSJ1DC1EfV0dk50O+t+WQAiiIBvcgfk04BueVRHg+KQSqLD0Bs1EJijzXQxu+tH1nMqzbK3OzcdorNFAyTjtqGZ8OT9WIyxyIo8k5Kr6tR38XBStKyA5s9QnUXIzCyO5nm43qUk-MtA2mWKQaicblz3KB8GIKhDVgWAAHc9wgRWgikJ8hjULNHleSITFZFGfh+-kAAlUHXJ3KRhGl4XpBAEoGir4m4h5DCOGwbCAA */
  id: SignInRouterMachineId,
  context: ({ input }) => ({
    activeRouteRef: null,
    clerk: input.clerk,
    router: input.router,
    signUpPath: input.signUpPath || SIGN_UP_DEFAULT_BASE_PATH,
  }),
  initial: 'Init',
  on: {
    PREV: '.Hist',
  },
  states: {
    Init: {
      always: [
        {
          guard: 'isLoggedInAndSingleSession',
          actions: [
            log('Already logged in'),
            {
              type: 'setError',
              params: {
                error: new ClerkElementsError('logged-in-single-session-mode', 'You are already logged in.'),
              },
            },
            { type: 'navigateExternal', params: { path: '/' } },
          ],
          target: 'Error',
        },
        {
          guard: 'needsStart',
          actions: { type: 'navigateInternal', params: { path: '/' } },
          target: 'Start',
        },
        {
          guard: 'needsFirstFactor',
          actions: { type: 'navigateInternal', params: { path: '/continue' } },
          target: 'FirstFactor',
        },
        {
          guard: 'needsSecondFactor',
          actions: { type: 'navigateInternal', params: { path: '/continue' } },
          target: 'SecondFactor',
        },
        {
          guard: 'needsCallback',
          target: 'Callback',
        },
        {
          actions: [
            log('Unknown state'),
            log(({ context }) => context.clerk.client.signIn),
            {
              type: 'setError',
              params: {
                error: new ClerkElementsRuntimeError('Unknown state'),
              },
            },
          ],
          target: 'Start',
        },
      ],
    },
    Start: {
      tags: 'route:start',
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsFirstFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'FirstFactor',
          },
          {
            guard: 'statusNeedsSecondFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
          },
        ],
      },
    },
    FirstFactor: {
      tags: 'route:first-factor',
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            guard: 'statusNeedsSecondFactor',
            actions: { type: 'navigateInternal', params: { path: '/continue' } },
            target: 'SecondFactor',
          },
        ],
      },
    },
    SecondFactor: {
      tags: 'route:second-factor',
      on: {
        NEXT: [
          {
            guard: 'isComplete',
            actions: 'setActive',
          },
          {
            actions: ['logUnknownError', { type: 'navigateInternal', params: { path: '/' } }],
          },
        ],
      },
    },
    Callback: {
      tags: 'route:callback',
      on: {
        TRANSFER: {
          actions: 'transfer',
        },
      },
    },
    Error: {
      tags: 'route:error',
      on: {
        NEXT: {
          target: 'Start',
        },
      },
    },
    ForgotPassword: {
      tags: 'route:forgot-password',
    },
    Hist: {
      type: 'history',
      exit: 'resetError',
    },
  },
});
